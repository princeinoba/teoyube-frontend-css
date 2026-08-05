#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const files = {
  app: "app.js",
  lexicon: "src/app/_lexicon/LexiconPageController.tsx",
  today: "src/app/_today/ApprovedTodayView.tsx",
  approved: "src/app/_approved-source/approved-view-markup.generated.ts"
};

function absolute(relativePath) { return path.join(root, relativePath); }
function read(relativePath) { return fs.readFileSync(absolute(relativePath), "utf8"); }
function write(relativePath, text) { fs.writeFileSync(absolute(relativePath), text, "utf8"); }
function count(text, needle) { return text.split(needle).length - 1; }
function sha256(value) { return crypto.createHash("sha256").update(value).digest("hex"); }

function approvedSourceDigest(appSource) {
  const hash = crypto.createHash("sha256");
  for (const [relativePath, content] of [["index.html", read("index.html")], ["app.js", appSource], ["phase116b1.js", read("phase116b1.js")]]) {
    hash.update(relativePath);
    hash.update(content);
  }
  return hash.digest("hex");
}

function replaceExact(text, before, after, expectedCount, label) {
  const occurrences = count(text, before);
  if (occurrences !== expectedCount) throw new Error(`${label}: expected ${expectedCount} occurrence(s), found ${occurrences}.`);
  return text.split(before).join(after);
}

