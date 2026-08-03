import { APPROVED_VIEW_MARKUP } from "../../../app/_approved-source/approved-view-markup.generated";
import type {
  CallingCompassQuestionDto,
  CallingCompassClientContextDto,
  CallingCompassViewModel,
  CallingDiscernmentDto,
  CallingMediaDto
} from "../../../domain/calling/calling-discernment";
import { createCompassExperienceAdapterContext } from "../../../lib/teoyube/adapters/compass-experience-adapter";
import { CALLING_COMPASS_OFFICIAL_CHANNEL_URL } from "../calling-compass-youtube";

const QUESTIONS: readonly CallingCompassQuestionDto[] = Object.freeze([
  Object.freeze({ id: "burden", prompt: "Which burden keeps showing up as you pray and serve?", options: Object.freeze(["People needing direction", "People needing healing", "People needing wisdom"]) }),
  Object.freeze({ id: "gift", prompt: "Which gift are you currently stewarding?", options: Object.freeze(["Teaching and encouragement", "Creative communication", "Leadership and strategy"]) }),
  Object.freeze({ id: "season", prompt: "What season best describes your next faithful step?", options: Object.freeze(["Prepare quietly", "Serve consistently", "Build with counsel"]) })
]);

const MEDIA: readonly CallingMediaDto[] = Object.freeze([
  Object.freeze({ id: "local-seed-of-promise", order: 0, title: "The Seed of Promise", description: "A local TeoyubeWorld preview about tending promise language through Scripture and faithful action.", duration: "24:35", image: "public/images/embed/embedded-videos-hero-bg.png", channelUrl: CALLING_COMPASS_OFFICIAL_CHANNEL_URL, youtubeVideoId: "4zM2olpouIo", youtubeWatchUrl: "https://www.youtube.com/watch?v=4zM2olpouIo", playbackStatus: "verified" }),
  Object.freeze({ id: "local-power-of-prayer", order: 1, title: "The Power of Prayer", description: "A Scripture-rooted local preview for prayer, surrender, wisdom, and one faithful next step.", duration: "30:12", image: "public/images/today/teoyubeworld-search-bg.png", channelUrl: CALLING_COMPASS_OFFICIAL_CHANNEL_URL, youtubeVideoId: "yLBb7JCMqJE", youtubeWatchUrl: "https://www.youtube.com/watch?v=yLBb7JCMqJE", playbackStatus: "verified" }),
  Object.freeze({ id: "local-walk-in-purpose", order: 2, title: "Walk in Divine Purpose", description: "A cautious calling preview connected to Scripture, courage, fruit, counsel, and time.", duration: "21:47", image: "public/images/table/calling-compass-panel-bg.png", channelUrl: CALLING_COMPASS_OFFICIAL_CHANNEL_URL, youtubeVideoId: "yDu0bD1lukE", youtubeWatchUrl: "https://www.youtube.com/watch?v=yDu0bD1lukE", playbackStatus: "verified" }),
  Object.freeze({ id: "local-rooted-in-word", order: 3, title: "Rooted in His Word", description: "A local preview about Scripture remaining the highest authority.", duration: "28:16", image: "public/images/search/search-purpose-hero.png", channelUrl: CALLING_COMPASS_OFFICIAL_CHANNEL_URL, youtubeVideoId: "tnjdlvbaBY8", youtubeWatchUrl: "https://www.youtube.com/watch?v=tnjdlvbaBY8", playbackStatus: "verified" }),
  Object.freeze({ id: "local-called-for-more", order: 4, title: "Called for More", description: "A short local preview for prayerfully testing emerging calling patterns.", duration: "26:08", image: "public/images/canon/journey-calling.png", channelUrl: CALLING_COMPASS_OFFICIAL_CHANNEL_URL, youtubeVideoId: "chLnoAGxyrc", youtubeWatchUrl: "https://www.youtube.com/watch?v=chLnoAGxyrc", playbackStatus: "verified" }),
  Object.freeze({ id: "local-strength-for-today", order: 5, title: "Strength for Today", description: "A local preview for patient trust and one faithful next step.", duration: "19:45", image: "public/images/carousel/kingdom-wisdom.png", channelUrl: CALLING_COMPASS_OFFICIAL_CHANNEL_URL, youtubeVideoId: "jAmIjP7-T5w", youtubeWatchUrl: "https://www.youtube.com/watch?v=jAmIjP7-T5w", playbackStatus: "verified" }),
  Object.freeze({ id: "local-promise-language", order: 6, title: "Promise Language and Calling", description: "A local preview connecting promise language to visible Scripture evidence.", duration: "22:15", image: "public/images/carousel/growth-in-grace.png", channelUrl: CALLING_COMPASS_OFFICIAL_CHANNEL_URL, youtubeVideoId: "I8Y3syhDG64", youtubeWatchUrl: "https://www.youtube.com/watch?v=I8Y3syhDG64", playbackStatus: "verified" }),
  Object.freeze({ id: "local-daily-assignment", order: 7, title: "Daily Divine Assignment", description: "A local preview for translating Scripture and prayer into one faithful action.", duration: "20:15", image: "public/images/canon/canon-card-04.png", channelUrl: CALLING_COMPASS_OFFICIAL_CHANNEL_URL, youtubeVideoId: "YY9VYdPUVf8", youtubeWatchUrl: "https://www.youtube.com/watch?v=YY9VYdPUVf8", playbackStatus: "verified" })
]);

