#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const generatedAt = new Date().toISOString();
const startingCommit = "0a98a0ba498315442823dc5469074cd2d8d3ed10";
const branch = "recovery/visual-source-of-truth";
const viewports = ["desktop-wide", "desktop-standard", "tablet-landscape", "tablet-portrait", "mobile", "mobile-small"];
const allRoutes = ["/", "/search", "/canon", "/promise-table", "/calling-compass", "/book", "/lexicon", "/testimony", "/teo-guide", "/embedded-videos", "/tables", "/prayer", "/journey", "/journal", "/settings", "/privacy", "/consent", "/terms", "/profile", "/personalization", "/daily-word", "/explore", "/promise-search"];

const paths = {
  requestRoot: "docs/accessibility/owner-review/requests",
  reviewRoot: "docs/accessibility/owner-review",
  issueRegister: "docs/accessibility/accessibility-issue-register.json",
  automatedEvidence: "docs/accessibility/phase-5a-automated-audit-evidence.json",
  rawAudit: ".tmp/accessibility/phase-5a/current-audit.json"
};

const contracts = {
  protected: "tests/visual/contracts/protected-visual-source-manifest.json",
  dom: "tests/visual/contracts/static-dom-contract.json",
  visual: "tests/visual/contracts/original-static-visual-contract.json",
  staticBaseline: "tests/visual/baselines/static-runtime/manifest.json",
  supportBaseline: "tests/visual/baselines/owner-approved-support-routes/manifest.json",
  nextSupportBaseline: "tests/visual/baselines/owner-approved-next-support/manifest.json",
  scriptureDeltaBaseline: "tests/visual/baselines/owner-approved-scripture-content-delta/manifest.json"
};

const sources = {
  wcag: "https://www.w3.org/TR/WCAG22/",
  aria: "https://www.w3.org/TR/wai-aria-1.2/",
  ariaHtml: "https://www.w3.org/TR/html-aria/",
  apg: "https://www.w3.org/WAI/ARIA/apg/about/introduction/",
  inert: "https://html.spec.whatwg.org/multipage/interaction.html#the-inert-attribute"
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function fileIdentity(relativePath) {
  const buffer = fs.readFileSync(path.join(root, relativePath));
  return Object.freeze({ path: relativePath, bytes: buffer.length, sha256: sha256Buffer(buffer) });
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function hashObject(value) {
  return sha256Buffer(Buffer.from(JSON.stringify(stable(value))));
}

function write(relativePath, text) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, text.endsWith("\n") ? text : `${text}\n`, "utf8");
}

function writeJson(relativePath, value) {
  write(relativePath, JSON.stringify(value, null, 2));
}

const register = readJson(paths.issueRegister);
const issueEvidence = new Map(register.issues.map((issue) => [issue.id, issue]));

function wcag(...criteria) {
  const slugs = {
    "1.2.1": "audio-only-and-video-only-prerecorded",
    "1.2.2": "captions-prerecorded",
    "1.2.3": "audio-description-or-media-alternative-prerecorded",
    "1.2.5": "audio-description-prerecorded",
    "1.3.1": "info-and-relationships",
    "1.4.1": "use-of-color",
    "1.4.3": "contrast-minimum",
    "1.4.11": "non-text-contrast",
    "2.1.1": "keyboard",
    "2.4.3": "focus-order",
    "2.4.6": "headings-and-labels",
    "2.4.7": "focus-visible",
    "2.4.11": "focus-not-obscured-minimum",
    "2.5.8": "target-size-minimum",
    "3.3.2": "labels-or-instructions",
    "4.1.2": "name-role-value",
    "4.1.3": "status-messages"
  };
  return criteria.map((criterion) => `${sources.wcag}#${slugs[criterion]}`);
}

