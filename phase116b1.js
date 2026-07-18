(function initializePhase116b1Runtime() {
  "use strict";

  if (window.__teoyubePhase116b1Initialized) return;
  window.__teoyubePhase116b1Initialized = true;
  document.body.dataset.embedded = new URLSearchParams(window.location.search).get("embedded") === "1" ? "true" : "false";

  const PHASE116B1_VERSION = "11.6B.1";
  const PHASE116B1_MEDIA_SAMPLE_COUNT = 2;
  const PHASE116B1_HISTORY_LIMIT = 40;
  const PHASE116B1_UNDO_LIMIT = 30;
  const actionRegistry = new Map();
  const undoStack = [];
  let universalIndex = [];
  let universalIndexDirty = true;
  let universalSearchTimer = null;
  let promiseDialogReturnFocus = null;
  let responsiveLabReturnFocus = null;

  const DEFAULT_COLLECTIONS = [
    ["saved-for-prayer", "Saved for Prayer", "prayer"],
    ["scripture-study", "Scripture Study", "scripture"],
    ["calling-and-purpose", "Calling and Purpose", "calling"],
    ["active-journey", "Active Journey", "journey"],
    ["actions-to-complete", "Actions to Complete", "action"],
    ["testimony-references", "Testimony References", "testimony"],
    ["teoyubeworld-media", "TeoyubeWorld Media", "media"]
  ];

  function phase116b1SafeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function phase116b1Normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function phase116b1Hash(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function phase116b1Clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function phase116b1Now() {
    return new Date().toISOString();
  }

  function phase116b1Escape(value) {
    return typeof escapeHtml === "function"
      ? escapeHtml(String(value == null ? "" : value))
      : String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        })[character]);
  }

  function phase116b1CurrentPage() {
    return typeof getCurrentViewId === "function" ? getCurrentViewId() : state.activePage || "today";
  }

  function phase116b1SaveAndRender() {
    if (typeof saveState === "function") saveState();
    if (typeof render === "function") render();
  }

  function phase116b1ActualMediaRecords() {
    return phase116b1SafeArray(state.phase116b1MediaRecords).filter(
      (record) => record && record.imported === true && record.sampleOnly !== true
    );
  }

  function phase116b1ActionContext(extra = {}) {
    return {
      page: phase116b1CurrentPage(),
      state,
      hasScripture: Boolean(state.activeScripture?.reference || state.selectedScripture),
      hasWord: Boolean(state.activeWord?.word || state.selectedWord),
      hasPromise: Boolean(state.activePromiseCluster || state.selectedPromiseResult),
      hasJourney: Boolean(state.activeJourney || state.activeDailyJourney || state.selectedJourney),
      actualMediaCount: phase116b1ActualMediaRecords().length,
      ...extra
    };
  }

  function registerTeoyubeAction(actionDefinition) {
    if (!actionDefinition || !actionDefinition.id || typeof actionDefinition.handler !== "function") {
      throw new Error("Teoyube actions require an id and handler.");
    }
    const definition = {
      label: actionDefinition.id,
      description: "Local Teoyube action.",
      category: "general",
      keyboardShortcut: "",
      allowedPages: ["*"],
      requiredState: [],
      disabledReason: "",
      successMessage: "Action complete",
      errorMessage: "Action could not be completed",
      reversible: false,
      safetyNote: "Session-only local action.",
      ...actionDefinition
    };
    actionRegistry.set(definition.id, definition);
    return definition;
  }

  function unregisterTeoyubeAction(actionId) {
    return actionRegistry.delete(actionId);
  }

  function getTeoyubeAction(actionId) {
    return actionRegistry.get(actionId) || null;
  }

  function getTeoyubeActionDisabledReason(actionId, context = phase116b1ActionContext()) {
    const action = getTeoyubeAction(actionId);
    if (!action) return "Action is not registered.";
    const allowedPages = phase116b1SafeArray(action.allowedPages);
    if (allowedPages.length && !allowedPages.includes("*") && !allowedPages.includes(context.page)) {
      return `Available on ${allowedPages.join(", ")}.`;
    }
    if (typeof action.disabledReason === "function") return action.disabledReason(context) || "";
    if (action.disabledReason) return action.disabledReason;
    const missing = phase116b1SafeArray(action.requiredState).filter((key) => !context[key]);
    return missing.length ? `Required context is missing: ${missing.join(", ")}.` : "";
  }

  function getAvailableTeoyubeActions(context = phase116b1ActionContext()) {
    return [...actionRegistry.values()].filter((action) => !getTeoyubeActionDisabledReason(action.id, context));
  }

  function recordTeoyubeActionOutcome(outcome) {
    const safeOutcome = {
      id: outcome.id || `outcome-${phase116b1Hash(`${outcome.actionId}-${phase116b1Now()}`)}`,
      actionId: outcome.actionId || "unknown",
      label: outcome.label || outcome.actionId || "Action",
      status: outcome.status || "success",
      detail: String(outcome.detail || "Local session state updated.").slice(0, 180),
      reversible: Boolean(outcome.reversible),
      createdAt: outcome.createdAt || phase116b1Now()
    };
    state.phase116b1ActionHistory = [safeOutcome, ...phase116b1SafeArray(state.phase116b1ActionHistory)].slice(
      0,
      PHASE116B1_HISTORY_LIMIT
    );
    state.lastActionRun = safeOutcome.label;
    state.lastActionDetail = safeOutcome.detail;
    state.sessionActionCount = Number(state.sessionActionCount || 0) + 1;
    if (typeof saveState === "function") saveState();
    renderRecentActionHistory();
    return safeOutcome;
  }

  function renderTeoyubeActionStatus(outcome) {
    if (!outcome) return;
    const title = outcome.status === "success" ? outcome.label : `${outcome.label} needs attention`;
    if (typeof showActionToast === "function") showActionToast(title, outcome.detail);
    if (outcome.reversible && canUndoTeoyubeAction()) renderUndoToast(outcome);
  }

  function dispatchTeoyubeAction(actionId, payload = {}) {
    const action = getTeoyubeAction(actionId);
    const context = phase116b1ActionContext(payload.context || {});
    const disabledReason = getTeoyubeActionDisabledReason(actionId, context);
    if (!action || disabledReason) {
      const blocked = recordTeoyubeActionOutcome({
        actionId,
        label: action?.label || actionId,
        status: "blocked",
        detail: disabledReason || "Action is unavailable."
      });
      renderTeoyubeActionStatus(blocked);
      return blocked;
    }
    try {
      const result = action.handler(payload, context);
      if (result?.alreadyRecorded) return result;
      if (result && result.status && result.status !== "success") {
        const reported = recordTeoyubeActionOutcome({
          actionId,
          label: action.label,
          status: result.status,
          detail: result.detail || action.errorMessage,
          reversible: false
        });
        renderTeoyubeActionStatus(reported);
        return { ...reported, result };
      }
      const outcome = recordTeoyubeActionOutcome({
        actionId,
        label: action.label,
        status: "success",
        detail: result?.detail || action.successMessage,
        reversible: Boolean(action.reversible && canUndoTeoyubeAction())
      });
      universalIndexDirty = true;
      renderTeoyubeActionStatus(outcome);
      renderPhase116b1Experience();
      return { ...outcome, result };
    } catch (error) {
      const failed = recordTeoyubeActionOutcome({
        actionId,
        label: action.label,
        status: "error",
        detail: error?.message || action.errorMessage
      });
      state.lastError = failed.detail;
      renderTeoyubeActionStatus(failed);
      return failed;
    }
  }

  function pushTeoyubeUndoEntry(entry) {
    if (!entry || typeof entry.undo !== "function") return null;
    const undoEntry = {
      id: entry.id || `undo-${phase116b1Hash(`${entry.actionId}-${phase116b1Now()}`)}`,
      actionId: entry.actionId || "unknown",
      label: entry.label || "Last action",
      createdAt: phase116b1Now(),
      undo: entry.undo
    };
    undoStack.unshift(undoEntry);
    undoStack.splice(PHASE116B1_UNDO_LIMIT);
    return undoEntry;
  }

  function canUndoTeoyubeAction() {
    return undoStack.length > 0;
  }

  function undoLastTeoyubeAction() {
    const entry = undoStack.shift();
    if (!entry) {
      const detail = "There is no reversible session action to undo.";
      if (typeof showFallbackNotice === "function") showFallbackNotice(detail);
      return { status: "blocked", detail };
    }
    entry.undo();
    universalIndexDirty = true;
    if (typeof saveState === "function") saveState();
    if (typeof render === "function") render();
    const outcome = recordTeoyubeActionOutcome({
      actionId: "undo.last",
      label: "Undo Last Action",
      detail: `${entry.label} was reversed for this session.`,
      status: "success"
    });
    if (typeof showActionToast === "function") showActionToast("Action undone", outcome.detail);
    return { ...outcome, alreadyRecorded: true };
  }

  function getRecentTeoyubeActions(limit = 10) {
    return phase116b1SafeArray(state.phase116b1ActionHistory).slice(0, Math.max(0, Math.min(40, limit)));
  }

  function clearTeoyubeActionHistory() {
    state.phase116b1ActionHistory = [];
    undoStack.splice(0);
    if (typeof saveState === "function") saveState();
    renderRecentActionHistory();
  }

  function renderRecentActionHistory() {
    const target = document.querySelector("#phase116b1RecentActions");
    if (!target) return;
    const actions = getRecentTeoyubeActions(8);
    target.innerHTML = actions.length
      ? actions
          .map(
            (item) => `<li><strong>${phase116b1Escape(item.label)}</strong><span>${phase116b1Escape(item.status)}</span><small>${phase116b1Escape(item.detail)}</small></li>`
          )
          .join("")
      : "<li><span>No session actions recorded yet.</span></li>";
  }

  function renderUndoToast(outcome = {}) {
    const drawer = document.querySelector("#phase113SaveDrawer");
    if (!drawer || drawer.querySelector("[data-teoyube-action='undo.last']")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "secondary";
    button.dataset.teoyubeAction = "undo.last";
    button.textContent = `Undo ${outcome.label || "last action"}`;
    drawer.appendChild(button);
  }

  function ensurePhase116b1State() {
    if (!Array.isArray(state.phase116b1ActionHistory)) state.phase116b1ActionHistory = [];
    if (!Array.isArray(state.phase116b1SmartCollections) || !state.phase116b1SmartCollections.length) {
      state.phase116b1SmartCollections = DEFAULT_COLLECTIONS.map(([id, name, itemType]) => ({
        id,
        name,
        itemType,
        defaultCollection: true,
        items: [],
        createdAt: phase116b1Now()
      }));
    }
    if (!Array.isArray(state.phase116b1UniversalSearchResults)) state.phase116b1UniversalSearchResults = [];
    if (!Array.isArray(state.phase116b1MediaRecords)) state.phase116b1MediaRecords = [];
  }

  function phase116b1PromiseKey(title, scripture) {
    return phase116b1Normalize(`${title}|${scripture}`);
  }

  function phase116b1IsScriptureReference(value) {
    return /^(?:[1-3]\s*)?[A-Za-z][A-Za-z ]+\s+\d{1,3}(?::\d{1,3}(?:-\d{1,3})?)?$/.test(String(value || "").trim());
  }

  function getPhase116b1PromiseFormData(form) {
    const field = (name) => String(form?.elements?.namedItem(name)?.value || "").trim();
    return {
      title: field("title"),
      scripture: field("scripture"),
      word: field("word"),
      category: field("category"),
      status: field("status") || "Discovered",
      notes: field("notes"),
      saveToBook: Boolean(form?.elements?.namedItem("saveToBook")?.checked)
    };
  }

  function submitPhase116b1Promise(form) {
    const values = getPhase116b1PromiseFormData(form);
    if (values.title.length < 3) return { status: "blocked", detail: "Enter a promise title with at least three characters." };
    if (!phase116b1IsScriptureReference(values.scripture)) {
      return { status: "blocked", detail: "Enter a usable Scripture reference such as John 3:16 or Psalm 23." };
    }
    const key = phase116b1PromiseKey(values.title, values.scripture);
    const duplicate = phase116b1SafeArray(state.savedPromiseTableItems).find(
      (item) => phase116b1PromiseKey(item.title, item.scripture) === key
    );
    if (duplicate) {
      state.phase116bPromiseDetailId = duplicate.id;
      state.phase116b1LastPromiseAddResult = { status: "duplicate", id: duplicate.id, title: duplicate.title };
      if (typeof renderPhase116bPromiseWorkspace === "function") renderPhase116bPromiseWorkspace();
      return { status: "blocked", detail: "That promise and Scripture pair is already in the table." };
    }

    const promiseId = `promise-manual-${phase116b1Hash(key)}`;
    const row = addPromiseTableItem({
      id: promiseId,
      title: values.title,
      scripture: values.scripture,
      word: values.word || state.selectedWord,
      status: values.status,
      notes: values.notes,
      source: "manual-dialog"
    });
    row.category = values.category || "Calling & Purpose";
    row.updatedAt = phase116b1Now();
    state.phase116bPromiseDetailId = row.id;
    state.phase116b1LastPromiseAddResult = { status: "added", id: row.id, title: row.title };
    let bookEntryId = "";
    if (values.saveToBook) {
      const entry = saveToBook({
        title: row.title,
        content: `Promise Table item saved as ${row.status}.`,
        references: [row.scripture],
        source: "promise-table-manual"
      });
      bookEntryId = entry.id;
    }
    pushTeoyubeUndoEntry({
      actionId: "promise.add.submit",
      label: `Add ${row.title}`,
      undo: () => {
        state.savedPromiseTableItems = phase116b1SafeArray(state.savedPromiseTableItems).filter((item) => item.id !== row.id);
        state.promiseTableItems = state.savedPromiseTableItems;
        if (bookEntryId) state.book = phase116b1SafeArray(state.book).filter((item) => item.id !== bookEntryId);
        state.bookEntries = state.book;
        state.phase116bPromiseDetailId = "";
      }
    });
    if (typeof saveState === "function") saveState();
    if (typeof renderPhase114PromiseTableRows === "function") renderPhase114PromiseTableRows();
    if (typeof renderPhase116bPromiseWorkspace === "function") renderPhase116bPromiseWorkspace();
    if (typeof renderPhase114QaPanel === "function") renderPhase114QaPanel();
    closePhase116b1PromiseDialog();
    return { detail: `${row.title} was added as ${row.status}.`, row };
  }

  function openPhase116b1PromiseDialog(trigger = document.activeElement) {
    ensurePhase116b1Shell();
    promiseDialogReturnFocus = trigger;
    const dialog = document.querySelector("#phase116b1PromiseDialog");
    const form = document.querySelector("#phase116b1PromiseAddForm");
    if (!dialog || !form) return;
    form.reset();
    form.elements.scripture.value = phase116bScriptureReference(state.activeScripture || state.selectedScripture);
    form.elements.word.value = state.activeWord?.word || state.selectedWord || "TIDUILOVP";
    form.elements.category.value = "Calling & Purpose";
    form.elements.status.value = "Discovered";
    if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
    else dialog.setAttribute("open", "open");
    requestAnimationFrame(() => form.elements.title.focus());
  }

  function closePhase116b1PromiseDialog() {
    const dialog = document.querySelector("#phase116b1PromiseDialog");
    if (dialog?.open && typeof dialog.close === "function") dialog.close();
    else dialog?.removeAttribute("open");
    if (promiseDialogReturnFocus?.isConnected) promiseDialogReturnFocus.focus({ preventScroll: true });
    promiseDialogReturnFocus = null;
  }

  function getTeoyubeSmartCollections() {
    ensurePhase116b1State();
    return state.phase116b1SmartCollections;
  }

  function createTeoyubeSmartCollection(name, itemType = "mixed") {
    const safeName = String(name || "").trim().slice(0, 60);
    if (!safeName) return null;
    const id = `collection-${phase116b1Hash(`${safeName}-${phase116b1Now()}`)}`;
    const collection = { id, name: safeName, itemType, defaultCollection: false, items: [], createdAt: phase116b1Now() };
    state.phase116b1SmartCollections.push(collection);
    if (typeof saveState === "function") saveState();
    return collection;
  }

  function renameTeoyubeSmartCollection(collectionId, name) {
    const collection = getTeoyubeSmartCollections().find((item) => item.id === collectionId);
    const safeName = String(name || "").trim().slice(0, 60);
    if (!collection || !safeName) return false;
    collection.name = safeName;
    return true;
  }

  function deleteTeoyubeSmartCollection(collectionId) {
    const before = getTeoyubeSmartCollections().length;
    state.phase116b1SmartCollections = getTeoyubeSmartCollections().filter((item) => item.id !== collectionId);
    return before !== state.phase116b1SmartCollections.length;
  }

  function phase116b1CurrentCollectionReference(type) {
    if (type === "scripture") {
      const reference = phase116bScriptureReference(state.activeScripture || state.selectedScripture);
      return { id: `scripture-${phase116b1Hash(reference)}`, type, label: reference, scripture: reference };
    }
    if (type === "word") {
      const word = state.activeWord?.word || state.selectedWord;
      return { id: `word-${phase116b1Hash(word)}`, type, label: word, scripture: phase116bScriptureReference(state.selectedScripture) };
    }
    if (type === "promise") {
      const item = phase116b1SafeArray(state.savedPromiseTableItems).find((row) => row.id === state.phase116bPromiseDetailId) || state.selectedPromiseResult;
      if (!item) return null;
      return {
        id: item.id || `promise-${phase116b1Hash(item.title)}`,
        type,
        label: item.title || item.promise_category,
        scripture: phase116bScriptureReference(item.scripture || item.scripture_references)
      };
    }
    if (type === "journey") {
      const journey = state.activeJourney || state.activeDailyJourney || state.selectedJourney;
      if (!journey) return null;
      return {
        id: journey.id || `journey-${phase116b1Hash(journey.title)}`,
        type,
        label: journey.title,
        scripture: phase116bScriptureReference(journey.scripture)
      };
    }
    if (type === "media") {
      const media = phase116b1ActualMediaRecords()[0];
      return media ? { id: media.id, type, label: media.title, scripture: phase116b1SafeArray(media.scriptureReferences)[0] || "" } : null;
    }
    return null;
  }

  function addTeoyubeCollectionItem(collectionId, item) {
    const collection = getTeoyubeSmartCollections().find((entry) => entry.id === collectionId);
    if (!collection || !item?.id) return false;
    if (collection.id === "teoyubeworld-media" && item.type === "media" && !phase116b1ActualMediaRecords().length) return false;
    const existing = phase116b1SafeArray(collection.items).some((entry) => entry.id === item.id && entry.type === item.type);
    if (existing) return false;
    collection.items = [...phase116b1SafeArray(collection.items), { ...item, addedAt: phase116b1Now() }].slice(0, 100);
    pushTeoyubeUndoEntry({
      actionId: "collection.item.add",
      label: `Add ${item.label} to ${collection.name}`,
      undo: () => {
        collection.items = phase116b1SafeArray(collection.items).filter((entry) => !(entry.id === item.id && entry.type === item.type));
      }
    });
    return true;
  }

  function removeTeoyubeCollectionItem(collectionId, itemId) {
    const collection = getTeoyubeSmartCollections().find((entry) => entry.id === collectionId);
    const item = collection?.items?.find((entry) => entry.id === itemId);
    if (!collection || !item) return false;
    collection.items = collection.items.filter((entry) => entry.id !== itemId);
    pushTeoyubeUndoEntry({
      actionId: "collection.item.remove",
      label: `Remove ${item.label} from ${collection.name}`,
      undo: () => collection.items.push(item)
    });
    return true;
  }

  function moveTeoyubeCollectionItem(fromCollectionId, toCollectionId, itemId) {
    const from = getTeoyubeSmartCollections().find((entry) => entry.id === fromCollectionId);
    const to = getTeoyubeSmartCollections().find((entry) => entry.id === toCollectionId);
    const item = from?.items?.find((entry) => entry.id === itemId);
    if (!from || !to || !item || from.id === to.id) return false;
    if (!addTeoyubeCollectionItem(to.id, item)) return false;
    from.items = from.items.filter((entry) => entry.id !== itemId);
    return true;
  }

  function filterTeoyubeCollectionItems(collectionId, itemType = "all") {
    const collection = getTeoyubeSmartCollections().find((entry) => entry.id === collectionId);
    const items = phase116b1SafeArray(collection?.items);
    return itemType === "all" ? items : items.filter((item) => item.type === itemType);
  }

  function openTeoyubeCollectionItem(collectionId, itemId) {
    const item = filterTeoyubeCollectionItems(collectionId).find((entry) => entry.id === itemId);
    if (!item) return false;
    const result = buildTeoyubeUniversalIndex().find((record) => record.sourceId === item.id || record.id === item.id);
    if (result) openTeoyubeSearchResult(result);
    else if (item.scripture) {
      setActiveScripture(item.scripture);
      setView("search");
    }
    return true;
  }

  function exportTeoyubeSmartCollection(collectionId) {
    const collection = getTeoyubeSmartCollections().find((entry) => entry.id === collectionId);
    if (!collection) return null;
    const safeExport = {
      schema: "teoyube-smart-collection-v1",
      exportedAt: phase116b1Now(),
      collection: {
        id: collection.id,
        name: collection.name,
        itemType: collection.itemType,
        items: phase116b1SafeArray(collection.items).map(({ id, type, label, scripture }) => ({ id, type, label, scripture }))
      },
      rawPrivateTextIncluded: false
    };
    const blob = new Blob([JSON.stringify(safeExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${collection.id}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    return safeExport;
  }

  function getTeoyubeContinuationState() {
    const lastPromise = phase116b1SafeArray(state.savedPromiseTableItems)[0];
    const latestPrayer = phase116b1SafeArray(state.journalEntries).find((entry) => /prayer/i.test(entry.title || ""));
    const incompleteAction = state.activeDailyJourney?.completed
      ? ""
      : state.activeActionStep || state.activeDailyJourney?.actionStep || state.activeJourney?.actionStep || "";
    return {
      journey: state.activeJourney || state.activeDailyJourney || state.selectedJourney || null,
      scripture: phase116bScriptureReference(state.activeScripture || state.selectedScripture, ""),
      word: state.activeWord?.word || state.selectedWord || "",
      promise: lastPromise || state.selectedPromiseResult || null,
      incompleteAction,
      latestPrayer: latestPrayer ? { id: latestPrayer.id, title: latestPrayer.title, scripture: latestPrayer.scriptureReferences?.[0] || "" } : null,
      workflow: state.activeWorkflow || state.phase116ActiveWorkflow || "",
      graphSelection: state.graphSelection || null,
      lastPage: state.activePage || phase116b1CurrentPage()
    };
  }

  function clearTeoyubeContinuationState() {
    state.activeJourney = null;
    state.activeDailyJourney = null;
    state.activeWorkflow = null;
    state.phase116ActiveWorkflow = null;
    state.graphSelection = null;
    state.phase116b1ContinuationClearedAt = phase116b1Now();
    return true;
  }

  function tokenizeTeoyubeSearchText(value) {
    return [...new Set(phase116b1Normalize(value).split(/\s+/).filter((token) => token.length > 1))];
  }

  function phase116b1SearchRecord(record) {
    return {
      id: record.id || `${record.type}-${phase116b1Hash(`${record.title}-${record.scripture}`)}`,
      sourceId: record.sourceId || record.id || "",
      type: record.type || "unknown",
      title: String(record.title || "Untitled"),
      description: String(record.description || ""),
      scripture: phase116bScriptureReference(record.scripture, ""),
      bibleBook: String(record.bibleBook || phase116bScriptureReference(record.scripture, "").replace(/\s+\d.*$/, "")),
      category: String(record.category || ""),
      word: String(record.word || ""),
      promiseCluster: String(record.promiseCluster || ""),
      journey: String(record.journey || ""),
      calling: String(record.calling || ""),
      saved: Boolean(record.saved),
      mediaAvailable: Boolean(record.mediaAvailable),
      page: record.page || "search"
    };
  }

  function buildTeoyubeUniversalIndex() {
    ensurePhase116b1State();
    const records = [];
    const add = (record) => records.push(phase116b1SearchRecord(record));
    phase116b1SafeArray(getLexiconItems()).forEach((word) =>
      add({
        id: `word-${phase116b1Hash(word.word)}`,
        sourceId: word.word,
        type: "word",
        title: word.word,
        description: word.meaning || word.description,
        scripture: getLexiconItemSources(word)[0],
        category: getLexiconItemCategory(word),
        word: word.word,
        page: "lexicon"
      })
    );
    phase116b1SafeArray(promiseClusters).forEach((cluster, index) => {
      const title = getClusterTitle(cluster);
      const scriptures = getClusterScriptures(cluster);
      add({
        id: `promise-cluster-${index}`,
        sourceId: cluster.id || title,
        type: "promise",
        title,
        description: cluster.summary || cluster.declaration,
        scripture: scriptures[0],
        category: cluster.promise_category || cluster.theme,
        word: phase116b1SafeArray(cluster.related_teoyube_words)[0],
        promiseCluster: title,
        page: "table"
      });
      scriptures.forEach((reference) =>
        add({ id: `scripture-${phase116b1Hash(reference)}`, sourceId: reference, type: "scripture", title: reference, description: `Scripture anchor for ${title}.`, scripture: reference, promiseCluster: title, page: "search" })
      );
      if (cluster.prayer_framework) add({ id: `prayer-${index}`, sourceId: cluster.id || title, type: "prayer", title: `Prayer: ${title}`, description: cluster.prayer_framework, scripture: scriptures[0], promiseCluster: title, page: "guide" });
      if (cluster.divine_assignment) add({ id: `action-${index}`, sourceId: cluster.id || title, type: "action", title: `Action: ${title}`, description: cluster.divine_assignment, scripture: scriptures[0], promiseCluster: title, page: "today" });
    });
    phase116b1SafeArray(scriptureCanon).forEach((entry, index) =>
      add({
        id: entry.id || `canon-${index}`,
        sourceId: entry.id || entry.reference,
        type: "journey",
        title: entry.title || entry.name || entry.reference || `Canon journey ${index + 1}`,
        description: entry.description || entry.summary,
        scripture: entry.reference || entry.scripture || entry.scripture_reference,
        journey: entry.title || entry.name,
        page: "canon"
      })
    );
    [state.activeJourney, state.activeDailyJourney, state.selectedJourney].filter(Boolean).forEach((journey) =>
      add({ id: journey.id, sourceId: journey.id, type: "journey", title: journey.title, description: journey.actionStep || "Active local journey.", scripture: journey.scripture, journey: journey.title, saved: true, page: "today" })
    );
    if (state.calling?.primary || state.activeCallingResult) {
      const calling = state.activeCallingResult || state.calling;
      add({ id: calling.id || "active-calling", sourceId: calling.id || "active-calling", type: "calling", title: calling.title || calling.primary || "Calling profile", description: calling.summary || calling.secondary || "Cautious local calling profile.", scripture: calling.scripture?.reference || state.selectedScripture, calling: calling.title || calling.primary, page: "calling" });
    }
    phase116b1SafeArray(state.unlockedMilestones).forEach((milestone, index) => add({ id: milestone.id || `milestone-${index}`, sourceId: milestone.id, type: "milestone", title: milestone.title || milestone.name || `Milestone ${index + 1}`, description: milestone.description, scripture: milestone.scripture, page: "today" }));
    phase116b1SafeArray(state.book).forEach((entry, index) => add({ id: entry.id || `book-${index}`, sourceId: entry.id || entry.title, type: "book", title: entry.title, description: entry.type || "Saved Book entry.", scripture: entry.references?.[0], saved: true, page: "book" }));
    phase116b1SafeArray(state.savedPromiseTableItems).forEach((entry) => add({ id: entry.id, sourceId: entry.id, type: "promise_table", title: entry.title, description: `${entry.status || "Discovered"} promise table item.`, scripture: entry.scripture, word: entry.word, saved: true, page: "table" }));
    phase116b1SafeArray(state.testimonies).forEach((entry, index) => add({ id: entry.id || `testimony-${index}`, sourceId: entry.id || entry.title, type: "testimony", title: entry.title, description: `${entry.status || "Draft"} testimony reference.`, scripture: entry.references?.[0], saved: true, page: "testimony" }));
    phase116b1ActualMediaRecords().forEach((entry) => add({ id: entry.id, sourceId: entry.id, type: "media", title: entry.title, description: entry.description, scripture: entry.scriptureReferences?.[0], category: entry.mediaKind, mediaAvailable: true, page: "ui-videos" }));
    universalIndex = [...new Map(records.map((record) => [record.id, record])).values()];
    universalIndexDirty = false;
    return universalIndex;
  }

  function refreshTeoyubeUniversalIndex() {
    universalIndexDirty = true;
    return buildTeoyubeUniversalIndex();
  }

  function scoreTeoyubeSearchRecord(record, query, options = {}) {
    const tokens = tokenizeTeoyubeSearchText(query);
    if (!tokens.length) return 1;
    const title = phase116b1Normalize(record.title);
    const scripture = phase116b1Normalize(record.scripture);
    const haystack = phase116b1Normalize(`${record.title} ${record.description} ${record.scripture} ${record.category} ${record.word} ${record.promiseCluster} ${record.journey} ${record.calling}`);
    let score = 0;
    tokens.forEach((token) => {
      if (title === token) score += 60;
      else if (title.includes(token)) score += 28;
      if (scripture.includes(token)) score += 24;
      if (haystack.includes(token)) score += 10;
    });
    if (options.type && options.type !== "all" && record.type === options.type) score += 12;
    if (record.saved) score += 2;
    return score;
  }

  function searchTeoyubeUniversalIndex(query, filters = {}) {
    const source = universalIndexDirty ? buildTeoyubeUniversalIndex() : universalIndex;
    const type = filters.type || "all";
    const bibleBook = phase116b1Normalize(filters.bibleBook);
    const scripture = phase116b1Normalize(filters.scriptureReference);
    const category = phase116b1Normalize(filters.category);
    const word = phase116b1Normalize(filters.word);
    const promiseCluster = phase116b1Normalize(filters.promiseCluster);
    const journey = phase116b1Normalize(filters.journey);
    const calling = phase116b1Normalize(filters.calling);
    return source
      .filter((record) => type === "all" || record.type === type)
      .filter((record) => !bibleBook || phase116b1Normalize(record.bibleBook) === bibleBook)
      .filter((record) => !scripture || phase116b1Normalize(record.scripture).includes(scripture))
      .filter((record) => !category || phase116b1Normalize(record.category).includes(category))
      .filter((record) => !word || phase116b1Normalize(record.word).includes(word))
      .filter((record) => !promiseCluster || phase116b1Normalize(record.promiseCluster).includes(promiseCluster))
      .filter((record) => !journey || phase116b1Normalize(record.journey).includes(journey))
      .filter((record) => !calling || phase116b1Normalize(record.calling).includes(calling))
      .filter((record) => filters.saved == null || record.saved === Boolean(filters.saved))
      .filter((record) => filters.mediaAvailability == null || record.mediaAvailable === Boolean(filters.mediaAvailability))
      .map((record) => ({ ...record, score: scoreTeoyubeSearchRecord(record, query, filters) }))
      .filter((record) => record.score > 0)
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
      .slice(0, 80);
  }

  function getTeoyubeSearchSuggestions(query) {
    return searchTeoyubeUniversalIndex(query).slice(0, 6).map((record) => ({ id: record.id, label: record.title, type: record.type }));
  }

  function groupTeoyubeSearchResults(results) {
    return phase116b1SafeArray(results).reduce((groups, result) => {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type].push(result);
      return groups;
    }, {});
  }

  function openTeoyubeSearchResult(result) {
    if (!result) return false;
    if (result.type === "word") setActiveWord(result.sourceId || result.title);
    if (result.scripture) setActiveScripture(result.scripture);
    if (result.type === "promise" || result.type === "promise_table") {
      const cluster = phase116bClusterFromAny(result.promiseCluster || result.title);
      setActivePromiseCluster(cluster);
      state.phase116bPromiseDetailId = result.sourceId;
    }
    if (result.type === "journey") setActiveJourney({ id: result.sourceId, title: result.title, scripture: result.scripture, progress: 0 });
    if (typeof setView === "function") setView(result.page || "search");
    if (typeof updateRightRail === "function") updateRightRail({ surface: result.page, label: result.title, scripture: result.scripture });
    if (typeof saveState === "function") saveState();
    return true;
  }

  function renderPhase116b1SearchResults(query = "", type = "all") {
    const target = document.querySelector("#phase116b1UniversalSearchResults");
    if (!target) return;
    const results = searchTeoyubeUniversalIndex(query, { type });
    state.phase116b1UniversalSearchQuery = query;
    state.phase116b1UniversalSearchFilter = type;
    state.phase116b1UniversalSearchResults = results.map(({ id, type: resultType, title, scripture, score }) => ({ id, type: resultType, title, scripture, score }));
    const groups = groupTeoyubeSearchResults(results);
    target.innerHTML = Object.keys(groups).length
      ? Object.entries(groups)
          .map(
            ([group, items]) => `<section><h3>${phase116b1Escape(group.replace(/_/g, " "))} <span>${items.length}</span></h3>${items
              .map((item) => `<button type="button" data-teoyube-search-result="${phase116b1Escape(item.id)}"><strong>${phase116b1Escape(item.title)}</strong><small>${phase116b1Escape(item.scripture || item.category || "Local structured content")}</small><span>Score ${item.score}</span></button>`)
              .join("")}</section>`
          )
          .join("")
      : `<article class="phase114-empty-state"><strong>No local matches</strong><p>Try another Scripture, word, promise, or journey. Media records: ${phase116b1ActualMediaRecords().length}.</p></article>`;
  }

  function openPhase116b1UniversalSearch(trigger = document.activeElement) {
    ensurePhase116b1Shell();
    refreshTeoyubeUniversalIndex();
    const dialog = document.querySelector("#phase116b1UniversalSearchDialog");
    if (typeof dialog?.showModal === "function" && !dialog.open) dialog.showModal();
    else dialog?.setAttribute("open", "open");
    const input = document.querySelector("#phase116b1UniversalSearchInput");
    renderPhase116b1SearchResults(input?.value || "", document.querySelector("#phase116b1UniversalSearchType")?.value || "all");
    requestAnimationFrame(() => input?.focus());
    dialog.dataset.returnFocusId = trigger?.id || "";
  }

  function renderPhase116b1MediaReadiness() {
    const target = document.querySelector("#phase116b1MediaReadinessContent");
    if (!target) return;
    const actualCount = phase116b1ActualMediaRecords().length;
    target.innerHTML = `
      <div class="phase116b1-readiness-grid">
        <article><span>Media ZIP imported</span><strong>No</strong></article>
        <article><span>Manifest loaded</span><strong>Sample only</strong></article>
        <article><span>Sample records</span><strong>${PHASE116B1_MEDIA_SAMPLE_COUNT}</strong></article>
        <article><span>Actual media records</span><strong>${actualCount}</strong></article>
        <article><span>Scanner</span><strong>Available</strong></article>
        <article><span>Validator</span><strong>Available</strong></article>
      </div>
      <dl class="phase116b1-readiness-list">
        <div><dt>Supported</dt><dd>mp4, mov, m4v, webm, avi, mp3, m4a, wav, jpg, jpeg, png, webp, vtt, srt</dd></div>
        <div><dt>Folder convention</dt><dd>TeoyubeWorld / Bible book / chapter or collection / media and sidecars</dd></div>
        <div><dt>Expected manifest</dt><dd>generated/teoyubeworld-media/teoyubeworld-media-manifest.draft.json</dd></div>
        <div><dt>Readiness warning</dt><dd>No real files have been scanned, validated, reviewed, or imported.</dd></div>
        <div><dt>Next step</dt><dd>Phase 11.6C - TeoyubeWorld Scripture Media Intelligence, Video Library Integration & Interactive Scripture Animation Panels</dd></div>
      </dl>
    `;
  }

  function openPhase116b1MediaReadiness(trigger = document.activeElement) {
    ensurePhase116b1Shell();
    const dialog = document.querySelector("#phase116b1MediaReadinessDialog");
    renderPhase116b1MediaReadiness();
    dialog.dataset.returnFocusId = trigger?.id || "";
    if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
    else dialog.setAttribute("open", "open");
  }

  function phase116b1ResponsivePreviewUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("qa");
    url.searchParams.set("embedded", "1");
    url.searchParams.set("phase116b1", PHASE116B1_VERSION);
    return `${url.pathname}${url.search}${url.hash || "#today"}`;
  }

  function setPhase116b1ResponsiveWidth(width) {
    const numericWidth = width === "desktop" ? 1280 : Number(width || 390);
    state.phase116b1ResponsiveWidth = numericWidth;
    const viewport = document.querySelector("#phase116b1ResponsiveViewport");
    const label = document.querySelector("#phase116b1ResponsiveWidthLabel");
    if (viewport) viewport.style.width = `${numericWidth}px`;
    if (label) label.textContent = numericWidth >= 1280 ? "desktop (1280px)" : `${numericWidth}px`;
    document.querySelectorAll("[data-phase116b1-width]").forEach((button) => button.classList.toggle("active", Number(button.dataset.phase116b1Width) === numericWidth || (button.dataset.phase116b1Width === "desktop" && numericWidth === 1280)));
    const iframe = document.querySelector("#phase116b1ResponsiveFrame");
    if (iframe && iframe.src) setTimeout(inspectPhase116b1ResponsivePreview, 80);
  }

  function inspectPhase116b1ResponsivePreview() {
    const iframe = document.querySelector("#phase116b1ResponsiveFrame");
    const target = document.querySelector("#phase116b1ResponsiveDiagnostics");
    if (!iframe || !target) return null;
    try {
      const doc = iframe.contentDocument;
      const view = iframe.contentWindow;
      const body = doc?.body;
      const root = doc?.documentElement;
      const overflow = Boolean(root && root.scrollWidth > root.clientWidth + 1);
      const sidebar = doc?.querySelector(".sidebar");
      const rightRail = doc?.querySelector("#phase113InsightRail");
      const openModal = doc?.querySelector("dialog[open]");
      const touchWarnings = [...(doc?.querySelectorAll("button, a, input, select, textarea") || [])].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      }).length;
      const report = {
        width: state.phase116b1ResponsiveWidth,
        overflow: overflow ? "detected" : "none",
        sidebar: sidebar ? view.getComputedStyle(sidebar).transform === "none" || view.getComputedStyle(sidebar).transform === "matrix(1, 0, 0, 1, 0, 0)" ? "visible" : "drawer/off-canvas" : "missing",
        rightRail: rightRail ? view.getComputedStyle(rightRail).display === "none" ? "hidden" : rightRail.classList.contains("collapsed") ? "collapsed" : "available" : "missing",
        modal: openModal ? openModal.id || "open" : "none",
        touchTargetWarnings: touchWarnings
      };
      target.innerHTML = Object.entries(report).map(([key, value]) => `<div><dt>${phase116b1Escape(key)}</dt><dd>${phase116b1Escape(value)}</dd></div>`).join("");
      return report;
    } catch (error) {
      target.innerHTML = `<div><dt>Status</dt><dd>Preview diagnostics unavailable: ${phase116b1Escape(error.message)}</dd></div>`;
      return null;
    }
  }

  function openPhase116b1ResponsiveQaLab(width = 390, trigger = document.activeElement) {
    ensurePhase116b1Shell();
    responsiveLabReturnFocus = trigger;
    const dialog = document.querySelector("#phase116b1ResponsiveDialog");
    const iframe = document.querySelector("#phase116b1ResponsiveFrame");
    setPhase116b1ResponsiveWidth(width);
    if (!iframe.src) iframe.src = phase116b1ResponsivePreviewUrl();
    if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
    else dialog.setAttribute("open", "open");
    setTimeout(inspectPhase116b1ResponsivePreview, 320);
  }

  function closePhase116b1ResponsiveQaLab() {
    const dialog = document.querySelector("#phase116b1ResponsiveDialog");
    if (dialog?.open && typeof dialog.close === "function") dialog.close();
    else dialog?.removeAttribute("open");
    if (responsiveLabReturnFocus?.isConnected) responsiveLabReturnFocus.focus({ preventScroll: true });
    responsiveLabReturnFocus = null;
  }

  function openPromiseAddInsideResponsivePreview() {
    const iframe = document.querySelector("#phase116b1ResponsiveFrame");
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.location.hash = "#table";
    setTimeout(() => {
      iframe.contentWindow.dispatchTeoyubeAction?.("promise.add.open", { trigger: iframe.contentDocument?.activeElement });
      inspectPhase116b1ResponsivePreview();
    }, 120);
  }

  function phase116b1MountPanel(viewId, panelId, html) {
    const view = document.querySelector(`#${viewId}`);
    if (!view) return null;
    let panel = document.querySelector(`#${panelId}`);
    if (!panel) {
      panel = document.createElement("section");
      panel.id = panelId;
      panel.className = "phase116b-functional-panel phase116b1-panel";
      const anchor = view.querySelector(".today-integrations, .book-main-grid, .book-content-grid");
      if (anchor) anchor.insertAdjacentElement("beforebegin", panel);
      else view.appendChild(panel);
    }
    panel.innerHTML = html;
    return panel;
  }

  function renderPhase116b1ContinuationPanel(viewId) {
    const continuation = getTeoyubeContinuationState();
    const hasState = Boolean(continuation.journey || continuation.promise || continuation.scripture || continuation.word || continuation.workflow);
    phase116b1MountPanel(
      viewId,
      `phase116b1Continuation-${viewId}`,
      `<div class="phase116b-panel-head"><div><p class="eyebrow">Continue Where You Left Off</p><h3>${hasState ? phase116b1Escape(continuation.journey?.title || continuation.promise?.title || "Active local context") : "No active continuation"}</h3><p>Session-only context. Nothing here is stored in browser persistence.</p></div><span class="phase116b-score">${phase116b1Escape(continuation.lastPage || viewId)}</span></div>
      <div class="phase116b1-continuation-grid">
        <article><span>Journey</span><strong>${phase116b1Escape(continuation.journey?.title || "None")}</strong></article>
        <article><span>Scripture</span><strong>${phase116b1Escape(continuation.scripture || "None")}</strong></article>
        <article><span>Word</span><strong>${phase116b1Escape(continuation.word || "None")}</strong></article>
        <article><span>Promise</span><strong>${phase116b1Escape(continuation.promise?.title || continuation.promise?.promise_category || "None")}</strong></article>
        <article><span>Next action</span><strong>${phase116b1Escape(continuation.incompleteAction ? "Available" : "None")}</strong></article>
        <article><span>Prayer</span><strong>${phase116b1Escape(continuation.latestPrayer?.title || (state.activePrayer ? "Active prayer available" : "None"))}</strong></article>
      </div>
      <div class="phase116b-action-row">
        <button type="button" class="secondary" data-teoyube-action="continuation.journey">Continue Journey</button>
        <button type="button" class="secondary" data-teoyube-action="continuation.complete">Complete Next Action</button>
        <button type="button" class="secondary" data-teoyube-action="continuation.scripture">Reopen Scripture</button>
        <button type="button" class="secondary" data-teoyube-action="continuation.promise">Reopen Promise</button>
        <button type="button" class="secondary" data-teoyube-action="continuation.workflow">Continue Guided Workflow</button>
        <button type="button" class="secondary" data-teoyube-action="continuation.book">Open Book Timeline</button>
        <button type="button" class="secondary" data-teoyube-action="continuation.clear">Clear Continuation State</button>
      </div>`
    );
  }

  function renderPhase116b1SmartCollections() {
    const collections = getTeoyubeSmartCollections();
    const selectedId = state.phase116b1SelectedCollectionId || collections[0]?.id;
    const selected = collections.find((item) => item.id === selectedId) || collections[0];
    state.phase116b1SelectedCollectionId = selected?.id || "";
    const targetOptions = collections.map((item) => `<option value="${phase116b1Escape(item.id)}">${phase116b1Escape(item.name)}</option>`).join("");
    phase116b1MountPanel(
      "book",
      "phase116b1SmartCollections",
      `<div class="phase116b-panel-head"><div><p class="eyebrow">Smart Collections</p><h3>Organize saved references</h3><p>Collections contain record references and safe labels, not generic copies of private journal or testimony text.</p></div><span class="phase116b-score">${collections.length}</span></div>
      <form id="phase116b1CollectionCreateForm" class="phase116b1-inline-form"><label>New collection<input name="name" maxlength="60" required placeholder="Collection name" /></label><button type="submit" class="secondary">Create</button></form>
      <div class="phase116b1-collection-tabs">${collections.map((collection) => `<button type="button" class="${collection.id === selected?.id ? "active" : ""}" data-teoyube-action="collection.select" data-collection-id="${phase116b1Escape(collection.id)}">${phase116b1Escape(collection.name)} <span>${phase116b1SafeArray(collection.items).length}</span></button>`).join("")}</div>
      ${selected ? `<div class="phase116b1-collection-detail"><div class="phase116b1-inline-form"><label>Collection name<input id="phase116b1CollectionRename" value="${phase116b1Escape(selected.name)}" maxlength="60" /></label><button type="button" class="secondary" data-teoyube-action="collection.rename" data-collection-id="${phase116b1Escape(selected.id)}">Rename</button><button type="button" class="secondary" data-teoyube-action="collection.delete" data-collection-id="${phase116b1Escape(selected.id)}">Delete</button><button type="button" class="secondary" data-teoyube-action="collection.export" data-collection-id="${phase116b1Escape(selected.id)}">Export</button></div>
        <div class="phase116b-action-row"><button type="button" class="secondary" data-teoyube-action="collection.add.current" data-collection-id="${phase116b1Escape(selected.id)}" data-item-type="scripture">Add Current Scripture</button><button type="button" class="secondary" data-teoyube-action="collection.add.current" data-collection-id="${phase116b1Escape(selected.id)}" data-item-type="word">Add Current Word</button><button type="button" class="secondary" data-teoyube-action="collection.add.current" data-collection-id="${phase116b1Escape(selected.id)}" data-item-type="promise">Add Current Promise</button><button type="button" class="secondary" data-teoyube-action="collection.add.current" data-collection-id="${phase116b1Escape(selected.id)}" data-item-type="journey">Add Current Journey</button><button type="button" class="secondary" data-teoyube-action="collection.add.current" data-collection-id="${phase116b1Escape(selected.id)}" data-item-type="media" ${phase116b1ActualMediaRecords().length ? "" : "disabled"}>Add Future Media</button></div>
        ${selected.id === "teoyubeworld-media" && !selected.items.length ? '<p class="phase116b-safety">No TeoyubeWorld media has been imported yet.</p>' : ""}
        <div class="phase116b1-collection-items">${selected.items.length ? selected.items.map((item) => `<article><div><strong>${phase116b1Escape(item.label)}</strong><small>${phase116b1Escape(item.type)}${item.scripture ? ` - ${phase116b1Escape(item.scripture)}` : ""}</small></div><select data-collection-move-target aria-label="Move item to collection">${targetOptions}</select><button type="button" data-teoyube-action="collection.move" data-collection-id="${phase116b1Escape(selected.id)}" data-item-id="${phase116b1Escape(item.id)}">Move</button><button type="button" data-teoyube-action="collection.open" data-collection-id="${phase116b1Escape(selected.id)}" data-item-id="${phase116b1Escape(item.id)}">Open</button><button type="button" data-teoyube-action="collection.remove" data-collection-id="${phase116b1Escape(selected.id)}" data-item-id="${phase116b1Escape(item.id)}">Remove</button></article>`).join("") : "<p>No items in this collection yet.</p>"}</div></div>` : ""}`
    );
  }

  function renderPhase116b1QaExtensions() {
    if (new URLSearchParams(window.location.search).get("embedded") === "1") return;
    const qaCard = document.querySelector("#phase114QaPanel .phase114-qa-card");
    if (!qaCard) return;
    let section = document.querySelector("#phase116b1QaExtensions");
    if (!section) {
      section = document.createElement("section");
      section.id = "phase116b1QaExtensions";
      section.className = "phase116b1-qa-extensions";
      qaCard.appendChild(section);
    }
    section.innerHTML = `<p class="eyebrow">Phase 11.6B.1</p><div class="phase116b-action-row"><button type="button" class="secondary" data-teoyube-action="media.readiness.open">Media Readiness</button><button type="button" class="secondary" data-teoyube-action="responsive.qa.open">Responsive QA Lab</button><button type="button" class="secondary" data-teoyube-action="search.everything.open">Search Everything</button><button type="button" class="secondary" data-teoyube-action="qa.phase116b1.run">Run 11.6B.1 QA</button></div><p><strong>Actual imported media:</strong> ${phase116b1ActualMediaRecords().length}. <strong>Undo:</strong> ${canUndoTeoyubeAction() ? "available" : "none"}.</p><h3>Recent Actions</h3><ul id="phase116b1RecentActions"></ul>`;
    renderRecentActionHistory();
  }

  function renderPhase116b1Experience() {
    ensurePhase116b1State();
    ensurePhase116b1Shell();
    renderPhase116b1ContinuationPanel("today");
    renderPhase116b1ContinuationPanel("book");
    renderPhase116b1SmartCollections();
    renderPhase116b1QaExtensions();
  }

  function runPhase116b1FunctionalQa() {
    ensurePhase116b1Shell();
    const requiredActions = [
      "journey.generate-today",
      "today.complete-action",
      "promise.add.open",
      "promise.add.submit",
      "undo.last",
      "search.everything.open",
      "media.readiness.open",
      "responsive.qa.open"
    ];
    const searchResults = searchTeoyubeUniversalIndex("Ephesians purpose");
    const collections = getTeoyubeSmartCollections();
    const checks = [
      ["manual_promise_dialog", Boolean(document.querySelector("#phase116b1PromiseAddForm")), "Validated native Promise Table form exists."],
      ["action_registry", requiredActions.every((id) => Boolean(getTeoyubeAction(id))), "Required primary actions resolve through the registry."],
      ["command_palette_registry", getPhase113Commands().some((command) => command.id === "phase116b1-search-everything"), "Command palette includes registry actions."],
      ["undo_history", typeof undoLastTeoyubeAction === "function" && typeof getRecentTeoyubeActions === "function", "Undo and sanitized recent action helpers exist."],
      ["smart_collections", collections.length >= DEFAULT_COLLECTIONS.length, "Default session-only smart collections exist."],
      ["continuation", Boolean(getTeoyubeContinuationState()), "Continuation state can be summarized."],
      ["universal_search", searchResults.length > 0 && Object.keys(groupTeoyubeSearchResults(searchResults)).length > 0, "Universal search returns grouped local results."],
      ["zero_media", phase116b1ActualMediaRecords().length === 0, "Actual imported media count remains zero."],
      ["responsive_lab", Boolean(document.querySelector("#phase116b1ResponsiveFrame")), "Responsive QA Lab includes a constrained local iframe."],
      ["guardrails", Boolean(document.querySelector("#guardrailDialog")) && Boolean(state.selectedScripture), "Guardrails and Scripture anchor remain available."]
    ].map(([id, passed, detail]) => ({ id, status: passed ? "pass" : "fail", detail }));
    const report = { phase: PHASE116B1_VERSION, valid: checks.every((check) => check.status === "pass"), checks, generatedAt: phase116b1Now(), actualMediaRecordCount: phase116b1ActualMediaRecords().length };
    state.phase116b1FunctionalQaReport = report;
    renderPhase116b1QaExtensions();
    return report;
  }

  function ensurePhase116b1Shell() {
    if (document.querySelector("#phase116b1Shell")) return;
    const shell = document.createElement("div");
    shell.id = "phase116b1Shell";
    shell.innerHTML = `
      <dialog id="phase116b1PromiseDialog" class="phase116b1-dialog" aria-labelledby="phase116b1PromiseDialogTitle">
        <div class="phase113-command-header"><div><p class="eyebrow">Promise Table</p><h2 id="phase116b1PromiseDialogTitle">Add a Promise</h2></div><button type="button" class="phase113-icon-button" data-phase116b1-close="promise" aria-label="Close Add Promise dialog">x</button></div>
        <p>Every manual promise requires a visible Scripture anchor. Testified is never selected automatically.</p>
        <form id="phase116b1PromiseAddForm" class="phase116b1-promise-form">
          <label>Promise title<input name="title" required minlength="3" maxlength="100" autocomplete="off" /></label>
          <label>Scripture reference<input name="scripture" required maxlength="60" autocomplete="off" placeholder="John 3:16" /></label>
          <label>Teoyube word<input name="word" maxlength="60" autocomplete="off" /></label>
          <label>Category<select name="category"><option>Calling & Purpose</option><option>Faith & Trust</option><option>Prayer & Surrender</option><option>Wisdom & Direction</option><option>Healing & Restoration</option></select></label>
          <label>Initial status<select name="status">${["Discovered", "Studying", "Praying", "Acting", "Witnessing Progress", "Testified", "Remembered"].map((status) => `<option>${status}</option>`).join("")}</select></label>
          <label class="phase116b1-full-field">Optional safe note<textarea name="notes" maxlength="500" placeholder="Session-only note. Ctrl or Command + Enter submits."></textarea></label>
          <label class="phase116b1-check"><input type="checkbox" name="saveToBook" /> Save a safe reference to Book</label>
          <div class="phase116b-action-row phase116b1-full-field"><button type="button" class="secondary" data-phase116b1-close="promise">Cancel</button><button type="submit" class="primary">Add Promise</button></div>
        </form>
      </dialog>
      <dialog id="phase116b1UniversalSearchDialog" class="phase116b1-dialog phase116b1-search-dialog">
        <div class="phase113-command-header"><div><p class="eyebrow">Universal local index</p><h2>Search Everything</h2></div><button type="button" class="phase113-icon-button" data-phase116b1-close="search" aria-label="Close Search Everything">x</button></div>
        <div class="phase116b1-search-controls"><input id="phase116b1UniversalSearchInput" type="search" placeholder="Search Scripture, word, promise, journey..." /><select id="phase116b1UniversalSearchType" aria-label="Filter universal search by type"><option value="all">All types</option><option value="scripture">Scripture</option><option value="word">Words</option><option value="promise">Promise clusters</option><option value="promise_table">Promise Table</option><option value="journey">Journeys</option><option value="prayer">Prayer</option><option value="calling">Calling</option><option value="book">Book</option><option value="testimony">Testimony</option><option value="media">Media</option></select></div>
        <div id="phase116b1UniversalSearchResults" class="phase116b1-search-results"></div>
      </dialog>
      <dialog id="phase116b1MediaReadinessDialog" class="phase116b1-dialog">
        <div class="phase113-command-header"><div><p class="eyebrow">Development readiness</p><h2>TeoyubeWorld Media Readiness</h2></div><button type="button" class="phase113-icon-button" data-phase116b1-close="media" aria-label="Close Media Readiness">x</button></div>
        <div id="phase116b1MediaReadinessContent"></div>
      </dialog>
      <dialog id="phase116b1ResponsiveDialog" class="phase116b1-responsive-dialog">
        <div class="phase113-command-header"><div><p class="eyebrow">Constrained local preview</p><h2>Responsive QA Lab: <span id="phase116b1ResponsiveWidthLabel">390px</span></h2></div><button type="button" class="phase113-icon-button" data-phase116b1-close="responsive" aria-label="Close Responsive QA Lab">x</button></div>
        <div class="phase116b1-width-controls">${[360, 390, 430, 768, 1024].map((width) => `<button type="button" data-phase116b1-width="${width}">${width}</button>`).join("")}<button type="button" data-phase116b1-width="desktop">Desktop</button><button type="button" class="secondary" data-teoyube-action="responsive.promise.open">Open Promise Add in 390px</button></div>
        <dl id="phase116b1ResponsiveDiagnostics" class="phase116b1-responsive-diagnostics"><div><dt>Status</dt><dd>Load a preview to inspect layout.</dd></div></dl>
        <div class="phase116b1-responsive-scroll"><div id="phase116b1ResponsiveViewport" class="phase116b1-responsive-viewport"><iframe id="phase116b1ResponsiveFrame" title="Teoyube constrained responsive preview" loading="eager"></iframe></div></div>
        <p class="phase116b-safety">This local constrained preview supplements manual browser QA. It is not a claim of testing every physical device.</p>
      </dialog>`;
    document.body.appendChild(shell);
    renderPhase116b1MediaReadiness();
  }

  const originalHandlePhase116bAction = handlePhase116bAction;
  const actionAliasMap = {
    "generate-today": "journey.generate-today",
    "complete-today-action": "today.complete-action",
    "add-current-reflection": "reflection.add",
    "open-current-graph": "graph.open",
    "compass-start": "compass.start",
    "compass-start-journey": "journey.start",
    "promise-save-book": "book.save.promise",
    "open-promise-add-dialog": "promise.add.open",
    "reset-session": "session.reset"
  };
  handlePhase116bAction = function handlePhase116b1ActionBridge(action, trigger = null) {
    const actionId = actionAliasMap[action];
    if (actionId) {
      dispatchTeoyubeAction(actionId, { trigger });
      return true;
    }
    return originalHandlePhase116bAction(action, trigger);
  };

  const originalUpdatePhase114PromiseStatus = updatePhase114PromiseStatus;
  updatePhase114PromiseStatus = function updatePhase116b1PromiseStatus(rowId, status) {
    const row = phase116b1SafeArray(state.savedPromiseTableItems).find((item) => item.id === rowId);
    const previousStatus = row?.status;
    originalUpdatePhase114PromiseStatus(rowId, status);
    if (row && previousStatus !== status) {
      pushTeoyubeUndoEntry({ actionId: "promise.status.update", label: `Update ${row.title} status`, undo: () => originalUpdatePhase114PromiseStatus(rowId, previousStatus) });
      recordTeoyubeActionOutcome({ actionId: "promise.status.update", label: "Update Promise Status", detail: `${row.title}: ${status}`, reversible: true });
    }
  };

  const originalRemovePhase114PromiseRow = removePhase114PromiseRow;
  removePhase114PromiseRow = function removePhase116b1PromiseRow(rowId) {
    const row = phase116b1Clone(phase116b1SafeArray(state.savedPromiseTableItems).find((item) => item.id === rowId));
    originalRemovePhase114PromiseRow(rowId);
    if (row) {
      pushTeoyubeUndoEntry({ actionId: "promise.remove", label: `Remove ${row.title}`, undo: () => { state.savedPromiseTableItems.unshift(row); state.promiseTableItems = state.savedPromiseTableItems; } });
      recordTeoyubeActionOutcome({ actionId: "promise.remove", label: "Remove Promise", detail: row.title, reversible: true });
      renderUndoToast({ label: "Remove Promise" });
    }
  };

  const originalGetPhase113Commands = getPhase113Commands;
  getPhase113Commands = function getPhase116b1Commands() {
    const actionCommandMap = {
      generate: "journey.generate-today",
      guardrails: "guardrails.open",
      guide: "teo.ask",
      calling: "compass.start",
      book: "reflection.add",
      export: "data.open",
      "phase117-data-controls": "data.open",
      "phase116-open-graph": "graph.open",
      "phase116b-complete-today-action": "today.complete-action",
      "phase116b-add-current-reflection": "reflection.add",
      "phase116b-save-current-scripture": "scripture.save",
      "phase116b-save-current-word": "word.save",
      "phase116b-save-current-promise": "promise.save",
      "phase116b-open-current-graph": "graph.open",
      "phase116b-add-current-promise-table": "promise.add.current",
      "phase116b-start-calling-compass": "compass.start",
      "phase116b-reset-session": "session.reset"
    };
    const commands = originalGetPhase113Commands().map((command) => {
      const actionId = actionCommandMap[command.id];
      if (!actionId) return command;
      return { ...command, disabledReason: getTeoyubeActionDisabledReason(actionId), run: () => dispatchTeoyubeAction(actionId, { source: "command-palette" }) };
    });
    const extras = [
      ["phase116b1-open-promise-add", "promise.add.open"],
      ["phase116b1-undo", "undo.last"],
      ["phase116b1-search-everything", "search.everything.open"],
      ["phase116b1-media-readiness", "media.readiness.open"],
      ["phase116b1-responsive-qa", "responsive.qa.open"]
    ].map(([id, actionId]) => {
      const action = getTeoyubeAction(actionId);
      return { id, label: action.label, description: action.description, shortcut: action.keyboardShortcut, disabledReason: getTeoyubeActionDisabledReason(actionId), run: () => dispatchTeoyubeAction(actionId, { source: "command-palette" }) };
    });
    return [...commands, ...extras];
  };

  const originalRunPhase116bFunctionalQa = runPhase116bFunctionalQa;
  runPhase116bFunctionalQa = function runCombinedPhase116bFunctionalQa() {
    const phase116bReport = originalRunPhase116bFunctionalQa();
    const phase116b1Report = runPhase116b1FunctionalQa();
    const combined = {
      phase: "11.6B + 11.6B.1",
      valid: Boolean(phase116bReport?.valid && phase116b1Report.valid),
      checks: [...phase116b1SafeArray(phase116bReport?.checks), ...phase116b1Report.checks],
      generatedAt: phase116b1Now(),
      actualMediaRecordCount: phase116b1Report.actualMediaRecordCount
    };
    state.phase116bFunctionalQaReport = combined;
    state.phase116b1FunctionalQaReport = phase116b1Report;
    if (typeof renderPhase116bFunctionalQaPanel === "function") renderPhase116bFunctionalQaPanel();
    renderPhase116b1QaExtensions();
    return combined;
  };

  function registerPhase116b1Actions() {
    const callLegacy = (action, trigger) => originalHandlePhase116bAction(action, trigger);
    [
      { id: "journey.generate-today", label: "Generate Today's Journey", description: "Create a local Scripture-anchored daily journey.", category: "today", handler: () => { generateJourney(); return { detail: "Today's local journey was generated." }; } },
      { id: "today.complete-action", label: "Complete Today's Action", description: "Complete the current local action and update journey state.", category: "today", requiredState: ["hasJourney"], reversible: true, handler: () => { const before = phase116b1Clone({ activeDailyJourney: state.activeDailyJourney, generatedDailyJourney: state.generatedDailyJourney, activeJourney: state.activeJourney, selectedJourney: state.selectedJourney, completedActions: state.completedActions, book: state.book }); completePhase116bTodayAction(); pushTeoyubeUndoEntry({ actionId: "today.complete-action", label: "Complete Today's Action", undo: () => Object.assign(state, before) }); return { detail: "Today's action was completed with Scripture context preserved." }; } },
      { id: "reflection.add", label: "Add Reflection", description: "Add a session-only reflection through the existing Book flow.", category: "book", handler: () => { addPhase116bCurrentReflection(); return { detail: "Reflection added to the local Book and Journal context." }; } },
      { id: "scripture.save", label: "Save Scripture", description: "Save the current Scripture anchor to Book.", category: "save", requiredState: ["hasScripture"], reversible: true, handler: () => { const response = setActiveTigResponse({ source: "registry-scripture", scripture: state.selectedScripture }); const entry = saveToBook({ title: `Scripture: ${response.scripture.reference}`, content: "Saved Scripture anchor.", references: [response.scripture.reference], source: "action-registry" }); pushTeoyubeUndoEntry({ actionId: "scripture.save", label: entry.title, undo: () => { state.book = phase116b1SafeArray(state.book).filter((item) => item.id !== entry.id); } }); return { detail: entry.title }; } },
      { id: "word.save", label: "Save Word", description: "Save the active Teoyube word with its Scripture source.", category: "save", requiredState: ["hasWord"], reversible: true, handler: () => { const word = phase116bWordFromAny(state.activeWord || state.selectedWord); const entry = saveToBook({ title: word.word, content: word.meaning || "Saved Teoyube word.", references: getLexiconItemSources(word), source: "action-registry" }); pushTeoyubeUndoEntry({ actionId: "word.save", label: entry.title, undo: () => { state.book = phase116b1SafeArray(state.book).filter((item) => item.id !== entry.id); } }); return { detail: `${word.word} saved with Scripture context.` }; } },
      { id: "promise.save", label: "Save Promise", description: "Save the active promise cluster to Book.", category: "save", requiredState: ["hasPromise"], reversible: true, handler: () => { const cluster = phase116bClusterFromAny(state.activePromiseCluster || state.selectedPromiseResult); const entry = saveToBook({ title: getClusterTitle(cluster), content: cluster.summary || "Saved promise cluster.", references: getClusterScriptures(cluster), source: "action-registry" }); pushTeoyubeUndoEntry({ actionId: "promise.save", label: entry.title, undo: () => { state.book = phase116b1SafeArray(state.book).filter((item) => item.id !== entry.id); } }); return { detail: `${entry.title} saved to Book.` }; } },
      { id: "promise.add.open", label: "Open Promise Table Add Dialog", description: "Open the deterministic, Scripture-required Promise Table form.", category: "promise", handler: ({ trigger }) => { openPhase116b1PromiseDialog(trigger); return { detail: "Promise Table Add dialog opened." }; } },
      { id: "promise.add.submit", label: "Add Promise to Table", description: "Validate and add a stable, non-duplicate Promise Table row.", category: "promise", reversible: true, handler: ({ form }) => submitPhase116b1Promise(form || document.querySelector("#phase116b1PromiseAddForm")) },
      { id: "promise.add.current", label: "Add Current Promise to Table", description: "Add the current real local promise context to the table.", category: "promise", reversible: true, handler: () => { const cluster = phase116bClusterFromAny(state.activePromiseCluster); const key = phase116b1PromiseKey(getClusterTitle(cluster), getClusterScriptures(cluster)[0]); const existing = phase116b1SafeArray(state.savedPromiseTableItems).find((row) => phase116b1PromiseKey(row.title, row.scripture) === key); if (existing) return { status: "blocked", detail: "The current promise is already in the table." }; const row = addPromiseTableItem({ id: `promise-current-${phase116b1Hash(key)}`, title: getClusterTitle(cluster), scripture: getClusterScriptures(cluster)[0], status: "Discovered", source: "action-registry" }); pushTeoyubeUndoEntry({ actionId: "promise.add.current", label: row.title, undo: () => { state.savedPromiseTableItems = state.savedPromiseTableItems.filter((item) => item.id !== row.id); } }); setView("table"); return { detail: `${row.title} added to Promise Table.` }; } },
      { id: "book.save.promise", label: "Save to Book", description: "Save the open Promise Table row to Book.", category: "book", reversible: true, handler: ({ trigger }) => { const before = phase116b1SafeArray(state.book).map((item) => item.id); callLegacy("promise-save-book", trigger); const entry = phase116b1SafeArray(state.book).find((item) => !before.includes(item.id)); if (entry) pushTeoyubeUndoEntry({ actionId: "book.save.promise", label: entry.title, undo: () => { state.book = state.book.filter((item) => item.id !== entry.id); } }); return { detail: entry ? `${entry.title} saved to Book.` : "Promise Book state reviewed." }; } },
      { id: "compass.start", label: "Start Calling Compass", description: "Open the cautious, Scripture-tested Calling Compass flow.", category: "calling", handler: () => { startPhase116bCallingCompass(); return { detail: "Calling Compass started with cautious language." }; } },
      { id: "journey.start", label: "Start Journey", description: "Start the current calling or promise journey.", category: "journey", reversible: true, handler: ({ trigger }) => { const before = phase116b1Clone({ activeJourney: state.activeJourney, selectedJourney: state.selectedJourney }); callLegacy("compass-start-journey", trigger); pushTeoyubeUndoEntry({ actionId: "journey.start", label: "Start Journey", undo: () => Object.assign(state, before) }); return { detail: "Journey started for this session." }; } },
      { id: "teo.ask", label: "Ask Teo Guide", description: "Open the local Scripture-grounded guide; no live AI is connected.", category: "guide", handler: () => { setView("guide"); document.querySelector("#chatInput")?.focus(); return { detail: "Local Teo Guide opened." }; } },
      { id: "graph.open", label: "Open Graph", description: "Open the local explanation graph and list fallback.", category: "graph", handler: ({ trigger }) => { callLegacy("open-current-graph", trigger); return { detail: "Explanation graph opened with relationship labels." }; } },
      { id: "personalization.preview", label: "Run Personalized Preview", description: "Open the consent-bound local comparison preview.", category: "personalization", handler: () => { openPhase115ComparisonDialog(); return { detail: "Baseline and optional local preview opened." }; } },
      { id: "guardrails.open", label: "Open Guardrails", description: "Review Scripture, safety, privacy, consent, and calling boundaries.", category: "safety", handler: ({ trigger }) => { openGuardrailsModal(trigger); return { detail: "Guardrails opened." }; } },
      { id: "data.open", label: "Open Data/Export Center", description: "Review safe local export and data controls.", category: "data", handler: () => { openPhase113ExportCenter(); return { detail: "Safe local export center opened." }; } },
      { id: "session.reset", label: "Reset Session", description: "Reset user-created local session state through the existing guarded control.", category: "data", handler: () => { originalHandlePhase116bAction("reset-session"); clearTeoyubeActionHistory(); return { detail: "Local session state reset." }; } },
      { id: "undo.last", label: "Undo Last Action", description: "Reverse the latest supported session action.", category: "history", keyboardShortcut: "Ctrl+Z", disabledReason: () => canUndoTeoyubeAction() ? "" : "No reversible action is available.", handler: () => undoLastTeoyubeAction() },
      { id: "search.everything.open", label: "Search Everything", description: "Search the unified local index without external services.", category: "search", keyboardShortcut: "/", handler: ({ trigger }) => { openPhase116b1UniversalSearch(trigger); return { detail: "Universal local search opened." }; } },
      { id: "media.readiness.open", label: "TeoyubeWorld Media Readiness", description: "Review scanner, validator, schema, and honest zero-media status.", category: "media", handler: ({ trigger }) => { openPhase116b1MediaReadiness(trigger); return { detail: "Media readiness opened; actual imported media remains zero." }; } },
      { id: "responsive.qa.open", label: "Responsive QA Lab", description: "Open the constrained local responsive preview at 390px.", category: "qa", handler: ({ trigger }) => { openPhase116b1ResponsiveQaLab(390, trigger); return { detail: "Responsive QA Lab opened at 390px." }; } },
      { id: "responsive.promise.open", label: "Open Promise Add in 390px", description: "Open the Promise Table Add dialog inside the constrained preview.", category: "qa", handler: () => { setPhase116b1ResponsiveWidth(390); openPromiseAddInsideResponsivePreview(); return { detail: "Promise Add requested inside the 390px preview." }; } },
      { id: "qa.phase116b1.run", label: "Run Phase 11.6B.1 Functional QA", description: "Run structured local readiness checks.", category: "qa", handler: () => { const report = runPhase116b1FunctionalQa(); return report.valid ? { detail: `${report.checks.length} Phase 11.6B.1 checks passed.` } : { status: "error", detail: "One or more Phase 11.6B.1 checks failed." }; } },
      { id: "continuation.journey", label: "Continue Journey", description: "Reopen the current session journey.", category: "continuation", disabledReason: () => getTeoyubeContinuationState().journey ? "" : "No active journey is available.", handler: () => { setView("today"); return { detail: "Active journey reopened." }; } },
      { id: "continuation.complete", label: "Complete Next Action", description: "Complete the next current journey action.", category: "continuation", disabledReason: () => getTeoyubeContinuationState().incompleteAction ? "" : "No incomplete action is available.", handler: () => { completePhase116bTodayAction(); return { detail: "Next action completed." }; } },
      { id: "continuation.scripture", label: "Reopen Scripture", description: "Open the last selected Scripture in local search.", category: "continuation", disabledReason: () => getTeoyubeContinuationState().scripture ? "" : "No Scripture is available.", handler: () => { setView("search"); const input = document.querySelector("#teoyubeSearchInput"); if (input) input.value = getTeoyubeContinuationState().scripture; renderSearchResults(runTeoyubeSearch(input?.value)); return { detail: "Last Scripture reopened." }; } },
      { id: "continuation.promise", label: "Reopen Promise", description: "Open the latest Promise Table item.", category: "continuation", disabledReason: () => getTeoyubeContinuationState().promise ? "" : "No Promise Table item is available.", handler: () => { const promise = getTeoyubeContinuationState().promise; state.phase116bPromiseDetailId = promise.id || ""; setView("table"); return { detail: "Latest promise reopened." }; } },
      { id: "continuation.workflow", label: "Continue Guided Workflow", description: "Resume the latest guided local workflow.", category: "continuation", disabledReason: () => getTeoyubeContinuationState().workflow ? "" : "No guided workflow is active.", handler: () => { openPhase116Workflow(state.phase116ActiveWorkflow || "need-promise"); return { detail: "Guided workflow reopened." }; } },
      { id: "continuation.book", label: "Open Book Timeline", description: "Open Book of the Saint session timeline.", category: "continuation", handler: () => { setView("book"); return { detail: "Book timeline opened." }; } },
      { id: "continuation.clear", label: "Clear Continuation State", description: "Clear active continuation pointers without deleting saved records.", category: "continuation", reversible: true, handler: () => { const before = phase116b1Clone({ activeJourney: state.activeJourney, activeDailyJourney: state.activeDailyJourney, activeWorkflow: state.activeWorkflow, phase116ActiveWorkflow: state.phase116ActiveWorkflow, graphSelection: state.graphSelection }); clearTeoyubeContinuationState(); pushTeoyubeUndoEntry({ actionId: "continuation.clear", label: "Clear Continuation State", undo: () => Object.assign(state, before) }); return { detail: "Continuation pointers cleared; saved records remain." }; } },
      { id: "collection.select", label: "Open Smart Collection", description: "Open a session-only smart collection.", category: "collection", handler: ({ trigger }) => { state.phase116b1SelectedCollectionId = trigger?.dataset.collectionId; return { detail: "Collection opened." }; } },
      { id: "collection.add.current", label: "Add Current Item to Collection", description: "Add a safe record reference to the selected collection.", category: "collection", reversible: true, handler: ({ trigger }) => { const item = phase116b1CurrentCollectionReference(trigger?.dataset.itemType); if (!item) return { status: "blocked", detail: trigger?.dataset.itemType === "media" ? "No TeoyubeWorld media has been imported yet." : "No current item is available." }; const added = addTeoyubeCollectionItem(trigger.dataset.collectionId, item); return added ? { detail: `${item.label} added to collection.` } : { status: "blocked", detail: "That item is already present or unavailable." }; } },
      { id: "collection.remove", label: "Remove Collection Item", description: "Remove a safe reference from a collection.", category: "collection", reversible: true, handler: ({ trigger }) => removeTeoyubeCollectionItem(trigger.dataset.collectionId, trigger.dataset.itemId) ? { detail: "Collection item removed." } : { status: "blocked", detail: "Collection item was not found." } },
      { id: "collection.move", label: "Move Collection Item", description: "Move a reference between session collections.", category: "collection", handler: ({ trigger }) => { const target = trigger.closest("article")?.querySelector("[data-collection-move-target]")?.value; return moveTeoyubeCollectionItem(trigger.dataset.collectionId, target, trigger.dataset.itemId) ? { detail: "Collection item moved." } : { status: "blocked", detail: "Choose another collection for this item." }; } },
      { id: "collection.open", label: "Open Collection Item", description: "Open the referenced local record.", category: "collection", handler: ({ trigger }) => openTeoyubeCollectionItem(trigger.dataset.collectionId, trigger.dataset.itemId) ? { detail: "Collection item opened." } : { status: "blocked", detail: "Referenced item is unavailable." } },
      { id: "collection.rename", label: "Rename Collection", description: "Rename a session-only collection.", category: "collection", handler: ({ trigger }) => renameTeoyubeSmartCollection(trigger.dataset.collectionId, document.querySelector("#phase116b1CollectionRename")?.value) ? { detail: "Collection renamed." } : { status: "blocked", detail: "Enter a valid collection name." } },
      { id: "collection.delete", label: "Delete Collection", description: "Delete a session-only collection and its references.", category: "collection", handler: ({ trigger }) => { const snapshot = phase116b1Clone(getTeoyubeSmartCollections().find((item) => item.id === trigger.dataset.collectionId)); const deleted = deleteTeoyubeSmartCollection(trigger.dataset.collectionId); if (deleted && snapshot) pushTeoyubeUndoEntry({ actionId: "collection.delete", label: `Delete ${snapshot.name}`, undo: () => state.phase116b1SmartCollections.push(snapshot) }); return deleted ? { detail: "Collection deleted; source records remain." } : { status: "blocked", detail: "Collection was not found." }; } },
      { id: "collection.export", label: "Export Collection", description: "Export safe record references without raw private text.", category: "collection", handler: ({ trigger }) => exportTeoyubeSmartCollection(trigger.dataset.collectionId) ? { detail: "Safe collection export created." } : { status: "blocked", detail: "Collection was not found." } }
    ].forEach(registerTeoyubeAction);
  }

  function handlePhase116b1Click(event) {
    document.body.dataset.phase116b1LastClick = event.target?.getAttribute?.("data-teoyube-action") || event.target?.textContent?.trim?.().slice(0, 40) || "unknown";
    const actionTrigger = event.target.closest?.("[data-teoyube-action]");
    if (actionTrigger) {
      document.body.dataset.phase116b1LastAction = actionTrigger.dataset.teoyubeAction || "unknown";
      event.preventDefault();
      dispatchTeoyubeAction(actionTrigger.dataset.teoyubeAction, { trigger: actionTrigger });
      return;
    }
    const widthTrigger = event.target.closest?.("[data-phase116b1-width]");
    if (widthTrigger) {
      event.preventDefault();
      setPhase116b1ResponsiveWidth(widthTrigger.dataset.phase116b1Width);
      return;
    }
    const resultTrigger = event.target.closest?.("[data-teoyube-search-result]");
    if (resultTrigger) {
      event.preventDefault();
      const result = (universalIndexDirty ? buildTeoyubeUniversalIndex() : universalIndex).find((record) => record.id === resultTrigger.dataset.teoyubeSearchResult);
      openTeoyubeSearchResult(result);
      document.querySelector("#phase116b1UniversalSearchDialog")?.close?.();
      return;
    }
    const closeTrigger = event.target.closest?.("[data-phase116b1-close]");
    if (!closeTrigger) return;
    event.preventDefault();
    const type = closeTrigger.dataset.phase116b1Close;
    if (type === "promise") closePhase116b1PromiseDialog();
    if (type === "responsive") closePhase116b1ResponsiveQaLab();
    if (type === "search" || type === "media") closeTrigger.closest("dialog")?.close?.();
  }

  function handlePhase116b1Submit(event) {
    if (event.target?.id === "phase116b1PromiseAddForm") {
      event.preventDefault();
      dispatchTeoyubeAction("promise.add.submit", { form: event.target, trigger: event.submitter });
      return;
    }
    if (event.target?.id === "phase116b1CollectionCreateForm") {
      event.preventDefault();
      const collection = createTeoyubeSmartCollection(event.target.elements.name.value);
      if (collection) {
        state.phase116b1SelectedCollectionId = collection.id;
        recordTeoyubeActionOutcome({ actionId: "collection.create", label: "Create Collection", detail: collection.name });
        phase116b1SaveAndRender();
      }
    }
  }

  function handlePhase116b1Input(event) {
    if (event.target?.id !== "phase116b1UniversalSearchInput" && event.target?.id !== "phase116b1UniversalSearchType") return;
    clearTimeout(universalSearchTimer);
    universalSearchTimer = setTimeout(() => {
      renderPhase116b1SearchResults(document.querySelector("#phase116b1UniversalSearchInput")?.value || "", document.querySelector("#phase116b1UniversalSearchType")?.value || "all");
    }, 140);
  }

  function handlePhase116b1Keydown(event) {
    if (event.key === "Enter" && !event.shiftKey && event.target?.matches?.("#phase116b1PromiseAddForm input:not([type='checkbox'])")) {
      event.preventDefault();
      event.target.form?.requestSubmit();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && event.target?.matches?.("#phase116b1PromiseAddForm textarea")) {
      event.preventDefault();
      event.target.form?.requestSubmit();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.target?.matches?.("input, textarea, [contenteditable='true']")) {
      event.preventDefault();
      dispatchTeoyubeAction("undo.last", { source: "keyboard" });
    }
  }

  try {
    document.body.dataset.phase116b1InitStep = "actions";
    registerPhase116b1Actions();
    ensurePhase116b1State();
    ensurePhase116b1Shell();
    document.body.dataset.phase116b1InitStep = "listeners";
    document.addEventListener("click", handlePhase116b1Click);
    document.addEventListener("submit", handlePhase116b1Submit);
    document.addEventListener("input", handlePhase116b1Input);
    document.addEventListener("change", handlePhase116b1Input);
    document.addEventListener("keydown", handlePhase116b1Keydown);
    document.querySelector("#phase116b1ResponsiveFrame")?.addEventListener("load", inspectPhase116b1ResponsivePreview);

    document.body.dataset.phase116b1InitStep = "exports";
    Object.assign(window, {
      registerTeoyubeAction,
      unregisterTeoyubeAction,
      dispatchTeoyubeAction,
      getTeoyubeAction,
      getAvailableTeoyubeActions,
      getTeoyubeActionDisabledReason,
      recordTeoyubeActionOutcome,
      renderTeoyubeActionStatus,
      pushTeoyubeUndoEntry,
      undoLastTeoyubeAction,
      canUndoTeoyubeAction,
      getRecentTeoyubeActions,
      clearTeoyubeActionHistory,
      renderRecentActionHistory,
      renderUndoToast,
      getTeoyubeSmartCollections,
      createTeoyubeSmartCollection,
      renameTeoyubeSmartCollection,
      deleteTeoyubeSmartCollection,
      addTeoyubeCollectionItem,
      removeTeoyubeCollectionItem,
      moveTeoyubeCollectionItem,
      filterTeoyubeCollectionItems,
      openTeoyubeCollectionItem,
      exportTeoyubeSmartCollection,
      getTeoyubeContinuationState,
      clearTeoyubeContinuationState,
      buildTeoyubeUniversalIndex,
      refreshTeoyubeUniversalIndex,
      tokenizeTeoyubeSearchText,
      scoreTeoyubeSearchRecord,
      searchTeoyubeUniversalIndex,
      getTeoyubeSearchSuggestions,
      groupTeoyubeSearchResults,
      openTeoyubeSearchResult,
      openPhase116b1PromiseDialog,
      openPhase116b1MediaReadiness,
      openPhase116b1ResponsiveQaLab,
      inspectPhase116b1ResponsivePreview,
      runPhase116b1FunctionalQa,
      renderPhase116b1Experience
    });

    document.body.dataset.phase116b1InitStep = "render";
    renderPhase116b1Experience();
    document.body.dataset.phase116b1InitStep = "ready";
  } catch (error) {
    document.body.dataset.phase116b1InitStep = "failed";
    document.body.dataset.phase116b1Error = String(error?.message || error).slice(0, 240);
    console.error("Phase 11.6B.1 initialization failed", error);
  }
})();
