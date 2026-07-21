import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { UserMemoryService } from "../../features/memory/application/user-memory-service";
import { IdentityService } from "../identity/identity-service";
import { LocalDevelopmentIdentityProvider } from "../identity/local-development-identity";
import { SqliteSessionRepository } from "../identity/sqlite-session-repository";
import { createKeyRing } from "./encryption";
import { readMemoryRuntimeConfig } from "./memory-runtime-config";
import { openTeoyubeDatabase, type TeoyubeDatabase } from "./sqlite-database";
import { SqliteConsentMemoryStore } from "./sqlite-consent-memory-store";

export type MemoryRuntime = Readonly<{
  identity: IdentityService;
  memory: UserMemoryService;
  database: TeoyubeDatabase;
  close(): void;
}>;

let singleton: MemoryRuntime | null | undefined;

export function getMemoryRuntime(): MemoryRuntime | null {
  if (singleton !== undefined) return singleton;
  const config = readMemoryRuntimeConfig();
  if (!config) {
    singleton = null;
    return singleton;
  }
  const databasePath = config.databasePath === ":memory:" ? ":memory:" : resolve(config.databasePath);
  if (databasePath !== ":memory:") mkdirSync(dirname(databasePath), { recursive: true });
  const database = openTeoyubeDatabase(databasePath);
  const store = new SqliteConsentMemoryStore(database, createKeyRing(config.activeKeyVersion, config.encryptionKeys));
  const sessions = new SqliteSessionRepository(database, config.sessionPepper);
  const identity = new IdentityService(new LocalDevelopmentIdentityProvider(config.localCredentials, config.environment === "test" ? "test" : "development"), sessions);
  const memory = new UserMemoryService(store, store, store);
  singleton = Object.freeze({ identity, memory, database, close: () => database.close() });
  return singleton;
}

export function closeMemoryRuntime(): void {
  singleton?.close();
  singleton = undefined;
}
