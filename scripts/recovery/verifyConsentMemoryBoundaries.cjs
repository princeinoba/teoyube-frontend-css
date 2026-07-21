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
    return /\.(?:ts|tsx|js|jsx)$/.test(entry.name) ? [item] : [];
  });
}

const boundaryFiles = [
  ...walk("src/server/memory"),
  ...walk("src/server/identity"),
  ...walk("src/server/http"),
  ...walk("src/features/memory"),
  ...walk("src/app/api/teoyube/memory"),
  ...walk("src/app/api/teoyube/consent"),
  ...walk("src/app/api/teoyube/identity")
];

for (const file of boundaryFiles) {
  const source = fs.readFileSync(file, "utf8");
  const name = path.relative(root, file).replaceAll("\\", "/");
  if (/\bconsole\.(?:log|info|warn|error|debug)\s*\(/.test(source)) errors.push(`${name}: memory boundary may not log request or private content`);
  if (/\b(?:localStorage|sessionStorage|indexedDB)\b/.test(source)) errors.push(`${name}: browser storage may not be an authoritative memory store`);
  if (/NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|KEY|TOKEN|DATABASE|SESSION|ENCRYPT)/.test(source)) errors.push(`${name}: server credential appears in a public environment variable`);
  if (/body\.(?:userId|accountId)|searchParams\.get\(["']userId["']\)/.test(source)) errors.push(`${name}: authorization may not trust a client-supplied user identifier`);
}

for (const file of [...walk("src/components"), ...walk("src/features")].filter((item) => /^\s*["']use client["']/.test(fs.readFileSync(item, "utf8")))) {
  const source = fs.readFileSync(file, "utf8");
  const name = path.relative(root, file).replaceAll("\\", "/");
  if (/from\s+["'][^"']*(?:server\/memory|server\/identity|sqlite-consent|encryption)[^"']*["']/.test(source)) errors.push(`${name}: client component imports server memory internals`);
}

const teoReader = fs.readFileSync(path.join(root, "src/features/teo-guide/application/authorized-memory-reader.ts"), "utf8");
if (/\b(?:create|update|delete|grantConsent|revokeConsent)\s*\(/.test(teoReader.replace(/constructor\([^)]*\)/g, ""))) errors.push("Teo Guide memory reader exposes a write capability");

if (errors.length) {
  console.error("CONSENT-AWARE MEMORY BOUNDARY: FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("CONSENT-AWARE MEMORY BOUNDARY: PASSED");
console.log(`Checked ${boundaryFiles.length} identity, consent, memory, HTTP, and API files; no client-trusted user ID, public secret, raw logger, browser-authoritative store, client server-internal import, or Teo Guide write boundary found.`);
