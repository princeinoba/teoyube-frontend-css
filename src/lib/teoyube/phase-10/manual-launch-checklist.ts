import type {
  TeoyubeManualLaunchChecklistArea,
  TeoyubeManualLaunchChecklistBlocker,
  TeoyubeManualLaunchChecklistDecision,
  TeoyubeManualLaunchChecklistItem,
  TeoyubeManualLaunchChecklistReport,
  TeoyubeManualLaunchChecklistResult,
  TeoyubeManualLaunchChecklistStatus,
  TeoyubeManualLaunchChecklistWarning
} from "./manual-launch-checklist-contracts";

function pending(notes = "Manual check pending."): TeoyubeManualLaunchChecklistResult {
  return { status: "pending", notes };
}

function item(id: string, area: TeoyubeManualLaunchChecklistArea, label: string, instructions: string, required = true): TeoyubeManualLaunchChecklistItem {
  return { id, area, label, required, result: pending(), instructions };
}

export function createManualLaunchChecklist(): TeoyubeManualLaunchChecklistItem[] {
  return [
    item("npm_typecheck", "typecheck", "Run npm run typecheck where available", "Run locally if the script exists; report missing scripts rather than inventing tooling."),
    item("npm_lint", "lint", "Run npm run lint where available", "Run locally if the script exists; report missing scripts."),
    item("npm_build", "local_build", "Run npm run build where available", "Verify the real app build before any release action."),
    item("npm_test", "test", "Run npm run test where available", "Run locally if the script exists; report missing scripts."),
    item("route_rendering", "route_check", "Verify route rendering", "Manually verify public app routes render without blank screens or runtime crashes."),
    item("real_data_rendering", "real_data_check", "Verify real data rendering", "Confirm vocabulary, promise clusters, and Scripture canon load in UI flows."),
    item("word_card_rendering", "component_render_check", "Verify WordCard rendering", "Confirm WordCard shows data, Scripture anchors, promises, and fallback state."),
    item("prayer_companion_rendering", "component_render_check", "Verify PrayerCompanion rendering", "Confirm prayer flow preserves Scripture, privacy, and safe fallback."),
    item("compass_experience_rendering", "component_render_check", "Verify CompassExperience rendering", "Confirm calling path, action suggestion, explanation, and fallback render."),
    item("tig_response_panel_rendering", "component_render_check", "Verify TIGResponsePanel rendering", "Confirm selected word, promise, Scripture, confidence, explanation, and fallback reason render."),
    item("tig_graph_explorer_rendering", "component_render_check", "Verify TIGGraphExplorer rendering or fallback", "Confirm graph renders or list fallback remains usable."),
    item("mobile_layout", "mobile_check", "Verify mobile layout", "Check core routes on a narrow viewport for usable layout and readable content."),
    item("accessibility_basics", "accessibility_check", "Verify accessibility basics", "Check headings, labels, contrast, keyboard path, and non-overlapping text."),
    item("privacy_consent_visibility", "privacy_consent_check", "Verify privacy/consent visibility", "Confirm privacy, consent, and sensitive data notices are visible where relevant."),
    item("known_limitations_visibility", "known_limitations_check", "Verify known limitations visibility", "Confirm limitations remain available to normal users."),
    item("debug_payload_hidden", "known_limitations_check", "Verify no debug payload is visible", "Confirm normal users do not see internal/debug payloads."),
    item("services_disabled", "service_disabled_check", "Verify services remain disabled", "Confirm no database persistence, analytics, monitoring provider, admin auth, CMS, accounts, live AI, or notifications are enabled."),
    item("no_automatic_feedback", "manual_support_check", "Verify no automatic feedback collection", "Confirm support/feedback remains manual."),
    item("no_automatic_contact", "manual_support_check", "Verify no automatic user contact", "Confirm the app sends no email, SMS, notifications, or external messages."),
    item("no_public_url_fetching", "manual_monitoring_check", "Verify no public URL fetching from code", "Confirm monitoring remains manual and no public URL fetch is automatic."),
    item("pause_rollback_ready", "pause_rollback_check", "Verify pause/rollback criteria", "Confirm criteria exist as manual decision support only."),
    item("owner_approval", "owner_approval_check", "Owner approval before real launch", "Require owner approval before any actual public release action.")
  ];
}

