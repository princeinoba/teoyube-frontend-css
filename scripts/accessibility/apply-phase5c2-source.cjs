#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const startingCommit = "621aac4d70858c823e44b1f5df6f43688c68f451";
const authorizedFiles = [
  "app.js",
  "index.html",
  "src/app/_approved-source/approved-view-markup.generated.ts",
  "src/app/_canon/CanonPageController.tsx",
  "src/features/scripture/canon-youtube.ts"
];

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const write = (relativePath, value) => fs.writeFileSync(path.join(root, relativePath), value, "utf8");
const gitBytes = (relativePath) => execFileSync("git", ["show", `${startingCommit}:${relativePath}`], { cwd: root, maxBuffer: 8 * 1024 * 1024 });

function replaceExact(source, needle, replacement, label, expectedCount = 1) {
  const actualCount = source.split(needle).length - 1;
  if (actualCount !== expectedCount) throw new Error(`${label}: expected ${expectedCount} occurrences, found ${actualCount}.`);
  return source.split(needle).join(replacement);
}

for (const relativePath of authorizedFiles) {
  const current = fs.readFileSync(path.join(root, relativePath));
  const expected = gitBytes(relativePath);
  if (!current.equals(expected)) throw new Error(`${relativePath}: source differs from the authorized starting commit.`);
}

