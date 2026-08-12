"use strict";

const { spawnSync } = require("node:child_process");

const AUTOMATION_SCOPE = "automation-bypass";
const REDACTED = "[REDACTED]";
const VERCEL_API_TIMEOUT_MS = 10_000;

function emitStage(onStage, stage) {
  if (typeof onStage === "function") onStage(stage);
}

function automationBypassEntries(project) {
  if (!project || typeof project !== "object" || Array.isArray(project)) {
    throw new Error("Unexpected Vercel project response shape.");
  }
  const bypasses = project.protectionBypass;
  if (bypasses === undefined || bypasses === null) return [];
  if (typeof bypasses !== "object" || Array.isArray(bypasses)) {
    throw new Error("Unexpected Vercel protection-bypass response shape.");
  }
  return Object.entries(bypasses).filter(([, metadata]) =>
    metadata && typeof metadata === "object" && metadata.scope === AUTOMATION_SCOPE
  );
}

function extractSingleAutomationBypass(project) {
  const entries = automationBypassEntries(project);
  if (entries.length !== 1) {
    throw new Error("Expected exactly one active automation bypass.");
  }
  const credential = entries[0][0];
  if (typeof credential !== "string" || credential.trim().length === 0) {
    throw new Error("The automation bypass credential is empty.");
  }
  return credential;
}

function activeAutomationBypassCount(project) {
  return automationBypassEntries(project).length;
}

function redactSecrets(value, secrets = []) {
  const secretSet = new Set(secrets.filter((item) => typeof item === "string" && item.length > 0));
  const visit = (item) => {
    if (typeof item === "string") {
      let safe = item;
      for (const secret of secretSet) safe = safe.split(secret).join(REDACTED);
      return safe;
    }
    if (Array.isArray(item)) return item.map(visit);
    if (item && typeof item === "object") {
      return Object.fromEntries(Object.entries(item).map(([key, entry]) => [key, visit(entry)]));
    }
    return item;
  };
  return visit(value);
}

async function revokeWithRetries(adapter, knownCredential, maximumAttempts = 3, onStage) {
  let credential = knownCredential;
  let lastError;
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      emitStage(onStage, "BYPASS_REVOKE_PRECHECK_STARTED");
      if (await adapter.activeCount() === 0) {
        emitStage(onStage, "BYPASS_REVOKE_PRECHECK_COMPLETED");
        return { attempts: attempt - 1, activeCount: 0 };
      }
      emitStage(onStage, "BYPASS_REVOKE_PRECHECK_COMPLETED");
      emitStage(onStage, "BYPASS_CLEANUP_CREDENTIAL_READ_STARTED");
      if (!credential) credential = await adapter.readCredentialForCleanup();
      emitStage(onStage, "BYPASS_CLEANUP_CREDENTIAL_READ_COMPLETED");
      emitStage(onStage, "BYPASS_REVOKE_STARTED");
      await adapter.revoke(credential);
      emitStage(onStage, "BYPASS_REVOKE_COMPLETED");
      emitStage(onStage, "BYPASS_ZERO_CONFIRMATION_STARTED");
      const remaining = await adapter.activeCount();
      if (remaining !== 0) throw new Error("Automation bypass remained active after revocation.");
      emitStage(onStage, "BYPASS_ZERO_CONFIRMATION_COMPLETED");
      return { attempts: attempt, activeCount: 0 };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error("Temporary bypass revocation failed after bounded retries.", { cause: lastError });
}

async function runSecretLifecycle(adapter, verify, options = {}) {
  const { onStage } = options;
  emitStage(onStage, "BYPASS_PRECHECK_STARTED");
  if (await adapter.activeCount() !== 0) {
    throw new Error("Active automation-bypass precheck was not zero.");
  }
  emitStage(onStage, "BYPASS_PRECHECK_COMPLETED");
  let creationAttempted = false;
  let credential;
  let verification;
  let verificationError;
  let cleanup = { attempts: 0, activeCount: 0 };
  try {
    creationAttempted = true;
    emitStage(onStage, "BYPASS_CREATE_STARTED");
    await adapter.create();
    emitStage(onStage, "BYPASS_CREATE_COMPLETED");
    emitStage(onStage, "BYPASS_CREDENTIAL_READ_STARTED");
    credential = await adapter.readCredential();
    emitStage(onStage, "BYPASS_CREDENTIAL_READ_COMPLETED");
    if (typeof credential !== "string" || credential.trim().length === 0) {
      throw new Error("The created bypass credential could not be verified in memory.");
    }
    emitStage(onStage, "EVALUATION_STARTED");
    verification = await verify(credential);
    emitStage(onStage, "EVALUATION_COMPLETED");
  } catch (error) {
    verificationError = error;
  } finally {
    if (creationAttempted) {
      cleanup = await revokeWithRetries(adapter, credential, 3, onStage);
    }
  }
  if (verificationError) throw verificationError;
  return { verification, cleanup };
}

function interruptionError(kind, value) {
  const suffix = value instanceof Error && /^[A-Z0-9_ -]+$/i.test(value.message)
    ? ": " + value.message
    : "";
  return new Error(kind + suffix);
}

