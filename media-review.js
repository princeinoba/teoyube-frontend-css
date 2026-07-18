(() => {
  "use strict";

  const loopback = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
  const qa = new URLSearchParams(location.search).get("qa") === "1";
  const byId = (id) => document.getElementById(id);
  const gate = byId("gate");
  const workspace = byId("workspace");
  if (!loopback || !qa) {
    gate.hidden = false;
    workspace.querySelectorAll("button, input, select, textarea").forEach((control) => { control.disabled = true; });
    return;
  }

  const PATCH_CATEGORIES = ["technical", "owner", "duplicate", "sequence", "pilot"];
  const BIBLE_BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];
  const SURFACES = ["today", "search", "canon", "promise_table", "calling_compass", "book", "lexicon", "testimony", "teo_guide"];
  const state = {
    manifest: null, rawManifest: "", checksum: "", records: [], edits: new Map(), selected: new Set(),
    currentId: null, page: 1, pageSize: 36, operations: Object.fromEntries(PATCH_CATEGORIES.map((name) => [name, []])),
    undo: [], importedPatch: null, local: {}, probe: { paused: false, cancelled: false, running: false, complete: 0, total: 0 }, sequenceId: null,
    ownerGate: null
  };
  const fields = ["title", "description", "media-kind", "bible-book", "chapter", "verse-start", "verse-end", "translation", "scripture-reference", "review-status", "mapping-confidence", "safety-status", "copyright-status", "source-channel", "owner-notes"];
  const elementIds = ["load-draft", "save-owner-patch", "progress-dashboard", "status", "probe-progress", "search", "queue-filter", "queue-counts", "duplicate-groups", "sequence-groups", "probe-selected", "probe-page", "probe-pilot", "pause-probe", "resume-probe", "export-technical", "current-title", "current-scripture", "review-player", "capture-canvas", "player-state", "capture-thumbnail", "capture-poster", "why-media", "metadata-form", "media-id", ...fields, "scripture-selector", "theme-selector", "word-selector", "promise-selector", "journey-selector", "calling-selector", "prayer-selector", "surface-selector", "stage-metadata", "toggle-pilot", "sequence-summary", "sequence-members", "sequence-name", "sequence-scripture", "segment-title", "transition-type", "sequence-up", "sequence-down", "confirm-sequence", "reject-sequence", "qa-previous", "qa-next", "save-reference", "add-promise", "qa-context", "technical-metadata", "duplicate-details", "choose-canonical", "defer-duplicate", "intentional-copy", "related-data", "warnings", "pilot-eligibility", "selection-count", "batch-action", "batch-value", "preview-batch", "undo", "reset-unsaved", "import-patch", "validate-patch", "preview-patch", "pilot-summary", "pilot-blockers", "rerun-owner-gate", "preview-derivative-plan", "owner-gate-control", "owner-gate-notice", "select-page", "clear-selection", "page-status", "records", "previous-page", "next-page", "confirm-dialog", "batch-preview", "confirm-batch", "why-dialog", "why-content"];
  const el = Object.fromEntries(elementIds.map((id) => [id, byId(id)]));

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function merged(record) { return { ...record, ...(state.edits.get(record.id) || {}) }; }
  function current() { const record = state.records.find((item) => item.id === state.currentId); return record ? merged(record) : null; }
  function recordsForSequence(sequenceId) { return state.records.map(merged).filter((record) => record.sequenceId === sequenceId).sort((a, b) => Number(a.sequenceOrder ?? 99999) - Number(b.sequenceOrder ?? 99999)); }
  function recordsForDuplicate(groupId) { return state.records.map(merged).filter((record) => record.duplicateGroupId === groupId); }
  function formatBytes(bytes) { const value = Number(bytes || 0); return value >= 1073741824 ? `${(value / 1073741824).toFixed(2)} GiB` : value >= 1048576 ? `${(value / 1048576).toFixed(1)} MiB` : `${Math.ceil(value / 1024)} KiB`; }
  function metric(label, value) { return `<div class="metric"><strong>${escapeHtml(value)}</strong>${escapeHtml(label)}</div>`; }
  function setStatus(message) { el.status.textContent = message; }
  function allMerged() { return state.records.map(merged); }

  async function checksum(text) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function snapshot(label) {
    state.undo.push({ label, edits: [...state.edits].map(([id, value]) => [id, structuredClone(value)]), operations: structuredClone(state.operations) });
    if (state.undo.length > 50) state.undo.shift();
    el.undo.disabled = false;
  }

  function stage(mediaId, newValues, category, reason, takeSnapshot = true) {
    const base = state.records.find((record) => record.id === mediaId);
    if (!base) return;
    if (takeSnapshot) snapshot(reason);
    const existing = state.edits.get(mediaId) || {};
    const previousValues = {};
    for (const key of Object.keys(newValues)) previousValues[key] = merged(base)[key] ?? null;
    state.edits.set(mediaId, { ...existing, ...newValues });
    state.operations[category].push({
      mediaId, changedFields: Object.keys(newValues), previousValues, newValues,
      reviewReason: reason, timestamp: new Date().toISOString()
    });
    el["save-owner-patch"].disabled = false;
    el["reset-unsaved"].disabled = false;
    state.ownerGate = null;
    el["owner-gate-control"].replaceChildren();
    el["owner-gate-notice"].textContent = "Unsaved review changes require a fresh complete validation. No approval control is rendered.";
  }

  function patch(category) {
    return {
      schemaVersion: "1.0.0", sourceDraftManifestChecksum: state.checksum,
      generatedAt: new Date().toISOString(), reviewedBy: "local_project_owner",
      operationCount: state.operations[category].length, operations: state.operations[category],
      warnings: state.operations[category].length ? [] : ["No owner decisions have been recorded."],
      localOnly: true, runtimeManifestUpdated: false
    };
  }

  async function savePatch(category) {
    const response = await fetch(`/__qa/teoyubeworld/review-patch/${category}?qa=1`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch(category)), cache: "no-store"
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `Patch save returned ${response.status}.`);
    return result;
  }

  function eligible(record) {
    const blockers = [];
    if (record.mappingConfidence !== "confirmed" || !(record.ScriptureReferences || []).length) blockers.push("Scripture mapping unconfirmed");
    if (record.reviewStatus !== "approved") blockers.push("Owner review not approved");
    if (record.safetyStatus !== "approved") blockers.push("Safety not approved");
    if (!["owner_owned", "confirmed", "licensed"].includes(record.copyrightStatus)) blockers.push("Copyright unconfirmed");
    if (!record.title?.trim()) blockers.push("Reviewed title missing");
    if (!record.description?.trim()) blockers.push("Reviewed description missing");
    if (!(record.recommendedSurfaces || []).length) blockers.push("Recommended surface missing");
    if (!record.mimeType?.startsWith("video/")) blockers.push("Unsupported media kind");
    if (record.duplicateGroupId && !record.canonicalForDuplicateGroup && record.duplicateDecision !== "keep_all") blockers.push("Duplicate unresolved");
    if (record.metadataProbeStatus !== "complete") blockers.push("Technical metadata review incomplete");
    return blockers;
  }

  function pilotState() {
    const selected = allMerged().filter((record) => record.pilotSelected === true);
    const shorts = selected.filter((record) => record.shortOrLong === "short");
    const longs = selected.filter((record) => ["long", "long_form"].includes(record.shortOrLong));
    const sequences = [...new Set(selected.filter((record) => record.sequenceReviewStatus === "approved" && record.sequenceId).map((record) => record.sequenceId))];
    const blockers = selected.flatMap((record) => eligible(record).map((reason) => `${record.id}: ${reason}`));
    if (shorts.length !== 12) blockers.unshift("Select exactly 12 unique short records for the first pilot.");
    if (longs.length !== 0) blockers.unshift("The first pilot requires zero long-form records.");
    if (sequences.length !== 1) blockers.unshift("Select exactly one owner-confirmed sequence.");
    const checksums = new Set();
    for (const record of selected) { if (checksums.has(record.checksumSha256)) blockers.push(`${record.id}: exact duplicate selected.`); checksums.add(record.checksumSha256); }
    const sourceBytes = selected.reduce((sum, record) => sum + Number(record.fileSizeBytes || 0), 0);
    const estimatedBytes = Math.ceil(sourceBytes * .42);
    if (estimatedBytes > 500 * 1024 * 1024) blockers.push("Estimated public pilot exceeds 500 MiB.");
    return { selected, shorts, longs, sequences, sourceBytes, estimatedBytes, blockers: [...new Set(blockers)] };
  }

  function filtered() {
    const query = el.search.value.trim().toLowerCase();
    const filter = el["queue-filter"].value;
    return allMerged().filter((record) => {
      const text = [record.id, record.sourceFileName, record.relativeSourcePath, record.title, record.BibleBook, ...(record.ScriptureReferences || []), ...(record.tags || []), record.sequenceId, record.duplicateGroupId].join(" ").toLowerCase();
      if (query && !text.includes(query)) return false;
      if (filter === "unreviewed" && record.reviewStatus !== "needs_review") return false;
      if (["approved", "rejected", "needs_edit"].includes(filter) && record.reviewStatus !== filter) return false;
      if (filter === "scripture_unknown" && record.mappingConfidence !== "unknown") return false;
      if (filter === "book_hint" && !(record.BibleBook && record.mappingConfidence === "needs_review")) return false;
      if (filter === "exact_duplicate" && !record.duplicateGroupId) return false;
      if (filter === "sequence" && !record.sequenceId) return false;
      if (filter === "short" && record.shortOrLong !== "short") return false;
      if (filter === "long" && !["long", "long_form"].includes(record.shortOrLong)) return false;
      if (filter === "browser_playable" && record.browserPlayable !== true) return false;
      if (filter === "browser_unplayable" && record.browserPlayable !== false) return false;
      if (filter === "owner_thumbnail" && !record.ownerThumbnailPath) return false;
      if (filter === "missing_thumbnail" && (record.thumbnailPath || record.ownerThumbnailPath)) return false;
      if (filter === "pilot_selected" && record.pilotSelected !== true) return false;
      if (filter === "pilot_ineligible" && eligible(record).length === 0) return false;
      return true;
    });
  }

  function renderDashboard() {
    const records = allMerged();
    const pilot = pilotState();
    el["progress-dashboard"].innerHTML = [
      metric("Total records", records.length), metric("Owner reviewed", records.filter((r) => r.reviewStatus !== "needs_review").length),
      metric("Approved", records.filter((r) => r.reviewStatus === "approved").length), metric("Rejected", records.filter((r) => r.reviewStatus === "rejected").length),
      metric("Needs edit", records.filter((r) => r.reviewStatus === "needs_edit").length), metric("Scripture confirmed", records.filter((r) => r.mappingConfidence === "confirmed").length),
      metric("Metadata probed", records.filter((r) => r.metadataProbeStatus === "complete").length), metric("Pilot selected", pilot.selected.length)
    ].join("");
    el["queue-counts"].innerHTML = `<p><strong>${records.filter((r) => r.reviewStatus === "needs_review").length}</strong> unreviewed</p><p><strong>${new Set(records.filter((r) => r.duplicateGroupId).map((r) => r.duplicateGroupId)).size}</strong> duplicate groups</p><p><strong>${new Set(records.filter((r) => r.sequenceId).map((r) => r.sequenceId)).size}</strong> sequence groups</p><p><strong>${state.selected.size}</strong> selected</p>`;
    el["pilot-summary"].innerHTML = [metric("Selected", pilot.selected.length), metric("Shorts", pilot.shorts.length), metric("Long-form", pilot.longs.length), metric("Confirmed sequences", pilot.sequences.length), metric("Source size", formatBytes(pilot.sourceBytes)), metric("Projected public", formatBytes(pilot.estimatedBytes))].join("");
    const authoritative = state.ownerGate;
    const gateBlockers = authoritative ? (authoritative.blockers || []).map((item) => item.message || item) : pilot.blockers;
    const gateState = authoritative?.state || (gateBlockers.length ? "blocked" : "validation_required");
    el["pilot-blockers"].innerHTML = `<strong>${escapeHtml(gateState.replaceAll("_", " "))}</strong>${gateBlockers.slice(0, 12).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}${gateBlockers.length > 12 ? `<p>+ ${gateBlockers.length - 12} more blockers</p>` : ""}`;
  }

  function renderRecords() {
    const matches = filtered();
    const pages = Math.max(1, Math.ceil(matches.length / state.pageSize));
    state.page = Math.min(state.page, pages);
    const pageRecords = matches.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    el.records.innerHTML = pageRecords.map((record) => `<article class="record-card${record.id === state.currentId ? " current" : ""}" data-id="${record.id}"><input type="checkbox" aria-label="Select ${escapeHtml(record.title)}" ${state.selected.has(record.id) ? "checked" : ""}/><div><h3>${escapeHtml(record.title || record.sourceFileName)}</h3><p>${escapeHtml(record.sourceFileName)}</p><div class="tags"><span class="tag">${escapeHtml(record.shortOrLong)}</span><span class="tag">${escapeHtml(record.mappingConfidence)}</span>${record.duplicateGroupId ? '<span class="tag">duplicate</span>' : ""}${record.sequenceId ? '<span class="tag">sequence</span>' : ""}${record.pilotSelected ? '<span class="tag">pilot</span>' : ""}</div><button class="open-record" type="button">Review media</button></div></article>`).join("");
    el["page-status"].textContent = `Page ${state.page} of ${pages} · ${matches.length} matching records`;
    el["previous-page"].disabled = state.page <= 1;
    el["next-page"].disabled = state.page >= pages;
    el["select-page"].disabled = !pageRecords.length;
    el["clear-selection"].disabled = !state.selected.size;
    el["probe-page"].disabled = !pageRecords.length;
    el["selection-count"].textContent = `${state.selected.size} record${state.selected.size === 1 ? "" : "s"} selected`;
    el["preview-batch"].disabled = !state.selected.size;
    el["probe-selected"].disabled = !state.selected.size;
    el["probe-pilot"].disabled = !pilotState().selected.length;
  }

  function valueText(value) { return Array.isArray(value) ? value.join("; ") : value ?? ""; }
  function renderCurrent() {
    const record = current();
    const fieldset = el["metadata-form"].querySelector("fieldset");
    fieldset.disabled = !record;
    for (const id of ["capture-thumbnail", "capture-poster", "why-media", "toggle-pilot", "save-reference", "add-promise"]) el[id].disabled = !record;
    if (!record) return;
    el["media-id"].value = record.id;
    const values = { title: record.title, description: record.description, "media-kind": record.mediaKind, "bible-book": record.BibleBook, chapter: record.chapter, "verse-start": record.verseStart, "verse-end": record.verseEnd, translation: record.translation, "scripture-reference": record.ScriptureReferences, "review-status": record.reviewStatus, "mapping-confidence": record.mappingConfidence, "safety-status": record.safetyStatus, "copyright-status": record.copyrightStatus, "source-channel": record.sourceChannel, "owner-notes": record.ownerNotes };
    for (const [id, value] of Object.entries(values)) el[id].value = valueText(value);
    el["current-title"].textContent = record.title || record.sourceFileName;
    el["current-scripture"].textContent = record.ScriptureReferences?.join(", ") || "Scripture unconfirmed";
    el["toggle-pilot"].textContent = record.pilotSelected ? "Remove from pilot" : "Add to pilot";
    el["review-player"].src = `/__qa/teoyubeworld/media/${record.id}?qa=1`;
    el["review-player"].load();
    el["player-state"].textContent = "Loading protected metadata. Playback never starts automatically.";
    const technical = [["Media ID", record.id], ["MIME", record.mimeType], ["Size", formatBytes(record.fileSizeBytes)], ["Duration", record.durationSeconds == null ? "unknown" : `${Number(record.durationSeconds).toFixed(2)} s`], ["Dimensions", record.width && record.height ? `${record.width} × ${record.height}` : "unknown"], ["Orientation", record.orientation || "unknown"], ["Browser playable", record.browserPlayable == null ? "not probed" : String(record.browserPlayable)], ["Audio", record.hasAudio == null ? "unknown" : String(record.hasAudio)], ["Captions", record.captionPath ? "associated" : "not associated"], ["Transcript", record.transcriptPath ? "associated" : "not associated"]];
    el["technical-metadata"].innerHTML = technical.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join("");
    el.warnings.innerHTML = [...(record.warnings || []), ...eligible(record)].map((item) => `<p>${escapeHtml(item)}</p>`).join("") || "<p>No additional warning.</p>";
    const blockers = eligible(record);
    el["pilot-eligibility"].innerHTML = `<p><strong>${blockers.length ? "Ineligible" : "Eligible for owner selection"}</strong></p>${blockers.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}`;
    renderDuplicate(record);
    renderSequence(record.sequenceId || state.sequenceId);
    renderRelated(record);
    el["qa-context"].innerHTML = `<p><strong>Current segment:</strong> ${escapeHtml(record.segmentTitle || record.title)}</p><p><strong>Scripture:</strong> ${escapeHtml(record.ScriptureReferences?.join(", ") || "Owner confirmation required")}</p><p><strong>Related word:</strong> ${escapeHtml(record.TeoyubeWordIds?.join(", ") || "none selected")}</p><p><strong>Promise cluster:</strong> ${escapeHtml(record.promiseClusterIds?.join(", ") || "none selected")}</p><p><strong>Prayer/action:</strong> Use the local relationships only after owner review.</p>`;
  }

  function renderRelated(record) {
    const references = record.ScriptureReferences || [];
    const canon = (state.local.canon || []).filter((item) => item.scriptureReferences?.some((reference) => references.includes(reference))).slice(0, 4);
    const words = canon.map((item) => item.teoyubeWord || item.word).filter(Boolean);
    const clusters = (state.local.promises || []).filter((item) => (item.related_teoyube_words || []).some((word) => words.includes(word))).slice(0, 4);
    el["related-data"].innerHTML = `<p><strong>Suggested, not confirmed</strong></p><p>Words: ${escapeHtml(words.join(", ") || "No direct local match")}</p><p>Clusters: ${escapeHtml(clusters.map((item) => item.title || item.id).join(", ") || "No direct local match")}</p><p>Owner selected IDs: ${escapeHtml([...(record.TeoyubeWordIds || []), ...(record.promiseClusterIds || [])].join(", ") || "none")}</p>`;
  }

  function renderDuplicate(record) {
    const groupId = record.duplicateGroupId || el["duplicate-groups"].value;
    const members = groupId ? recordsForDuplicate(groupId) : [];
    el["duplicate-details"].innerHTML = members.length ? `<p><strong>${escapeHtml(groupId)}</strong></p>${members.map((member) => `<p>${member.id === record.id ? "Current · " : ""}${escapeHtml(member.sourceFileName)} · ${formatBytes(member.fileSizeBytes)} · ${escapeHtml(member.sequenceId || "no sequence")}</p>`).join("")}<p>Checksum: ${escapeHtml(members[0].checksumSha256.slice(0, 16))}…</p>` : "<p>Current record has no exact duplicate group.</p>";
    for (const id of ["choose-canonical", "defer-duplicate", "intentional-copy"]) el[id].disabled = !members.length;
  }

  function renderSequence(sequenceId) {
    state.sequenceId = sequenceId || null;
    const members = sequenceId ? recordsForSequence(sequenceId) : [];
    el["sequence-summary"].textContent = members.length ? `${members.length} probable members. Owner ordering and Scripture passage are required.` : "Choose a sequence group. Timestamp order is never treated as confirmed.";
    el["sequence-members"].innerHTML = members.slice(0, 120).map((member, index) => `<button type="button" data-id="${member.id}">${index + 1}. ${escapeHtml(member.segmentTitle || member.title)}</button>`).join("");
    for (const id of ["sequence-up", "sequence-down", "confirm-sequence", "reject-sequence", "qa-previous", "qa-next"]) el[id].disabled = !members.length;
  }

  function renderAll() { renderDashboard(); renderRecords(); renderCurrent(); }

  async function refreshOwnerGate() {
    el["owner-gate-control"].replaceChildren();
    el["owner-gate-notice"].textContent = "Running complete checksum, Scripture, rights, safety, duplicate, sequence, metadata, source, and technical validation.";
    try {
      const response = await fetch("/__qa/teoyubeworld/owner-gate-control?qa=1", { cache: "no-store" });
      const result = await response.json();
      state.ownerGate = result;
      if (response.ok && result.gatePassed === true && result.blockerCount === 0 && result.approvalControlHtml) {
        el["owner-gate-control"].innerHTML = result.approvalControlHtml;
      } else {
        el["owner-gate-control"].replaceChildren();
      }
      el["owner-gate-notice"].textContent = result.notice || (result.blockerCount
        ? `${result.blockerCount} blocker(s) remain. The approval control is absent.`
        : "Validation completed without rendering an approval control.");
      renderDashboard();
      return result;
    } catch (error) {
      state.ownerGate = {
        state: "blocked",
        blockerCount: 1,
        blockers: [{ code: "gate_validation_failed", message: "Complete owner-gate validation could not be completed." }]
      };
      el["owner-gate-control"].replaceChildren();
      el["owner-gate-notice"].textContent = "Validation failed safely. The approval control is absent.";
      renderDashboard();
      setStatus(`Owner gate validation failed safely: ${error.message}`);
      return state.ownerGate;
    }
  }

  function populateSelect(select, items, value, label) {
    select.innerHTML = `<option value="">${escapeHtml(label)}</option>` + items.map((item) => `<option value="${escapeHtml(value(item))}">${escapeHtml(label === "Choose local anchor" ? value(item) : item.title || item.name || item.word || item.id || value(item))}</option>`).join("");
  }

  async function loadLocalData() {
    const paths = { words: "src/data/coreTeoyubeVocabulary.json", promises: "src/data/promiseClusters.json", canon: "src/data/scriptureCanon.json", journeys: "src/data/prayerJourneys.json", prayers: "src/data/prayers.json", callings: "src/data/destinyMaps.json" };
    const entries = await Promise.all(Object.entries(paths).map(async ([name, url]) => [name, await fetch(url, { cache: "no-store" }).then((response) => response.json())]));
    state.local = Object.fromEntries(entries);
    const references = [...new Set(state.local.canon.flatMap((item) => item.scriptureReferences || []))].sort();
    populateSelect(el["scripture-selector"], references, (item) => item, "Choose local anchor");
    populateSelect(el["word-selector"], state.local.words, (item) => item.word, "Suggested words");
    populateSelect(el["promise-selector"], state.local.promises, (item) => item.id || item.cluster_id, "Suggested clusters");
    populateSelect(el["journey-selector"], state.local.journeys, (item) => item.journeyId, "Suggested journeys");
    populateSelect(el["calling-selector"], state.local.callings, (item) => item.id, "Suggested callings");
    populateSelect(el["prayer-selector"], state.local.prayers, (item) => item.id, "Suggested prayers");
    const themes = [...new Set([...state.local.words.map((item) => item.category), ...state.local.promises.map((item) => item.theme)].filter(Boolean))].sort();
    populateSelect(el["theme-selector"], themes, (item) => item, "Suggested themes");
  }

  async function acceptManifest(raw) {
    const manifest = JSON.parse(raw);
    if (!Array.isArray(manifest.records)) throw new Error("Draft manifest records are missing.");
    state.rawManifest = raw; state.checksum = await checksum(raw); state.manifest = manifest; state.records = manifest.records;
    await loadLocalData();
    el["bible-book"].innerHTML = '<option value="">Unmapped</option>' + BIBLE_BOOKS.map((book) => `<option>${book}</option>`).join("");
    el["surface-selector"].innerHTML = '<option value="">Choose surface</option>' + SURFACES.map((surface) => `<option value="${surface}">${surface.replaceAll("_", " ")}</option>`).join("");
    const duplicateGroups = [...new Set(state.records.map((record) => record.duplicateGroupId).filter(Boolean))].sort();
    el["duplicate-groups"].innerHTML = '<option value="">Choose exact duplicate group</option>' + duplicateGroups.map((id) => `<option>${id}</option>`).join("");
    const sequences = [...new Set(state.records.map((record) => record.sequenceId).filter(Boolean))].sort();
    el["sequence-groups"].innerHTML = '<option value="">Choose sequence</option>' + sequences.map((id) => `<option>${id}</option>`).join("");
    state.currentId = state.records.find((record) => record.mimeType === "video/mp4")?.id || state.records[0]?.id;
    setStatus(`${state.records.length} draft records loaded. Runtime manifest remains unchanged.`);
    el["export-technical"].disabled = false;
    renderAll();
    await refreshOwnerGate();
  }

  function gatherMetadata(record) {
    const array = (value) => value.split(";").map((item) => item.trim()).filter(Boolean);
    const number = (value) => value.trim() ? Number(value) : null;
    return {
      title: el.title.value.trim(), description: el.description.value.trim() || null, mediaKind: el["media-kind"].value,
      BibleBook: el["bible-book"].value || null, chapter: number(el.chapter.value), verseStart: number(el["verse-start"].value), verseEnd: number(el["verse-end"].value),
      translation: el.translation.value.trim() || null, ScriptureReferences: array(el["scripture-reference"].value),
      reviewStatus: el["review-status"].value, mappingConfidence: el["mapping-confidence"].value,
      safetyStatus: el["safety-status"].value, copyrightStatus: el["copyright-status"].value,
      sourceChannel: el["source-channel"].value.trim() || null,
      ownerNotes: el["owner-notes"].value.trim() || null,
      themes: record.themes || [], TeoyubeWordIds: record.TeoyubeWordIds || [], promiseClusterIds: record.promiseClusterIds || [],
      journeyIds: record.journeyIds || [], callingIds: record.callingIds || [], prayerSequenceIds: record.prayerSequenceIds || [], recommendedSurfaces: record.recommendedSurfaces || []
    };
  }

  async function probeRecord(record, retry = 0) {
    if (state.probe.cancelled) return;
    const video = document.createElement("video");
    video.preload = "metadata"; video.muted = true; video.playsInline = true;
    const mimeSupport = video.canPlayType(record.mimeType || "video/mp4") || "";
    return new Promise((resolve) => {
      const timer = setTimeout(() => finish(false, ["Metadata probe timed out."]), 12000);
      const cleanup = () => { clearTimeout(timer); video.removeAttribute("src"); video.load(); };
      const finish = (ok, warnings = []) => {
        const width = ok ? video.videoWidth || null : null; const height = ok ? video.videoHeight || null : null;
        const newValues = { durationSeconds: ok && Number.isFinite(video.duration) ? Number(video.duration.toFixed(3)) : null, width, height,
          orientation: width && height ? (width > height ? "landscape" : width < height ? "portrait" : "square") : "unknown",
          aspectRatio: width && height ? Number((width / height).toFixed(4)) : null, browserPlayable: ok,
          browserMimeSupport: mimeSupport || "not_supported", metadataProbeStatus: ok ? "complete" : "failed",
          metadataProbeWarnings: warnings, metadataProbeReadyState: video.readyState, metadataProbeNetworkState: video.networkState,
          metadataProbeSeekable: ok ? video.seekable.length > 0 : false };
        cleanup();
        if (!ok && retry < 1) return setTimeout(() => probeRecord(record, retry + 1).then(resolve), 250);
        stage(record.id, newValues, "technical", "Browser metadata probe", false); resolve();
      };
      video.addEventListener("loadedmetadata", () => finish(true), { once: true });
      video.addEventListener("error", () => finish(false, ["Browser could not load protected metadata."]), { once: true });
      video.src = `/__qa/teoyubeworld/media/${record.id}?qa=1`;
    });
  }

  async function runProbe(records) {
    if (state.probe.running || !records.length) return;
    snapshot("Start browser metadata probe");
    state.probe = { paused: false, cancelled: false, running: true, complete: 0, total: records.length };
    el["pause-probe"].disabled = false;
    for (let index = 0; index < records.length; index += 2) {
      while (state.probe.paused && !state.probe.cancelled) await new Promise((resolve) => setTimeout(resolve, 200));
      if (state.probe.cancelled) break;
      await Promise.all(records.slice(index, index + 2).map(probeRecord));
      state.probe.complete = Math.min(records.length, index + 2);
      el["probe-progress"].textContent = `Metadata probe ${state.probe.complete} / ${state.probe.total}`;
      renderDashboard();
    }
    state.probe.running = false; el["pause-probe"].disabled = true; el["resume-probe"].disabled = true;
    setStatus(`Browser metadata probe finished for ${state.probe.complete} record(s). Audio, codecs, bitrate, frame rate, and rotation remain unknown.`);
    renderAll();
  }

  async function capture(type) {
    const record = current(); const video = el["review-player"];
    if (!record || !video.videoWidth || !video.videoHeight) return setStatus("Play or seek a browser-readable frame before capture.");
    const maxWidth = type === "poster" ? 1280 : 480; const scale = Math.min(1, maxWidth / video.videoWidth);
    const canvas = el["capture-canvas"]; canvas.width = Math.round(video.videoWidth * scale); canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", .82));
    if (!blob) return setStatus("Browser frame capture failed.");
    const response = await fetch(`/__qa/teoyubeworld/review-image/${record.id}?qa=1&type=${type}`, { method: "POST", headers: { "Content-Type": blob.type }, body: blob });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Capture endpoint rejected the review image.");
    stage(record.id, { [type === "poster" ? "posterPath" : "thumbnailPath"]: result.generatedPath }, "owner", `Owner captured review ${type}`);
    setStatus(`${type} captured under generated review assets. Originals and public media remain unchanged.`); renderAll();
  }

  function batchValues(action, value, record) {
    if (action === "titlePrefix") return { title: `${value}${record.title || record.sourceFileName}` };
    if (action === "needs_review") return { reviewStatus: "needs_review" };
    if (action === "rejected") return { reviewStatus: "rejected" };
    if (action === "pilot_add") return { pilotSelected: true };
    if (action === "pilot_remove") return { pilotSelected: false };
    if (["themes", "TeoyubeWordIds", "promiseClusterIds", "recommendedSurfaces"].includes(action)) return { [action]: [...new Set([...(record[action] || []), value])] };
    if (action === "ScriptureReferences") return { ScriptureReferences: [value], mappingConfidence: record.mappingConfidence === "confirmed" ? "needs_review" : record.mappingConfidence };
    return { [action]: value };
  }

  function populateSuggestion(select, fieldName) {
    select.addEventListener("change", () => {
      const record = current(); if (!record || !select.value) return;
      stage(record.id, { [fieldName]: [...new Set([...(record[fieldName] || []), select.value])] }, "owner", `Owner selected local ${fieldName} suggestion`);
      setStatus("Local suggestion staged as Owner selected. It is not auto-confirmed."); renderAll();
    });
  }

  el["load-draft"].addEventListener("click", async () => {
    try { const response = await fetch("/api/media-review/draft?qa=1", { cache: "no-store" }); if (!response.ok) throw new Error(`Draft endpoint returned ${response.status}.`); await acceptManifest(await response.text()); }
    catch (error) { setStatus(`Could not load local draft: ${error.message}`); }
  });
  el.records.addEventListener("click", (event) => { const card = event.target.closest(".record-card"); if (!card) return; if (event.target.matches('input[type="checkbox"]')) { event.target.checked ? state.selected.add(card.dataset.id) : state.selected.delete(card.dataset.id); renderAll(); return; } if (event.target.closest(".open-record")) { state.currentId = card.dataset.id; renderAll(); el["review-player"].focus(); } });
  el["sequence-members"].addEventListener("click", (event) => { const button = event.target.closest("button[data-id]"); if (button) { state.currentId = button.dataset.id; renderAll(); } });
  el.search.addEventListener("input", () => { state.page = 1; renderRecords(); }); el["queue-filter"].addEventListener("change", () => { state.page = 1; renderRecords(); });
  el["previous-page"].addEventListener("click", () => { state.page -= 1; renderRecords(); }); el["next-page"].addEventListener("click", () => { state.page += 1; renderRecords(); });
  el["select-page"].addEventListener("click", () => { const matches = filtered().slice((state.page - 1) * state.pageSize, state.page * state.pageSize); matches.forEach((record) => state.selected.add(record.id)); renderAll(); });
  el["clear-selection"].addEventListener("click", () => { state.selected.clear(); renderAll(); });
  el["duplicate-groups"].addEventListener("change", () => { const member = recordsForDuplicate(el["duplicate-groups"].value)[0]; if (member) state.currentId = member.id; renderAll(); });
  el["sequence-groups"].addEventListener("change", () => { const member = recordsForSequence(el["sequence-groups"].value)[0]; state.sequenceId = el["sequence-groups"].value; if (member) state.currentId = member.id; renderAll(); });
  el["stage-metadata"].addEventListener("click", () => { const record = current(); if (!record) return; stage(record.id, gatherMetadata(record), "owner", "Owner staged metadata form"); setStatus("Metadata staged in the local owner patch. Scripture confirmation remains an explicit owner decision."); renderAll(); });
  el["toggle-pilot"].addEventListener("click", () => { const record = current(); if (!record) return; stage(record.id, { pilotSelected: !record.pilotSelected }, "pilot", record.pilotSelected ? "Owner removed record from pilot" : "Owner selected record for pilot"); renderAll(); });
  el["scripture-selector"].addEventListener("change", () => { if (!current() || !el["scripture-selector"].value) return; el["scripture-reference"].value = el["scripture-selector"].value; if (el["mapping-confidence"].value === "confirmed") el["mapping-confidence"].value = "needs_review"; setStatus("Suggested local Scripture anchor loaded into the form. Owner confirmation is still required."); });
  populateSuggestion(el["word-selector"], "TeoyubeWordIds"); populateSuggestion(el["promise-selector"], "promiseClusterIds"); populateSuggestion(el["journey-selector"], "journeyIds"); populateSuggestion(el["calling-selector"], "callingIds"); populateSuggestion(el["prayer-selector"], "prayerSequenceIds"); populateSuggestion(el["theme-selector"], "themes"); populateSuggestion(el["surface-selector"], "recommendedSurfaces");
  el["probe-selected"].addEventListener("click", () => runProbe(allMerged().filter((record) => state.selected.has(record.id) && record.mimeType === "video/mp4")));
  el["probe-page"].addEventListener("click", () => runProbe(filtered().slice((state.page - 1) * state.pageSize, state.page * state.pageSize).filter((record) => record.mimeType === "video/mp4")));
  el["probe-pilot"].addEventListener("click", () => runProbe(pilotState().selected.filter((record) => record.mimeType === "video/mp4")));
  el["pause-probe"].addEventListener("click", () => { state.probe.paused = true; el["resume-probe"].disabled = false; setStatus("Metadata probe paused after the current item."); });
  el["resume-probe"].addEventListener("click", () => { state.probe.paused = false; el["resume-probe"].disabled = true; setStatus("Metadata probe resumed."); });
  el["export-technical"].addEventListener("click", async () => { try { const result = await savePatch("technical"); setStatus(`${result.operationCount} browser metadata operation(s) saved to the generated technical patch.`); } catch (error) { setStatus(error.message); } });
  el["save-owner-patch"].addEventListener("click", async () => { try { const categories = PATCH_CATEGORIES.filter((name) => state.operations[name].length); const results = await Promise.all(categories.map(savePatch)); setStatus(`${results.reduce((sum, item) => sum + item.operationCount, 0)} operation(s) saved with timestamped backups. Runtime manifest unchanged.`); await refreshOwnerGate(); } catch (error) { setStatus(error.message); } });
  el["capture-thumbnail"].addEventListener("click", () => capture("thumbnail").catch((error) => setStatus(error.message))); el["capture-poster"].addEventListener("click", () => capture("poster").catch((error) => setStatus(error.message)));
  el["review-player"].addEventListener("loadedmetadata", () => { el["player-state"].textContent = `Protected metadata loaded: ${el["review-player"].videoWidth} × ${el["review-player"].videoHeight}, ${Number(el["review-player"].duration || 0).toFixed(2)} seconds.`; });
  el["review-player"].addEventListener("error", () => { el["player-state"].textContent = "This source could not be decoded by the browser. A reviewed derivative may be required."; });
  el["choose-canonical"].addEventListener("click", () => { const record = current(); const members = record ? recordsForDuplicate(record.duplicateGroupId) : []; if (!members.length) return; snapshot("Canonical duplicate choice"); members.forEach((member) => stage(member.id, { duplicateDecision: member.id === record.id ? "canonical" : "duplicate_candidate", canonicalForDuplicateGroup: member.id === record.id }, "duplicate", "Owner staged canonical duplicate choice", false)); setStatus("Canonical choice staged. No source files were deleted, moved, or modified."); renderAll(); });
  el["defer-duplicate"].addEventListener("click", () => { const record = current(); const members = record ? recordsForDuplicate(record.duplicateGroupId) : []; snapshot("Defer duplicate group"); members.forEach((member) => stage(member.id, { duplicateDecision: "deferred", canonicalForDuplicateGroup: false }, "duplicate", "Owner deferred duplicate decision", false)); renderAll(); });
  el["intentional-copy"].addEventListener("click", () => { const record = current(); const members = record ? recordsForDuplicate(record.duplicateGroupId) : []; snapshot("Mark intentional copies"); members.forEach((member) => stage(member.id, { duplicateDecision: "keep_all", intentionalCopy: true }, "duplicate", "Owner marked intentional copies", false)); renderAll(); });
  function moveSequence(offset) { const record = current(); const members = recordsForSequence(record?.sequenceId); const index = members.findIndex((item) => item.id === record?.id); const other = members[index + offset]; if (!record || !other) return; snapshot("Reorder sequence"); stage(record.id, { sequenceOrder: index + offset + 1 }, "sequence", "Owner reordered sequence", false); stage(other.id, { sequenceOrder: index + 1 }, "sequence", "Owner reordered sequence", false); renderAll(); }
  el["sequence-up"].addEventListener("click", () => moveSequence(-1)); el["sequence-down"].addEventListener("click", () => moveSequence(1));
  el["confirm-sequence"].addEventListener("click", () => { const members = recordsForSequence(state.sequenceId); if (!members.length) return; if (!el["sequence-scripture"].value.trim() || members.some((member) => member.mappingConfidence !== "confirmed")) return setStatus("Scripture sequence confirmation blocked: enter a passage and confirm Scripture metadata for every selected segment."); snapshot("Confirm Scripture sequence"); members.forEach((member, index) => stage(member.id, { sequenceReviewStatus: "approved", sequenceTitle: el["sequence-name"].value.trim() || state.sequenceId, sequenceDescription: "Owner-curated Scripture sequence", sequenceOrder: index + 1 }, "sequence", "Owner confirmed Scripture sequence", false)); renderAll(); });
  el["reject-sequence"].addEventListener("click", () => { const members = recordsForSequence(state.sequenceId); snapshot("Reject sequence"); members.forEach((member) => stage(member.id, { sequenceReviewStatus: "rejected" }, "sequence", "Owner rejected sequence", false)); renderAll(); });
  function sequenceStep(offset) { const members = recordsForSequence(current()?.sequenceId); const index = members.findIndex((record) => record.id === state.currentId); const next = members[index + offset]; if (next) { state.currentId = next.id; renderAll(); } }
  el["qa-previous"].addEventListener("click", () => sequenceStep(-1)); el["qa-next"].addEventListener("click", () => sequenceStep(1));
  el["save-reference"].addEventListener("click", () => { const result = window.TeoyubeWorldMedia.saveTeoyubeWorldMediaToBook(current()?.id); setStatus(result.reason); }); el["add-promise"].addEventListener("click", () => setStatus("No Promise Table entry was created: this source remains unapproved and review-only."));
  el["why-media"].addEventListener("click", () => { const record = current(); const explanation = window.TeoyubeWorldMedia.explainTeoyubeWorldMediaMatch(record, { surface: "media_review", scriptureReference: record.ScriptureReferences?.[0], BibleBook: record.BibleBook, sequenceId: record.sequenceId }); el["why-content"].innerHTML = `<p><strong>Context:</strong> local owner review</p><p><strong>Direct reference match:</strong> ${explanation.directReferenceMatch}</p><p><strong>Book/chapter match:</strong> ${explanation.bookOrChapterMatch}</p><p><strong>Match score:</strong> ${explanation.matchScore}</p><p><strong>Mapping confidence:</strong> ${escapeHtml(explanation.mappingConfidence)}</p><p><strong>Review:</strong> ${escapeHtml(explanation.reviewStatus)} · <strong>Safety:</strong> ${escapeHtml(explanation.safetyStatus)}</p><p class="notice warning">Not approved for app integration</p>`; el["why-dialog"].showModal(); });
  el["preview-batch"].addEventListener("click", () => { const action = el["batch-action"].value; const value = el["batch-value"].value.trim(); if (!action || (!["needs_review", "rejected", "pilot_add", "pilot_remove"].includes(action) && !value)) return setStatus("Choose a batch action and value."); el["batch-preview"].innerHTML = `<p><strong>${state.selected.size}</strong> selected records will receive <strong>${escapeHtml(action)}</strong>${value ? ` = ${escapeHtml(value)}` : ""}.</p><p>Scripture mapping will not be auto-confirmed. A single undo snapshot will be created.</p>`; el["confirm-dialog"].showModal(); });
  el["confirm-batch"].addEventListener("click", (event) => { event.preventDefault(); const action = el["batch-action"].value; const value = el["batch-value"].value.trim(); snapshot(`Batch ${action}`); for (const id of state.selected) { const record = allMerged().find((item) => item.id === id); stage(id, batchValues(action, value, record), action.startsWith("pilot_") ? "pilot" : "owner", `Owner confirmed batch action: ${action}`, false); } el["confirm-dialog"].close(); setStatus(`Batch action staged for ${state.selected.size} records.`); renderAll(); });
  el.undo.addEventListener("click", () => { const prior = state.undo.pop(); if (!prior) return; state.edits = new Map(prior.edits); state.operations = prior.operations; el.undo.disabled = !state.undo.length; setStatus(`Undid: ${prior.label}.`); renderAll(); });
  el["reset-unsaved"].addEventListener("click", () => { snapshot("Reset unsaved review changes"); state.edits.clear(); state.operations = Object.fromEntries(PATCH_CATEGORIES.map((name) => [name, []])); el["save-owner-patch"].disabled = true; el["reset-unsaved"].disabled = true; setStatus("Unsaved review changes reset. Existing generated patches were not overwritten."); renderAll(); });
  el["import-patch"].addEventListener("change", async (event) => { try { const file = event.target.files?.[0]; if (!file) return; state.importedPatch = JSON.parse(await file.text()); el["validate-patch"].disabled = false; el["preview-patch"].disabled = false; setStatus("Patch imported in memory. Validate before previewing."); } catch (error) { setStatus(`Patch import failed: ${error.message}`); } });
  function importedValid() { const p = state.importedPatch; return Boolean(p && p.schemaVersion === "1.0.0" && p.sourceDraftManifestChecksum === state.checksum && Array.isArray(p.operations) && p.operations.every((op) => state.records.some((record) => record.id === op.mediaId) && op.newValues && !/[A-Za-z]:[\\/]|<script/i.test(JSON.stringify(op)))); }
  el["validate-patch"].addEventListener("click", () => setStatus(importedValid() ? "Imported patch is structurally valid for this draft." : "Imported patch is invalid or belongs to another draft."));
  el["preview-patch"].addEventListener("click", () => { if (!importedValid()) return setStatus("Patch preview refused: validation failed."); snapshot("Imported patch preview"); state.importedPatch.operations.forEach((op) => stage(op.mediaId, op.newValues, "owner", "Imported review patch preview", false)); setStatus("Imported patch applied only as an in-memory preview."); renderAll(); });
  el["rerun-owner-gate"].addEventListener("click", () => refreshOwnerGate().then((result) => setStatus(result.blockerCount ? `Validation complete: ${result.blockerCount} blocker(s) remain.` : "Validation complete. Review the current lifecycle action.")));
  el["preview-derivative-plan"].addEventListener("click", async () => {
    try {
      const response = await fetch("/__qa/teoyubeworld/derivative-plan?qa=1", { method: "POST", cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Derivative plan returned ${response.status}.`);
      setStatus(`Dry-run plan refreshed: ${result.plannedCommandCount} inert command preview(s), ${result.commandsExecuted} executed, ${result.publicFilesCopied} public files written.`);
    } catch (error) { setStatus(`Derivative planning failed safely: ${error.message}`); }
  });
  el["owner-gate-control"].addEventListener("click", async (event) => {
    const button = event.target.closest("#approve-pilot-definition");
    if (!button) return;
    button.disabled = true;
    try {
      const response = await fetch("/__qa/teoyubeworld/owner-approval?qa=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerConfirmation: true }),
        cache: "no-store"
      });
      const result = await response.json();
      if (!response.ok) {
        state.ownerGate = result;
        el["owner-gate-control"].replaceChildren();
        renderDashboard();
        return setStatus(`Approval rejected safely: ${result.blockerCount || result.blockers?.length || 1} blocker(s).`);
      }
      setStatus("Pilot approved. No media was copied, transcoded, or published. Derivative execution remains separately controlled.");
      await refreshOwnerGate();
    } catch (error) {
      el["owner-gate-control"].replaceChildren();
      setStatus(`Approval failed safely: ${error.message}`);
    }
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close()); if (event.target === el["review-player"] && event.key === "ArrowRight") el["review-player"].currentTime += 5; if (event.target === el["review-player"] && event.key === "ArrowLeft") el["review-player"].currentTime -= 5; });
  document.addEventListener("visibilitychange", () => { if (document.hidden) el["review-player"].pause(); });
  window.addEventListener("beforeunload", () => { state.probe.cancelled = true; });
  renderDashboard(); renderRecords();
})();
