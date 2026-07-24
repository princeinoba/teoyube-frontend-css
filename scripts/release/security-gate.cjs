"use strict";

const fs = require("node:fs");
const {
  absolute,
  currentIdentity,
  git,
  readJson,
  run,
  sha256File,
  walk,
  writeJson
} = require("./release-utils.cjs");

function control(id, passed, evidence, severity = "critical") {
  return Object.freeze({ id, passed, severity, evidence });
}

const identity = currentIdentity();
const policy = readJson("config/release-gate-policy.json");
const routes = readJson("config/api-security-registry.json");
const headers = readJson("config/security-headers.json");
const telemetry = readJson("config/telemetry-event-registry.json");
const packageJson = readJson("package.json");
const controls = [];

const actualRoutes = walk("src/app/api")
  .filter((file) => file.endsWith("/route.ts"))
  .sort();
const registeredRoutes = routes.routes.map((route) => route.path).sort();
controls.push(control(
  "api-route-inventory-complete",
  JSON.stringify(actualRoutes) === JSON.stringify(registeredRoutes),
  { actual: actualRoutes.length, registered: registeredRoutes.length }
));

const incompleteRoutes = routes.routes.filter((route) =>
  !route.classification ||
  !route.methods?.length ||
  typeof route.durableWrite !== "boolean" ||
  !route.authentication ||
  !route.authorization ||
  !route.schema ||
  !route.limits ||
  !route.csrf ||
  !route.rateLimit ||
  !route.idempotency
);
controls.push(control(
  "api-route-control-classification",
  incompleteRoutes.length === 0,
  { incomplete: incompleteRoutes.map((route) => route.path) }
));

const unsafeDurableRoutes = routes.routes.filter((route) =>
  route.durableWrite &&
  (route.authentication === "not_required" ||
    route.authorization === "no_user_record_access" ||
    (route.csrf === "not_applicable" && route.classification !== "identity_exchange"))
);
controls.push(control(
  "durable-write-auth-authorization-csrf",
  unsafeDurableRoutes.length === 0,
  { unsafeRoutes: unsafeDurableRoutes.map((route) => route.path) }
));

const headerMap = new Map(headers.headers.map((header) => [header.key.toLowerCase(), header.value]));
const requiredHeaders = [
  "content-security-policy-report-only",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy"
];
controls.push(control(
  "browser-security-headers",
  requiredHeaders.every((name) => headerMap.has(name)) &&
    headerMap.get("content-security-policy-report-only")?.includes("frame-ancestors 'none'") &&
    headerMap.get("x-content-type-options") === "nosniff",
  { policyVersion: headers.policyVersion, requiredHeaders }
));
controls.push(control(
  "production-transport-security-configured",
  headers.productionOnlyHeaders.some((header) =>
    header.key === "Strict-Transport-Security" && header.value.includes("max-age=")
  ),
  { productionOnly: true }
));

const proxySource = fs.readFileSync(absolute("src/proxy.ts"), "utf8");
controls.push(control(
  "request-correlation-and-global-api-limits",
  proxySource.includes('matcher: ["/api/:path*"') &&
    proxySource.includes("x-teoyube-request-id") &&
    proxySource.includes("API_BODY_BYTES") &&
    proxySource.includes("application/json"),
  { matcher: "/api/:path*", maximumBodyBytes: 65536 }
));

const helperSource = fs.readFileSync(absolute("src/server/http/memory-route-helpers.ts"), "utf8");
controls.push(control(
  "critical-request-boundary",
  helperSource.includes("assertAllowedFields") &&
    helperSource.includes("application/json") &&
    helperSource.includes("timingSafeEqual") === false &&
    helperSource.includes('createHash("sha256")'),
  { strictUnknownFields: true, contentType: "application/json", pseudonymousRateKey: true }
));

