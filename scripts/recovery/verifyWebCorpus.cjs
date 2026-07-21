/* eslint-disable @typescript-eslint/no-require-imports */
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { readSafeZip } = require("../scripture/lib/safe-zip-reader.cjs");
const { importWebUsfm, sha256 } = require("../scripture/lib/web-usfm-importer.cjs");

const root = path.resolve(__dirname, "../..");
const archivePath = path.join(root, "src/server/scripture/third-party/engwebp/source/engwebp_usfm.zip");
const generatedRoot = path.join(root, "src/server/scripture/corpora/engwebp/generated");
const startedAt = performance.now();
const archive = fs.readFileSync(archivePath);
const zip = readSafeZip(archivePath);
const archiveVerificationMs = performance.now() - startedAt;
const importStartedAt = performance.now();
const imported = importWebUsfm(zip, archive);
const deterministicImportMs = performance.now() - importStartedAt;
const manifestBytes = fs.readFileSync(path.join(generatedRoot, "manifest.json"));
const manifest = JSON.parse(manifestBytes.toString("utf8"));
const failures = [];

const generatedCorpus = fs.readFileSync(path.join(generatedRoot, "corpus.json"));
const generatedLexical = fs.readFileSync(path.join(generatedRoot, "lexical-index.json"));
if (!generatedCorpus.equals(imported.corpusBytes)) failures.push("Network-free regenerated corpus bytes differ from the committed corpus.");
if (!generatedLexical.equals(imported.lexicalBytes)) failures.push("Network-free regenerated lexical-index bytes differ from the committed index.");
if (manifest.archive.sha256 !== imported.archiveSha256 || manifest.archive.bytes !== archive.length) failures.push("Manifest/archive binding changed.");
if (manifest.generated.corpus.sha256 !== sha256(generatedCorpus) || manifest.generated.lexicalIndex.sha256 !== sha256(generatedLexical)) failures.push("Generated artifact hashes do not match the manifest.");
if (manifest.generatedChecksum !== sha256(Buffer.from(`${imported.corpusChecksum}\n${imported.lexicalChecksum}\n`, "utf8"))) failures.push("Generated composite checksum changed.");
if (manifest.coverage.books !== 66 || manifest.coverage.chapters !== 1189 || manifest.coverage.verseMarkers !== 31103 || manifest.coverage.displayableVerses !== 31098 || manifest.coverage.sourceFootnoteOnlyVerseMarkers !== 5 || manifest.coverage.sourceUsfmFiles !== 68) failures.push("Corpus completeness counts changed.");
if (imported.corpus.verses.some((verse) => verse.textStatus === "displayable" && !verse.text)) failures.push("Importer created an empty displayable verse.");
if (new Set(imported.corpus.verses.map((verse) => verse.key)).size !== imported.corpus.verses.length) failures.push("Importer created duplicate normalized verse keys.");
if (imported.warnings.length !== 0 || manifest.importWarnings.length !== 0) failures.push("Importer warnings are present.");

const signedText = zip.get("signature.txt.asc")?.content.toString("utf8") || "";
const embedded = new Map([...signedText.matchAll(/^([a-f0-9]{64})\s+(.+)$/gm)].map((match) => [match[2].trim(), match[1]]));
let verified = 0;
for (const entry of zip.entries) {
  const expected = embedded.get(entry.name);
  if (!expected) continue;
  if (sha256(entry.content) !== expected) failures.push(`${entry.name}: embedded checksum mismatch.`);
  verified += 1;
}
if (verified !== 70 || embedded.size !== 70) failures.push(`Embedded checksum result is ${verified}/${embedded.size}, expected 70/70.`);
const sourceHashes = new Map(manifest.sourceHashes.map((entry) => [entry.path, entry]));
for (const entry of imported.sourceEntries) {
  const expected = sourceHashes.get(entry.name);
  if (!expected || expected.bytes !== entry.expandedBytes || expected.sha256 !== sha256(entry.content)) failures.push(`${entry.name}: source hash manifest mismatch.`);
}
const copyright = zip.get("copr.htm")?.content.toString("utf8") || "";
const frontMatter = zip.get("00-FRTengwebp.usfm")?.content.toString("utf8") || "";
for (const evidence of ["Public Domain", "2020 stable text edition", "updated World English Bible with the 66-book protocanon only"]) if (!copyright.includes(evidence)) failures.push(`Missing embedded source/license evidence: ${evidence}.`);
if (!frontMatter.includes("World English Bible is in the Public Domain")) failures.push("Missing public-domain evidence in WEB front matter.");
if (manifest.pgpSignatureVerification !== "NOT_PERFORMED") failures.push("PGP status must remain NOT_PERFORMED.");

if (failures.length) {
  console.error("DETERMINISTIC WEB CORPUS VERIFICATION: FAILED");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("DETERMINISTIC WEB CORPUS VERIFICATION: PASSED");
console.log(`Archive safety/hash/source-license verification: ${archiveVerificationMs.toFixed(2)} ms; embedded checksums ${verified}/${embedded.size}.`);
console.log(`Network-free deterministic import: ${deterministicImportMs.toFixed(2)} ms; corpus ${imported.corpusChecksum}; lexical index ${imported.lexicalChecksum}.`);
console.log("Coverage: 66 books; 1,189 chapters; 31,103 source markers; 31,098 displayable verses; 5 source-footnote-only markers; 0 warnings.");
console.log(`Manifest SHA-256: ${crypto.createHash("sha256").update(manifestBytes).digest("hex")}.`);