const commonContractSet = [contracts.protected, contracts.dom, contracts.visual, contracts.staticBaseline];
const issueDefinitions = [
  {
    issueId: "A11Y-001",
    phase5aStatus: "confirmed",
    affectedRoutes: ["/lexicon"],
    affectedStates: ["default", "alphabet-filter-selected"],
    affectedViewports: viewports,
    affectedUsers: ["screen-reader users", "speech-input users", "users who rely on accurate role/state announcements"],
    wcagCriteria: ["1.3.1", "4.1.2"],
    normativeSources: [...wcag("1.3.1", "4.1.2"), `${sources.aria}#option`, sources.ariaHtml],
    currentBehavior: "All 27 alphabet controls are role=option elements carrying aria-selected and the unsupported aria-pressed state; axe reports aria-allowed-attr in every audited Lexicon cell.",
    expectedBehavior: "Each option exposes only states supported by the option role, with selection represented by aria-selected and no conflicting pressed state.",
    staticBehavior: "app.js renderLexiconAlphaTabs emits role=option, aria-selected, and aria-pressed; the static click path re-renders the same invalid combination.",
    nextBehavior: "The captured approved markup contains the same combination, and LexiconPageController updates both aria-selected and aria-pressed after activation.",
    parityRelationship: "shared_defect",
    fixClass: "PROTECTED_ATTRIBUTE_CHANGE",
    proposedAction: "In Phase 5C, remove aria-pressed from every role=option alphabet control in the static renderer, approved captured markup, and Next state updater; retain listbox/option, aria-selected, labels, order, click behavior, and pixels.",
    proposedFiles: ["app.js", "src/app/_lexicon/LexiconPageController.tsx", "src/app/_approved-source/approved-view-markup.generated.ts"],
    protectedContractsAffected: commonContractSet,
    expectedPixelImpact: "none",
    expectedDomImpact: "attribute_only",
    expectedBehaviorImpact: "Assistive technologies receive one valid selected state instead of conflicting pressed/selected states; filtering behavior is unchanged.",
    risks: ["Hand-editing only one runtime would preserve the defect in the other runtime.", "Regenerating approved markup outside the owner-scoped parity workflow could change unrelated source."],
    tests: ["axe aria-allowed-attr passes on /lexicon at all six viewports", "27 options retain role=option and exactly one aria-selected=true", "static/Next keyboard and filter behavior remain equivalent", "72 screenshot and protected DOM/class checks rerun"],
    visualEvidenceRequired: true,
    manualAtEvidenceRequired: true,
    implementationBatch: "5C-1",
    rollback: "Revert only the A11Y-001 Phase 5C commit and rerun recovery:verify; never regenerate baselines.",
    recommendation: "APPROVE_RECOMMENDED_PHASE5C_FIX"
  },
  {
    issueId: "A11Y-002",
    phase5aStatus: "confirmed",
    affectedRoutes: ["/"],
    affectedStates: ["default", "promise-carousel-next", "featured-story-next", "autoplay-advance"],
    affectedViewports: viewports,
    affectedUsers: ["keyboard users", "screen-reader users", "switch users"],
    wcagCriteria: ["2.4.3", "4.1.2"],
    normativeSources: [...wcag("2.4.3", "4.1.2"), `${sources.aria}#aria-hidden`, sources.inert],
    currentBehavior: "Inactive promise and featured-story slides are aria-hidden while their links and buttons remain sequentially focusable.",
    expectedBehavior: "Only the active slide contributes operable descendants to the accessibility tree and sequential focus order; activation restores the active controls without changing layout.",
    staticBehavior: "app.js renders inactive .featured-story-slide nodes with aria-hidden=true and focusable descendants; the promise carousel follows the same hidden-focus pattern.",
    nextBehavior: "ApprovedTodayView sets aria-hidden on inactive promise and featured-story articles but renders their buttons/links with normal focusability.",
    parityRelationship: "shared_defect",
    fixClass: "PROTECTED_ATTRIBUTE_CHANGE",
    proposedAction: "In Phase 5C, make inactive slide containers inert while aria-hidden and remove inert when activated in both runtimes; preserve every control, label, transition, timing, and visible slide.",
    proposedFiles: ["app.js", "src/app/_today/ApprovedTodayView.tsx"],
    protectedContractsAffected: commonContractSet,
    expectedPixelImpact: "none",
    expectedDomImpact: "attribute_only",
    expectedBehaviorImpact: "Tab navigation skips inactive slide controls and restores them when their slide becomes active; pointer, autoplay, swipe, and arrow controls remain unchanged.",
    risks: ["Failing to remove inert on activation would block the visible slide.", "Changing carousel timing or rendering would exceed scope."],
    tests: ["axe aria-hidden-focus passes for both carousels in every state and viewport", "Tab order contains controls from the active slide only", "autoplay, arrows, dots, swipe, hover pause, and keyboard arrows remain functional", "72 screenshots and Today parity states rerun"],
    visualEvidenceRequired: true,
    manualAtEvidenceRequired: true,
    implementationBatch: "5C-1",
    rollback: "Revert only the A11Y-002 Phase 5C commit; restore no baseline and rerun recovery:verify.",
    recommendation: "APPROVE_RECOMMENDED_PHASE5C_FIX"
  },
  {
    issueId: "A11Y-003",
    phase5aStatus: "confirmed",
    affectedRoutes: ["/canon"],
    affectedStates: ["default", "media-stage-focused", "media-stage-playing"],
    affectedViewports: viewports,
    affectedUsers: ["keyboard users", "screen-reader users", "switch users", "users sensitive to long tab sequences"],
    wcagCriteria: ["2.4.3", "2.4.6", "4.1.2"],
    normativeSources: [...wcag("2.4.3", "2.4.6", "4.1.2"), `${sources.aria}#button`],
    currentBehavior: "The canonical Next controller makes 11 visible, independently playable media stages keyboard-operable and named. The protected static sequence omits them, creating an exact focus-order parity delta.",
    expectedBehavior: "Every visible independent media action remains pointer and keyboard operable with a durable name, and the static rollback exposes equivalent operability without hidden duplicate targets.",
    staticBehavior: "The same 11 visible media regions have no data-canon-video-stage, role, tabindex, pressed state, accessible play name, or equivalent Enter/Space playback path.",
    nextBehavior: "CanonPageController assigns role=button, tabindex=0, aria-pressed, accessible play labels, click activation, and Enter/Space activation to mappings D02-D12.",
    parityRelationship: "next_accessibility_improvement_with_parity_difference",
    fixClass: "PROTECTED_ATTRIBUTE_CHANGE",
    proposedAction: "In Phase 5C, preserve all 11 Next controls and add equivalent named keyboard-operable semantics and playback behavior to the same visible static media stages. Keep them as 11 separate controls; do not delete them, add hidden duplicates, or use roving tabindex because they are independent actions rather than one composite widget.",
    proposedFiles: ["app.js", "src/app/_canon/CanonPageController.tsx", "src/features/scripture/canon-youtube.ts"],
    protectedContractsAffected: [...commonContractSet, contracts.supportBaseline, contracts.nextSupportBaseline, contracts.scriptureDeltaBaseline],
    expectedPixelImpact: "none",
    expectedDomImpact: "attribute_only",
    expectedBehaviorImpact: "The rollback runtime gains parity with canonical keyboard playback; the canonical Next sequence and visible media remain intact.",
    risks: ["Eleven extra stops are verbose but logically ordered because each action is independent.", "A roving composite would introduce undisclosed arrow-key semantics and hide independent actions from Tab.", "Static playback mapping must be exact; labels must not promise unavailable media."],
    tests: ["11 static and 11 Next stages have matching names, order, role/state, and Enter/Space/click behavior", "no hidden or duplicate focus targets", "72-cell protected visual parity rerun", "105 parity tests rerun", "three-run 216-cell performance/accessibility gate rerun without threshold weakening", "NVDA, Narrator, VoiceOver, and TalkBack tasks in the manual plan"],
    visualEvidenceRequired: true,
    manualAtEvidenceRequired: true,
    implementationBatch: "5C-2",
    rollback: "Revert only the A11Y-003 Phase 5C commit and restore the prior exact static handler/attributes; do not remove the existing Next controls or alter baselines.",
    recommendation: "APPROVE_RECOMMENDED_PHASE5C_FIX"
  },
  {
    issueId: "A11Y-004",
    phase5aStatus: "confirmed",
    affectedRoutes: ["/canon"],
    affectedStates: ["default", "recently-updated-watchman-merged-card"],
    affectedViewports: viewports,
    affectedUsers: ["keyboard users", "screen-reader users", "switch users"],
    wcagCriteria: ["2.4.3", "4.1.2"],
    normativeSources: [...wcag("2.4.3", "4.1.2"), `${sources.aria}#aria-hidden`, sources.inert],
    currentBehavior: "button.canon-recent-merged-row is inside .canon-watchman-story-copy marked aria-hidden=true but remains a native focus target.",
    expectedBehavior: "The hidden copy subtree and its descendants are excluded from focus; the visible Watchman carousel controls remain available.",
    staticBehavior: "app.js emits the aria-hidden wrapper with nested native buttons.",
    nextBehavior: "The approved captured Canon markup carries the same hidden button subtree; the Next controller does not neutralize it.",
    parityRelationship: "shared_defect",
    fixClass: "PROTECTED_ATTRIBUTE_CHANGE",
    proposedAction: "In Phase 5C, apply inert to the existing aria-hidden .canon-watchman-story-copy subtree in static generation and the approved Next capture; do not hide or remove the visible carousel controls.",
    proposedFiles: ["app.js", "src/app/_approved-source/approved-view-markup.generated.ts"],
    protectedContractsAffected: commonContractSet,
    expectedPixelImpact: "none",
    expectedDomImpact: "attribute_only",
    expectedBehaviorImpact: "Hidden duplicate rows leave the Tab order; visible Watchman navigation and selected-card behavior are unchanged.",
    risks: ["Applying inert to the outer card would wrongly disable visible controls.", "Removing the hidden subtree could create structural parity drift."],
    tests: ["custom hidden-focus scan returns no canon-recent-merged-row", "visible Watchman arrows/dots remain operable", "Canon functional and parity suites rerun", "72 screenshots and protected DOM/class checks rerun"],
    visualEvidenceRequired: true,
    manualAtEvidenceRequired: true,
    implementationBatch: "5C-1",
    rollback: "Revert only the A11Y-004 Phase 5C commit and rerun the hidden-focus and recovery checks.",
    recommendation: "APPROVE_RECOMMENDED_PHASE5C_FIX"
  },
  {
    issueId: "A11Y-005",
    phase5aStatus: "confirmed",
    affectedRoutes: ["/lexicon", "/embedded-videos", "/tables"],
    affectedStates: ["default", "search-focused", "filtered-results"],
    affectedViewports: viewports,
    affectedUsers: ["screen-reader users", "speech-input users", "users with cognitive disabilities"],
    wcagCriteria: ["2.4.6", "3.3.2", "4.1.2"],
    normativeSources: [...wcag("2.4.6", "3.3.2", "4.1.2"), sources.ariaHtml],
    currentBehavior: "#lexiconSearchInput, #uiVideoSearch, and #teoyubeTableSearch rely on placeholder text and icon-only wrapping labels, producing no durable accessible name.",
    expectedBehavior: "Each input has a stable route-specific programmatic name that remains available after entry and filtering.",
    staticBehavior: "index.html contains all three unnamed inputs; the static controllers use their IDs but do not name them.",
    nextBehavior: "The approved captured markup reproduces the same inputs, and the route controllers do not add names.",
    parityRelationship: "shared_defect",
    fixClass: "PROTECTED_ATTRIBUTE_CHANGE",
    proposedAction: "In Phase 5C, add route-specific aria-label values to the three existing input elements in the approved source and captured Next artifact; preserve placeholders, IDs, wrappers, styling, filter behavior, and copy.",
    proposedFiles: ["index.html", "src/app/_approved-source/approved-view-markup.generated.ts"],
    protectedContractsAffected: commonContractSet,
    expectedPixelImpact: "none",
    expectedDomImpact: "attribute_only",
    expectedBehaviorImpact: "Inputs become discoverable by name without any visual, query, filtering, or focus change.",
    risks: ["Generic labels could make speech-input commands ambiguous.", "Changing IDs or visible placeholders would exceed scope."],
    tests: ["custom name contract passes for all three IDs in static and Next", "label strings are unique and route-specific", "search/filter browser tests remain green", "72 screenshots and DOM/class contracts rerun"],
    visualEvidenceRequired: true,
    manualAtEvidenceRequired: true,
    implementationBatch: "5C-2",
    rollback: "Revert only the three A11Y-005 attribute additions and regenerate no baseline.",
    recommendation: "APPROVE_RECOMMENDED_PHASE5C_FIX"
  },
  {
    issueId: "A11Y-006",
    phase5aStatus: "confirmed",
    affectedRoutes: ["/testimony"],
    affectedStates: ["default", "drafts-tab"],
    affectedViewports: ["mobile", "mobile-small"],
    affectedUsers: ["keyboard users", "switch users", "screen-magnifier users"],
    wcagCriteria: ["2.1.1"],
    normativeSources: wcag("2.1.1"),
    currentBehavior: "The horizontally scrollable .testimony-milestones region has neither a focusable region target nor focusable content in the audited states.",
    expectedBehavior: "Keyboard users can focus the existing region and scroll it with standard keys while the visual milestone layout remains unchanged.",
    staticBehavior: "index.html provides the scroll region without tabindex or a programmatic region label.",
    nextBehavior: "The approved captured Testimony markup reproduces the same non-focusable scroll region.",
    parityRelationship: "shared_defect",
    fixClass: "PROTECTED_ATTRIBUTE_CHANGE",
    proposedAction: "In Phase 5C, add tabindex=0, role=region, and a concise aria-label to the existing .testimony-milestones container in approved source and Next capture; preserve children, order, overflow, and pixels.",
    proposedFiles: ["index.html", "src/app/_approved-source/approved-view-markup.generated.ts"],
    protectedContractsAffected: commonContractSet,
    expectedPixelImpact: "none",
    expectedDomImpact: "attribute_only",
    expectedBehaviorImpact: "The milestone strip becomes keyboard-scrollable; testimony state and user data behavior are unchanged.",
    risks: ["A visible default outline must remain within the card and not be clipped.", "Adding extra nested focus targets would make traversal noisy."],
    tests: ["axe scrollable-region-focusable passes in default and Drafts states", "Arrow keys scroll the focused region at mobile widths", "focus indicator is visible and unobscured", "Testimony functional and screenshot parity suites rerun"],
    visualEvidenceRequired: true,
    manualAtEvidenceRequired: true,
    implementationBatch: "5C-2",
    rollback: "Revert only the A11Y-006 attributes and rerun Testimony and recovery checks.",
    recommendation: "APPROVE_RECOMMENDED_PHASE5C_FIX"
  },
  {
    issueId: "A11Y-007",
    phase5aStatus: "confirmed",
    affectedRoutes: ["/", "/book", "/canon", "/explore"],
    affectedStates: ["default", "carousel-pagination", "memory-filtering", "explore-tab-selection"],
    affectedViewports: viewports,
    affectedUsers: ["touch users", "users with limited dexterity", "users with tremor", "users on small screens"],
    wcagCriteria: ["2.5.8"],
    normativeSources: wcag("2.5.8"),
    currentBehavior: "Audited carousel dots, Book memory filters/chips, and Explore tabs are smaller than 24 by 24 CSS pixels or lack sufficient spacing; Phase 5A recorded 289 repeated node occurrences.",
    expectedBehavior: "Each affected target either reaches 24 by 24 CSS pixels or satisfies the WCAG spacing exception without obscuring neighbors or changing control meaning.",
    staticBehavior: "Protected Today, Book, and Canon CSS renders the same undersized targets; /explore is a Next-only support route with 23px-high tabs.",
    nextBehavior: "The canonical runtime inherits the protected page CSS and renders the same failures; /explore uses src/app/globals.css.",
    parityRelationship: "shared_defect",
    fixClass: "LAYOUT_OR_COMPONENT_CHANGE",
    proposedAction: "In Phase 5C, enlarge only the interactive hit areas for Today carousel dots, Canon Watchman dots, Book memory chips/filters, and Explore tabs to at least 24 by 24 CSS pixels, using transparent padding or pseudo hit areas where pixels can remain stable; any visible geometry change must remain within this exact selector scope.",
    proposedFiles: ["styles/pages/today.css", "styles/pages/book.css", "styles/pages/canon.css", "src/app/globals.css", "src/components/teoyube/ExploreTabs.tsx"],
    protectedContractsAffected: [...commonContractSet, contracts.nextSupportBaseline],
    expectedPixelImpact: "possible",
    expectedDomImpact: "none",
    expectedBehaviorImpact: "Control activation and selection stay unchanged while pointer/touch hit areas become usable.",
    risks: ["Visible spacing may shift at narrow widths.", "Overlapping transparent hit areas could activate the wrong target.", "Broad button rules could alter unrelated pages."],
    tests: ["axe target-size passes for exact registered selectors at all six viewports", "hit areas do not overlap and activate the correct target", "320px reflow and 200% layout remain overflow-free", "72 screenshots plus owner-approved support-route candidates are reviewed without baseline replacement", "physical touch-device task validates activation"],
    visualEvidenceRequired: true,
    manualAtEvidenceRequired: true,
    implementationBatch: "5C-3",
    rollback: "Revert only the selector-scoped A11Y-007 CSS/component commit; leave baselines unchanged.",
    recommendation: "APPROVE_RECOMMENDED_PHASE5C_FIX"
  },
  {
    issueId: "A11Y-008",
    phase5aStatus: "confirmed",
    affectedRoutes: ["/canon"],
    affectedStates: ["default", "D02-in-progress", "D05-in-progress"],
    affectedViewports: ["desktop-wide"],
    affectedUsers: ["users with low vision", "users with color-vision deficiency", "users in glare or low-contrast environments"],
    wcagCriteria: ["1.4.3"],
    normativeSources: wcag("1.4.3"),
    currentBehavior: "The D02 and D05 .canon-status.in-progress labels are computed against a white background at approximately 1.01:1 in the current audited state.",
    expectedBehavior: "Status text and its actual background meet at least 4.5:1 for this small text in every rendered state.",
    staticBehavior: "The protected Canon stylesheet supplies the same status colors to the static rollback.",
    nextBehavior: "The canonical Next Canon page loads the same protected stylesheet and reproduces the failure.",
    parityRelationship: "shared_defect",
    fixClass: "LAYOUT_OR_COMPONENT_CHANGE",
    proposedAction: "In Phase 5C, correct only .canon-status.in-progress foreground/background rendering so the measured pair reaches at least 4.5:1; retain the In Progress text, badge dimensions, status meaning, and all other status colors.",
    proposedFiles: ["styles/pages/canon.css"],
    protectedContractsAffected: [...commonContractSet, contracts.scriptureDeltaBaseline],
    expectedPixelImpact: "certain",
    expectedDomImpact: "none",
    expectedBehaviorImpact: "No functional behavior changes; the two status badges become readable.",
    risks: ["A color change is visible and requires exact owner approval.", "Changing shared variables could affect other badges, so the selector must remain exact."],
    tests: ["computed contrast is at least 4.5:1 for D02 and D05 across six viewports and forced colors", "completed/planning/review/on-hold badges remain unchanged", "Canon screenshots and protected/owner-approved parity evidence rerun", "manual complex-background contrast task completes"],
    visualEvidenceRequired: true,
    manualAtEvidenceRequired: true,
    implementationBatch: "5C-3",
    rollback: "Revert only the A11Y-008 selector change; never replace the Canon baseline.",
    recommendation: "APPROVE_RECOMMENDED_PHASE5C_FIX"
  },
  {
    issueId: "A11Y-009",
    phase5aStatus: "manual_evidence_gap",
    affectedRoutes: allRoutes,
    affectedStates: ["default", "forced-colors", "focused", "hovered", "disabled", "selected", "expanded", "modal-or-drawer-open"],
    affectedViewports: viewports,
    affectedUsers: ["users with low vision", "users with color-vision deficiency", "Windows high-contrast users"],
    wcagCriteria: ["1.4.1", "1.4.3", "1.4.11"],
    normativeSources: wcag("1.4.1", "1.4.3", "1.4.11"),
    currentBehavior: "axe returned 3,674 incomplete contrast nodes where gradients, imagery, pseudo-elements, or stateful surfaces prevent a conclusive automated measurement.",
    expectedBehavior: "A trained reviewer measures text and non-text contrast in every enumerated complex-background/state sample and records reproducible results without private content.",
    staticBehavior: "Static protected views contain the same imagery and complex backgrounds; no manual result exists.",
    nextBehavior: "Next current routes inherit or reproduce those surfaces; forced-colors capture alone is not a human pass.",
    parityRelationship: "not_a_parity_issue",
    fixClass: "MANUAL_EVIDENCE_TASK",
    proposedAction: "Approve A11Y-MANUAL-001. Do not infer a pass from axe incomplete nodes; open a new issue-specific proposal for any confirmed contrast defect.",
    proposedFiles: [],
    protectedContractsAffected: [],
    expectedPixelImpact: "none",
    expectedDomImpact: "none",
    expectedBehaviorImpact: "Evidence only; product behavior does not change.",
    risks: ["Declaring conformance without measurements would be false.", "Testing with private user content is prohibited."],
    tests: ["A11Y-MANUAL-001 produces route/state/viewport measurements with tool and OS versions", "all failures become new hash-bound issue records"],
    visualEvidenceRequired: true,
    manualAtEvidenceRequired: false,
    rollback: "Remove only inaccurate Phase 5B manual evidence records; never alter product or baselines.",
    recommendation: "APPROVE_MANUAL_EVIDENCE_TASK"
  },
  {
    issueId: "A11Y-010",
    phase5aStatus: "manual_evidence_gap",
    affectedRoutes: allRoutes,
    affectedStates: ["default", "keyboard-traversal", "sticky-header", "drawer-open", "modal-open", "carousel-advanced", "validation-error"],
    affectedViewports: viewports,
    affectedUsers: ["keyboard users", "screen-magnifier users", "users with low vision", "switch users"],
    wcagCriteria: ["2.4.7", "2.4.11"],
    normativeSources: wcag("2.4.7", "2.4.11"),
    currentBehavior: "Automated computed-style checks found no missing focus indicator, but hit-testing reported candidates whose real visibility/obscuration cannot be determined without human review.",
    expectedBehavior: "Every sequentially focused element has a visible indicator and is not entirely hidden by sticky or overlay content at all required viewports.",
    staticBehavior: "The static rollback has protected focus styles and sticky surfaces but no completed human review.",
    nextBehavior: "The canonical Next runtime has the same requirement plus documented focus-order deltas; automated candidates are not a pass/fail decision.",
    parityRelationship: "not_a_parity_issue",
    fixClass: "MANUAL_EVIDENCE_TASK",
    proposedAction: "Approve A11Y-MANUAL-002. Review every route/state with keyboard-only traversal and record clipped, obscured, or ambiguous focus cases as separate issue proposals.",
    proposedFiles: [],
    protectedContractsAffected: [],
    expectedPixelImpact: "none",
    expectedDomImpact: "none",
    expectedBehaviorImpact: "Evidence only; product behavior does not change.",
    risks: ["Automated hit testing can over-report during scroll transitions.", "A human pass must not hide confirmed A11Y-002, A11Y-003, or A11Y-004 defects."],
    tests: ["A11Y-MANUAL-002 covers every route and required state", "evidence includes focused selector, viewport, scroll position, and outcome only"],
    visualEvidenceRequired: true,
    manualAtEvidenceRequired: false,
    rollback: "Remove only inaccurate evidence records; preserve raw audit evidence and product source.",
    recommendation: "APPROVE_MANUAL_EVIDENCE_TASK"
  },
  {
    issueId: "A11Y-011",
    phase5aStatus: "manual_evidence_gap",
    affectedRoutes: ["/", "/canon", "/promise-table", "/calling-compass", "/embedded-videos", "/tables"],
    affectedStates: ["media-selected", "playback-started", "playback-paused", "media-error", "carousel-next", "status-announced"],
    affectedViewports: viewports,
    affectedUsers: ["blind users", "screen-reader users", "Deaf and hard-of-hearing users", "users who cannot use a pointer", "users with cognitive disabilities"],
    wcagCriteria: ["1.2.1", "1.2.2", "1.2.3", "1.2.5", "2.1.1", "4.1.3"],
    normativeSources: wcag("1.2.1", "1.2.2", "1.2.3", "1.2.5", "2.1.1", "4.1.3"),
    currentBehavior: "External media requests were intentionally blocked and no observable spoken-output session was available; captions, alternatives, third-party control keyboard behavior, and live announcements remain unverified.",
    expectedBehavior: "Every verified media source supplies the required alternative/captions/audio-description path, is operable without a pointer, and exposes meaningful status changes in supported AT/browser combinations.",
    staticBehavior: "The rollback contains the media surfaces but no current real-AT or external-player validation.",
    nextBehavior: "Next contains current YouTube integrations and named controls, but headless DOM checks cannot establish spoken output or the availability/quality of media alternatives.",
    parityRelationship: "not_a_parity_issue",
    fixClass: "MANUAL_EVIDENCE_TASK",
    proposedAction: "Approve A11Y-MANUAL-003 through A11Y-MANUAL-009. Do not alter media sources or claim conformance until browser/AT and alternatives evidence is complete.",
    proposedFiles: [],
    protectedContractsAffected: [],
    expectedPixelImpact: "none",
    expectedDomImpact: "none",
    expectedBehaviorImpact: "Evidence only; playback and data boundaries do not change.",
    risks: ["Third-party player behavior can vary by platform and account state.", "Review must not capture personal account data or private content.", "Unavailable AT must remain NOT TESTED."],
    tests: ["A11Y-MANUAL-003 through A11Y-MANUAL-008 record spoken-output and keyboard results", "A11Y-MANUAL-009 inventories captions/transcripts/audio-description or equivalent alternatives for each exact video mapping"],
    visualEvidenceRequired: false,
    manualAtEvidenceRequired: true,
    rollback: "Remove only inaccurate evidence records; do not change media mappings, source, or baseline from this evidence task.",
    recommendation: "APPROVE_MANUAL_EVIDENCE_TASK"
  }
];

