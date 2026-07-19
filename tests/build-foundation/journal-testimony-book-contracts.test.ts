import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { promoteTestimonyToBook, removeBookRecord, restoreBookRecord } from "../../src/domain/book/book-record";
import { createJournalRecord } from "../../src/domain/journal/journal-record";
import { createTestimonyDraft, editTestimony, finalizeTestimony, rejectTestimony, restoreTestimony, type UserConfirmation } from "../../src/domain/testimony/testimony-record";
import { createBookPageViewModel } from "../../src/features/book/application/book-page-service";
import { createJournalPageViewModel } from "../../src/features/journal/application/journal-page-service";
import { createTestimonyPageViewModel } from "../../src/features/testimony/application/testimony-page-service";

const workspaceRoot = path.resolve(__dirname, "../..");
const read = (relativePath: string) => fs.readFileSync(path.join(workspaceRoot, relativePath), "utf8");
const confirmed = { actor: "user", confirmed: true } as const;

describe("Journal, Testimony, and Book domain distinctions", () => {
  it("creates private chronological journal summaries without raw logging or persistence", () => {
    const record = createJournalRecord({ text: "Reach me at saint@example.com or +1 (416) 555-0199 about this reflection", scriptureReferences: ["Psalm 119:105"], createdAt: "2026-07-19T12:00:00.000Z" });
    expect(record.kind).toBe("private_chronological_reflection");
    expect(record.summary).toContain("[redacted email]");
    expect(record.summary).toContain("[redacted phone]");
    expect(record.provenance.sessionOnly).toBe(true);
    expect(record.provenance.rawPrivateTextLogged).toBe(false);
    expect(record.provenance.durableWritePerformed).toBe(false);
    expect(record.testimonyCandidateState).toBe("not_proposed");
  });

  it("keeps journal-to-testimony proposals editable, rejectable, reversible, and user-authored", () => {
    const journal = createJournalRecord({ text: "A private reflection", createdAt: "2026-07-19T12:00:00.000Z" });
    const candidate = createTestimonyDraft({ title: "Candidate", category: "Faith", body: journal.summary, createdAt: journal.createdAt, sourceJournal: journal });
    const edited = editTestimony(candidate, { body: "A user-reviewed edit" });
    const rejected = rejectTestimony(edited, confirmed);
    const restored = restoreTestimony(rejected, confirmed);
    expect(candidate.lifecycle).toBe("candidate");
    expect(candidate.provenance.sourceRecordId).toBe(journal.id);
    expect(candidate.divineActionAttribution).toBe("user_authored_unverified");
    expect(candidate.promiseFulfillment).toBe("not_declared");
    expect(edited.body).toBe("A user-reviewed edit");
    expect(rejected.lifecycle).toBe("rejected");
    expect(restored.lifecycle).toBe("candidate");
  });

  it("requires user review and explicit confirmation before Book promotion", () => {
    const draft = createTestimonyDraft({ title: "Reviewed account", category: "Grace", body: "The user's account", createdAt: "2026-07-19T12:00:00.000Z" });
    expect(promoteTestimonyToBook(draft, confirmed).accepted).toBe(false);
    const unconfirmed = { actor: "user", confirmed: false } as unknown as UserConfirmation;
    expect(promoteTestimonyToBook(finalizeTestimony(draft, "private", confirmed), unconfirmed).accepted).toBe(false);
    const reviewed = finalizeTestimony(draft, "private", confirmed);
    const promoted = promoteTestimonyToBook(reviewed, confirmed);
    expect(promoted.accepted).toBe(true);
    expect(promoted.record?.provenance.userApproved).toBe(true);
    expect(promoted.record?.provenance.sourceRecordId).toBe(reviewed.id);
    const removed = removeBookRecord(promoted.record!, confirmed);
    expect(removed.state.removed).toBe(true);
    expect(restoreBookRecord(removed, confirmed).state.removed).toBe(false);
  });
});

describe("approved view models and client boundaries", () => {
  it("keeps approved page markup and safety gates behind typed view models", () => {
    const journal = createJournalPageViewModel();
    const testimony = createTestimonyPageViewModel();
    const book = createBookPageViewModel();
    expect(journal.sessionOnly).toBe(true);
    expect(journal.rawPrivateTextLogged).toBe(false);
    expect(testimony.approvedHtml).toContain('class="testimony-hero"');
    expect(testimony.approvedHtml).toContain('id="testimonyForm"');
    expect(testimony.automaticBookPromotion).toBe(false);
    expect(testimony.systemMayDeclarePromiseFulfilled).toBe(false);
    expect(testimony.systemMayDeclareDivineAction).toBe(false);
    expect(testimony.testimonies[0].record.provenance.sourceLocation).toBe("approved-static:approved_static_user_record");
    expect(book.approvedHtml).toContain('class="book-saint-shell"');
    expect(book.requiresExplicitPromotionConfirmation).toBe(true);
  });

  it("keeps raw text logging, persistence APIs, and historical visual owners out of migrated clients", () => {
    for (const relativePath of [
      "src/app/_journal/ApprovedJournalView.tsx",
      "src/app/_book/BookPageController.tsx",
      "src/app/_testimony/TestimonyPageController.tsx"
    ]) {
      const source = read(relativePath);
      expect(source, relativePath).not.toMatch(/console\.(?:log|info|debug)|localStorage|sessionStorage|indexedDB/);
      expect(source, relativePath).not.toMatch(/Phase11ProductPanels|Phase112ScreenshotApp|TeoyubeAppStateProvider/);
    }
  });
});
