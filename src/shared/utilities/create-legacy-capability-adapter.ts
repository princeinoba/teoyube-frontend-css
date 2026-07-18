import type { CapabilityEvent, CapabilityId } from "../../domain/capabilities/contracts";
import type {
  LegacyCapabilityAdapter,
  LegacyCapabilityBridge,
  LegacyOwner
} from "../contracts/legacy-capability-bridge";

export function createLegacyCapabilityAdapter<Id extends CapabilityId>(
  capability: Id,
  owners: readonly LegacyOwner[],
  bridge: LegacyCapabilityBridge<Id>
): LegacyCapabilityAdapter<Id> {
  return Object.freeze({
    kind: "legacy-compatibility-adapter" as const,
    owners: Object.freeze([...owners]),
    read() {
      const viewModel = bridge.read();
      if (viewModel.capability !== capability) {
        throw new Error(`Legacy adapter mismatch: expected ${capability}, received ${viewModel.capability}.`);
      }
      return viewModel;
    },
    dispatch(event: CapabilityEvent<Id>) {
      if (event.capability !== capability) {
        throw new Error(`Legacy adapter mismatch: expected ${capability}, received ${event.capability}.`);
      }
      bridge.dispatch(event);
    }
  });
}