const issues = issueDefinitions.map((definition) => {
  const evidence = issueEvidence.get(definition.issueId);
  if (!evidence) throw new Error(`Missing Phase 5A evidence for ${definition.issueId}`);
  const record = {
    schemaVersion: 1,
    issueId: definition.issueId,
    title: evidence.title,
    severity: evidence.severity,
    phase5aStatus: definition.phase5aStatus,
    phase5aEvidence: { classification: evidence.classification, summary: evidence.evidence, registerPath: paths.issueRegister },
    ...definition,
    ownerDecision: "PENDING"
  };
  const proposalBinding = {
    issueEvidence: record.phase5aEvidence,
    proposedAction: record.proposedAction,
    affectedFiles: record.proposedFiles,
    protectedContracts: record.protectedContractsAffected,
    testPlan: record.tests,
    rollback: record.rollback
  };
  return Object.freeze({ ...record, proposalHash: hashObject(proposalBinding) });
});

const manualTaskDefinitions = [
  ["A11Y-MANUAL-001", ["A11Y-009"], "Complex-background and forced-colors contrast review", "Windows 11; exact build recorded at execution", "Edge and Chrome; exact versions recorded", "Windows Forced Colors plus a calibrated contrast-measurement tool", allRoutes, ["default", "hover", "focus", "selected", "disabled", "expanded", "forced-colors"], "Measure representative text, icons, focus indicators, boundaries, and controls over imagery/gradients at all six viewports; record foreground/background samples and ratios."],
  ["A11Y-MANUAL-002", ["A11Y-010"], "Keyboard focus visibility and obscuration review", "Windows 11 and one physical small-screen device; exact versions recorded", "Edge, Chrome, and Firefox; exact versions recorded", "Keyboard only; screen magnifier optional and version recorded", allRoutes, ["default", "carousel-advanced", "drawer-open", "modal-open", "validation-error"], "Traverse forward and backward without a pointer; record every focused selector, visible indicator, scroll position, and whether sticky/overlay content entirely obscures it."],
  ["A11Y-MANUAL-003", ["A11Y-003", "A11Y-011"], "NVDA and Chrome media/control announcement review", "Windows 11; exact build recorded", "Chrome current stable; exact version recorded", "NVDA installed by tester; exact version recorded", ["/", "/canon", "/promise-table", "/calling-compass", "/embedded-videos", "/tables"], ["media-selected", "playback-started", "playback-error", "status-announced"], "Navigate and activate every representative media control with keyboard commands; record name, role, state, focus order, status announcement, and whether control purpose is distinguishable."],
  ["A11Y-MANUAL-004", ["A11Y-003", "A11Y-011"], "NVDA and Firefox media/control announcement review", "Windows 11; exact build recorded", "Firefox current stable; exact version recorded", "NVDA installed by tester; exact version recorded", ["/", "/canon", "/promise-table", "/calling-compass", "/embedded-videos", "/tables"], ["media-selected", "playback-started", "playback-error", "status-announced"], "Repeat the media/control script in Firefox and record browser-specific differences without inferring equivalence from Chrome."],
  ["A11Y-MANUAL-005", ["A11Y-003", "A11Y-011"], "Narrator and Edge media/control announcement review", "Windows 11; exact build recorded", "Edge current stable; exact version recorded", "Windows Narrator; exact OS-provided version recorded", ["/", "/canon", "/promise-table", "/calling-compass", "/embedded-videos", "/tables"], ["media-selected", "playback-started", "playback-error", "status-announced"], "Repeat the media/control script with scan and keyboard modes; record spoken names/roles/states and live-status behavior."],
  ["A11Y-MANUAL-006", ["A11Y-003", "A11Y-011"], "VoiceOver and macOS Safari media/control review", "macOS physical device; exact version recorded", "Safari current stable for installed macOS; exact version recorded", "VoiceOver; exact OS-provided version recorded", ["/", "/canon", "/promise-table", "/calling-compass", "/embedded-videos", "/tables"], ["media-selected", "playback-started", "playback-error", "status-announced"], "Use VoiceOver navigation and keyboard activation; record discoverability, names, states, order, player entry/exit, and announcements."],
  ["A11Y-MANUAL-007", ["A11Y-011"], "VoiceOver and iOS Safari touch media review", "Physical iPhone or iPad; exact model and iOS version recorded", "iOS Safari; exact version recorded", "VoiceOver; exact OS-provided version recorded", ["/", "/canon", "/promise-table", "/calling-compass", "/embedded-videos", "/tables"], ["media-selected", "playback-started", "orientation-change", "player-dismissed"], "Explore by touch and swipe; activate each representative player, verify focus returns predictably, and record captions/alternative access without account data."],
  ["A11Y-MANUAL-008", ["A11Y-011"], "TalkBack and Android Chrome touch media review", "Physical Android device; exact model and Android version recorded", "Android Chrome current stable; exact version recorded", "TalkBack; exact version recorded", ["/", "/canon", "/promise-table", "/calling-compass", "/embedded-videos", "/tables"], ["media-selected", "playback-started", "orientation-change", "player-dismissed"], "Explore by touch and swipe; activate each representative player, verify focus return and announcements, and record exact failures."],
  ["A11Y-MANUAL-009", ["A11Y-011"], "Exact media-alternatives inventory", "Any owner-approved test workstation; exact OS recorded", "A supported browser; exact version recorded", "Human media accessibility reviewer", ["/", "/canon", "/promise-table", "/calling-compass", "/embedded-videos", "/tables"], ["each exact mapped video", "captions-on", "captions-off", "transcript-or-alternative-open"], "For every exact video mapping, verify prerecorded captions, transcript/media alternative, audio-description need and provision, keyboard player controls, language, synchronization, and failure fallback." ]
];

