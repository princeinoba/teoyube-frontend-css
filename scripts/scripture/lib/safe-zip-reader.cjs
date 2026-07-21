/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const MAX_EOCD_SEARCH = 65_557;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < table.length; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function fail(message) {
  throw new Error(`Unsafe or unsupported ZIP archive: ${message}`);
}

function assertSafeName(name) {
  if (!name || name.includes("\0")) fail("an entry has an empty or NUL-containing name");
  if (name.includes("\\")) fail(`${name}: backslash path separators are forbidden`);
  if (name.startsWith("/") || /^[A-Za-z]:/.test(name)) fail(`${name}: absolute paths are forbidden`);
  if (name.split("/").some((part) => part === "..")) fail(`${name}: traversal segments are forbidden`);
}

function findEocd(buffer) {
  const start = Math.max(0, buffer.length - MAX_EOCD_SEARCH);
  for (let offset = buffer.length - 22; offset >= start; offset -= 1) {
    if (buffer.readUInt32LE(offset) === EOCD_SIGNATURE) return offset;
  }
  fail("end-of-central-directory record was not found");
}

function readSafeZip(archivePath, limits = {}) {
  const resolved = path.resolve(archivePath);
  const archive = fs.readFileSync(resolved);
  const maximumEntries = limits.maximumEntries ?? 200;
  const maximumEntryBytes = limits.maximumEntryBytes ?? 2_000_000;
  const maximumExpandedBytes = limits.maximumExpandedBytes ?? 25_000_000;
  const maximumCompressionRatio = limits.maximumCompressionRatio ?? 20;
  const eocd = findEocd(archive);
  const disk = archive.readUInt16LE(eocd + 4);
  const centralDisk = archive.readUInt16LE(eocd + 6);
  const entriesOnDisk = archive.readUInt16LE(eocd + 8);
  const entryCount = archive.readUInt16LE(eocd + 10);
  const centralSize = archive.readUInt32LE(eocd + 12);
  const centralOffset = archive.readUInt32LE(eocd + 16);
  const commentLength = archive.readUInt16LE(eocd + 20);

  if (disk !== 0 || centralDisk !== 0 || entriesOnDisk !== entryCount) fail("multi-disk archives are forbidden");
  if (entryCount > maximumEntries) fail(`${entryCount} entries exceeds the ${maximumEntries}-entry limit`);
  if (eocd + 22 + commentLength !== archive.length) fail("unexpected trailing bytes follow the ZIP comment");
  if (centralOffset + centralSize !== eocd) fail("central-directory bounds are inconsistent");

  const entries = new Map();
  let centralCursor = centralOffset;
  let totalExpandedBytes = 0;
  for (let index = 0; index < entryCount; index += 1) {
    if (archive.readUInt32LE(centralCursor) !== CENTRAL_SIGNATURE) fail(`central entry ${index + 1} has an invalid signature`);
    const flags = archive.readUInt16LE(centralCursor + 8);
    const method = archive.readUInt16LE(centralCursor + 10);
    const expectedCrc = archive.readUInt32LE(centralCursor + 16);
    const compressedBytes = archive.readUInt32LE(centralCursor + 20);
    const expandedBytes = archive.readUInt32LE(centralCursor + 24);
    const nameLength = archive.readUInt16LE(centralCursor + 28);
    const extraLength = archive.readUInt16LE(centralCursor + 30);
    const commentBytes = archive.readUInt16LE(centralCursor + 32);
    const externalAttributes = archive.readUInt32LE(centralCursor + 38);
    const localOffset = archive.readUInt32LE(centralCursor + 42);
    const name = archive.subarray(centralCursor + 46, centralCursor + 46 + nameLength).toString("utf8");
    centralCursor += 46 + nameLength + extraLength + commentBytes;

    assertSafeName(name);
    if (entries.has(name.toLowerCase())) fail(`${name}: duplicate case-insensitive entry name`);
    if (flags & 0x1) fail(`${name}: encrypted entries are forbidden`);
    if (![0, 8].includes(method)) fail(`${name}: compression method ${method} is unsupported`);
    if (expandedBytes > maximumEntryBytes) fail(`${name}: expanded size exceeds the per-entry limit`);
    totalExpandedBytes += expandedBytes;
    if (totalExpandedBytes > maximumExpandedBytes) fail("expanded archive size exceeds the configured limit");
    const ratio = compressedBytes === 0 ? (expandedBytes === 0 ? 1 : Number.POSITIVE_INFINITY) : expandedBytes / compressedBytes;
    if (ratio > maximumCompressionRatio) fail(`${name}: compression ratio ${ratio.toFixed(2)} exceeds the configured limit`);

    const unixMode = externalAttributes >>> 16;
    const fileType = unixMode & 0o170000;
    if (fileType && fileType !== 0o100000 && fileType !== 0o040000) fail(`${name}: special or symbolic-link entries are forbidden`);
    if (archive.readUInt32LE(localOffset) !== LOCAL_SIGNATURE) fail(`${name}: local header signature is invalid`);
    const localNameLength = archive.readUInt16LE(localOffset + 26);
    const localExtraLength = archive.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = archive.subarray(dataOffset, dataOffset + compressedBytes);
    if (compressed.length !== compressedBytes) fail(`${name}: compressed data extends beyond the archive`);
    const content = method === 0 ? Buffer.from(compressed) : zlib.inflateRawSync(compressed, { maxOutputLength: maximumEntryBytes });
    if (content.length !== expandedBytes) fail(`${name}: expanded byte count does not match the central directory`);
    if (crc32(content) !== expectedCrc) fail(`${name}: CRC-32 validation failed`);
    entries.set(name.toLowerCase(), Object.freeze({
      name,
      content,
      compressedBytes,
      expandedBytes,
      crc32: expectedCrc.toString(16).padStart(8, "0")
    }));
  }
  if (centralCursor !== centralOffset + centralSize) fail("central-directory entry lengths do not match its declared size");

  return Object.freeze({
    archivePath: resolved,
    archiveBytes: archive.length,
    entries: Object.freeze([...entries.values()]),
    get(name) {
      return entries.get(name.toLowerCase()) || null;
    },
    totalExpandedBytes
  });
}

module.exports = { crc32, readSafeZip };
