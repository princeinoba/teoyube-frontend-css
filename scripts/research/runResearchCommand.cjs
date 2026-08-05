"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const command = process.argv[2] || "status";
const argumentsAfterCommand = new Set(process.argv.slice(3));
const eventRegistry = require(path.join(root, "config/research-event-registry.json"));
const studyRegistry = require(path.join(root, "config/research-study-registry.json"));
const researchRoot = path.join(root, ".var", "research");

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}

function actualParticipantPaths() {
  const eventsRoot = path.join(researchRoot, "events");
  if (!fs.existsSync(eventsRoot)) return [];
  return listFiles(eventsRoot).filter((file) => {
    const relative = path.relative(eventsRoot, file).split(path.sep);
    return relative.length >= 3 && !relative[1].startsWith("synthetic-");
  });
}

function runtimeStatus() {
  const enabled = process.env.TEOYUBE_RESEARCH_MODE_ENABLED === "true";
  const selected = process.env.TEOYUBE_RESEARCH_STUDY_ID || null;
  const studyAllowed = Boolean(selected && studyRegistry.studies.some((study) => study.studyId === selected));
  return {
    schemaVersion: "1.0.0",
    modeEnabled: enabled,
    studyAllowed,
    eventRegistryVersion: eventRegistry.registryVersion,
    eventCount: eventRegistry.events.length,
    localEventFileCount: listFiles(path.join(researchRoot, "events")).length,
    actualParticipantRecordCount: actualParticipantPaths().length,
    collectionAuthorized: false,
    phase: "4B_SYNTHETIC_ONLY"
  };
}

function verify() {
  const status = runtimeStatus();
  const failures = [];
  if (status.eventCount !== 66) failures.push("registry_count");
  if (status.modeEnabled && !status.studyAllowed) failures.push("enabled_unknown_study");
  if (status.actualParticipantRecordCount !== 0) failures.push("actual_participant_record_present");
  if (!fs.readFileSync(path.join(root, ".env.example"), "utf8").includes("TEOYUBE_RESEARCH_MODE_ENABLED=false")) failures.push("default_not_false");
  if (!fs.readFileSync(path.join(root, ".gitignore"), "utf8").includes("/.var/research/events/")) failures.push("event_path_not_ignored");
  const result = { ...status, valid: failures.length === 0, failures };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}

function requireSyntheticConfirmation() {
  if (!argumentsAfterCommand.has("--confirm-synthetic")) {
    throw new Error("Phase 4B permits synthetic dry-runs only; pass --confirm-synthetic explicitly.");
  }
}

function syntheticDryRun(kind) {
  requireSyntheticConfirmation();
  process.stdout.write(`${JSON.stringify({
    schemaVersion: "1.0.0",
    operation: kind,
    status: "SYNTHETIC_DRY_RUN_ONLY",
    persisted: false,
    actualParticipantRecords: 0,
    contactDataAccepted: false,
    rawContentAccepted: false,
    nextAuthority: "Phase 4C owner start"
  }, null, 2)}\n`);
}

try {
  switch (command) {
    case "status":
      process.stdout.write(`${JSON.stringify(runtimeStatus(), null, 2)}\n`);
      break;
    case "verify":
      verify();
      break;
    case "prepare":
    case "record":
    case "complete":
    case "delete-participant":
    case "export-study":
      syntheticDryRun(command);
      break;
    default:
      throw new Error(`Unknown research command: ${command}`);
  }
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Research command failed safely."}\n`);
  process.exitCode = 1;
}