const manualTasks = manualTaskDefinitions.map(([taskId, relatedIssueIds, title, platform, browser, assistiveTechnology, routes, states, taskScript]) => {
  const task = {
    schemaVersion: 1,
    taskId,
    relatedIssueIds,
    title,
    platform,
    browser,
    assistiveTechnology,
    version: "No version was available or claimed in Phase 5B; the runner must record exact installed versions before testing.",
    routes,
    states,
    taskScript,
    expectedResult: "Every tested control/content path satisfies the related WCAG criteria with no fabricated or inferred result; unavailable coverage remains NOT TESTED.",
    safeEvidenceFields: ["task ID", "issue IDs", "date/time", "tester role", "OS/device/browser/AT versions", "route", "state", "viewport", "selector or public control label", "expected result", "observed result", "PASS/FAIL/NOT_TESTED", "sanitized note", "evidence hash"],
    prohibitedContent: ["participant identity", "email/account identifiers", "private prayer, journal, testimony, health, trauma, abuse, relationship, crisis, or memory content", "credentials or tokens", "personal filenames", "recordings without separate consent"],
    passFailCriteria: "PASS only when the exact environment was used and every scripted result is observed; FAIL on any criterion violation; NOT_TESTED when the environment or result is unavailable.",
    whoMayRun: "The owner or an owner-appointed trained accessibility tester using synthetic scenarios only.",
    productSourceMayChangeBeforeComplete: "Issue-specific approved fixes may proceed, but this task must be rerun against the final candidate and remains required before any WCAG conformance claim.",
    blocks: "Blocks WCAG conformance and Phase 5 closeout; it does not automatically block unrelated, already approved fixes.",
    recommendation: "APPROVE_MANUAL_EVIDENCE_TASK",
    ownerDecision: "PENDING"
  };
  return Object.freeze({ ...task, taskHash: hashObject(task) });
});

