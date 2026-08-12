import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { canonicalTigService } from "../../src/server/tig/canonical-tig-service";

describe("public-james-wisdom offline deterministic path", () => {
  it("produces a valid TIG recommendation and source validation", async () => {
    const result = await canonicalTigService.recommend({
      query: "Using James 1:5, explain a humble biblical approach to seeking wisdom.",
      intent: "scripture",
      surface: "unknown",
      privacy: {
        containsPrivatePrayerText: false,
        containsPrivateReflectionText: false,
      },
    });
    expect({
      valid: result.valid,
      sourceValidationValid: result.sourceValidation.valid,
      fallbackUsed: result.fallback.used,
      missingCount: result.sourceValidation.missing.length,
      blockerCount: result.sourceValidation.blockers.length,
    }).toEqual({
      valid: true,
      sourceValidationValid: true,
      fallbackUsed: false,
      missingCount: 0,
      blockerCount: 0,
    });
  });
});
