const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const results = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function check(id, passed, detail) {
  results.push({ id, status: passed ? "pass" : "fail", detail });
}

function parses(relativePath) {
  try {
    new vm.Script(read(relativePath), { filename: relativePath });
    return true;
  } catch (error) {
    return error.message;
  }
}

function sha256(relativePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relativePath))).digest("hex");
}

function metadataDigest(files, protectedRoot) {
  const rows = files
    .filter((file) => file.path === protectedRoot || file.path.startsWith(`${protectedRoot}${path.sep}`))
    .map((file) => `${slash(path.relative(protectedRoot, file.path))}\0${file.bytes}\0${Math.trunc(file.mtimeMs)}`)
    .sort();
  return crypto.createHash("sha256").update(rows.join("\n")).digest("hex");
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolutePath));
    else if (entry.isFile()) files.push(absolutePath);
  }
  return files;
}

function resolveCssImports(relativePath, seen = new Set()) {
  if (seen.has(relativePath)) return [];
  seen.add(relativePath);
  const source = read(relativePath);
  const missing = [];
  for (const match of source.matchAll(/@import\s+url\(["']?([^"')?]+)["']?\)/g)) {
    const imported = slash(path.normalize(path.join(path.dirname(relativePath), match[1])));
    if (!exists(imported)) missing.push(imported);
    else missing.push(...resolveCssImports(imported, seen));
  }
  return missing;
}

function slash(value) {
  return String(value).split(path.sep).join("/");
}

const indexHtml = read("index.html");
const appJs = read("app.js");
const serverJs = read("server.js");
const embeddedJs = read("embedded-videos.js");
const reviewHtml = read("media-review.html");
const packageJson = JSON.parse(read("package.json"));
const plan = JSON.parse(read("generated/workspace-rescue/cleanup-plan.json"));
const normalNavMatch = indexHtml.match(/<nav class="nav-list">([\s\S]*?)<\/nav>/);
const normalNav = normalNavMatch?.[1] || "";
const expectedNav = ["Today", "TeoyubeSearch", "Canon", "Promise Table", "Calling Compass", "Book of the Saint", "Lexicon", "Testimony", "Teo Guide", "Embedded Videos", "Tables"];
const linkedCss = [...indexHtml.matchAll(/<link[^>]+href="([^"]+\.css)[^"]*"/g)].map((match) => match[1].split("?")[0]);
const missingCss = linkedCss.filter((file) => !exists(file)).flatMap((file) => [file]);
const missingImports = linkedCss.filter(exists).flatMap((file) => resolveCssImports(file));
const publicPilotRoot = path.join(root, "public", "media", "teoyubeworld", "pilot-v1");
const publicFiles = walkFiles(publicPilotRoot);
const publicBytes = publicFiles.reduce((total, file) => total + fs.statSync(file).size, 0);
const sourceRoot = path.join(root, "media-source", "teoyubeworld", "originals");
const sourceFiles = walkFiles(sourceRoot).map((file) => ({ path: file, bytes: fs.statSync(file).size, mtimeMs: fs.statSync(file).mtimeMs }));
const currentSourceDigest = metadataDigest(sourceFiles, sourceRoot);

