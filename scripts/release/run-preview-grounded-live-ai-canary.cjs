"use strict";

const runner = require("./preview-grounded-live-ai-resumable-runner.cjs");

if (require.main === module) {
  runner.main().catch((error) => {
    const reasonCode =
      error instanceof runner.RunnerFailure
        ? error.code
        : String(error instanceof Error ? error.message : "PREVIEW_GROUNDED_LIVE_AI_CANARY_FAILED")
            .toUpperCase()
            .replace(/[^A-Z0-9_]+/g, "_")
            .replace(/^_+|_+$/g, "");
    const caseId =
      error instanceof runner.RunnerFailure ? error.caseId : "none";
    process.stderr.write(JSON.stringify({
      status: "FAIL_CLOSED",
      reasonCode: reasonCode || "PREVIEW_GROUNDED_LIVE_AI_CANARY_FAILED",
      caseId,
    }) + "\n");
    process.exitCode = 1;
  });
}

module.exports = runner;
