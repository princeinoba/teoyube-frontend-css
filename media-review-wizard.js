(() => {
  "use strict";

  const params = new URLSearchParams(location.search);
  if (params.get("mode") !== "pilot-wizard") return;
  const loopback = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
  const qa = params.get("qa") === "1";
  const byId = (id) => document.getElementById(id);
  const wizard = byId("assisted-pilot-wizard");
  const workspace = byId("workspace");
  const status = byId("wizard-status");
  const stepNames = ["Overview", "Sequence", "Records", "Standalone", "Rights", "Scripture", "Safety", "Validate"];
  const categoryLabels = {
    technical: "Technical", record_metadata: "Record metadata", owner_review: "Owner review",
    scripture: "Scripture", rights: "Rights", safety: "Safety", sequence: "Sequence",
    duplicate: "Duplicate", checksum_source: "Checksum/source", pilot_count: "Pilot count",
    approval_artifact: "Approval artifact"
  };
  const state = {
    data: null,
    records: [],
    currentStep: 1,
    currentIndex: 0,
    segmentIds: [],
    sequenceCandidateId: null,
    firstBlocker: null,
    playingSequenceIndex: -1,
    previewTokens: {},
    recordDirty: false
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function metric(label, value) {
    return `<div class="metric"><strong>${escapeHtml(value)}</strong>${escapeHtml(label)}</div>`;
  }

  function setStatus(message, tone = "") {
    status.textContent = message;
    status.className = `notice${tone ? ` ${tone}` : ""}`;
  }

  function artifactUrl(asset) {
    return asset ? `/__qa/teoyubeworld/assisted-pilot/review-artifact?qa=1&asset=${encodeURIComponent(asset)}` : "";
  }

  function currentRecord() {
    return state.records[state.currentIndex] || null;
  }

  function suggestionFor(mediaId) {
    return state.data?.candidate?.metadataSuggestions?.find((item) => item.mediaId === mediaId) || {};
  }

  function displayTitle(record) {
    return record.titleAccepted || record.title || record.titleSuggested || suggestionFor(record.id).title || record.sourceFileName || record.id;
  }

  function stopPlayers(except = null) {
    for (const player of [byId("wizard-player"), byId("wizard-sequence-player")]) {
      if (player && player !== except && !player.paused) player.pause();
    }
  }

  const blockerPriorityOrder = [
    "technical",
    "checksum_source",
    "duplicate",
    "pilot_count",
    "sequence",
    "record_metadata",
    "scripture",
    "rights",
    "safety",
    "owner_review",
    "approval_artifact"
  ];

  function blockerPriority(blocker) {
    const index = blockerPriorityOrder.indexOf(String(blocker?.category || ""));
    return index < 0 ? blockerPriorityOrder.length : index;
  }

  function orderedBlockers() {
    return [...(state.data?.gate?.blockers || [])].sort((left, right) =>
      blockerPriority(left) - blockerPriority(right) ||
      String(left.mediaId || "").localeCompare(String(right.mediaId || "")) ||
      String(left.code || "").localeCompare(String(right.code || ""))
    );
  }

  function goToStep(step, focusId = null) {
    state.currentStep = Math.max(1, Math.min(8, Number(step) || 1));
    document.querySelectorAll("[data-step-panel]").forEach((panel) => {
      panel.hidden = Number(panel.dataset.stepPanel) !== state.currentStep;
    });
    document.querySelectorAll("[data-wizard-step]").forEach((button) => {
      const active = Number(button.dataset.wizardStep) === state.currentStep;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "step" : "false");
    });
    byId("wizard-step-status").textContent = `Step ${state.currentStep} of 8: ${stepNames[state.currentStep - 1]}`;
    byId("wizard-back").disabled = state.currentStep === 1;
    byId("wizard-continue").hidden = state.currentStep === 8;
    if (state.currentStep === 3) renderRecord();
    if (state.currentStep === 4) renderStandalone();
    if (state.currentStep === 6) renderScripturePreview();
    if (state.currentStep === 8) renderValidation();
    requestAnimationFrame(() => {
      const target = focusId ? byId(focusId) : document.querySelector(`[data-step-panel="${state.currentStep}"] h3`);
      target?.focus?.();
      target?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    });
  }

  function renderOverview() {
    const candidate = state.data.candidate;
    const records = state.records.filter((record) => record.pilotSelected === true);
    const sequence = state.data.sequence;
    const technicalComplete = records.filter((record) => record.technicalMetadataComplete).length;
    byId("wizard-overview-metrics").innerHTML = [
      metric("Selected shorts", records.length), metric("Suggested sequence segments", sequence.suggestedSegmentIds.length),
      metric("Confirmed sequence segments", sequence.segmentIds.length), metric("Standalone shorts", sequence.standaloneRecordIds.length),
      metric("Long-form", 0), metric("Technical ready", `${technicalComplete}/${records.length}`),
      metric("Duplicate exclusions", candidate.excludedExactDuplicateIds.length), metric("Current blockers", state.data.blockerCount)
    ].join("");
    byId("wizard-recommendation").textContent = "The selected clips form a suggested opening Galatians 1 review sequence based on local source order and visible contact-sheet text. It remains unconfirmed until the owner accepts the passage and order.";
    byId("wizard-selection-reasons").innerHTML = `<strong>Deterministic selection evidence</strong><ol>${candidate.selectedShortIds.map((mediaId) => {
      const row = candidate.scoringReasons[mediaId];
      return `<li><strong>${escapeHtml(mediaId)}</strong>: ${escapeHtml((row?.reasons || []).join("; "))}</li>`;
    }).join("")}</ol>`;
  }

  function renderSequenceCandidates() {
    const candidate = state.data.candidate;
    byId("wizard-sequence-candidates").innerHTML = candidate.candidateSequences.map((item) => `
      <label class="sequence-candidate${item.sequenceId === candidate.recommendedSequenceId ? " recommended" : ""}">
        <input type="radio" name="wizard-sequence-candidate" value="${escapeHtml(item.sequenceId)}" ${state.sequenceCandidateId === item.sequenceId ? "checked" : ""} />
        <img src="${artifactUrl(item.previewPath)}" alt="Review preview for ${escapeHtml(item.sequenceTitle)}" />
        <strong>${escapeHtml(item.sequenceTitle)}</strong><span>${item.sourceRecordCount} source-family records; only the selected 12 are proposed here</span>
      </label>`).join("");
    byId("wizard-sequence-sheet").src = artifactUrl(candidate.reviewArtifacts.sequenceContactSheet);
    if (!byId("wizard-sequence-name").value) byId("wizard-sequence-name").value = "No Other Gospel - Galatians 1 Opening";
    if (!byId("wizard-sequence-scripture").value) byId("wizard-sequence-scripture").value = "Galatians 1:1-12";
  }

  function renderSegmentList() {
    const ordered = [
      ...state.segmentIds.map((id) => state.records.find((record) => record.id === id)).filter(Boolean),
      ...state.records.filter((record) => !state.segmentIds.includes(record.id))
    ];
    byId("wizard-segment-list").innerHTML = ordered.map((record) => {
      const selected = state.segmentIds.includes(record.id);
      const position = state.segmentIds.indexOf(record.id);
      return `<div class="segment-order-row" data-media-id="${record.id}">
        <label><input type="checkbox" class="wizard-segment-toggle" ${selected ? "checked" : ""} /> <span>${selected ? `${position + 1}. ` : ""}${escapeHtml(displayTitle(record))}</span></label>
        <span>${Number(record.durationSeconds || 0).toFixed(1)}s | ${record.hasAudio ? "audio" : "silent"}</span>
        <button class="segment-up" type="button" aria-label="Move segment up" ${!selected || position === 0 ? "disabled" : ""}>Up</button>
        <button class="segment-down" type="button" aria-label="Move segment down" ${!selected || position === state.segmentIds.length - 1 ? "disabled" : ""}>Down</button>
      </div>`;
    }).join("");
  }

  function renderSequence() {
    renderSequenceCandidates();
    renderSegmentList();
  }

  function completionItem(label, complete, invalid = false) {
    const statusClass = complete ? "complete" : invalid ? "invalid" : "missing";
    const statusText = complete ? "Complete" : invalid ? "Invalid" : "Needs confirmation";
    return `<span class="completion-item ${statusClass}"><strong>${escapeHtml(statusText)}:</strong> ${escapeHtml(label)}</span>`;
  }

  function renderRecordCompletion(record) {
    const scriptureAccepted = Boolean(record.scriptureReferenceAccepted);
    const items = [
      ["Video watched and owner review", record.ownerReviewed],
      ["Title accepted or edited", record.titleConfirmed],
      ["Description accepted or edited", record.descriptionConfirmed],
      ["Scripture reference accepted", scriptureAccepted],
      ["Translation selected", Boolean(record.translation)],
      ["Scripture confirmed", record.scriptureConfirmed && record.translationConfirmed],
      ["Rights status confirmed", record.rightsConfirmed && record.rightsStatus !== "not_approved"],
      ["Safety status confirmed", record.safetyConfirmed && record.safetyStatus === "approved_for_pilot"],
      ["Checksum patch saved", state.data.ownerPatchedIds.includes(record.id) && Boolean(record.sourceChecksum)]
    ];
    const complete = items.filter((item) => item[1]).length;
    byId("wizard-record-progress").innerHTML = `<strong>${complete} of 9 complete</strong><div class="completion-grid">${items.map(([label, done]) => completionItem(label, done)).join("")}</div>`;
  }

  function renderRecord() {
    const record = currentRecord();
    if (!record) return;
    stopPlayers();
    const suggestion = suggestionFor(record.id);
    const technical = state.data.candidate.technicalMetadata[record.id] || {};
    byId("wizard-record-count").textContent = `Record ${state.currentIndex + 1} of ${state.records.length}`;
    byId("wizard-media-id").value = record.id;
    byId("wizard-record-name").value = record.titleAccepted || record.title || suggestion.title || "";
    byId("wizard-record-description").value = record.descriptionAccepted || record.description || suggestion.description || "";
    byId("wizard-record-scripture").value = record.scriptureReferenceAccepted || record.ScriptureReferences?.[0] || "";
    byId("wizard-record-translation").value = record.translation || "Unknown";
    byId("wizard-source-channel").value = record.sourceChannel || "TeoyubeWorld";
    byId("wizard-rights-status").value = record.rightsStatus || "not_approved";
    byId("wizard-record-safety").value = record.safetyStatus || "unknown";
    byId("wizard-owner-notes").value = record.ownerNotes || "";
    byId("wizard-title-suggestion").textContent = `Suggested: ${suggestion.title || "No safe suggestion"}`;
    byId("wizard-description-suggestion").textContent = `Suggested: ${suggestion.description || "No safe suggestion"}`;
    byId("wizard-scripture-suggestion").textContent = suggestion.scriptureReference
      ? `Suggested: ${suggestion.scriptureReference}. ${suggestion.evidenceSummary || "Owner confirmation required."}`
      : "Needs owner confirmation. No generic placeholder is accepted.";
    byId("wizard-record-name").dataset.accepted = String(record.titleConfirmed === true);
    byId("wizard-record-description").dataset.accepted = String(record.descriptionConfirmed === true);
    byId("wizard-record-scripture").dataset.accepted = String(Boolean(record.scriptureReferenceAccepted));
    byId("wizard-player").src = `/__qa/teoyubeworld/media/${record.id}?qa=1`;
    byId("wizard-player").load();
    byId("wizard-poster").src = artifactUrl(state.data.candidate.reviewArtifacts.posters[record.id]);
    byId("wizard-contact-sheet").src = artifactUrl(state.data.candidate.reviewArtifacts.contactSheets[record.id]);
    byId("wizard-technical").innerHTML = [
      ["Media ID", record.id], ["Duration", `${Number(technical.durationSeconds || 0).toFixed(2)} seconds`],
      ["Dimensions", `${technical.width || "unknown"} x ${technical.height || "unknown"}`],
      ["Codec", technical.videoCodec || "unknown"], ["Frame rate", technical.frameRate || "unknown"],
      ["Audio", technical.hasAudio ? `${technical.audioCodec || "present"} - rights review required` : "No audio stream"],
      ["Sequence", state.segmentIds.includes(record.id) ? `Segment ${state.segmentIds.indexOf(record.id) + 1}` : "Standalone"],
      ["Duplicate", record.duplicateGroupId || "No exact duplicate group"]
    ].map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join("");
    byId("wizard-record-warnings").innerHTML = [...(record.warnings || []), ...(record.metadataProbeWarnings || [])].map((item) => `<p>${escapeHtml(item)}</p>`).join("") || "No technical warning.";
    for (const id of ["wizard-confirm-scripture-record", "wizard-confirm-source", "wizard-confirm-rights-record", "wizard-confirm-safety-record", "wizard-confirm-record"]) byId(id).checked = false;
    byId("wizard-exclude-record").textContent = record.pilotSelected === true ? "Exclude from Pilot" : "Restore to Pilot";
    byId("wizard-record-previous").disabled = state.currentIndex === 0;
    byId("wizard-record-next").disabled = state.currentIndex === state.records.length - 1;
    state.recordDirty = false;
    renderRecordCompletion(record);
  }

  function renderStandalone() {
    const records = state.records.filter((record) => record.pilotSelected === true && !state.data.sequence.segmentIds.includes(record.id));
    byId("wizard-standalone-list").innerHTML = records.length ? records.map((record) => `
      <button type="button" class="standalone-record" data-media-id="${record.id}">
        <img src="${artifactUrl(state.data.candidate.reviewArtifacts.posters[record.id])}" alt="" />
        <span><strong>${escapeHtml(displayTitle(record))}</strong><small>${record.ownerReviewed ? "Owner reviewed" : "Owner reconfirmation required"}</small></span>
      </button>`).join("") : '<p class="notice">All selected shorts are assigned to the confirmed sequence.</p>';
  }

  function renderScripturePreview() {
    byId("wizard-scripture-preview").innerHTML = state.records.map((record, index) => {
      const suggestion = suggestionFor(record.id);
      return `<div class="reconfirmation-record"><strong>${index + 1}. ${escapeHtml(suggestion.title)}</strong><span>${escapeHtml(suggestion.scriptureReference || "Needs owner confirmation")}</span><span>${escapeHtml(suggestion.confidence || "needs_review")}</span></div>`;
    }).join("");
  }

  function renderReconfirmationRecords() {
    byId("wizard-reconfirmation-records").innerHTML = state.records.map((record, index) => `
      <div class="reconfirmation-record"><strong>${index + 1}. ${escapeHtml(displayTitle(record))}</strong>
      <span>${escapeHtml(record.scriptureReferenceAccepted || "Scripture missing")}</span>
      <span>${escapeHtml(record.rightsStatus || "rights missing")}</span>
      <span>${escapeHtml(record.safetyStatus || "safety missing")}</span>
      <span>${record.ownerReviewed ? "Reviewed" : "Reconfirm"}</span></div>`).join("");
  }

  function renderValidation() {
    const gate = state.data.gate;
    const selected = state.records.filter((record) => record.pilotSelected === true);
    byId("wizard-validation-metrics").innerHTML = [
      metric("Selected shorts", gate.counts.approvedShorts), metric("Selected sequences", gate.counts.approvedSequences),
      metric("Long-form", gate.counts.approvedLongForm), metric("Owner reviewed", selected.filter((record) => record.ownerReviewed).length),
      metric("Scripture confirmed", selected.filter((record) => record.scriptureConfirmed).length),
      metric("Rights confirmed", selected.filter((record) => record.rightsConfirmed).length),
      metric("Safety confirmed", selected.filter((record) => record.safetyConfirmed).length), metric("Total blockers", gate.blockerCount)
    ].join("");
    byId("wizard-blocker-categories").innerHTML = Object.entries(gate.blockersByCategory || {}).map(([category, count]) => `<div class="blocker-category"><strong>${count}</strong>${escapeHtml(categoryLabels[category] || category)}</div>`).join("");
    const blockers = orderedBlockers();
    state.firstBlocker = blockers[0] || null;
    byId("wizard-blockers").innerHTML = blockers.length
      ? `<strong>${blockers.length} canonical blocker(s) remain</strong>${blockers.slice(0, 30).map((item) => `<div class="blocker-row"><code>${escapeHtml(item.blockerId || item.code)}</code><span>${escapeHtml(item.message)} <small>${escapeHtml(item.requiredAction || "")}</small></span><button type="button" data-blocker-id="${escapeHtml(item.blockerId)}">Open</button></div>`).join("")}${blockers.length > 30 ? `<p>+ ${blockers.length - 30} more in the same categorized state.</p>` : ""}`
      : "<strong>Zero blockers. The server will re-read persisted state and checksums before returning the owner approval control.</strong>";
    byId("wizard-approval-control").replaceChildren();
    byId("wizard-approval-notice").textContent = blockers.length ? "No approval control is rendered while blockers remain." : "Revalidating the complete checksum-bound owner gate.";
    if (!blockers.length) refreshApprovalControl();
    byId("wizard-summary").innerHTML = `<strong>Final pilot summary</strong><p>${selected.length} selected shorts; ${gate.counts.approvedSequences} owner-confirmed sequence; ${gate.counts.approvedLongForm} long-form records.</p><p>No source media was modified, copied, transcoded, published, or uploaded.</p>`;
    renderReconfirmationRecords();
  }

  function renderApprovedState() {
    const gate = state.data.gate;
    const approval = state.data.approvalSummary;
    const approved = byId("wizard-approved-state");
    wizard.classList.add("approved");
    approved.hidden = false;
    document.querySelectorAll("[data-step-panel]").forEach((panel) => { panel.hidden = true; });
    byId("wizard-approved-metrics").innerHTML = [
      metric("Reviewed short records", approval.approvedRecordCount),
      metric("Confirmed Scripture sequence", approval.approvedSequenceCount),
      metric("Confirmed sequence segments", approval.approvedSequenceSegmentCount),
      metric("Long-form records", 0),
      metric("Blockers", gate.blockerCount),
      metric("Derivatives generated", state.data.derivativesGenerated),
      metric("Media copied", state.data.mediaCopied),
      metric("Files published", state.data.publicFilesWritten)
    ].join("");
    byId("wizard-approved-artifact").textContent = approval.artifactId;
    byId("wizard-approved-timestamp").textContent = new Date(approval.approvalTimestamp).toLocaleString();
    byId("wizard-approved-integrity").textContent = gate.blockerCount === 0 ? "Passed" : "Blocked";
    byId("wizard-approved-lifecycle").textContent = state.data.lifecycleState;
    byId("wizard-state").textContent = "Pilot Approved";
    byId("wizard-authority").textContent = `Revision ${state.data.stateRevision} | approved ${new Date(approval.approvalTimestamp).toLocaleString()} | authoritative port ${state.data.serverPort}`;
    byId("wizard-blocker-badge").textContent = "0 blockers";
    setStatus("The owner-attested 12-record pilot is approved. Derivative planning is dry-run only; execution and publication are not authorized.");
  }

  function renderAll() {
    if (state.data.state === "owner_approved" && state.data.approvalSummary) {
      renderApprovedState();
      return;
    }
    wizard.classList.remove("approved");
    byId("wizard-approved-state").hidden = true;
    renderOverview();
    renderSequence();
    renderRecord();
    renderStandalone();
    renderScripturePreview();
    renderValidation();
    const blockers = state.data.gate.blockerCount;
    byId("wizard-blocker-badge").textContent = `${blockers} blocker${blockers === 1 ? "" : "s"}`;
    byId("wizard-state").textContent = blockers ? "Awaiting owner reconfirmation" : "Ready for final owner approval";
    byId("wizard-authority").textContent = `Revision ${state.data.stateRevision} | validated ${new Date(state.data.generatedAt).toLocaleString()} | authoritative port ${state.data.serverPort}`;
  }

  async function loadWizard(message = "Canonical assisted pilot loaded.") {
    const currentId = currentRecord()?.id;
    const response = await fetch("/__qa/teoyubeworld/assisted-pilot?qa=1", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Assisted pilot returned ${response.status}.`);
    state.data = data;
    state.records = data.selectedRecords;
    if (currentId) state.currentIndex = Math.max(0, state.records.findIndex((record) => record.id === currentId));
    const confirmed = data.sequence.segmentIds || [];
    state.segmentIds = confirmed.length ? [...confirmed] : [...(data.sequence.suggestedSegmentIds || [])];
    state.sequenceCandidateId = data.sequence.sequenceId || data.sequence.suggestedSequenceId;
    for (const id of ["wizard-reconfirm-watched", "wizard-rights-declaration", "wizard-scripture-declaration", "wizard-safety-declaration", "wizard-confirm-sequence"]) byId(id).checked = false;
    state.previewTokens = {};
    renderAll();
    if (data.state !== "owner_approved") setStatus(message);
  }

  async function postJson(pathname, body) {
    const response = await fetch(`${pathname}?qa=1`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, stateRevision: state.data?.stateRevision }),
      cache: "no-store"
    });
    const result = await response.json();
    if (!response.ok) {
      if (result.code === "stale_state_revision") await loadWizard("The canonical state changed and was refreshed before saving.");
      const error = new Error(result.error || result.blockers?.[0]?.message || `Request returned ${response.status}.`);
      error.result = result;
      throw error;
    }
    return result;
  }

  async function refreshApprovalControl() {
    const container = byId("wizard-approval-control");
    container.replaceChildren();
    const response = await fetch("/__qa/teoyubeworld/owner-gate-control?qa=1", { cache: "no-store" });
    const result = await response.json();
    if (response.ok && result.gatePassed === true && result.blockerCount === 0 && result.approvalControlHtml) {
      container.innerHTML = result.approvalControlHtml;
      byId("wizard-approval-notice").textContent = result.notice;
    } else {
      container.replaceChildren();
      byId("wizard-approval-notice").textContent = `${result.blockerCount || 1} blocker(s) remain. The approval control is absent.`;
    }
  }

  function openBlocker(blocker) {
    if (!blocker) return goToStep(8, "wizard-validation-title");
    setStatus(blocker.message, "warning");
    if (blocker.mediaId) {
      const index = state.records.findIndex((record) => record.id === blocker.mediaId);
      if (index >= 0) state.currentIndex = index;
      const focus = blocker.category === "scripture" ? "wizard-record-scripture" : blocker.category === "rights" ? "wizard-rights-status" : blocker.category === "safety" ? "wizard-record-safety" : "wizard-record-name";
      return goToStep(3, focus);
    }
    if (blocker.category === "sequence") return goToStep(2, "wizard-sequence-name");
    if (blocker.category === "rights") return goToStep(5, "wizard-bulk-rights");
    if (blocker.category === "scripture") return goToStep(6, "wizard-scripture-preview");
    if (blocker.category === "safety") return goToStep(7, "wizard-bulk-safety");
    goToStep(8, "wizard-blockers");
  }

  function resolveNextBlocker() {
    openBlocker(orderedBlockers()[0]);
  }

  async function previewBulk(kind, statusValue, outputId, extra = {}) {
    try {
      const result = await postJson("/__qa/teoyubeworld/assisted-pilot/bulk-review", { kind, status: statusValue, preview: true, ...extra });
      state.previewTokens[kind] = result.previewToken;
      byId(outputId).textContent = `${result.affectedCount} record(s) will be updated. ${result.warnings.join(" ")}`;
      const applyButton = byId(kind === "rights" ? "wizard-apply-rights" : kind === "safety" ? "wizard-apply-safety" : "wizard-apply-scripture");
      applyButton.disabled = result.affectedCount === 0;
    } catch (error) { setStatus(error.message, "danger"); }
  }

  async function applyBulk(kind, statusValue, extra = {}) {
    try {
      await postJson("/__qa/teoyubeworld/assisted-pilot/bulk-review", { kind, status: statusValue, previewToken: state.previewTokens[kind], ownerConfirmation: true, ...extra });
      await loadWizard(`${kind.replaceAll("_", " ")} values saved to the correct fields. Owner declarations remain unconfirmed.`);
    } catch (error) { setStatus(error.message, "danger"); }
  }

  if (!loopback || !qa) {
    wizard.hidden = false;
    wizard.querySelectorAll("button, input, select, textarea").forEach((control) => { control.disabled = true; });
    setStatus("The assisted pilot wizard requires loopback access and ?qa=1.", "danger");
    return;
  }

  [...workspace.children].forEach((child) => { if (child !== wizard && child.id !== "gate") child.hidden = true; });
  document.body.classList.add("pilot-wizard-mode");
  wizard.hidden = false;
  byId("load-draft").hidden = true;
  byId("save-owner-patch").hidden = true;

  byId("wizard-step-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-wizard-step]");
    if (button) goToStep(button.dataset.wizardStep);
  });
  byId("wizard-back").addEventListener("click", () => goToStep(state.currentStep - 1));
  byId("wizard-continue").addEventListener("click", () => goToStep(state.currentStep + 1));
  byId("wizard-start").addEventListener("click", () => goToStep(2, "wizard-sequence-title"));
  byId("wizard-change-sequence").addEventListener("click", () => goToStep(2, "wizard-sequence-candidates"));
  byId("wizard-show-reasons").addEventListener("click", (event) => {
    const panel = byId("wizard-selection-reasons");
    panel.hidden = !panel.hidden;
    event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
  });
  byId("wizard-sequence-candidates").addEventListener("change", (event) => {
    const radio = event.target.closest('input[name="wizard-sequence-candidate"]');
    if (!radio) return;
    state.sequenceCandidateId = radio.value;
    if (radio.value !== state.data.candidate.recommendedSequenceId) setStatus("Alternate families require a separate technical preparation pass.", "warning");
  });
  byId("wizard-segment-list").addEventListener("click", (event) => {
    const row = event.target.closest("[data-media-id]");
    if (!row) return;
    const mediaId = row.dataset.mediaId;
    if (event.target.classList.contains("wizard-segment-toggle")) {
      if (event.target.checked && !state.segmentIds.includes(mediaId)) state.segmentIds.push(mediaId);
      if (!event.target.checked) state.segmentIds = state.segmentIds.filter((id) => id !== mediaId);
      return renderSegmentList();
    }
    const index = state.segmentIds.indexOf(mediaId);
    const direction = event.target.classList.contains("segment-up") ? -1 : event.target.classList.contains("segment-down") ? 1 : 0;
    if (!direction || index < 0 || index + direction < 0 || index + direction >= state.segmentIds.length) return;
    [state.segmentIds[index], state.segmentIds[index + direction]] = [state.segmentIds[index + direction], state.segmentIds[index]];
    renderSegmentList();
  });
  byId("wizard-sequence-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.sequenceCandidateId !== state.data.candidate.recommendedSequenceId) return setStatus("Choose the technically prepared recommended candidate.", "warning");
    try {
      await postJson("/__qa/teoyubeworld/assisted-pilot/sequence", {
        sequenceId: state.sequenceCandidateId, sequenceTitle: byId("wizard-sequence-name").value,
        ScriptureReference: byId("wizard-sequence-scripture").value, segmentIds: state.segmentIds,
        confirmSequence: byId("wizard-confirm-sequence").checked
      });
      await loadWizard("Owner-confirmed sequence saved. The canonical gate was re-run.");
    } catch (error) { setStatus(error.message, "danger"); }
  });
  byId("wizard-record-previous").addEventListener("click", () => { state.currentIndex = Math.max(0, state.currentIndex - 1); renderRecord(); });
  byId("wizard-record-next").addEventListener("click", () => { state.currentIndex = Math.min(state.records.length - 1, state.currentIndex + 1); renderRecord(); });
  for (const id of ["wizard-record-name", "wizard-record-description", "wizard-record-scripture", "wizard-record-translation", "wizard-source-channel", "wizard-rights-status", "wizard-record-safety", "wizard-owner-notes"]) {
    byId(id).addEventListener("input", () => { state.recordDirty = true; if (["wizard-record-name", "wizard-record-description", "wizard-record-scripture"].includes(id)) byId(id).dataset.accepted = "true"; });
  }
  byId("wizard-accept-title").addEventListener("click", () => { byId("wizard-record-name").value = suggestionFor(currentRecord().id).title || ""; byId("wizard-record-name").dataset.accepted = "true"; state.recordDirty = true; });
  byId("wizard-accept-description").addEventListener("click", () => { byId("wizard-record-description").value = suggestionFor(currentRecord().id).description || ""; byId("wizard-record-description").dataset.accepted = "true"; state.recordDirty = true; });
  byId("wizard-accept-scripture").addEventListener("click", () => { const value = suggestionFor(currentRecord().id).scriptureReference; if (!value) return setStatus("No supported Scripture suggestion exists for this record.", "warning"); byId("wizard-record-scripture").value = value; byId("wizard-record-scripture").dataset.accepted = "true"; state.recordDirty = true; });
  byId("wizard-revert-record").addEventListener("click", renderRecord);
  byId("wizard-record-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const record = currentRecord();
    const suggestion = suggestionFor(record.id);
    const saveAndNext = event.submitter?.id === "wizard-save-next";
    try {
      await postJson("/__qa/teoyubeworld/assisted-pilot/record", {
        mediaId: record.id, title: byId("wizard-record-name").value, description: byId("wizard-record-description").value,
        ScriptureReference: byId("wizard-record-scripture").value, translation: byId("wizard-record-translation").value,
        sourceChannel: byId("wizard-source-channel").value, rightsStatus: byId("wizard-rights-status").value,
        safetyStatus: byId("wizard-record-safety").value, ownerNotes: byId("wizard-owner-notes").value,
        recommendedSurfaces: suggestion.recommendedSurfaces || [], acceptTitle: byId("wizard-record-name").dataset.accepted === "true",
        acceptDescription: byId("wizard-record-description").dataset.accepted === "true", acceptScripture: byId("wizard-record-scripture").dataset.accepted === "true",
        confirmScriptureReviewed: byId("wizard-confirm-scripture-record").checked, confirmOwnerSource: byId("wizard-confirm-source").checked,
        confirmRights: byId("wizard-confirm-rights-record").checked, confirmSafety: byId("wizard-confirm-safety-record").checked,
        confirmRecordReviewed: byId("wizard-confirm-record").checked
      });
      if (saveAndNext) state.currentIndex = Math.min(state.records.length - 1, state.currentIndex + 1);
      await loadWizard(saveAndNext ? "Record saved and next record opened." : "Record saved to the canonical checksum-bound patch.");
    } catch (error) { setStatus(error.message, "danger"); }
  });
  byId("wizard-exclude-record").addEventListener("click", async () => {
    const record = currentRecord();
    try {
      await postJson("/__qa/teoyubeworld/assisted-pilot/selection", { mediaId: record.id, selected: record.pilotSelected !== true });
      await loadWizard(record.pilotSelected === true ? "Record excluded from the pilot." : "Record restored to the pilot.");
    } catch (error) { setStatus(error.message, "danger"); }
  });
  byId("wizard-standalone-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-media-id]");
    if (!button) return;
    const index = state.records.findIndex((record) => record.id === button.dataset.mediaId);
    if (index >= 0) state.currentIndex = index;
    goToStep(3, "wizard-record-title");
  });
  byId("wizard-preview-rights").addEventListener("click", () => previewBulk("rights", byId("wizard-bulk-rights").value, "wizard-rights-preview", { includeAudio: byId("wizard-include-audio-rights").checked }));
  byId("wizard-apply-rights").addEventListener("click", () => applyBulk("rights", byId("wizard-bulk-rights").value, { includeAudio: byId("wizard-include-audio-rights").checked }));
  byId("wizard-preview-safety").addEventListener("click", () => previewBulk("safety", byId("wizard-bulk-safety").value, "wizard-safety-preview"));
  byId("wizard-apply-safety").addEventListener("click", () => applyBulk("safety", byId("wizard-bulk-safety").value));
  byId("wizard-preview-scripture").addEventListener("click", () => previewBulk("scripture_suggestions", null, "wizard-status"));
  byId("wizard-apply-scripture").addEventListener("click", () => applyBulk("scripture_suggestions", null));
  for (const id of ["wizard-fix-next", "wizard-final-fix", "wizard-go-blocker"]) byId(id).addEventListener("click", resolveNextBlocker);
  byId("wizard-fix-technical").addEventListener("click", async () => {
    await loadWizard("Canonical technical state re-read from disk. No owner decision was changed.");
    const count = orderedBlockers().filter((blocker) => blocker.codexCanFixTechnically).length;
    setStatus(count ? `${count} technical blocker(s) still require a technical repair.` : "No technical blockers remain. Owner decisions were not changed.", count ? "warning" : "");
  });
  byId("wizard-rerun-validation").addEventListener("click", () => loadWizard("Canonical pilot validation re-run from persisted state."));
  byId("wizard-blockers").addEventListener("click", (event) => {
    const button = event.target.closest("[data-blocker-id]");
    if (button) openBlocker(orderedBlockers().find((blocker) => blocker.blockerId === button.dataset.blockerId));
  });
  byId("wizard-final-summary").addEventListener("click", (event) => {
    const panel = byId("wizard-summary");
    panel.hidden = !panel.hidden;
    event.currentTarget.setAttribute("aria-expanded", String(!panel.hidden));
  });
  byId("wizard-apply-reconfirmation").addEventListener("click", async () => {
    try {
      await postJson("/__qa/teoyubeworld/assisted-pilot/reconfirmation", { declarations: {
        watchedAndReviewed: byId("wizard-reconfirm-watched").checked, rights: byId("wizard-rights-declaration").checked,
        scriptureAndSequence: byId("wizard-scripture-declaration").checked, safety: byId("wizard-safety-declaration").checked
      } });
      await loadWizard("Owner reconfirmation applied to eligible records. The canonical gate was re-run.");
    } catch (error) { setStatus(error.message, "danger"); }
  });
  byId("wizard-approval-control").addEventListener("click", async (event) => {
    const button = event.target.closest("#approve-pilot-definition");
    if (!button) return;
    button.disabled = true;
    try {
      await postJson("/__qa/teoyubeworld/owner-approval", { ownerConfirmation: true });
      await loadWizard("Checksum-bound pilot definition approved. No derivative or publication authorization was created.");
    } catch (error) {
      byId("wizard-approval-control").replaceChildren();
      setStatus(`Approval rejected safely: ${error.message}`, "danger");
      await loadWizard("Approval remains unavailable because canonical validation is blocked.");
    }
  });

  function sequenceStep(offset) {
    if (!state.segmentIds.length) return setStatus("Choose sequence segments first.", "warning");
    state.playingSequenceIndex = Math.max(0, Math.min(state.segmentIds.length - 1, state.playingSequenceIndex + offset));
    const mediaId = state.segmentIds[state.playingSequenceIndex];
    const player = byId("wizard-sequence-player");
    stopPlayers(player);
    player.src = `/__qa/teoyubeworld/media/${mediaId}?qa=1`;
    player.load();
    setStatus(`Sequence segment ${state.playingSequenceIndex + 1} of ${state.segmentIds.length}: ${displayTitle(state.records.find((item) => item.id === mediaId) || { id: mediaId })}`);
  }
  byId("wizard-previous-segment").addEventListener("click", () => sequenceStep(-1));
  byId("wizard-next-segment").addEventListener("click", () => sequenceStep(1));
  byId("wizard-play-all").addEventListener("click", () => {
    if (!state.segmentIds.length) return setStatus("Choose sequence segments first.", "warning");
    state.playingSequenceIndex = -1;
    const player = byId("wizard-sequence-player");
    player.muted = true;
    const playNext = () => {
      state.playingSequenceIndex += 1;
      if (state.playingSequenceIndex >= state.segmentIds.length) {
        player.removeEventListener("ended", playNext);
        return setStatus("Sequence preview complete.");
      }
      player.src = `/__qa/teoyubeworld/media/${state.segmentIds[state.playingSequenceIndex]}?qa=1`;
      player.load();
      player.play().catch(() => setStatus("Playback requires a direct browser interaction.", "warning"));
    };
    player.addEventListener("ended", playNext);
    playNext();
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopPlayers(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") stopPlayers(); });

  const sequencePlayer = document.createElement("video");
  sequencePlayer.id = "wizard-sequence-player";
  sequencePlayer.controls = true;
  sequencePlayer.preload = "metadata";
  sequencePlayer.playsInline = true;
  sequencePlayer.setAttribute("aria-label", "Current owner sequence segment");
  byId("wizard-sequence-sheet").insertAdjacentElement("afterend", sequencePlayer);

  goToStep(1);
  loadWizard().catch((error) => setStatus(error.message, "danger"));
})();
