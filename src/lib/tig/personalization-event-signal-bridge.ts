import type {
  TeoyubePersonalizationConsent,
  TeoyubePersonalizationSignal
} from "./personalization-contracts";
import { createSignalFromSurfaceEvent } from "./personalization-signals";
import {
  addTeoyubePersonalizationSignal,
  addTeoyubePersonalizationSignals
} from "./personalization-signal-store";
import type {
  TeoyubeSignalStoreAdapter,
  TeoyubeSignalStoreWriteResult
} from "./personalization-signal-store-contracts";
import type { TigProductionEvent } from "./production-response-contracts";

export function createPersonalizationSignalFromTigProductionEvent(
  event: TigProductionEvent
): TeoyubePersonalizationSignal {
  return createSignalFromSurfaceEvent(event);
}

export function createPersonalizationSignalFromTigEventBatch(
  events: TigProductionEvent[]
): TeoyubePersonalizationSignal[] {
  return events.map(createPersonalizationSignalFromTigProductionEvent);
}

export function storeProductionEventAsPersonalizationSignal(
  store: TeoyubeSignalStoreAdapter,
  event: TigProductionEvent,
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubeSignalStoreWriteResult {
  return addTeoyubePersonalizationSignal(
    store,
    createPersonalizationSignalFromTigProductionEvent(event),
    consent
  );
}

export function storeProductionEventBatchAsPersonalizationSignals(
  store: TeoyubeSignalStoreAdapter,
  events: TigProductionEvent[],
  consent?: Partial<TeoyubePersonalizationConsent>
): TeoyubeSignalStoreWriteResult {
  return addTeoyubePersonalizationSignals(
    store,
    createPersonalizationSignalFromTigEventBatch(events),
    consent
  );
}
