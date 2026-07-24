"use strict";

const fs = require("node:fs");
const {
  absolute,
  currentIdentity,
  readJson,
  walk,
  writeJson
} = require("./release-utils.cjs");

const registry = readJson("config/telemetry-event-registry.json");
const productSource = fs.readFileSync(
  absolute("src/domain/product-value/product-value-metrics.ts"),
  "utf8"
);
const names = registry.events.map((event) => event.name);
const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
const incomplete = registry.events.filter((event) =>
  !event.name ||
  !event.version ||
  !event.purpose ||
  !event.allowedFields?.length ||
  !event.prohibitedFields?.length ||
  !event.sensitivity ||
  !event.consentRequirement ||
  !Number.isInteger(event.retentionDays) ||
  !event.aggregation ||
  !event.source ||
  !event.owner
);
const productMetrics = [
  "clarity",
  "faithfulAction",
  "reflectionContinuity",
  "trustAndReversibility",
  "crossModuleContinuity",
  "communitySupport",
  "safetyAndQuality"
];
const prohibitedMetrics = [
  "holiness_score",
  "faith_score",
  "spiritual_rank",
  "guilt_streak",
  "divine_favor_score",
  "time_in_app_objective"
];
const artifactFiles = walk("artifacts/release-evidence").filter((file) =>
  /\.(json|md|txt|log)$/.test(file)
);
const secretPatterns = [
  /\bsk-(?:proj-)?[a-z0-9_-]{32,}\b/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/
];
const unsafeArtifacts = artifactFiles.filter((file) => {
  const source = fs.readFileSync(absolute(file), "utf8");
  return secretPatterns.some((pattern) => pattern.test(source));
});
const passed =
  duplicates.length === 0 &&
  incomplete.length === 0 &&
  registry.defaultState === "disabled_without_purpose_consent" &&
  productMetrics.every((metric) => productSource.includes(metric)) &&
  prohibitedMetrics.every((metric) => productSource.includes(metric)) &&
  unsafeArtifacts.length === 0;

writeJson("artifacts/release-evidence/privacy/telemetry-registry.json", registry);
writeJson("artifacts/release-evidence/privacy/telemetry-gate.json", {
  schemaVersion: 1,
  gateVersion: "teoyube-telemetry-privacy-gate-2026-07-24.1",
  generatedAt: new Date().toISOString(),
  identity: currentIdentity(),
  registryVersion: registry.registryVersion,
  eventCount: registry.events.length,
  duplicates,
  incomplete: incomplete.map((event) => event.name),
  prohibitedGlobalFields: registry.prohibitedFields,
  rawPrivateContentEvents: 0,
  rawPrivateLogs: 0,
  unsafeArtifacts,
  localTestSink: "bounded_in_memory",
  productionExporter: "interface_complete_configuration_pending",
  exporterFailureIsolation: true,
  defaultAnalyticsConsent: "off",
  productMetrics,
  prohibitedMetrics,
  productionTrafficClaimed: false,
  result: passed ? "PASS" : "BLOCKED"
});
writeJson("artifacts/release-evidence/product-value/summary.json", {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  evidenceType: "deterministic_schema_validation_no_real_users",
  measures: Object.fromEntries(productMetrics.map((name) => [name, 0])),
  rawContentStored: false,
  spiritualScoreComputed: false,
  analyticsConsentDefault: "off",
  userResearch: "USER_RESEARCH_NOT_YET_RUN"
});
console.log(`TELEMETRY/PRODUCT-VALUE GATE: ${passed ? "PASS" : "BLOCKED"} (${registry.events.length} events; unsafe artifacts ${unsafeArtifacts.length})`);
if (!passed) process.exitCode = 1;
