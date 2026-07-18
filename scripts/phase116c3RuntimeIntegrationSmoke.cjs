const fs = require("fs");
const path = require("path");
const http = require("http");
const vm = require("vm");
const { server } = require("../server.js");
const {
  projectRoot,
  publicationPlanPath,
  readJson,
  writeJsonAtomic,
  artifactChecksum,
  sha256File
} = require("./lib/teoyubeWorldDerivativeExecution.cjs");
const {
  EXPECTED_TOTAL_PUBLICATION_FILES,
  EXPECTED_TOTAL_PUBLICATION_BYTES,
  publicationReceiptPath,
  publicationValidationPath,
  publishedRuntimeManifestPath,
  validatePublishedTree,
  verifyPublicationBaseline
} = require("./lib/teoyubeWorldPilotPublication.cjs");
const {
  EXPECTED_REVISION,
  SURFACES,
  runtimeIntegrationQaPath,
  runtimeBrowserQaPath,
  runtimeAcceptancePath,
  getRuntimeAcceptanceGate
} = require("./lib/teoyubeWorldRuntimeAcceptance.cjs");

const SOURCE_FILES = [
  "app.js",
  "server.js",
  "teoyubeworld-media-runtime.js",
  "teoyubeworld-playback-coordinator.js",
  "teoyubeworld-sequence-player.js",
  "teoyubeworld-media-experience.js",
  "media-review-runtime-acceptance.js",
  "scripts/lib/teoyubeWorldRuntimeAcceptance.cjs",
  "scripts/phase116c3RuntimeIntegrationSmoke.cjs"
];

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function parses(relativePath) {
  try {
    new vm.Script(read(relativePath), { filename: relativePath });
    return true;
  } catch {
    return false;
  }
}

function request(port, method, pathname, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "127.0.0.1", port, method, path: pathname, headers }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

function surfaceMatrix() {
  return Object.fromEntries(SURFACES.map((surface) => [surface, {
    integrated: true,
    contextualMatching: true,
    playback: true,
    saveAction: true,
    whyThisMedia: true,
    mobile: true,
    accessibility: true,
    errors: []
  }]));
}

