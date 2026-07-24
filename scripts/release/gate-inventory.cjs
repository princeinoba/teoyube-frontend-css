"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  absolute,
  gitFileAt,
  gitFilesAt,
  readJson,
  writeJson,
  writeText
} = require("./release-utils.cjs");

const policy = readJson("config/release-gate-policy.json");
const baseline = policy.startingCommit;
const baselineFiles = gitFilesAt(baseline);
const packageJson = JSON.parse(gitFileAt(baseline, "package.json"));

function domainFor(value) {
  const normalized = value.toLowerCase();
  for (const domain of [
    "visual",
    "scripture",
    "tig",
    "safety",
    "retrieval",
    "memory",
    "live-ai",
    "teo-guide",
    "media",
    "architecture",
    "security",
    "privacy",
    "performance",
    "build"
  ]) {
    if (normalized.includes(domain)) return domain;
  }
  return "platform";
}

function executableClassification(name, filePath) {
  const value = `${name} ${filePath}`.toLowerCase();
  if (/phase\d|teoyubeworld|media:|seed:|bundle:beta|check:static|check:runtime/.test(value)) {
    return "EXECUTABLE_LEGACY";
  }
  return "EXECUTABLE_CURRENT";
}

function reportClassification(filePath) {
  const value = filePath.toLowerCase();
  if (value.includes("docs/owner-approvals/")) return "OWNER_APPROVAL";
  if (/quota-blocked|diagnostic|failed|blocker|prompt-17p/.test(value)) return "GENERATED_STALE";
  if (value.includes("docs/recovery/") || value.includes("docs/testing/")) return "GENERATED_CURRENT";
  return "SIMULATED_OR_DOCUMENT_ONLY";
}

function entry(input) {
  return Object.freeze({
    name: input.name,
    filePath: input.filePath,
    purpose: input.purpose,
    domain: input.domain,
    command: input.command,
    inputDependencies: input.inputDependencies,
    externalCredentialsRequired: input.externalCredentialsRequired,
    costBearing: input.costBearing,
    deterministic: input.deterministic,
    executionContext: input.executionContext,
    currentStatus: input.currentStatus,
    artifactPath: input.artifactPath,
    ownerApprovalDependency: input.ownerApprovalDependency,
    overlap: input.overlap,
    kind: input.kind,
    classification: input.classification
  });
}

const entries = [];
for (const [name] of Object.entries(packageJson.scripts || {})) {
  const classification = executableClassification(name, "package.json");
  entries.push(entry({
    name: `npm:${name}`,
    filePath: "package.json",
    purpose: `Registered package command: ${name}.`,
    domain: domainFor(name),
    command: `npm run ${name}`,
    inputDependencies: ["package.json", "package-lock.json"],
    externalCredentialsRequired: /provider|index:public|evaluate/.test(name),
    costBearing: /provider|index:public|retrieval:evaluate/.test(name),
    deterministic: !/provider|index:public|retrieval:evaluate/.test(name),
    executionContext: /capture|update|authorize|execute/.test(name) ? "manual" : "local_ci",
    currentStatus: classification === "EXECUTABLE_CURRENT" ? "registered_current" : "retained_legacy",
    artifactPath: null,
    ownerApprovalDependency: /capture|update|authorize|publish|derive:execute/.test(name),
    overlap: classification === "EXECUTABLE_LEGACY" ? "canonical_release_gate_supersedes_readiness_claim_only" : "canonical_release_gate_composes",
    kind: "build_tooling",
    classification
  }));
}

