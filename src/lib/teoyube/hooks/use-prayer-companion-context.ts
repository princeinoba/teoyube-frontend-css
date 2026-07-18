"use client";

import { useMemo } from "react";
import { createPrayerCompanionAdapterContext } from "../adapters/prayer-companion-adapter";

export function usePrayerCompanionContext(input: {
  message?: string;
  theme?: string;
} = {}) {
  const message = input.message;
  const theme = input.theme;

  return useMemo(() => {
    const adapter = createPrayerCompanionAdapterContext({
      message: message?.trim() || "I need Scripture-grounded prayer and direction.",
      theme
    });

    return {
      ...adapter,
      fallbackUsed: adapter.safeDisplayData.fallbackUsed,
      warnings: adapter.recommendation.warnings,
      blockers: adapter.recommendation.blockers,
      noExternalServicesRequired: true,
      noBrowserPersistenceRequired: true
    };
  }, [message, theme]);
}
