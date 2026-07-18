import type {
  TeoyubeProductStabilizationQueue,
  TeoyubeProductStabilizationQueueItem
} from "./product-stabilization-queue-contracts";

export type TeoyubeProductStabilizationSafetyBlocker = {
  id: string;
  itemId?: string;
  message: string;
  requiredAction: string;
};

export type TeoyubeProductStabilizationSafetyWarning = {
  id: string;
  itemId?: string;
  message: string;
  recommendedAction: string;
};

export type TeoyubeProductStabilizationSafetyReport = {
  valid: boolean;
  queueId?: string;
  itemCount: number;
  blockers: TeoyubeProductStabilizationSafetyBlocker[];
  warnings: TeoyubeProductStabilizationSafetyWarning[];
  manualOnly: true;
  inMemoryOnly: true;
  noUnsafeFixes: boolean;
  noProductionDataWrite: true;
  noServiceConnection: true;
  noUserContact: true;
  noAutomaticPublishing: true;
  noFeedbackCollection: true;
  noDatabasePersistenceEnabled: true;
  noAnalyticsEnabled: true;
  noMonitoringProviderConnected: true;
  noLiveAiOrchestrationEnabled: true;
  noAdminAuthAdded: true;
  noCmsConnected: true;
  noBrowserPersistenceRequired: true;
  generatedAt: string;
};

function itemText(item: TeoyubeProductStabilizationQueueItem): string {
  return `${item.title} ${item.description} ${item.proposedFix} ${item.blockedReason || ""} ${item.deferredReason || ""}`.toLowerCase();
}

function blocker(id: string, item: TeoyubeProductStabilizationQueueItem, message: string, requiredAction: string): TeoyubeProductStabilizationSafetyBlocker {
  return { id: `${item.id}_${id}`, itemId: item.id, message, requiredAction };
}

