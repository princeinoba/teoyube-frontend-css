const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outRoot = path.join(root, ".tmp", "teoyube-beta-handoff");
const bundleDir = path.join(outRoot, "teoyube-beta-phase-11-7");

const includeEntries = [
  "app.js",
  "index.html",
  "styles.css",
  "server.js",
  "package.json",
  "package-lock.json",
  "next.config.mjs",
  "tsconfig.json",
  ".env.example",
  "ROUTING_SIMPLIFICATION.md",
  "scripts",
  "src",
  "docs/teoyube",
  "public",
  "Asset"
];

const excludedNames = new Set([
  ".git",
  ".next",
  ".tmp",
  ".cache",
  "node_modules",
  "coverage",
  "test-results",
  "playwright-report",
  "dist",
  "build",
  "out",
  ".turbo",
  ".vite"
]);

function isSecretOrGeneratedFile(name) {
  const lower = name.toLowerCase();
  if (lower === ".env" || lower === ".env.local" || /^\.env\..*\.local$/i.test(name)) return true;
  if (lower.endsWith(".log") || lower.endsWith(".zip")) return true;
  if (lower.endsWith(".tsbuildinfo") || lower === ".eslintcache") return true;
  if (/codex-clipboard|screenshot|playwright|test-results/i.test(name) && /\.(png|jpg|jpeg|webp|json|html)$/i.test(name)) return true;
  return false;
}

function assertInsideRoot(target) {
  const resolved = path.resolve(target);
  if (!resolved.startsWith(root)) {
    throw new Error(`Refusing to write outside workspace: ${resolved}`);
  }
  return resolved;
}

function copyEntry(source, destination, copied) {
  const stat = fs.statSync(source);
  const name = path.basename(source);
  if (excludedNames.has(name) || isSecretOrGeneratedFile(name)) return;

  if (stat.isDirectory()) {
    fs.mkdirSync(destination, { recursive: true });
    for (const child of fs.readdirSync(source)) {
      copyEntry(path.join(source, child), path.join(destination, child), copied);
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  copied.push(path.relative(root, source).replace(/\\/g, "/"));
}

function getDirectorySize(directory) {
  if (!fs.existsSync(directory)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stat = fs.statSync(fullPath);
    total += stat.isDirectory() ? getDirectorySize(fullPath) : stat.size;
  }
  return total;
}

function run() {
  assertInsideRoot(outRoot);
  if (fs.existsSync(outRoot)) fs.rmSync(outRoot, { recursive: true, force: true });
  fs.mkdirSync(bundleDir, { recursive: true });

  const copied = [];
  const skipped = [];
  for (const entry of includeEntries) {
    const source = path.join(root, entry);
    if (!fs.existsSync(source)) {
      skipped.push(entry);
      continue;
    }
    copyEntry(source, path.join(bundleDir, entry), copied);
  }

  const runInstructions = `# Teoyube Beta Phase 11.7 Handoff

## Run Locally

1. Install Node.js.
2. From this folder, run \`npm install\` if dependencies are needed.
3. Run \`npm start\`.
4. Open \`http://127.0.0.1:4173\`.

## Safety

- Static Node remains the primary runtime.
- The default data mode is memory-only.
- Exports are user-triggered downloads.
- Import/restore previews are local and sanitized.
- No accounts, payments, analytics, database persistence, public launch action, external upload, or live AI orchestration are included.
`;
  fs.writeFileSync(path.join(bundleDir, "RUN_BETA.md"), runInstructions);

  const manifest = {
    createdAt: new Date().toISOString(),
    phase: "11.7",
    primaryRuntime: "static-node-app",
    bundleDir,
    copiedCount: copied.length,
    copied,
    skipped,
    exclusions: [...excludedNames].sort(),
    secretFilesExcluded: true,
    generatedArtifactsExcluded: true,
    sizeBytes: getDirectorySize(bundleDir)
  };
  fs.writeFileSync(path.join(bundleDir, "BETA_BUNDLE_MANIFEST.json"), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify(manifest, null, 2));
}

run();
