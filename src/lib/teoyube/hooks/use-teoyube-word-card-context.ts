"use client";

import { useMemo } from "react";
import { createWordCardAdapterProps } from "../adapters/word-card-adapter";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function useTeoyubeWordCardContext(wordId?: string) {
  return useMemo(() => {
    const requestedWordId = wordId?.trim() || "Benor";
    const adapter = createWordCardAdapterProps(requestedWordId);
    const resolvedIds = [adapter.context.word.id, adapter.context.word.word].map(normalize);

    return {
      ...adapter,
      requestedWordId,
      fallbackUsed: !wordId || !resolvedIds.includes(normalize(requestedWordId)),
      warnings: adapter.context.warnings,
      blockers: adapter.context.blockers,
      noExternalServicesRequired: true,
      noBrowserPersistenceRequired: true
    };
  }, [wordId]);
}
