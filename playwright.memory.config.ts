import { defineConfig } from "@playwright/test";

const baseURL = process.env.TEOYUBE_MEMORY_E2E_BASE_URL || "http://127.0.0.1:3116";

export default defineConfig({
  testDir: "./tests/e2e-memory",
  outputDir: "./.tmp/prompt16-e2e/playwright-results",
  reporter: [["list"]],
  workers: 1,
  use: { baseURL }
});
