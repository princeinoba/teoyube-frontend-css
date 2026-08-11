"use strict";

const assert = require("node:assert/strict");
const { activeAutomationBypassCount, createVercelBypassAdapter, extractSingleAutomationBypass, redactSecrets, runSecretLifecycle } = require("./preview-bypass-lifecycle.cjs");

const fakeCredential = "synthetic-preflight-credential";
const projectWith = (credential = fakeCredential) => ({ protectionBypass: { [credential]: { scope: "automation-bypass" } } });

async function main() {
  assert.equal(extractSingleAutomationBypass(projectWith()), fakeCredential);
  assert.throws(() => extractSingleAutomationBypass({}));
  assert.throws(() => extractSingleAutomationBypass(projectWith("")));
  assert.throws(() => extractSingleAutomationBypass({ protectionBypass: [] }));
  let apiActive = false;
  const apiCalls = [];
  const apiAdapter = createVercelBypassAdapter({
    projectId: "prj_synthetic",
    scope: "team_synthetic",
    api(input) {
      apiCalls.push(input);
      if (input.endpoint.includes("protection-bypass")) {
        if (input.body.generate) apiActive = true;
        if (input.body.revoke) apiActive = false;
        return {};
      }
      return apiActive ? projectWith() : { protectionBypass: {} };
    },
  });
  await apiAdapter.create();
  assert.equal(await apiAdapter.readCredential(), fakeCredential);
  await apiAdapter.revoke(fakeCredential);
  assert.equal(await apiAdapter.activeCount(), 0);
  assert.ok(apiCalls.some((call) => call.endpoint === "/v9/projects/prj_synthetic"));
  let active = 0;
  let revokeCalls = 0;
  let cleanupReads = 0;
  const lifecycleAdapter = {
    async activeCount() { return active; },
    async create() { active = 1; },
    async readCredential() { throw new Error("synthetic retrieval failure"); },
    async readCredentialForCleanup() { cleanupReads += 1; return fakeCredential; },
    async revoke(credential) { assert.equal(credential, fakeCredential); revokeCalls += 1; active = 0; },
  };
  await assert.rejects(() => runSecretLifecycle(lifecycleAdapter, async () => ({ ok: true })));
  assert.equal(active, 0);
  assert.equal(revokeCalls, 1);
  assert.equal(cleanupReads, 1);
  const serialized = JSON.stringify(redactSecrets({ credential: fakeCredential }, [fakeCredential]));
  assert.ok(!serialized.includes(fakeCredential));
  assert.equal(activeAutomationBypassCount({ protectionBypass: {} }), 0);
  process.stdout.write(["PARSER: PASS", "CREATE/READ ADAPTER: PASS", "FINALLY REVOCATION: PASS", "SECRET REDACTION: PASS", "ACTIVE-CREDENTIAL PRECHECK: ZERO"].join("\n") + "\n");
}

main().catch(() => { process.stderr.write("PREVIEW BYPASS PREFLIGHT: FAIL\n"); process.exitCode = 1; });
