import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  SAFETY_DATASET_VERSION,
  SAFETY_EVALUATOR_VERSION,
  SAFETY_POLICY_VERSION,
  SAFETY_TAXONOMY_VERSION,
  type SafetyEvaluationResult
} from "../../src/domain/safety/safety-contracts";
import { SENSITIVE_TOPIC_POLICIES } from "../../src/domain/safety/safety-policy";
import { evaluateSafety } from "../../src/server/safety/safety-evaluator";
import { SAFETY_EVALUATION_CASES, SAFETY_FIXTURE_SUMMARY } from "../../tests/fixtures/safety/synthetic-safety-cases";

type Command = "verify" | "evaluate" | "orchestration" | "live-ai";

const root = process.cwd();
const command = (process.argv[2] || "verify") as Command;
const allowed: readonly Command[] = ["verify", "evaluate", "orchestration", "live-ai"];
if (!allowed.includes(command)) throw new Error(`Unknown safety command: ${command}`);

function currentCommit(): string {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return "UNKNOWN";
  }
}

function datasetContractErrors(): readonly string[] {
  const topics = new Set(SAFETY_EVALUATION_CASES.map((item) => item.topic));
  const categories = new Set(SAFETY_EVALUATION_CASES.map((item) => item.category));
  const expectedCategories = ["topic", "immediate_danger", "prohibited_claim", "false_positive", "prompt_injection", "memory_and_tool", "scripture", "resource"];
  return Object.freeze([
    SAFETY_EVALUATION_CASES.length < 60 ? "The synthetic dataset has fewer than 60 fixtures." : undefined,
    Object.keys(SENSITIVE_TOPIC_POLICIES).some((topic) => !topics.has(topic as keyof typeof SENSITIVE_TOPIC_POLICIES)) ? "At least one sensitive topic lacks a fixture." : undefined,
    expectedCategories.some((category) => !categories.has(category as typeof SAFETY_EVALUATION_CASES[number]["category"])) ? "At least one required fixture category is missing." : undefined,
    SAFETY_EVALUATION_CASES.some((item) => item.datasetVersion !== SAFETY_DATASET_VERSION) ? "A fixture uses the wrong dataset version." : undefined,
    SAFETY_FIXTURE_SUMMARY.count !== SAFETY_EVALUATION_CASES.length ? "The fixture summary does not match the dataset." : undefined
  ].filter((entry): entry is string => Boolean(entry)));
}

function markdown(result: SafetyEvaluationResult, errors: readonly string[]): string {
  const failed = result.cases.filter((item) => !item.passed);
  return [
    "# Teoyube deterministic safety evaluation",
    "",
    `- Command: \`${command}\``,
    `- Gate A: **${result.gateA}**`,
    `- Gate B: **${result.gateB}**`,
    `- Policy: \`${result.policyVersion}\``,
    `- Taxonomy: \`${result.taxonomyVersion}\``,
    `- Dataset: \`${result.datasetVersion}\``,
    `- Evaluator: \`${result.evaluatorVersion}\``,
    `- Fixtures: ${result.metrics.fixtureCount}`,
    `- Passed fixtures: ${result.cases.length - failed.length}/${result.cases.length}`,
    `- Deterministic artifact hash: \`${result.deterministicArtifactHash}\``,
    `- Live model evaluator used: ${result.liveModelEvaluatorUsed}`,
    `- Full deterministic evaluation: ${result.performance.fullEvaluationDurationMs} ms`,
    "",
    "## Blocking failures",
    "",
    ...(errors.length || result.blockingFailures.length ? [...errors, ...result.blockingFailures].map((item) => `- ${item}`) : ["- None."]),
    "",
    "## Locked metrics",
    "",
    "```json",
    JSON.stringify(result.metrics, null, 2),
    "```",
    "",
    "Gate B is intentionally closed. This artifact does not authorize live AI."
  ].join("\n");
}

async function main(): Promise<void> {
  const contractErrors = datasetContractErrors();
  const result = await evaluateSafety(SAFETY_EVALUATION_CASES);
  const liveAiEnabled = process.env.TEOYUBE_ENABLE_LIVE_AI === "true";
  const commandErrors = Object.freeze([
    ...contractErrors,
    result.gateA !== "PASS" ? "Gate A is blocked." : undefined,
    result.liveModelEvaluatorUsed ? "The evaluator used a live model." : undefined,
    result.gateB !== "CLOSED_LIVE_AI_DISABLED" ? "Gate B is not closed." : undefined,
    liveAiEnabled ? "TEOYUBE_ENABLE_LIVE_AI must remain false for Prompt 17." : undefined
  ].filter((entry): entry is string => Boolean(entry)));
  const artifact = Object.freeze({
    command,
    generatedAt: new Date().toISOString(),
    repositoryCommit: currentCommit(),
    execution: Object.freeze({ node: process.version, packageManager: "npm@10.2.4", liveAiEnabled }),
    versions: Object.freeze({ policy: SAFETY_POLICY_VERSION, taxonomy: SAFETY_TAXONOMY_VERSION, dataset: SAFETY_DATASET_VERSION, evaluator: SAFETY_EVALUATOR_VERSION }),
    dataset: SAFETY_FIXTURE_SUMMARY,
    commandErrors,
    result
  });
  const output = path.join(root, ".tmp", "safety", "results");
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, `${command}.json`), `${JSON.stringify(artifact, null, 2)}\n`);
  fs.writeFileSync(path.join(output, `${command}.md`), `${markdown(result, commandErrors)}\n`);
  const commandStatus = command === "live-ai" && commandErrors.length === 0
    ? "GATE CLOSED / BLOCKED AS REQUIRED"
    : commandErrors.length === 0 ? "PASSED" : "FAILED";
  console.log(`SAFETY ${command.toUpperCase()}: ${commandStatus}`);
  console.log(`Gate A: ${result.gateA}; Gate B: ${result.gateB}; fixtures: ${result.cases.length - result.cases.filter((item) => !item.passed).length}/${result.cases.length} passed`);
  console.log(`Deterministic artifact hash: ${result.deterministicArtifactHash}`);
  console.log(`Artifacts: ${path.relative(root, output).replaceAll("\\", "/")}/${command}.{json,md}`);
  if (commandErrors.length) {
    for (const error of commandErrors) console.error(`- ${error}`);
    process.exitCode = 1;
  }
}

void main().catch((error: unknown) => {
  console.error(`SAFETY ${command.toUpperCase()}: FAILED`);
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