export function validateProductStabilizationItemSafety(item: TeoyubeProductStabilizationQueueItem): TeoyubeProductStabilizationSafetyReport {
  const text = itemText(item);
  const blockers: TeoyubeProductStabilizationSafetyBlocker[] = [
    !item.preservesScriptureAnchors || /remove.*scripture|hide.*scripture|without scripture|delete.*anchor/.test(text)
      ? blocker("scripture_anchor_risk", item, "Stabilization must not remove or hide Scripture anchors.", "Preserve Scripture anchors or route to owner review before any change.")
      : undefined,
    !item.preservesExplanationTraces || /remove.*explanation|hide.*explanation|remove.*trace|hide.*trace/.test(text)
      ? blocker("explanation_trace_risk", item, "Stabilization must not remove explanation traces.", "Preserve explanation paths and fallback reasons.")
      : undefined,
    !item.preservesFallbackSafety || /weaken.*fallback|unsafe fallback|remove.*fallback/.test(text)
      ? blocker("fallback_safety_risk", item, "Stabilization must not weaken fallback safety.", "Keep fallback states safe, non-empty, humble, and bounded.")
      : undefined,
    !item.preservesConfidenceLabels || /hide.*confidence|remove.*confidence|delete.*confidence/.test(text)
      ? blocker("confidence_label_risk", item, "Stabilization must not hide confidence labels.", "Keep confidence or uncertainty labels visible.")
      : undefined,
    !item.preservesPrivacyConsent || /hide.*consent|remove.*consent|hide.*privacy|remove.*privacy/.test(text)
      ? blocker("privacy_consent_risk", item, "Stabilization must not hide privacy or consent notices.", "Keep privacy, consent, and sensitive-information notices visible.")
      : undefined,
    !item.noServiceConnection || !item.noDatabasePersistenceEnabled || !item.noAnalyticsEnabled || !item.noMonitoringProviderConnected || !item.noLiveAiOrchestrationEnabled || /enable.*(service|database|analytics|monitoring|live ai|email|sms|notification|external)/.test(text)
      ? blocker("service_connection_risk", item, "Stabilization must not enable unapproved services.", "Keep external services, database persistence, analytics, monitoring providers, messaging, and live AI disabled.")
      : undefined,
    !item.noProductionDataWrite || /production json|write.*json|publish.*content|review-only.*production|unreviewed content/.test(text)
      ? blocker("production_content_write_risk", item, "Stabilization must not publish review-only content or write unreviewed content to production JSON.", "Keep review-only content behind review gates.")
      : undefined,
    !item.noBrowserPersistenceRequired || /localstorage|indexeddb|document\.cookie|cookie/.test(text)
      ? blocker("browser_persistence_risk", item, "Stabilization must not add localStorage, cookies, IndexedDB, or browser persistence for sensitive personalization.", "Keep personalization session-bound and consent-aware.")
      : undefined,
    !item.noDivineCertaintyClaimed || /divine certainty|god told me|guaranteed calling|command from god/.test(text)
      ? blocker("divine_certainty_risk", item, "Stabilization must not claim divine certainty.", "Use humble, bounded support language.")
      : undefined,
    /medical advice|legal advice|financial advice|diagnose|prescribe|tax advice|investment advice/.test(text)
      ? blocker("professional_advice_risk", item, "Stabilization must not add professional advice language.", "Keep medical, legal, financial, emergency, and professional-care boundaries explicit.")
      : undefined,
    /show debug|expose debug|raw payload|raw json/.test(text)
      ? blocker("debug_payload_risk", item, "Stabilization must not expose debug payloads to normal users.", "Keep debug-only data hidden from normal users.")
      : undefined,
    !item.noUserContact || !item.noFeedbackCollection || !item.noAutomaticPublishing
      ? blocker("manual_boundary_risk", item, "Stabilization must not contact users, collect feedback automatically, or publish automatically.", "Keep queue actions manual and in memory.")
      : undefined
  ].filter(Boolean) as TeoyubeProductStabilizationSafetyBlocker[];
  const warnings: TeoyubeProductStabilizationSafetyWarning[] = [];
  if (item.ownerReviewRequired) warnings.push({ id: `${item.id}_owner_review`, itemId: item.id, message: "Item requires owner review before stabilization.", recommendedAction: "Confirm owner review before any local patch." });
  if (!item.verificationRequirements.length) warnings.push({ id: `${item.id}_verification_missing`, itemId: item.id, message: "Item has no verification requirements.", recommendedAction: "Add regression verification before stabilizing." });
  return {
    valid: blockers.length === 0,
    itemCount: 1,
    blockers,
    warnings,
    manualOnly: true,
    inMemoryOnly: true,
    noUnsafeFixes: blockers.length === 0,
    noProductionDataWrite: true,
    noServiceConnection: true,
    noUserContact: true,
    noAutomaticPublishing: true,
    noFeedbackCollection: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}

export function getProductStabilizationSafetyBlockers(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationSafetyBlocker[] {
  const queueBoundaryBlocker = !queue.manualOnly || !queue.inMemoryOnly || !queue.noFilesWritten || !queue.noDatabasePersistenceEnabled || !queue.noAnalyticsEnabled || !queue.noMonitoringProviderConnected || !queue.noExternalServicesRequired || !queue.noUsersContacted || !queue.noFeedbackCollectedAutomatically || !queue.noAutomaticPublishing || !queue.noLiveAiOrchestrationEnabled || !queue.noAdminAuthAdded || !queue.noCmsConnected || !queue.noBrowserPersistenceRequired
    ? [{ id: "product_stabilization_queue_boundary_broken", message: "Product stabilization queue safety boundaries are broken.", requiredAction: "Restore manual, in-memory, no-service, no-persistence, no-analytics, no-contact, no-publishing, no-live-AI, no-admin-auth, no-CMS, and no-browser-persistence boundaries." }]
    : [];
  return [
    ...queueBoundaryBlocker,
    ...queue.items.flatMap((item) => validateProductStabilizationItemSafety(item).blockers)
  ];
}

export function getProductStabilizationSafetyWarnings(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationSafetyWarning[] {
  return queue.items.flatMap((item) => validateProductStabilizationItemSafety(item).warnings);
}

export function validateProductStabilizationQueueSafety(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationSafetyReport {
  return createProductStabilizationSafetyReport(queue);
}

export function createProductStabilizationSafetyReport(queue: TeoyubeProductStabilizationQueue): TeoyubeProductStabilizationSafetyReport {
  const blockers = getProductStabilizationSafetyBlockers(queue);
  return {
    valid: blockers.length === 0,
    queueId: queue.id,
    itemCount: queue.items.length,
    blockers,
    warnings: getProductStabilizationSafetyWarnings(queue),
    manualOnly: true,
    inMemoryOnly: true,
    noUnsafeFixes: blockers.length === 0,
    noProductionDataWrite: true,
    noServiceConnection: true,
    noUserContact: true,
    noAutomaticPublishing: true,
    noFeedbackCollection: true,
    noDatabasePersistenceEnabled: true,
    noAnalyticsEnabled: true,
    noMonitoringProviderConnected: true,
    noLiveAiOrchestrationEnabled: true,
    noAdminAuthAdded: true,
    noCmsConnected: true,
    noBrowserPersistenceRequired: true,
    generatedAt: new Date().toISOString()
  };
}
