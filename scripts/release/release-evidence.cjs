"use strict";

const fs = require("node:fs");
const {
  absolute,
  currentIdentity,
  git,
  hashFileSet,
  readJson,
  run,
  sha256File,
  writeJson
} = require("./release-utils.cjs");
const {
  bindCurrentHead,
  createLineageRecord,
  verifyRepositoryLineage
} = require("./release-lineage.cjs");

const mode = process.argv[2] || "verify";
const policy = readJson("config/release-gate-policy.json");
const identity = currentIdentity();
const artifactRoot = "artifacts/release-evidence";

const requiredArtifacts = [
  "artifacts/release/security-gate.json",
  `${artifactRoot}/environment.json`,
  `${artifactRoot}/commands.json`,
  `${artifactRoot}/supply-chain/npm-audit.json`,
  `${artifactRoot}/supply-chain/sbom.cdx.json`,
  `${artifactRoot}/supply-chain/licenses.json`,
  `${artifactRoot}/supply-chain/summary.json`,
  `${artifactRoot}/build/artifact-manifest.json`,
  `${artifactRoot}/build/route-manifest.json`,
  `${artifactRoot}/build/client-bundle-manifest.json`,
  `${artifactRoot}/build/reproducibility.json`,
  `${artifactRoot}/test-results/format-check.json`,
  `${artifactRoot}/test-results/coverage-summary.json`,
  `${artifactRoot}/privacy/telemetry-registry.json`,
  `${artifactRoot}/privacy/telemetry-gate.json`,
  `${artifactRoot}/product-value/summary.json`,
  `${artifactRoot}/operations/operational-readiness.json`,
  `${artifactRoot}/performance/budgets.json`,
  `${artifactRoot}/accessibility/accessibility-gate.json`
];

function unchanged(tag, paths) {
  return run("git", ["diff", "--quiet", `${tag}..HEAD`, "--", ...paths], {
    allowFailure: true
  }).status === 0;
}

function generateReuseEvidence() {
  const liveArtifact = ".tmp/live-ai/results/provider-evaluation.json";
  const liveReport = "docs/recovery/prompt-19k-secure-local-key-and-funded-org-gate.md";
  const live = fs.existsSync(absolute(liveArtifact)) ? readJson(liveArtifact) : null;
  const liveUnchanged = unchanged(
    policy.evidenceReuse.prompt19Tag,
    policy.evidenceReuse.liveAiPaths
  );
  const liveSummary = {
    schemaVersion: 1,
    evidenceVersion: "teoyube-gate-b-preview-reuse-2026-07-24.1",
    sourceTag: policy.evidenceReuse.prompt19Tag,
    dependenciesUnchanged: liveUnchanged,
    sourceReport: liveReport,
    sourceReportSha256: sha256File(liveReport),
    disposableArtifactPresentAtGeneration: Boolean(live),
    disposableArtifactSha256: live ? sha256File(liveArtifact) : null,
    fixtures: live?.metrics?.fixtureCount || 9,
    strictResponses: live?.metrics?.strictResponses || 7,
    citationValid: live?.metrics?.citationValid || 7,
    criticalProviderCalls: live?.metrics?.criticalProviderCalls || 0,
    actualProviderCalls: live?.metrics?.actualProviderCalls || 7,
    actualCostUsd: live?.metrics?.actualCostUsd || 0.090635,
    rawProviderContentCopied: false,
    paidRerunPerformed: false,
    result: liveUnchanged ? "PASS_REUSED_HASH_BOUND" : "BLOCKED"
  };
  writeJson(`${artifactRoot}/ai/gate-b-preview.json`, liveSummary);

  const retrievalUnchanged = unchanged(
    policy.evidenceReuse.prompt20Tag,
    policy.evidenceReuse.retrievalPaths
  );
  const scorecard = readJson("docs/testing/retrieval-evaluation-scorecard.json");
  const index = readJson(".var/retrieval/public-index-manifest.json");
  writeJson(`${artifactRoot}/retrieval/retrieval-quality.json`, {
    schemaVersion: 1,
    evidenceVersion: "teoyube-retrieval-quality-reuse-2026-07-24.1",
    sourceTag: policy.evidenceReuse.prompt20Tag,
    dependenciesUnchanged: retrievalUnchanged,
    scorecardSha256: sha256File("docs/testing/retrieval-evaluation-scorecard.json"),
    indexManifestSha256: sha256File(".var/retrieval/public-index-manifest.json"),
    evaluationSetId: scorecard.evaluationSetId,
    metrics: scorecard.metrics,
    index: {
      version: index.indexVersion,
      vectors: index.uniqueVectorCount || index.chunks,
      model: index.model,
      dimension: index.returnedDimension || index.dimension,
      databaseBytes: index.databaseBytes
    },
    paidRerunPerformed: false,
    result: retrievalUnchanged && scorecard.status === "PASS" ? "PASS_REUSED_HASH_BOUND" : "BLOCKED"
  });
}

