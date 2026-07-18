#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "../..");
const contractPath = path.join(projectRoot, "tests/visual/contracts/static-dom-contract.json");
const htmlPath = path.join(projectRoot, "index.html");

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function uniqueInOrder(values) {
  const seen = new Set();
  return values.filter((value) => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function extractAttributeValues(html, attribute) {
  const values = [];
  const expression = new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "gi");
  for (const match of html.matchAll(expression)) values.push(match[1]);
  return values;
}

function extractStylesheets(html) {
  const result = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/\brel\s*=\s*["']stylesheet["']/i.test(tag)) continue;
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (href) result.push(href);
  }
  return result;
}

function extractScripts(html) {
  const result = [];
  for (const match of html.matchAll(/<script\b[^>]*>/gi)) {
    const src = match[0].match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    if (src) result.push(src);
  }
  return result;
}

function sameArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function fail(message) {
  console.error(`DOM CONTRACT FAILURE: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(contractPath) || !fs.existsSync(htmlPath)) {
  fail("static DOM contract or index.html is missing");
  process.exit();
}

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const html = fs.readFileSync(htmlPath, "utf8");
const htmlHash = sha256(html);

if (htmlHash !== contract.sourceSha256) {
  fail(`index.html changed (expected ${contract.sourceSha256}, received ${htmlHash})`);
}

const actualIds = extractAttributeValues(html, "id");
const actualClasses = uniqueInOrder(
  extractAttributeValues(html, "class").flatMap((value) => value.trim().split(/\s+/).filter(Boolean))
).sort();
const expectedClasses = [...(contract.requiredClassNames || [])].sort();

if (!sameArray(actualIds, contract.requiredIds || [])) {
  fail("ordered ID inventory changed");
}
if (!sameArray(actualClasses, expectedClasses)) {
  fail("class-name inventory changed");
}
if (!sameArray(extractStylesheets(html), contract.stylesheetOrder || [])) {
  fail("stylesheet order or hrefs changed");
}
if (!sameArray(extractScripts(html), contract.scriptOrder || [])) {
  fail("script order or src values changed");
}

if (process.exitCode) {
  console.error(
    "The original DOM hierarchy, IDs, class names, and asset-loading order are protected. Restore them or request scoped owner approval."
  );
  process.exit();
}

console.log(
  `Static DOM contract passed: ${(contract.requiredIds || []).length} IDs, ` +
    `${(contract.requiredClassNames || []).length} class names, ` +
    `${(contract.stylesheetOrder || []).length} stylesheets.`
);
