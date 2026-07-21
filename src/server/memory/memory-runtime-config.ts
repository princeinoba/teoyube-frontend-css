import { z } from "zod";
import type { UserRole } from "../../domain/identity/identity-contracts";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  TEOYUBE_ENABLE_DURABLE_MEMORY: z.literal("true"),
  TEOYUBE_IDENTITY_MODE: z.enum(["local_development", "production_provider"]).default("local_development"),
  TEOYUBE_MEMORY_DATABASE_PATH: z.string().trim().min(1),
  TEOYUBE_MEMORY_ENCRYPTION_KEYS: z.string().trim().min(1),
  TEOYUBE_MEMORY_ACTIVE_KEY_VERSION: z.string().trim().min(1).max(64),
  TEOYUBE_SESSION_PEPPER: z.string().min(32),
  TEOYUBE_LOCAL_IDENTITY_CREDENTIALS: z.string().trim().min(2).default("{}")
});

export type MemoryRuntimeConfig = Readonly<{
  environment: "development" | "test" | "production";
  identityMode: "local_development" | "production_provider";
  databasePath: string;
  encryptionKeys: Readonly<Record<string, string>>;
  activeKeyVersion: string;
  sessionPepper: string;
  localCredentials: ReadonlyMap<string, Readonly<{ subject: string; role: UserRole }>>;
}>;

function object(value: string, label: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`${label} must be a JSON object.`);
  return parsed as Record<string, unknown>;
}

export function readMemoryRuntimeConfig(environment: NodeJS.ProcessEnv = process.env): MemoryRuntimeConfig | null {
  if (environment.TEOYUBE_ENABLE_DURABLE_MEMORY !== "true") return null;
  const parsed = configSchema.parse(environment);
  if (parsed.NODE_ENV === "production" && parsed.TEOYUBE_IDENTITY_MODE === "local_development") return null;
  if (parsed.TEOYUBE_IDENTITY_MODE === "production_provider") return null;
  const encryptionSource = object(parsed.TEOYUBE_MEMORY_ENCRYPTION_KEYS, "Memory encryption keys");
  const encryptionKeys: Record<string, string> = {};
  for (const [version, encoded] of Object.entries(encryptionSource)) {
    if (typeof encoded !== "string") throw new Error("Memory encryption keys must be base64 strings.");
    encryptionKeys[version] = encoded;
  }
  const credentialSource = object(parsed.TEOYUBE_LOCAL_IDENTITY_CREDENTIALS, "Local identity credentials");
  const localCredentials = new Map<string, Readonly<{ subject: string; role: UserRole }>>();
  for (const [credential, item] of Object.entries(credentialSource)) {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("Local identity entries are invalid.");
    const candidate = item as Record<string, unknown>;
    if (typeof candidate.subject !== "string" || !["user", "owner", "admin"].includes(String(candidate.role))) throw new Error("Local identity entries require a subject and role.");
    localCredentials.set(credential, Object.freeze({ subject: candidate.subject, role: candidate.role as UserRole }));
  }
  return Object.freeze({ environment: parsed.NODE_ENV, identityMode: parsed.TEOYUBE_IDENTITY_MODE, databasePath: parsed.TEOYUBE_MEMORY_DATABASE_PATH, encryptionKeys: Object.freeze(encryptionKeys), activeKeyVersion: parsed.TEOYUBE_MEMORY_ACTIVE_KEY_VERSION, sessionPepper: parsed.TEOYUBE_SESSION_PEPPER, localCredentials });
}