const canonAdapter = String.raw`const staticTeoyubeWorldYoutubeVideoIds = Object.freeze({
  "local-seed-of-promise": "4zM2olpouIo",
  "local-power-of-prayer": "yLBb7JCMqJE",
  "local-walk-in-purpose": "yDu0bD1lukE",
  "local-rooted-in-truth": "tnjdlvbaBY8",
  "local-called-for-more": "chLnoAGxyrc",
  "local-strength-for-today": "jAmIjP7-T5w",
  "local-promise-language": "I8Y3syhDG64",
  "local-daily-assignment": "YY9VYdPUVf8"
});

const canonJourneyMediaIdsByItemId = Object.freeze({
  "canon-map-D02": "local-rooted-in-truth",
  "canon-map-D03": "local-called-for-more",
  "canon-map-D04": "local-seed-of-promise",
  "canon-map-D05": "local-promise-language",
  "canon-map-D06": "local-walk-in-purpose",
  "canon-map-D07": "local-strength-for-today",
  "canon-map-D08": "local-rooted-in-truth",
  "canon-map-D09": "local-called-for-more",
  "canon-map-D10": "local-power-of-prayer",
  "canon-map-D11": "local-strength-for-today",
  "canon-map-D12": "local-daily-assignment"
});

let activeStaticCanonMediaStage = null;

function getStaticCanonJourneyMedia(stage) {
  const card = stage?.closest?.("[data-canon-item]");
  const canonItemId = card?.dataset.canonItem || "";
  const mediaId = canonJourneyMediaIdsByItemId[canonItemId];
  const media = teoyubeWorldFallbackVideos.find((video) => video.id === mediaId);
  const youtubeVideoId = staticTeoyubeWorldYoutubeVideoIds[mediaId];
  if (!card || !media || !/^[A-Za-z0-9_-]{11}$/.test(youtubeVideoId || "")) return null;
  const journeyTitle = card.querySelector("h4")?.textContent?.trim() || "Canon journey";
  return { card, canonItemId, journeyTitle, media: { ...media, youtubeVideoId } };
}

function createStaticCanonJourneyEmbedUrl(media) {
  if (!media || !/^[A-Za-z0-9_-]{11}$/.test(media.youtubeVideoId || "")) return null;
  const parameters = new URLSearchParams({ autoplay: "1", playsinline: "1", rel: "0", modestbranding: "1" });
  return "https://www.youtube-nocookie.com/embed/" + media.youtubeVideoId + "?" + parameters.toString();
}

function stopStaticCanonJourneyPlayback() {
  if (!activeStaticCanonMediaStage) return;
  activeStaticCanonMediaStage.querySelector("iframe")?.remove();
  const mapping = getStaticCanonJourneyMedia(activeStaticCanonMediaStage);
  activeStaticCanonMediaStage.dataset.playbackState = "idle";
  delete activeStaticCanonMediaStage.dataset.activeVideoId;
  activeStaticCanonMediaStage.setAttribute("aria-pressed", "false");
  if (mapping) activeStaticCanonMediaStage.setAttribute("aria-label", "Play " + mapping.media.title + " for " + mapping.journeyTitle);
  activeStaticCanonMediaStage = null;
}

function playStaticCanonJourneyMedia(stage) {
  const mapping = getStaticCanonJourneyMedia(stage);
  const source = createStaticCanonJourneyEmbedUrl(mapping?.media);
  if (!mapping || !source) return false;
  stopStaticCanonJourneyPlayback();
  $("#canon")?.querySelectorAll("[data-canon-item].active").forEach((item) => item.classList.remove("active"));
  mapping.card.classList.add("active");
  activeStaticCanonMediaStage = stage;
  stage.dataset.activeVideoId = mapping.media.id;
  stage.dataset.playbackState = "loading";
  stage.setAttribute("aria-pressed", "true");
  stage.setAttribute("aria-label", "Playing " + mapping.media.title + " for " + mapping.journeyTitle);
  const frame = document.createElement("iframe");
  frame.title = "TeoyubeWorld video: " + mapping.media.title + " for " + mapping.journeyTitle;
  frame.allow = "autoplay; encrypted-media; picture-in-picture; web-share";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.allowFullscreen = true;
  frame.dataset.youtubeVideoId = mapping.media.youtubeVideoId;
  Object.assign(frame.style, { position: "absolute", inset: "0", width: "100%", height: "100%", border: "0", zIndex: "4" });
  frame.addEventListener("load", () => {
    if (activeStaticCanonMediaStage === stage) stage.dataset.playbackState = "playing";
  }, { once: true });
  frame.addEventListener("error", () => {
    if (activeStaticCanonMediaStage !== stage) return;
    stopStaticCanonJourneyPlayback();
    stage.dataset.playbackState = "error";
  }, { once: true });
  stage.append(frame);
  frame.src = source;
  return true;
}

function configureStaticCanonJourneyMediaStages() {
  $("#canon")?.querySelectorAll(".canon-project-media, .canon-recent-media").forEach((stage) => {
    const mapping = getStaticCanonJourneyMedia(stage);
    if (!mapping) return;
    stage.dataset.canonVideoStage = mapping.canonItemId;
    stage.dataset.canonVideoId = mapping.media.id;
    stage.dataset.playbackState = "idle";
    stage.setAttribute("role", "button");
    stage.setAttribute("tabindex", "0");
    stage.setAttribute("aria-pressed", "false");
    stage.setAttribute("aria-label", "Play " + mapping.media.title + " for " + mapping.journeyTitle);
  });
}

function handleStaticCanonMediaActivation(event) {
  const stage = event.target.closest?.("[data-canon-video-stage]");
  if (!stage || event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return false;
  event.preventDefault();
  event.stopPropagation();
  playStaticCanonJourneyMedia(stage);
  return true;
}`;

let app = read("app.js");
app = replaceExact(app, "}));\n\nconst watchmanJourneyCarouselSlides = [", "}));\n\n" + canonAdapter + "\n\nconst watchmanJourneyCarouselSlides = [", "insert Canon static compatibility adapter");
app = replaceExact(app, "    : `<p>Select a Canon journey card to view details.</p>`;\n}\n\nfunction renderTkos", "    : `<p>Select a Canon journey card to view details.</p>`;\n  configureStaticCanonJourneyMediaStages();\n}\n\nfunction renderTkos", "configure Canon stages after render");
app = replaceExact(app, '  $("#canonGrid")?.addEventListener("click", (event) => {\n    const featuredNav', '  $("#canonGrid")?.addEventListener("click", (event) => {\n    if (handleStaticCanonMediaActivation(event)) return;\n    const featuredNav', "Canon grid click adapter");
app = replaceExact(app, '  $("#canonGrid")?.addEventListener("keydown", (event) => {\n    if (!event.target.closest("[data-canon-featured-carousel]")) return;', '  $("#canonGrid")?.addEventListener("keydown", (event) => {\n    if (handleStaticCanonMediaActivation(event)) return;\n    if (!event.target.closest("[data-canon-featured-carousel]")) return;', "Canon grid keyboard adapter");
app = replaceExact(app, '  $("#canonRecentGrid")?.addEventListener("click", (event) => {\n    const watchmanPlay', '  $("#canonRecentGrid")?.addEventListener("click", (event) => {\n    if (handleStaticCanonMediaActivation(event)) return;\n    const watchmanPlay', "Canon recent click adapter");
app = replaceExact(app, '  });\n  $("#promiseMovieForm").addEventListener("submit", (event) => {', '  });\n  $("#canonRecentGrid")?.addEventListener("keydown", (event) => {\n    handleStaticCanonMediaActivation(event);\n  });\n  $("#promiseMovieForm").addEventListener("submit", (event) => {', "Canon recent keyboard adapter");
write("app.js", app);