function addListener(target, event, listener) {
  if (!target || typeof target.on !== "function") return () => {};
  target.on(event, listener);
  return () => {
    if (typeof target.off === "function") target.off(event, listener);
    else if (typeof target.removeListener === "function") target.removeListener(event, listener);
  };
}

async function raceWithAbort(operation, signal) {
  if (signal.aborted) throw signal.reason || new Error("EVALUATION_ABORTED");
  let removeAbort = () => {};
  const aborted = new Promise((_, reject) => {
    const listener = () => reject(signal.reason || new Error("EVALUATION_ABORTED"));
    signal.addEventListener("abort", listener, { once: true });
    removeAbort = () => signal.removeEventListener("abort", listener);
  });
  try {
    return await Promise.race([Promise.resolve().then(operation), aborted]);
  } finally {
    removeAbort();
  }
}

async function runControlledSecretLifecycle(adapter, verify, options = {}) {
  const {
    deadlineMs = 900_000,
    eventTarget = process,
    onStage,
    timers = { setTimeout, clearTimeout },
  } = options;
  if (!Number.isFinite(deadlineMs) || deadlineMs <= 0 || deadlineMs > 900_000) {
    throw new Error("The evaluation deadline must be within 900 seconds.");
  }
  const controller = new AbortController();
  let interruption;
  const interrupt = (kind, value) => {
    if (interruption) return;
    interruption = interruptionError(kind, value);
    emitStage(onStage, kind);
    controller.abort(interruption);
  };
  const removers = [
    addListener(eventTarget, "SIGINT", (value) => interrupt("SIGINT", value)),
    addListener(eventTarget, "SIGTERM", (value) => interrupt("SIGTERM", value)),
    addListener(eventTarget, "uncaughtException", (value) => interrupt("UNCAUGHT_EXCEPTION", value)),
    addListener(eventTarget, "unhandledRejection", (value) => interrupt("UNHANDLED_REJECTION", value)),
  ];
  const deadline = timers.setTimeout(
    () => interrupt("RUNNER_DEADLINE_EXCEEDED"),
    deadlineMs,
  );
  if (deadline && typeof deadline.unref === "function") deadline.unref();
  try {
    const result = await runSecretLifecycle(
      adapter,
      (credential) => raceWithAbort(
        () => verify(credential, controller.signal),
        controller.signal,
      ),
      { onStage },
    );
    if (interruption) throw interruption;
    return result;
  } finally {
    timers.clearTimeout(deadline);
    for (const remove of removers) remove();
  }
}

function runVercelApi({ endpoint, method = "GET", body, scope, spawn = spawnSync, platform = process.platform, timeoutMs = VERCEL_API_TIMEOUT_MS }) {
  const vercelArgs = ["api", endpoint, "--scope", scope, "--raw"];
  if (method !== "GET") vercelArgs.push("--method", method);
  if (body !== undefined) vercelArgs.push("--input", "-");
  const executable = platform === "win32" ? (process.env.ComSpec || "cmd.exe") : "vercel";
  const args = platform === "win32" ? ["/d", "/s", "/c", "vercel.cmd", ...vercelArgs] : vercelArgs;
  const result = spawn(executable, args, {
    encoding: "utf8",
    input: body === undefined ? undefined : JSON.stringify(body),
    maxBuffer: 4 * 1024 * 1024,
    shell: false,
    timeout: timeoutMs,
    killSignal: "SIGTERM",
    windowsHide: true,
  });
  if (result.error && result.error.code === "ETIMEDOUT") {
    throw new Error("Authenticated Vercel API operation timed out.");
  }
  if (result.status !== 0) throw new Error("Authenticated Vercel API operation failed.");
  try {
    return result.stdout.trim() ? JSON.parse(result.stdout) : {};
  } catch {
    throw new Error("Authenticated Vercel API returned invalid JSON.");
  }
}

function createVercelBypassAdapter({ projectId, scope, api = runVercelApi }) {
  const projectEndpoint = "/v9/projects/" + encodeURIComponent(projectId);
  const bypassEndpoint = "/v1/projects/" + encodeURIComponent(projectId) + "/protection-bypass";
  const readProject = () => api({ endpoint: projectEndpoint, scope });
  return Object.freeze({
    async activeCount() { return activeAutomationBypassCount(readProject()); },
    async create() { api({ endpoint: bypassEndpoint, method: "PATCH", body: { generate: {} }, scope }); },
    async readCredential() { return extractSingleAutomationBypass(readProject()); },
    async readCredentialForCleanup() { return extractSingleAutomationBypass(readProject()); },
    async revoke(credential) {
      api({ endpoint: bypassEndpoint, method: "PATCH", body: { revoke: { secret: credential, regenerate: false } }, scope });
    },
  });
}

module.exports = {
  REDACTED,
  VERCEL_API_TIMEOUT_MS,
  activeAutomationBypassCount,
  automationBypassEntries,
  createVercelBypassAdapter,
  extractSingleAutomationBypass,
  redactSecrets,
  revokeWithRetries,
  runControlledSecretLifecycle,
  runSecretLifecycle,
  runVercelApi,
};
