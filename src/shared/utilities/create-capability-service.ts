import type {
  CapabilityApplicationService,
  CapabilityEvent,
  CapabilityId,
  CapabilityPort,
  CapabilityViewModel
} from "../../domain/capabilities/contracts";

export function createCapabilityService<Id extends CapabilityId>(
  capability: Id,
  port: CapabilityPort<Id>
): CapabilityApplicationService<Id> {
  return Object.freeze({
    capability,
    getViewModel(): CapabilityViewModel<Id> {
      return port.read();
    },
    handle(event: CapabilityEvent<Id>): void {
      if (event.capability !== capability) {
        throw new Error(`Capability event mismatch: expected ${capability}, received ${event.capability}.`);
      }
      port.dispatch(event);
    }
  });
}
