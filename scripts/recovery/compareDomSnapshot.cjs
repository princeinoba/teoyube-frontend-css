"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const view = getArg("--view");
const candidateArg = getArg("--candidate");
if (!view || !candidateArg) {
  console.error("Usage: node scripts/recovery/compareDomSnapshot.cjs --view <static-view-id> --candidate <candidate.dom.json>");
  process.exit(2);
}

const baselinePath = path.join(root, `tests/visual/baselines/static-runtime/desktop-wide/${view}.dom.json`);
const candidatePath = path.resolve(root, candidateArg);
if (!fs.existsSync(baselinePath)) {
  console.error(`Missing baseline DOM snapshot: ${baselinePath}`);
  process.exit(1);
}
if (!fs.existsSync(candidatePath)) {
  console.error(`Missing candidate DOM snapshot: ${candidatePath}`);
  process.exit(1);
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const candidate = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
const failures = [];

function elementSignature(element) {
  return {
    tag: element.tag || "",
    id: element.id || "",
    classes: [...(element.classes || [])],
    role: element.role || "",
    ariaLabel: element.ariaLabel || "",
    dataView: element.dataView || "",
    dataAction: element.dataAction || "",
    src: element.src || "",
    href: element.href || ""
  };
}

const baselineElements = baseline.elements || [];
const candidateElements = candidate.elements || [];
if (baselineElements.length !== candidateElements.length) {
  failures.push(`Element count differs: baseline=${baselineElements.length}, candidate=${candidateElements.length}`);
}

const max = Math.max(baselineElements.length, candidateElements.length);
for (let index = 0; index < max; index += 1) {
  const left = baselineElements[index];
  const right = candidateElements[index];
  if (!left || !right) continue;
  const leftSignature = elementSignature(left);
  const rightSignature = elementSignature(right);
  if (JSON.stringify(leftSignature) !== JSON.stringify(rightSignature)) {
    failures.push(
      `DOM mismatch at element ${index}: baseline=${JSON.stringify(leftSignature)} candidate=${JSON.stringify(rightSignature)}`
    );
    if (failures.length >= 25) break;
  }
}

if (failures.length) {
  console.error(`DOM/CLASS PARITY FAILED for ${view}`);
  for (const failure of failures) console.error(`- ${failure}`);
  console.error("Do not change the baseline or weaken comparison rules without explicit owner approval.");
  process.exit(1);
}

console.log(`DOM/CLASS PARITY PASSED for ${view}`);
console.log(`Elements compared: ${baselineElements.length}`);