const criticalResults = policy.criticalContracts.map((contract) => {
  const source = fs.readFileSync(absolute(contract.file), "utf8").toLowerCase();
  const missing = contract.patterns.filter((pattern) => !source.includes(pattern.toLowerCase()));
  return Object.freeze({ id: contract.id, file: contract.file, passed: missing.length === 0, missing });
});
controls.push(control(
  "critical-contract-coverage",
  criticalResults.every((result) => result.passed),
  {
    passed: criticalResults.filter((result) => result.passed).length,
    required: criticalResults.length,
    results: criticalResults
  }
));

const faultSources = walk("tests")
  .filter((file) => /\.(ts|tsx|js|json)$/.test(file))
  .map((file) => fs.readFileSync(absolute(file), "utf8").toLowerCase())
  .join("\n");
const faultResults = policy.faultInjectionPatterns.map((pattern) => ({
  pattern,
  covered: faultSources.includes(pattern.toLowerCase())
}));
controls.push(control(
  "fault-injection-coverage",
  faultResults.filter((result) => result.covered).length >= policy.coverage.mutationChecksRequired,
  {
    covered: faultResults.filter((result) => result.covered).length,
    required: policy.coverage.mutationChecksRequired,
    results: faultResults
  },
  "high"
));

const registryComplete = telemetry.events.every((event) =>
  event.name &&
  event.version &&
  event.purpose &&
  event.allowedFields?.length &&
  event.prohibitedFields?.length &&
  event.sensitivity &&
  event.consentRequirement &&
  Number.isInteger(event.retentionDays) &&
  event.aggregation &&
  event.source &&
  event.owner
);
controls.push(control(
  "telemetry-registry-governance",
  registryComplete && telemetry.defaultState === "disabled_without_purpose_consent",
  { registryVersion: telemetry.registryVersion, events: telemetry.events.length }
));

const prohibitedMetrics = [
  "holiness_score",
  "faith_score",
  "spiritual_rank",
  "guilt_streak",
  "divine_favor_score",
  "time_in_app_objective"
];
const productSource = fs.readFileSync(
  absolute("src/domain/product-value/product-value-metrics.ts"),
  "utf8"
).toLowerCase();
controls.push(control(
  "prohibited-product-metrics",
  prohibitedMetrics.every((metric) => productSource.includes(metric)) &&
    productSource.includes("spiritualscorecomputed: false"),
  { prohibitedMetrics }
));

const trackedFiles = git(["ls-files"]).split(/\r?\n/).filter(Boolean);
const textExtensions = /\.(cjs|js|json|md|mjs|sql|ts|tsx|txt|yml|yaml)$/i;
const secretPatterns = [
  /\bsk-(?:proj-)?[a-z0-9_-]{32,}\b/i,
  /\bAKIA[0-9A-Z]{16}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
];
const currentSecretFiles = [];
for (const file of trackedFiles.filter((item) => textExtensions.test(item))) {
  const source = fs.readFileSync(absolute(file), "utf8");
  if (secretPatterns.some((pattern) => pattern.test(source))) currentSecretFiles.push(file);
}
controls.push(control(
  "tracked-secret-scan",
  currentSecretFiles.length === 0,
  { scannedFiles: trackedFiles.length, secretFileCount: currentSecretFiles.length }
));

const history = run("git", ["log", "--all", "-p", "--no-ext-diff", "--unified=0"], {
  maxBuffer: 512 * 1024 * 1024
}).stdout;
const historySecretCount = secretPatterns.reduce(
  (count, pattern) => count + (pattern.test(history) ? 1 : 0),
  0
);
controls.push(control(
  "git-history-secret-scan",
  historySecretCount === 0,
  { patternMatches: historySecretCount }
));

