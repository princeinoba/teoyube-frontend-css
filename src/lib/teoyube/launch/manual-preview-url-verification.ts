import type { TeoyubeManualPreviewDeploymentProvider } from "./manual-preview-deployment-contracts";
import type {
  TeoyubeManualPreviewUrlBlocker,
  TeoyubeManualPreviewUrlDecision,
  TeoyubeManualPreviewUrlRecord,
  TeoyubeManualPreviewUrlStatus,
  TeoyubeManualPreviewUrlVerificationCheck,
  TeoyubeManualPreviewUrlVerificationReport,
  TeoyubeManualPreviewUrlWarning
} from "./manual-preview-url-verification-contracts";

export type TeoyubeManualPreviewUrlRecordInput = {
  previewUrl?: string;
  provider?: TeoyubeManualPreviewDeploymentProvider;
  environmentProfile?: TeoyubeManualPreviewUrlRecord["environmentProfile"];
  documentedForManualQa?: boolean;
  reviewedManually?: boolean;
  intentionallyProductionDomain?: boolean;
  hardcodedIntoAppLogic?: boolean;
};

function now(): string {
  return new Date().toISOString();
}

function id(): string {
  return `manual_preview_url_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function parseUrl(value: string | undefined): URL | undefined {
  if (!value) return undefined;

  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

function isSecretLike(value: string | undefined): boolean {
  if (!value) return false;
  return /(token|secret|password|passwd|private|apikey|api_key|client_secret|service_role|sk-)/i.test(value);
}

function isProductionDomain(url: URL | undefined): boolean {
  if (!url) return false;
  const host = url.hostname.toLowerCase();
  return host === "teoyube.com" || host.endsWith(".teoyube.com") && !/(preview|staging|dev|vercel|netlify|render|railway)/i.test(host);
}

function check(
  idValue: string,
  label: string,
  passed: boolean,
  status: TeoyubeManualPreviewUrlStatus,
  details: string
): TeoyubeManualPreviewUrlVerificationCheck {
  return {
    id: idValue,
    label,
    required: true,
    passed,
    status,
    details
  };
}

function blocker(idValue: string, reason: string, action: string): TeoyubeManualPreviewUrlBlocker {
  return {
    id: idValue,
    label: idValue.replace(/_/g, " "),
    riskLevel: "critical",
    reason,
    requiredAction: action
  };
}

function warning(idValue: string, message: string, action: string): TeoyubeManualPreviewUrlWarning {
  return {
    id: idValue,
    label: idValue.replace(/_/g, " "),
    riskLevel: "medium",
    message,
    recommendedAction: action
  };
}

export function createManualPreviewUrlRecord(
  input: TeoyubeManualPreviewUrlRecordInput = {}
): TeoyubeManualPreviewUrlRecord {
  const createdAt = now();
  const parsed = parseUrl(input.previewUrl);
  const status: TeoyubeManualPreviewUrlStatus =
    !input.previewUrl
      ? "missing"
      : !parsed
        ? "invalid_format"
        : isProductionDomain(parsed) && !input.intentionallyProductionDomain
          ? "production_domain_warning"
          : input.reviewedManually
            ? "verified_manually"
            : "provided";

  return {
    id: id(),
    previewUrl: input.previewUrl,
    status,
    provider: input.provider || "vercel",
    environmentProfile: input.environmentProfile || "preview",
    documentedForManualQa: input.documentedForManualQa ?? true,
    reviewedManually: input.reviewedManually ?? false,
    intentionallyProductionDomain: input.intentionallyProductionDomain ?? false,
    hardcodedIntoAppLogic: input.hardcodedIntoAppLogic ?? false,
    shouldFetchFromCode: false,
    shouldPersistExternally: false,
    createdAt,
    updatedAt: createdAt
  };
}

export function createManualPreviewUrlVerificationChecklist(
  record: TeoyubeManualPreviewUrlRecord = createManualPreviewUrlRecord()
): TeoyubeManualPreviewUrlVerificationCheck[] {
  const parsed = parseUrl(record.previewUrl);

  return [
    check("preview_url_exists", "Preview URL exists", Boolean(record.previewUrl), record.previewUrl ? "provided" : "missing", "A human should record the preview URL after manual provider deployment."),
    check("preview_url_valid_format", "Preview URL has valid format", !record.previewUrl || Boolean(parsed), parsed ? "provided" : record.previewUrl ? "invalid_format" : "missing", "URL should parse as a standard URL."),
    check("preview_url_not_secret_like", "Preview URL is not secret-like", !isSecretLike(record.previewUrl), "provided", "URL must not include tokens, keys, passwords, or private values."),
    check("preview_url_not_unintended_production_domain", "Preview URL is not unintended production domain", !isProductionDomain(parsed) || record.intentionallyProductionDomain, isProductionDomain(parsed) ? "production_domain_warning" : "provided", "Production domains need explicit human intent before QA."),
    check("preview_url_not_hardcoded", "Preview URL is not hardcoded into app logic", !record.hardcodedIntoAppLogic, "provided", "Preview URLs should be manual QA references, not source logic."),
    check("preview_url_manual_browser_review", "Preview URL requires manual browser review", true, "needs_review", "This module documents that a human should review the URL manually."),
    check("preview_url_not_fetched_by_code", "Preview URL is not fetched by code", record.shouldFetchFromCode === false, "provided", "Code must not fetch, crawl, or call the preview URL."),
    check("preview_url_not_persisted_externally", "Preview URL is not written externally", record.shouldPersistExternally === false, "provided", "URL record remains in memory/manual reporting only."),
    check("preview_url_environment_profile_attached", "Environment profile attached", record.environmentProfile !== "unknown", "provided", "URL record should identify its environment profile."),
    check("preview_url_provider_attached", "Provider attached", record.provider !== "unknown" && record.provider !== "undecided", "provided", "URL record should identify the deployment target/provider.")
  ];
}

export function getManualPreviewUrlVerificationBlockers(
  record: TeoyubeManualPreviewUrlRecord
): TeoyubeManualPreviewUrlBlocker[] {
  const parsed = parseUrl(record.previewUrl);

  return [
    !record.previewUrl
      ? blocker("preview_url_missing", "Preview URL is missing.", "Record the manually generated preview URL before postdeployment QA.")
      : undefined,
    record.previewUrl && !parsed
      ? blocker("preview_url_invalid", "Preview URL format is invalid.", "Record a valid preview URL.")
      : undefined,
    isSecretLike(record.previewUrl)
      ? blocker("preview_url_secret_like", "Preview URL contains secret-looking text.", "Remove token-like values from the URL record.")
      : undefined,
    record.hardcodedIntoAppLogic
      ? blocker("preview_url_hardcoded", "Preview URL must not be hardcoded into app logic.", "Remove preview URL from source code.")
      : undefined,
    record.shouldFetchFromCode
      ? blocker("preview_url_fetch_requested", "Preview URL must not be fetched from code.", "Keep preview URL verification manual.")
      : undefined,
    record.shouldPersistExternally
      ? blocker("preview_url_external_persistence", "Preview URL must not be written externally.", "Keep preview URL in manual QA records only.")
      : undefined
  ].filter((entry): entry is TeoyubeManualPreviewUrlBlocker => Boolean(entry));
}

export function getManualPreviewUrlVerificationWarnings(
  record: TeoyubeManualPreviewUrlRecord
): TeoyubeManualPreviewUrlWarning[] {
  const parsed = parseUrl(record.previewUrl);

  return [
    isProductionDomain(parsed) && !record.intentionallyProductionDomain
      ? warning("preview_url_production_domain", "The URL appears to use a production Teoyube domain.", "Confirm the preview target before QA.")
      : undefined,
    !record.reviewedManually
      ? warning("preview_url_manual_review_pending", "Preview URL has not been marked as reviewed manually.", "Open it manually in a browser after deployment.")
      : undefined,
    record.provider === "undecided" || record.provider === "unknown"
      ? warning("preview_url_provider_needs_review", "Preview URL provider is not clearly selected.", "Attach the selected provider to the URL record.")
      : undefined
  ].filter((entry): entry is TeoyubeManualPreviewUrlWarning => Boolean(entry));
}

export function createManualPreviewUrlDecision(
  record: TeoyubeManualPreviewUrlRecord
): TeoyubeManualPreviewUrlDecision {
  const blockers = getManualPreviewUrlVerificationBlockers(record);
  const warnings = getManualPreviewUrlVerificationWarnings(record);

  if (blockers.some((entry) => entry.id === "preview_url_missing")) return "blocked_missing_url";
  if (blockers.some((entry) => entry.id === "preview_url_invalid" || entry.id === "preview_url_secret_like")) return "blocked_invalid_url";
  if (warnings.some((entry) => entry.id.includes("provider") || entry.id.includes("production_domain"))) return "needs_environment_review";
  return warnings.length ? "ready_after_manual_review" : "ready_for_postdeployment_qa";
}

export function validateManualPreviewUrlRecord(record: TeoyubeManualPreviewUrlRecord): boolean {
  return getManualPreviewUrlVerificationBlockers(record).length === 0;
}

export function createManualPreviewUrlVerificationReport(
  record: TeoyubeManualPreviewUrlRecord
): TeoyubeManualPreviewUrlVerificationReport {
  const blockers = getManualPreviewUrlVerificationBlockers(record);
  const warnings = getManualPreviewUrlVerificationWarnings(record);

  return {
    status: blockers.length ? record.status : warnings.length ? "needs_review" : "verified_manually",
    valid: blockers.length === 0,
    decision: createManualPreviewUrlDecision(record),
    record,
    checks: createManualPreviewUrlVerificationChecklist(record),
    blockers,
    warnings,
    noUrlFetched: true,
    noExternalWrite: true,
    generatedAt: now()
  };
}