for (const filePath of baselineFiles.filter((file) => /^scripts\/.*\.(cjs|js|ts|py)$/.test(file))) {
  const classification = executableClassification(path.basename(filePath), filePath);
  entries.push(entry({
    name: `script:${filePath}`,
    filePath,
    purpose: `Executable ${domainFor(filePath)} script retained at the authorized starting commit.`,
    domain: domainFor(filePath),
    command: filePath.endsWith(".py") ? `python ${filePath}` : filePath.endsWith(".ts") ? `tsx ${filePath}` : `node ${filePath}`,
    inputDependencies: [filePath],
    externalCredentialsRequired: /provider-evaluation|retrieval-evaluation|index/i.test(filePath),
    costBearing: /provider-evaluation|retrieval-evaluation|index-public/i.test(filePath),
    deterministic: !/provider-evaluation|retrieval-evaluation|index-public/i.test(filePath),
    executionContext: /materialize|capture|authorize|publish|derive/i.test(filePath) ? "manual" : "local_ci",
    currentStatus: classification === "EXECUTABLE_CURRENT" ? "available" : "retained_legacy",
    artifactPath: null,
    ownerApprovalDependency: /materialize|capture|authorize|publish|derive/i.test(filePath),
    overlap: classification === "EXECUTABLE_LEGACY" ? "not_canonical_for_release_evidence" : "composed_by_release_gate",
    kind: "build_tooling",
    classification
  }));
}

for (const filePath of baselineFiles.filter((file) => /^tests\/.*\.(test|spec)\.(ts|tsx|js)$/.test(file))) {
  entries.push(entry({
    name: `test:${filePath}`,
    filePath,
    purpose: `Executable ${domainFor(filePath)} test suite.`,
    domain: domainFor(filePath),
    command: filePath.includes("/visual/") || filePath.includes("/e2e") ? "Playwright suite command from package.json" : `vitest run ${filePath}`,
    inputDependencies: [filePath],
    externalCredentialsRequired: filePath.includes("provider-evaluation"),
    costBearing: filePath.includes("provider-evaluation"),
    deterministic: !filePath.includes("provider-evaluation"),
    executionContext: filePath.includes("provider-evaluation") ? "manual_protected" : "local_ci",
    currentStatus: "available",
    artifactPath: null,
    ownerApprovalDependency: false,
    overlap: "canonical_test_pyramid_member",
    kind: "test",
    classification: "EXECUTABLE_CURRENT"
  }));
}

for (const filePath of baselineFiles.filter((file) => /^\.github\/workflows\/.*\.ya?ml$/.test(file))) {
  entries.push(entry({
    name: `workflow:${path.basename(filePath)}`,
    filePath,
    purpose: "Repository CI workflow at the authorized starting commit.",
    domain: "platform",
    command: "GitHub Actions",
    inputDependencies: [filePath, "package.json", "package-lock.json"],
    externalCredentialsRequired: false,
    costBearing: false,
    deterministic: true,
    executionContext: "ci",
    currentStatus: "requires_prompt21_toolchain_update",
    artifactPath: null,
    ownerApprovalDependency: false,
    overlap: "consolidate_under_release_evidence_workflow",
    kind: "build_tooling",
    classification: "EXECUTABLE_CURRENT"
  }));
}

const reportPattern = /(report|readiness|gate|evidence|scorecard|audit|approval)/i;
for (const filePath of baselineFiles.filter((file) =>
  /^docs\/.*\.(md|json)$/.test(file) && reportPattern.test(path.basename(file))
)) {
  const classification = reportClassification(filePath);
  entries.push(entry({
    name: `document:${filePath}`,
    filePath,
    purpose: "Retained readiness, gate, approval, audit, or evidence document.",
    domain: domainFor(filePath),
    command: null,
    inputDependencies: [filePath],
    externalCredentialsRequired: false,
    costBearing: false,
    deterministic: false,
    executionContext: "documentation",
    currentStatus: classification === "SIMULATED_OR_DOCUMENT_ONLY" ? "not_executable_evidence" : "retained_evidence",
    artifactPath: filePath,
    ownerApprovalDependency: classification === "OWNER_APPROVAL",
    overlap: "documentation_never_substitutes_for_current_execution",
    kind: classification === "OWNER_APPROVAL" ? "documentation" : "generated",
    classification
  }));
}

