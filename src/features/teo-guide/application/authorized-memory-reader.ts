import type { AuthorizationContext } from "../../../domain/identity/identity-contracts";
import type { PurposeId, UserMemoryRecord } from "../../../domain/memory/memory-contracts";
import type { UserMemoryService } from "../../memory";

export class TeoGuideAuthorizedMemoryReader {
  constructor(private readonly memory: UserMemoryService) {}

  async readStructuredMemory(context: AuthorizationContext, purposeId: Extract<PurposeId, "preference_continuity" | "journey_continuity">): Promise<readonly UserMemoryRecord[]> {
    return this.memory.list(context, { purposeId, limit: 25 });
  }
}

// Intentionally no write method. Teo Guide may propose a memory for explicit user review,
// but cannot persist it through this boundary.
