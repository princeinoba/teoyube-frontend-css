import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const localRequire = createRequire(import.meta.url);
const lifecycle = localRequire("../../scripts/release/preview-bypass-lifecycle.cjs");
const fakeCredential = "synthetic-only-do-not-use";
const projectWith = (credential = fakeCredential) => ({ protectionBypass: { [credential]: { scope: "automation-bypass", createdAt: 0 } } });

function fixtureAdapter(options: { retrievalFailure?: boolean; verificationFailure?: boolean; revocationFailures?: number } = {}) {
  let active = 0;
  let revokeCalls = 0;
  let cleanupReads = 0;
  return {
    adapter: {
      async activeCount() { return active; },
      async create() { active = 1; },
      async readCredential() { if (options.retrievalFailure) throw new Error("synthetic retrieval failure"); return fakeCredential; },
      async readCredentialForCleanup() { cleanupReads += 1; return fakeCredential; },
      async revoke(credential: string) { expect(credential).toBe(fakeCredential); revokeCalls += 1; if (revokeCalls <= (options.revocationFailures || 0)) throw new Error("synthetic revocation failure"); active = 0; },
    },
    verify: async () => { if (options.verificationFailure) throw new Error("synthetic HTTP verification failure"); return { ok: true }; },
    counts: () => ({ active, revokeCalls, cleanupReads }),
  };
}

describe("Preview bypass project API parser", () => {
  it("extracts exactly one sanitized fixture credential", () => {
    expect(lifecycle.extractSingleAutomationBypass(projectWith())).toBe(fakeCredential);
    expect(lifecycle.activeAutomationBypassCount(projectWith())).toBe(1);
    expect(lifecycle.activeAutomationBypassCount({ protectionBypass: {} })).toBe(0);
  });
  it.each([["missing credential field", {}], ["empty credential", projectWith("")], ["unexpected response shape", { protectionBypass: [] }]])("fails closed for %s", (_name, fixture) => {
    expect(() => lifecycle.extractSingleAutomationBypass(fixture)).toThrow();
  });
  it("uses stdin bodies and the authenticated project API read path", async () => {
    type ApiCall = { endpoint: string; method?: string; body?: { generate?: object; revoke?: object } };
    const calls: ApiCall[] = [];
    let active = false;
    const adapter = lifecycle.createVercelBypassAdapter({ projectId: "prj_synthetic", scope: "team_synthetic", api(input: ApiCall) { calls.push(input); if (input.endpoint.includes("protection-bypass")) { if (input.body?.generate) active = true; if (input.body?.revoke) active = false; return {}; } return active ? projectWith() : { protectionBypass: {} }; } });
    await adapter.create();
    expect(await adapter.readCredential()).toBe(fakeCredential);
    await adapter.revoke(fakeCredential);
    expect(await adapter.activeCount()).toBe(0);
    expect(calls.some((call) => call.endpoint === "/v9/projects/prj_synthetic")).toBe(true);
  });
  it("never places a credential in Vercel command arguments and bounds the child process", () => {
    let observedArgs: string[] = [];
    let observedInput = "";
    let observedTimeout = 0;
    lifecycle.runVercelApi({ endpoint: "/v1/projects/prj_synthetic/protection-bypass", method: "PATCH", body: { revoke: { secret: fakeCredential, regenerate: false } }, scope: "team_synthetic", platform: "win32", spawn(_executable: string, args: string[], options: { input?: string; timeout?: number }) { observedArgs = args; observedInput = options.input || ""; observedTimeout = options.timeout || 0; return { status: 0, stdout: "{}" }; } });
    expect(observedArgs.join(" ")).not.toContain(fakeCredential);
    expect(observedInput).toContain(fakeCredential);
    expect(observedTimeout).toBe(10_000);
  });
  it("fails closed when the authenticated Vercel child process times out", () => {
    expect(() => lifecycle.runVercelApi({ endpoint: "/v9/projects/prj_synthetic", scope: "team_synthetic", platform: "win32", spawn() { return { status: null, stdout: "", error: { code: "ETIMEDOUT" } }; } })).toThrow("timed out");
  });
});

describe("Preview bypass fail-closed lifecycle", () => {
  it("revokes after successful verification", async () => { const fixture = fixtureAdapter(); const result = await lifecycle.runSecretLifecycle(fixture.adapter, fixture.verify); expect(result.cleanup.activeCount).toBe(0); expect(fixture.counts()).toEqual({ active: 0, revokeCalls: 1, cleanupReads: 0 }); });
  it("revokes when creation succeeds but credential retrieval fails", async () => { const fixture = fixtureAdapter({ retrievalFailure: true }); await expect(lifecycle.runSecretLifecycle(fixture.adapter, fixture.verify)).rejects.toThrow("synthetic retrieval failure"); expect(fixture.counts()).toEqual({ active: 0, revokeCalls: 1, cleanupReads: 1 }); });
  it("revokes after an HTTP verification failure", async () => { const fixture = fixtureAdapter({ verificationFailure: true }); await expect(lifecycle.runSecretLifecycle(fixture.adapter, fixture.verify)).rejects.toThrow("synthetic HTTP verification failure"); expect(fixture.counts()).toEqual({ active: 0, revokeCalls: 1, cleanupReads: 0 }); });
  it("retries revocation only for the same credential", async () => { const fixture = fixtureAdapter({ revocationFailures: 1 }); const result = await lifecycle.runSecretLifecycle(fixture.adapter, fixture.verify); expect(result.cleanup).toEqual({ attempts: 2, activeCount: 0 }); expect(fixture.counts()).toEqual({ active: 0, revokeCalls: 2, cleanupReads: 0 }); });
  it("redacts credentials from nested summaries", () => { const safe = JSON.stringify(lifecycle.redactSecrets({ message: `token=${fakeCredential}`, nested: [fakeCredential] }, [fakeCredential])); expect(safe).not.toContain(fakeCredential); expect(safe).toContain("[REDACTED]"); });
});
