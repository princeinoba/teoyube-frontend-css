/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { readSafeZip } = require("./lib/safe-zip-reader.cjs");
const { CORPUS_VERSION, IMPORTER_VERSION, importWebUsfm, sha256 } = require("./lib/web-usfm-importer.cjs");

const workspaceRoot = path.resolve(__dirname, "../..");
const ownerArchive = path.join(workspaceRoot, "owner-input", "scripture", "engwebp_usfm.zip");
const sourceDirectory = path.join(workspaceRoot, "src", "server", "scripture", "third-party", "engwebp", "source");
const generatedDirectory = path.join(workspaceRoot, "src", "server", "scripture", "corpora", "engwebp", "generated");
const preservedArchive = path.join(sourceDirectory, "engwebp_usfm.zip");
const archivePath = fs.existsSync(ownerArchive) ? ownerArchive : preservedArchive;

if (!fs.existsSync(archivePath)) throw new Error("The verified owner WEB archive is missing.");
const archiveBuffer = fs.readFileSync(archivePath);
const zip = readSafeZip(archivePath);
const imported = importWebUsfm(zip, archiveBuffer);

const signature = zip.get("signature.txt.asc");
if (!signature) throw new Error("The embedded checksum/signature manifest is missing.");
const signedText = signature.content.toString("utf8");
const embeddedChecksums = new Map([...signedText.matchAll(/^([a-f0-9]{64})\s+(.+)$/gm)].map((match) => [match[2].trim(), match[1]]));
let embeddedVerified = 0;
for (const entry of zip.entries) {
  const expected = embeddedChecksums.get(entry.name);
  if (!expected) continue;
  const actual = sha256(entry.content);
  if (actual !== expected) throw new Error(`${entry.name}: embedded SHA-256 verification failed.`);
  embeddedVerified += 1;
}
if (embeddedVerified !== 70 || embeddedChecksums.size !== 70) throw new Error(`Expected 70/70 embedded checksums; verified ${embeddedVerified}/${embeddedChecksums.size}.`);

const copyright = zip.get("copr.htm")?.content.toString("utf8") || "";
const frontMatter = zip.get("00-FRTengwebp.usfm")?.content.toString("utf8") || "";
for (const required of [
  "Public Domain",
  "2020 stable text edition",
  "updated World English Bible with the 66-book protocanon only"
]) if (!copyright.includes(required)) throw new Error(`Embedded copyright evidence is missing: ${required}`);
if (!frontMatter.includes("World English Bible is in the Public Domain")) throw new Error("Embedded WEB public-domain source evidence is missing.");

fs.mkdirSync(sourceDirectory, { recursive: true });
fs.mkdirSync(generatedDirectory, { recursive: true });
if (!fs.existsSync(preservedArchive) || sha256(fs.readFileSync(preservedArchive)) !== imported.archiveSha256) fs.copyFileSync(archivePath, preservedArchive);

const sourceHashes = imported.sourceEntries
  .map((entry) => Object.freeze({ path: entry.name, bytes: entry.expandedBytes, sha256: sha256(entry.content) }))
  .sort((left, right) => left.path.localeCompare(right.path));
const corpusPath = path.join(generatedDirectory, "corpus.json");
const lexicalPath = path.join(generatedDirectory, "lexical-index.json");
fs.writeFileSync(corpusPath, imported.corpusBytes);
fs.writeFileSync(lexicalPath, imported.lexicalBytes);
const manifest = {
  schemaVersion: 1,
  corpusId: "engwebp",
  translationId: "engwebp",
  translationName: "World English Bible",
  displayAbbreviation: "WEB",
  edition: "Protestant Edition, 2020 stable text",
  language: "en-US",
  canon: "66-book Protestant Old and New Testaments",
  source: "eBible.org owner-supplied engwebp USFM archive",
  sourceDate: "2026-07-10",
  verifiedAt: "2026-07-20",
  archive: {
    path: "src/server/scripture/third-party/engwebp/source/engwebp_usfm.zip",
    bytes: archiveBuffer.length,
    sha256: imported.archiveSha256
  },
  importerVersion: IMPORTER_VERSION,
  corpusVersion: CORPUS_VERSION,
  generated: {
    corpus: { path: "src/server/scripture/corpora/engwebp/generated/corpus.json", bytes: imported.corpusBytes.length, sha256: imported.corpusChecksum },
    lexicalIndex: { path: "src/server/scripture/corpora/engwebp/generated/lexical-index.json", bytes: imported.lexicalBytes.length, sha256: imported.lexicalChecksum }
  },
  generatedChecksum: sha256(Buffer.from(`${imported.corpusChecksum}\n${imported.lexicalChecksum}\n`, "utf8")),
  coverage: imported.counts,
  sourceHashes,
  embeddedChecksums: { expected: embeddedChecksums.size, verified: embeddedVerified },
  importWarnings: imported.warnings,
  displayPolicy: "FULL_TEXT_ALLOWED",
  copyrightStatus: "public_domain",
  textIntegrityTrademarkNote: "The World English Bible name is reserved for faithful copies. Teoyube stores and displays unmodified corpus wording.",
  pgpSignatureVerification: "NOT_PERFORMED",
  ownerResidualRiskDecisionId: "TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B"
};
const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(generatedDirectory, "manifest.json"), manifestBytes);

console.log(`WEB IMPORT: PASSED (${imported.counts.books} books, ${imported.counts.chapters} chapters, ${imported.counts.verseMarkers} verse markers, ${imported.counts.displayableVerses} displayable verses, ${imported.counts.lexicalTerms} lexical terms).`);
console.log(`Archive SHA-256: ${imported.archiveSha256}`);
console.log(`Corpus checksum: ${imported.corpusChecksum}`);
console.log(`Lexical index checksum: ${imported.lexicalChecksum}`);
console.log(`Embedded checksums: ${embeddedVerified}/${embeddedChecksums.size}`);
console.log(`Import warnings: ${imported.warnings.length}`);
console.log("PGP signature verification: NOT PERFORMED");
