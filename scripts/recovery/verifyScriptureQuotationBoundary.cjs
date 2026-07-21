/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "../..");
const roots = ["src/app", "src/components", "src/features", "src/domain", "src/server"];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const excluded = [
  "src/app/_approved-source/approved-view-markup.generated.ts"
];
const hardCodedQuotePatterns = [
  /(?:scriptureText|verseText|scriptureQuote|quotedScripture)\s*[:=]\s*["'`][^"'`]{12,}["'`]/i,
  /And we know that all things work together for good to them that love God/i,
  /they that wait upon the LORD shall renew their strength/i,
  /Have not I commanded thee\? Be strong and of a good courage/i
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return extensions.has(path.extname(entry.name)) ? [fullPath] : [];
  });
}

const failures = [];
let checked = 0;
for (const root of roots) {
  for (const file of walk(path.join(workspaceRoot, root))) {
    const relative = path.relative(workspaceRoot, file).replaceAll("\\", "/");
    if (excluded.includes(relative)) continue;
    checked += 1;
    const source = fs.readFileSync(file, "utf8");
    for (const pattern of hardCodedQuotePatterns) {
      if (pattern.test(source)) failures.push(`${relative}: hard-coded Scripture text must come from an approved corpus fixture or a source-metadata allowlist.`);
    }
  }
}

if (failures.length) {
  console.error("SCRIPTURE QUOTATION BOUNDARY: FAILED");
  [...new Set(failures)].forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`SCRIPTURE QUOTATION BOUNDARY: PASSED (${checked} canonical production files checked; no new hard-coded Scripture quotation found).`);
console.log("The protected static/derived presentation is governed separately by the exact owner-approved 17-record content-delta replay contract.");