export function createCallingCompassClientContext(query = "calling purpose"): CallingCompassClientContextDto {
  const adapter = createCompassExperienceAdapterContext({ query });
  return Object.freeze({
    initialSearchTerm: adapter.initialSearchTerm,
    callingPath: Object.freeze({
      archetype: Object.freeze({ name: adapter.callingPath.archetype.name, summary: adapter.callingPath.archetype.summary }),
      confidenceLabel: adapter.callingPath.confidenceLabel,
      scriptureAnchors: Object.freeze([...adapter.callingPath.scriptureAnchors]),
      promises: Object.freeze(adapter.callingPath.promises.map((promise) => Object.freeze({ title: promise.title }))),
      actionSteps: Object.freeze([...adapter.callingPath.actionSteps])
    }),
    explanationPath: Object.freeze([...adapter.explanationPath]),
    fallbackUsed: adapter.callingPath.confidenceLabel === "fallback",
    warnings: Object.freeze([...adapter.validation.warnings]),
    blockers: Object.freeze([...adapter.validation.blockers]),
    noExternalServicesRequired: true,
    noBrowserPersistenceRequired: true
  });
}

function confidenceLabel(value: string): CallingDiscernmentDto["confidenceLabel"] {
  if (value === "direct") return "Strongest indicators suggest";
  if (value === "thematic") return "Appears to be emerging";
  return "Needs further discernment";
}

export function createCallingCompassViewModel(): CallingCompassViewModel {
  const context = createCompassExperienceAdapterContext({ query: "calling purpose builder" });
  const path = context.callingPath;
  const scriptureReference = path.scriptureAnchors[0] || "Ephesians 1:18";
  const label = confidenceLabel(path.confidenceLabel);
  const discernment = Object.freeze({
    title: path.archetype.name,
    summary: `${label} ${path.archetype.name} appears to be emerging. Prayerfully test this pattern through Scripture, wise counsel, fruit, and time.`,
    scriptureReference,
    relatedWords: Object.freeze(path.words.map((word) => word.word).filter(Boolean).slice(0, 4)),
    prayer: `Father, help me test these emerging patterns through ${scriptureReference}, wise counsel, fruit, and time.`,
    actionStep: path.actionSteps[0] || "Name one gift, one burden, and one humble step of service to review with wise counsel.",
    journeyRecommendation: `${path.archetype.name} discernment journey`,
    confidenceLabel: label,
    explanationPath: Object.freeze([...context.explanationPath]),
    limitation: "Calling is discerned over time; this result is an explainable pattern, not a final destiny or divine declaration."
  }) satisfies CallingDiscernmentDto;

  return Object.freeze({
    approvedHtml: APPROVED_VIEW_MARKUP.calling.initial,
    sourceDigest: APPROVED_VIEW_MARKUP.sourceDigest,
    questions: QUESTIONS,
    media: MEDIA,
    discernment
  });
}
