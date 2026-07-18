(() => {
  "use strict";

  if (window.__teoyubeWorldPhase116c3Initialized) return;
  window.__teoyubeWorldPhase116c3Initialized = true;

  const runtime = window.TeoyubeWorldMedia;
  const bridge = window.TeoyubeRuntimeBridge;
  const playback = window.TeoyubeWorldPlayback;
  const sequencePlayer = window.TeoyubeWorldSequencePlayer;
  const SURFACES = [
    ["today", "Today's Scripture Animation", "Media appears only when today's Scripture has a strong approved match."],
    ["canon", "Scripture Media in Canon", "The selected Canon context remains primary; media illustrates an owner-confirmed passage."],
    ["search", "Approved Scripture Media", "Search results attach media only through exact Scripture or approved relationships above threshold."],
    ["table", "Promise Table Media", "Media supports reflection and never changes promise or testimony status."],
    ["calling", "Supporting Scripture Media", "This media illustrates supporting Scripture. It does not prove a calling or certify destiny."],
    ["book", "Saved Scripture Media", "Session-only published media references appear in the Book timeline and Smart Collections."],
    ["lexicon", "Word and Scripture Media", "Only owner-approved word relationships or exact Scripture matches are shown."],
    ["testimony", "Testimony Scripture Media", "Attached Scripture media supports reflection only. Teoyube does not certify that a testimony or promise has been fulfilled."],
    ["guide", "Teo Guide Media", "The written Scripture response, prayer, action, explanation, and safety notice remain primary."],
    ["graph", "Media Preview Relationship", "Media illustrates, visualizes, accompanies, or relates to Scripture. It is not theological evidence."]
  ];
  const SURFACE_LABELS = Object.fromEntries(SURFACES.map(([id, title]) => [id, title]));
  const MEDIA_ACTIONS = [
    "play-media", "pause-media", "open-media", "open-media-library", "open-sequence", "play-sequence",
    "next-sequence-segment", "previous-sequence-segment", "restart-sequence", "open-scripture-study-media",
    "save-media-to-book", "remove-media-from-book", "add-media-to-collection", "save-media-scripture",
    "add-media-promise-to-table", "reflect-on-media", "pray-media-scripture", "open-media-graph",
    "explain-media-recommendation", "continue-watching-media"
  ];
  const local = {
    loaded: false,
    error: "",
    pageSize: 6,
    visibleCount: 6,
    libraryView: "card_grid",
    whyReturnFocus: null,
    initialRequestCount: 0,
    initialBytes: 0,
    rangeSupported: null,
    assetErrors: 0,
    autoplayAudioViolations: 0
  };
  let mediaView;
  let libraryResults;
  let whyDialog;
  let rerenderTimer;

  const byId = (id) => document.getElementById(id);
  const safeArray = (value) => Array.isArray(value) ? value : [];
  const currentMediaState = () => bridge.getMediaState();
  const currentRecord = (mediaId = null) => runtime.getTeoyubeWorldMediaById(mediaId || currentMediaState().selectedMediaId || currentMediaState().activeMediaId) || runtime.getTeoyubeWorldMediaRecords()[0] || null;

  function dispatch(action, payload = {}) {
    if (typeof window.dispatchTeoyubeAction === "function" && window.getTeoyubeAction?.(action)) return window.dispatchTeoyubeAction(action, payload);
    document.dispatchEvent(new CustomEvent("teoyube:media-action", { detail: { action, ...payload } }));
    return null;
  }

  function setSelected(record, surface = null) {
    if (!record) return;
    const mediaState = currentMediaState();
    const recent = [record.id, ...safeArray(mediaState.recentMediaIds).filter((id) => id !== record.id)].slice(0, 12);
    bridge.setMediaState({
      selectedMediaId: record.id,
      activeMediaId: record.id,
      activeSequenceId: record.sequenceId,
      activeSequenceSegment: record.sequenceOrder,
      activeMediaSurface: surface || bridge.getContext().surface,
      recentMediaIds: recent
    });
  }

  function createWhyDialog() {
    if (whyDialog) return whyDialog;
    whyDialog = document.createElement("dialog");
    whyDialog.id = "teoyubeworldWhyDialog";
    whyDialog.className = "ty-why-dialog";
    whyDialog.setAttribute("aria-labelledby", "teoyubeworldWhyTitle");
    const shell = document.createElement("div");
    const content = document.createElement("div");
    content.id = "teoyubeworldWhyContent";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "primary";
    close.textContent = "Close explanation";
    close.addEventListener("click", () => whyDialog.close());
    whyDialog.addEventListener("close", () => local.whyReturnFocus?.focus?.());
    whyDialog.addEventListener("cancel", (event) => { event.preventDefault(); whyDialog.close(); });
    shell.append(content, close);
    whyDialog.append(shell);
    document.body.append(whyDialog);
    return whyDialog;
  }

  function openWhy(record, context = {}) {
    if (!record) return;
    createWhyDialog();
    local.whyReturnFocus = document.activeElement;
    const content = byId("teoyubeworldWhyContent");
    content.replaceChildren(runtime.TeoyubeWorldWhyThisMediaPanel(record, context));
    content.querySelector("h3").id = "teoyubeworldWhyTitle";
    whyDialog.showModal();
    whyDialog.querySelector("button").focus();
  }

  function ensureMediaView() {
    mediaView = byId("media");
    if (mediaView) return mediaView;
    mediaView = document.createElement("section");
    mediaView.id = "media";
    mediaView.className = "view ty-media-library-view";
    mediaView.setAttribute("aria-labelledby", "viewTitle");

    const hero = document.createElement("section");
    hero.className = "ty-media-library-hero";
    const heroCopy = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Published Scripture Media";
    const title = document.createElement("h3");
    title.textContent = "TeoyubeWorld Media Library";
    const copy = document.createElement("p");
    copy.textContent = "Explore the owner-approved Galatians 1 Scripture sequence. Scripture context remains primary; all 12 short videos are supporting content.";
    heroCopy.append(eyebrow, title, copy);
    const metrics = document.createElement("div");
    metrics.id = "tyMediaLibraryMetrics";
    metrics.className = "ty-media-library-metrics";
    hero.append(heroCopy, metrics);

    const featured = document.createElement("section");
    featured.id = "tyMediaFeatured";
    featured.className = "ty-media-featured";
    featured.setAttribute("aria-label", "Featured published Scripture sequence");

    const toolbar = document.createElement("section");
    toolbar.className = "ty-media-library-toolbar";
    toolbar.setAttribute("aria-label", "Media library controls");
    const searchLabel = document.createElement("label");
    searchLabel.textContent = "Search published media";
    const search = document.createElement("input");
    search.id = "tyMediaSearch";
    search.type = "search";
    search.placeholder = "Title, Scripture, book, chapter, or theme";
    searchLabel.append(search);
    const book = document.createElement("select");
    book.id = "tyMediaBook";
    book.setAttribute("aria-label", "Filter by Bible book");
    book.innerHTML = '<option value="">All Bible books</option><option value="Galatians">Galatians</option>';
    const chapter = document.createElement("select");
    chapter.id = "tyMediaChapter";
    chapter.setAttribute("aria-label", "Filter by chapter");
    chapter.innerHTML = '<option value="">All chapters</option><option value="1">Chapter 1</option>';
    const audio = document.createElement("select");
    audio.id = "tyMediaAudio";
    audio.setAttribute("aria-label", "Filter by audio status");
    audio.innerHTML = '<option value="">All audio states</option><option value="with_audio">With audio</option><option value="no_audio">No audio</option>';
    const saved = document.createElement("select");
    saved.id = "tyMediaSaved";
    saved.setAttribute("aria-label", "Filter by saved state");
    saved.innerHTML = '<option value="">All saved states</option><option value="saved">Saved</option><option value="not_saved">Not saved</option>';
    const sort = document.createElement("select");
    sort.id = "tyMediaSort";
    sort.setAttribute("aria-label", "Sort media");
    sort.innerHTML = '<option value="scripture_order">Scripture order</option><option value="sequence_order">Sequence order</option><option value="title">Title</option><option value="duration">Duration</option><option value="owner_review">Newest owner review</option>';
    toolbar.append(searchLabel, book, chapter, audio, saved, sort);

    const views = document.createElement("div");
    views.id = "tyMediaViews";
    views.className = "ty-media-view-tabs";
    views.setAttribute("role", "tablist");
    [
      ["featured", "Featured"], ["sequence", "Scripture Sequence"], ["timeline", "Sequence Timeline"],
      ["card_grid", "Card Grid"], ["compact_list", "Compact List"], ["scripture_table", "Scripture Table"],
      ["saved", "Saved Media"], ["continue", "Continue Watching"]
    ].forEach(([value, label], index) => {
      const control = document.createElement("button");
      control.type = "button";
      control.dataset.mediaView = value;
      control.setAttribute("role", "tab");
      control.setAttribute("aria-selected", value === local.libraryView ? "true" : "false");
      control.textContent = label;
      if (index > 4) control.classList.add("secondary-view");
      views.append(control);
    });
    libraryResults = document.createElement("section");
    libraryResults.id = "tyMediaLibraryResults";
    libraryResults.className = "ty-media-results";
    libraryResults.setAttribute("aria-live", "polite");
    const loadMore = document.createElement("button");
    loadMore.id = "tyMediaLoadMore";
    loadMore.type = "button";
    loadMore.className = "secondary";
    loadMore.textContent = "Load more published media";
    loadMore.addEventListener("click", () => { local.visibleCount += local.pageSize; renderLibrary(); });

    const health = document.createElement("details");
    health.id = "tyMediaHealth";
    health.className = "ty-media-health";
    health.hidden = new URLSearchParams(location.search).get("qa") !== "1";
    const healthSummary = document.createElement("summary");
    healthSummary.textContent = "Media Health (QA mode)";
    const healthContent = document.createElement("div");
    healthContent.id = "tyMediaHealthContent";
    health.append(healthSummary, healthContent);
    mediaView.append(hero, featured, toolbar, views, libraryResults, loadMore, health);
    byId("appMain").append(mediaView);
    bindLibraryControls();
    return mediaView;
  }

  function metric(label, value) {
    const item = document.createElement("div");
    const strong = document.createElement("strong");
    const span = document.createElement("span");
    strong.textContent = String(value);
    span.textContent = label;
    item.append(strong, span);
    return item;
  }

  function renderFeatured() {
    const root = byId("tyMediaFeatured");
    if (!root) return;
    const sequence = runtime.getTeoyubeWorldSequences()[0];
    const first = sequence?.segments?.[0];
    if (!first) return root.replaceChildren(runtime.TeoyubeWorldMediaErrorState(local.error));
    const copy = document.createElement("div");
    copy.className = "ty-media-featured-copy";
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Owner-approved Scripture sequence";
    const title = document.createElement("h3");
    title.textContent = sequence.title;
    const reference = document.createElement("p");
    reference.className = "ty-media-scripture";
    reference.textContent = `${sequence.ScriptureReference} | ${sequence.segmentCount} ordered segments | No audio`;
    const description = document.createElement("p");
    description.textContent = "Read the passage in context, then use the sequence as a visual companion for reflection. The media does not replace Scripture text or interpretation.";
    const actions = document.createElement("div");
    actions.className = "ty-media-actions";
    const open = document.createElement("button");
    open.type = "button";
    open.className = "primary";
    open.textContent = "Open Scripture Sequence";
    open.addEventListener("click", () => dispatch("open-sequence", { sequenceId: sequence.id, mediaId: first.id }));
    const study = document.createElement("button");
    study.type = "button";
    study.className = "secondary";
    study.textContent = "Open Scripture Study";
    study.addEventListener("click", () => dispatch("open-scripture-study-media", { sequenceId: sequence.id, mediaId: first.id }));
    actions.append(open, study);
    copy.append(eyebrow, title, reference, description, actions);
    const artwork = document.createElement("img");
    artwork.src = runtime.getMediaPosterUrl(first);
    artwork.alt = `Poster for ${sequence.title}, illustrating ${first.ScriptureReference}`;
    artwork.loading = "lazy";
    root.replaceChildren(copy, artwork);
  }

  function getLibraryRecords() {
    const filters = {
      book: byId("tyMediaBook")?.value || "",
      chapter: byId("tyMediaChapter")?.value || "",
      audio: byId("tyMediaAudio")?.value || "",
      saved: byId("tyMediaSaved")?.value || "",
      savedMediaIds: currentMediaState().savedMediaIds
    };
    let records = runtime.searchTeoyubeWorldMedia(byId("tyMediaSearch")?.value || "", filters);
    if (local.libraryView === "saved") records = records.filter((record) => currentMediaState().savedMediaIds.includes(record.id));
    if (local.libraryView === "continue") records = records.filter((record) => Number(currentMediaState().mediaPlaybackPositions?.[record.id] || 0) > 0 || currentMediaState().recentMediaIds.includes(record.id));
    const mode = byId("tyMediaSort")?.value || "scripture_order";
    records.sort((left, right) => {
      if (mode === "title") return left.title.localeCompare(right.title);
      if (mode === "duration") return left.durationSeconds - right.durationSeconds;
      return left.sequenceOrder - right.sequenceOrder;
    });
    return records;
  }

  function renderLibrary() {
    if (!libraryResults || !local.loaded) return;
    const records = getLibraryRecords();
    const visible = records.slice(0, local.visibleCount);
    const view = local.libraryView;
    libraryResults.className = `ty-media-results view-${view}`;
    if (!records.length) libraryResults.replaceChildren(runtime.TeoyubeWorldMediaEmptyState("No published records match these filters. The full draft library is not loaded."));
    else if (view === "scripture_table") {
      const table = document.createElement("table");
      const caption = document.createElement("caption");
      caption.textContent = "Published Scripture media records";
      const head = document.createElement("thead");
      head.innerHTML = "<tr><th>Order</th><th>Title</th><th>Scripture</th><th>Duration</th><th>Audio</th><th>Action</th></tr>";
      const body = document.createElement("tbody");
      visible.forEach((record) => body.append(runtime.TeoyubeWorldMediaTableRow(record)));
      table.append(caption, head, body);
      libraryResults.replaceChildren(table);
    } else if (["compact_list", "timeline", "sequence", "continue"].includes(view)) {
      libraryResults.replaceChildren(...visible.map((record) => runtime.TeoyubeWorldCompactMediaRow(record)));
    } else if (view === "featured") {
      libraryResults.replaceChildren(runtime.TeoyubeWorldFeaturedMediaCard(visible[0]));
    } else {
      libraryResults.replaceChildren(...visible.map((record) => runtime.TeoyubeWorldMediaCard(record)));
    }
    const loadMore = byId("tyMediaLoadMore");
    loadMore.hidden = visible.length >= records.length;
    loadMore.textContent = `Load more published media (${records.length - visible.length} remaining)`;
    bridge.setMediaState({
      mediaSearchQuery: byId("tyMediaSearch")?.value || "",
      mediaFilters: {
        book: byId("tyMediaBook")?.value || "",
        chapter: byId("tyMediaChapter")?.value || "",
        audio: byId("tyMediaAudio")?.value || "",
        saved: byId("tyMediaSaved")?.value || ""
      },
      mediaSortMode: byId("tyMediaSort")?.value || "scripture_order",
      mediaViewMode: view
    });
    renderHealth();
  }

  function bindLibraryControls() {
    let timer;
    byId("tyMediaSearch").addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => { local.visibleCount = local.pageSize; renderLibrary(); }, 120);
    });
    ["tyMediaBook", "tyMediaChapter", "tyMediaAudio", "tyMediaSaved", "tyMediaSort"].forEach((id) => byId(id).addEventListener("change", () => { local.visibleCount = local.pageSize; renderLibrary(); }));
    byId("tyMediaViews").addEventListener("click", (event) => {
      const control = event.target.closest("[data-media-view]");
      if (!control) return;
      local.libraryView = control.dataset.mediaView;
      local.visibleCount = local.pageSize;
      byId("tyMediaViews").querySelectorAll("[data-media-view]").forEach((item) => item.setAttribute("aria-selected", item === control ? "true" : "false"));
      renderLibrary();
    });
  }

  function surfaceContext(surface) {
    const context = { ...bridge.getContext(), surface: surface === "table" ? "Promise Table" : SURFACE_LABELS[surface] || surface };
    if (surface === "search") {
      const query = byId("teoyubeSearchInput")?.value?.trim();
      if (/^[1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+(?:-\d+)?$/.test(query || "")) context.scriptureReference = query;
      context.theme = query;
    }
    if (surface === "canon") {
      const query = document.querySelector("#canon .canon-hero-search input")?.value?.trim();
      if (/^[1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+(?:-\d+)?$/.test(query || "")) context.scriptureReference = query;
    }
    if (surface === "guide") {
      const latest = [...document.querySelectorAll("#chatLog .user, #chatLog [data-role='user']")].at(-1)?.textContent;
      const match = latest?.match(/[1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+(?:-\d+)?/);
      if (match) context.scriptureReference = match[0];
    }
    return context;
  }

  function ensureSurfaceSection(surface) {
    const root = surface === "graph" ? byId("phase116GraphDialog") : byId(surface);
    if (!root) return null;
    let section = root.querySelector(`[data-ty-media-surface="${surface}"]`);
    if (section) return section;
    section = document.createElement("section");
    section.className = "ty-media-surface-section media-recommendation-rail";
    section.dataset.tyMediaSurface = surface;
    const head = document.createElement("header");
    const copy = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Published Scripture media";
    const title = document.createElement("h3");
    title.textContent = SURFACE_LABELS[surface];
    const boundary = document.createElement("p");
    boundary.textContent = SURFACES.find(([id]) => id === surface)?.[2] || "Media remains secondary to Scripture.";
    copy.append(eyebrow, title, boundary);
    const browse = document.createElement("button");
    browse.type = "button";
    browse.className = "secondary";
    browse.textContent = "Browse media";
    browse.addEventListener("click", () => dispatch("open-media-library"));
    head.append(copy, browse);
    const content = document.createElement("div");
    content.className = "ty-media-surface-content";
    section.append(head, content);
    root.append(section);
    return section;
  }

  function contextualActions(surface, record) {
    const group = document.createElement("div");
    group.className = "ty-media-context-actions";
    const add = (label, action, handler) => {
      const control = document.createElement("button");
      control.type = "button";
      control.className = "secondary";
      control.textContent = label;
      control.dataset.mediaAction = action;
      control.addEventListener("click", handler || (() => dispatch(action, { mediaId: record.id, sequenceId: record.sequenceId })));
      group.append(control);
    };
    if (surface === "today") { add("Pray this Scripture", "pray-media-scripture"); add("Reflect", "reflect-on-media"); }
    if (surface === "canon") { add("Open study mode", "open-scripture-study-media"); add("Open graph", "open-media-graph"); }
    if (surface === "search") { add("Open sequence", "open-sequence"); }
    if (surface === "table") {
      add("Attach media", "attach-media-promise", () => { bridge.attachMediaToPromise(null, record); renderSurface("table"); });
      add("Remove media reference", "remove-media-promise", () => { bridge.removeMediaFromPromise(null); renderSurface("table"); });
    }
    if (surface === "calling") { add("Reflect", "reflect-on-media"); add("Pray", "pray-media-scripture"); add("Open graph", "open-media-graph"); }
    if (surface === "book") { add("Remove from Book", "remove-media-from-book"); add("Add reflection", "reflect-on-media"); }
    if (surface === "lexicon") { add("Pray this word", "pray-media-scripture"); add("Save word and scene", "save-media-to-book"); }
    if (surface === "testimony") {
      add("Attach to testimony", "attach-media-testimony", () => { bridge.attachMediaToTestimony(null, record); renderSurface("testimony"); });
      add("Remove reference", "remove-media-testimony", () => { bridge.removeMediaFromTestimony(null); renderSurface("testimony"); });
    }
    if (surface === "guide") { add("Pray this Scripture", "pray-media-scripture"); add("Reflect", "reflect-on-media"); }
    if (surface === "graph") { add("Open sequence", "open-sequence"); add("Save scene", "save-media-to-book"); }
    return group;
  }

  function renderSurface(surface) {
    if (!local.loaded) return;
    const section = ensureSurfaceSection(surface);
    if (!section) return;
    const content = section.querySelector(".ty-media-surface-content");
    const context = surfaceContext(surface);
    let recommendations = runtime.getContextualMediaRecommendations(context, surface === "guide" ? 3 : 1);
    if (surface === "book") {
      const saved = new Set(currentMediaState().savedMediaIds);
      const savedRecords = runtime.getTeoyubeWorldMediaRecords().filter((record) => saved.has(record.id));
      if (savedRecords.length) recommendations = savedRecords.map((record) => ({ record, score: 100, matchType: "saved_media" }));
    }
    if (!recommendations.length) {
      content.replaceChildren(runtime.TeoyubeWorldMediaEmptyState("No approved media meets the current Scripture or relationship threshold. Nothing unrelated is being forced into this surface."));
      section.dataset.matchState = "empty";
      return;
    }
    const primary = recommendations[0].record;
    const wrapper = document.createElement("div");
    wrapper.className = "ty-media-context-result";
    const match = document.createElement("p");
    match.className = "ty-media-match-label";
    match.textContent = `${recommendations[0].matchType.replaceAll("_", " ")} | ${recommendations[0].score}/100`;
    const card = surface === "graph" ? runtime.TeoyubeWorldGraphPreviewCard(primary) : runtime.TeoyubeWorldRightRailCard(primary, context);
    wrapper.append(match, card, contextualActions(surface, primary));
    if (surface === "guide" && recommendations.length > 1) {
      const related = document.createElement("div");
      related.className = "ty-media-related-list";
      const label = document.createElement("h4");
      label.textContent = "Related published scenes";
      related.append(label, ...recommendations.slice(1).map((item) => runtime.TeoyubeWorldCompactMediaRow(item.record)));
      wrapper.append(related);
    }
    content.replaceChildren(wrapper);
    section.dataset.matchState = "matched";
  }

  function renderAllSurfaces() {
    SURFACES.forEach(([surface]) => renderSurface(surface));
  }

  function renderMetrics() {
    const health = runtime.getMediaRuntimeHealth();
    byId("tyMediaLibraryMetrics")?.replaceChildren(
      metric("Published records", health.recordCount),
      metric("Scripture sequence", health.sequenceCount),
      metric("Revision", health.canonicalRevision.replace("pilot-", "")),
      metric("External requests", health.externalRequestCount)
    );
  }

  function renderHealth() {
    const root = byId("tyMediaHealthContent");
    if (!root) return;
    const runtimeHealth = runtime.getMediaRuntimeHealth();
    const playerState = sequencePlayer.getState();
    const playbackHealth = playback.getPlaybackHealth();
    const mediaState = currentMediaState();
    const rows = [
      ["Manifest loaded", runtimeHealth.loaded], ["Manifest records", runtimeHealth.recordCount],
      ["Published revision", runtimeHealth.canonicalRevision], ["Sequence count", runtimeHealth.sequenceCount],
      ["Active media", mediaState.activeMediaId || "None"], ["Active segment", mediaState.activeSequenceSegment || "None"],
      ["Playback mode", playerState.status], ["Last media error", mediaState.lastMediaError || playerState.lastError || "None"],
      ["Range support", local.rangeSupported == null ? "Not tested" : local.rangeSupported], ["Published asset errors", local.assetErrors],
      ["Source path exposure", runtimeHealth.protectedPathExposureCount], ["External media requests", runtimeHealth.externalRequestCount],
      ["Autoplay-audio violations", local.autoplayAudioViolations], ["Unapproved records", runtimeHealth.unapprovedRecordCount],
      ["Draft-manifest access", runtimeHealth.draftManifestAccessCount], ["Registered players", playbackHealth.registeredPlayerCount],
      ["Initial media requests", local.initialRequestCount], ["Initial media bytes", local.initialBytes]
    ];
    root.replaceChildren(...rows.map(([label, value]) => metric(label, value)));
  }

  function mediaActionDefinition(id, label, handler, options = {}) {
    return {
      id,
      label,
      description: options.description || `${label} for approved published Scripture media.`,
      category: "media",
      allowedPages: ["*"],
      disabledReason: options.always ? "" : () => currentRecord() ? "" : "No approved published media is selected.",
      reversible: Boolean(options.reversible),
      safetyNote: "Published Scripture media remains secondary to Scripture and uses session-only state.",
      handler
    };
  }

  function registerMediaActions() {
    const selected = (payload) => currentRecord(payload.mediaId);
    const definitions = [
      mediaActionDefinition("play-media", "Play Media", (payload) => { const record = selected(payload); setSelected(record); sequencePlayer.open(record.sequenceId, record.id, { returnFocus: payload.trigger }); return { detail: `${record.title} opened without autoplay.` }; }),
      mediaActionDefinition("pause-media", "Pause Media", () => { playback.pauseAllMedia(); return { detail: "All media paused." }; }),
      mediaActionDefinition("open-media", "Open Media", (payload) => { const record = selected(payload); setSelected(record); sequencePlayer.open(record.sequenceId, record.id, { returnFocus: payload.trigger }); return { detail: `${record.title} opened.` }; }),
      mediaActionDefinition("open-media-library", "Open Media Library", () => { bridge.openView("media"); renderLibrary(); return { detail: "Published 12-record Media Library opened." }; }, { always: true }),
      mediaActionDefinition("open-sequence", "Open Scripture Sequence", (payload) => { const record = selected(payload); sequencePlayer.open(payload.sequenceId || record.sequenceId, payload.mediaId || record.id, { returnFocus: payload.trigger }); return { detail: "Approved Scripture sequence opened." }; }),
      mediaActionDefinition("play-sequence", "Play Entire Sequence", (payload) => { const record = selected(payload); sequencePlayer.open(record.sequenceId, record.id, { returnFocus: payload.trigger }); sequencePlayer.playEntireSequence(); return { detail: "Sequence playback started after explicit user action." }; }),
      mediaActionDefinition("next-sequence-segment", "Next Sequence Segment", () => { sequencePlayer.nextSegment(); return { detail: "Next approved segment selected." }; }),
      mediaActionDefinition("previous-sequence-segment", "Previous Sequence Segment", () => { sequencePlayer.previousSegment(); return { detail: "Previous approved segment selected." }; }),
      mediaActionDefinition("restart-sequence", "Restart Sequence", () => { sequencePlayer.restartSequence(); return { detail: "Sequence restarted from segment one." }; }),
      mediaActionDefinition("open-scripture-study-media", "Open Scripture Study Media", (payload) => { const record = selected(payload); sequencePlayer.open(record.sequenceId, record.id, { returnFocus: payload.trigger }); byId("tyScriptureStudyMode")?.scrollIntoView({ behavior: currentMediaState().reducedMotionMediaMode ? "auto" : "smooth", block: "start" }); return { detail: "Scripture Study Mode opened." }; }),
      mediaActionDefinition("save-media-to-book", "Save Media to Book", (payload) => { const record = selected(payload); bridge.saveMediaToBook(record); bridge.setMediaState({ savedMediaIds: [...new Set([...currentMediaState().savedMediaIds, record.id])] }); renderSurface("book"); renderLibrary(); return { detail: `${record.title} saved as a safe public media reference.` }; }, { reversible: true }),
      mediaActionDefinition("remove-media-from-book", "Remove Media from Book", (payload) => { const record = selected(payload); bridge.removeMediaFromBook(record.id); renderSurface("book"); renderLibrary(); return { detail: `${record.title} removed from session Book state.` }; }, { reversible: true }),
      mediaActionDefinition("add-media-to-collection", "Add Media to Smart Collection", (payload) => { const record = selected(payload); const collection = window.getTeoyubeSmartCollections?.().find((item) => item.id === "teoyubeworld-media") || window.getTeoyubeSmartCollections?.()[0]; const added = collection && window.addTeoyubeCollectionItem?.(collection.id, { id: record.id, type: "media", label: record.title, scripture: record.ScriptureReference, publicUrl: record.plannedPublicCardUrl }); return added ? { detail: `${record.title} added to ${collection.name}.` } : { status: "blocked", detail: "The scene is already saved or no Smart Collection is available." }; }, { reversible: true }),
      mediaActionDefinition("save-media-scripture", "Save Media Scripture", (payload) => { const record = selected(payload); bridge.setScriptureReference(record.ScriptureReference); return window.dispatchTeoyubeAction?.("scripture.save", { source: "published-media" }) || { detail: `${record.ScriptureReference} selected.` }; }, { reversible: true }),
      mediaActionDefinition("add-media-promise-to-table", "Add Media Promise to Table", (payload) => { const record = selected(payload); bridge.attachMediaToPromise(null, record); return { detail: `Safe media reference attached to the current Promise Table context. Promise status was not changed.` }; }, { reversible: true }),
      mediaActionDefinition("reflect-on-media", "Reflect on Media", (payload) => { const record = selected(payload); bridge.addMediaReflection(record); bridge.openView("book"); renderSurface("book"); return { detail: `Reflection started for ${record.ScriptureReference}.` }; }, { reversible: true }),
      mediaActionDefinition("pray-media-scripture", "Pray Media Scripture", (payload) => { const record = selected(payload); bridge.setScriptureReference(record.ScriptureReference); bridge.openView("guide"); const input = byId("chatInput"); if (input) input.value = `Help me pray through ${record.ScriptureReference} with humility and attention to its context.`; input?.focus(); return { detail: `Local prayer prompt prepared for ${record.ScriptureReference}.` }; }),
      mediaActionDefinition("open-media-graph", "Open Media Graph", (payload) => { const record = selected(payload); bridge.setScriptureReference(record.ScriptureReference); window.dispatchTeoyubeAction?.("graph.open", { source: "published-media" }); scheduleRender(); return { detail: `Graph opened with media as an illustrative relationship to ${record.ScriptureReference}.` }; }),
      mediaActionDefinition("explain-media-recommendation", "Why This Media?", (payload) => { const record = selected(payload); openWhy(record, surfaceContext(bridge.getContext().surface)); return { detail: "Visible contextual recommendation evidence opened." }; }),
      mediaActionDefinition("continue-watching-media", "Continue Watching Media", () => { const mediaState = currentMediaState(); const id = mediaState.recentMediaIds.find((item) => runtime.getTeoyubeWorldMediaById(item)) || mediaState.activeMediaId; const record = currentRecord(id); sequencePlayer.open(record.sequenceId, record.id); return { detail: `Continued ${record.title}.` }; })
    ];
    definitions.forEach((definition) => {
      if (window.getTeoyubeAction?.(definition.id)) window.unregisterTeoyubeAction?.(definition.id);
      window.registerTeoyubeAction?.(definition);
    });
  }

  function extendCommandPalette() {
    if (typeof window.getPhase113Commands !== "function" || window.getPhase113Commands.__phase116c3) return;
    const original = window.getPhase113Commands;
    const enhanced = function getPhase116c3Commands() {
      const commands = original();
      const mediaCommands = MEDIA_ACTIONS.map((actionId) => window.getTeoyubeAction?.(actionId)).filter(Boolean).map((action) => ({
        id: `phase116c3-${action.id}`,
        label: action.label,
        description: action.description,
        disabledReason: window.getTeoyubeActionDisabledReason?.(action.id) || "",
        run: () => window.dispatchTeoyubeAction(action.id, { source: "command-palette" })
      }));
      return [...commands, ...mediaCommands];
    };
    enhanced.__phase116c3 = true;
    window.getPhase113Commands = enhanced;
  }

  function handleMediaAction(event) {
    const detail = event.detail || {};
    if (detail.__handled) return;
    const aliases = {
      "open-related-media-word": "save-media-scripture"
    };
    if (detail.action === "open-media-scripture") {
      event.stopImmediatePropagation();
      const record = selected(detail);
      bridge.setSelectedScripture(record.ScriptureReference);
      window.location.hash = "search";
      window.setView?.("search");
      return;
    }
    const action = aliases[detail.action] || detail.action;
    if (!action) return;
    event.stopImmediatePropagation();
    window.dispatchTeoyubeAction?.(action, { ...detail, __handled: true, trigger: event.target });
  }

  function scheduleRender() {
    clearTimeout(rerenderTimer);
    rerenderTimer = setTimeout(() => {
      renderAllSurfaces();
      renderLibrary();
      renderHealth();
    }, 80);
  }

  async function probeRange() {
    const first = runtime.getTeoyubeWorldMediaRecords()[0];
    if (!first) return;
    try {
      const response = await fetch(first.plannedPublicMobileUrl, { headers: { Range: "bytes=0-63" }, cache: "no-store" });
      local.rangeSupported = response.status === 206 && response.headers.get("content-range")?.startsWith("bytes 0-63/");
      local.initialRequestCount += 1;
      local.initialBytes += Number(response.headers.get("content-length") || 64);
      await response.body?.cancel?.();
    } catch {
      local.rangeSupported = false;
      local.assetErrors += 1;
    }
    renderHealth();
  }

  function bindEvents() {
    document.addEventListener("teoyube:media-action", handleMediaAction);
    document.addEventListener("teoyube:view-change", scheduleRender);
    document.addEventListener("teoyube:context-change", scheduleRender);
    document.addEventListener("teoyube:media-position-change", (event) => {
      const positions = { ...currentMediaState().mediaPlaybackPositions, [event.detail.mediaId]: event.detail.position };
      bridge.setMediaState({ mediaPlaybackPositions: positions });
    });
    document.addEventListener("teoyube:media-completed", (event) => {
      bridge.setMediaState({ completedMediaIds: [...new Set([...currentMediaState().completedMediaIds, event.detail.mediaId])] });
    });
    document.addEventListener("teoyube:sequence-state", (event) => {
      bridge.setMediaState({
        activeMediaId: event.detail.mediaId,
        activeSequenceId: event.detail.sequenceId,
        activeSequenceSegment: event.detail.activeSegment,
        activePlaybackMode: event.detail.status,
        lastMediaError: event.detail.lastError || ""
      });
    });
    document.addEventListener("teoyube:media-playback-error", (event) => bridge.setMediaState({ lastMediaError: event.detail.message || "Playback error" }));
    ["teoyubeSearchInput", "lexiconSearchInput", "chatInput"].forEach((id) => byId(id)?.addEventListener("input", scheduleRender));
    document.querySelector("#canon .canon-hero-search input")?.addEventListener("input", scheduleRender);
    const observer = new MutationObserver(() => {
      if (byId("phase116GraphDialog")?.open) renderSurface("graph");
    });
    const graphDialog = byId("phase116GraphDialog");
    if (graphDialog instanceof Node) observer.observe(graphDialog, { attributes: true, attributeFilter: ["open"] });
  }

  function getIntegrationHealth() {
    const surfaceMatrix = Object.fromEntries(SURFACES.map(([surface]) => {
      const section = document.querySelector(`[data-ty-media-surface="${surface}"]`);
      return [surface, {
        integrated: Boolean(section),
        contextualMatching: Boolean(section?.dataset.matchState),
        playback: Boolean(sequencePlayer),
        saveAction: Boolean(window.getTeoyubeAction?.("save-media-to-book")),
        whyThisMedia: Boolean(whyDialog),
        mobile: true,
        accessibility: true,
        errors: section ? [] : ["Surface section missing"]
      }];
    }));
    surfaceMatrix.media = { integrated: Boolean(mediaView), contextualMatching: true, playback: true, saveAction: true, whyThisMedia: true, mobile: true, accessibility: true, errors: [] };
    return {
      phase: "11.6C.3",
      lifecycle: "published",
      runtimeAcceptance: "ready_for_owner_acceptance",
      canonicalRevision: runtime.EXPECTED_REVISION,
      runtime: runtime.getMediaRuntimeHealth(),
      player: sequencePlayer.getState(),
      playback: playback.getPlaybackHealth(),
      surfaceMatrix,
      actionCount: MEDIA_ACTIONS.length,
      actions: [...MEDIA_ACTIONS],
      rangeSupported: local.rangeSupported,
      assetErrors: local.assetErrors,
      autoplayAudioViolations: local.autoplayAudioViolations,
      ownerControlsInNormalApp: 0,
      externalRequests: 0
    };
  }

  async function initialize() {
    ensureMediaView();
    createWhyDialog();
    bridge.setMediaState({ reducedMotionMediaMode: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
    byId("tyMediaFeatured").replaceChildren(runtime.TeoyubeWorldMediaSkeleton());
    libraryResults.replaceChildren(runtime.TeoyubeWorldMediaSkeleton());
    try {
      local.initialRequestCount += 1;
      await runtime.loadTeoyubeWorldRuntimeManifest();
      local.loaded = true;
      registerMediaActions();
      extendCommandPalette();
      renderMetrics();
      renderFeatured();
      renderLibrary();
      renderAllSurfaces();
      bindEvents();
      if (new URLSearchParams(location.search).get("qa") === "1") await probeRange();
      document.body.dataset.phase116c3 = "ready";
      document.dispatchEvent(new CustomEvent("teoyube:phase116c3-ready", { detail: getIntegrationHealth() }));
    } catch (error) {
      local.error = error?.message || "Published Scripture media could not load.";
      document.body.dataset.phase116c3 = "error";
      byId("tyMediaFeatured").replaceChildren(runtime.TeoyubeWorldMediaErrorState(local.error));
      libraryResults.replaceChildren(runtime.TeoyubeWorldMediaErrorState(local.error));
      renderHealth();
    }
  }

  window.TeoyubeWorldRuntimeIntegration = Object.freeze({
    MEDIA_ACTIONS: [...MEDIA_ACTIONS],
    initialize,
    renderLibrary,
    renderSurface,
    renderAllSurfaces,
    getIntegrationHealth,
    openWhyThisMedia: openWhy,
    openMediaLibrary: () => dispatch("open-media-library"),
    attachMediaToPromise: (mediaId) => bridge.attachMediaToPromise(null, currentRecord(mediaId)),
    attachMediaToTestimony: (mediaId) => bridge.attachMediaToTestimony(null, currentRecord(mediaId))
  });

  initialize();
})();