const publicBuildFiles = walk(".next/static").filter((file) => /\.(js|json|css|map)$/.test(file));
const forbiddenBundlePatterns = [
  /\bsk-(?:proj-)?[a-z0-9_-]{32,}\b/i,
  /OPENAI_API_KEY/,
  /TEOYUBE_MEMORY_ENCRYPTION_KEYS/,
  /TIG_CALLING_SEEDS/,
  /retrieval\.sqlite/,
  /engwebp_usfm\.zip/,
  /synthetic-safety-cases/
];
const unsafeBuildFiles = [];
for (const file of publicBuildFiles) {
  const source = fs.readFileSync(absolute(file));
  const text = source.toString("utf8");
  if (forbiddenBundlePatterns.some((pattern) => pattern.test(text))) unsafeBuildFiles.push(file);
}
controls.push(control(
  "client-bundle-secret-server-data-scan",
  publicBuildFiles.length > 0 && unsafeBuildFiles.length === 0,
  { scannedFiles: publicBuildFiles.length, unsafeFiles: unsafeBuildFiles }
));

const envIgnored = run("git", ["check-ignore", ".env.local"], { allowFailure: true }).status === 0;
const envTracked = trackedFiles.includes(".env.local");
controls.push(control(
  "local-environment-secret-boundary",
  envIgnored && !envTracked,
  { ignored: envIgnored, tracked: envTracked }
));

const directDependencies = Object.keys(packageJson.dependencies || {});
const forbiddenDirect = readJson("config/supply-chain-policy.json").forbiddenDirectDependencies;
controls.push(control(
  "forbidden-direct-dependencies",
  forbiddenDirect.every((name) => !directDependencies.includes(name)),
  { directDependencies, forbiddenDirect }
));

const auditPath = "artifacts/release-evidence/supply-chain/npm-audit.json";
const auditCurrent = fs.existsSync(absolute(auditPath))
  ? readJson(auditPath)
  : null;
controls.push(control(
  "dependency-vulnerability-scan",
  Boolean(
    auditCurrent &&
    auditCurrent.packageLockSha256 === sha256File("package-lock.json") &&
    auditCurrent.vulnerabilities?.critical === 0 &&
    auditCurrent.vulnerabilities?.high === 0
  ),
  auditCurrent || { status: "missing_current_audit" }
));

const reuse = policy.evidenceReuse;
const liveAiChanged = run(
  "git",
  ["diff", "--quiet", `${reuse.prompt19Tag}..HEAD`, "--", ...reuse.liveAiPaths],
  { allowFailure: true }
).status !== 0;
const retrievalChanged = run(
  "git",
  ["diff", "--quiet", `${reuse.prompt20Tag}..HEAD`, "--", ...reuse.retrievalPaths],
  { allowFailure: true }
).status !== 0;
controls.push(control(
  "paid-evidence-reuse-boundary",
  !liveAiChanged && !retrievalChanged,
  {
    liveAiTag: reuse.prompt19Tag,
    liveAiDependenciesChanged: liveAiChanged,
    retrievalTag: reuse.prompt20Tag,
    retrievalDependenciesChanged: retrievalChanged
  },
  "high"
));

const findings = controls
  .filter((item) => !item.passed)
  .map((item) => ({ id: item.id, severity: item.severity, evidence: item.evidence }));
const criticalHigh = findings.filter((finding) =>
  finding.severity === "critical" || finding.severity === "high"
);
const result = Object.freeze({
  schemaVersion: 1,
  gateVersion: "teoyube-release-security-gate-2026-07-24.1",
  generatedAt: new Date().toISOString(),
  identity,
  policyVersion: policy.policyVersion,
  apiRegistryVersion: routes.registryVersion,
  headersPolicyVersion: headers.policyVersion,
  telemetryRegistryVersion: telemetry.registryVersion,
  controls,
  findings,
  criticalHighUnresolved: criticalHigh.length,
  result: criticalHigh.length === 0 ? "PASS" : "BLOCKED"
});
writeJson("artifacts/release/security-gate.json", result);
console.log(`RELEASE SECURITY GATE: ${result.result} (${controls.length} controls; critical/high ${criticalHigh.length})`);
if (result.result !== "PASS") process.exitCode = 1;
