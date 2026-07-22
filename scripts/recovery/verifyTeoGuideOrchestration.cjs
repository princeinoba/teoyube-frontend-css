/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const requiredTools = [
  "searchScripture", "getScriptureContext", "searchPromises", "getPromiseCluster", "getCurrentJourney", "proposeJourneyAction", "getCallingEvidence", "buildPrayerOptions", "searchApprovedUserMemory", "summarizeReflectionPattern", "createJournalDraft", "createTestimonyDraft", "createMentorDiscussionPrompt"
];
const boundaryFiles = [
  "src/domain/teo-guide/orchestration-contracts.ts",
  "src/domain/teo-guide/tool-contracts.ts",
  "src/domain/teo-guide/deterministic-planner.ts",
  "src/server/teo-guide/action-proposal-repository.ts",
  "src/server/teo-guide/conversation-repository.ts",
  "src/server/teo-guide/tool-registry.ts",
  "src/server/teo-guide/deterministic-orchestrator.ts",
  "src/server/teo-guide/request-context.ts",
  "src/app/api/teoyube/teo-guide/route.ts",
  "src/app/api/teoyube/teo-guide/actions/route.ts"
];

function read(file) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) throw new Error(`Missing Prompt 18 boundary file: ${file}`);
  return fs.readFileSync(absolute, "utf8");
}

const registry = read("src/server/teo-guide/tool-registry.ts");
for (const tool of requiredTools) {
  const count = (registry.match(new RegExp(`descriptor\\(\"${tool}\"`, "g")) || []).length;
  if (count !== 1) throw new Error(`Expected exactly one fixed ${tool} descriptor, found ${count}.`);
}
if ((registry.match(/descriptor\(\"/g) || []).length !== requiredTools.length) throw new Error("The Teo Guide tool registry contains an unreviewed tool.");

const source = boundaryFiles.map((file) => `// ${file}\n${read(file)}`).join("\n");
const deterministicSource = boundaryFiles
  .filter((file) => !file.startsWith("src/app/api/"))
  .map((file) => `// ${file}\n${read(file)}`).join("\n");
if (/\b(?:openai|anthropic|gemini|cohere|pinecone|weaviate|langchain)\b/i.test(deterministicSource)) throw new Error("Prompt 18 deterministic domain/server boundary includes live model, vector, or RAG provider code.");
const prohibited = [
  [/\bfetch\s*\(/, "server-side network fetch"],
  [/\bas\s+(?:any|unknown|never)\b/, "unchecked type assertion"],
  [/@ts-(?:ignore|nocheck)|eslint-disable/, "suppressed type or lint boundary"],
  [/TIG_CALLING_SEEDS|callings\.seed|promise-clusters\.seed/, "direct seed import"],
  [/(?:runtime\.memory\.create|memory\.create|repository\.(?:save|update|delete))\s*\(/i, "direct state repository write"]
];
for (const [pattern, label] of prohibited) if (pattern.test(source)) throw new Error(`Prompt 18 boundary includes prohibited ${label}: ${pattern}`);

const controller = read("src/app/_teo-guide/TeoGuidePageController.tsx");
if (!controller.includes('fetch("/api/teoyube/teo-guide"')) throw new Error("The approved Teo Guide controller is not using the server-owned route.");
if (/TIG_CALLING_SEEDS|callings\.seed|promiseClusters\.json|canonical-tig-service|canonical-scripture-repository/i.test(controller)) throw new Error("The Teo Guide client imports server data or traversal implementation.");

const environment = read(".env.example");
for (const flag of ["TEOYUBE_ENABLE_LIVE_AI", "TEOYUBE_ENABLE_EMBEDDINGS", "TEOYUBE_ENABLE_VECTOR_RETRIEVAL", "TEOYUBE_ENABLE_BROAD_RAG", "TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER"]) {
  if (!new RegExp(`^${flag}=false$`, "m").test(environment)) throw new Error(`${flag} must be explicitly false in .env.example.`);
}

const packageJson = JSON.parse(read("package.json"));
const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };
for (const name of Object.keys(dependencies)) {
  if (name === "openai" && dependencies[name] === "6.48.0") continue;
  if (/openai|anthropic|gemini|cohere|pinecone|weaviate|langchain|ai-sdk/i.test(name)) throw new Error(`Unapproved provider or RAG dependency: ${name}`);
}
if (packageJson.scripts.start !== "node --preserve-symlinks-main server.js") throw new Error("The canonical static start script changed.");

const nextDir = path.join(root, ".next");
let clientChunksScanned = 0;
if (fs.existsSync(nextDir)) {
  const stack = [path.join(nextDir, "static")];
  while (stack.length) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (/\.js$/.test(entry.name)) {
        const contents = fs.readFileSync(absolute, "utf8");
        clientChunksScanned += 1;
        if (/TIG_(?:CALLING|JOURNEY|PRAYER_SEQUENCE|ACTION_STEP)_SEEDS|journey_waiting_to_renewal|rel_calling_builder_to_journey_purpose_to_calling|runTigEndToEndRecommendation|TigVersionedCache/.test(contents)) throw new Error(`TIG seed or traversal data leaked into client chunk ${path.relative(root, absolute)}.`);
      }
    }
  }
}

console.log(`TEO GUIDE ORCHESTRATION CONTRACT: PASSED\nTools: ${requiredTools.length}\nBoundary files: ${boundaryFiles.length}\nClient chunks scanned: ${clientChunksScanned}\nProvider SDKs behind guarded adapter: 1\nEmbeddings/vector/broad RAG: disabled\nCanonical static runtime: unchanged`);
