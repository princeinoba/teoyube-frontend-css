"use strict";

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { absolute, currentIdentity, readJson, walk, writeJson } = require("./release-utils.cjs");

const CSS_IMPORT_PATTERN = /@import\s+(?:url\()?\s*["']([^"']+\.css(?:\?[^"']*)?)["']\s*\)?/gi;
const CSS_URL_PATTERN = /(?:href=["']|url\(\s*["']?)(\/(?:_next\/static|styles\/)[^"')\s]+\.css(?:\?[^"')\s]*)?)/gi;

function compressedBytes(buffer) {
  return {
    rawBytes: buffer.length,
    gzipBytes: zlib.gzipSync(buffer, { level: 9 }).length,
    brotliBytes: zlib.brotliCompressSync(buffer, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 }
    }).length
  };
}

function sumMeasurements(files) {
  return files.reduce((sum, file) => ({
    rawBytes: sum.rawBytes + file.rawBytes,
    gzipBytes: sum.gzipBytes + file.gzipBytes,
    brotliBytes: sum.brotliBytes + file.brotliBytes
  }), { rawBytes: 0, gzipBytes: 0, brotliBytes: 0 });
}

const stylesheetCache = new Map();

function stylesheetRecord(file) {
  const normalized = file.replaceAll("\\", "/");
  if (!stylesheetCache.has(normalized)) {
    stylesheetCache.set(normalized, {
      file: normalized,
      ...compressedBytes(fs.readFileSync(absolute(normalized)))
    });
  }
  return stylesheetCache.get(normalized);
}

function protectedPathFromUrl(url) {
  const clean = url.split("?")[0];
  return clean.startsWith("/styles/") ? clean.slice(1) : null;
}

function nextPathFromUrl(url) {
  const clean = url.split("?")[0];
  return clean.startsWith("/_next/static/")
    ? `.next${clean.slice("/_next".length)}`
    : null;
}

function importsFor(file) {
  const source = fs.readFileSync(absolute(file), "utf8");
  return [...source.matchAll(CSS_IMPORT_PATTERN)].map((match) => {
    const value = match[1].split("?")[0];
    return value.startsWith("/")
      ? protectedPathFromUrl(value)
      : path.posix.normalize(
          path.posix.join(path.posix.dirname(file.replaceAll("\\", "/")), value)
        );
  }).filter(Boolean);
}

function expandProtectedImports(entryFiles) {
  const pending = [...entryFiles];
  const files = new Set();
  while (pending.length > 0) {
    const file = pending.shift();
    if (!file || files.has(file)) continue;
    if (!fs.existsSync(absolute(file))) {
      throw new Error(`Production CSS request resolves to missing protected file: ${file}`);
    }
    files.add(file);
    pending.push(...importsFor(file));
  }
  return [...files].sort();
}

function builtHtmlForRoute(route) {
  return route === "/" ? ".next/server/app/index.html" : `.next/server/app${route}.html`;
}

function urlsInHtml(file) {
  return [...fs.readFileSync(absolute(file), "utf8").matchAll(CSS_URL_PATTERN)]
    .map((match) => match[1]);
}

function measureProductionCss() {
  const policy = readJson("config/release-gate-policy.json");
  const runtime = readJson("config/runtime/canonical-runtime-manifest.json");
  const sourceRecords = [
    "styles.css",
    ...walk("styles").filter((file) => file.endsWith(".css"))
  ].sort().map(stylesheetRecord);
  const nextGeneratedRecords = walk(".next/static")
    .filter((file) => file.endsWith(".css"))
    .sort()
    .map(stylesheetRecord);

  const routes = runtime.publicRoutes.map(({ path: routePath, capability }) => {
    const htmlFile = builtHtmlForRoute(routePath);
    if (!fs.existsSync(absolute(htmlFile))) {
      throw new Error(`Missing built HTML for canonical route ${routePath}: ${htmlFile}`);
    }
    const urls = [...new Set(urlsInHtml(htmlFile))].sort();
    const protectedFiles = expandProtectedImports(
      urls.map(protectedPathFromUrl).filter(Boolean)
    );
    const generatedFiles = urls.map(nextPathFromUrl).filter(Boolean);
    for (const file of generatedFiles) {
      if (!fs.existsSync(absolute(file))) {
        throw new Error(`Built route ${routePath} references missing emitted CSS: ${file}`);
      }
    }
    const requestedFiles = [...new Set([...protectedFiles, ...generatedFiles])].sort();
    const totals = sumMeasurements(requestedFiles.map(stylesheetRecord));
    return {
      path: routePath,
      capability,
      htmlFile,
      protectedStylesheetCount: protectedFiles.length,
      nextGeneratedStylesheetCount: generatedFiles.length,
      requestedStylesheetCount: requestedFiles.length,
      ...totals,
      requestedFiles
    };
  });

  const productionFiles = [...new Set(
    routes.flatMap((route) => route.requestedFiles)
  )].sort();
  const protectedSourceInventory = sumMeasurements(sourceRecords);
  const nextGenerated = sumMeasurements(nextGeneratedRecords);
  const productionRequested = sumMeasurements(productionFiles.map(stylesheetRecord));
  const budgets = policy.performance.cssProduction;
  if (!budgets) throw new Error("Missing performance.cssProduction release budgets");

  const maximums = {
    rawBytes: Math.max(...routes.map((route) => route.rawBytes)),
    gzipBytes: Math.max(...routes.map((route) => route.gzipBytes)),
    brotliBytes: Math.max(...routes.map((route) => route.brotliBytes))
  };
  const checks = [
    ["next-generated-css-raw", nextGenerated.rawBytes, budgets.nextGeneratedRawMaximumBytes],
    ["production-requested-css-raw", productionRequested.rawBytes, budgets.productionRawMaximumBytes],
    ["production-requested-css-gzip", productionRequested.gzipBytes, budgets.productionGzipMaximumBytes],
    ["production-requested-css-brotli", productionRequested.brotliBytes, budgets.productionBrotliMaximumBytes],
    ["maximum-route-css-raw", maximums.rawBytes, budgets.routeRawMaximumBytes],
    ["maximum-route-css-gzip", maximums.gzipBytes, budgets.routeGzipMaximumBytes],
    ["maximum-route-css-brotli", maximums.brotliBytes, budgets.routeBrotliMaximumBytes]
  ].map(([id, actual, maximum]) => ({
    id,
    actual,
    maximum,
    passed: actual <= maximum
  }));
  checks.push({
    id: "canonical-route-css-coverage",
    actual: routes.length,
    expected: runtime.publicRoutes.length,
    passed: routes.length === runtime.publicRoutes.length
      && routes.every((route) => route.requestedStylesheetCount > 0)
  });
  const failed = checks.filter((check) => !check.passed).map((check) => check.id);

  return {
    schemaVersion: 1,
    measurementVersion: "teoyube-production-css-transfer-2026-08-07.1",
    generatedAt: new Date().toISOString(),
    identity: currentIdentity(),
    policyVersion: policy.policyVersion,
    buildId: fs.readFileSync(absolute(".next/BUILD_ID"), "utf8").trim(),
    rationale: "The retired 948,538-byte check summed protected source files. This gate measures the complete CSS request graph served by the production Next build, plus gzip and Brotli transfer representations, without changing protected stylesheets.",
    protectedSourceInventory: {
      releaseBlocking: false,
      fileCount: sourceRecords.length,
      ...protectedSourceInventory
    },
    nextGenerated: {
      releaseBlocking: true,
      fileCount: nextGeneratedRecords.length,
      ...nextGenerated
    },
    productionRequested: {
      releaseBlocking: true,
      fileCount: productionFiles.length,
      ...productionRequested
    },
    maximumRoute: maximums,
    budgets,
    checks,
    routes,
    failed,
    result: failed.length === 0 ? "PASS" : "BLOCKED"
  };
}

function markdownFor(result) {
  const rows = result.routes.map((route) =>
    `| \`${route.path}\` | ${route.requestedStylesheetCount} | ${route.rawBytes} | ${route.gzipBytes} | ${route.brotliBytes} |`
  ).join("\n");
  return `# Production CSS budget

- Result: **${result.result}**
- Measurement: \`${result.measurementVersion}\`
- Build: \`${result.buildId}\`
- Commit: \`${result.identity.commit}\`
- Protected source CSS: ${result.protectedSourceInventory.rawBytes} bytes (informational; owner-protected)
- Next-generated CSS: ${result.nextGenerated.rawBytes} raw bytes
- Complete production-requested CSS: ${result.productionRequested.rawBytes} raw / ${result.productionRequested.gzipBytes} gzip / ${result.productionRequested.brotliBytes} Brotli bytes

The historical 948,538-byte gate was a repository source-file sum, not an emitted or transferred production boundary. It is retained in policy as historical context but is no longer release-blocking. No stylesheet, baseline, or visual artifact changed for this reconciliation.

## Per-route transfer

| Route | Files | Raw bytes | Gzip bytes | Brotli bytes |
| --- | ---: | ---: | ---: | ---: |
${rows}
`;
}

if (require.main === module) {
  try {
    const result = measureProductionCss();
    writeJson("docs/release/css-production-budget.json", result);
    fs.writeFileSync(
      absolute("docs/release/css-production-budget.md"),
      markdownFor(result),
      "utf8"
    );
    console.log(
      `RELEASE CSS PRODUCTION BUDGET: ${result.result} (${result.routes.length} routes; ${result.productionRequested.brotliBytes} Brotli bytes)`
    );
    if (result.failed.length > 0) process.exitCode = 1;
  } catch (error) {
    console.error(`RELEASE CSS PRODUCTION BUDGET: BLOCKED (${error.message})`);
    process.exitCode = 1;
  }
}

module.exports = { measureProductionCss };