const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourceRoots = ["src/app", "src/components", "src/lib"].map((item) => path.join(root, item));
const extensions = [".ts", ".tsx", ".js", ".jsx", ".json"];
const externalPrefixes = [
  "react",
  "next",
  "lucide-react",
  "clsx",
  "class-variance-authority"
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

function candidatePaths(basePath) {
  const candidates = [basePath];
  for (const ext of extensions) candidates.push(`${basePath}${ext}`);
  for (const ext of extensions) candidates.push(path.join(basePath, `index${ext}`));
  return candidates;
}

function resolveImport(specifier, fromFile) {
  if (specifier.startsWith("@/")) return candidatePaths(path.join(root, "src", specifier.slice(2)));
  if (specifier.startsWith("src/")) return candidatePaths(path.join(root, specifier));
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    return candidatePaths(path.resolve(path.dirname(fromFile), specifier));
  }
  return [];
}

function isExternal(specifier) {
  return externalPrefixes.some((prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`));
}

function findImports(source) {
  const imports = [];
  const importFrom = /\bimport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
  const dynamicImport = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  const exportFrom = /\bexport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)["']([^"']+)["']/g;
  for (const pattern of [importFrom, dynamicImport, exportFrom]) {
    let match;
    while ((match = pattern.exec(source))) imports.push(match[1]);
  }
  return imports;
}

const files = sourceRoots.flatMap(walk);
const missing = [];

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  for (const specifier of findImports(source)) {
    if (isExternal(specifier)) continue;
    const candidates = resolveImport(specifier, file);
    if (!candidates.length) continue;
    if (!candidates.some((candidate) => fs.existsSync(candidate))) {
      missing.push({
        file: path.relative(root, file),
        specifier,
        tried: candidates.map((candidate) => path.relative(root, candidate))
      });
    }
  }
}

const report = {
  checkedFiles: files.length,
  missingImportCount: missing.length,
  missing,
  primaryRuntime: "static-node-app",
  nextMigrationLayerChecked: true
};

console.log(JSON.stringify(report, null, 2));
if (missing.length) process.exit(1);
