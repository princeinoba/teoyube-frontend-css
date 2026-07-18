export {
  createPhase112BookEntries,
  createPhase112ProductizationSummary,
  createPhase112Testimonies,
  createPromiseTableRowFromSearch,
  createPromiseTableRows,
  createTeoGuideResponse,
  generateTodayJourney,
  getGuardrailsContent,
  getPhase112ButtonActionMap,
  getPhase112Media,
  getPhase112SafetyStatus,
  runCallingCompassPreview,
  runTeoyubeSearch
} from "./teoyube/phase-11-2-screenshot-guided-functionality";

export type {
  Phase112BookEntry,
  Phase112ButtonAction,
  Phase112CallingCompassPreview,
  Phase112GuardrailsContent,
  Phase112PromiseTableRow,
  Phase112PromiseTableStatus,
  Phase112SafetyStatus,
  Phase112TeoGuideResponse,
  Phase112TestimonyRecord,
  Phase112TodayJourney
} from "./teoyube/phase-11-2-screenshot-guided-functionality";

import {
  getPhase112RouteConfigs as getBasePhase112RouteConfigs
} from "./teoyube/phase-11-2-screenshot-guided-functionality";

export function getPhase112RouteConfigs() {
  return getBasePhase112RouteConfigs().map((route) => ({
    ...route,
    key: route.id,
    primaryDataSource: "local data-access, static app state, and Phase 11.2 adapters"
  }));
}