let html = read("index.html");
html = replaceExact(html, '<input id="uiVideoSearch" type="search" placeholder="Search videos..." autocomplete="off" />', '<input id="uiVideoSearch" type="search" placeholder="Search videos..." autocomplete="off" aria-label="Search embedded videos" />', "Embedded Videos search name");
html = replaceExact(html, '<input id="teoyubeTableSearch" type="search" placeholder="Search tables, scriptures, or keywords..." autocomplete="off" />', '<input id="teoyubeTableSearch" type="search" placeholder="Search tables, scriptures, or keywords..." autocomplete="off" aria-label="Search Teoyube tables" />', "Tables search name");
html = replaceExact(html, '<input id="lexiconSearchInput" type="search" placeholder="Search words, meanings, scriptures, or concepts..." />', '<input id="lexiconSearchInput" type="search" placeholder="Search words, meanings, scriptures, or concepts..." aria-label="Search the Teoyube Lexicon" />', "Lexicon search name");
html = replaceExact(html, '<div class="testimony-milestones">', '<div class="testimony-milestones" tabindex="0" role="region" aria-label="Testimony milestones">', "Testimony milestone region");
write("index.html", html);

let generated = read("src/app/_approved-source/approved-view-markup.generated.ts");
generated = replaceExact(generated, 'id=\\"uiVideoSearch\\" type=\\"search\\" placeholder=\\"Search videos...\\" autocomplete=\\"off\\"', 'id=\\"uiVideoSearch\\" type=\\"search\\" placeholder=\\"Search videos...\\" autocomplete=\\"off\\" aria-label=\\"Search embedded videos\\"', "Generated Embedded Videos search name");
generated = replaceExact(generated, 'id=\\"teoyubeTableSearch\\" type=\\"search\\" placeholder=\\"Search tables, scriptures, or keywords...\\" autocomplete=\\"off\\"', 'id=\\"teoyubeTableSearch\\" type=\\"search\\" placeholder=\\"Search tables, scriptures, or keywords...\\" autocomplete=\\"off\\" aria-label=\\"Search Teoyube tables\\"', "Generated Tables search names", 4);
generated = replaceExact(generated, 'id=\\"lexiconSearchInput\\" type=\\"search\\" placeholder=\\"Search words, meanings, scriptures, or concepts...\\"', 'id=\\"lexiconSearchInput\\" type=\\"search\\" placeholder=\\"Search words, meanings, scriptures, or concepts...\\" aria-label=\\"Search the Teoyube Lexicon\\"', "Generated Lexicon search name");
generated = replaceExact(generated, 'class=\\"testimony-milestones\\"', 'class=\\"testimony-milestones\\" tabindex=\\"0\\" role=\\"region\\" aria-label=\\"Testimony milestones\\"', "Generated Testimony milestone region");
write("src/app/_approved-source/approved-view-markup.generated.ts", generated);

const changes = authorizedFiles.map((relativePath) => {
  const before = gitBytes(relativePath);
  const after = fs.readFileSync(path.join(root, relativePath));
  return { path: relativePath, changed: !before.equals(after), beforeBytes: before.length, beforeSha256: sha256(before), afterBytes: after.length, afterSha256: sha256(after) };
});
console.log(JSON.stringify({ status: "PASS", startingCommit, changes }, null, 2));
