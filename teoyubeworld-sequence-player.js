(() => {
  "use strict";

  const PLAYER_STATES = new Set(["idle", "loading", "ready", "playing_segment", "playing_sequence", "paused", "ended", "error"]);
  const playerId = "teoyubeworld-sequence-player";
  const state = {
    status: "idle",
    sequence: null,
    activeIndex: 0,
    playEntire: false,
    returnFocus: null,
    lastError: ""
  };
  let dialog;
  let video;
  let elements = {};

  function setStatus(next, message = "") {
    if (!PLAYER_STATES.has(next)) return;
    state.status = next;
    if (elements.status) elements.status.textContent = message || next.replaceAll("_", " ");
    if (dialog) dialog.dataset.playerState = next;
    document.dispatchEvent(new CustomEvent("teoyube:sequence-state", {
      detail: {
        status: next,
        sequenceId: state.sequence?.id || null,
        mediaId: currentRecord()?.id || null,
        activeSegment: state.activeIndex + 1,
        playEntire: state.playEntire,
        lastError: state.lastError
      }
    }));
  }

  function currentRecord() {
    return state.sequence?.segments?.[state.activeIndex] || null;
  }

  function dispatch(action, extra = {}) {
    const record = currentRecord();
    document.dispatchEvent(new CustomEvent("teoyube:media-action", {
      detail: { action, mediaId: record?.id || null, sequenceId: state.sequence?.id || null, ...extra }
    }));
  }

  function button(label, id, className = "secondary") {
    const control = document.createElement("button");
    control.type = "button";
    control.id = id;
    control.className = className;
    control.textContent = label;
    return control;
  }

  function createDialog() {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.id = "teoyubeworldSequenceDialog";
    dialog.className = "ty-sequence-dialog";
    dialog.setAttribute("aria-labelledby", "tySequenceTitle");

    const shell = document.createElement("div");
    shell.className = "ty-sequence-shell";
    const header = document.createElement("header");
    header.className = "ty-sequence-header";
    const heading = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Published Scripture Sequence";
    const title = document.createElement("h2");
    title.id = "tySequenceTitle";
    const breadcrumb = document.createElement("p");
    breadcrumb.id = "tySequenceBreadcrumb";
    breadcrumb.className = "ty-media-scripture";
    heading.append(eyebrow, title, breadcrumb);
    const close = button("Close", "tySequenceClose");
    header.append(heading, close);

    const layout = document.createElement("div");
    layout.className = "ty-sequence-layout";
    const main = document.createElement("section");
    main.className = "ty-sequence-main";
    video = document.createElement("video");
    video.id = "tySequenceVideo";
    video.preload = "metadata";
    video.playsInline = true;
    video.controls = true;
    video.muted = true;
    video.setAttribute("aria-describedby", "tySequenceScripture tySequenceStatus");
    video.setAttribute("disablepictureinpicture", "");

    const scripture = document.createElement("p");
    scripture.id = "tySequenceScripture";
    scripture.className = "ty-sequence-scripture-context";
    const currentTitle = document.createElement("h3");
    currentTitle.id = "tySequenceCurrentTitle";
    const progressCopy = document.createElement("p");
    progressCopy.id = "tySequenceProgressCopy";
    const progress = document.createElement("progress");
    progress.id = "tySequenceProgress";
    progress.max = 12;
    progress.value = 1;
    progress.setAttribute("aria-label", "Sequence progress");

    const primaryControls = document.createElement("div");
    primaryControls.className = "ty-sequence-controls primary-controls";
    primaryControls.append(
      button("Play selected segment", "tyPlaySelected", "primary"),
      button("Play entire sequence", "tyPlaySequence", "primary"),
      button("Pause", "tyPause"),
      button("Previous", "tyPrevious"),
      button("Next", "tyNext")
    );
    const secondaryControls = document.createElement("div");
    secondaryControls.className = "ty-sequence-controls";
    secondaryControls.append(
      button("Restart segment", "tyRestartSegment"),
      button("Restart sequence", "tyRestartSequence"),
      button("Mute", "tyMute"),
      button("Full screen", "tyFullscreen"),
      button("Open Scripture", "tyOpenScripture")
    );
    const studyActions = document.createElement("div");
    studyActions.className = "ty-sequence-controls study-actions";
    [
      ["Reflect on this scene", "tyReflect", "reflect-on-media"],
      ["Pray this Scripture", "tyPray", "pray-media-scripture"],
      ["Save scene to Book", "tySave", "save-media-to-book"],
      ["Add related promise", "tyPromise", "add-media-promise-to-table"],
      ["Open related word", "tyWord", "open-related-media-word"],
      ["Open graph", "tyGraph", "open-media-graph"],
      ["Why this media?", "tyWhy", "explain-media-recommendation"]
    ].forEach(([label, id, action]) => {
      const control = button(label, id);
      control.dataset.mediaAction = action;
      studyActions.append(control);
    });
    const status = document.createElement("p");
    status.id = "tySequenceStatus";
    status.className = "ty-sequence-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    main.append(video, scripture, currentTitle, progressCopy, progress, primaryControls, secondaryControls, studyActions, status);

    const rail = document.createElement("aside");
    rail.className = "ty-sequence-rail";
    const railTitle = document.createElement("h3");
    railTitle.textContent = "Sequence timeline";
    const list = document.createElement("div");
    list.id = "tySequenceSegments";
    list.className = "ty-sequence-segments";
    list.setAttribute("role", "list");
    rail.append(railTitle, list);

    const study = document.createElement("section");
    study.id = "tyScriptureStudyMode";
    study.className = "ty-scripture-study";
    study.setAttribute("aria-labelledby", "tyStudyTitle");
    const studyTitle = document.createElement("h3");
    studyTitle.id = "tyStudyTitle";
    studyTitle.textContent = "Scripture Study Mode";
    const studyContent = document.createElement("div");
    studyContent.id = "tyStudyContent";
    study.append(studyTitle, studyContent);

    layout.append(main, rail);
    shell.append(header, layout, study);
    dialog.append(shell);
    document.body.append(dialog);
    elements = {
      title,
      breadcrumb,
      scripture,
      currentTitle,
      progressCopy,
      progress,
      status,
      list,
      studyContent,
      close,
      playSelected: dialog.querySelector("#tyPlaySelected"),
      playSequence: dialog.querySelector("#tyPlaySequence"),
      pause: dialog.querySelector("#tyPause"),
      previous: dialog.querySelector("#tyPrevious"),
      next: dialog.querySelector("#tyNext"),
      restartSegment: dialog.querySelector("#tyRestartSegment"),
      restartSequence: dialog.querySelector("#tyRestartSequence"),
      mute: dialog.querySelector("#tyMute"),
      fullscreen: dialog.querySelector("#tyFullscreen"),
      openScripture: dialog.querySelector("#tyOpenScripture")
    };
    bindEvents();
    return dialog;
  }

  function selectSegment(index, options = {}) {
    if (!state.sequence?.segments?.length) return;
    video.pause();
    state.activeIndex = Math.max(0, Math.min(state.sequence.segments.length - 1, Number(index) || 0));
    const record = currentRecord();
    const runtime = window.TeoyubeWorldMedia;
    const mobile = window.matchMedia("(max-width: 560px)").matches;
    video.poster = runtime.getMediaPosterUrl(record);
    video.src = runtime.getMediaPlaybackUrl(record, mobile ? "mobile" : "card");
    video.muted = !record.hasAudio || Boolean(window.TeoyubeRuntimeBridge?.getMediaState?.().mutedMediaPreference ?? true);
    video.load();
    elements.currentTitle.textContent = record.title;
    elements.scripture.textContent = `Confirmed Scripture context: ${record.ScriptureReference}. Media supports reflection and does not replace the passage.`;
    elements.progressCopy.textContent = `Segment ${record.sequenceOrder} of ${state.sequence.segmentCount}`;
    elements.progress.value = record.sequenceOrder;
    elements.previous.disabled = state.activeIndex === 0;
    elements.next.disabled = state.activeIndex === state.sequence.segments.length - 1;
    elements.mute.hidden = !record.hasAudio;
    elements.mute.textContent = video.muted ? "Unmute" : "Mute";
    renderSegmentList();
    renderStudyMode(record);
    setStatus("loading", `Loading segment ${record.sequenceOrder}.`);
    if (options.play) playCurrent(Boolean(options.sequence));
  }

  function renderSegmentList() {
    elements.list.replaceChildren(...state.sequence.segments.map((record, index) => {
      const control = document.createElement("button");
      control.type = "button";
      control.className = index === state.activeIndex ? "active" : "";
      control.setAttribute("role", "listitem");
      control.setAttribute("aria-current", index === state.activeIndex ? "true" : "false");
      const order = document.createElement("span");
      order.textContent = String(record.sequenceOrder).padStart(2, "0");
      const copy = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = record.title.replace(/^No Other Gospel - Segment \d+ - /, "");
      const reference = document.createElement("small");
      reference.textContent = record.ScriptureReference;
      copy.append(title, reference);
      control.append(order, copy);
      control.addEventListener("click", () => {
        state.playEntire = false;
        selectSegment(index);
      });
      return control;
    }));
  }

  function studyRow(label, value) {
    const row = document.createElement("div");
    const term = document.createElement("strong");
    const detail = document.createElement("span");
    term.textContent = label;
    detail.textContent = value;
    row.append(term, detail);
    return row;
  }

  function renderStudyMode(record) {
    const explanation = window.TeoyubeWorldMedia.explainTeoyubeWorldMediaMatch(record, {
      ...(window.TeoyubeRuntimeBridge?.getContext?.() || {}),
      scriptureReference: record.ScriptureReference,
      BibleBook: record.BibleBook,
      chapter: record.chapter,
      verseStart: record.verseStart,
      verseEnd: record.verseEnd
    });
    elements.studyContent.replaceChildren(
      studyRow("Approved Scripture", record.ScriptureReference),
      studyRow("Bible location", `${record.BibleBook} ${record.chapter}:${record.verseStart}-${record.verseEnd}`),
      studyRow("Scripture text", "Use your preferred Bible translation to read the confirmed passage. No unapproved verse text is generated here."),
      studyRow("Teoyube word", record.TeoyubeWordIds[0] || "No owner-approved word relationship for this pilot segment."),
      studyRow("Promise cluster", record.promiseClusterIds[0] || "No owner-approved promise relationship for this pilot segment."),
      studyRow("Journey", record.journeyIds[0] || "No owner-approved journey relationship for this pilot segment."),
      studyRow("Prayer", `Father, help me receive ${record.ScriptureReference} with humility, discernment, and obedience.`),
      studyRow("Reflection", `What does ${record.ScriptureReference} reveal in its own context, and what faithful response is appropriate?`),
      studyRow("Action step", "Read the surrounding passage, note one observation, pray, and discuss major decisions with wise counsel."),
      studyRow("Graph relationship", `This scene illustrates and accompanies ${record.ScriptureReference}; it does not prove a theological claim.`),
      studyRow("Recommendation quality", `${explanation.matchType.replaceAll("_", " ")} | ${explanation.score}/100`)
    );
  }

  function playCurrent(asSequence = false) {
    const record = currentRecord();
    if (!record) return;
    state.playEntire = asSequence;
    window.TeoyubeWorldPlayback.requestMediaPlayback(playerId);
    const restored = window.TeoyubeWorldPlayback.restoreMediaPlaybackPosition(record.id);
    if (!asSequence && restored > 0 && restored < Number(video.duration || Infinity)) video.currentTime = restored;
    video.play().then(() => {
      setStatus(asSequence ? "playing_sequence" : "playing_segment", asSequence ? `Playing the approved sequence from segment ${record.sequenceOrder}.` : `Playing segment ${record.sequenceOrder}.`);
    }).catch((error) => {
      state.playEntire = false;
      state.lastError = error?.message || "Playback requires another user action.";
      setStatus("error", "Playback could not start. The Scripture context and poster remain available; try Play again.");
    });
  }

  function pause() {
    state.playEntire = false;
    video.pause();
    setStatus("paused", `Paused at segment ${currentRecord()?.sequenceOrder || 1}.`);
  }

  function restartSegment() {
    state.playEntire = false;
    video.currentTime = 0;
    playCurrent(false);
  }

  function restartSequence() {
    state.playEntire = true;
    selectSegment(0, { play: true, sequence: true });
  }

  function open(sequenceId, mediaId = null, options = {}) {
    createDialog();
    const sequence = window.TeoyubeWorldMedia.getTeoyubeWorldSequenceById(sequenceId) || window.TeoyubeWorldMedia.getTeoyubeWorldSequences()[0];
    if (!sequence) {
      state.lastError = "The approved Scripture sequence is unavailable.";
      setStatus("error", state.lastError);
      return false;
    }
    state.sequence = sequence;
    state.returnFocus = options.returnFocus || document.activeElement;
    const index = mediaId ? sequence.segments.findIndex((record) => record.id === mediaId) : 0;
    elements.title.textContent = sequence.title;
    elements.breadcrumb.textContent = `${sequence.BibleBook} / Chapter ${sequence.chapter} / ${sequence.ScriptureReference}`;
    selectSegment(index >= 0 ? index : 0);
    if (!dialog.open) dialog.showModal();
    elements.playSelected.focus();
    return true;
  }

  function close() {
    if (!dialog?.open) return;
    window.TeoyubeWorldPlayback.pauseAllMedia();
    state.playEntire = false;
    dialog.close();
    state.returnFocus?.focus?.();
    setStatus("idle", "Sequence player closed.");
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || !dialog?.open) return;
    const focusable = [...dialog.querySelectorAll("button:not([disabled]):not([hidden]), video, [tabindex]:not([tabindex='-1'])")];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  function bindEvents() {
    elements.close.addEventListener("click", close);
    elements.playSelected.addEventListener("click", () => playCurrent(false));
    elements.playSequence.addEventListener("click", () => playCurrent(true));
    elements.pause.addEventListener("click", pause);
    elements.previous.addEventListener("click", () => { state.playEntire = false; selectSegment(state.activeIndex - 1); });
    elements.next.addEventListener("click", () => { state.playEntire = false; selectSegment(state.activeIndex + 1); });
    elements.restartSegment.addEventListener("click", restartSegment);
    elements.restartSequence.addEventListener("click", restartSequence);
    elements.mute.addEventListener("click", () => {
      video.muted = !video.muted;
      elements.mute.textContent = video.muted ? "Unmute" : "Mute";
      window.TeoyubeRuntimeBridge?.setMediaState?.({ mutedMediaPreference: video.muted });
    });
    elements.fullscreen.addEventListener("click", () => video.requestFullscreen?.());
    elements.openScripture.addEventListener("click", () => dispatch("open-media-scripture"));
    dialog.querySelectorAll("[data-media-action]").forEach((control) => control.addEventListener("click", () => dispatch(control.dataset.mediaAction)));
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
    dialog.addEventListener("close", () => window.TeoyubeWorldPlayback.pauseAllMedia());
    dialog.addEventListener("keydown", trapFocus);
    video.addEventListener("loadedmetadata", () => setStatus("ready", `Segment ${currentRecord()?.sequenceOrder || 1} is ready.`));
    video.addEventListener("pause", () => {
      if (!["idle", "loading", "ended", "error"].includes(state.status) && video.currentTime > 0 && !video.ended) setStatus("paused", `Paused at segment ${currentRecord()?.sequenceOrder || 1}.`);
    });
    video.addEventListener("ended", () => {
      const record = currentRecord();
      document.dispatchEvent(new CustomEvent("teoyube:media-completed", { detail: { mediaId: record?.id, sequenceId: state.sequence?.id } }));
      if (state.playEntire && state.activeIndex < state.sequence.segments.length - 1) {
        selectSegment(state.activeIndex + 1, { play: true, sequence: true });
      } else {
        state.playEntire = false;
        setStatus("ended", state.activeIndex === state.sequence.segments.length - 1 ? "The complete sequence finished without looping." : "The selected segment finished.");
      }
    });
    video.addEventListener("error", () => {
      state.playEntire = false;
      state.lastError = "The published derivative could not play.";
      setStatus("error", "This segment could not play. Retry the segment or continue with the text-based Scripture context.");
    });
  }

  function getState() {
    return {
      status: state.status,
      sequenceId: state.sequence?.id || null,
      activeMediaId: currentRecord()?.id || null,
      activeSegment: state.activeIndex + 1,
      playEntire: state.playEntire,
      lastError: state.lastError,
      open: Boolean(dialog?.open)
    };
  }

  window.TeoyubeWorldSequencePlayer = Object.freeze({
    states: [...PLAYER_STATES],
    create: createDialog,
    open,
    close,
    playSelectedSegment: () => playCurrent(false),
    playEntireSequence: () => playCurrent(true),
    previousSegment: () => selectSegment(state.activeIndex - 1),
    nextSegment: () => selectSegment(state.activeIndex + 1),
    pause,
    restartSegment,
    restartSequence,
    getState
  });

  createDialog();
  window.TeoyubeWorldPlayback.registerMediaPlayer({
    id: playerId,
    element: video,
    getMediaId: () => currentRecord()?.id || null
  });
})();
