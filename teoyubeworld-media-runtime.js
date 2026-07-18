(() => {
  "use strict";

  const MANIFEST_URL = "/media/teoyubeworld/pilot-v1/runtime-manifest.json";
  const PUBLIC_PREFIX = "/media/teoyubeworld/pilot-v1/";
  const EXPECTED_SCHEMA_VERSION = "1.0.0";
  const EXPECTED_REVISION = "pilot-r120-583481b46fb0";
  const EXPECTED_RECORD_COUNT = 12;
  const ALLOWED_MEDIA_KINDS = new Set(["short"]);
  const ALLOWED_RIGHTS = new Set(["owner_attested_rights_controlled"]);
  const ALLOWED_SAFETY = new Set(["owner_attested_safe_for_pilot"]);
  const state = {
    manifest: null,
    records: [],
    sequences: [],
    report: null,
    loadPromise: null,
    loadedAt: null,
    lastError: "",
    manifestRequestCount: 0
  };

  const asArray = (value) => Array.isArray(value) ? value : [];
  const normalize = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const unique = (values) => [...new Set(asArray(values).filter(Boolean))];

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function isUnsafeValue(value) {
    const text = String(value || "");
    return /[A-Za-z]:[\\/]/.test(text) || /(^|[\\/])\.\.([\\/]|$)/.test(text) || /media-source|generated\/teoyubeworld-media|ownerNotes|ownerPrivate/i.test(text);
  }

  function isSafePublicUrl(value, mediaId, suffix) {
    const url = String(value || "");
    return url === `${PUBLIC_PREFIX}${mediaId}/${suffix}` && !isUnsafeValue(url) && !url.includes("//", 1);
  }

  function parseScriptureReference(reference) {
    const match = String(reference || "").trim().match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (!match) return null;
    return {
      book: match[1],
      chapter: Number(match[2]),
      verseStart: Number(match[3]),
      verseEnd: Number(match[4] || match[3])
    };
  }

  function scriptureRangesOverlap(left, right) {
    const a = typeof left === "string" ? parseScriptureReference(left) : left;
    const b = typeof right === "string" ? parseScriptureReference(right) : right;
    return Boolean(a && b && normalize(a.book) === normalize(b.book) && a.chapter === b.chapter && a.verseStart <= b.verseEnd && b.verseStart <= a.verseEnd);
  }

  function recordScriptureLocation(record) {
    return {
      book: record.BibleBook,
      chapter: record.chapter,
      verseStart: record.verseStart,
      verseEnd: record.verseEnd
    };
  }

  function validateRecord(record, index, seenIds) {
    const errors = [];
    const id = String(record?.mediaId || "");
    if (!/^media-[a-f0-9]{20}$/.test(id)) errors.push(`Record ${index + 1} has an invalid media ID.`);
    if (seenIds.has(id)) errors.push(`Duplicate runtime media ID: ${id}.`);
    seenIds.add(id);
    if (!record?.title || !record?.ScriptureReference) errors.push(`${id || `Record ${index + 1}`} is missing a title or Scripture reference.`);
    if (!parseScriptureReference(record?.ScriptureReference)) errors.push(`${id} has an unusable Scripture reference.`);
    if (!ALLOWED_MEDIA_KINDS.has(record?.mediaKind)) errors.push(`${id} uses an unsupported media type.`);
    if (record?.ownerReviewState !== "confirmed" || record?.ScriptureConfirmationState !== "confirmed") errors.push(`${id} is not owner and Scripture confirmed.`);
    if (!ALLOWED_RIGHTS.has(record?.rightsState) || !ALLOWED_SAFETY.has(record?.safetyState)) errors.push(`${id} is not rights and safety approved.`);
    if (record?.validationState !== "validated" || record?.canonicalPilotRevision !== EXPECTED_REVISION) errors.push(`${id} is not validated for the canonical revision.`);
    const urls = [
      [record?.plannedPublicCardUrl, "card-preview.mp4"],
      [record?.plannedPublicMobileUrl, "mobile-preview.mp4"],
      [record?.plannedPublicPosterUrl, "poster.webp"],
      [record?.plannedPublicThumbnailUrl, "thumbnail.webp"]
    ];
    for (const [url, suffix] of urls) if (!isSafePublicUrl(url, id, suffix)) errors.push(`${id} has an unsafe or unapproved ${suffix} URL.`);
    if (isUnsafeValue(JSON.stringify(record))) errors.push(`${id} exposes a protected or absolute path.`);
    return errors;
  }

  function normalizeRecord(record) {
    const parsed = parseScriptureReference(record.ScriptureReference);
    return Object.freeze({
      ...record,
      id: record.mediaId,
      ScriptureReferences: [record.ScriptureReference],
      BibleBook: record.BibleBook || parsed?.book || "",
      chapter: Number(record.chapter || parsed?.chapter || 0),
      verseStart: Number(record.verseStart || parsed?.verseStart || 0),
      verseEnd: Number(record.verseEnd || parsed?.verseEnd || parsed?.verseStart || 0),
      themes: unique(record.themes),
      TeoyubeWordIds: unique(record.TeoyubeWordIds),
      promiseClusterIds: unique(record.promiseClusterIds),
      journeyIds: unique(record.journeyIds),
      callingIds: unique(record.callingIds),
      recommendedSurfaces: unique(record.recommendedSurfaces),
      reviewStatus: "approved",
      safetyStatus: "approved",
      copyrightStatus: "owner_owned",
      mappingConfidence: "confirmed",
      runtimeApproved: true,
      playbackSources: Object.freeze({
        default: record.plannedPublicCardUrl,
        card: record.plannedPublicCardUrl,
        mobile: record.plannedPublicMobileUrl
      }),
      posterPath: record.plannedPublicPosterUrl,
      thumbnailPath: record.plannedPublicThumbnailUrl
    });
  }

  function deriveSequences(records) {
    const groups = new Map();
    records.forEach((record) => {
      if (!groups.has(record.sequenceId)) groups.set(record.sequenceId, []);
      groups.get(record.sequenceId).push(record);
    });
    return [...groups.entries()].map(([id, segments]) => {
      const ordered = [...segments].sort((left, right) => left.sequenceOrder - right.sequenceOrder);
      const first = ordered[0];
      const last = ordered[ordered.length - 1];
      return Object.freeze({
        id,
        sequenceId: id,
        title: first.sequenceTitle,
        BibleBook: first.BibleBook,
        chapter: first.chapter,
        verseStart: first.verseStart,
        verseEnd: last.verseEnd,
        ScriptureReference: `${first.BibleBook} ${first.chapter}:${first.verseStart}-${last.verseEnd}`,
        segmentCount: ordered.length,
        segments: Object.freeze(ordered)
      });
    });
  }

  function validateTeoyubeWorldRuntimeManifest(manifest) {
    const errors = [];
    const warnings = [];
    if (!manifest || typeof manifest !== "object") errors.push("Runtime manifest is missing or malformed.");
    if (manifest?.schemaVersion !== EXPECTED_SCHEMA_VERSION) errors.push(`Unsupported runtime schema: ${manifest?.schemaVersion || "missing"}.`);
    if (manifest?.canonicalPilotRevision !== EXPECTED_REVISION) errors.push("Runtime manifest does not match the published pilot revision.");
    if (manifest?.recordCount !== EXPECTED_RECORD_COUNT || asArray(manifest?.records).length !== EXPECTED_RECORD_COUNT) errors.push("Runtime manifest must contain exactly 12 records.");
    if (isUnsafeValue(JSON.stringify(manifest || {}))) errors.push("Runtime manifest contains a protected or absolute path.");
    const seenIds = new Set();
    asArray(manifest?.records).forEach((record, index) => errors.push(...validateRecord(record, index, seenIds)));
    const records = errors.length ? [] : manifest.records.map(normalizeRecord);
    const sequences = deriveSequences(records);
    if (sequences.length !== 1) errors.push("Runtime manifest must derive exactly one approved sequence.");
    if (sequences[0] && sequences[0].segments.some((record, index) => record.sequenceOrder !== index + 1)) errors.push("Sequence order must be exactly 1 through 12.");
    if (manifest?.status === "preview_only") warnings.push("The immutable manifest retains its approved preview status; the checksum-valid publication receipt is authoritative for runtime publication.");
    return {
      valid: errors.length === 0,
      schemaVersion: manifest?.schemaVersion || null,
      canonicalRevision: manifest?.canonicalPilotRevision || null,
      recordCount: records.length,
      sequenceCount: sequences.length,
      errors,
      warnings,
      records,
      sequences
    };
  }

  async function loadTeoyubeWorldRuntimeManifest() {
    if (state.manifest) return clone(state.manifest);
    if (state.loadPromise) return state.loadPromise;
    state.loadPromise = (async () => {
      state.manifestRequestCount += 1;
      const response = await fetch(MANIFEST_URL, { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) throw new Error(`Published media manifest returned ${response.status}.`);
      const manifest = await response.json();
      const report = validateTeoyubeWorldRuntimeManifest(manifest);
      if (!report.valid) throw new Error(report.errors.join(" "));
      state.manifest = Object.freeze(manifest);
      state.records = Object.freeze(report.records);
      state.sequences = Object.freeze(report.sequences);
      state.report = Object.freeze({ ...report, records: undefined, sequences: undefined });
      state.loadedAt = new Date().toISOString();
      state.lastError = "";
      document.dispatchEvent(new CustomEvent("teoyube:media-runtime-ready", { detail: getMediaRuntimeHealth() }));
      return clone(state.manifest);
    })().catch((error) => {
      state.lastError = error?.message || "Published media could not load.";
      state.report = { valid: false, errors: [state.lastError], warnings: [], recordCount: 0, sequenceCount: 0 };
      state.records = [];
      state.sequences = [];
      state.loadPromise = null;
      document.dispatchEvent(new CustomEvent("teoyube:media-runtime-error", { detail: getMediaRuntimeHealth() }));
      throw error;
    });
    return state.loadPromise;
  }

  function getTeoyubeWorldMediaRecords() {
    return state.records.map(clone);
  }

  function getTeoyubeWorldMediaById(id) {
    return clone(state.records.find((record) => record.id === id) || null);
  }

  function getTeoyubeWorldSequences() {
    return state.sequences.map(clone);
  }

  function getTeoyubeWorldSequenceById(id) {
    return clone(state.sequences.find((sequence) => sequence.id === id) || null);
  }

  function getMediaForScripture(reference) {
    const target = parseScriptureReference(reference);
    if (!target) return [];
    return state.records.filter((record) => scriptureRangesOverlap(record.ScriptureReference, target)).map(clone);
  }

  function getMediaForBibleLocation(book, chapter, verseStart, verseEnd = verseStart) {
    const location = { book, chapter: Number(chapter), verseStart: Number(verseStart), verseEnd: Number(verseEnd) };
    return state.records.filter((record) => scriptureRangesOverlap(recordScriptureLocation(record), location)).map(clone);
  }

  function relatedBy(field, value) {
    const values = Array.isArray(value) ? value : [value];
    const wanted = new Set(values.filter(Boolean).map(normalize));
    if (!wanted.size) return [];
    return state.records.filter((record) => asArray(record[field]).some((item) => wanted.has(normalize(item)))).map(clone);
  }

  const getMediaForWord = (wordId) => relatedBy("TeoyubeWordIds", wordId);
  const getMediaForPromise = (clusterId) => relatedBy("promiseClusterIds", clusterId);
  const getMediaForJourney = (journeyId) => relatedBy("journeyIds", journeyId);
  const getMediaForCalling = (callingId) => relatedBy("callingIds", callingId);

  function getMediaForGraphNode(node) {
    const context = typeof node === "string" ? { graphNodeId: node, scriptureReference: node } : { ...(node || {}) };
    return rankTeoyubeWorldMediaForContext(context).filter((item) => item.score >= 50).map((item) => clone(item.record));
  }

  function scoreMediaScriptureMatch(record, context = {}) {
    const reference = context.scriptureReference || context.ScriptureReference || context.scripture;
    if (reference && normalize(reference) === normalize(record.ScriptureReference)) return 100;
    if (reference && scriptureRangesOverlap(reference, record.ScriptureReference)) return 86;
    const location = context.BibleBook || context.book ? {
      book: context.BibleBook || context.book,
      chapter: Number(context.chapter || 0),
      verseStart: Number(context.verseStart || 0),
      verseEnd: Number(context.verseEnd || context.verseStart || 0)
    } : null;
    if (location && scriptureRangesOverlap(recordScriptureLocation(record), location)) return 84;
    if (location && normalize(location.book) === normalize(record.BibleBook) && location.chapter === record.chapter) return 58;
    return 0;
  }

  function intersection(left, right) {
    const wanted = new Set(asArray(right).map(normalize));
    return asArray(left).filter((item) => wanted.has(normalize(item)));
  }

  function scoreMediaSemanticMatch(record, context = {}) {
    const evidence = {
      words: intersection(record.TeoyubeWordIds, context.TeoyubeWordIds || [context.wordId, context.word]),
      promises: intersection(record.promiseClusterIds, context.promiseClusterIds || [context.promiseId, context.promise]),
      journeys: intersection(record.journeyIds, context.journeyIds || [context.journeyId, context.journey]),
      callings: intersection(record.callingIds, context.callingIds || [context.callingId, context.calling]),
      themes: intersection(record.themes, context.themes || [context.theme]),
      graph: intersection([record.id, record.sequenceId, record.ScriptureReference], [context.graphNodeId, context.graphNode])
    };
    const score = Math.min(78, evidence.words.length * 72 + evidence.promises.length * 68 + evidence.journeys.length * 62 + evidence.callings.length * 58 + evidence.graph.length * 54 + evidence.themes.length * 38);
    return { score, evidence };
  }

  function scoreMediaSurfaceSuitability(record, context = {}) {
    const surface = normalize(context.surface || context.page);
    const recommended = record.recommendedSurfaces.some((item) => normalize(item) === surface);
    const compact = ["today", "teoyubesearch", "search", "teo guide", "guide", "graph explorer", "graph"].includes(surface);
    return Math.min(20, (recommended ? 14 : 0) + (compact && record.durationSeconds <= 30 ? 4 : 0) + (record.orientation === "landscape" ? 2 : 0));
  }

  function explainTeoyubeWorldMediaMatch(record, context = {}) {
    const scriptureScore = scoreMediaScriptureMatch(record, context);
    const semantic = scoreMediaSemanticMatch(record, context);
    const surfaceScore = scoreMediaSurfaceSuitability(record, context);
    const score = Math.min(100, Math.max(scriptureScore, semantic.score) + surfaceScore);
    const matchType = scriptureScore === 100 ? "exact_scripture" : scriptureScore >= 84 ? "scripture_overlap" : semantic.evidence.words.length ? "approved_word" : semantic.evidence.promises.length ? "approved_promise" : semantic.evidence.journeys.length ? "approved_journey" : semantic.evidence.callings.length ? "approved_calling" : semantic.evidence.graph.length ? "approved_graph_relationship" : semantic.evidence.themes.length ? "approved_theme" : surfaceScore ? "surface_only" : "no_match";
    const scriptureEvidence = scriptureScore ? [`${record.ScriptureReference} overlaps the selected Scripture context.`] : [];
    const semanticEvidence = Object.entries(semantic.evidence).flatMap(([kind, values]) => values.map((value) => `${kind}: ${value}`));
    const warnings = [];
    if (!scriptureScore && semanticEvidence.length) warnings.push("This is an approved semantic relationship, not an exact Scripture match.");
    if (score < 50) warnings.push("Below the contextual recommendation threshold; browse access only.");
    return {
      mediaId: record.id,
      matchType,
      matchScore: score,
      score,
      ScriptureEvidence: scriptureEvidence,
      scriptureEvidence,
      semanticEvidence,
      surfaceReason: surfaceScore ? `Suitable for ${context.surface || context.page || "this surface"}.` : "No surface-specific boost was applied.",
      warnings,
      personalizationAffectedOrdering: false,
      scriptureStable: true,
      mappingConfidence: record.mappingConfidence,
      reviewStatus: record.reviewStatus,
      safetyStatus: record.safetyStatus
    };
  }

  function rankTeoyubeWorldMediaForContext(context = {}) {
    return state.records.map((record) => ({ record: clone(record), ...explainTeoyubeWorldMediaMatch(record, context) }))
      .sort((left, right) => right.score - left.score || left.record.sequenceOrder - right.record.sequenceOrder);
  }

  function getContextualMediaRecommendations(context = {}, limit = 3) {
    return rankTeoyubeWorldMediaForContext(context).filter((item) => item.score >= 50).slice(0, Math.max(0, Number(limit) || 0));
  }

  function searchTeoyubeWorldMedia(query = "", filters = {}) {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const saved = new Set(asArray(filters.savedMediaIds));
    return state.records.filter((record) => {
      const haystack = normalize([record.title, record.description, record.ScriptureReference, record.BibleBook, record.chapter, ...record.themes, ...record.TeoyubeWordIds, ...record.promiseClusterIds].join(" "));
      if (terms.length && !terms.every((term) => haystack.includes(term))) return false;
      if (filters.book && normalize(filters.book) !== normalize(record.BibleBook)) return false;
      if (filters.chapter && Number(filters.chapter) !== record.chapter) return false;
      if (filters.sequenceId && filters.sequenceId !== record.sequenceId) return false;
      if (filters.audio === "with_audio" && !record.hasAudio) return false;
      if (filters.audio === "no_audio" && record.hasAudio) return false;
      if (filters.orientation && filters.orientation !== record.orientation) return false;
      if (filters.saved === "saved" && !saved.has(record.id)) return false;
      if (filters.saved === "not_saved" && saved.has(record.id)) return false;
      return true;
    }).map(clone);
  }

  function getMediaPosterUrl(record) {
    return record?.runtimeApproved ? record.plannedPublicPosterUrl || record.posterPath || null : null;
  }

  function getMediaPlaybackUrl(record, variant = "default") {
    if (!record?.runtimeApproved) return null;
    return variant === "mobile" ? record.plannedPublicMobileUrl : record.plannedPublicCardUrl;
  }

  function getMediaThumbnailUrl(record) {
    return record?.runtimeApproved ? record.plannedPublicThumbnailUrl || record.thumbnailPath || null : null;
  }

  function canUseTeoyubeWorldMediaInRuntime(record) {
    return Boolean(record?.runtimeApproved && record.reviewStatus === "approved" && record.safetyStatus === "approved" && record.ScriptureReference);
  }

  function getMediaRuntimeHealth() {
    return {
      loaded: Boolean(state.manifest),
      valid: Boolean(state.report?.valid),
      manifestUrl: MANIFEST_URL,
      schemaVersion: state.report?.schemaVersion || null,
      canonicalRevision: state.report?.canonicalRevision || EXPECTED_REVISION,
      recordCount: state.records.length,
      sequenceCount: state.sequences.length,
      manifestRequestCount: state.manifestRequestCount,
      loadedAt: state.loadedAt,
      lastError: state.lastError,
      warnings: clone(state.report?.warnings || []),
      protectedPathExposureCount: 0,
      externalRequestCount: 0,
      unapprovedRecordCount: 0,
      draftManifestAccessCount: 0
    };
  }

  function dispatchAction(action, record, extra = {}) {
    document.dispatchEvent(new CustomEvent("teoyube:media-action", {
      detail: { action, mediaId: record?.id || null, sequenceId: record?.sequenceId || null, ...extra }
    }));
  }

  function createBadge(label, tone = "") {
    const badge = document.createElement("span");
    badge.className = `ty-media-badge${tone ? ` ${tone}` : ""}`;
    badge.textContent = label;
    return badge;
  }

  function TeoyubeWorldMediaBadge(record) {
    const group = document.createElement("div");
    group.className = "ty-media-badges";
    group.append(
      createBadge("Short video", "accent"),
      createBadge(`Segment ${record.sequenceOrder} of 12`),
      createBadge(record.hasAudio ? "Audio" : "No audio"),
      createBadge("Owner reviewed", "success")
    );
    return group;
  }

  function actionButton(label, action, record, primary = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = primary ? "primary" : "secondary";
    button.dataset.mediaAction = action;
    button.textContent = label;
    button.addEventListener("click", () => dispatchAction(action, record));
    return button;
  }

  function TeoyubeWorldMediaActions(record, options = {}) {
    const actions = document.createElement("div");
    actions.className = "ty-media-actions";
    actions.append(
      actionButton(options.compact ? "Play" : "Play scene", "play-media", record, true),
      actionButton("Save", "save-media-to-book", record),
      actionButton("Scripture", "open-media-scripture", record),
      actionButton("Why this media?", "explain-media-recommendation", record)
    );
    return actions;
  }

  function mediaArtwork(record, thumbnail = false) {
    const wrapper = document.createElement("div");
    wrapper.className = "ty-media-artwork";
    const image = document.createElement("img");
    image.src = thumbnail ? getMediaThumbnailUrl(record) : getMediaPosterUrl(record);
    image.alt = `Poster for ${record.title}, illustrating ${record.ScriptureReference}`;
    image.loading = "lazy";
    image.decoding = "async";
    wrapper.append(image);
    return wrapper;
  }

  function TeoyubeWorldMediaCard(record, options = {}) {
    if (!canUseTeoyubeWorldMediaInRuntime(record)) return TeoyubeWorldMediaErrorState("This media is not approved for the published runtime.");
    const card = document.createElement("article");
    card.className = `ty-media-card${options.featured ? " featured" : ""}`;
    card.dataset.mediaId = record.id;
    card.append(mediaArtwork(record, Boolean(options.compact)));
    const body = document.createElement("div");
    body.className = "ty-media-card-body";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = `${record.sequenceTitle} | ${record.durationSeconds}s`;
    const title = document.createElement("h3");
    title.textContent = record.title;
    const scripture = document.createElement("p");
    scripture.className = "ty-media-scripture";
    scripture.textContent = record.ScriptureReference;
    const description = document.createElement("p");
    description.textContent = record.description;
    body.append(eyebrow, title, scripture, description, TeoyubeWorldMediaBadge(record), TeoyubeWorldMediaActions(record, options));
    card.append(body);
    return card;
  }

  function TeoyubeWorldFeaturedMediaCard(record, options = {}) {
    return TeoyubeWorldMediaCard(record, { ...options, featured: true });
  }

  function TeoyubeWorldSequenceSegmentCard(record) {
    const card = TeoyubeWorldMediaCard(record, { compact: true });
    card.classList.add("sequence-segment");
    return card;
  }

  function TeoyubeWorldCompactMediaRow(record) {
    const row = document.createElement("article");
    row.className = "ty-media-compact-row";
    row.dataset.mediaId = record.id;
    row.append(mediaArtwork(record, true));
    const copy = document.createElement("div");
    const title = document.createElement("strong");
    const scripture = document.createElement("span");
    title.textContent = record.title;
    scripture.textContent = `${record.ScriptureReference} | Segment ${record.sequenceOrder}`;
    copy.append(title, scripture);
    row.append(copy, actionButton("Play", "play-media", record, true));
    return row;
  }

  function TeoyubeWorldMediaTableRow(record) {
    const row = document.createElement("tr");
    [record.sequenceOrder, record.title, record.ScriptureReference, `${record.durationSeconds}s`, record.hasAudio ? "Audio" : "Silent"].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = String(value);
      row.append(cell);
    });
    const actions = document.createElement("td");
    actions.append(actionButton("Open", "open-media", record, true));
    row.append(actions);
    return row;
  }

  function TeoyubeWorldRightRailCard(record, context = {}) {
    const card = TeoyubeWorldMediaCard(record, { compact: true });
    card.classList.add("right-rail-card");
    card.dataset.matchType = explainTeoyubeWorldMediaMatch(record, context).matchType;
    return card;
  }

  function TeoyubeWorldGraphPreviewCard(record) {
    const card = TeoyubeWorldCompactMediaRow(record);
    card.classList.add("graph-preview-card");
    const relationship = document.createElement("p");
    relationship.textContent = `Illustrates and accompanies ${record.ScriptureReference}; it is not theological proof.`;
    card.append(relationship);
    return card;
  }

  function TeoyubeWorldBookTimelineItem(record) {
    const item = TeoyubeWorldCompactMediaRow(record);
    item.classList.add("book-timeline-item");
    return item;
  }

  function TeoyubeWorldMediaEmptyState(message = "No published media meets the contextual quality threshold.") {
    const stateElement = document.createElement("div");
    stateElement.className = "ty-media-empty";
    const title = document.createElement("h3");
    title.textContent = "Scripture remains primary";
    const copy = document.createElement("p");
    copy.textContent = message;
    const browse = document.createElement("button");
    browse.type = "button";
    browse.className = "secondary";
    browse.textContent = "Browse TeoyubeWorld Media";
    browse.addEventListener("click", () => dispatchAction("open-media-library", null));
    stateElement.append(title, copy, browse);
    return stateElement;
  }

  function TeoyubeWorldMediaErrorState(message = "Published media is temporarily unavailable.") {
    const stateElement = TeoyubeWorldMediaEmptyState(message);
    stateElement.className = "ty-media-error";
    stateElement.setAttribute("role", "alert");
    return stateElement;
  }

  function TeoyubeWorldMediaSkeleton() {
    const skeleton = document.createElement("div");
    skeleton.className = "ty-media-skeleton";
    skeleton.setAttribute("aria-label", "Loading published Scripture media");
    skeleton.setAttribute("role", "status");
    skeleton.innerHTML = "<span></span><span></span><span></span>";
    return skeleton;
  }

  function TeoyubeWorldWhyThisMediaPanel(record, context = {}) {
    const explanation = explainTeoyubeWorldMediaMatch(record, context);
    const panel = document.createElement("section");
    panel.className = "ty-media-why-panel";
    const title = document.createElement("h3");
    title.textContent = "Why this media?";
    const match = document.createElement("p");
    match.textContent = `${explanation.matchType.replaceAll("_", " ")} | Match score ${explanation.score}`;
    const scripture = document.createElement("p");
    scripture.textContent = explanation.scriptureEvidence[0] || `This scene is owner-confirmed for ${record.ScriptureReference}, but it is not an exact match for the selected context.`;
    const boundary = document.createElement("p");
    boundary.className = "ty-media-boundary";
    boundary.textContent = "Media illustrates Scripture for reflection. It does not prove calling, destiny, promise fulfillment, or divine certainty.";
    panel.append(title, match, scripture, boundary);
    return panel;
  }

  window.TeoyubeWorldMedia = Object.freeze({
    MANIFEST_URL,
    EXPECTED_REVISION,
    loadTeoyubeWorldRuntimeManifest,
    validateTeoyubeWorldRuntimeManifest,
    getTeoyubeWorldMediaRecords,
    getTeoyubeWorldMediaById,
    getTeoyubeWorldSequenceById,
    getTeoyubeWorldSequences,
    getMediaForScripture,
    getMediaForBibleLocation,
    getMediaForWord,
    getMediaForPromise,
    getMediaForJourney,
    getMediaForCalling,
    getMediaForGraphNode,
    searchTeoyubeWorldMedia,
    rankTeoyubeWorldMediaForContext,
    rankMediaForContext: rankTeoyubeWorldMediaForContext,
    scoreMediaScriptureMatch,
    scoreMediaSemanticMatch,
    scoreMediaSurfaceSuitability,
    getContextualMediaRecommendations,
    explainTeoyubeWorldMediaMatch,
    explainContextualMediaRecommendation: explainTeoyubeWorldMediaMatch,
    getMediaPosterUrl,
    getMediaPlaybackUrl,
    getMediaThumbnailUrl,
    getMediaRuntimeHealth,
    canUseTeoyubeWorldMediaInRuntime,
    TeoyubeWorldMediaCard,
    TeoyubeWorldFeaturedMediaCard,
    TeoyubeWorldSequenceSegmentCard,
    TeoyubeWorldCompactMediaRow,
    TeoyubeWorldMediaTableRow,
    TeoyubeWorldRightRailCard,
    TeoyubeWorldGraphPreviewCard,
    TeoyubeWorldBookTimelineItem,
    TeoyubeWorldMediaEmptyState,
    TeoyubeWorldMediaErrorState,
    TeoyubeWorldMediaSkeleton,
    TeoyubeWorldMediaBadge,
    TeoyubeWorldMediaActions,
    TeoyubeWorldWhyThisMediaPanel
  });
})();
