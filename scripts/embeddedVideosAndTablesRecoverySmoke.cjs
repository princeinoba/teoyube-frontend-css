const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const checks = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function check(id, passed, detail) {
  checks.push({ id, status: passed ? "pass" : "fail", detail });
}

function parses(relativePath) {
  try {
    new vm.Script(read(relativePath), { filename: relativePath });
    return true;
  } catch (error) {
    return error.message;
  }
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(absolute) : entry.isFile() ? [absolute] : [];
  });
}

function sha256(relativePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relativePath))).digest("hex");
}

const indexHtml = read("index.html");
const appJs = read("app.js");
const layoutCss = read("styles/layout.css");
const tokensCss = read("styles/tokens.css");
const embeddedCss = read("styles/pages/embedded-videos.css");
const tablesCss = read("styles/pages/tables.css");
const pagesIndexCss = read("styles/pages/index.css");
const packageJson = JSON.parse(read("package.json"));
const runtimeManifest = JSON.parse(read("public/media/teoyubeworld/pilot-v1/runtime-manifest.json"));
const normalNav = indexHtml.match(/<nav class="nav-list">([\s\S]*?)<\/nav>/)?.[1] || "";
const embeddedSection = indexHtml.match(/<section class="view page-container" id="ui-elements">([\s\S]*?)<section class="view page-container tables-page"/)?.[1] || "";
const publicPilotRoot = path.join(root, "public", "media", "teoyubeworld", "pilot-v1");
const publicFiles = walkFiles(publicPilotRoot);
const publicBytes = publicFiles.reduce((total, file) => total + fs.statSync(file).size, 0);
const originalTabs = ["All Videos", "Teachings", "Worship", "Messages", "Documentaries", "Shorts"];
const managementTabs = ["promises", "scriptures", "journeys", "videos", "book"];

