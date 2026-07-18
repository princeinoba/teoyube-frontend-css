import type {
  TeoyubeLimitedSoftLaunchStatus,
  TeoyubeLimitedSoftLaunchSurface
} from "./limited-soft-launch-execution-contracts";

export type TeoyubeLimitedSoftLaunchSurfaceScope = {
  id: string;
  label: string;
  includedSurfaces: TeoyubeLimitedSoftLaunchSurface[];
  excludedSurfaces: TeoyubeLimitedSoftLaunchSurface[];
  generatedAt: string;
};

export type TeoyubeLimitedSoftLaunchSurfaceScopeReport = {
  valid: boolean;
  scope: TeoyubeLimitedSoftLaunchSurfaceScope;
  includedSurfaceCount: number;
  excludedSurfaceCount: number;
  blockers: string[];
  warnings: string[];
  generatedAt: string;
};

const INCLUDED_SURFACE_LABELS = [
  "Canon",
  "Daily Word",
  "Prayer",
  "Calling Compass",
  "Promise Cluster",
  "AI Companion",
  "Onboarding",
  "TIG Response Panel",
  "TIG Graph Preview",
  "Personalization Preview Panel",
  "Consent Controls",
  "Feedback Controls",
  "Offline Fallback"
] as const;

function surface(id: string, label: string, route?: string): TeoyubeLimitedSoftLaunchSurface {
  const ready: TeoyubeLimitedSoftLaunchStatus = "ready";

  return {
    id,
    label,
    route,
    included: true,
    launchReadiness: ready,
    mobileReadiness: ready,
    accessibilityReadiness: "ready_with_warnings",
    scriptureAnchorReadiness: ready,
    explanationPathReadiness: ready,
    fallbackReadiness: ready,
    consentReadiness: ready,
    knownLimitations: [
      "Manual QA remains required before inviting real users.",
      "No production database persistence, external analytics, or live AI orchestration is connected."
    ],
    manualQaNotes: [
      "Confirm Scripture anchors and explanation paths are visible.",
      "Confirm mobile layout, keyboard flow, fallback, confidence, and consent states."
    ]
  };
}

export function getIncludedSoftLaunchSurfaces(): TeoyubeLimitedSoftLaunchSurface[] {
  return INCLUDED_SURFACE_LABELS.map((label) =>
    surface(label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""), label)
  );
}

export function getExcludedSoftLaunchSurfaces(): TeoyubeLimitedSoftLaunchSurface[] {
  return [
    {
      ...surface("public_marketing_launch", "Public Marketing Launch"),
      included: false,
      launchReadiness: "not_started",
      knownLimitations: ["Public launch is explicitly excluded from this limited soft launch preparation step."]
    },
    {
      ...surface("production_provider_integrations", "Production Provider Integrations"),
      included: false,
      launchReadiness: "not_started",
      knownLimitations: ["Production persistence, analytics, monitoring, and live AI providers remain disconnected."]
    }
  ];
}

export function getLimitedSoftLaunchSurfaceScope(): TeoyubeLimitedSoftLaunchSurfaceScope {
  return {
    id: "limited_soft_launch_surface_scope",
    label: "Limited Soft Launch Surface Scope",
    includedSurfaces: getIncludedSoftLaunchSurfaces(),
    excludedSurfaces: getExcludedSoftLaunchSurfaces(),
    generatedAt: new Date().toISOString()
  };
}

function readyEnough(status: TeoyubeLimitedSoftLaunchStatus): boolean {
  return status === "ready" || status === "ready_with_warnings";
}

export function validateLimitedSoftLaunchSurfaceScope(
  scope: TeoyubeLimitedSoftLaunchSurfaceScope
) {
  const requiredLabels = new Set(INCLUDED_SURFACE_LABELS);
  const includedLabels = new Set(scope.includedSurfaces.map((entry) => entry.label));
  const missing = [...requiredLabels].filter((label) => !includedLabels.has(label));
  const unsafe = scope.includedSurfaces.filter((entry) =>
    !readyEnough(entry.scriptureAnchorReadiness) ||
    !readyEnough(entry.explanationPathReadiness) ||
    !readyEnough(entry.fallbackReadiness) ||
    !readyEnough(entry.consentReadiness)
  );
  const blockers = [
    ...missing.map((label) => `${label} is missing from the limited soft launch surface scope.`),
    ...unsafe.map((entry) => `${entry.label} is missing Scripture, explanation, fallback, or consent readiness.`)
  ];
  const warnings = scope.includedSurfaces
    .filter((entry) => entry.accessibilityReadiness === "ready_with_warnings" || entry.knownLimitations.length > 0)
    .map((entry) => `${entry.label}: manual QA remains required.`);

  return {
    valid: blockers.length === 0,
    blockers,
    warnings
  };
}

export function createLimitedSoftLaunchSurfaceScopeReport(
  scope: TeoyubeLimitedSoftLaunchSurfaceScope = getLimitedSoftLaunchSurfaceScope()
): TeoyubeLimitedSoftLaunchSurfaceScopeReport {
  const validation = validateLimitedSoftLaunchSurfaceScope(scope);

  return {
    valid: validation.valid,
    scope,
    includedSurfaceCount: scope.includedSurfaces.length,
    excludedSurfaceCount: scope.excludedSurfaces.length,
    blockers: validation.blockers,
    warnings: validation.warnings,
    generatedAt: new Date().toISOString()
  };
}
