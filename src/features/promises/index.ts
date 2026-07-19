import type { CapabilityEvent, CapabilityPort, CapabilityViewModel } from "../../domain/capabilities/contracts";
import { createCapabilityService } from "../../shared/utilities/create-capability-service";

export type PromisesEvent = CapabilityEvent<"promises">;
export type PromisesViewModel = CapabilityViewModel<"promises">;
export type { PromiseTableViewModel } from "./contracts";
export type { PromiseLevel, PromiseRecord, PromiseRepository, PromiseSource, PromiseStatus, PromiseStatusTransition } from "../../domain/promises/promise-repository";
export { createPromisesLegacyAdapter } from "./legacy-adapter";
export { createApprovedPromiseTableViewModel } from "./application/promise-table-service";
export { APPROVED_INITIAL_PROMISE_ROW, LocalPromiseRepository, createLocalPromiseRepository } from "./infrastructure/local-promise-repository";

export function createPromisesFeature(port: CapabilityPort<"promises">) {
  return createCapabilityService("promises", port);
}
