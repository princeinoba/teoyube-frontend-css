/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const errors = [];

function read(relative) {
  const location = path.join(root, relative);
  if (!fs.existsSync(location)) throw new Error(`Missing retrieval boundary file: ${relative}`);
  return fs.readFileSync(location, "utf8");
}

function walk(relative) {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(path.relative(root, item));
    return /\.(?:ts|tsx|js|jsx|cjs)$/.test(entry.name)
      ? [path.relative(root, item).replaceAll("\\", "/")]
      : [];
  });
}

const packageJson = JSON.parse(read("package.json"));
const staticCommand = "node --preserve-symlinks-main server.js";
const nextCommand = "node scripts/runtime/start-next.cjs";
if (![staticCommand, nextCommand].includes(packageJson.scripts?.start)) {
  errors.push("The runtime start command is not an approved cutover state.");
}
if (packageJson.scripts?.["app:start"] !== nextCommand) {
  errors.push("The safe Next start command changed.");
}
for (const command of ["static:start", "prototype:start", "rollback:start"]) {
  if (packageJson.scripts?.[command] !== staticCommand) {
    errors.push(`The protected static rollback command ${command} changed.`);
  }
}
for (const script of [
  "retrieval:inventory",
  "retrieval:estimate",
  "retrieval:index:public",
  "retrieval:verify",
  "retrieval:rollback"
]) {
  if (!packageJson.scripts?.[script]) errors.push(`Missing retrieval command: ${script}.`);
}

const environment = read(".env.example");
for (const flag of [
  "TEOYUBE_ENABLE_EMBEDDINGS",
  "TEOYUBE_ENABLE_VECTOR_RETRIEVAL",
  "TEOYUBE_VECTOR_RETRIEVAL_ENABLED",
  "TEOYUBE_ENABLE_BROAD_RAG"
]) {
  if (!new RegExp(`^${flag}=false$`, "m").test(environment)) {
    errors.push(`${flag} must remain checked-in false.`);
  }
}
if (/^NEXT_PUBLIC_.*(?:EMBED|VECTOR|OPENAI|API_KEY|SECRET)/m.test(environment)) {
  errors.push("A retrieval or provider secret is exposed through NEXT_PUBLIC_.");
}

const ignore = read(".gitignore");
if (!/^\/\.var\/retrieval\/$/m.test(ignore)) {
  errors.push("Generated vector data is not ignored at /.var/retrieval/.");
}

const production = walk("src");
const sdkImports = production.filter((file) =>
  /from\s+["']openai(?:\/[^"']*)?["']|require\(["']openai/.test(read(file))
);
const expectedSdkImports = Object.freeze([
  "src/server/live-ai/openai-responses-adapter.ts",
  "src/server/live-ai/preview-grounded-live-ai.ts",
  "src/server/retrieval/openai-embedding-gateway.ts"
]);
if (
  sdkImports.length !== expectedSdkImports.length ||
  expectedSdkImports.some((file) => !sdkImports.includes(file))
) {
  errors.push(`Unexpected provider SDK imports: ${sdkImports.join(", ") || "none"}.`);
}

for (const file of production.filter((item) => /^\s*["']use client["']/.test(read(item)))) {
  const source = read(file);
  if (
    /from\s+["'][^"']*(?:server\/retrieval|openai-embedding-gateway|sqlite-vector-repository|public-source-inventory)[^"']*["']/.test(source)
  ) {
    errors.push(`${file}: a client component imports retrieval server internals.`);
  }
  if (
    /from\s+["'][^"']*(?:tig\/seed|graphRelationships|scriptureGraphRelationships)[^"']*["']/.test(source)
  ) {
    errors.push(`${file}: a client component imports TIG seeds or graph data.`);
  }
}

const adapter = read("src/server/retrieval/openai-embedding-gateway.ts");
for (const invariant of [
  "maxRetries: 0",
  "rawSensitiveText: false",
  "providerHostedVectorStore: false",
  "providerFileSearch: false",
  "providerWebSearch: false"
]) {
  if (!adapter.includes(invariant)) errors.push(`Embedding adapter invariant is missing: ${invariant}.`);
}
if (/baseURL\s*:|file_search|web_search|vector_stores|responses\.create/.test(adapter)) {
  errors.push("The embedding adapter enables an unauthorized provider capability.");
}

const policies = read("src/domain/retrieval/retrieval-policy.ts");
for (const partition of [
  "canonical_scripture",
  "scripture_context",
  "promise_clusters",
  "lexicon",
  "prayer_resources",
  "theology_safety",
  "journal_summaries",
  "testimonies",
  "journey_history",
  "calling_evidence",
  "product_help"
]) {
  if (!policies.includes(`${partition}:`)) errors.push(`Missing retrieval policy for ${partition}.`);
}
for (const purpose of [
  "external_ai_embedding_processing",
  "user_memory_semantic_index",
  "user_testimony_semantic_index",
  "user_journey_semantic_index",
  "user_calling_evidence_semantic_index"
]) {
  if (!read("src/domain/memory/data-classification-registry.ts").includes(purpose)) {
    errors.push(`Missing default-off consent purpose: ${purpose}.`);
  }
}

const lockedEvaluation = JSON.parse(
  read("tests/fixtures/retrieval/locked-evaluation-set.json")
);
if (
  lockedEvaluation.lockedBeforeEmbeddingComparison !== true ||
  lockedEvaluation.containsRealUserContent !== false ||
  !Array.isArray(lockedEvaluation.cases) ||
  lockedEvaluation.cases.length < 20
) {
  errors.push("The retrieval evaluation set is not locked and synthetic.");
}

for (const prohibited of [
  "TEOYUBE_ENABLE_BROAD_RAG=true",
  "TEOYUBE_VECTOR_RETRIEVAL_ENABLED=true"
]) {
  if (environment.includes(prohibited)) errors.push(`Checked-in environment enables ${prohibited}.`);
}

if (errors.length) {
  console.error("RETRIEVAL BOUNDARY CONTRACT: FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("RETRIEVAL BOUNDARY CONTRACT: PASSED");
console.log(
  `Partitions: 11; locked evaluation cases: ${lockedEvaluation.cases.length}; provider SDK adapters: ${sdkImports.length}; client seed/traversal imports: 0; approved Next cutover state and static rollback intact.`
);
