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

  it("requires all preview kill switches and the server-only OpenAI key", () => {
    expect(
      readServerFeatureAvailability({
        TEOYUBE_ENABLE_LIVE_AI: "true"
      }).liveAi
    ).toBe(false);

    expect(
      readServerFeatureAvailability({
        TEOYUBE_ENABLE_LIVE_AI: "true",
        TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER: "true",
        TEOYUBE_LIVE_AI_ENABLED: "true",
        OPENAI_API_KEY: "server-only-test-key"
      }).liveAi
    ).toBe(true);
  });

  it("keeps Prompt 18 external intelligence and retrieval capabilities disabled by default", () => {
    const availability = readServerFeatureAvailability({});
    expect(availability).toMatchObject({
      liveAi: false,
      embeddings: false,
      vectorRetrieval: false,
      broadRag: false,
      externalTeoGuideProvider: false
    });
  });
});