function issueMarkdown(issue) {
  const bullets = (items) => items.map((item) => `- ${item}`).join("\n");
  return `# ${issue.issueId} - ${issue.title}\n\nOwner-review request only. This is not an approval and implements no fix.\n\n- Severity: **${issue.severity.toUpperCase()}**\n- Current status: **${issue.phase5aStatus}**\n- Owner decision: **PENDING**\n- Proposal hash: \`${issue.proposalHash}\`\n- Recommended decision: **${issue.recommendation}**\n\n## Scope\n\n- Routes: ${issue.affectedRoutes.map((route) => `\`${route}\``).join(", ")}\n- States: ${issue.affectedStates.map((state) => `\`${state}\``).join(", ")}\n- Viewports: ${issue.affectedViewports.join(", ")}\n- Affected users: ${issue.affectedUsers.join(", ")}\n- WCAG 2.2 A/AA: ${issue.wcagCriteria.join(", ")}\n- Parity classification: \`${issue.parityRelationship}\`\n- Fix class: \`${issue.fixClass}\`\n\n## Before-state evidence\n\n${issue.phase5aEvidence.summary}\n\n- Current behavior: ${issue.currentBehavior}\n- Expected behavior: ${issue.expectedBehavior}\n- Static rollback: ${issue.staticBehavior}\n- Canonical Next: ${issue.nextBehavior}\n\n## Proposed minimal action\n\n${issue.proposedAction}\n\nLikely files:\n\n${issue.proposedFiles.length ? bullets(issue.proposedFiles.map((file) => `\`${file}\``)) : "- None; evidence task only."}\n\nProtected contracts involved:\n\n${issue.protectedContractsAffected.length ? bullets(issue.protectedContractsAffected.map((file) => `\`${file}\``)) : "- None; evidence task only."}\n\n## Expected impact\n\n- Pixel impact: **${issue.expectedPixelImpact}**\n- DOM/ARIA impact: **${issue.expectedDomImpact}**\n- Product behavior: ${issue.expectedBehaviorImpact}\n- Visual evidence required: **${issue.visualEvidenceRequired ? "YES" : "NO"}**\n- Manual AT evidence required: **${issue.manualAtEvidenceRequired ? "YES" : "NO"}**\n- Proposed Phase 5C batch: **${issue.implementationBatch || "none - manual evidence"}**\n\n## Risks\n\n${bullets(issue.risks)}\n\n## Required tests\n\n${bullets(issue.tests)}\n\n## Normative references\n\n${bullets(issue.normativeSources.map((source) => `[${source}](${source})`))}\n\n## Rollback\n\n${issue.rollback}\n\n## Hash boundary\n\nThe proposal hash binds the Phase 5A issue evidence, proposed action, affected files, protected contracts, test plan, and rollback. A changed proposal requires a new owner decision. Silence or a blanket approval is invalid.\n`;
}

