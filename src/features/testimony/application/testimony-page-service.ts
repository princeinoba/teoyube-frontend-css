import { APPROVED_VIEW_MARKUP } from "../../../app/_approved-source/approved-view-markup.generated";
import { createTestimonyDraft, hydrateExistingUserTestimony, type TestimonyRecord } from "../../../domain/testimony/testimony-record";

export type TestimonyDisplayDto = Readonly<{
  record: TestimonyRecord;
  image: string;
  dateLabel: string;
  updatedLabel: string;
  metrics: Readonly<{ encouragements: number; views: number; shares: number }>;
}>;

export type TestimonyPageViewModel = Readonly<{
  approvedHtml: string;
  sourceDigest: string;
  testimonies: readonly TestimonyDisplayDto[];
  sessionOnly: true;
  automaticBookPromotion: false;
  systemMayDeclarePromiseFulfilled: false;
  systemMayDeclareDivineAction: false;
}>;

function approvedTestimony(input: {
  title: string;
  category: string;
  body: string;
  status: "private" | "published" | "draft";
  scriptureReferences: readonly string[];
  createdAt: string;
  image: string;
  dateLabel: string;
  updatedLabel: string;
  metrics: TestimonyDisplayDto["metrics"];
}): TestimonyDisplayDto {
  const draft = createTestimonyDraft(input);
  const record = hydrateExistingUserTestimony(draft, input.status, "approved_static_user_record");
  return Object.freeze({ record, image: input.image, dateLabel: input.dateLabel, updatedLabel: input.updatedLabel, metrics: Object.freeze(input.metrics) });
}

export function createTestimonyPageViewModel(): TestimonyPageViewModel {
  return Object.freeze({
    approvedHtml: APPROVED_VIEW_MARKUP.testimony.initial,
    sourceDigest: APPROVED_VIEW_MARKUP.sourceDigest,
    testimonies: Object.freeze([
      approvedTestimony({
        title: "God's Peace in the Storm", category: "Faith",
        body: "In the middle of uncertainty, God gave me a peace that surpasses all understanding and reminded me that His presence was steady.",
        status: "published", scriptureReferences: Object.freeze(["Psalm 121:7", "Philippians 4:7"]), createdAt: "2026-07-16T12:00:00.000Z",
        image: "public/images/canon/canon-hero-bg.png", dateLabel: "Shared 2 days ago", updatedLabel: "Updated 2 days ago",
        metrics: { encouragements: 24, views: 68, shares: 9 }
      }),
      approvedTestimony({
        title: "A New Beginning", category: "Grace",
        body: "After years of struggle, God gave me a fresh start and renewed my purpose with grace, clarity, and courage for the next faithful step.",
        status: "private", scriptureReferences: Object.freeze(["2 Corinthians 5:17", "Isaiah 43:19"]), createdAt: "2026-07-11T12:00:00.000Z",
        image: "public/images/search/suggested-journey-02.png", dateLabel: "Saved 1 week ago", updatedLabel: "Updated 1 week ago",
        metrics: { encouragements: 21, views: 55, shares: 7 }
      }),
      approvedTestimony({
        title: "Walking in Faith", category: "Obedience",
        body: "God has been teaching me to trust Him in every step of my journey, even when I only understand the next move.",
        status: "draft", scriptureReferences: Object.freeze(["Hebrews 11:1", "Proverbs 3:5-6"]), createdAt: "2026-07-15T12:00:00.000Z",
        image: "public/images/carousel/faith-in-action.png", dateLabel: "Draft saved 3 days ago", updatedLabel: "Updated 3 days ago",
        metrics: { encouragements: 18, views: 42, shares: 5 }
      })
    ]),
    sessionOnly: true,
    automaticBookPromotion: false,
    systemMayDeclarePromiseFulfilled: false,
    systemMayDeclareDivineAction: false
  });
}
