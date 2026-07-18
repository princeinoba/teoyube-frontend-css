import { LAUNCH_QA_SURFACES } from "./launch-qa-checklist";
import type {
  TeoyubeLaunchQaSurface,
  TeoyubeSurfaceTestCase
} from "./launch-qa-contracts";

function testCase(
  surface: TeoyubeLaunchQaSurface,
  suffix: string,
  title: string,
  purpose: string,
  relatedSafetyRequirement: string,
  launchCritical = true
): TeoyubeSurfaceTestCase {
  return {
    id: `${surface}_${suffix}`,
    surface,
    title,
    purpose,
    steps: [
      `Open the ${surface.replace(/_/g, " ")} surface.`,
      "Review mobile and desktop layout.",
      "Trigger normal, empty, and fallback states where available.",
      "Confirm safety, Scripture, confidence, and consent boundaries."
    ],
    expectedResult: "Surface remains readable, Scripture-aware, fallback-safe, accessible, and free of raw debug payloads.",
    riskLevel: launchCritical ? "high" : "medium",
    launchCritical,
    testType: "manual",
    relatedSafetyRequirement
  };
}

export function getSurfaceTestCases(surface: TeoyubeLaunchQaSurface): TeoyubeSurfaceTestCase[] {
  return [
    testCase(surface, "render", "Render smoke test", "Confirm the surface renders without crashing.", "page renders without crashing"),
    testCase(surface, "mobile", "Mobile layout test", "Confirm no horizontal overflow and touch-friendly controls.", "mobile layout does not overflow"),
    testCase(surface, "scripture", "Scripture anchor test", "Confirm Scripture anchor is visible or accessible.", "Scripture anchoring"),
    testCase(surface, "fallback", "Fallback state test", "Confirm fallback copy is clear and safe.", "fallback handling"),
    testCase(surface, "debug", "Debug visibility test", "Confirm raw debug payloads are hidden from normal users.", "debug hidden", false)
  ];
}

export function getLaunchSurfaceTestMatrix(): TeoyubeSurfaceTestCase[] {
  return LAUNCH_QA_SURFACES.flatMap(getSurfaceTestCases);
}

export function getCriticalSurfaceTestCases(): TeoyubeSurfaceTestCase[] {
  return getLaunchSurfaceTestMatrix().filter((entry) => entry.launchCritical);
}

export function getMobileSurfaceTestCases(): TeoyubeSurfaceTestCase[] {
  return getLaunchSurfaceTestMatrix().filter((entry) => entry.id.endsWith("_mobile"));
}

export function getPersonalizationSurfaceTestCases(): TeoyubeSurfaceTestCase[] {
  return getLaunchSurfaceTestMatrix().filter((entry) =>
    ["personalization_preview", "consent_controls", "feedback_controls"].includes(entry.surface)
  );
}

export function getFallbackSurfaceTestCases(): TeoyubeSurfaceTestCase[] {
  return getLaunchSurfaceTestMatrix().filter((entry) => entry.id.endsWith("_fallback"));
}

export function createSurfaceTestMatrixReport() {
  const matrix = getLaunchSurfaceTestMatrix();

  return {
    valid: matrix.length >= LAUNCH_QA_SURFACES.length,
    surfaceCount: LAUNCH_QA_SURFACES.length,
    testCaseCount: matrix.length,
    criticalCount: getCriticalSurfaceTestCases().length,
    mobileCount: getMobileSurfaceTestCases().length,
    personalizationCount: getPersonalizationSurfaceTestCases().length,
    fallbackCount: getFallbackSurfaceTestCases().length,
    testCases: matrix,
    generatedAt: new Date().toISOString()
  };
}

