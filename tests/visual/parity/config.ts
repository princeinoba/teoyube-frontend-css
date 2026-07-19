import fs from "node:fs";
import path from "node:path";

export type ViewportName =
  | "desktop-wide"
  | "desktop-standard"
  | "tablet-landscape"
  | "tablet-portrait"
  | "mobile"
  | "mobile-small";

export type ViewId =
  | "today"
  | "search"
  | "canon"
  | "table"
  | "calling"
  | "book"
  | "lexicon"
  | "testimony"
  | "guide"
  | "ui-elements"
  | "teoyube-tables"
  | "roadmap";

interface RuntimeManifest {
  captureEnvironment: {
    colorScheme: "light" | "dark";
    deviceScaleFactor: number;
    locale: string;
  };
  viewports: Record<ViewportName, { width: number; height: number }>;
  views: ViewId[];
}

interface OwnerReferenceManifest {
  views: Array<{
    viewId: ViewId;
    legacyUrl: string;
    nextTarget: string;
    ownerReference: string;
  }>;
  requiredViewports: Array<{ name: ViewportName; width: number; height: number }>;
}

export interface NextRouteStatus {
  viewId: ViewId;
  nextRoute: string;
  status:
    | "PASS"
    | "OWNER_APPROVED_SOURCE_BASELINE"
    | "BLOCKED_VISUAL_DIFFERENCE"
    | "BLOCKED_MISSING_STATIC_COUNTERPART"
    | "BLOCKED_FUNCTIONAL_DIFFERENCE"
    | "BLOCKED_OWNER_DECISION"
    | "NOT_APPLICABLE_INTERNAL_ROUTE"
    | "REDIRECT_TO_CANONICAL_PUBLIC_ROUTE";
  ownerApproved: boolean;
  ownerApprovalId: string | null;
}

export const workspaceRoot = path.resolve(__dirname, "../../..");
export const immutableBaselineRoot = path.join(workspaceRoot, "tests/visual/baselines/static-runtime");
export const candidateRoot = path.join(workspaceRoot, ".tmp/visual-parity");
export const fixedTime = "2026-07-18T12:00:00.000Z";

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(workspaceRoot, relativePath), "utf8")) as T;
}

export const runtimeManifest = readJson<RuntimeManifest>(
  "tests/visual/baselines/static-runtime/manifest.json"
);
export const ownerReferenceManifest = readJson<OwnerReferenceManifest>(
  "tests/visual/baselines/owner-reference-manifest.json"
);
export const nextRouteStatuses = readJson<NextRouteStatus[]>(
  "tests/visual/parity/next-route-status.json"
);

export const screenshotTolerance = Object.freeze({
  channelDelta: 16,
  maxDifferentPixelRatio: 0.005
});
export const crossPlatformStaticTolerance = Object.freeze({
  meanPerceptualDelta: 0.1,
  maxRegionalPerceptualDelta: 0.32
});
export const geometryTolerancePx = 0.75;

export function assertDisposableCandidatePath(candidatePath: string): void {
  const resolvedCandidate = path.resolve(candidatePath);
  const resolvedRoot = path.resolve(candidateRoot);
  const resolvedBaseline = path.resolve(immutableBaselineRoot);
  const insideCandidateRoot =
    resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`);
  const insideBaseline =
    resolvedCandidate === resolvedBaseline || resolvedCandidate.startsWith(`${resolvedBaseline}${path.sep}`);

  if (!insideCandidateRoot || insideBaseline) {
    throw new Error(`Refusing to write visual candidate outside ${resolvedRoot}: ${resolvedCandidate}`);
  }
}

export function routeForView(viewId: ViewId): string {
  const entry = nextRouteStatuses.find((item) => item.viewId === viewId);
  if (!entry) throw new Error(`Missing Next route status for ${viewId}.`);
  return entry.nextRoute;
}

export function assertParityMatrixIntegrity(): void {
  const expectedViews = runtimeManifest.views;
  const ownerViews = ownerReferenceManifest.views.map((item) => item.viewId);
  const statusViews = nextRouteStatuses.map((item) => item.viewId);
  const expectedViewports = Object.entries(runtimeManifest.viewports);

  if (JSON.stringify(expectedViews) !== JSON.stringify(ownerViews)) {
    throw new Error("Owner-reference view order differs from the immutable runtime manifest.");
  }
  if (JSON.stringify(expectedViews) !== JSON.stringify(statusViews)) {
    throw new Error("Next route status order differs from the immutable runtime manifest.");
  }
  if (expectedViewports.length !== 6 || expectedViews.length !== 12) {
    throw new Error(`Expected 12 views and 6 viewports; found ${expectedViews.length} and ${expectedViewports.length}.`);
  }
  const allowedStatuses = new Set<NextRouteStatus["status"]>([
    "PASS",
    "OWNER_APPROVED_SOURCE_BASELINE",
    "BLOCKED_VISUAL_DIFFERENCE",
    "BLOCKED_MISSING_STATIC_COUNTERPART",
    "BLOCKED_FUNCTIONAL_DIFFERENCE",
    "BLOCKED_OWNER_DECISION",
    "NOT_APPLICABLE_INTERNAL_ROUTE",
    "REDIRECT_TO_CANONICAL_PUBLIC_ROUTE"
  ]);
  for (const status of nextRouteStatuses) {
    if (!allowedStatuses.has(status.status)) {
      throw new Error(`${status.viewId} has unsupported parity status ${status.status}.`);
    }
    if (status.ownerApproved !== Boolean(status.ownerApprovalId)) {
      throw new Error(`${status.viewId} owner approval flag and approval ID must change together.`);
    }
    if (status.status === "BLOCKED_OWNER_DECISION" && status.ownerApproved) {
      throw new Error(`${status.viewId} cannot remain BLOCKED_OWNER_DECISION after owner approval.`);
    }
  }
}
