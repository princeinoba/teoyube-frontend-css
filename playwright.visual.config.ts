import { defineConfig } from "@playwright/test";

const updateRequested = process.argv.some(
  (argument) => argument === "--update-snapshots" || argument.startsWith("--update-snapshots=")
);
if (updateRequested || process.env.UPDATE_SNAPSHOTS) {
  throw new Error(
    "Owner visual baselines are immutable. Snapshot updates require a current-task owner approval ID and a separate approved workflow."
  );
}

export default defineConfig({
  testDir: "./tests/visual/parity",
  outputDir: "./.tmp/visual-parity/playwright-results",
  forbidOnly: Boolean(process.env.CI),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: ".tmp/visual-parity/report" }]],
  use: {
    browserName: "chromium",
    channel: process.platform === "win32" ? "chrome" : undefined,
    colorScheme: "light",
    deviceScaleFactor: 1,
    headless: true,
    locale: "en-US",
    screenshot: "off",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "static-reproducibility",
      testMatch: /static-reproducibility\.spec\.ts/
    },
    {
      name: "next-candidate-contract",
      testMatch: /next-preview\.spec\.ts/
    },
    {
      name: "shell-parity",
      testMatch: /shell-parity\.spec\.ts/
    },
    {
      name: "today-parity",
      testMatch: /today-parity\.spec\.ts/
    },
    {
      name: "search-parity",
      testMatch: /search-parity\.spec\.ts/
    },
    {
      name: "canon-promise-parity",
      testMatch: /canon-promise-parity\.spec\.ts/
    },
    {
      name: "prayer-calling-journey-parity",
      testMatch: /prayer-calling-journey-parity\.spec\.ts/
    },
    {
      name: "journal-testimony-book-parity",
      testMatch: /journal-testimony-book-parity\.spec\.ts/
    },
    {
      name: "remaining-retained-parity",
      testMatch: /remaining-retained-parity\.spec\.ts/
    }
  ]
});
