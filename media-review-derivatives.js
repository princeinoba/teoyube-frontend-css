(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  if (params.get("mode") !== "derivative-review") return;

  const byId = (id) => document.getElementById(id);
  const workspace = byId("derivative-review-workspace");
  const player = byId("derivative-player");
  const state = { payload: null, records: [], activeIndex: 0, variant: "card", playEntire: false };
  const qaLabels = {
    generated: "Generated",
    ffprobeValid: "FFprobe valid",
    durationValid: "Duration valid",
    dimensionsValid: "Dimensions valid",
    orientationValid: "Orientation valid",
    codecValid: "Codec valid",
    audioPolicyValid: "Audio policy valid",
    checksumValid: "Checksum valid",
    posterValid: "Poster valid",
    thumbnailValid: "Thumbnail valid",
    sourceUnchanged: "Source unchanged",
    readyForPublicationPreview: "Publication-ready validation"
  };

  function formatBytes(value) {
    const bytes = Number(value || 0);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
  }

  function metric(value, label) {
    const item = document.createElement("div");
    const strong = document.createElement("strong");
    const span = document.createElement("span");
    item.className = "metric";
    strong.textContent = String(value);
    span.textContent = label;
    item.append(strong, span);
    return item;
  }

  function renderSummary() {
    const summary = state.payload.summary;
    const root = byId("derivative-summary");
    root.replaceChildren(
      metric(summary.approvedRecords, "Approved records"),
      metric(summary.validatedOperations, "Validated operations"),
      metric(summary.cardPreviews, "Card previews"),
      metric(summary.mobilePreviews, "Mobile previews"),
      metric(summary.posters, "Posters"),
      metric(summary.thumbnails, "Thumbnails"),
      metric(formatBytes(summary.generatedBytes), "Generated size"),
      metric(summary.sourceIntegrityPassed ? "Passed" : "Blocked", "Source integrity")
    );
    byId("derivative-lifecycle").textContent = state.payload.lifecycleState;
    byId("derivative-publication-state").textContent = state.payload.lifecycleState === "published"
      ? `${state.payload.publicFilesWritten} checksum-bound files published`
      : "Publication remains gated";
    byId("derivative-sequence-title").textContent = state.payload.sequence.title;
    byId("derivative-sequence-scripture").textContent = state.payload.sequence.ScriptureReference;
    byId("derivative-segment-total").textContent = String(state.payload.sequence.segmentCount);
  }

  function renderRecordList() {
    const list = byId("derivative-record-list");
    list.replaceChildren(...state.records.map((record, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = index === state.activeIndex ? "active" : "";
      button.dataset.mediaId = record.mediaId;
      button.setAttribute("aria-pressed", index === state.activeIndex ? "true" : "false");
      const order = document.createElement("span");
      const copy = document.createElement("span");
      const title = document.createElement("strong");
      const scripture = document.createElement("small");
      order.className = "record-order";
      order.textContent = String(record.sequenceOrder).padStart(2, "0");
      title.textContent = record.title;
      scripture.textContent = record.ScriptureReference || "Scripture confirmation unavailable";
      copy.append(title, scripture);
      button.append(order, copy);
      button.addEventListener("click", () => selectRecord(index, false));
      return button;
    }));
  }

  function comparisonRow(term, value) {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value;
    wrapper.append(dt, dd);
    return wrapper;
  }

  function renderEvidence(record) {
    const variant = record.variants[state.variant];
    const source = record.sourceTechnical;
    const comparison = byId("derivative-technical-comparison");
    comparison.replaceChildren(
      comparisonRow("Source", `${source.width} × ${source.height} · ${Number(source.durationSeconds || 0).toFixed(2)}s · ${formatBytes(source.bytes)}`),
      comparisonRow(`${state.variant === "card" ? "Card" : "Mobile"} derivative`, `${variant.width} × ${variant.height} · ${Number(variant.durationSeconds || 0).toFixed(2)}s · ${formatBytes(variant.bytes)}`),
      comparisonRow("Codec", `${variant.codec}${variant.pixelFormat ? ` · ${variant.pixelFormat}` : ""}`),
      comparisonRow("Compression ratio", `${Math.round(Number(variant.compressionRatio || 0) * 100)}% of source`),
      comparisonRow("Output checksum", variant.checksumSha256 ? `${variant.checksumSha256.slice(0, 16)}…` : "Unavailable"),
      comparisonRow("Source integrity", source.integrityPassed ? "Unchanged" : "Blocked")
    );

    const qaList = byId("derivative-qa-list");
    qaList.replaceChildren(...Object.entries(qaLabels).map(([key, label]) => {
      const item = document.createElement("li");
      item.className = record.qa[key] ? "passed" : "failed";
      const mark = document.createElement("span");
      const copy = document.createElement("span");
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = record.qa[key] ? "✓" : "!";
      copy.textContent = label;
      item.append(mark, copy);
      return item;
    }));

    const log = byId("derivative-operation-log");
    const operations = state.payload.operationLog.filter((operation) => operation.mediaId === record.mediaId);
    log.replaceChildren(...operations.map((operation) => {
      const row = document.createElement("p");
      row.textContent = `${operation.operationId} · ${operation.profile} · ${formatBytes(operation.outputBytes)} · ${operation.status}`;
      return row;
    }));
  }

  function setVariant(variant) {
    if (!state.records.length || !["card", "mobile"].includes(variant)) return;
    state.variant = variant;
    player.pause();
    state.playEntire = false;
    const record = state.records[state.activeIndex];
    player.src = record.variants[variant].url;
    player.poster = record.variants.poster.url;
    player.load();
    byId("derivative-card-mode").classList.toggle("active", variant === "card");
    byId("derivative-mobile-mode").classList.toggle("active", variant === "mobile");
    byId("derivative-card-mode").setAttribute("aria-pressed", variant === "card" ? "true" : "false");
    byId("derivative-mobile-mode").setAttribute("aria-pressed", variant === "mobile" ? "true" : "false");
    renderEvidence(record);
  }

  function selectRecord(index, autoplay) {
    if (!state.records.length) return;
    player.pause();
    state.activeIndex = Math.max(0, Math.min(state.records.length - 1, index));
    const record = state.records[state.activeIndex];
    player.src = record.variants[state.variant].url;
    player.poster = record.variants.poster.url;
    player.load();
    byId("derivative-poster").src = record.variants.poster.url;
    byId("derivative-thumbnail").src = record.variants.thumbnail.url;
    byId("derivative-poster").alt = `Poster for ${record.title}`;
    byId("derivative-thumbnail").alt = `Thumbnail for ${record.title}`;
    byId("derivative-active-title").textContent = record.title;
    byId("derivative-segment-number").textContent = String(record.sequenceOrder);
    byId("derivative-progress-bar").style.width = `${((state.activeIndex + 1) / state.records.length) * 100}%`;
    byId("derivative-timeline").value = "0";
    renderRecordList();
    renderEvidence(record);
    if (autoplay) player.play().catch(() => {
      state.playEntire = false;
      byId("derivative-status").textContent = "Playback needs another owner action. The poster fallback remains available.";
    });
  }

  function playSelected() {
    state.playEntire = false;
    player.play().catch(() => { byId("derivative-status").textContent = "Playback could not start. Try Play Selected again."; });
  }

  function playSequence() {
    state.variant = "card";
    state.playEntire = true;
    selectRecord(state.activeIndex, true);
    byId("derivative-status").textContent = "Playing the owner-approved sequence from the selected segment.";
  }

  function stopSequence() {
    state.playEntire = false;
    player.pause();
  }

  function bindControls() {
    byId("derivative-card-mode").addEventListener("click", () => setVariant("card"));
    byId("derivative-mobile-mode").addEventListener("click", () => setVariant("mobile"));
    byId("derivative-play-selected").addEventListener("click", playSelected);
    byId("derivative-play-sequence").addEventListener("click", playSequence);
    byId("derivative-pause").addEventListener("click", stopSequence);
    byId("derivative-previous").addEventListener("click", () => { state.playEntire = false; selectRecord(state.activeIndex - 1, false); });
    byId("derivative-next").addEventListener("click", () => { state.playEntire = false; selectRecord(state.activeIndex + 1, false); });
    byId("derivative-restart-segment").addEventListener("click", () => { state.playEntire = false; player.currentTime = 0; player.play().catch(() => {}); });
    byId("derivative-restart-sequence").addEventListener("click", () => { state.playEntire = false; selectRecord(0, true); });
    byId("derivative-timeline").addEventListener("input", (event) => {
      if (Number.isFinite(player.duration) && player.duration > 0) player.currentTime = (Number(event.target.value) / 100) * player.duration;
    });
    player.addEventListener("timeupdate", () => {
      if (Number.isFinite(player.duration) && player.duration > 0) byId("derivative-timeline").value = String((player.currentTime / player.duration) * 100);
    });
    player.addEventListener("ended", () => {
      if (!state.playEntire) return;
      if (state.activeIndex < state.records.length - 1) selectRecord(state.activeIndex + 1, true);
      else {
        state.playEntire = false;
        byId("derivative-status").textContent = "The complete 12-segment sequence finished without looping.";
      }
    });
    player.addEventListener("error", () => {
      state.playEntire = false;
      byId("derivative-status").textContent = "This derivative could not play. Use the poster fallback or select another validated segment.";
    });
    document.addEventListener("keydown", (event) => {
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(document.activeElement?.tagName)) return;
      if (event.key === " ") { event.preventDefault(); player.paused ? playSelected() : stopSequence(); }
      if (event.key === "ArrowLeft") { event.preventDefault(); state.playEntire = false; selectRecord(state.activeIndex - 1, false); }
      if (event.key === "ArrowRight") { event.preventDefault(); state.playEntire = false; selectRecord(state.activeIndex + 1, false); }
      if (event.key.toLowerCase() === "r") { event.preventDefault(); player.currentTime = 0; }
      if (event.key === "Home") { event.preventDefault(); state.playEntire = false; selectRecord(0, false); }
    });
  }

  async function load() {
    document.body.classList.add("derivative-review-mode");
    for (const child of byId("workspace").children) child.hidden = child !== workspace;
    workspace.hidden = false;
    document.querySelector(".topbar .eyebrow").textContent = "Phase 11.6C.2B.2 | Local owner publication review";
    document.querySelector(".topbar h1").textContent = "TeoyubeWorld Published Pilot";
    document.querySelector(".topbar p:not(.eyebrow)").textContent = "Checksum-bound public derivatives only. Protected source masters remain private and unchanged.";
    byId("load-draft").hidden = true;
    byId("save-owner-patch").hidden = true;
    bindControls();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) document.body.classList.add("reduced-motion");
    const response = await fetch("/__qa/teoyubeworld/derivative-review?qa=1", { cache: "no-store" });
    if (!response.ok) throw new Error(`Derivative review endpoint returned ${response.status}.`);
    const payload = await response.json();
    if (JSON.stringify(payload).match(/[A-Za-z]:[\\/]/)) throw new Error("Derivative review response contained an unsafe path.");
    if (payload.records?.length !== 12) throw new Error("Derivative review requires exactly 12 approved records.");
    state.payload = payload;
    state.records = [...payload.records].sort((left, right) => left.sequenceOrder - right.sequenceOrder);
    renderSummary();
    selectRecord(0, false);
    byId("derivative-status").textContent = payload.lifecycleState === "published"
      ? "48 derivatives and one runtime manifest are published under the approved pilot receipt."
      : "48 validated derivatives are ready for owner review. Publication remains separately gated.";
    workspace.dataset.ready = "true";
  }

  load().catch((error) => {
    workspace.hidden = false;
    workspace.dataset.ready = "false";
    byId("derivative-status").className = "notice danger";
    byId("derivative-status").textContent = error.message || "Derivative review could not load.";
  });
})();
