/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const errors = [];
const adapter = "src/server/live-ai/openai-responses-adapter.ts";

function read(relative) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) throw new Error(`Missing live-AI boundary file: ${relative}`);
  return fs.readFileSync(absolute, "utf8");
}

function walk(relative) {
  const directory = path.join(root, relative);
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(path.relative(root, item));
    return /\.(?:ts|tsx|js|jsx|cjs)$/.test(entry.name) ? [path.relative(root, item).replaceAll("\\", "/")] : [];
  });
}

const packageJson = JSON.parse(read("package.json"));
if (packageJson.dependencies?.openai !== "6.48.0") errors.push("The official OpenAI SDK must be exactly pinned to 6.48.0.");
if (packageJson.scripts?.start !== "node --preserve-symlinks-main server.js") errors.push("The canonical static start command changed.");

const lock = JSON.parse(read("package-lock.json"));
const locked = lock.packages?.["node_modules/openai"];
if (locked?.version !== "6.48.0") errors.push("The lockfile OpenAI SDK version is not 6.48.0.");
if (locked?.integrity !== "sha512-KhVp+FyV50QrXNextvL9hIU5l6ox5HYuKQjGVk7lIqprgJol90+dQXWONV6S1lRWsKA1bXjrow8RsUT14M1hNA==") errors.push("The reviewed OpenAI SDK integrity changed.");

const production = walk("src");
const sdkImports = production.filter((file) => /from\s+["']openai(?:\/[^"']*)?["']|require\(["']openai/.test(read(file)));
if (sdkImports.length !== 1 || sdkImports[0] !== adapter) errors.push(`Only ${adapter} may import the vendor SDK; found: ${sdkImports.join(", ") || "none"}.`);

const adapterSource = read(adapter);
for (const invariant of ["responses.create", "store: false", "parallel_tool_calls: false", "strict: true", "maxRetries: 0", "stream: true"]) {
  if (!adapterSource.includes(invariant)) errors.push(`OpenAI adapter invariant is missing: ${invariant}`);
}
if (/baseURL\s*:|previous_response_id|background\s*:\s*true|web_search|file_search|code_interpreter|computer_use|mcp\b|shell\b/.test(adapterSource)) errors.push("The OpenAI adapter enables a prohibited provider-state or built-in-tool capability.");

const statusRoute = read("src/app/api/teoyube/live-ai-status/route.ts");
const teoGuideRoute = read("src/app/api/teoyube/teo-guide/route.ts");
if (!statusRoute.includes("liveAiStatusResponse") || !teoGuideRoute.includes("liveAiStatusResponse")) errors.push("The live-AI readiness probe and compatibility GET must share the server-owned safe status response.");

const environment = read(".env.example");
for (const flag of ["TEOYUBE_ENABLE_LIVE_AI", "TEOYUBE_LIVE_AI_ENABLED", "TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER", "TEOYUBE_ENABLE_EMBEDDINGS", "TEOYUBE_ENABLE_VECTOR_RETRIEVAL", "TEOYUBE_ENABLE_BROAD_RAG"]) {
  if (!new RegExp(`^${flag}=false$`, "m").test(environment)) errors.push(`${flag} must default to false.`);
}
if (/^NEXT_PUBLIC_.*(?:OPENAI|SECRET|API_KEY|TOKEN)/m.test(environment)) errors.push("A live-AI secret is exposed through NEXT_PUBLIC_.");

const purposeRegistry = read("src/domain/memory/data-classification-registry.ts");
for (const pair of [
  ["external_ai_processing", "external_ai:process"],
  ["external_ai_sensitive_content", "external_ai:sensitive_content"],
  ["external_ai_memory_context", "external_ai:memory_context"],
  ["live_ai_conversation_retention", "external_ai:conversation_retention"]
]) if (!purposeRegistry.includes(pair[0]) || !purposeRegistry.includes(pair[1])) errors.push(`Missing consent purpose/scope: ${pair.join(" / ")}.`);

for (const file of production.filter((item) => /^\s*["']use client["']/.test(read(item)))) {
  const source = read(file);
  if (/from\s+["'][^"']*(?:server\/live-ai|openai-responses-adapter|model-tool-definitions|safe-model-input)[^"']*["']/.test(source)) errors.push(`${file}: a client component imports live-AI server internals.`);
  if (/OPENAI_API_KEY|from\s+["']openai/.test(source)) errors.push(`${file}: a client component contains a provider key or SDK reference.`);
}

let clientChunksScanned = 0;
const staticRoot = path.join(root, ".next", "static");
if (fs.existsSync(staticRoot)) {
  const stack = [staticRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (/\.js$/.test(entry.name)) {
        clientChunksScanned += 1;
        const source = fs.readFileSync(absolute, "utf8");
        if (/OPENAI_API_KEY|openai\/resources\/responses|responses\.create/.test(source)) errors.push(`Vendor SDK or key marker leaked into ${path.relative(root, absolute)}.`);
      }
    }
  }
}

if (errors.length) {
  console.error("LIVE AI BOUNDARY CONTRACT: FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("LIVE AI BOUNDARY CONTRACT: PASSED");
console.log(`SDK imports: ${sdkImports.length}; client chunks scanned: ${clientChunksScanned}; store:false; strict structured output/tools; no built-ins; three kill switches default off; static start unchanged.`);
