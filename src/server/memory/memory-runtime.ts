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
import { readRetrievalRuntimeConfiguration } from "../retrieval/retrieval-config";
import { SqliteVectorRepository } from "../retrieval/sqlite-vector-repository";
import { ConsentVectorLifecycleService } from "../retrieval/user-vector-index-service";

export type MemoryRuntime = Readonly<{
  identity: IdentityService;
  memory: UserMemoryService;
  database: TeoyubeDatabase;
  vectorRepository?: SqliteVectorRepository;
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
  const keyRing = createKeyRing(config.activeKeyVersion, config.encryptionKeys);
  const store = new SqliteConsentMemoryStore(database, keyRing);
  const sessions = new SqliteSessionRepository(database, config.sessionPepper);
  const identity = new IdentityService(new LocalDevelopmentIdentityProvider(config.localCredentials, config.environment === "test" ? "test" : "development"), sessions);
  const retrieval = readRetrievalRuntimeConfiguration();
  const vectorRepository = retrieval.vectorRetrievalEnabled
    ? new SqliteVectorRepository(retrieval.databasePath, keyRing)
    : undefined;
  const derivatives = vectorRepository
    ? new ConsentVectorLifecycleService(vectorRepository)
    : undefined;
  const memory = new UserMemoryService(
    store,
    store,
    store,
    undefined,
    undefined,
    derivatives
  );
  singleton = Object.freeze({
    identity,
    memory,
    database,
    ...(vectorRepository ? { vectorRepository } : {}),
    close: () => {
      vectorRepository?.close();
      database.close();
    }
  });
  return singleton;
}

export function closeMemoryRuntime(): void {
  singleton?.close();
  singleton = undefined;
}
