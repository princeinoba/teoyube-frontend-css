"use strict";

const { spawnSync } = require("node:child_process");

const AUTOMATION_SCOPE = "automation-bypass";
const REDACTED = "[REDACTED]";

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

async function revokeWithRetries(adapter, knownCredential, maximumAttempts = 3) {
  let credential = knownCredential;
  let lastError;
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      if (await adapter.activeCount() === 0) {
        return { attempts: attempt - 1, activeCount: 0 };
      }
      if (!credential) credential = await adapter.readCredentialForCleanup();
      await adapter.revoke(credential);
      const remaining = await adapter.activeCount();
      if (remaining !== 0) throw new Error("Automation bypass remained active after revocation.");
      return { attempts: attempt, activeCount: 0 };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error("Temporary bypass revocation failed after bounded retries.", { cause: lastError });
}

async function runSecretLifecycle(adapter, verify) {
  if (await adapter.activeCount() !== 0) {
    throw new Error("Active automation-bypass precheck was not zero.");
  }
  let creationAttempted = false;
  let credential;
  let verification;
  let verificationError;
  try {
    creationAttempted = true;
    await adapter.create();
    credential = await adapter.readCredential();
    if (typeof credential !== "string" || credential.trim().length === 0) {
      throw new Error("The created bypass credential could not be verified in memory.");
    }
    verification = await verify(credential);
  } catch (error) {
    verificationError = error;
  } finally {
    if (creationAttempted) {
      const cleanup = await revokeWithRetries(adapter, credential);
      if (verificationError) throw verificationError;
      return { verification, cleanup };
    }
  }
  if (verificationError) throw verificationError;
  return { verification, cleanup: { attempts: 0, activeCount: 0 } };
}

function runVercelApi({ endpoint, method = "GET", body, scope, spawn = spawnSync, platform = process.platform }) {
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
    windowsHide: true,
  });
  if (result.status !== 0) throw new Error("Authenticated Vercel API operation failed.");
  try {
    return result.stdout.trim() ? JSON.parse(result.stdout) : {};
  } catch {
    throw new Error("Authenticated Vercel API returned invalid JSON.");
  }
}

function createVercelBypassAdapter({ projectId, scope, api = runVercelApi }) {
  const projectEndpoint = `/v9/projects/${encodeURIComponent(projectId)}`;
  const bypassEndpoint = `/v1/projects/${encodeURIComponent(projectId)}/protection-bypass`;
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
  activeAutomationBypassCount,
  automationBypassEntries,
  createVercelBypassAdapter,
  extractSingleAutomationBypass,
  redactSecrets,
  revokeWithRetries,
  runSecretLifecycle,
  runVercelApi,
};