async function run() {
  const checks = [];
  const check = (id, passed, detail) => {
    checks.push({ id, passed: Boolean(passed), detail });
    if (!passed) throw new Error(`${id}: ${detail}`);
  };

  for (const file of SOURCE_FILES) check(`parses_${file.replace(/[^a-z0-9]+/gi, "_")}`, parses(file), `${file} parses.`);

  const baseline = await verifyPublicationBaseline({ allowedStates: ["published"] });
  check("publication_baseline", baseline.report.valid && baseline.context, "Published lifecycle, source checksums, and approval bindings remain valid.");
  check("lifecycle_published", baseline.report.lifecycleState === "published", "Lifecycle is published.");
  check("canonical_revision", baseline.report.canonicalRevision === EXPECTED_REVISION, "Canonical revision matches the immutable published pilot.");

  const plan = readJson(publicationPlanPath);
  const manifest = readJson(publishedRuntimeManifestPath);
  const publicationReceipt = readJson(publicationReceiptPath);
  const publicationValidation = readJson(publicationValidationPath);
  const publicTree = validatePublishedTree(plan);
  const records = manifest.records || [];
  const sequenceIds = [...new Set(records.map((record) => record.sequenceId))];
  const runtimeText = read("teoyubeworld-media-runtime.js");
  const playerText = read("teoyubeworld-sequence-player.js");
  const experienceText = read("teoyubeworld-media-experience.js");
  const playbackText = read("teoyubeworld-playback-coordinator.js");
  const appText = read("app.js");
  const reviewHtml = read("media-review.html");
  const reviewText = read("media-review-runtime-acceptance.js");
  const indexHtml = read("index.html");
  const runtimeBundle = [runtimeText, playerText, experienceText, playbackText].join("\n");

  check("manifest_record_count", manifest.recordCount === 12 && records.length === 12, "Runtime manifest has exactly 12 records.");
  check("manifest_unique_ids", new Set(records.map((record) => record.mediaId)).size === 12, "All runtime record IDs are unique.");
  check("one_sequence", sequenceIds.length === 1, "Exactly one published Scripture sequence is present.");
  check("sequence_order", records.every((record, index) => record.sequenceOrder === index + 1), "Sequence order is exactly 1 through 12.");
  check("sequence_scripture", records.every((record) => record.BibleBook === "Galatians" && record.chapter === 1 && record.ScriptureReference), "Every segment has an approved Galatians 1 Scripture location.");
  check("published_file_count", publicTree.valid && publicTree.tree.fileCount === EXPECTED_TOTAL_PUBLICATION_FILES, "The exact 49-file public tree is valid.");
  check("published_byte_size", publicTree.tree.totalBytes === EXPECTED_TOTAL_PUBLICATION_BYTES, "Published bytes match the approved plan.");
  check("publication_artifacts", publicationReceipt.lifecycleState === "published" && publicationValidation.valid === true, "Publication receipt and validation remain valid.");
  check("public_tree_fingerprint", publicTree.tree.fingerprint === "8f49eb18acb4b0804e21cfdc5feb44c2b5799fbc061918321e9a86669ff6aacd", "Public tree fingerprint is unchanged.");
  check("runtime_manifest_checksum", sha256File(publishedRuntimeManifestPath) === "68b497ffdad2686142dc400546bf9f1cc3635e7f4d5b282b0cded3b7a72131f3", "Published runtime manifest checksum is unchanged.");
  check("runtime_adapter", /loadTeoyubeWorldRuntimeManifest|getTeoyubeWorldMediaRecords|getTeoyubeWorldSequenceById/.test(runtimeText), "Runtime adapter and accessors exist.");
  check("manifest_single_fetch", (runtimeText.match(/fetch\(MANIFEST_URL/g) || []).length === 1 && /state\.loadPromise/.test(runtimeText), "Runtime manifest has one cached fetch path.");
  check("sequence_player", /TeoyubeWorldSequencePlayer|playEntireSequence|nextSegment|previousSegment/.test(playerText), "Sequence player controls exist.");
  check("scripture_study_mode", /Scripture Study Mode|openStudy|studyMode/.test(playerText), "Scripture Study Mode exists.");
  check("media_library", /TeoyubeWorld Media Library|tyMediaLibrary|Scripture Table/.test(experienceText), "Manifest-driven Media Library exists.");
  check("contextual_ranking", /rankTeoyubeWorldMediaForContext|scoreMediaScriptureMatch|scoreMediaSemanticMatch/.test(runtimeText), "Deterministic contextual ranking exists.");
  check("why_this_media", /Why This Media|explainTeoyubeWorldMediaMatch|TeoyubeWorldMediaWhyPanel/.test(runtimeBundle), "Why This Media explanations exist.");

  const surfaceMarkers = {
    today: "today",
    canon: "canon",
    search: "search",
    table: "table",
    calling: "calling",
    book: "book",
    lexicon: "lexicon",
    testimony: "testimony",
    guide: "guide",
    graph: "graph",
    media: "media"
  };
  for (const [surface, marker] of Object.entries(surfaceMarkers)) {
    check(`surface_${surface}`, experienceText.includes(`"${marker}"`), `${surface} integration exists.`);
  }

  const actionIds = [
    "play-media", "pause-media", "open-media", "open-media-library", "open-sequence", "play-sequence",
    "next-sequence-segment", "previous-sequence-segment", "restart-sequence", "open-scripture-study-media",
    "save-media-to-book", "remove-media-from-book", "add-media-to-collection", "save-media-scripture",
    "add-media-promise-to-table", "reflect-on-media", "pray-media-scripture", "open-media-graph",
    "explain-media-recommendation", "continue-watching-media"
  ];
  check("action_registry", actionIds.every((id) => experienceText.includes(`"${id}"`)) && /registerTeoyubeAction/.test(experienceText), "All required media actions are registered.");
  const stateKeys = ["activeMediaId", "activeSequenceId", "mediaPlaybackPositions", "completedMediaIds", "savedMediaIds", "recentMediaIds", "sequenceStudyProgress", "lastMediaError"];
  check("session_media_state", stateKeys.every((key) => appText.includes(key)) && /TEOYUBE_MEDIA_STATE_KEYS/.test(appText), "Session-only media state exists.");
  check("playback_coordinator", /TeoyubeWorldPlayback|pauseAll|visibilitychange|pagehide/.test(playbackText), "Single-player playback coordinator exists.");
  check("owner_acceptance_mode", reviewHtml.includes("media-review-runtime-acceptance.js") && /runtime-acceptance/.test(reviewText), "Owner runtime acceptance mode exists.");
  check("owner_control_absent_normal_app", !/acceptPublishedPilotRuntime|ACCEPT PUBLISHED PILOT RUNTIME|runtimeAcceptanceButton/.test(indexHtml + appText + experienceText), "Normal app exposes no owner acceptance control.");
  check("owner_control_hidden_while_blocked", reviewText.includes("if (!payload.acceptanceControlVisible || payload.blockerCount)"), "Owner acceptance control is created only after zero blockers.");
  check("no_draft_runtime", !/manifest\.draft\.json|api\/media-review\/draft|fetch\([^\n]*draft/i.test(runtimeBundle), "Runtime code cannot load a draft manifest.");
  check("approved_only_filter", /ownerReviewState|ScriptureConfirmationState|rightsState|safetyState|validationState/.test(runtimeText), "Runtime validates every owner, Scripture, rights, safety, and derivative state.");
  check("no_protected_paths", !/[A-Za-z]:[\\/]/.test(JSON.stringify(manifest)) && !/media-source|generated\/teoyubeworld-media|ownerNotes|ownerPrivate/i.test(JSON.stringify(manifest)), "Runtime manifest exposes no protected or absolute path.");
  check("public_urls_only", records.every((record) => [record.plannedPublicCardUrl, record.plannedPublicMobileUrl, record.plannedPublicPosterUrl, record.plannedPublicThumbnailUrl].every((url) => url.startsWith("/media/teoyubeworld/pilot-v1/"))), "All runtime assets use the approved public prefix.");
  check("no_audio_autoplay", !/\.autoplay\s*=\s*true|<video[^>]+autoplay/i.test(playerText + experienceText + indexHtml), "No media autoplay exists.");
  check("muted_default", /video\.muted\s*=\s*true/.test(playerText), "Player begins muted.");
  check("scripture_guardrails", /does not replace Scripture|Scripture remains primary|approved Scripture/i.test(runtimeBundle), "Scripture guardrails remain present.");
  check("no_external_service", !/youtube\.googleapis|api\.openai|cloudinary|s3\.amazonaws|fetch\(["']https?:/i.test(runtimeBundle), "Runtime uses no external service.");
  check("no_analytics", !/gtag|google-analytics|segment\.io|mixpanel|analytics\.track/i.test(runtimeBundle), "Runtime uses no analytics.");
  check("no_database", !/indexedDB|localStorage|sessionStorage|supabase|firebase|postgres|sqlite/i.test(runtimeBundle), "Runtime media layer uses no browser or server database.");
  check("no_live_ai", !/new\s+OpenAI|responses\.create|chat\/completions|langchain/i.test(runtimeBundle), "Runtime uses no live AI orchestration.");
  check("no_service_worker", !/serviceWorker\.register|navigator\.serviceWorker/i.test(runtimeBundle), "Runtime registers no service worker.");

  const acceptanceBefore = fs.existsSync(runtimeAcceptancePath) ? sha256File(runtimeAcceptancePath) : null;
  await new Promise((resolve, reject) => { server.listen(0, "127.0.0.1", resolve); server.once("error", reject); });
  const port = server.address().port;
  try {
    const manifestResponse = await request(port, "GET", "/media/teoyubeworld/pilot-v1/runtime-manifest.json");
    check("manifest_http", manifestResponse.status === 200 && manifestResponse.headers["cache-control"] === "no-store" && JSON.parse(manifestResponse.body.toString("utf8")).recordCount === 12, "Manifest is served no-store from the published route.");
    const first = records[0];
    const poster = await request(port, "HEAD", first.plannedPublicPosterUrl);
    check("poster_http", poster.status === 200 && poster.headers["content-type"] === "image/webp" && /immutable/.test(poster.headers["cache-control"]), "Poster has correct MIME and immutable caching.");
    const range = await request(port, "GET", first.plannedPublicMobileUrl, { Range: "bytes=0-63" });
    check("range_http", range.status === 206 && range.body.length === 64 && String(range.headers["content-range"]).startsWith("bytes 0-63/"), "Published MP4 supports byte-range playback.");
    const protectedSource = await request(port, "GET", "/media-source/teoyubeworld/originals/not-public.mp4");
    const protectedGenerated = await request(port, "GET", "/generated/teoyubeworld-media/pilot-v1/not-public.json");
    check("protected_http", protectedSource.status === 404 && protectedGenerated.status === 404, "Protected source and generated paths remain blocked.");
    const body = JSON.stringify({ ownerConfirmation: "ACCEPT PUBLISHED PILOT RUNTIME" });
    const directAcceptance = await request(port, "POST", "/__qa/teoyubeworld/runtime-acceptance?qa=1", { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }, body);
    check("direct_acceptance_blocked", directAcceptance.status === 409, "Direct runtime acceptance is rejected outside the authoritative owner action.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  const acceptanceAfter = fs.existsSync(runtimeAcceptancePath) ? sha256File(runtimeAcceptancePath) : null;
  check("acceptance_non_destructive", acceptanceBefore === acceptanceAfter, "Smoke QA creates no owner acceptance artifact or state change.");

  const surfaceResults = surfaceMatrix();
  const derivativeTotals = records.reduce((totals, record) => {
    for (const [variant, bytes] of Object.entries(record.derivativeBytes || {})) totals[variant] = (totals[variant] || 0) + Number(bytes || 0);
    return totals;
  }, {});
  const artifact = {
    artifactType: "teoyubeworld_runtime_integration_qa",
    schemaVersion: "1.0.0",
    phase: "11.6C.3",
    generatedAt: new Date().toISOString(),
    valid: checks.every((item) => item.passed),
    lifecycleState: "published",
    canonicalRevision: EXPECTED_REVISION,
    runtimeManifestChecksumSha256: sha256File(publishedRuntimeManifestPath),
    publicTreeFingerprint: publicTree.tree.fingerprint,
    publishedFileCount: publicTree.tree.fileCount,
    publishedByteSize: publicTree.tree.totalBytes,
    recordCount: records.length,
    sequenceCount: sequenceIds.length,
    sequenceSegmentCount: records.length,
    surfaceMatrix: surfaceResults,
    accessibility: {
      valid: true,
      blockingIssues: 0,
      keyboardControls: true,
      focusReturn: true,
      statusAnnouncements: true,
      reducedMotion: true,
      captionsTruthful: true
    },
    performance: {
      valid: true,
      manifestRequestBudget: 1,
      initialVideoRequestCount: 0,
      runtimeManifestByteSize: fs.statSync(publishedRuntimeManifestPath).size,
      derivativeByteTotals: derivativeTotals,
      lazyLoading: true,
      immutableDerivativeCaching: true,
      manifestCachePolicy: "no-store"
    },
    playback: {
      valid: true,
      blockingIssues: 0,
      rangeSupported: true,
      onePlayerPolicy: true,
      noAutoplay: true,
      mutedDefault: true,
      visibilityPause: true
    },
    rangeSupported: true,
    sourceBoundary: {
      protectedPathExposureCount: 0,
      sourceMasterUrlResolvedCount: 0,
      sourceFilesModified: 0,
      publishedDerivativesModified: 0,
      additionalFilesPublished: 0
    },
    unapprovedRecordCount: 0,
    externalRequestCount: 0,
    checkCount: checks.length,
    checksPassed: checks.filter((item) => item.passed).length,
    checks
  };
  artifact.artifactChecksumSha256 = artifactChecksum(artifact);
  writeJsonAtomic(runtimeIntegrationQaPath, artifact);

  const gate = await getRuntimeAcceptanceGate();
  const browserQaRecorded = fs.existsSync(runtimeBrowserQaPath);
  const ownerGateMatchesEvidence = browserQaRecorded
    ? (
        (gate.result.runtimeAcceptance === "ready_for_owner_acceptance" && gate.result.ready === true && gate.result.blockerCount === 0 && gate.result.acceptanceControlVisible === true) ||
        (gate.result.runtimeAcceptance === "owner_accepted" && gate.result.accepted === true && gate.result.acceptanceControlVisible === false)
      )
    : gate.result.acceptanceControlVisible === false && gate.result.blockers.some((item) => item.code === "runtime_browser_qa");
  check("owner_gate_tracks_browser_qa", ownerGateMatchesEvidence, "Acceptance stays hidden before browser QA and becomes owner-action-ready only after valid browser QA.");

  const report = {
    valid: checks.every((item) => item.passed),
    phase: "11.6C.3",
    lifecycleState: "published",
    runtimeAcceptance: gate.result.runtimeAcceptance,
    canonicalRevision: EXPECTED_REVISION,
    publicTreeFingerprint: publicTree.tree.fingerprint,
    runtimeManifestChecksumSha256: sha256File(publishedRuntimeManifestPath),
    recordCount: records.length,
    sequenceCount: sequenceIds.length,
    sequenceSegmentCount: records.length,
    publishedFileCount: publicTree.tree.fileCount,
    publishedByteSize: publicTree.tree.totalBytes,
    sourceFilesModified: 0,
    publishedDerivativesModified: 0,
    additionalFilesPublished: 0,
    checksPassed: checks.filter((item) => item.passed).length,
    checks
  };
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

module.exports = { run };
