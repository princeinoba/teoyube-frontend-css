#!/usr/bin/env node
"use strict";
/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("node:path");
const {
  exportRedactedAggregate,
  persistIncident,
  persistSession,
  readInputFile,
  statusFromLocalRecords,
  verifyFromLocalRecords
} = require("./stabilization-toolkit.cjs");

const root = path.resolve(__dirname, "..", "..");
const [command, ...args] = process.argv.slice(2);

function relative(target) {
  return path.relative(root, target).replace(/\\/g, "/");
}

function inputPathFromArgs(values) {
  if (values.length !== 2 || values[0] !== "--file") {
    throw new Error("Use --file <safe-json-path>; raw record content is not accepted on the command line.");
  }
  return path.resolve(process.cwd(), values[1]);
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function run() {
  if (command === "record") {
    const stored = persistSession(root, readInputFile(inputPathFromArgs(args)));
    print({
      command: "stabilization:record",
      created: true,
      stabilizationCompleted: false,
      path: relative(stored.target),
      recordHash: stored.record.recordHash
    });
    return;
  }
  if (command === "incident") {
    const stored = persistIncident(root, readInputFile(inputPathFromArgs(args)));
    print({
      command: "stabilization:incident",
      created: !stored.updated,
      updated: stored.updated,
      automaticallyClosed: false,
      path: relative(stored.target),
      recordHash: stored.record.recordHash
    });
    return;
  }
  if (command === "status") {
    if (args.length) throw new Error("stabilization:status does not accept record content or options.");
    print(statusFromLocalRecords(root));
    return;
  }
  if (command === "verify") {
    if (args.length) throw new Error("stabilization:verify does not accept record content or options.");
    const result = verifyFromLocalRecords(root);
    print(result);
    process.exitCode = result.passed ? 0 : 1;
    return;
  }
  if (command === "export") {
    if (args.length) throw new Error("stabilization:export does not accept record content or options.");
    const exported = exportRedactedAggregate(root);
    print({
      command: "stabilization:export",
      redacted: true,
      path: relative(exported.target),
      aggregateHash: exported.output.aggregateHash
    });
    return;
  }
  throw new Error("Unknown stabilization command.");
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : "Stabilization command failed safely.";
  process.stderr.write(`STABILIZATION_ERROR: ${message}\n`);
  process.exitCode = 1;
}
