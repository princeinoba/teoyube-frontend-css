import { describe, expect, it } from "vitest";
import { createApprovedCanonViewModel } from "../../src/features/scripture/application/canon-service";
import { createApprovedPromiseTableViewModel } from "../../src/features/promises/application/promise-table-service";
import { APPROVED_INITIAL_PROMISE_ROW, LocalPromiseRepository } from "../../src/features/promises/infrastructure/local-promise-repository";
import { createLocalScriptureRepository } from "../../src/features/scripture/infrastructure/local-scripture-repository";

describe("Prompt 8 repository boundaries", () => {
  it("maps approved Canon data without changing Scripture records", () => {
    const scripture = createLocalScriptureRepository();
    const promises = new LocalPromiseRepository();
    const viewModel = createApprovedCanonViewModel(scripture, promises);
    expect(viewModel.canonicalEntryCount).toBe(108);
    expect(viewModel.promiseClusterCount).toBe(12);
    expect(viewModel.activeTab).toBe("canon-maps");
    expect(viewModel.approvedHtml).toContain('id="canonKpiGrid"');
    expect(viewModel.approvedHtml).toContain("Ephesians 1:18");
    expect(scripture.findCanonEntriesByReference("Ephesians 1:4").map((entry) => entry.id)).toContain("SC001");
  });

  it("preserves source, level, and explanation across reversible status changes", () => {
    const repository = new LocalPromiseRepository();
    const before = repository.findSavedById(APPROVED_INITIAL_PROMISE_ROW.id);
    expect(before).toMatchObject({ promiseLevel: "A", status: "Studying", explanation: APPROVED_INITIAL_PROMISE_ROW.explanation });
    expect(before?.source).toEqual(APPROVED_INITIAL_PROMISE_ROW.source);
    expect(repository.updateStatus(before!.id, "Praying")).toEqual({ recordId: before!.id, previousStatus: "Studying", nextStatus: "Praying" });
    expect(repository.findSavedById(before!.id)?.source).toEqual(before?.source);
    expect(repository.undoLastStatusTransition(before!.id)?.nextStatus).toBe("Studying");
    expect(repository.findSavedById(before!.id)).toEqual(before);
  });

  it("restores a removed row with provenance intact", () => {
    const repository = new LocalPromiseRepository();
    const removed = repository.remove(APPROVED_INITIAL_PROMISE_ROW.id);
    expect(repository.listSaved()).toHaveLength(0);
    expect(removed).toEqual(APPROVED_INITIAL_PROMISE_ROW);
    repository.restore(removed!);
    expect(repository.findSavedById(APPROVED_INITIAL_PROMISE_ROW.id)).toEqual(APPROVED_INITIAL_PROMISE_ROW);
    const model = createApprovedPromiseTableViewModel(repository);
    expect(model.rows[0].source.scriptureReferences).toEqual(["Ephesians 1:18"]);
    expect(model.approvedHtml).toContain('id="phase114PromiseTablePanel"');
  });
});