function generate() {
  const evidenceFiles = [
    "docs/recovery/9of10-phase-5a-accessibility-audit-report.md",
    "docs/recovery/9of10-phase-5a-accessibility-audit-report.json",
    paths.issueRegister,
    "docs/accessibility/wcag-2.2-aa-conformance-matrix.json",
    "docs/accessibility/canon-media-control-focus-analysis.json",
    "docs/accessibility/accessibility-route-state-matrix.json",
    paths.automatedEvidence,
    "config/runtime/canonical-runtime-manifest.json"
  ];
  const baselineFiles = Object.values(contracts);
  const runtime = readJson("config/runtime/canonical-runtime-manifest.json");
  const startingManifest = {
    schemaVersion: 1,
    phase: "5B",
    status: "STARTING_EVIDENCE_LOCKED",
    generatedAt,
    branch,
    startingCommit,
    prePhaseTag: "teoyube-9of10-phase5b-start-0a98a0b",
    phase5aCounts: { total: 11, critical: 1, high: 8, medium: 2, confirmed: 8, manualEvidenceGaps: 3 },
    runtime: { canonical: runtime.canonicalRuntime, rollback: runtime.rollbackRuntime, runtimeSourceDigest: runtime.runtimeSourceDigest, deterministicBuildId: runtime.nextBuildId, publicRouteCount: runtime.publicRoutes.length },
    evidenceFiles: evidenceFiles.map(fileIdentity),
    protectedAndBaselineFiles: baselineFiles.map(fileIdentity),
    rawAudit: fs.existsSync(path.join(root, paths.rawAudit)) ? fileIdentity(paths.rawAudit) : { path: paths.rawAudit, status: "IGNORED_EVIDENCE_NOT_PRESENT" },
    currentBlockerIds: ["9R-02", "9R-04", "9R-05", "9R-06", "9R-07", "9R-08", "9R-09", "9R-10", "9R-11", "9R-12", "9R-13", "9R-14", "9R-15"],
    standards: [
      { name: "WCAG", version: "2.2", status: "W3C Recommendation", date: "2024-12-12", url: sources.wcag },
      { name: "WAI-ARIA", version: "1.2", status: "W3C Recommendation", date: "2023-06-06", url: sources.aria },
      { name: "ARIA in HTML", version: "current", status: "W3C Recommendation", date: "2026-04-15", url: sources.ariaHtml },
      { name: "ARIA Authoring Practices Guide", version: "current", status: "informative, non-normative", checkedAt: generatedAt, url: sources.apg }
    ],
    invariants: { productFixes: 0, productSourceChanges: 0, protectedVisualChanges: 0, baselineChanges: 0, packageLockChanges: 0, paidCalls: 0, phase5cStarted: false }
  };
  writeJson("docs/accessibility/phase-5b-starting-manifest.json", startingManifest);

  for (const issue of issues) {
    writeJson(`${paths.requestRoot}/${issue.issueId}.json`, issue);
    write(`${paths.requestRoot}/${issue.issueId}.md`, issueMarkdown(issue));
  }

  const canonIssue = issues.find((issue) => issue.issueId === "A11Y-003");
  const canonDecision = {
    schemaVersion: 1,
    decisionId: "A11Y-003-CANON-FOCUS-PRODUCT-DECISION",
    issueId: canonIssue.issueId,
    proposalHash: canonIssue.proposalHash,
    status: "PENDING",
    answers: {
      controlsVisible: true,
      controlModel: "Eleven visible, independent media playback actions; not one composite widget.",
      pointerOperableNext: true,
      keyboardOperableNext: true,
      accessibleNamesNext: true,
      focusSequenceAssessment: "Verbose but logically correct: each independently playable card is a separate action in document order.",
      rovingTabindexAppropriate: false,
      rovingReason: "Roving tabindex would falsely impose composite-widget semantics and remove independent actions from normal Tab discovery.",
      staticSequenceAccessible: false,
      staticReason: "The static rollback omits the visible controls from keyboard access and does not provide equivalent named Enter/Space activation.",
      nextMoreAccessibleButParityDifferent: true,
      hiddenOrInertViolation: "A11Y-003 itself is not an aria-hidden/inert violation; A11Y-004 separately covers a hidden Canon button.",
      requiredOwnerDecision: "Approve preserving all 11 Next controls and adding equivalent static keyboard/playback semantics to the same visible stages, pixel-identically, in Phase 5C batch 2.",
      pixelsPreserved: true,
      technicalImpact: "DOM attributes and keyboard behavior; no structural or visual change is proposed.",
      requiredGates: ["72-cell protected visual/parity evidence", "105 parity tests", "three consecutive 216-cell performance/accessibility runs", "manual NVDA, Narrator, VoiceOver, and TalkBack tasks"]
    },
    exclusions: ["Do not delete visible controls", "Do not create hidden duplicate controls", "Do not use roving tabindex", "Do not update baselines", "Do not begin Phase 5C automatically"],
    recommendation: "APPROVE_RECOMMENDED_PHASE5C_FIX",
    ownerDecision: "PENDING"
  };
  writeJson(`${paths.reviewRoot}/canon-focus-owner-decision.json`, canonDecision);
  write(`${paths.reviewRoot}/canon-focus-owner-decision.md`, `# Canon focus owner decision\n\nStatus: **PENDING**\nIssue: **A11Y-003**\nProposal hash: \`${canonIssue.proposalHash}\`\n\n## Findings\n\n- The eleven media stages are visible and independently playable, not one composite widget.\n- Canonical Next supports pointer, Enter, Space, durable names, and pressed state.\n- The tab sequence is verbose but logical because each media action is distinct.\n- Roving tabindex is not appropriate: it would invent composite semantics and reduce normal Tab discovery.\n- The static rollback omits those visible actions from keyboard access.\n- Next is more accessible but is not focus-order parity-equivalent.\n- A11Y-003 is not an aria-hidden/inert violation; A11Y-004 separately covers the hidden Canon row.\n\n## Recommended product decision\n\n**APPROVE_RECOMMENDED_PHASE5C_FIX** for the exact hash above: preserve the eleven Next controls and add equivalent named keyboard/playback semantics to the same visible static stages in Phase 5C batch 2. Preserve pixels; change only attributes and keyboard behavior. Do not delete controls, add hidden duplicates, use roving tabindex, or update a baseline.\n\n## Required later gates\n\n- 72 protected visual/parity cells\n- 105 parity tests\n- Three consecutive 216-cell performance/accessibility runs\n- NVDA, Narrator, VoiceOver, and TalkBack tasks from the manual plan\n`);

  const manualPlan = { schemaVersion: 1, generatedAt, status: "PENDING_OWNER", issueIds: ["A11Y-009", "A11Y-010", "A11Y-011"], tasks: manualTasks, resultRules: { unavailable: "NOT_TESTED", syntheticScenariosOnly: true, privateContentAllowed: false, conformanceClaimBeforeCompletion: false } };
  writeJson(`${paths.reviewRoot}/manual-evidence-plan.json`, manualPlan);
  write(`${paths.reviewRoot}/manual-evidence-plan.md`, `# Phase 5B manual accessibility evidence plan\n\nStatus: **PENDING OWNER DECISIONS**. Unavailable environments remain **NOT TESTED**. No private user content is permitted.\n\n${manualTasks.map((task) => `## ${task.taskId} - ${task.title}\n\n- Related issues: ${task.relatedIssueIds.join(", ")}\n- Platform: ${task.platform}\n- Browser: ${task.browser}\n- Assistive technology: ${task.assistiveTechnology}\n- Version rule: ${task.version}\n- Routes: ${task.routes.join(", ")}\n- States: ${task.states.join(", ")}\n- Script: ${task.taskScript}\n- Expected result: ${task.expectedResult}\n- Safe evidence fields: ${task.safeEvidenceFields.join("; ")}\n- Prohibited content: ${task.prohibitedContent.join("; ")}\n- Pass/fail: ${task.passFailCriteria}\n- Who may run: ${task.whoMayRun}\n- Product source before completion: ${task.productSourceMayChangeBeforeComplete}\n- Blocks: ${task.blocks}\n- Task hash: \`${task.taskHash}\`\n- Owner decision: **PENDING**\n- Recommendation: **APPROVE_MANUAL_EVIDENCE_TASK**\n`).join("\n")}`);

  const batches = [
    { batchId: "5C-1", title: "Critical and hidden-focus barriers", issueIds: ["A11Y-001", "A11Y-002", "A11Y-004"], entry: "Each issue has an explicit matching-hash owner approval.", requiredChecks: ["pre-tag", "focused axe/custom contracts", "keyboard tests", "72 protected screenshots", "DOM/class/asset contracts", "recovery:verify"], stop: "Stop after this batch; do not continue automatically." },
    { batchId: "5C-2", title: "Keyboard, name, role, and focus parity", issueIds: ["A11Y-003", "A11Y-005", "A11Y-006"], entry: "Each issue has an explicit matching-hash owner approval; Canon decision is approved.", requiredChecks: ["pre-tag", "focused functional/browser tests", "72/105 parity evidence", "three-run 216-cell gate for Canon", "manual AT tasks as applicable", "recovery:verify"], stop: "Stop after this batch; do not continue automatically." },
    { batchId: "5C-3", title: "Target size and contrast refinements", issueIds: ["A11Y-007", "A11Y-008"], entry: "Each issue has an explicit matching-hash owner approval, including the documented possible/certain pixel impact.", requiredChecks: ["pre-tag", "axe target-size and contrast", "forced colors", "320px/200% reflow", "72 and owner-approved screenshot candidates", "manual contrast/touch checks", "recovery:verify"], stop: "Stop after this batch; do not continue automatically." }
  ];
  const batchPlan = { schemaVersion: 1, generatedAt, status: "PROPOSED_NOT_AUTHORIZED", batches, manualEvidenceIssueIds: ["A11Y-009", "A11Y-010", "A11Y-011"], rules: ["One batch per Codex task", "No issue enters a batch without matching proposal-hash approval", "Baselines are immutable", "Manual gaps are evidence tasks, not silent fixes", "Phase 5C does not start from an owner decision alone"] };
  writeJson("docs/accessibility/phase-5c-proposed-batches.json", batchPlan);
  write("docs/accessibility/phase-5c-proposed-batches.md", `# Proposed Phase 5C implementation batches\n\nStatus: **PROPOSED - NOT AUTHORIZED**\n\n${batches.map((batch) => `## Batch ${batch.batchId} - ${batch.title}\n\n- Issues: ${batch.issueIds.join(", ")}\n- Entry: ${batch.entry}\n- Checks: ${batch.requiredChecks.join("; ")}\n- Stop rule: ${batch.stop}\n`).join("\n")}\nManual evidence issues A11Y-009, A11Y-010, and A11Y-011 remain evidence tasks and are not treated as fixes.\n`);

  const decisions = [
    ...issues.map((issue) => ({ id: issue.issueId, kind: "issue", severity: issue.severity, recommendation: issue.recommendation, proposalHash: issue.proposalHash, decision: "PENDING" })),
    ...manualTasks.map((task) => ({ id: task.taskId, kind: "manual_task", relatedIssueIds: task.relatedIssueIds, recommendation: task.recommendation, proposalHash: task.taskHash, decision: "PENDING" }))
  ];
  const decisionLedger = { schemaVersion: 1, generatedAt, phase: "5B", status: "WAITING_OWNER", allowedDecisions: ["APPROVE_RECOMMENDED_PHASE5C_FIX", "APPROVE_MANUAL_EVIDENCE_TASK", "HOLD", "REJECT", "NEEDS_MORE_EVIDENCE"], rules: ["One line per ID", "No blanket approval", "Every approval binds the listed proposal hash", "Approval does not start Phase 5C or update baselines"], decisions };
  writeJson(`${paths.reviewRoot}/phase-5b-owner-decisions.json`, decisionLedger);
  write(`${paths.reviewRoot}/phase-5b-owner-decisions.md`, `# Phase 5B accessibility owner decisions\n\nStatus: **WAITING_OWNER**\n\nEvery entry is pending. Reply with one allowed decision per ID; a blanket approval is invalid.\n\n| ID | Kind | Severity/issues | Recommendation | Proposal hash | Decision |\n| --- | --- | --- | --- | --- | --- |\n${decisions.map((entry) => `| ${entry.id} | ${entry.kind} | ${entry.severity || entry.relatedIssueIds.join(", ")} | ${entry.recommendation} | \`${entry.proposalHash}\` | **PENDING** |`).join("\n")}\n\nAllowed values: APPROVE_RECOMMENDED_PHASE5C_FIX, APPROVE_MANUAL_EVIDENCE_TASK, HOLD, REJECT, NEEDS_MORE_EVIDENCE.\n`);

  const ownerPackage = {
    schemaVersion: 1,
    generatedAt,
    status: "WAITING_OWNER",
    phase5aCounts: { total: 11, critical: 1, high: 8, medium: 2, confirmed: 8, manualEvidenceGaps: 3, falsePositives: 0 },
    issues: issues.map((issue) => ({ issueId: issue.issueId, severity: issue.severity, whatIsWrong: issue.currentBehavior, whoIsAffected: issue.affectedUsers, where: { routes: issue.affectedRoutes, states: issue.affectedStates, viewports: issue.affectedViewports }, recommendation: issue.proposedAction, pixelsChange: issue.expectedPixelImpact, domOrAriaChange: issue.expectedDomImpact, riskIfNotFixed: issue.risks[0], riskOfFix: issue.risks.slice(1).join(" ") || "Evidence-only task.", tests: issue.tests, recommendedDecision: issue.recommendation, proposalHash: issue.proposalHash })),
    manualTasks: manualTasks.map((task) => ({ taskId: task.taskId, relatedIssueIds: task.relatedIssueIds, title: task.title, recommendedDecision: task.recommendation, proposalHash: task.taskHash })),
    noConformanceClaim: true,
    phase5cStarted: false
  };
  writeJson(`${paths.reviewRoot}/phase-5b-owner-review-package.json`, ownerPackage);
  write(`${paths.reviewRoot}/phase-5b-owner-review-package.md`, `# Phase 5B accessibility owner-review package\n\nStatus: **WAITING_OWNER**. No fix is implemented and no WCAG conformance claim is made.\n\n## Issue decisions\n\n| ID | Severity | What is wrong | Recommendation | Pixels | DOM/ARIA | Recommended decision |\n| --- | --- | --- | --- | --- | --- | --- |\n${issues.map((issue) => `| ${issue.issueId} | ${issue.severity} | ${issue.currentBehavior.replace(/\|/g, "\\|")} | ${issue.proposedAction.replace(/\|/g, "\\|")} | ${issue.expectedPixelImpact} | ${issue.expectedDomImpact} | **${issue.recommendation}** |`).join("\n")}\n\n## Manual task decisions\n\n${manualTasks.map((task) => `- **${task.taskId}** (${task.relatedIssueIds.join(", ")}): ${task.title} - recommended **APPROVE_MANUAL_EVIDENCE_TASK** - hash \`${task.taskHash}\``).join("\n")}\n\n## Owner rules\n\n- Reply with one line per issue/task ID.\n- A blanket approval is invalid.\n- Every approved fix or task is bound to its listed proposal hash.\n- Approval does not start Phase 5C, update a baseline, or authorize an unlisted visual change.\n`);

  const classCounts = issues.reduce((acc, issue) => { acc[issue.fixClass] = (acc[issue.fixClass] || 0) + 1; return acc; }, {});
  const report = {
    schemaVersion: 1,
    generatedAt,
    program: { selectedPhase: "Phase 5B - Issue-specific accessibility owner review", previousStatus: "READY", finalStatus: "WAITING_OWNER", phase5Overall: "IN_PROGRESS", phase5c: "NOT_READY", overall: "IN_PROGRESS" },
    branchAndCommits: { branch, startingCommit, reviewPackageCommit: "FINAL_PHASE5B_REVIEW_COMMIT_REPORTED_IN_FINAL_HANDOFF", ownerDecisionCommit: null, finalCommit: "FINAL_PHASE5B_REVIEW_COMMIT_REPORTED_IN_FINAL_HANDOFF", prePhaseTag: "teoyube-9of10-phase5b-start-0a98a0b", worktree: "DOCUMENTATION_CHANGES_PENDING_COMMIT" },
    issues: { total: 11, critical: 1, high: 8, medium: 2, confirmed: 8, manualGaps: 3, falsePositives: 0, needsMoreEvidence: 0 },
    fixClasses: classCounts,
    ownerReview: { requestsCreated: issues.length, proposalHashes: issues.length + manualTasks.length, canonDecision: "PENDING", manualTasks: manualTasks.length, implementationBatches: batches.length, ownerDecisions: "PENDING", approvedFixes: 0, approvedManualTasks: 0, held: 0, rejected: 0, needsMoreEvidence: 0, pending: decisions.length },
    changes: { productFixes: 0, productSourceChanges: 0, protectedVisualChanges: 0, cssChanges: 0, domClassChanges: 0, ariaTabindexChanges: 0, visibleCopyChanges: 0, assetChanges: 0, baselineChanges: 0, packageLockfileChanges: 0, runtimeChanges: 0, paidCalls: 0 },
    status: { phase2a: "BLOCKED", phase3: "WAITING_OWNER", phase4: "WAITING_OWNER_SESSION_DATA", phase5a: "PASS", phase5b: "WAITING_OWNER", nextReady: "Phase 6A remains independently READY; Phase 5C is not ready until matching issue decisions are recorded." },
    rollback: "git revert <phase-5b-review-package-commit>; git tag -d teoyube-9of10-phase5b-start-0a98a0b only if the checkpoint tag itself was inaccurate"
  };
  writeJson("docs/recovery/9of10-phase-5b-accessibility-owner-review-report.json", report);
  write("docs/recovery/9of10-phase-5b-accessibility-owner-review-report.md", `# Teoyube 9/10 Phase 5B accessibility owner-review report\n\n- Selected phase: **Phase 5B - issue-specific accessibility owner review**\n- Previous status: **READY**\n- Final status: **WAITING_OWNER**\n- Phase 5 overall: **IN_PROGRESS**\n- Phase 5C: **NOT READY**\n- Program overall: **IN_PROGRESS**\n\n## Evidence and scope\n\nValidated all 11 Phase 5A records: 1 critical, 8 high, 2 medium; 8 confirmed issues and 3 manual-evidence gaps. Created ${issues.length} issue-specific requests, ${manualTasks.length} executable manual tasks, one dedicated Canon decision, and three proposed Phase 5C batches. Every proposal is hash-bound and pending. No fix or approval record was created.\n\n## Change accounting\n\nProduct fixes/source, protected visual source, CSS, DOM/class, ARIA/tabindex, visible copy, assets, baselines, package/lockfile, runtime, paid calls, participant/research records, and Phase 5C work: **0**.\n\n## Preserved status\n\n- Phase 2A: **BLOCKED**\n- Phase 3: **WAITING_OWNER**\n- Phase 4: **WAITING_OWNER_SESSION_DATA**\n- Phase 5A: **PASS**\n- Phase 5B: **WAITING_OWNER**\n- Gate C Preview: **BLOCKED**\n- Gate C Production: **CLOSED**\n- WCAG conformance: **NOT CLAIMED**\n\n## Owner action\n\nUse the owner-decision ledger and return one allowed decision per issue/task ID. A blanket approval is invalid. Phase 5C does not start automatically.\n\n## Rollback\n\n${report.rollback}\n`);
}

function verify() {
  const errors = [];
  const expectedCounts = { total: 11, critical: 1, high: 8, medium: 2, confirmed: 8, manual: 3 };
  const loadedIssues = register.issues;
  if (loadedIssues.length !== expectedCounts.total) errors.push("Issue count mismatch");
  for (const severity of ["critical", "high", "medium"]) if (loadedIssues.filter((issue) => issue.severity === severity).length !== expectedCounts[severity]) errors.push(`${severity} count mismatch`);
  if (issues.filter((issue) => issue.phase5aStatus === "confirmed").length !== expectedCounts.confirmed) errors.push("Confirmed count mismatch");
  if (issues.filter((issue) => issue.phase5aStatus === "manual_evidence_gap").length !== expectedCounts.manual) errors.push("Manual-gap count mismatch");
  for (const issue of issues) {
    const disk = readJson(`${paths.requestRoot}/${issue.issueId}.json`);
    const binding = { issueEvidence: disk.phase5aEvidence, proposedAction: disk.proposedAction, affectedFiles: disk.proposedFiles, protectedContracts: disk.protectedContractsAffected, testPlan: disk.tests, rollback: disk.rollback };
    if (disk.proposalHash !== hashObject(binding)) errors.push(`${issue.issueId} proposal hash mismatch`);
    if (disk.ownerDecision !== "PENDING") errors.push(`${issue.issueId} is not pending`);
    for (const file of [...disk.proposedFiles, ...disk.protectedContractsAffected]) if (!fs.existsSync(path.join(root, file))) errors.push(`${issue.issueId} missing path ${file}`);
    const md = fs.readFileSync(path.join(root, paths.requestRoot, `${issue.issueId}.md`), "utf8");
    if (!md.includes(disk.proposalHash) || !md.includes("Owner decision: **PENDING**")) errors.push(`${issue.issueId} Markdown mismatch`);
    for (const criterion of disk.wcagCriteria) if (!disk.normativeSources.some((source) => source.includes(sources.wcag) && source.includes("#"))) errors.push(`${issue.issueId} lacks WCAG reference for ${criterion}`);
  }
  const manualPlan = readJson(`${paths.reviewRoot}/manual-evidence-plan.json`);
  for (const gap of ["A11Y-009", "A11Y-010", "A11Y-011"]) if (!manualPlan.tasks.some((task) => task.relatedIssueIds.includes(gap))) errors.push(`No manual task covers ${gap}`);
  for (const task of manualPlan.tasks) {
    const copy = { ...task };
    delete copy.taskHash;
    if (task.taskHash !== hashObject(copy)) errors.push(`${task.taskId} hash mismatch`);
    if (task.ownerDecision !== "PENDING") errors.push(`${task.taskId} is not pending`);
  }
  const batches = readJson("docs/accessibility/phase-5c-proposed-batches.json").batches.flatMap((batch) => batch.issueIds);
  const confirmed = issues.filter((issue) => issue.phase5aStatus === "confirmed").map((issue) => issue.issueId).sort();
  if (JSON.stringify([...new Set(batches)].sort()) !== JSON.stringify(confirmed)) errors.push("Phase 5C batch coverage mismatch");
  const decisions = readJson(`${paths.reviewRoot}/phase-5b-owner-decisions.json`);
  if (decisions.decisions.length !== issues.length + manualTasks.length || decisions.decisions.some((entry) => entry.decision !== "PENDING")) errors.push("Decision ledger mismatch");
  const starting = readJson("docs/accessibility/phase-5b-starting-manifest.json");
  for (const identity of [...starting.evidenceFiles, ...starting.protectedAndBaselineFiles]) if (fileIdentity(identity.path).sha256 !== identity.sha256) errors.push(`Starting hash changed: ${identity.path}`);
  const required = ["docs/accessibility/phase-5b-starting-manifest.json", "docs/accessibility/phase-5c-proposed-batches.md", "docs/accessibility/phase-5c-proposed-batches.json", `${paths.reviewRoot}/canon-focus-owner-decision.md`, `${paths.reviewRoot}/canon-focus-owner-decision.json`, `${paths.reviewRoot}/manual-evidence-plan.md`, `${paths.reviewRoot}/manual-evidence-plan.json`, `${paths.reviewRoot}/phase-5b-owner-decisions.md`, `${paths.reviewRoot}/phase-5b-owner-decisions.json`, `${paths.reviewRoot}/phase-5b-owner-review-package.md`, `${paths.reviewRoot}/phase-5b-owner-review-package.json`, "docs/recovery/9of10-phase-5b-accessibility-owner-review-report.md", "docs/recovery/9of10-phase-5b-accessibility-owner-review-report.json"];
  for (const file of required) if (!fs.existsSync(path.join(root, file))) errors.push(`Missing deliverable ${file}`);
  const scanFiles = [...required, ...issues.flatMap((issue) => [`${paths.requestRoot}/${issue.issueId}.md`, `${paths.requestRoot}/${issue.issueId}.json`])];
  for (const file of scanFiles) {
    const text = fs.readFileSync(path.join(root, file), "utf8");
    if (/sk-(?:proj-)?[A-Za-z0-9_-]{16,}/.test(text)) errors.push(`Potential secret in ${file}`);
  }
  const result = { status: errors.length ? "FAIL" : "PASS", issueCount: issues.length, severity: { critical: 1, high: 8, medium: 2 }, confirmed: 8, manualEvidenceGaps: 3, manualTaskCount: manualTasks.length, proposalHashCount: issues.length + manualTasks.length, batchCount: 3, ownerDecisions: "ALL_PENDING", productChanges: 0, errors };
  console.log(JSON.stringify(result, null, 2));
  if (errors.length) process.exitCode = 1;
}

const command = process.argv[2] || "verify";
if (command === "generate") generate();
else if (command === "verify") verify();
else throw new Error("Usage: node scripts/accessibility/prepare-phase5b-owner-review.cjs [generate|verify]");