function analyze() {
  const approved = read(files.approved);
  const report = {
    app: {
      lexiconPressed: count(read(files.app), ' aria-pressed="${isActive}"'),
      promiseHidden: count(read(files.app), 'aria-hidden="${index === activePromiseSlide ? "false" : "true"}">'),
      featuredHidden: count(read(files.app), 'aria-hidden="${active ? "false" : "true"}"\n              style="--featured-image'),
      canonHiddenCopy: count(read(files.app), 'class="canon-watchman-story-copy" aria-hidden="true"')
    },
    next: {
      lexiconPressedUpdater: count(read(files.lexicon), '          button.setAttribute("aria-pressed", String(active));\n'),
      promiseHidden: count(read(files.today), '<article className={`carousel-slide ${active ? "active" : ""}`} aria-hidden={active ? "false" : "true"} key={slide.title}>'),
      featuredHidden: count(read(files.today), '<article className={`featured-story-slide ${active ? "active" : ""}`} aria-hidden={active ? "false" : "true"} style={{ "--featured-image": `url(\'${story.image}\')` } as CustomProperties} key={story.id}>'),
      approvedLexiconPressed: (approved.match(/role=\\"option\\" aria-selected=\\"(?:true|false)\\" aria-pressed=\\"(?:true|false)\\"/g) || []).length,
      approvedCanonHiddenCopy: count(approved, 'class=\\"canon-watchman-story-copy\\" aria-hidden=\\"true\\">'),
      sourceDigest: approved.match(/"sourceDigest":"([a-f0-9]{64})"/)?.[1] || null
    }
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

function apply() {
  const before = analyze();
  if (JSON.stringify(before.app) !== JSON.stringify({ lexiconPressed: 1, promiseHidden: 1, featuredHidden: 1, canonHiddenCopy: 1 })) throw new Error("Static source occurrence contract differs.");
  if (before.next.lexiconPressedUpdater !== 1 || before.next.promiseHidden !== 1 || before.next.featuredHidden !== 1 || before.next.approvedLexiconPressed !== 27 || before.next.approvedCanonHiddenCopy < 1) throw new Error("Next source occurrence contract differs.");

  let app = read(files.app);
  app = replaceExact(app, ' aria-pressed="${isActive}"', "", 1, "A11Y-001 static aria-pressed");
  app = replaceExact(app, 'aria-hidden="${index === activePromiseSlide ? "false" : "true"}">', 'aria-hidden="${index === activePromiseSlide ? "false" : "true"}"${index === activePromiseSlide ? "" : " inert"}>', 1, "A11Y-002 static promise inert");
  app = replaceExact(app, 'aria-hidden="${active ? "false" : "true"}"\n              style="--featured-image', 'aria-hidden="${active ? "false" : "true"}"\n              ${active ? "" : "inert"}\n              style="--featured-image', 1, "A11Y-002 static featured-story inert");
  app = replaceExact(app, 'class="canon-watchman-story-copy" aria-hidden="true"', 'class="canon-watchman-story-copy" aria-hidden="true" inert', 1, "A11Y-004 static Canon inert");
  write(files.app, app);

  let lexicon = read(files.lexicon);
  lexicon = replaceExact(lexicon, '          button.setAttribute("aria-pressed", String(active));\n', "", 1, "A11Y-001 Next updater");
  write(files.lexicon, lexicon);

  let today = read(files.today);
  today = replaceExact(today, '<article className={`carousel-slide ${active ? "active" : ""}`} aria-hidden={active ? "false" : "true"} key={slide.title}>', '<article className={`carousel-slide ${active ? "active" : ""}`} aria-hidden={active ? "false" : "true"} inert={!active} key={slide.title}>', 1, "A11Y-002 Next promise inert");
  today = replaceExact(today, '<article className={`featured-story-slide ${active ? "active" : ""}`} aria-hidden={active ? "false" : "true"} style={{ "--featured-image": `url(\'${story.image}\')` } as CustomProperties} key={story.id}>', '<article className={`featured-story-slide ${active ? "active" : ""}`} aria-hidden={active ? "false" : "true"} inert={!active} style={{ "--featured-image": `url(\'${story.image}\')` } as CustomProperties} key={story.id}>', 1, "A11Y-002 Next featured-story inert");
  write(files.today, today);

  let approved = read(files.approved);
  const beforeDigest = approved.match(/"sourceDigest":"([a-f0-9]{64})"/)?.[1];
  if (!beforeDigest) throw new Error("Approved markup source digest is missing.");
  approved = approved.replace(/role=\\"option\\" aria-selected=\\"(true|false)\\" aria-pressed=\\"(?:true|false)\\"/g, 'role=\\"option\\" aria-selected=\\"$1\\"');
  approved = replaceExact(approved, 'class=\\"canon-watchman-story-copy\\" aria-hidden=\\"true\\"', 'class=\\"canon-watchman-story-copy\\" aria-hidden=\\"true\\" inert', before.next.approvedCanonHiddenCopy, "A11Y-004 approved Canon capture inert");
  const afterDigest = approvedSourceDigest(app);
  approved = replaceExact(approved, `"sourceDigest":"${beforeDigest}"`, `"sourceDigest":"${afterDigest}"`, 1, "Approved source digest");
  write(files.approved, approved);

  const result = { status: "APPLIED", issues: ["A11Y-001", "A11Y-002", "A11Y-004"], approvedCanonCaptureOccurrences: before.next.approvedCanonHiddenCopy, approvedSourceDigest: { before: beforeDigest, after: afterDigest }, files: Object.values(files).map((relativePath) => ({ path: relativePath, bytes: fs.statSync(absolute(relativePath)).size, sha256: sha256(fs.readFileSync(absolute(relativePath))) })) };
  console.log(JSON.stringify(result, null, 2));
}

function verify() {
  const state = analyze();
  const errors = [];
  if (state.app.lexiconPressed || state.next.lexiconPressedUpdater || state.next.approvedLexiconPressed) errors.push("A11Y-001 aria-pressed remains.");
  if (count(read(files.app), '${index === activePromiseSlide ? "" : " inert"}') !== 1 || count(read(files.app), '${active ? "" : "inert"}') !== 1 || count(read(files.today), "inert={!active}") !== 2) errors.push("A11Y-002 inert source contract mismatch.");
  if (count(read(files.app), 'class="canon-watchman-story-copy" aria-hidden="true" inert') !== 1 || state.next.approvedCanonHiddenCopy !== 0 || !read(files.approved).includes('class=\\"canon-watchman-story-copy\\" aria-hidden=\\"true\\" inert')) errors.push("A11Y-004 inert source contract mismatch.");
  if (state.next.sourceDigest !== approvedSourceDigest(read(files.app))) errors.push("Approved markup digest is stale.");
  console.log(JSON.stringify({ status: errors.length ? "FAIL" : "PASS", issueIds: ["A11Y-001", "A11Y-002", "A11Y-004"], errors }, null, 2));
  if (errors.length) process.exitCode = 1;
}

const command = process.argv[2] || "analyze";
if (command === "analyze") analyze();
else if (command === "apply") apply();
else if (command === "verify") verify();
else throw new Error("Usage: node scripts/accessibility/apply-phase5c1-remediation.cjs [analyze|apply|verify]");
