import { createCipheriv, createDecipheriv } from "node:crypto";

export type EncryptionKeyRing = Readonly<{
  activeVersion: string;
  keys: ReadonlyMap<string, Uint8Array>;
}>;

export type EncryptedPayload = Readonly<{
  ciphertext: string;
  nonce: string;
  authTag: string;
  keyVersion: string;
}>;

function keyFor(ring: EncryptionKeyRing, version: string): Buffer {
  const key = ring.keys.get(version);
  if (!key || key.byteLength !== 32) throw new Error("Sensitive content encryption is unavailable.");
  return Buffer.from(key);
}

export function createKeyRing(activeVersion: string, encodedKeys: Readonly<Record<string, string>>): EncryptionKeyRing {
  const keys = new Map<string, Uint8Array>();
  for (const [version, encoded] of Object.entries(encodedKeys)) {
    const value = Buffer.from(encoded, "base64");
    if (value.byteLength !== 32) throw new Error("Each memory encryption key must decode to exactly 32 bytes.");
    keys.set(version, value);
  }
  keyFor({ activeVersion, keys }, activeVersion);
  return Object.freeze({ activeVersion, keys });
}

export function encryptMemoryContent(content: Readonly<Record<string, unknown>>, aad: string, ring: EncryptionKeyRing, nonceBytes: Uint8Array): EncryptedPayload {
  if (nonceBytes.byteLength !== 12) throw new Error("The encryption nonce must be 12 bytes.");
  const cipher = createCipheriv("aes-256-gcm", keyFor(ring, ring.activeVersion), nonceBytes);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(content), "utf8"), cipher.final()]);
  return Object.freeze({
    ciphertext: ciphertext.toString("base64"),
    nonce: Buffer.from(nonceBytes).toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    keyVersion: ring.activeVersion
  });
}

export function decryptMemoryContent(payload: EncryptedPayload, aad: string, ring: EncryptionKeyRing): Readonly<Record<string, unknown>> {
  try {
    const decipher = createDecipheriv("aes-256-gcm", keyFor(ring, payload.keyVersion), Buffer.from(payload.nonce, "base64"));
    decipher.setAAD(Buffer.from(aad, "utf8"));
    decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
    const plaintext = Buffer.concat([decipher.update(Buffer.from(payload.ciphertext, "base64")), decipher.final()]);
    const parsed: unknown = JSON.parse(plaintext.toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid encrypted content.");
    return Object.freeze(parsed as Record<string, unknown>);
  } catch {
    throw new Error("Sensitive content could not be decrypted with the configured key version.");
  }
}
