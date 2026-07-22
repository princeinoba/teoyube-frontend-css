import legacyResponses from "../fixtures/teo-guide/legacy-deterministic-responses.json";
import { describe, expect, it } from "vitest";
import { createDeterministicTeoGuideMessage } from "../../src/domain/teo-guide/teo-guide-message";

describe("legacy Teo Guide characterization", () => {
  it.each(legacyResponses)("preserves every deterministic field for $prompt", ({ prompt, response }) => {
    expect(createDeterministicTeoGuideMessage(prompt)).toStrictEqual(response);
  });
});
