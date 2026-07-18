"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "../..");
const enginePath = path.join(root, "src/lib/teoyube/calling/calling-engine.ts");
const seedPath = path.join(root, "src/lib/tig/seed/callings.seed.ts");
const callingPath = path.join(root, "src/lib/tig/calling-compass.ts");
const typesPath = path.join(root, "src/lib/tig/types.ts");
const seedIndexPath = path.join(root, "src/lib/tig/seed/index.ts");
const tigIndexPath = path.join(root, "src/lib/tig/index.ts");
const expectedSeedSha256 = "900232f6559fb22e887a89479dc086afb6a248f66ef212678e347ad7bcdaed98";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getNamedImports(source, moduleSpecifier) {
  const expression = new RegExp(
    `import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s+from\\s+["']${escapeRegExp(moduleSpecifier)}["']`,
    "g"
  );
  const names = new Set();
  for (const match of source.matchAll(expression)) {
    for (const entry of match[1].split(",")) {
      const importedName = entry.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0];
      if (importedName) names.add(importedName);
    }
  }
  return names;
}

function findTypeScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findTypeScriptFiles(entryPath);
    return entry.isFile() && /\.tsx?$/.test(entry.name) ? [entryPath] : [];
  });
}

const failures = [];
for (const filePath of [enginePath, seedPath, callingPath, typesPath, seedIndexPath, tigIndexPath]) {
  if (!fs.existsSync(filePath)) failures.push(`Missing required TIG file: ${path.relative(root, filePath)}`);
}

if (!failures.length) {
  const engine = fs.readFileSync(enginePath, "utf8");
  const seed = fs.readFileSync(seedPath, "utf8");
  const calling = fs.readFileSync(callingPath, "utf8");
  const types = fs.readFileSync(typesPath, "utf8");
  const seedIndex = fs.readFileSync(seedIndexPath, "utf8");
  const tigIndex = fs.readFileSync(tigIndexPath, "utf8");
  const callingImports = getNamedImports(engine, "../../tig/calling-compass");
  const seedImports = getNamedImports(engine, "../../tig/seed/callings.seed");
  const typeImports = getNamedImports(engine, "../../tig/types");

  if (!seedImports.has("TIG_CALLING_SEEDS")) {
    failures.push("calling-engine.ts must import TIG_CALLING_SEEDS from the owning seed module.");
  }
  if (/from\s+["']\.\.\/\.\.\/tig["']/.test(engine)) {
    failures.push("calling-engine.ts must not depend on the unstable broad TIG barrel for calling symbols.");
  }
  if (!callingImports.has("detectCallingMatches") || !callingImports.has("getScripturesFromCallings")) {
    failures.push("calling-engine.ts must import calling functions from the owning calling-compass module.");
  }
  if (!typeImports.has("CallingProfileNode") || !/import\s+type\s+\{[^}]*CallingProfileNode[^}]*\}\s+from\s+["']\.\.\/\.\.\/tig\/types["']/.test(engine)) {
    failures.push("calling-engine.ts must import CallingProfileNode from the owning types module.");
  }
  if (!/export const TIG_CALLING_SEEDS\s*:/.test(seed)) {
    failures.push("callings.seed.ts does not export TIG_CALLING_SEEDS.");
  }
  if (!/export function detectCallingMatches\s*\(/.test(calling)) {
    failures.push("calling-compass.ts does not export detectCallingMatches.");
  }
  if (!/export function getScripturesFromCallings\s*\(/.test(calling)) {
    failures.push("calling-compass.ts does not export getScripturesFromCallings.");
  }
  if (!/(export type CallingProfileNode|export interface CallingProfileNode)/.test(types)) {
    failures.push("types.ts does not export CallingProfileNode.");
  }
  const seedDefinitions = findTypeScriptFiles(path.join(root, "src/lib"))
    .filter((filePath) => /\b(?:const|let|var)\s+TIG_CALLING_SEEDS\b/.test(fs.readFileSync(filePath, "utf8")));
  if (seedDefinitions.length !== 1 || seedDefinitions[0] !== seedPath) {
    failures.push(`TIG_CALLING_SEEDS must have exactly one definition in callings.seed.ts; found ${seedDefinitions.length}.`);
  }
  const seedSha256 = crypto.createHash("sha256").update(fs.readFileSync(seedPath)).digest("hex");
  if (seedSha256 !== expectedSeedSha256) {
    failures.push(`callings.seed.ts changed byte-for-byte (expected SHA-256 ${expectedSeedSha256}, received ${seedSha256}).`);
  }
  if (!/export\s+\*\s+from\s+["']\.\/callings\.seed["']/.test(seedIndex)) {
    failures.push("The TIG seed compatibility barrel must continue to export callings.seed.ts.");
  }
  if (!/export\s+\*\s+from\s+["']\.\/seed["']/.test(tigIndex)) {
    failures.push("The broad TIG compatibility barrel must continue to export the seed barrel.");
  }
}

if (failures.length) {
  console.error("TIG CALLING SEED CONTRACT: FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("TIG CALLING SEED CONTRACT: PASSED");
console.log("The missing TIG_CALLING_SEEDS barrel-export regression is isolated by narrow imports.");
