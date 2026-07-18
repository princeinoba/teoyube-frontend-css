import { describe, expect, it } from "vitest";
import {
  readPublicEnvironment,
  readServerFeatureAvailability
} from "@/config/environment";

describe("Teoyube environment validation", () => {
  it("fails disabled and malformed flags safe", () => {
    const result = readPublicEnvironment({
      NEXT_PUBLIC_TEOYUBE_ENABLE_PERSONALIZATION_PREVIEW: "yes",
      NEXT_PUBLIC_TEOYUBE_ENABLE_CONSENT_CONTROLS: "true",
      NEXT_PUBLIC_TEOYUBE_ENABLE_OFFLINE_FALLBACK: "false",
      NEXT_PUBLIC_TEOYUBE_ENABLE_DEBUG_UI: "invalid"
    });

    expect(result.enabledFlags).toEqual({
      personalizationPreview: false,
      consentControls: true,
      offlineFallback: false,
      debugUi: false
    });
  });

  it("requires both an explicit flag and server-only configuration", () => {
    expect(
      readServerFeatureAvailability({
        TEOYUBE_ENABLE_LIVE_AI: "true"
      }).liveAi
    ).toBe(false);

    expect(
      readServerFeatureAvailability({
        TEOYUBE_ENABLE_LIVE_AI: "true",
        TEOYUBE_LIVE_AI_API_KEY: "server-only-test-key"
      }).liveAi
    ).toBe(true);
  });
});
