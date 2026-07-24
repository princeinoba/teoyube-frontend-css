import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    files: [
      "src/lib/tig/**/*.{ts,tsx}",
      "src/lib/teoyube/{calling,journey,language,promises,theology}/**/*.{ts,tsx}"
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "Domain and application modules must not depend on React." },
            { name: "next", message: "Domain and application modules must not depend on Next.js." }
          ],
          patterns: [
            { group: ["next/*"], message: "Domain and application modules must not depend on Next.js." }
          ]
        }
      ]
    }
  },
  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/tig/seed/*", "src/lib/tig/seed/*", "**/tig/seed/*"],
              message: "UI code must not import TIG seed internals. Use a controller or application service."
            },
            {
              group: ["@prisma/*", "firebase-admin", "openai", "@anthropic-ai/*"],
              message: "UI code must not import database or model-provider SDKs."
            }
          ]
        }
      ]
    }
  },
  {
    files: ["scripts/release/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  globalIgnores([
    ".next/**",
    ".tmp/**",
    "archive/**",
    "coverage/**",
    "generated/**",
    "media-source/**",
    "node_modules/**",
    "playwright-report/**",
    "public/**",
    "test-results/**",
    "tests/visual/baselines/**",
    "next-env.d.ts"
  ])
]);