const generatedAtEntry = [
  [".tmp/safety/results/orchestration.json", "safety", "Gate A orchestration output"],
  [".tmp/visual-parity/resumable-gate/controller.json", "performance", "Resumable 216-cell controller"],
  [".tmp/live-ai/results/provider-evaluation.json", "live-ai", "Prompt 19K synthetic provider evaluation"],
  [".var/retrieval/public-index-manifest.json", "retrieval", "Prompt 20 public-index manifest"],
  [".var/retrieval/retrieval.sqlite", "retrieval", "Ignored local preview vector index"]
];
for (const [filePath, domain, purpose] of generatedAtEntry) {
  entries.push(entry({
    name: `generated:${filePath}`,
    filePath,
    purpose,
    domain,
    command: null,
    inputDependencies: [filePath],
    externalCredentialsRequired: domain === "live-ai",
    costBearing: domain === "live-ai",
    deterministic: domain !== "live-ai",
    executionContext: "generated_local",
    currentStatus: fs.existsSync(absolute(filePath)) ? "present_at_inventory" : "absent_at_inventory",
    artifactPath: filePath,
    ownerApprovalDependency: false,
    overlap: "hash_bound_reuse_only",
    kind: "generated",
    classification: "GENERATED_CURRENT"
  }));
}

entries.sort((left, right) =>
  `${left.classification}:${left.name}`.localeCompare(`${right.classification}:${right.name}`)
);

const classifications = {};
for (const item of entries) classifications[item.classification] = (classifications[item.classification] || 0) + 1;
const inventory = Object.freeze({
  schemaVersion: 1,
  inventoryVersion: "teoyube-existing-gate-inventory-2026-07-24.1",
  sourceCommit: baseline,
  scope: "Executable gates, workflows, tests, readiness/evidence reports, approvals, and principal generated artifacts present before Prompt 21 tooling.",
  classifications,
  unknownCount: entries.filter((item) => item.classification === "UNKNOWN").length,
  canonicalConcerns: {
    repositoryAndToolchain: "release:toolchain:verify",
    visualProtection: "recovery:verify",
    testPyramid: "release:test:pyramid",
    security: "release:security:gate",
    supplyChain: "release:supply-chain:verify",
    observabilityAndProductValue: "release:telemetry:verify",
    performanceAndAccessibility: "release:performance:verify",
    previewReleaseEvidence: "release:gate:preview"
  },
  entries
});

if (inventory.unknownCount !== 0) throw new Error("Existing gate inventory contains UNKNOWN classifications.");
writeJson("docs/recovery/prompt-21-existing-gate-inventory.json", inventory);

const table = entries.map((item) =>
  `| ${item.classification} | ${item.kind} | ${item.name.replace(/\|/g, "\\|")} | ${item.domain} | ${item.currentStatus} |`
);
writeText("docs/recovery/prompt-21-existing-gate-inventory.md", [
  "# Prompt 21 existing gate inventory",
  "",
  `Source commit: \`${baseline}\``,
  "",
  "This inventory is anchored to the authorized Prompt 21 starting commit. It does not treat historical readiness prose as executable evidence and it deletes nothing.",
  "",
  `Entries: ${entries.length}. UNKNOWN: ${inventory.unknownCount}.`,
  "",
  "## Classification summary",
  "",
  ...Object.entries(classifications).sort().map(([name, count]) => `- ${name}: ${count}`),
  "",
  "## Canonical concerns",
  "",
  ...Object.entries(inventory.canonicalConcerns).map(([concern, command]) => `- ${concern}: \`${command}\``),
  "",
  "## Inventory",
  "",
  "| Classification | Kind | Name | Domain | Current status |",
  "|---|---|---|---|---|",
  ...table,
  ""
].join("\n"));

console.log(`PROMPT 21 EXISTING GATE INVENTORY: PASSED (${entries.length} entries; UNKNOWN 0)`);
