import path from "node:path";
import { OpenAiEmbeddingGateway } from "../../src/server/retrieval/openai-embedding-gateway";
import { PublicIndexPipeline } from "../../src/server/retrieval/public-index-pipeline";
import {
  readRetrievalRuntimeConfiguration
} from "../../src/server/retrieval/retrieval-config";
import { SqliteVectorRepository } from "../../src/server/retrieval/sqlite-vector-repository";

type Command = "inventory" | "estimate" | "index-public" | "verify" | "rollback";

function safeSummary(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const record = value as Readonly<Record<string, unknown>>;
  return Object.freeze({
    ...record,
    chunks: undefined,
    sources:
      Array.isArray(record.sources)
        ? Object.freeze(
            record.sources.map((source) => {
              const item = source as Readonly<Record<string, unknown>>;
              return Object.freeze({
                sourceId: item.sourceId,
                partitions: item.partitions,
                documentCount: item.documentCount,
                chunkCount: item.chunkCount,
                estimatedTokens: item.estimatedTokens
              });
            })
          )
        : record.sources
  });
}

async function main(): Promise<void> {
  const command = process.argv[2] as Command | undefined;
  if (!command || !new Set<Command>(["inventory", "estimate", "index-public", "verify", "rollback"]).has(command)) {
    throw new Error("Unknown retrieval command.");
  }
  const root = process.cwd();
  const configuration = readRetrievalRuntimeConfiguration();
  const databasePath =
    process.env.TEOYUBE_RETRIEVAL_DATABASE_PATH?.trim() ||
    path.join(root, ".var", "retrieval", "retrieval.sqlite");
  const pipeline = new PublicIndexPipeline({ rootDirectory: root });
  if (command === "inventory") {
    console.log(JSON.stringify(safeSummary(pipeline.inventory()), null, 2));
    return;
  }
  if (command === "estimate") {
    console.log(JSON.stringify(pipeline.estimate(), null, 2));
    return;
  }
  const repository = new SqliteVectorRepository(databasePath);
  try {
    if (command === "index-public") {
      const authorized =
        process.env.TEOYUBE_PROMPT20_INDEX_AUTHORIZED?.trim().toLowerCase() === "true";
      if (!configuration.embeddingEnabled) {
        throw new Error("Embedding generation is disabled or its server-only credentials are unavailable.");
      }
      const result = await pipeline.build(
        repository,
        new OpenAiEmbeddingGateway(),
        authorized
      );
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    if (command === "verify") {
      console.log(JSON.stringify(await pipeline.verify(repository), null, 2));
      return;
    }
    await pipeline.rollback(repository);
    console.log(JSON.stringify({ status: "rolled_back" }, null, 2));
  } finally {
    repository.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Retrieval command failed.";
  console.error(`RETRIEVAL COMMAND FAILED: ${message}`);
  process.exitCode = 1;
});
