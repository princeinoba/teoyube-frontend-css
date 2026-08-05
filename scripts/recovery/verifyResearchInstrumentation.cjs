"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const registry = require(path.join(root, "config/research-event-registry.json"));
const policy = require(path.join(root, "config/research-field-policy.json"));
const studies = require(path.join(root, "config/research-study-registry.json"));
const packageJson = require(path.join(root, "package.json"));
const failures = [];

const requiredScripts = [
  "research:study:status", "research:session:prepare", "research:event:record",
  "research:session:complete", "research:participant:delete", "research:study:export", "research:verify"
];
for (const script of requiredScripts) if (!packageJson.scripts[script]) failures.push(`missing_script:${script}`);

if (registry.registryVersion !== "teoyube-research-events-2026-08-04.1") failures.push("registry_version");
if (registry.events.length !== 66) failures.push(`registry_count:${registry.events.length}`);
if (new Set(registry.events.map((event) => event.name)).size !== registry.events.length) failures.push("duplicate_event_name");
if (studies.studies.some((study) => study.realParticipantCollectionAuthorized)) failures.push("real_collection_authorized");

const requiredProhibited = [
  "email", "prayerText", "journalText", "reflectionText", "testimonyText", "rawQuery",
  "rawPrompt", "rawModelInput", "rawModelOutput", "scriptureText", "apiKey", "ipAddress",
  "preciseLocation", "holinessScore", "faithScore", "spiritualRank", "divineFavor"
];
for (const field of requiredProhibited) if (!policy.prohibitedFields.includes(field)) failures.push(`prohibited_field_missing:${field}`);

const envTemplate = fs.readFileSync(path.join(root, ".env.example"), "utf8");
if (!envTemplate.includes("TEOYUBE_RESEARCH_MODE_ENABLED=false")) failures.push("research_default_not_false");
if (envTemplate.includes("NEXT_PUBLIC_TEOYUBE_RESEARCH")) failures.push("client_research_flag");

const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
for (const ignored of ["/.var/research/events/", "/.var/research/exports/", "/.var/research/deletions/"]) {
  if (!gitignore.includes(ignored)) failures.push(`missing_ignore:${ignored}`);
}

const forbiddenProductionLocations = ["src/app/research", "src/app/api/research", "public/research"];
for (const location of forbiddenProductionLocations) if (fs.existsSync(path.join(root, location))) failures.push(`forbidden_route:${location}`);

const researchSource = ["src/domain/research", "src/server/research"]
  .flatMap((directory) => fs.readdirSync(path.join(root, directory)).map((file) => path.join(root, directory, file)))
  .filter((file) => file.endsWith(".ts"))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
for (const forbiddenImport of ["react", "next/", "@playwright", "segment", "mixpanel", "amplitude"]) {
  if (researchSource.includes(`from \"${forbiddenImport}`) || researchSource.includes(`require(\"${forbiddenImport}`)) {
    failures.push(`forbidden_import:${forbiddenImport}`);
  }
}

const eventRoot = path.join(root, ".var", "research", "events");
let actualParticipantRecordCount = 0;
if (fs.existsSync(eventRoot)) {
  for (const study of fs.readdirSync(eventRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
    const studyPath = path.join(eventRoot, study.name);
    for (const participant of fs.readdirSync(studyPath, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
      if (!participant.name.startsWith("synthetic-")) actualParticipantRecordCount += 1;
    }
  }
}
if (actualParticipantRecordCount !== 0) failures.push("actual_participant_record_present");

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}

const clientBundleRoot = path.join(root, ".next", "static");
const forbiddenClientResearchMarkers = [
  "teoyube-encrypted-research-event",
  ".var/research/events",
  "TEOYUBE_RESEARCH_STUDY_ID",
  "research-session-envelope"
];
let clientBundleResearchReferenceCount = 0;
for (const file of listFiles(clientBundleRoot).filter((candidate) => candidate.endsWith(".js"))) {
  const content = fs.readFileSync(file, "utf8");
  for (const marker of forbiddenClientResearchMarkers) {
    if (content.includes(marker)) clientBundleResearchReferenceCount += 1;
  }
}
if (clientBundleResearchReferenceCount !== 0) failures.push("research_server_code_in_client_bundle");
const report = {
  schemaVersion: "1.0.0",
  valid: failures.length === 0,
  registryVersion: registry.registryVersion,
  eventCount: registry.events.length,
  studyCount: studies.studies.length,
  actualParticipantRecordCount,
  externalAnalyticsVendor: null,
  normalNavigationResearchRoute: false,
  clientBundleResearchReferenceCount,
  failures
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (!report.valid) process.exitCode = 1;
