"use strict";

const fs = require("node:fs");
const {
  absolute,
  currentIdentity,
  readJson,
  writeJson
} = require("./release-utils.cjs");

const requiredDocuments = [
  "docs/architecture/observability.md",
  "docs/architecture/release-evidence.md",
  "docs/security/release-security-gate.md",
  "docs/security/software-supply-chain.md",
  "docs/security/security-headers.md",
  "docs/operations/service-level-objectives.md",
  "docs/operations/error-budgets.md",
  "docs/operations/incident-response.md",
  "docs/operations/runbooks/index.md",
  "docs/performance/budgets.md",
  "docs/privacy/telemetry-contract.md",
  "docs/product/product-value-metrics.md",
  "docs/product/user-research-pilot.md",
  "docs/accessibility/accessibility-debt.md",
  "docs/testing/test-pyramid.md",
  "docs/testing/ci-gates.md",
  "docs/recovery/prompt-21-migration-ledger.md"
];
const incidents = [
  "Production rollback",
  "Live-AI kill switch",
  "Vector retrieval kill switch",
  "Key compromise",
  "Unauthorized memory access",
  "Cross-user incident",
  "Fabricated citation",
  "Unsafe spiritual guidance",
  "Stale crisis resource",
  "Provider outage",
  "Cost spike",
  "Rate-limit exhaustion",
  "Index corruption",
  "Corpus checksum failure",
  "Migration failure",
  "Data deletion failure",
  "Visual regression",
  "Performance regression",
  "Observability outage"
];
const missingDocuments = requiredDocuments.filter((file) => !fs.existsSync(absolute(file)));
const runbooks = missingDocuments.includes("docs/operations/runbooks/index.md")
  ? ""
  : fs.readFileSync(absolute("docs/operations/runbooks/index.md"), "utf8");
const normalizedRunbooks = runbooks.replace(/\s+/g, " ");
const missingIncidents = incidents.filter((incident) => !runbooks.includes(`| ${incident} |`));
const requiredRunbookTerms = [
  "Trigger",
  "Immediate action",
  "User impact and safe fallback",
  "Evidence and communication",
  "Recovery and verification",
  "Post-incident review"
];
const missingRunbookFields = requiredRunbookTerms.filter((term) => !runbooks.includes(term));
const research = missingDocuments.includes("docs/product/user-research-pilot.md")
  ? ""
  : fs.readFileSync(absolute("docs/product/user-research-pilot.md"), "utf8");
const policy = readJson("config/release-gate-policy.json");
const packageJson = readJson("package.json");
const env = fs.readFileSync(absolute(".env.example"), "utf8");
const invariants = {
  staticCanonical:
    packageJson.scripts.start === policy.runtime.canonicalStart &&
    packageJson.scripts["prototype:start"] === policy.runtime.canonicalStart,
  nextPreviewOnly: policy.runtime.nextStatus === "preview_only",
  liveAiDisabled: /^TEOYUBE_LIVE_AI_ENABLED=false$/m.test(env),
  vectorRetrievalDisabled: /^TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false$/m.test(env),
  productionGateClosed: policy.runtime.gateBProduction === "closed",
  userResearchNotFabricated: research.includes("USER_RESEARCH_NOT_YET_RUN"),
  ownerOnCallNotFabricated: normalizedRunbooks.includes(
    "no staffed on-call team is claimed"
  )
};
const passed =
  missingDocuments.length === 0 &&
  missingIncidents.length === 0 &&
  missingRunbookFields.length === 0 &&
  Object.values(invariants).every(Boolean);

writeJson("artifacts/release-evidence/operations/operational-readiness.json", {
  schemaVersion: 1,
  gateVersion: "teoyube-operational-readiness-2026-07-24.1",
  generatedAt: new Date().toISOString(),
  identity: currentIdentity(),
  requiredDocuments,
  missingDocuments,
  requiredIncidents: incidents,
  missingIncidents,
  missingRunbookFields,
  invariants,
  productionExporter: "NOT_CONFIGURED",
  productionOnCall: "NOT_ASSIGNED",
  productionTrafficEvidence: "NONE_CLAIMED",
  gateCProduction: "CLOSED",
  result: passed ? "PASS" : "BLOCKED"
});
console.log(
  `OPERATIONAL READINESS GATE: ${passed ? "PASS" : "BLOCKED"} ` +
  `(${requiredDocuments.length} docs; ${incidents.length} runbooks)`
);
if (!passed) process.exitCode = 1;
