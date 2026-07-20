/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const SOURCE_ROOT = path.join(ROOT, "src");
const ARCHITECTURE_ROOTS = ["features", "domain", "shared", "server"];
const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const errors = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return SOURCE_EXTENSIONS.includes(path.extname(entry.name)) ? [fullPath] : [];
  });
}

function normalize(filePath) {
  return path.relative(ROOT, filePath).replaceAll("\\", "/");
}

function resolveImport(importer, specifier) {
  let candidate;
  if (specifier.startsWith("@/")) candidate = path.join(SOURCE_ROOT, specifier.slice(2));
  else if (specifier.startsWith("src/")) candidate = path.join(ROOT, specifier);
  else if (specifier.startsWith(".")) candidate = path.resolve(path.dirname(importer), specifier);
  else return null;

  for (const suffix of ["", ...SOURCE_EXTENSIONS, ...SOURCE_EXTENSIONS.map((extension) => `/index${extension}`)]) {
    const resolved = `${candidate}${suffix}`;
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) return resolved;
  }
  return null;
}

function importsFor(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const imports = [];
  const pattern = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of source.matchAll(pattern)) imports.push(match[1] || match[2]);
  return imports;
}

const files = ARCHITECTURE_ROOTS.flatMap((root) => walk(path.join(SOURCE_ROOT, root)));
const fileSet = new Set(files);
const graph = new Map(files.map((file) => [file, []]));

const clientFiles = ["app", "components", "features"]
  .flatMap((root) => walk(path.join(SOURCE_ROOT, root)))
  .filter((file) => /^\s*["']use client["']/.test(fs.readFileSync(file, "utf8")));
for (const importer of clientFiles) {
  for (const specifier of importsFor(importer)) {
    const target = resolveImport(importer, specifier);
    const targetName = target ? normalize(target) : specifier.replaceAll("\\", "/");
    if (/src\/server\/tig\//.test(targetName)) {
      errors.push(`${normalize(importer)}: client code may not import the server TIG service or cache (${targetName})`);
    }
    if (/src\/server\/scripture\//.test(targetName)) {
      errors.push(`${normalize(importer)}: client code may not import the server Scripture repository, corpus registry, or lexical index (${targetName})`);
    }
    if (/src\/lib\/tig\/seed\/scriptures\.seed/.test(targetName) || /src\/data\/(?:scriptureCanon|scriptureGraphRelationships|words)\.json/.test(targetName)) {
      errors.push(`${normalize(importer)}: client code may not import Scripture corpus or reference-index source data (${targetName})`);
    }
    if (/src\/lib\/tig\/(?:index|seed\/|intelligence-graph-seeds|traverse|graph-engine|intelligence-graph-engine|production-cache|production-intelligence-service)/.test(targetName)) {
      errors.push(`${normalize(importer)}: client code may not import TIG seeds, graph traversal, cache, or implementation modules (${targetName})`);
    }
    if (/src\/lib\/teoyube\/tig\/(?!tig-recommendation-contracts)/.test(targetName)) {
      errors.push(`${normalize(importer)}: client code may import only client-safe TIG contracts, not the legacy TIG implementation (${targetName})`);
    }
  }
}

for (const importer of files) {
  const importerName = normalize(importer);
  const importerRoot = importerName.split("/")[1];
  for (const specifier of importsFor(importer)) {
    if (importerRoot === "domain" && (specifier === "react" || specifier.startsWith("react/") || specifier === "next" || specifier.startsWith("next/"))) {
      errors.push(`${importerName}: domain code may not import ${specifier}`);
    }

    const target = resolveImport(importer, specifier);
    if (!target) continue;
    const targetName = normalize(target);
    const historicalTarget = /(?:^|\/)(?:phase\d|phase-\d|phase_\d)|\/productization\/Phase\d/i.test(targetName);
    if (historicalTarget && !/\/legacy-adapter\.(?:ts|tsx|js|jsx)$/.test(importerName)) {
      errors.push(`${importerName}: historical module ${targetName} must be reached through a named legacy-adapter`);
    }

    if (importerRoot === "domain" && /src\/(?:app|components|features|server|shared|lib)\//.test(targetName)) {
      errors.push(`${importerName}: domain code may not depend on ${targetName}`);
    }

    const featureMatch = importerName.match(/^src\/features\/([^/]+)\//);
    const targetFeatureMatch = targetName.match(/^src\/features\/([^/]+)\/(.+)$/);
    if (featureMatch && targetFeatureMatch && featureMatch[1] !== targetFeatureMatch[1] && targetFeatureMatch[2] !== "index.ts") {
      errors.push(`${importerName}: cross-feature imports must use ${targetFeatureMatch[1]}/index.ts`);
    }

    if (fileSet.has(target)) graph.get(importer).push(target);
  }
}

const visiting = new Set();
const visited = new Set();
function visit(file, stack) {
  if (visiting.has(file)) {
    const cycleStart = stack.indexOf(file);
    errors.push(`dependency cycle: ${[...stack.slice(cycleStart), file].map(normalize).join(" -> ")}`);
    return;
  }
  if (visited.has(file)) return;
  visiting.add(file);
  for (const dependency of graph.get(file) || []) visit(dependency, [...stack, file]);
  visiting.delete(file);
  visited.add(file);
}
for (const file of files) visit(file, []);

if (errors.length) {
  console.error("ARCHITECTURE BOUNDARY CONTRACT: FAILED");
  for (const error of [...new Set(errors)]) console.error(`- ${error}`);
  process.exit(1);
}

console.log("ARCHITECTURE BOUNDARY CONTRACT: PASSED");
console.log(`Checked ${files.length} capability/domain/shared/server source files; no forbidden imports or dependency cycles.`);
