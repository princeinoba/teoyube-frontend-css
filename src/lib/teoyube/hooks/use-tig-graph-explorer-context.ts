"use client";

import { useMemo } from "react";

export type TigGraphExplorerClientContext = Readonly<{
  graphSummary: Readonly<{ nodeCount: number; relationshipCount: number }>;
  selectedNode?: Readonly<{ id: string; title?: string }>;
  searchQuery: string;
  promiseTablePreviewRows: readonly unknown[];
  explanationTrace: readonly unknown[];
  traceRelationships: readonly string[];
  fallbackListMode: boolean;
  fallbackUsed: boolean;
  warnings: readonly string[];
  blockers: readonly string[];
  noExternalServicesRequired: true;
  noBrowserPersistenceRequired: true;
}>;

const EMPTY_CONTEXT: TigGraphExplorerClientContext = Object.freeze({
  graphSummary: Object.freeze({ nodeCount: 0, relationshipCount: 0 }),
  searchQuery: "",
  promiseTablePreviewRows: Object.freeze([]),
  explanationTrace: Object.freeze([]),
  traceRelationships: Object.freeze([]),
  fallbackListMode: true,
  fallbackUsed: true,
  warnings: Object.freeze(["No server-computed TIG graph context was supplied."]),
  blockers: Object.freeze([]),
  noExternalServicesRequired: true,
  noBrowserPersistenceRequired: true
});

export function useTigGraphExplorerContext(input: Readonly<{
  selectedNodeId?: string;
  searchQuery?: string;
  initialContext?: TigGraphExplorerClientContext;
}> = {}) {
  const initialContext = input.initialContext;
  return useMemo(() => initialContext || EMPTY_CONTEXT, [initialContext]);
}