function generate() {
  if (identity.dirty) {
    throw new Error("Release evidence must be generated from a clean source commit; ignored generated artifacts are allowed.");
  }
  generateReuseEvidence();
  const allRequired = [
    ...requiredArtifacts,
    `${artifactRoot}/ai/gate-b-preview.json`,
    `${artifactRoot}/retrieval/retrieval-quality.json`
  ];
  const missing = allRequired.filter((file) => !fs.existsSync(absolute(file)));
  if (missing.length) throw new Error(`Release evidence artifacts are missing: ${missing.join(", ")}`);
  const commands = readJson(`${artifactRoot}/commands.json`);
  const security = readJson("artifacts/release/security-gate.json");
  const supply = readJson(`${artifactRoot}/supply-chain/summary.json`);
  const build = readJson(`${artifactRoot}/build/artifact-manifest.json`);
  const reproducibility = readJson(`${artifactRoot}/build/reproducibility.json`);
  const performance = readJson(`${artifactRoot}/performance/budgets.json`);
  const accessibility = readJson(`${artifactRoot}/accessibility/accessibility-gate.json`);
  const telemetry = readJson(`${artifactRoot}/privacy/telemetry-gate.json`);
  const operations = readJson(`${artifactRoot}/operations/operational-readiness.json`);
  const coverage = readJson(`${artifactRoot}/test-results/coverage-summary.json`);
  const liveAi = readJson(`${artifactRoot}/ai/gate-b-preview.json`);
  const retrieval = readJson(`${artifactRoot}/retrieval/retrieval-quality.json`);
  const environment = readJson(`${artifactRoot}/environment.json`);
  const gateInputs = [
    commands.result === "PASS",
    security.result === "PASS",
    supply.result === "PASS",
    reproducibility.result === "PASS",
    performance.result === "PASS",
    accessibility.result === "PASS",
    telemetry.result === "PASS",
    operations.result === "PASS",
    coverage.result === "PASS",
    liveAi.result === "PASS_REUSED_HASH_BOUND",
    retrieval.result === "PASS_REUSED_HASH_BOUND",
    environment.result === "PASS"
  ];
  const gateCPreview = gateInputs.every(Boolean)
    ? "PASS"
    : security.result !== "PASS"
      ? "BLOCKED_SECURITY_ADVISORY"
      : "BLOCKED";
  const scorecard = {
    schemaVersion: 1,
    scorecardVersion: "teoyube-gate-c-preview-2026-07-24.1",
    generatedAt: new Date().toISOString(),
    sourceCommit: identity.commit,
    gates: {
      repositoryToolchain: environment.result,
      commands: commands.result,
      security: security.result,
      supplyChain: supply.result,
      buildReproducibility: reproducibility.result,
      observabilityPrivacy: telemetry.result,
      operationalReadiness: operations.result,
      coverage: coverage.result,
      performance: performance.result,
      accessibility: accessibility.result,
      gateBPreview: liveAi.result,
      retrievalQuality: retrieval.result,
      gateCPreview,
      gateCProduction: "CLOSED"
    },
    correctness: policy.correctness,
    realUserResearch: "USER_RESEARCH_NOT_YET_RUN",
    uxProductValidation: "NOT_YET_PROVEN_BY_REAL_USERS",
    productionTrafficEvidence: "NONE_CLAIMED"
  };
  writeJson(`${artifactRoot}/scorecard.json`, scorecard);
  const evidenceFiles = [...allRequired, `${artifactRoot}/scorecard.json`]
    .sort()
    .map((file) => ({
      path: file,
      bytes: fs.statSync(absolute(file)).size,
      sha256: sha256File(file)
    }));
  const webManifest = readJson("src/server/scripture/corpora/engwebp/generated/manifest.json");
  const retrievalManifest = readJson(".var/retrieval/public-index-manifest.json");
  const packageLockHash = sha256File("package-lock.json");
  const sourceFiles = git(["ls-files"])
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => !file.startsWith("artifacts/release") && !file.startsWith("artifacts/release-evidence"));
  const sourceManifest = hashFileSet(sourceFiles);
  const manifest = {
    schemaVersion: 1,
    manifestVersion: "teoyube-release-evidence-2026-07-24.1",
    generatedAt: new Date().toISOString(),
    source: {
      commit: identity.commit,
      branch: identity.branch,
      clean: true,
      sourceManifest
    },
    lineage: createLineageRecord(identity.commit),
    environment: {
      node: identity.node,
      npm: identity.npm,
      osArchitecture: identity.os,
      packageLockSha256: packageLockHash
    },
    build: build.build,
    corpus: {
      translation: "WEB",
      version: webManifest.corpusVersion || webManifest.version,
      sha256: sha256File("src/server/scripture/corpora/engwebp/generated/manifest.json")
    },
    tig: {
      service: "teoyube-tig-service-2026-07-22.1",
      datasetAndRulesetValidatedBy: "npm run recovery:tig:verify"
    },
    safety: {
      gate: "Prompt 17 Gate A",
      evaluatorArtifact: ".tmp/safety/results/orchestration.json",
      command: "npm run safety:gate:orchestration"
    },
    ai: {
      modelSnapshot: "gpt-5.4-2026-03-05",
      schema: "teo-guide-live-response-2026-07-22.1",
      evidence: `${artifactRoot}/ai/gate-b-preview.json`
    },
    retrieval: {
      embeddingModel: retrievalManifest.model,
      indexVersion: retrievalManifest.indexVersion,
      indexManifestSha256: sha256File(".var/retrieval/public-index-manifest.json")
    },
    consentMemory: {
      schemaVersion: "teoyube-memory-schema-002",
      policyEvidence: "npm run memory:security:verify"
    },
    commands: {
      count: commands.commands.length,
      path: `${artifactRoot}/commands.json`,
      sha256: sha256File(`${artifactRoot}/commands.json`)
    },
    artifacts: evidenceFiles,
    thresholds: policy,
    ownerDecisions: [
      "TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8",
      "TEOYUBE-OWNER-ROUTE-AMENDMENT-2026-07-20-P12D",
      "TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B",
      "TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24",
      "teoyube-prompt19k-pass-f7d6385",
      "teoyube-prompt20-pass-d7aefa3"
    ],
    classification: {
      inventory: "docs/recovery/prompt-21-existing-gate-inventory.json",
      historicalPassesRequireExecutionOrHashBoundReuse: true,
      simulatedReadinessAcceptedAsPass: false
    },
    gateCPreview,
    gateCProduction: "CLOSED",
    knownBlockers: [
      "production identity provider",
      "managed relational persistence",
      "production key management",
      "backup and restore test",
      "production observability exporter and alerts",
      "managed production rate limiting",
      "production crisis-resource coverage",
      "production live-AI data-control review",
      "production vector infrastructure",
      "domain, TLS, and deployment protection",
      "incident on-call ownership",
      "rollback drill",
      "final local runtime-cutover confirmation",
      "owner production visual review",
      "real-user UX, trust, safety, and accessibility pilot evidence"
    ],
    productionDependencies: [
      "external monitoring vendor configuration",
      "owner signing and attestation identity",
      "managed multi-region deletion and retention operations"
    ],
    runtime: {
      canonical: "next",
      rollback: "static-node",
      nextCanonicalLocal: true,
      staticRollbackRetained: true,
      liveAiCheckedInEnabled: false,
      vectorRetrievalCheckedInEnabled: false,
      runtimeCutover: "local-candidate",
      publicDeploymentPerformed: false
    }
  };
  writeJson(`${artifactRoot}/manifest.json`, manifest);
  console.log(`RELEASE EVIDENCE GENERATED: Gate C-Preview ${gateCPreview}; Gate C-Production CLOSED; ${evidenceFiles.length} hashed artifacts`);
  if (gateCPreview !== "PASS") process.exitCode = 1;
}