check("app_js_parses", parses("app.js") === true, "app.js parses as JavaScript.");
check("server_js_parses", parses("server.js") === true, "server.js parses as JavaScript.");
check("planner_parses", parses("scripts/planWorkspaceCleanup.cjs") === true, "Cleanup planner parses as JavaScript.");
check("smoke_parses", parses("scripts/emergencyWorkspaceRecoverySmoke.cjs") === true, "Recovery smoke parses as JavaScript.");
check("embedded_runtime_parses", parses("embedded-videos.js") === true, "Embedded Videos runtime parses.");
check("normal_nav_exact", expectedNav.every((label) => normalNav.includes(`>${label}<`)) && (normalNav.match(/class="nav-item/g) || []).length === expectedNav.length, "Normal navigation contains the eleven approved user destinations, including Tables.");
check("embedded_videos_in_nav", normalNav.includes(">Embedded Videos<") && normalNav.includes('data-view="ui-elements"'), "Embedded Videos is the normal video destination.");
check("teoyubeworld_media_absent", !/TeoyubeWorld Media|data-view="media"/.test(normalNav), "TeoyubeWorld Media is absent from normal navigation.");
check("roadmap_absent_normal_nav", !/>Roadmap</.test(normalNav), "Roadmap is not exposed in normal navigation.");
check("embedded_page_exists", indexHtml.includes('id="ui-elements"') && indexHtml.includes("Embedded Videos") && indexHtml.includes("uiVideoGrid"), "Embedded Videos page and controls exist.");
check("embedded_source_separation", appJs.includes("getOriginalEmbeddedVideos") && appJs.includes("getApprovedTeoyubeWorldVideos") && embeddedJs.includes("loadTeoyubeWorldRuntimeManifest") && !embeddedJs.includes("media-source"), "Embedded Videos separates the original library from approved TeoyubeWorld runtime records.");
check("embedded_user_actions", ["data-ui-video-play", "data-ui-video-detail", "data-ui-video-save", "uiVideoLoadMore"].every((marker) => appJs.includes(marker) || indexHtml.includes(marker)), "Play, detail, save, and load-more actions exist.");
check("owner_experience_not_loaded", !indexHtml.includes("teoyubeworld-media-experience.js") && !indexHtml.includes("teoyubeworld-media.css"), "Confusing runtime Media Library is quarantined from the normal app.");
check("media_review_owner_only", exists("media-review.html") && exists("media-review.js") && reviewHtml.includes("styles/owner/media-review.css") && !indexHtml.includes("media-review.html"), "Owner Media Review remains separate and is not linked in the normal app.");
check("promise_table_exists", indexHtml.includes('id="table"') && indexHtml.includes("savedPromiseTableRows"), "Promise Table remains present.");
check("standard_shell_exists", ["app-shell", "app-sidebar", "app-main", "app-header", "page-container"].every((marker) => indexHtml.includes(marker)), "Standard page shell classes exist.");
check("right_rail_contained", !read("styles/layout.css").includes("body:has(.phase113-insight-rail:not(.collapsed)) .app-main"), "The optional right rail no longer compresses every normal page globally.");
check("z_index_tokens", ["--z-base", "--z-sticky", "--z-sidebar", "--z-overlay", "--z-drawer", "--z-modal", "--z-toast", "--z-command"].every((token) => read("styles/tokens.css").includes(token)), "Controlled z-index tokens are defined.");
check("css_files_load", missingCss.length === 0 && missingImports.length === 0, `Missing CSS references: ${[...missingCss, ...missingImports].join(", ") || "none"}.`);
check("owner_css_separate", read("styles/owner/media-review.css").includes("../../media-review.css") && !indexHtml.includes("styles/owner"), "Owner CSS is loaded only by the owner page.");
check("no_absolute_media_path_in_runtime", !/[A-Za-z]:[\\/]/.test(indexHtml + appJs + embeddedJs + read("teoyubeworld-media-runtime.js")), "Normal browser runtime contains no absolute local media path.");
check("protected_media_not_served", serverJs.includes('protectedPathPrefixes = ["/media-source", "/generated", "/.git", "/.media-tmp"]'), "Protected and generated source paths are blocked by the server.");
check("published_pilot_intact", publicFiles.length === 49 && publicBytes === 12058862 && sha256("public/media/teoyubeworld/pilot-v1/runtime-manifest.json") === "68b497ffdad2686142dc400546bf9f1cc3635e7f4d5b282b0cded3b7a72131f3", "The exact approved 49-file pilot remains intact.");
check("source_metadata_unchanged", currentSourceDigest === plan.protectedSource.metadataDigestSha256, "Protected source count, sizes, and timestamps match the read-only audit.");
check("planner_non_destructive", !/\b(?:rmSync|unlinkSync|rmdirSync|renameSync|copyFileSync|spawnSync|execSync)\b/.test(read("scripts/planWorkspaceCleanup.cjs")), "Cleanup planner contains no deletion, move, copy, or process execution primitive.");
check("cleanup_not_authorized", plan.executionAuthorized === false && plan.authorizationAssumed === false && plan.filesDeleted === 0 && plan.filesMoved === 0 && plan.sourceMediaModified === false, "Cleanup plan records zero destructive actions and does not assume authorization.");
check("cleanup_plan_exists", exists("docs/teoyube/emergency-workspace-cleanup-plan.md") && exists("docs/teoyube/emergency-storage-audit.md"), "JSON and Markdown cleanup planning artifacts exist.");
check("package_scripts", packageJson.scripts["workspace:cleanup:plan"] && packageJson.scripts["emergency:recovery:smoke"], "Recovery commands are registered.");
check("no_external_services", !/fetch\(["']https?:\/\//i.test(appJs + embeddedJs), "No external service is required.");
check("no_autoplay_markup", !/<video[^>]+autoplay/i.test(indexHtml + appJs + embeddedJs), "Embedded Videos does not autoplay through markup.");

const report = {
  milestone: "TEOYUBE Workspace Rescue",
  valid: results.every((result) => result.status === "pass"),
  checks: results,
  safety: {
    cleanupAuthorized: false,
    filesDeleted: 0,
    filesMoved: 0,
    sourceMediaModified: false,
    externalServices: false,
    ffmpegExecuted: false
  }
};

console.log(JSON.stringify(report, null, 2));
if (!report.valid) process.exitCode = 1;
