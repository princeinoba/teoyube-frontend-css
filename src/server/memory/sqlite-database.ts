import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const MIGRATIONS = Object.freeze([
  Object.freeze({ version: 1, name: "identity_consent_memory", file: "001_identity_consent_memory.sql" }),
  Object.freeze({ version: 2, name: "retention_indexes", file: "002_retention_indexes.sql" })
]);

export type TeoyubeDatabase = DatabaseSync;

export function openTeoyubeDatabase(location: string): TeoyubeDatabase {
  const database = new DatabaseSync(location, { enableForeignKeyConstraints: true });
  applyMigrations(database, new Date().toISOString());
  return database;
}

export function applyMigrations(database: TeoyubeDatabase, appliedAt: string): number {
  database.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, applied_at TEXT NOT NULL)");
  const sourceMigrationDirectory = join(process.cwd(), "src", "server", "memory", "migrations");
  const migrationDirectory = existsSync(sourceMigrationDirectory)
    ? sourceMigrationDirectory
    : join(dirname(fileURLToPath(import.meta.url)), "migrations");
  let applied = 0;
  for (const migration of MIGRATIONS) {
    const existing = database.prepare("SELECT version FROM schema_migrations WHERE version = ?").get(migration.version);
    if (existing) continue;
    const sql = readFileSync(join(migrationDirectory, migration.file), "utf8");
    database.exec("BEGIN IMMEDIATE");
    try {
      database.exec(sql);
      database.prepare("INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)").run(migration.version, migration.name, appliedAt);
      database.exec("COMMIT");
      applied += 1;
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }
  return applied;
}

export function withImmediateTransaction<T>(database: TeoyubeDatabase, operation: () => T): T {
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = operation();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export const MEMORY_MIGRATION_COUNT = MIGRATIONS.length;
