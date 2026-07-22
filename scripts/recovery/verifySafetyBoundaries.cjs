/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const errors = [];

function walk(relative) {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(path.relative(root, item));
    return /\.(?:ts|tsx|js|jsx|cjs)$/.test(entry.name) ? [item] : [];
  });
}

const safetyFiles = [...walk("src/domain/safety"), ...walk("src/server/safety")];
if (!safetyFiles.length) errors.push("No safety implementation was found.");

for (const file of safetyFiles) {
  const source = fs.readFileSync(file, "utf8");
  const name = path.relative(root, file).replaceAll("\\", "/");
  if (/\b(?:OpenAI|Anthropic|Gemini|chat\.completions|responses\.create|fetch\s*\(|axios\b|embeddings?)\b/i.test(source)) errors.push(`${name}: live model, network, or embedding code is forbidden in the deterministic safety layer`);
  if (/\b(?:localStorage|sessionStorage|indexedDB)\b/.test(source)) errors.push(`${name}: browser storage is forbidden in safety policy code`);
  if (/\.css["']|styles\/|Asset\/|public\/images|dangerouslySetInnerHTML/.test(source)) errors.push(`${name}: safety code may not own visual source, CSS, DOM, or assets`);
  if (/\bconsole\.(?:log|info|warn|error|debug)\s*\(/.test(source)) errors.push(`${name}: safety production code may not log sensitive input`);
}

const clientRoots = ["src/app", "src/components", "src/features", "src/lib/teoyube/hooks"];
const clients = clientRoots.flatMap(walk).filter((file) => /^\s*["']use client["']/.test(fs.readFileSync(file, "utf8")));
for (const file of clients) {
  const source = fs.readFileSync(file, "utf8");
  const name = path.relative(root, file).replaceAll("\\", "/");
  if (/from\s+["'][^"']*(?:server\/safety|safety-evaluator|safety-orchestrator|crisis-resource-provider)[^"']*["']/.test(source)) errors.push(`${name}: client component imports server-only safety internals`);
}

const contracts = fs.readFileSync(path.join(root, "src/domain/safety/safety-contracts.ts"), "utf8");
for (const stage of ["pre_retrieval", "pre_tool", "post_composition", "pre_write"]) if (!contracts.includes(`"${stage}"`)) errors.push(`Safety stage ${stage} is missing.`);
const environment = fs.readFileSync(path.join(root, ".env.example"), "utf8");
if (!/^TEOYUBE_ENABLE_LIVE_AI=false$/m.test(environment)) errors.push(".env.example must keep live AI disabled.");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (packageJson.scripts.start !== "node --preserve-symlinks-main server.js") errors.push("The canonical static start command changed.");
if (packageJson.scripts["app:start"] !== "next start") errors.push("The Next preview start command is missing or changed.");

if (errors.length) {
  console.error("SAFETY BOUNDARY CONTRACT: FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("SAFETY BOUNDARY CONTRACT: PASSED");
console.log(`Checked ${safetyFiles.length} safety files and ${clients.length} client modules; no model/network/UI/client/server-boundary violation found. Static start remains canonical and live AI remains disabled.`);
