"use client";

import { useMemo } from "react";

export type TigResponsePanelClientContext = Readonly<{
  panelData: Readonly<{
    scriptureAnchors: readonly string[];
    explanationPath: readonly string[];
    confidenceLabel: string;
    fallbackUsed: boolean;
    fallbackReason?: string;
    selectedCandidate: string;
  }>;
  fallbackUsed: boolean;
  warnings: readonly string[];
  blockers: readonly string[];
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
}>;

const EMPTY_CONTEXT: TigResponsePanelClientContext = Object.freeze({
  panelData: Object.freeze({
    scriptureAnchors: Object.freeze([]),
    explanationPath: Object.freeze(["A server-computed TIG response context is required before recommendation display."]),
    confidenceLabel: "insufficient_data",
    fallbackUsed: true,
    fallbackReason: "No server-computed TIG context was supplied.",
    selectedCandidate: "Scripture-grounded review required"
  }),
  fallbackUsed: true,
  warnings: Object.freeze(["No server-computed TIG context was supplied."]),
  blockers: Object.freeze([]),
  noExternalServicesRequired: true,
  noBrowserPersistenceRequired: true
});

export function useTigResponsePanelContext(input: Readonly<{
  query?: string;
  wordId?: string;
  clusterId?: string;
  mode?: "word" | "promise" | "calling";
  initialContext?: TigResponsePanelClientContext;
}> = {}) {
  const initialContext = input.initialContext;
  return useMemo(() => initialContext || EMPTY_CONTEXT, [initialContext]);
}
