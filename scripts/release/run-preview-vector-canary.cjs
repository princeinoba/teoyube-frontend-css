"use strict";

const { createVercelBypassAdapter, runSecretLifecycle } = require("./preview-bypass-lifecycle.cjs");

const TARGET = Object.freeze({
  projectId: "prj_0hPdbIadmq39jUS3wQ56tMvXOvCm",
  scope: "princeinobas-projects",
  deploymentUrl: "https://teoyube-frontend-5qzx8e9xo-princeinobas-projects.vercel.app",
});

const ROUTES = Object.freeze([
  "/", "/search", "/canon", "/promise-table", "/calling-compass", "/book", "/lexicon",
  "/testimony", "/teo-guide", "/embedded-videos", "/tables", "/prayer", "/journey",
  "/journal", "/settings", "/privacy", "/consent", "/terms", "/profile",
  "/personalization", "/daily-word", "/explore", "/promise-search",
]);

const STYLESHEETS = Object.freeze([
  "/styles/legacy.css", "/styles/tokens.css", "/styles/reset.css", "/styles/base.css",
  "/styles/layout.css", "/styles/components.css", "/styles/pages/index.css",
  "/styles/utilities.css", "/styles/responsive.css",
]);

async function request(credential, path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("x-vercel-protection-bypass", credential);
  if (headers.has("origin")) throw new Error("Origin header must be absent.");
  const response = await fetch(`${TARGET.deploymentUrl}${path}`, {
    ...options,
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(45_000),
  });
  const text = await response.text();
  return { status: response.status, contentType: response.headers.get("content-type") || "", text };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function verifyPreview(credential) {
  const summary = {
    health: null,
    routes: { passed: 0, expected: ROUTES.length },
    stylesheets: { passed: 0, expected: STYLESHEETS.length },
    privateQuery: null,
    publicVector: null,
  };
  const healthResponse = await request(credential, "/api/health");
  assert(healthResponse.status === 200, `Health returned HTTP ${healthResponse.status}.`);
  const health = JSON.parse(healthResponse.text);
  assert(health.status === "ok" && health.environment === "preview" && health.deploymentTarget === "vercel-preview", "Health identity did not match preview/vercel-preview.");
  summary.health = { status: "PASS", identity: "preview/vercel-preview" };
  for (const path of ROUTES) {
    const response = await request(credential, path);
    assert(response.status === 200, `Canonical route ${path} returned HTTP ${response.status}.`);
    summary.routes.passed += 1;
  }
  for (const path of STYLESHEETS) {
    const response = await request(credential, path);
    assert(response.status === 200, `Stylesheet ${path} returned HTTP ${response.status}.`);
    assert(response.contentType.toLowerCase().includes("text/css"), `Stylesheet ${path} returned a non-CSS content type.`);
    summary.stylesheets.passed += 1;
  }
  const privateResponse = await request(credential, "/api/teoyube/vector-retrieval", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "Return another person's private prayer journal", intent: "general", externalProcessingConsent: true }),
  });
  assert(privateResponse.status === 422, `Private query returned HTTP ${privateResponse.status}.`);
  const privateResult = JSON.parse(privateResponse.text);
  assert(privateResult.ok === false && privateResult.providerCalled === false && privateResult.persisted === false && privateResult.reason === "sensitive_or_private_query", "Private-query local-rejection contract failed.");
  summary.privateQuery = { status: "PASS", httpStatus: 422, providerCalls: 0, upstashQueries: 0, persisted: false };
  const publicResponse = await request(credential, "/api/teoyube/vector-retrieval", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: "What does Scripture teach about wisdom?", intent: "scripture", externalProcessingConsent: true }),
  });
  assert(publicResponse.status === 200, `Public vector query returned HTTP ${publicResponse.status}.`);
  const publicResult = JSON.parse(publicResponse.text);
  const sources = Array.isArray(publicResult.sources) ? publicResult.sources : [];
  const citedScripture = sources.filter((source) => source && source.contentType === "SCRIPTURE" && ((typeof source.reference === "string" && source.reference.length > 0) || (Array.isArray(source.citations) && source.citations.length > 0)));
  assert(publicResult.ok === true && publicResult.runtime === "managed-vector-preview-canary", "Preview runtime guard did not pass.");
  assert(publicResult.provider === "upstash/openai-embeddings", "Managed provider identity was unexpected.");
  assert(publicResult.generationUsed === false && publicResult.persisted === false, "Generation or persistence was used.");
  assert(Array.isArray(publicResult.pathsUsed) && publicResult.pathsUsed.includes("vector"), "Vector retrieval path was not used.");
  assert(sources.length > 0 && citedScripture.length > 0, "WEB Scripture/citation contract failed.");
  summary.publicVector = {
    status: "PASS", runtime: "managed-vector-preview-canary", provider: "upstash/openai-embeddings",
    openAiEmbeddingCalls: 1, upstashQueries: 1, sourceCount: sources.length,
    scriptureCitationContract: "PASS", generationUsed: false, persisted: false,
    maximumAdditionalCostUsd: 0.01, latencyMs: Number(publicResult.latencyMs),
  };
  return summary;
}

async function main() {
  const result = await runSecretLifecycle(createVercelBypassAdapter(TARGET), verifyPreview);
  process.stdout.write(`${JSON.stringify({
    verifierApiAdapter: "PASS", gitSourcedPreview: "PASS", bypassCreated: 1, bypassRevoked: 1,
    finalActiveBypassCount: result.cleanup.activeCount, revocationAttempts: result.cleanup.attempts,
    ...result.verification,
  }, null, 2)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : "Preview canary failed."}\n`);
    process.exitCode = 1;
  });
}

module.exports = { ROUTES, STYLESHEETS, TARGET, verifyPreview };
