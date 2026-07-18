import type {
  CapabilityEvent,
  CapabilityId,
  CapabilityPort,
  CapabilityViewModel
} from "../../domain/capabilities/contracts";

export type LegacyOwner = Readonly<{
  module: string;
  responsibility: string;
}>;

export interface LegacyCapabilityBridge<Id extends CapabilityId> {
  read(): CapabilityViewModel<Id>;
  dispatch(event: CapabilityEvent<Id>): void;
}

export type LegacyCapabilityAdapter<Id extends CapabilityId> = CapabilityPort<Id> &
  Readonly<{
    kind: "legacy-compatibility-adapter";
    owners: readonly LegacyOwner[];
  }>;
