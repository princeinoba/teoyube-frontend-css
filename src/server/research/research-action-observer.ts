import type { RecordResearchEventCommand, ResearchEventRecorder } from "../../domain/research/research-contracts";

export class ResearchActionObserver {
  constructor(private readonly recorder: ResearchEventRecorder) {}

  async afterProductAction(command: Readonly<Omit<RecordResearchEventCommand, "envelopeToken">> & { envelopeToken: string }): Promise<void> {
    await this.recorder.recordSafely(command);
  }

  async runProductAction<T>(
    action: () => Promise<T>,
    commandAfterSuccess: (result: T) => RecordResearchEventCommand
  ): Promise<T> {
    const result = await action();
    await this.recorder.recordSafely(commandAfterSuccess(result));
    return result;
  }
}
