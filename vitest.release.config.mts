import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const sourceRoot = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": sourceRoot
    }
  },
  test: {
    environment: "node",
    include: ["tests/build-foundation/**/*.test.ts"],
    exclude: ["tests/build-foundation/scripture-retrieval-performance.test.ts"],
    testTimeout: 20_000,
    coverage: {
      provider: "v8",
      all: true,
      reportsDirectory: ".tmp/release-evidence/coverage",
      reporter: ["text", "json", "json-summary"],
      include: [
        "src/domain/journey/**/*.ts",
        "src/domain/live-ai/**/*.ts",
        "src/domain/memory/**/*.ts",
        "src/domain/observability/**/*.ts",
        "src/domain/product-value/**/*.ts",
        "src/domain/retrieval/**/*.ts",
        "src/domain/safety/**/*.ts",
        "src/domain/scripture/**/*.ts",
        "src/domain/teo-guide/**/*.ts",
        "src/domain/tig/**/*.ts",
        "src/features/journey/**/*.ts",
        "src/features/memory/**/*.ts",
        "src/features/retrieval/**/*.ts",
        "src/server/identity/**/*.ts",
        "src/server/live-ai/**/*.ts",
        "src/server/memory/**/*.ts",
        "src/server/observability/**/*.ts",
        "src/server/retrieval/**/*.ts",
        "src/server/safety/**/*.ts",
        "src/server/scripture/**/*.ts",
        "src/server/teo-guide/**/*.ts",
        "src/server/tig/**/*.ts"
      ],
      exclude: [
        "**/*.d.ts",
        "**/index.ts",
        "**/corpora/**",
        "**/third-party/**"
      ],
      thresholds: {
        statements: 35,
        branches: 30
      }
    }
  }
});
