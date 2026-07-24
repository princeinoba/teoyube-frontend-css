"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  absolute,
  currentIdentity,
  npmRun,
  readJson,
  sha256File,
  writeJson
} = require("./release-utils.cjs");

const policy = readJson("config/supply-chain-policy.json");
const packageJson = readJson("package.json");
const lock = readJson("package-lock.json");
const lockHash = sha256File("package-lock.json");
const auditPath = "artifacts/release-evidence/supply-chain/npm-audit.json";

function runAudit() {
  const outcome = npmRun(["audit", "--json"], {
    allowFailure: true,
    maxBuffer: 64 * 1024 * 1024
  });
  let parsed;
  try {
    parsed = JSON.parse(outcome.stdout || "{}");
  } catch {
    throw new Error("npm audit did not return JSON.");
  }
  const vulnerabilities = parsed.metadata?.vulnerabilities || {};
  const normalized = Object.freeze({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    packageLockSha256: lockHash,
    npmVersion: currentIdentity().npm,
    vulnerabilities: Object.freeze({
      info: Number(vulnerabilities.info || 0),
      low: Number(vulnerabilities.low || 0),
      moderate: Number(vulnerabilities.moderate || 0),
      high: Number(vulnerabilities.high || 0),
      critical: Number(vulnerabilities.critical || 0),
      total: Number(vulnerabilities.total || 0)
    }),
    dependencyCounts: parsed.metadata?.dependencies || null,
    exitCode: outcome.status,
    rawOutputSha256: require("node:crypto")
      .createHash("sha256")
      .update(outcome.stdout || "")
      .digest("hex"),
    result:
      Number(vulnerabilities.high || 0) === 0 &&
      Number(vulnerabilities.critical || 0) === 0
        ? "PASS"
        : "BLOCKED"
  });
  writeJson(auditPath, normalized);
  console.log(`NPM AUDIT: ${normalized.result} (${normalized.vulnerabilities.total} total)`);
  if (normalized.result !== "PASS") process.exitCode = 1;
}

function packageNameFromLockPath(lockPath) {
  const marker = "node_modules/";
  const index = lockPath.lastIndexOf(marker);
  return index >= 0 ? lockPath.slice(index + marker.length) : "";
}

function normalizeLicense(value) {
  if (!value) return "UNKNOWN";
  if (typeof value === "string") return value.trim() || "UNKNOWN";
  if (Array.isArray(value)) return value.map(normalizeLicense).join(" OR ");
  if (typeof value === "object" && value.type) return normalizeLicense(value.type);
  return "UNKNOWN";
}

function generate() {
  const components = [];
  const lifecycle = [];
  for (const [lockPath, metadata] of Object.entries(lock.packages || {})) {
    if (!lockPath || !lockPath.includes("node_modules/")) continue;
    const name = metadata.name || packageNameFromLockPath(lockPath);
    const version = metadata.version || "0.0.0";
    const packagePath = absolute(path.join(lockPath, "package.json"));
    let installed = {};
    if (fs.existsSync(packagePath)) {
      try {
        installed = JSON.parse(fs.readFileSync(packagePath, "utf8"));
      } catch {
        installed = {};
      }
    }
    const license = normalizeLicense(installed.license || metadata.license);
    const scripts = installed.scripts || {};
    for (const scriptName of ["preinstall", "install", "postinstall"]) {
      if (scripts[scriptName]) {
        lifecycle.push({
          name,
          version,
          script: scriptName,
          commandSha256: require("node:crypto")
            .createHash("sha256")
            .update(String(scripts[scriptName]))
            .digest("hex")
        });
      }
    }
    components.push({
      type: "library",
      name,
      version,
      purl: `pkg:npm/${encodeURIComponent(name)}@${encodeURIComponent(version)}`,
      scope: metadata.dev ? "optional" : "required",
      licenses: [{ license: { id: license } }],
      hashes: metadata.integrity
        ? [{ alg: "SHA-512", content: String(metadata.integrity).replace(/^sha512-/, "") }]
        : []
    });
  }
  components.sort((left, right) =>
    `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`)
  );
  const allowedLifecycle = new Set(
    policy.allowedDependencyLifecycleScripts.map(
      (item) => `${item.name}@${item.version}:${item.script}`
    )
  );
  const unexpectedLifecycle = lifecycle.filter(
    (item) => !allowedLifecycle.has(`${item.name}@${item.version}:${item.script}`)
  );
  const directNames = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]);
  const licenses = components.map((component) => ({
    name: component.name,
    version: component.version,
    direct: directNames.has(component.name),
    license: component.licenses[0].license.id,
    review:
      policy.allowedLicenses.includes(component.licenses[0].license.id)
        ? "allowed"
        : "review_required"
  }));
  const directLicenseDebt = licenses.filter(
    (item) => item.direct && item.review !== "allowed"
  );
  const audit = fs.existsSync(absolute(auditPath)) ? readJson(auditPath) : null;
  const auditCurrent = Boolean(audit && audit.packageLockSha256 === lockHash);
  const result =
    unexpectedLifecycle.length === 0 &&
    directLicenseDebt.length === 0 &&
    auditCurrent &&
    audit.result === "PASS"
      ? "PASS"
      : "BLOCKED";
  const serial = Math.max(
    1,
    Number.parseInt(lockHash.slice(0, 8), 16) % 2147483647
  );
  writeJson("artifacts/release-evidence/supply-chain/sbom.cdx.json", {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    serialNumber: `urn:uuid:00000000-0000-4000-8000-${String(serial).padStart(12, "0")}`,
    version: 1,
    metadata: {
      component: {
        type: "application",
        name: packageJson.name,
        version: packageJson.version
      },
      properties: [
        { name: "teoyube:package-lock-sha256", value: lockHash },
        { name: "teoyube:source-map-policy", value: policy.sourceMapPolicy },
        { name: "teoyube:artifact-signing", value: policy.artifactSigning }
      ]
    },
    components
  });
  writeJson("artifacts/release-evidence/supply-chain/licenses.json", {
    schemaVersion: 1,
    policyVersion: policy.policyVersion,
    packageLockSha256: lockHash,
    packages: licenses,
    summary: {
      total: licenses.length,
      allowed: licenses.filter((item) => item.review === "allowed").length,
      reviewRequired: licenses.filter((item) => item.review !== "allowed").length,
      directReviewRequired: directLicenseDebt.length
    }
  });
  writeJson("artifacts/release-evidence/supply-chain/summary.json", {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    identity: currentIdentity(),
    policyVersion: policy.policyVersion,
    packageLockSha256: lockHash,
    componentCount: components.length,
    lifecycleScripts: lifecycle,
    unexpectedLifecycleScripts: unexpectedLifecycle,
    directLicenseDebt,
    transitiveLicenseReviewRequired: licenses.filter(
      (item) => !item.direct && item.review !== "allowed"
    ).length,
    auditCurrent,
    auditResult: audit?.result || "MISSING",
    sourceMapPolicy: policy.sourceMapPolicy,
    artifactSigning: policy.artifactSigning,
    result
  });
  console.log(`SUPPLY CHAIN: ${result} (${components.length} components; unexpected lifecycle ${unexpectedLifecycle.length}; direct license debt ${directLicenseDebt.length})`);
  if (result !== "PASS") process.exitCode = 1;
}

if (process.argv[2] === "audit") runAudit();
else generate();