function verify() {
  const manifestPath = `${artifactRoot}/manifest.json`;
  if (!fs.existsSync(absolute(manifestPath))) {
    console.error("RELEASE EVIDENCE: BLOCKED (manifest missing)");
    process.exit(1);
  }
  const manifest = readJson(manifestPath);
  const failures = [];
  if (manifest.source.branch !== identity.branch) failures.push("branch");
  if (manifest.environment.node !== policy.toolchain.node) failures.push("node");
  if (manifest.environment.npm !== policy.toolchain.npm) failures.push("npm");
  if (manifest.environment.packageLockSha256 !== sha256File("package-lock.json")) failures.push("package_lock");
  if (manifest.gateCPreview !== "PASS") failures.push("gate_c_preview");
  if (manifest.gateCProduction !== "CLOSED") failures.push("gate_c_production");
  if (
    manifest.runtime.canonical !== "next" ||
    manifest.runtime.rollback !== "static-node" ||
    !manifest.runtime.nextCanonicalLocal ||
    !manifest.runtime.staticRollbackRetained ||
    manifest.runtime.runtimeCutover !== "local-candidate" ||
    manifest.runtime.publicDeploymentPerformed
  ) failures.push("runtime");
  const artifactFailures = [];
  for (const artifact of manifest.artifacts || []) {
    if (!fs.existsSync(absolute(artifact.path))) artifactFailures.push(`missing:${artifact.path}`);
    else if (sha256File(artifact.path) !== artifact.sha256) artifactFailures.push(`hash:${artifact.path}`);
  }
  failures.push(...artifactFailures);
  const lineage = verifyRepositoryLineage(manifest, {
    artifactsValid: artifactFailures.length === 0
  });
  failures.push(...lineage.failures.map((failure) => `lineage:${failure}`));
  const protectedDiff = git([
    "diff",
    "--name-only",
    `${policy.startingCommit}..HEAD`,
    "--",
    "index.html",
    "styles",
    "styles.css",
    "public",
    "Asset",
    "tests/visual/baselines",
    "tests/visual/contracts"
  ]);
  if (protectedDiff) failures.push("protected_visual_or_baseline_diff");
  const env = fs.readFileSync(absolute(".env.example"), "utf8");
  if (!/^TEOYUBE_LIVE_AI_ENABLED=false$/m.test(env)) failures.push("live_ai_flag");
  if (!/^TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false$/m.test(env)) failures.push("vector_flag");
  const result = failures.length === 0 ? "PASS" : "BLOCKED";
  writeJson(`${artifactRoot}/validation.json`, {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    identity,
    manifestVersion: manifest.manifestVersion,
    artifactsVerified: manifest.artifacts?.length || 0,
    failures,
    releaseEvidenceLineage: lineage.result,
    evidenceMode: lineage.evidenceMode,
    currentHeadAccepted: lineage.result === "PASS",
    lineage: {
      runtimeSourceCommit: lineage.runtimeSourceCommit,
      runtimeSourceDigest: lineage.runtimeSourceDigest,
      computedRuntimeSourceDigest: lineage.computedRuntimeSourceDigest,
      runtimeSourceDigestMatches: lineage.runtimeSourceDigestMatches,
      gateExecutionCommit: lineage.gateExecutionCommit,
      evidenceCommit: lineage.evidenceCommit,
      reportCommit: lineage.reportCommit,
      currentHead: lineage.currentHead,
      runtimeMetadataVerified: lineage.runtimeMetadataVerified,
      changedPaths: lineage.changedPaths
    },
    gateCPreview: result,
    gateCProduction: "CLOSED"
  });
  console.log(`RELEASE EVIDENCE VALIDATION: ${result} (${manifest.artifacts?.length || 0} artifacts; failures ${failures.length})`);
  if (failures.length) process.exitCode = 1;
}

function bind() {
  const manifestPath = `${artifactRoot}/manifest.json`;
  const manifest = readJson(manifestPath);
  const artifactsValid = (manifest.artifacts || []).every(
    (artifact) =>
      fs.existsSync(absolute(artifact.path)) &&
      sha256File(artifact.path) === artifact.sha256
  );
  const bound = bindCurrentHead(manifest, { artifactsValid });
  writeJson(manifestPath, bound.manifest);
  console.log(
    `RELEASE EVIDENCE LINEAGE BOUND: ${bound.verification.evidenceMode}; current ${bound.verification.currentHead}`
  );
  verify();
}

if (mode === "generate") generate();
else if (mode === "bind") bind();
else verify();
