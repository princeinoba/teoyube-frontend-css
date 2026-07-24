"use strict";

const fs = require("node:fs");
const {
  absolute,
  currentIdentity,
  readJson,
  writeJson
} = require("./release-utils.cjs");

const policy = readJson("config/release-gate-policy.json");
const summaryPath = ".tmp/release-evidence/coverage/coverage-summary.json";
if (!fs.existsSync(absolute(summaryPath))) {
  console.error("COVERAGE EVIDENCE: BLOCKED (coverage summary missing)");
  process.exit(1);
}
const summary = readJson(summaryPath);
const total = summary.total;
const criticalResults = policy.criticalContracts.map((contract) => {
  const source = fs.readFileSync(absolute(contract.file), "utf8").toLowerCase();
  const missing = contract.patterns.filter((pattern) => !source.includes(pattern.toLowerCase()));
  return { id: contract.id, file: contract.file, passed: missing.length === 0, missing };
});
const faultSources = policy.faultInjectionPatterns.map((pattern) => ({
  pattern,
  covered: fs.readFileSync(absolute("artifacts/release/security-gate.json"), "utf8")
    .toLowerCase()
    .includes(pattern.toLowerCase())
}));
const passed =
  total.statements.pct >= policy.coverage.ordinaryStatementsPercent &&
  total.branches.pct >= policy.coverage.ordinaryBranchesPercent &&
  criticalResults.every((result) => result.passed);
writeJson("artifacts/release-evidence/test-results/coverage-summary.json", {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  identity: currentIdentity(),
  policyVersion: policy.policyVersion,
  ordinary: {
    statements: total.statements,
    branches: total.branches,
    functions: total.functions,
    lines: total.lines,
    thresholds: {
      statements: policy.coverage.ordinaryStatementsPercent,
      branches: policy.coverage.ordinaryBranchesPercent
    }
  },
  criticalContracts: {
    required: criticalResults.length,
    passed: criticalResults.filter((result) => result.passed).length,
    thresholdPercent: policy.coverage.criticalContractPercent,
    results: criticalResults
  },
  faultInjection: faultSources,
  exclusions: [
    "protected visual source",
    "generated WEB corpus",
    "third-party archive",
    "barrel-only index modules"
  ],
  result: passed ? "PASS" : "BLOCKED"
});
console.log(`COVERAGE EVIDENCE: ${passed ? "PASS" : "BLOCKED"} (statements ${total.statements.pct}%; branches ${total.branches.pct}%; critical ${criticalResults.filter((item) => item.passed).length}/${criticalResults.length})`);
if (!passed) process.exitCode = 1;
