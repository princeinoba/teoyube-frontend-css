"use strict";

const fs = require("node:fs");
const {
  absolute,
  git,
  readJson,
  writeJson
} = require("./release-utils.cjs");

const policy = readJson("config/release-gate-policy.json");
const committed = git(["diff", "--name-only", `${policy.startingCommit}..HEAD`])
  .split(/\r?\n/)
  .filter(Boolean);
const unstaged = git(["diff", "--name-only"]).split(/\r?\n/).filter(Boolean);
const untracked = git(["ls-files", "--others", "--exclude-standard"])
  .split(/\r?\n/)
  .filter(Boolean);
const files = [...new Set([...committed, ...unstaged, ...untracked])]
  .filter((file) => fs.existsSync(absolute(file)) && fs.statSync(absolute(file)).isFile())
  .filter((file) => /\.(cjs|js|json|md|mjs|ts|tsx|yml|yaml)$/.test(file))
  .sort();
const trailingWhitespace = [];
const invalidJson = [];
for (const file of files) {
  const source = fs.readFileSync(absolute(file), "utf8");
  source.split(/\r?\n/).forEach((line, index) => {
    if (/[ \t]+$/.test(line)) trailingWhitespace.push(`${file}:${index + 1}`);
  });
  if (file.endsWith(".json")) {
    try {
      JSON.parse(source);
    } catch {
      invalidJson.push(file);
    }
  }
}
const passed = trailingWhitespace.length === 0 && invalidJson.length === 0;
writeJson("artifacts/release-evidence/test-results/format-check.json", {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceCommit: git(["rev-parse", "HEAD"]),
  filesChecked: files.length,
  trailingWhitespace,
  invalidJson,
  result: passed ? "PASS" : "BLOCKED"
});
console.log(`FORMAT/STRUCTURE CHECK: ${passed ? "PASS" : "BLOCKED"} (${files.length} Prompt 21 files)`);
if (!passed) process.exitCode = 1;
