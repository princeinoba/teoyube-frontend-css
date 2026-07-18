(() => {
  "use strict";

  const params = new URLSearchParams(location.search);
  if (params.get("mode") !== "runtime-acceptance") return;
  const loopback = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
  const qa = params.get("qa") === "1";
  const workspace = document.getElementById("workspace");
  const state = { payload: null, loading: false, lastError: "" };
  const surfaceLabels = {
    today: "Today", canon: "Canon", search: "TeoyubeSearch", table: "Promise Table", calling: "Calling Compass",
    book: "Book", lexicon: "Lexicon", testimony: "Testimony", guide: "Teo Guide", graph: "Graph Explorer", media: "TeoyubeWorld Library"
  };

  function element(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function metric(label, value) {
    const item = element("div", "metric");
    item.append(element("strong", "", String(value)), element("span", "", label));
    return item;
  }

  function pass(value) {
    const badge = element("span", `runtime-status ${value ? "passed" : "failed"}`, value ? "Pass" : "Needs attention");
    return badge;
  }

  function createWorkspace() {
    [...workspace.children].forEach((child) => { child.hidden = true; });
    const root = element("section", "runtime-acceptance-workspace");
    root.id = "runtime-acceptance-workspace";
    root.dataset.ready = "false";
    const header = element("header", "runtime-acceptance-header");
    const copy = element("div");
    copy.append(element("p", "eyebrow", "Phase 11.6C.3 | Owner-only runtime QA"), element("h2", "", "Published Pilot Runtime Acceptance"), element("p", "", "Review the published pilot inside the actual Teoyube surfaces. This gate creates no media and cannot change publication membership."));
    const actions = element("div", "button-row");
    const run = element("button", "primary", "Run Runtime Acceptance QA");
    run.type = "button";
    run.id = "run-runtime-acceptance-qa";
    run.addEventListener("click", load);
    const app = element("a", "", "Open Teoyube app");
    app.href = "index.html?qa=1#today";
    actions.append(run, app);
    header.append(copy, actions);
    const status = element("p", "notice", "Loading checksum-bound runtime acceptance evidence.");
    status.id = "runtime-acceptance-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const summary = element("div", "dashboard");
    summary.id = "runtime-acceptance-summary";
    const blockers = element("section", "runtime-blockers");
    blockers.id = "runtime-acceptance-blockers";
    const matrix = element("section", "runtime-matrix-section");
    matrix.append(element("h3", "", "Surface integration matrix"));
    const tableWrap = element("div", "runtime-table-wrap");
    const table = element("table", "runtime-matrix");
    table.id = "runtime-acceptance-matrix";
    tableWrap.append(table);
    matrix.append(tableWrap);
    const evidence = element("div", "runtime-evidence-grid");
    const health = element("section", "form-panel");
    health.id = "runtime-health-panel";
    health.append(element("h3", "", "Runtime health"));
    const healthContent = element("div", "compact-list");
    healthContent.id = "runtime-health-content";
    health.append(healthContent);
    const integrity = element("section", "form-panel");
    integrity.id = "runtime-integrity-panel";
    integrity.append(element("h3", "", "Published asset integrity"));
    const integrityContent = element("div", "compact-list");
    integrityContent.id = "runtime-integrity-content";
    integrity.append(integrityContent);
    evidence.append(health, integrity);
    const gate = element("section", "runtime-owner-gate");
    gate.id = "runtime-owner-gate";
    root.append(header, status, summary, blockers, matrix, evidence, gate);
    workspace.append(root);
    document.querySelector(".topbar .eyebrow").textContent = "Phase 11.6C.3 | Runtime acceptance";
    document.querySelector(".topbar h1").textContent = "Published Pilot Runtime Acceptance";
    document.querySelector(".topbar p:not(.eyebrow)").textContent = "Owner-only verification of accessible, contextual Scripture media across the real static app.";
    document.getElementById("load-draft").hidden = true;
    document.getElementById("save-owner-patch").hidden = true;
    return root;
  }

  function row(label, value) {
    const item = element("p");
    item.append(element("strong", "", `${label}: `), document.createTextNode(String(value)));
    return item;
  }

  function renderMatrix(payload) {
    const table = document.getElementById("runtime-acceptance-matrix");
    const head = element("thead");
    head.innerHTML = "<tr><th>Surface</th><th>Integrated</th><th>Context</th><th>Playback</th><th>Save</th><th>Why</th><th>Mobile</th><th>Access</th><th>Action</th></tr>";
    const body = element("tbody");
    Object.entries(payload.surfaceMatrix || {}).forEach(([surface, result]) => {
      const tr = element("tr");
      const name = element("td", "", surfaceLabels[surface] || surface);
      tr.append(name);
      ["integrated", "contextualMatching", "playback", "saveAction", "whyThisMedia", "mobile", "accessibility"].forEach((key) => {
        const td = element("td");
        td.append(pass(result[key]));
        tr.append(td);
      });
      const actionCell = element("td");
      const open = element("button", "", "Open Surface");
      open.type = "button";
      open.addEventListener("click", () => window.open(`index.html?qa=1#${surface === "graph" ? "today" : surface}`, "_blank", "noopener"));
      actionCell.append(open);
      tr.append(actionCell);
      body.append(tr);
    });
    table.replaceChildren(head, body);
  }

  function renderBlockers(payload) {
    const root = document.getElementById("runtime-acceptance-blockers");
    if (!payload.blockerCount) {
      root.replaceChildren(element("p", "notice success", "Zero runtime blockers. The checksum-bound owner acceptance control is available after final review."));
      return;
    }
    const title = element("h3", "", `${payload.blockerCount} runtime blocker${payload.blockerCount === 1 ? "" : "s"}`);
    const list = element("ul", "compact-list");
    payload.blockers.forEach((blocker) => {
      const item = element("li");
      item.append(element("strong", "", blocker.code.replaceAll("_", " ")), document.createTextNode(`: ${blocker.message}`));
      list.append(item);
    });
    const fix = element("button", "primary", "Fix Next Runtime Blocker");
    fix.type = "button";
    fix.id = "fix-next-runtime-blocker";
    fix.addEventListener("click", () => {
      const failed = Object.entries(payload.surfaceMatrix || {}).find(([, result]) => Object.values(result).includes(false));
      window.open(`index.html?qa=1#${failed?.[0] || "media"}`, "_blank", "noopener");
    });
    root.replaceChildren(title, list, fix);
  }

  function renderOwnerGate(payload) {
    const root = document.getElementById("runtime-owner-gate");
    root.replaceChildren();
    if (payload.accepted) {
      root.append(element("p", "notice success", `Runtime owner accepted at ${payload.acceptedAt}. Acceptance checksum: ${payload.acceptanceArtifactChecksumSha256}.`));
      return;
    }
    if (!payload.acceptanceControlVisible || payload.blockerCount) {
      root.append(element("p", "notice", "Owner acceptance is absent while runtime blockers remain. Re-run QA after resolving the first blocker."));
      return;
    }
    const copy = element("div");
    copy.append(element("h3", "", "Owner runtime acceptance"), element("p", "", "Acceptance records the reviewed runtime behavior only. It creates no media, modifies no published derivative, and adds no record."));
    const accept = element("button", "primary", "Accept Published Pilot Runtime");
    accept.type = "button";
    accept.id = "accept-published-pilot-runtime";
    accept.addEventListener("click", acceptRuntime);
    root.append(copy, accept);
  }

  function render(payload) {
    state.payload = payload;
    const root = document.getElementById("runtime-acceptance-workspace");
    root.dataset.ready = "true";
    document.getElementById("runtime-acceptance-status").className = `notice ${payload.blockerCount ? "danger" : "success"}`;
    document.getElementById("runtime-acceptance-status").textContent = payload.accepted
      ? "Published runtime is owner accepted and checksum-bound."
      : payload.blockerCount
        ? `Published runtime remains blocked by ${payload.blockerCount} acceptance check(s).`
        : "Published runtime integration is ready for owner acceptance.";
    document.getElementById("runtime-acceptance-summary").replaceChildren(
      metric("Lifecycle", payload.lifecycle),
      metric("Runtime acceptance", payload.runtimeAcceptance),
      metric("Published revision", payload.canonicalRevision),
      metric("Runtime records", payload.runtimeManifest.recordCount),
      metric("Sequences", payload.runtimeManifest.sequenceCount),
      metric("Segments", payload.runtimeManifest.sequenceSegmentCount),
      metric("Published files", payload.publishedAssets.fileCount),
      metric("Published bytes", payload.publishedAssets.byteSize)
    );
    renderBlockers(payload);
    renderMatrix(payload);
    document.getElementById("runtime-health-content").replaceChildren(
      row("Manifest status", payload.runtimeManifest.valid ? "Valid" : "Blocked"),
      row("Accessibility", payload.accessibility.valid ? "Passed" : "Blocked"),
      row("Playback", payload.playback.valid ? "Passed" : "Blocked"),
      row("Browser QA", payload.browserQa.valid ? "Passed" : "Pending"),
      row("Viewports", payload.browserQa.viewportCount),
      row("Console errors", payload.browserQa.consoleErrorCount),
      row("External requests", payload.browserQa.externalRequestCount)
    );
    document.getElementById("runtime-integrity-content").replaceChildren(
      row("Public tree", payload.publishedAssets.valid ? "Checksum-valid" : "Blocked"),
      row("Fingerprint", payload.publishedAssets.fingerprint),
      row("Manifest checksum", payload.runtimeManifest.checksumSha256),
      row("Protected source exposure", "0"),
      row("Additional media published", "0")
    );
    renderOwnerGate(payload);
  }

  async function load() {
    if (state.loading) return;
    state.loading = true;
    document.getElementById("runtime-acceptance-status").textContent = "Re-running complete runtime acceptance validation.";
    try {
      const response = await fetch("/__qa/teoyubeworld/runtime-acceptance?qa=1", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `Runtime acceptance endpoint returned ${response.status}.`);
      if (/[A-Za-z]:[\\/]|media-source|generated\/teoyubeworld-media/i.test(JSON.stringify(payload))) throw new Error("Runtime acceptance response exposed a protected path.");
      render(payload);
    } catch (error) {
      state.lastError = error?.message || "Runtime acceptance QA failed.";
      document.getElementById("runtime-acceptance-status").className = "notice danger";
      document.getElementById("runtime-acceptance-status").textContent = state.lastError;
    } finally {
      state.loading = false;
    }
  }

  async function acceptRuntime() {
    const control = document.getElementById("accept-published-pilot-runtime");
    if (!control || state.payload?.blockerCount) return;
    control.disabled = true;
    try {
      const response = await fetch("/__qa/teoyubeworld/runtime-acceptance?qa=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerConfirmation: "ACCEPT PUBLISHED PILOT RUNTIME" })
      });
      const payload = await response.json();
      if (!response.ok || !payload.accepted) throw new Error(payload.blockers?.[0]?.message || "Runtime acceptance was rejected.");
      await load();
    } catch (error) {
      control.disabled = false;
      document.getElementById("runtime-acceptance-status").className = "notice danger";
      document.getElementById("runtime-acceptance-status").textContent = error?.message || "Runtime acceptance failed.";
    }
  }

  createWorkspace();
  if (!loopback || !qa) {
    document.getElementById("runtime-acceptance-status").className = "notice danger";
    document.getElementById("runtime-acceptance-status").textContent = "Runtime acceptance requires loopback access and ?qa=1.";
  } else {
    load();
  }
})();
