"use client";

import { useMemo } from "react";
import { createTigGraphExplorerAdapterContext } from "../adapters/tig-graph-explorer-adapter";

export function useTigGraphExplorerContext(input: {
  selectedNodeId?: string;
  searchQuery?: string;
} = {}) {
  const selectedNodeId = input.selectedNodeId;
  const searchQuery = input.searchQuery;

  return useMemo(() => {
    const adapter = createTigGraphExplorerAdapterContext({
      selectedNodeId,
      searchQuery
    });

    return {
      ...adapter,
      fallbackUsed: !adapter.selectedNode,
      warnings: adapter.promiseTablePreviewRows.length ? [] : ["Promise Table preview has no rows."],
      blockers: adapter.graphSummary.nodeCount ? [] : ["TIG seed graph has no nodes."],
      noExternalServicesRequired: true,
      noBrowserPersistenceRequired: true
    };
  }, [selectedNodeId, searchQuery]);
}