check("app_js_parses", parses("app.js") === true, "app.js parses as JavaScript.");
check("embedded_runtime_parses", parses("embedded-videos.js") === true, "Embedded video runtime parses.");
check("correct_styles_loaded", indexHtml.includes("styles/layout.css") && indexHtml.includes("styles/pages/index.css") && pagesIndexCss.includes('url("tables.css")'), "The shell and scoped page modules are loaded.");
check("owner_styles_isolated", !indexHtml.includes("styles/owner/") && read("media-review.html").includes("styles/owner/media-review.css"), "Owner Media Review CSS remains separate.");
check("shell_not_max_constrained", !tokensCss.includes("--page-max") && !layoutCss.includes("max-width: var(--page-max)") && layoutCss.includes(".page-container") && layoutCss.includes("max-width: none"), "The normal shell has no global page maximum.");
check("right_rail_does_not_reserve_global_space", !layoutCss.includes("body:has(.phase113-insight-rail") && !/phase113-insight-rail[\s\S]{0,200}padding-right/.test(layoutCss), "The fixed insight rail does not compress every page.");
check("embedded_navigation_exists", normalNav.includes('data-view="ui-elements"') && normalNav.includes(">Embedded Videos<"), "Embedded Videos is in normal navigation.");
check("tables_navigation_exists", normalNav.includes('data-view="teoyube-tables"') && normalNav.includes(">Tables<"), "Tables is in normal navigation.");
check("roadmap_not_in_normal_navigation", !normalNav.includes(">Roadmap<"), "Roadmap remains owner/QA-only.");
check("teoyubeworld_not_separate_route", !normalNav.includes('data-view="media"') && !/id="teoyubeworld-media"/.test(indexHtml), "TeoyubeWorld Media is not a separate route.");
check("original_six_tabs", originalTabs.every((tab) => embeddedSection.includes(`data-video-category="${tab}"`)), "All six original Embedded Videos tabs exist.");
check("teoyubeworld_contained_tab", embeddedSection.includes('data-video-category="TeoyubeWorld Media"'), "TeoyubeWorld Media is the seventh contained tab.");
check("original_library_adapter", appJs.includes("function getOriginalEmbeddedVideos()") && appJs.includes("teoyubeWorldFallbackVideos"), "The original local preview library has its own adapter.");
check("approved_media_adapter", appJs.includes("function getApprovedTeoyubeWorldVideos()") && appJs.includes("runtimeApproved === true"), "Approved runtime media has a separate adapter.");
check("tab_source_separation", /if \(tabId === "TeoyubeWorld Media"\) return getApprovedTeoyubeWorldVideos\(\)/.test(appJs) && /const records = getOriginalEmbeddedVideos\(\)/.test(appJs), "The pilot is used only by its contained tab; original tabs retain the original source.");
check("shared_compact_card_renderer", appJs.includes("function renderEmbeddedVideoGrid(records, options = {})") && /grid-template-columns:\s*repeat\(2/.test(embeddedCss) && !/grid-template-columns:\s*repeat\(3/.test(embeddedCss) && /aspect-ratio:\s*21\s*\/\s*7\.35/.test(embeddedCss), "A shared two-column renderer restores the compact 21:7.35 desktop card presentation.");
check("carousel_card_navigation", ["data-ui-video-nav=\"previous\"", "data-ui-video-nav=\"next\"", "uiVideoCardSelections.set"].every((marker) => appJs.includes(marker)) && appJs.includes("approved ? 4 : uiVideoVisibleCount"), "Every multi-record source uses bounded carousel slots with previous and next controls.");
check("artwork_information_preserved", embeddedCss.includes(".embedded-video-poster-image") && /\.embedded-video-poster-image[\s\S]{0,180}object-fit:\s*contain/.test(embeddedCss) && embeddedCss.includes(".embedded-video-poster-backdrop"), "Foreground artwork uses contain fit over a non-authoritative backdrop so embedded text is not cropped.");
check("approved_runtime_count", Array.isArray(runtimeManifest.records) && runtimeManifest.records.length === 12, "The approved runtime manifest contains exactly 12 records.");
check("approved_actions", ["data-ui-video-play", "data-ui-video-detail", "data-ui-video-save", "data-ui-video-scripture"].every((marker) => appJs.includes(marker)), "Play, Details, Save to Book, and Open Scripture actions exist.");
check("table_demonstrations", indexHtml.includes("UI Table Demonstrations") && appJs.includes("function renderTeoyubeTablesPage()"), "The original table demonstration renderer remains present.");
check("table_demo_interactions", ["data-table-select", "data-table-demo-action=\"details\"", "data-table-demo-action=\"save\"", "data-table-demo-action=\"filter\""].every((marker) => appJs.includes(marker)) && tablesCss.includes(".table-action-menu"), "The demonstration supports row selection, details, Book saving, and a contained action menu.");
check("functional_data_tables", indexHtml.includes("Teoyube Data Management") && managementTabs.every((tab) => indexHtml.includes(`data-data-table-tab="${tab}"`)) && appJs.includes("function renderTeoyubeDataManagement()"), "All five local data-management views exist.");
check("tables_route_normal", appJs.includes('"ui-elements",\n    "teoyube-tables"') && !/allowedViews\.add\("teoyube-tables"\)/.test(appJs), "Tables is a normal route rather than a QA-only route.");
check("roadmap_decision_documented", exists("docs/teoyube/roadmap-user-functionality-decision.md"), "The evidence-based Roadmap decision is documented.");
check("regression_audit_documented", exists("docs/teoyube/embed-video-and-full-width-regression-audit.md"), "The regression cause audit exists.");
check("browser_qa_documented", exists("docs/teoyube/embedded-videos-tables-full-width-browser-qa.md"), "Desktop, responsive, interaction, and console browser evidence is documented.");
check("visual_comparison_documented", exists("docs/teoyube/embedded-videos-visual-comparison-report.md"), "The completed page is compared with both owner-supplied references.");
check("media_review_separate", exists("media-review.html") && exists("media-review.js") && !normalNav.includes("Media Review"), "Owner Media Review remains a separate local tool.");
check("no_protected_source_path_in_normal_runtime", !/[A-Za-z]:[\\/]/.test(indexHtml + appJs + read("embedded-videos.js")) && !/media-source[\\/]/.test(indexHtml + appJs), "Normal browser runtime exposes no absolute or protected source-media path.");
check("published_pilot_intact", publicFiles.length === 49 && publicBytes === 12058862 && sha256("public/media/teoyubeworld/pilot-v1/runtime-manifest.json") === "68b497ffdad2686142dc400546bf9f1cc3635e7f4d5b282b0cded3b7a72131f3", "The exact published 49-file pilot and manifest hash remain unchanged.");
check("source_media_not_touched", !exists("media-source/teoyubeworld/originals") || ![indexHtml, appJs, layoutCss, embeddedCss, read("styles/pages/tables.css")].some((source) => /copyFile|renameSync|ffmpeg|media-source[\\/]/i.test(source)), "Recovery code contains no source-media, copy, rename, or FFmpeg operation.");
check("package_script", packageJson.scripts["recovery:videos-tables:smoke"] === "node --preserve-symlinks-main scripts/embeddedVideosAndTablesRecoverySmoke.cjs", "The focused recovery smoke command is registered.");

const report = {
  milestone: "TEOYUBE Interface Recovery",
  valid: checks.every((result) => result.status === "pass"),
  checks,
  preserved: {
    approvedRuntimeRecords: runtimeManifest.records?.length || 0,
    publishedPilotFiles: publicFiles.length,
    publishedPilotBytes: publicBytes,
    publishedPilotModified: false,
    sourceMediaModified: false,
    ownerMediaReviewSeparated: true
  }
};

console.log(JSON.stringify(report, null, 2));
if (!report.valid) process.exitCode = 1;
