"use client";

import { useMemo } from "react";
import { createCompassExperienceAdapterContext } from "../adapters/compass-experience-adapter";

export function useCompassExperienceContext(input: {
  query?: string;
  archetypeId?: string;
} = {}) {
  const query = input.query;
  const archetypeId = input.archetypeId;

  return useMemo(() => {
    const adapter = createCompassExperienceAdapterContext({
      query: query?.trim() || "calling purpose",
      archetypeId
    });

    return {
      ...adapter,
      fallbackUsed: adapter.callingPath.confidenceLabel === "fallback",
      warnings: adapter.validation.warnings,
      blockers: adapter.validation.blockers,
      noExternalServicesRequired: true,
      noBrowserPersistenceRequired: true
    };
  }, [query, archetypeId]);
}
