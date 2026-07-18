"use client";

import { useMemo } from "react";
import { createTigResponsePanelAdapterContext } from "../adapters/tig-response-panel-adapter";

export function useTigResponsePanelContext(input: {
  query?: string;
  wordId?: string;
  clusterId?: string;
  mode?: "word" | "promise" | "calling";
} = {}) {
  const query = input.query;
  const wordId = input.wordId;
  const clusterId = input.clusterId;
  const mode = input.mode;

  return useMemo(() => {
    const adapter = createTigResponsePanelAdapterContext({
      query: query?.trim() || "Scripture-grounded Teoyube response",
      wordId,
      clusterId,
      mode
    });

    return {
      ...adapter,
      fallbackUsed: adapter.panelData.fallbackUsed,
      warnings: adapter.promiseContext.warnings,
      blockers: adapter.promiseContext.blockers,
      noExternalServicesRequired: true,
      noBrowserPersistenceRequired: true
    };
  }, [query, wordId, clusterId, mode]);
}