export function recordManualLaunchChecklistResult(checklist: TeoyubeManualLaunchChecklistItem[], result: TeoyubeManualLaunchChecklistResult): TeoyubeManualLaunchChecklistItem[] {
  return checklist.map((entry) => ({ ...entry, result: { ...result, checkedAt: result.checkedAt || new Date().toISOString() } }));
}

export function recordManualLaunchChecklistAreaResult(checklist: TeoyubeManualLaunchChecklistItem[], area: TeoyubeManualLaunchChecklistArea, result: TeoyubeManualLaunchChecklistResult): TeoyubeManualLaunchChecklistItem[] {
  return checklist.map((entry) => entry.area === area ? { ...entry, result: { ...result, checkedAt: result.checkedAt || new Date().toISOString() } } : entry);
}

export function summarizeManualLaunchChecklist(checklist: TeoyubeManualLaunchChecklistItem[]): string[] {
  return checklist.map((entry) => `${entry.id}: ${entry.result.status}${entry.result.notes ? ` - ${entry.result.notes}` : ""}`);
}

export function getManualLaunchChecklistBlockers(checklist: TeoyubeManualLaunchChecklistItem[]): TeoyubeManualLaunchChecklistBlocker[] {
  return checklist
    .filter((entry) => entry.required && entry.result.status === "blocked")
    .map((entry) => ({ id: `${entry.id}_blocker`, area: entry.area, message: entry.result.notes || `${entry.label} is blocked.` }));
}

export function getManualLaunchChecklistWarnings(checklist: TeoyubeManualLaunchChecklistItem[]): TeoyubeManualLaunchChecklistWarning[] {
  const pendingWarnings = checklist
    .filter((entry) => entry.required && entry.result.status === "pending")
    .map((entry) => ({ id: `${entry.id}_pending`, area: entry.area, message: `${entry.label} is pending for Phase 10.2 real app verification.` }));
  const explicitWarnings = checklist
    .filter((entry) => entry.result.status === "warning")
    .map((entry) => ({ id: `${entry.id}_warning`, area: entry.area, message: entry.result.notes || `${entry.label} has a warning.` }));
  return [...pendingWarnings, ...explicitWarnings];
}

function statusFrom(checklist: TeoyubeManualLaunchChecklistItem[]): TeoyubeManualLaunchChecklistStatus {
  if (getManualLaunchChecklistBlockers(checklist).length) return "blocked";
  if (checklist.some((entry) => entry.result.status === "pending")) return "in_progress";
  if (checklist.some((entry) => entry.result.status === "warning")) return "passed_with_warnings";
  return "passed";
}

export function createManualLaunchChecklistDecision(checklist: TeoyubeManualLaunchChecklistItem[]): TeoyubeManualLaunchChecklistDecision {
  const blockers = getManualLaunchChecklistBlockers(checklist);
  if (blockers.some((entry) => entry.area === "owner_approval_check")) return "needs_owner_review";
  if (blockers.length) return "blocked";
  if (checklist.some((entry) => entry.result.status === "pending")) return "needs_real_app_verification";
  return getManualLaunchChecklistWarnings(checklist).length ? "ready_with_warnings" : "ready_for_manual_rehearsal";
}

export function createManualLaunchChecklistReport(checklist: TeoyubeManualLaunchChecklistItem[] = createManualLaunchChecklist()): TeoyubeManualLaunchChecklistReport {
  const blockers = getManualLaunchChecklistBlockers(checklist);
  return {
    valid: blockers.length === 0,
    status: statusFrom(checklist),
    decision: createManualLaunchChecklistDecision(checklist),
    checklist,
    summary: summarizeManualLaunchChecklist(checklist),
    blockers,
    warnings: getManualLaunchChecklistWarnings(checklist),
    noLaunchActionPerformed: true,
    noExternalSend: true,
    inMemoryOnly: true,
    generatedAt: new Date().toISOString()
  };
}
