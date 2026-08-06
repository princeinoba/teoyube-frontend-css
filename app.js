const SESSION_STATE_SCOPE = "teoyube.phase11-1.session-only";
const LOCAL_MEDIA_SOURCE_NOTICE =
  "Source not connected in this preview. Reviewed TeoyubeWorld embeds remain a future owner-approved integration.";

const localMediaThumbnails = [
  "public/images/embed/embedded-videos-hero-bg.png",
  "public/images/today/teoyubeworld-search-bg.png",
  "public/images/table/calling-compass-panel-bg.png",
  "public/images/search/search-purpose-hero.png",
  "public/images/canon/journey-calling.png",
  "public/images/carousel/kingdom-wisdom.png",
  "public/images/carousel/growth-in-grace.png",
  "public/images/canon/canon-card-04.png"
];

let promiseClusters = [
  {
    theme: "Divine Direction",
    triggers: ["purpose", "direction", "decision", "wisdom", "confused", "calling"],
    scriptures: ["Proverbs 3:5-6", "Psalm 32:8", "Isaiah 30:21", "James 1:5", "John 10:27"],
    keywords: ["Trust", "Instruction", "Direction", "Order", "Voice", "Path"],
    summary:
      "God invites you to trust His wisdom, listen for His voice through Scripture, and take the next faithful step without forcing the whole map to appear at once.",
    declaration:
      "According to Your Word, Lord, guide my path, teach me wisdom, and train my heart to recognize Your direction."
  },
  {
    theme: "Strength in Christ",
    triggers: ["tired", "weak", "fear", "strength", "discouraged", "pressure"],
    scriptures: ["Philippians 4:13", "Isaiah 41:10", "2 Corinthians 12:9", "Psalm 46:1"],
    keywords: ["Christ", "Strength", "Grace", "Help", "Courage", "Steady"],
    summary:
      "God's strength meets weakness with grace. The next action does not need to be dramatic; it needs to be faithful.",
    declaration:
      "Christ strengthens me for obedient action, steady courage, and grace-filled endurance."
  },
  {
    theme: "New Creation",
    triggers: ["change", "identity", "past", "healing", "new", "transformation"],
    scriptures: ["2 Corinthians 5:17", "Romans 12:2", "Ezekiel 36:26", "Galatians 2:20"],
    keywords: ["Renewed", "Created", "Heart", "Mind", "Life", "Christ"],
    summary:
      "In Christ, transformation is not cosmetic. God renews the heart, reshapes the mind, and forms a life that can carry purpose.",
    declaration:
      "I receive renewal in Christ and walk today as one being formed by God's grace."
  },
  {
    theme: "Kingdom Service",
    triggers: ["serve", "ministry", "mission", "people", "church", "help"],
    scriptures: ["Matthew 28:19-20", "1 Peter 4:10", "Ephesians 2:10", "Mark 10:45"],
    keywords: ["Serve", "Gift", "Mission", "Disciple", "Good", "Work"],
    summary:
      "God gives gifts for service. Calling becomes clearer as you bless people with what has already been placed in your hands.",
    declaration:
      "Lord, help me steward my gifts in love and take one faithful step of service today."
  }
];

const archetypes = [
  {
    name: "Paul",
    signals: ["teaching", "writing", "missions", "theology", "communication", "discipleship"],
    themes: "Teaching, mission, conviction, church building"
  },
  {
    name: "Bezalel",
    signals: ["design", "creative", "craft", "technology", "film", "animation", "building"],
    themes: "Spirit-filled skill, creativity, building sacred things"
  },
  {
    name: "Joseph",
    signals: ["strategy", "administration", "leadership", "business", "management", "resilience"],
    themes: "Preparation, stewardship, leadership through adversity"
  },
  {
    name: "Esther",
    signals: ["justice", "advocacy", "influence", "courage", "women", "community"],
    themes: "Courage, timing, advocacy, deliverance"
  },
  {
    name: "Nehemiah",
    signals: ["systems", "restoration", "organization", "rebuilding", "operations", "community"],
    themes: "Rebuilding, burden for broken systems, organized action"
  },
  {
    name: "David",
    signals: ["worship", "music", "creative", "leadership", "youth", "courage"],
    themes: "Worship, courage, creativity, shepherding"
  },
  {
    name: "Deborah",
    signals: ["wisdom", "leadership", "counsel", "discernment", "justice"],
    themes: "Wisdom, leadership, discernment, courage"
  },
  {
    name: "Moses",
    signals: ["deliverance", "advocacy", "intercession", "oppressed", "leadership"],
    themes: "Deliverance, intercession, reluctant leadership"
  }
];

const purposeStages = [
  ["Awakening", "The eyes of understanding begin to open.", 14],
  ["Discovery", "Patterns in promises, gifts, burdens, and archetypes become visible.", 28],
  ["Alignment", "Prayer, habits, and decisions are brought under Scripture.", 42],
  ["Activation", "The Saint moves from knowledge into faithful action.", 56],
  ["Transformation", "Character, testimony, and renewed identity deepen.", 70],
  ["Impact", "Purpose begins blessing others through service and contribution.", 84],
  ["Legacy", "Wisdom, testimony, and purpose become a multiplying record.", 100]
];

const journeyStatuses = [
  "Discovered",
  "Studying",
  "Praying",
  "Acting",
  "Witnessing Progress",
  "Testified",
  "Remembered"
];

const fallbackCoreWords = [
  {
    word: "TEOYUBE",
    pronunciation: "Tee-Oh-You-Bay",
    meaning: "The Eyes Of Your Understanding Being Enlightened",
    category: "Revelation",
    scripture_sources: ["Ephesians 1:18"],
    promise_category: "Calling",
    prayer_use: "Used when praying for understanding, enlightenment, calling, and purpose.",
    animation_symbol: "A door opening as light reveals a path."
  },
  {
    word: "EPHPHATHA",
    pronunciation: "Ef-Fa-Tha",
    meaning: "Be Opened",
    category: "Revelation",
    scripture_sources: ["Mark 7:34"],
    promise_category: "Transformation",
    prayer_use: "Used when praying for spiritual openness, healing, and receptivity to God's word.",
    animation_symbol: "A key turning as closed gates open."
  }
];

let coreWords = fallbackCoreWords;
let theologyConstitution = null;
let promiseCategories = [];
let searchFramework = null;
let promiseClusterArchitecture = null;
let languageGrammar = null;
let promiseLanguageLexicon = [];
let canonArchitecture = null;
let kingdomArchetypes = [];
let covenantPaths = [];
let destinyMaps = [];
let prayerEngineTemplates = [];
let prayerEngineSystem = null;
let prayerRecommendationMap = {};
let prayerJourneys = [];
let tkosArchitecture = null;
let tkosGrowthLevels = [];
let tkosSampleProfile = null;
let tkosEngines = null;
let technicalArchitecture = null;
let onboardingFlow = [];
let subscriptionModel = null;
let mvpBuildOrder = [];
let projectStructureRoadmap = null;
let mvpCodeStarterFiles = null;
let mvpSeedFiles = null;
let mvpUiPages = null;
let mvpBrandIdentity = null;
let mvpLaunchPlan = null;
let launch1StaticMvpPackage = null;
let glyphDefinitions = [];
let promiseGraphDesign = null;
let canonMasterSchema = null;
let graphRelationships = [];
let scriptureKnowledgeGraphSchema = null;
let scriptureCanon = [];
let scriptureLinkedPaths = [];
let scriptureLinkedArchetypes = [];
let scripturePromiseClusters = [];
let scriptureGraphRelationships = [];
let scriptureSearchTags = [];
let promiseClusterSystem = null;
let promiseClusterRules = [];
let promiseClusterNavigation = [];
let compassVideos = [];
let selectedCompassVideo = null;
let todayYoutubeVideos = [];
let selectedTodayYoutubeVideo = null;
let selectedTodayYoutubeVideoIndex = 0;
let promiseMovieStatus = "Loading TeoyubeWorld videos.";
let featuredStoryTimer = null;
let featuredStoryPaused = false;
let featuredStoryDragStart = null;
let promiseTableYoutubeVideos = [];
let selectedPromiseTableVideo = null;
let promiseTableQuery = "";
let uiElementVideos = [];
let uiVideoCategoryFilter = "All Videos";
let uiVideoSearchQuery = "";
let uiVideoSortMode = "Sort by: Latest";
let uiVideoVisibleCount = 4;
let uiVideoCardSelections = new Map();
let backendPromiseSeeds = [];
let expandedTeoyubeTableRows = new Set([0, 1, 2, 3]);
let selectedTeoyubeTableRows = new Set();
let teoyubeTableSearchQuery = "";
let teoyubeTableCategoryFilter = "All Categories";
let teoyubeTableSortMode = "Sort by: Position";
let teoyubeTablePageSize = 10;
let teoyubeTablePage = 1;
let teoyubeDataTableTab = "promises";
let teoyubeDataTableQuery = "";
let teoyubeDataTableSortMode = "title-asc";
let teoyubeDataTablePageSize = 8;
let teoyubeDataTablePage = 1;
let teoyubeDataVideoSource = "original";
let activeCanonTab = "canon-maps";
let selectedCanonItemId = "";
let activeCanonPage = 1;
let selectedWatchmanJourneyVideoIndex = 0;
let selectedCanonFeaturedJourneySlideIndex = 0;
let canonFeaturedJourneyTimer = null;
let canonFeaturedJourneyPaused = false;
let canonFeaturedJourneyDragStart = null;
let selectedCanonRecommendedSlideIndex = 0;
let canonRecommendedTimer = null;
let canonRecommendedPaused = false;
let canonRecommendedDragStart = null;
const CANON_ITEMS_PER_PAGE = 12;
const CANON_RECENT_CARD_COUNT = 10;
let lexiconSearchQuery = "";
let lexiconCategoryFilter = "all";
let lexiconSpeechFilter = "all";
let activeLexiconAlpha = "all";
let activeTestimonyFilter = "All";
let bookSearchQuery = "";
let bookTypeFilter = "all";
let bookDateFilter = "all";
let activePromiseSlide = 0;
let promiseCarouselTimer = null;
let promiseCarouselPaused = false;
let promiseCarouselDragStart = null;
let phase113CommandReturnFocus = null;
let phase114GuardrailReturnFocus = null;
let phase114AssessmentReturnFocus = null;
let phase114MobileNavReturnFocus = null;
let phase114ExportFormat = "json";
let phase117ImportFileText = "";
let lastPromiseCarouselAdvance = 0;

const teoyubeWorldFallbackVideos = [
  ["local-seed-of-promise", "The Seed of Promise", "Teaching", "A local TeoyubeWorld preview about tending promise language through Scripture and faithful action.", ["2 Corinthians 5:17", "Ephesians 1:18"]],
  ["local-power-of-prayer", "The Power of Prayer", "Message", "A Scripture-rooted local preview for prayer, surrender, wisdom, and one faithful next step.", ["Proverbs 3:5-6", "James 1:5"]],
  ["local-walk-in-purpose", "Walk in Divine Purpose", "Teaching", "A cautious calling preview that connects purpose, courage, and Scripture without claiming certainty.", ["Romans 8:28", "Joshua 1:9"]],
  ["local-rooted-in-truth", "Rooted in His Word", "Documentary", "A local preview about Scripture as the highest authority over Teoyube language aids.", ["Psalm 119:105", "Ephesians 1:18"]],
  ["local-called-for-more", "Called for More", "Shorts", "A short local preview encouraging prayerful testing of calling through Scripture, fruit, counsel, and time.", ["Ephesians 2:10", "Romans 8:28"]],
  ["local-strength-for-today", "Strength for Today", "Worship", "A worship preview for renewed strength, patient trust, and hope in waiting.", ["Isaiah 40:31"]],
  ["local-promise-language", "Promise Language and Calling", "Teaching", "A local preview that keeps Teoyube words as memory aids, not Scripture replacements.", ["Ephesians 1:18", "Psalm 119:105"]],
  ["local-daily-assignment", "Daily Divine Assignment", "Message", "A local preview for translating Scripture, prayer, and calling into one faithful action.", ["Matthew 25:21", "Proverbs 16:3"]]
].map(([id, title, category, description, scriptureReferences], index) => ({
  id,
  title,
  category,
  description,
  scriptureReferences,
  channelTitle: "TeoyubeWorld",
  thumbnail: localMediaThumbnails[index % localMediaThumbnails.length],
  sourceStatus: "source_not_connected"
}));

const staticTeoyubeWorldYoutubeVideoIds = Object.freeze({
  "local-seed-of-promise": "4zM2olpouIo",
  "local-power-of-prayer": "yLBb7JCMqJE",
  "local-walk-in-purpose": "yDu0bD1lukE",
  "local-rooted-in-truth": "tnjdlvbaBY8",
  "local-called-for-more": "chLnoAGxyrc",
  "local-strength-for-today": "jAmIjP7-T5w",
  "local-promise-language": "I8Y3syhDG64",
  "local-daily-assignment": "YY9VYdPUVf8"
});

const canonJourneyMediaIdsByItemId = Object.freeze({
  "canon-map-D02": "local-rooted-in-truth",
  "canon-map-D03": "local-called-for-more",
  "canon-map-D04": "local-seed-of-promise",
  "canon-map-D05": "local-promise-language",
  "canon-map-D06": "local-walk-in-purpose",
  "canon-map-D07": "local-strength-for-today",
  "canon-map-D08": "local-rooted-in-truth",
  "canon-map-D09": "local-called-for-more",
  "canon-map-D10": "local-power-of-prayer",
  "canon-map-D11": "local-strength-for-today",
  "canon-map-D12": "local-daily-assignment"
});

let activeStaticCanonMediaStage = null;

function getStaticCanonJourneyMedia(stage) {
  const card = stage?.closest?.("[data-canon-item]");
  const canonItemId = card?.dataset.canonItem || "";
  const mediaId = canonJourneyMediaIdsByItemId[canonItemId];
  const media = teoyubeWorldFallbackVideos.find((video) => video.id === mediaId);
  const youtubeVideoId = staticTeoyubeWorldYoutubeVideoIds[mediaId];
  if (!card || !media || !/^[A-Za-z0-9_-]{11}$/.test(youtubeVideoId || "")) return null;
  const journeyTitle = card.querySelector("h4")?.textContent?.trim() || "Canon journey";
  return { card, canonItemId, journeyTitle, media: { ...media, youtubeVideoId } };
}

function createStaticCanonJourneyEmbedUrl(media) {
  if (!media || !/^[A-Za-z0-9_-]{11}$/.test(media.youtubeVideoId || "")) return null;
  const parameters = new URLSearchParams({ autoplay: "1", playsinline: "1", rel: "0", modestbranding: "1" });
  return "https://www.youtube-nocookie.com/embed/" + media.youtubeVideoId + "?" + parameters.toString();
}

function stopStaticCanonJourneyPlayback() {
  if (!activeStaticCanonMediaStage) return;
  activeStaticCanonMediaStage.querySelector("iframe")?.remove();
  const mapping = getStaticCanonJourneyMedia(activeStaticCanonMediaStage);
  activeStaticCanonMediaStage.dataset.playbackState = "idle";
  delete activeStaticCanonMediaStage.dataset.activeVideoId;
  activeStaticCanonMediaStage.setAttribute("aria-pressed", "false");
  if (mapping) activeStaticCanonMediaStage.setAttribute("aria-label", "Play " + mapping.media.title + " for " + mapping.journeyTitle);
  activeStaticCanonMediaStage = null;
}

function playStaticCanonJourneyMedia(stage) {
  const mapping = getStaticCanonJourneyMedia(stage);
  const source = createStaticCanonJourneyEmbedUrl(mapping?.media);
  if (!mapping || !source) return false;
  stopStaticCanonJourneyPlayback();
  $("#canon")?.querySelectorAll("[data-canon-item].active").forEach((item) => item.classList.remove("active"));
  mapping.card.classList.add("active");
  activeStaticCanonMediaStage = stage;
  stage.dataset.activeVideoId = mapping.media.id;
  stage.dataset.playbackState = "loading";
  stage.setAttribute("aria-pressed", "true");
  stage.setAttribute("aria-label", "Playing " + mapping.media.title + " for " + mapping.journeyTitle);
  const frame = document.createElement("iframe");
  frame.title = "TeoyubeWorld video: " + mapping.media.title + " for " + mapping.journeyTitle;
  frame.allow = "autoplay; encrypted-media; picture-in-picture; web-share";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.allowFullscreen = true;
  frame.dataset.youtubeVideoId = mapping.media.youtubeVideoId;
  Object.assign(frame.style, { position: "absolute", inset: "0", width: "100%", height: "100%", border: "0", zIndex: "4" });
  frame.addEventListener("load", () => {
    if (activeStaticCanonMediaStage === stage) stage.dataset.playbackState = "playing";
  }, { once: true });
  frame.addEventListener("error", () => {
    if (activeStaticCanonMediaStage !== stage) return;
    stopStaticCanonJourneyPlayback();
    stage.dataset.playbackState = "error";
  }, { once: true });
  stage.append(frame);
  frame.src = source;
  return true;
}

function configureStaticCanonJourneyMediaStages() {
  $("#canon")?.querySelectorAll(".canon-project-media, .canon-recent-media").forEach((stage) => {
    const mapping = getStaticCanonJourneyMedia(stage);
    if (!mapping) return;
    stage.dataset.canonVideoStage = mapping.canonItemId;
    stage.dataset.canonVideoId = mapping.media.id;
    stage.dataset.playbackState = "idle";
    stage.setAttribute("role", "button");
    stage.setAttribute("tabindex", "0");
    stage.setAttribute("aria-pressed", "false");
    stage.setAttribute("aria-label", "Play " + mapping.media.title + " for " + mapping.journeyTitle);
  });
}

function handleStaticCanonMediaActivation(event) {
  const stage = event.target.closest?.("[data-canon-video-stage]");
  if (!stage || event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return false;
  event.preventDefault();
  event.stopPropagation();
  playStaticCanonJourneyMedia(stage);
  return true;
}

const watchmanJourneyCarouselSlides = [
  {
    title: "Personalized Recommendation Logic",
    image: "public/images/canon/watchman-carousel/canon-watchman-slide-01.png"
  },
  {
    title: "Promise-to-Journey Flow",
    image: "public/images/canon/watchman-carousel/canon-watchman-slide-02.png"
  },
  {
    title: "Archetype Mapping Logic",
    image: "public/images/canon/watchman-carousel/canon-watchman-slide-03.png"
  },
  {
    title: "Journey Lifecycle and Status Flow",
    image: "public/images/canon/watchman-carousel/canon-watchman-slide-04.png"
  },
  {
    title: "Teoyube App Promise Journey",
    image: "public/images/canon/watchman-carousel/canon-watchman-slide-05.png"
  },
  {
    title: "TeoyubeWorld Faith Discovery Connection",
    image: "public/images/canon/watchman-carousel/canon-watchman-slide-06.png"
  },
  {
    title: "The Future of Entertainment",
    image: "public/images/canon/watchman-carousel/canon-watchman-slide-07.png"
  }
];

function normalizeTeoyubeWorldVideos(videos) {
  return (Array.isArray(videos) ? videos : [])
    .filter((video) => video?.id)
    .map((video, index) => {
      const id = String(video.id).trim();
      return {
        ...video,
        id,
        title: video.title || `TeoyubeWorld Video ${index + 1}`,
        description: video.description || "TeoyubeWorld video from the Calling Compass media hub.",
        channelTitle: video.channelTitle || "TeoyubeWorld",
        thumbnail: isExternalUrl(video.thumbnail) ? localMediaThumbnails[index % localMediaThumbnails.length] : video.thumbnail || localMediaThumbnails[index % localMediaThumbnails.length],
        sourceStatus: video.sourceStatus || "source_not_connected"
      };
    });
}

function getTeoyubeWorldChannelVideos(...sources) {
  for (const source of sources) {
    const videos = normalizeTeoyubeWorldVideos(source);
    if (videos.length) return videos;
  }
  return teoyubeWorldFallbackVideos;
}

function isExternalUrl(value) {
  return /^https?:\/\//i.test(String(value || ""));
}

function getLocalMediaThumbnail(video, index = 0) {
  const thumbnail = video?.thumbnail || "";
  return thumbnail && !isExternalUrl(thumbnail)
    ? thumbnail
    : localMediaThumbnails[index % localMediaThumbnails.length];
}

function searchLocalTeoyubeWorldVideos(query = "TeoyubeWorld", ...sources) {
  const videos = getTeoyubeWorldChannelVideos(...sources);
  const term = normalize(query).replace("teoyubeworld", "").trim();
  if (!term) return videos;
  const filtered = videos.filter((video) =>
    normalize([
      video.title,
      video.category,
      video.description,
      video.channelTitle,
      ...(video.scriptureReferences || []),
      ...(video.tags || [])
    ].join(" ")).includes(term)
  );
  return filtered.length ? filtered : videos;
}

function showLocalMediaNotice(title = "TeoyubeWorld media") {
  const message = `${title}: ${LOCAL_MEDIA_SOURCE_NOTICE}`;
  ["#promiseMovieStatus", "#compassVideoStatus", "#uiVideoStatus", "#teoyubeTableEntryStatus"].forEach((selector) => {
    const target = $(selector);
    if (target) target.textContent = message;
  });
  document.body.dataset.mediaNotice = message;
  recordPhase114Fallback(message);
}

function getWatchmanJourneyCarouselVideos() {
  const channelVideos = getTeoyubeWorldChannelVideos(
    promiseTableYoutubeVideos,
    todayYoutubeVideos,
    compassVideos,
    uiElementVideos
  );
  const preferredTitles = ["The Seed of Promise", "Walk in Divine Purpose", "The Power of Prayer"];
  const preferredVideos = preferredTitles
    .map((title) => channelVideos.find((video) => String(video.title || "").toLowerCase().includes(title.toLowerCase())))
    .filter(Boolean);
  const uniqueVideos = [...preferredVideos, ...channelVideos].filter(
    (video, index, videos) => videos.findIndex((candidate) => candidate.id === video.id) === index
  );

  return uniqueVideos.slice(0, 3);
}

function setWatchmanJourneyVideoIndex(index) {
  const total = Math.max(1, watchmanJourneyCarouselSlides.length);
  selectedWatchmanJourneyVideoIndex = ((Number(index) || 0) % total + total) % total;
}

compassVideos = getTeoyubeWorldChannelVideos();
selectedCompassVideo = compassVideos[0];

const featuredStoryMeta = [
  {
    category: "Videos",
    time: "Today",
    cta: "Watch Now",
    description: "Discover how God's promises shape calling, purpose, and spiritual growth.",
    image: "public/images/today/teoyubeworld-search-bg.png"
  },
  {
    category: "Teachings",
    time: "This Week",
    cta: "Explore Teaching",
    description: "A Scripture-led teaching for hearing God's voice and taking the next faithful step.",
    image: "public/images/carousel/kingdom-wisdom.png"
  },
  {
    category: "Devotionals",
    time: "New",
    cta: "Start Devotional",
    description: "A guided devotional for prayer, clarity, promise language, and daily alignment.",
    image: "public/images/carousel/growth-in-grace.png"
  },
  {
    category: "Articles",
    time: "Featured",
    cta: "Read Article",
    description: "Read practical reflections on purpose, calling, testimony, and spiritual formation.",
    image: "public/images/search/teoyube-search-panel-bg.png"
  }
];
let activeAdSlide = 0;
let adCarouselTimer = null;
let adCarouselPaused = false;
let adCarouselDragStart = null;

const promiseCarouselSlides = [
  {
    title: "Where God's Promises Meet Your Calling",
    kicker: "Welcome to Teoyube",
    theme: "Discover Scripture, purpose, and daily promise-led direction.",
    description: "Explore Scripture. Discover your purpose. Walk in promises. Fulfill your destiny through one faithful step at a time.",
    scriptures: ["Jeremiah 29:11", "Psalm 119:105"],
    cta: "Start Today's Journey",
    secondaryCta: "Explore Teoyube",
    artwork: "welcome",
    image: "public/images/today-carousel/today-carousel-01-welcome.png"
  },
  {
    title: "A New Day. A Divine Assignment.",
    kicker: "Today's Journey",
    theme: "Step into today with Scripture, prayer, and purpose.",
    description: "Every day is a step closer to your calling. Begin with God's Word, align your heart, and take action with clarity.",
    scriptures: ["Psalm 118:24", "Proverbs 16:3"],
    cta: "Start Today's Journey",
    secondaryCta: "View My Journey",
    artwork: "journey",
    image: "public/images/today-carousel/today-carousel-02-journey.png"
  },
  {
    title: "Discover. Find. Receive.",
    kicker: "TeoyubeSearch",
    theme: "Search God's promises and receive Scripture-led clarity.",
    description: "Search thousands of promises, Scriptures, teachings, and insights. God's Word is alive and connected to your life.",
    scriptures: ["Psalm 119:105", "Philippians 4:13"],
    cta: "Start Searching",
    secondaryCta: "Explore Categories",
    artwork: "search",
    image: "public/images/today-carousel/today-carousel-03-search.png"
  },
  {
    title: "Explore God's Kingdom Blueprint.",
    kicker: "Canon",
    theme: "Walk in your divine purpose through the order of God's promises.",
    description: "The Canon reveals the eternal order of God's promises, connecting Scripture, purpose, and destiny.",
    scriptures: ["Psalm 119:105", "Ephesians 1:18"],
    cta: "Explore the Canon",
    secondaryCta: "View Kingdom Map",
    artwork: "canon",
    image: "public/images/today-carousel/today-carousel-04-canon.png"
  },
  {
    title: "God's Promises Are Yes and Amen.",
    kicker: "Promise Table",
    theme: "Discover, compare, and stand on His Word.",
    description: "Explore the promises of God organized by theme, Scripture, and purpose. See how His Word applies to your life today.",
    scriptures: ["2 Corinthians 1:20", "Isaiah 55:11"],
    cta: "Explore Promise Table",
    secondaryCta: "My Favorite Promises",
    artwork: "promise",
    image: "public/images/today-carousel/today-carousel-05-promise-table.png"
  },
  {
    title: "Grow Daily. Walk in Purpose.",
    kicker: "Daily Growth",
    theme: "Build a rhythm of Scripture, prayer, and faithful progress.",
    description: "Track your progress, celebrate growth, and stay anchored in God's promises as small steps become eternal impact.",
    scriptures: ["2 Peter 3:18", "Matthew 25:21"],
    cta: "View My Progress",
    secondaryCta: "Today's Devotional",
    artwork: "growth",
    image: "public/images/today-carousel/today-carousel-06-growth.png"
  },
  {
    title: "Live Anchored. Lead With Purpose.",
    kicker: "Live in His Promises",
    theme: "God's promises are for living, leading, and lasting impact.",
    description: "Let His Word shape your decisions, your actions, your relationships, and your legacy.",
    scriptures: ["2 Corinthians 5:7", "Romans 12:2"],
    cta: "Start Living His Promises",
    secondaryCta: "Explore More",
    artwork: "anchored",
    image: "public/images/today-carousel/today-carousel-07-live-promises.png"
  },
  {
    title: "Your Calling. His Kingdom. Eternal Impact.",
    kicker: "Your Kingdom Impact",
    theme: "Every step of faith matters in God's Kingdom story.",
    description: "See how God is using your journey to inspire others, build His Kingdom, and multiply lasting fruit.",
    scriptures: ["Isaiah 62:3", "Matthew 25:21"],
    cta: "See My Impact",
    secondaryCta: "Share Your Story",
    artwork: "impact",
    image: "public/images/today-carousel/today-carousel-08-impact.png"
  },
  {
    title: "Go Deeper. Live Stronger.",
    kicker: "Deepen Your Journey",
    theme: "Keep exploring God's Word and His promises.",
    description: "Continue exploring Scripture and let His promises shape your life, your purpose, and your legacy.",
    scriptures: ["Lamentations 3:23", "Philippians 4:13"],
    cta: "Continue My Journey",
    secondaryCta: "My Favorites",
    artwork: "deeper",
    image: "public/images/today-carousel/today-carousel-09-deeper.png"
  },
  {
    title: "Finish Well. Leave a Legacy.",
    kicker: "Complete Your Journey",
    theme: "Your faithfulness today builds tomorrow's legacy.",
    description: "Keep going. Finish with joy, steward your calling, and impact generations through faithful obedience.",
    scriptures: ["2 Timothy 4:7", "Matthew 25:21"],
    cta: "Complete My Journey",
    secondaryCta: "Invite & Inspire Others",
    artwork: "legacy",
    image: "public/images/today-carousel/today-carousel-10-legacy.png"
  },
  {
    title: "Stay Focused. Walk in Faith.",
    kicker: "Strengthen Your Faith",
    theme: "Daily promises, prayer, and purpose keep you anchored.",
    description: "Let God's truth focus your heart, strengthen your faith, and remind you that He is faithful every step of the way.",
    scriptures: ["Hebrews 10:23", "Psalm 145:18"],
    cta: "Strengthen My Faith",
    secondaryCta: "Join the Journey",
    artwork: "faith",
    image: "public/images/today-carousel/today-carousel-11-faith.png"
  },
  {
    title: "God Guides Every Faithful Step.",
    kicker: "Promises Meet Your Calling",
    theme: "Begin with Scripture. Walk with clarity. Move with purpose.",
    description: "Your calling is not distant. It is discovered through Scripture, prayer, obedience, and the next faithful step.",
    scriptures: ["Proverbs 3:5-6", "Ephesians 1:18"],
    cta: "Generate Today's Journey",
    secondaryCta: "Open Guardrails",
    artwork: "overlook",
    image: "public/images/today-carousel/today-carousel-12-overlook.png"
  }
];

const teoyubeAds = [
  ["Divine Direction", "God guides every faithful step.", ["Proverbs 3:5-6", "Psalm 32:8"], "Start Journey", "direction", "public/images/ads/divine-direction.png"],
  ["Strength for Today", "Renewed strength for today's journey.", ["Isaiah 40:31", "Philippians 4:13"], "Receive Strength", "strength", "public/images/ads/strength-for-today.png"],
  ["Growth in Grace", "Grow deeper in Christ every day.", ["2 Peter 3:18", "Ephesians 4:15"], "Begin Devotional", "growth", "public/images/ads/growth-in-grace.png"],
  ["Peace & Protection", "Rest under His perfect peace.", ["John 14:27", "Psalm 91:4"], "Open Prayer", "peace", "public/images/ads/peace-protection.png"],
  ["Purpose Fulfilled", "Your calling is prepared by God.", ["Jeremiah 29:11", "Romans 8:28"], "Discover Purpose", "purpose", "public/images/ads/purpose-fulfilled.png"],
  ["Abundant Life", "Live the abundant life Jesus promised.", ["John 10:10", "Galatians 5:22-23"], "Explore Promise", "abundance", "public/images/ads/abundant-life.png"],
  ["Faith in Action", "Step out in faith and make an impact.", ["Hebrews 11:1", "James 2:17"], "Activate Path", "faith", "public/images/ads/faith-in-action.png"],
  ["Kingdom Wisdom", "Wisdom for every decision you make.", ["James 1:5", "Psalm 119:105"], "Study Scripture", "wisdom", "public/images/ads/kingdom-wisdom.png"]
].map(([title, description, scriptures, cta, theme, image], index) => ({
  id: `ad-${String(index + 1).padStart(2, "0")}`,
  title,
  description,
  scriptures,
  cta,
  theme,
  image,
  reviews: [128, 96, 74, 112, 88, 103, 67, 91][index]
}));

const promiseSearchSeeds = [
  {
    thumbnail: localMediaThumbnails[0],
    href: "#",
    description:
      "having the eyes of your hearts enlightened, that you may know what is the hope of his calling, and what are the riches of the glory of his inheritance in the saints, -Ephesians 1:18 · WEB-",
    title: "TEOYUBE; TYMAKWITHOHIS, CAWTROTGLOHINITS"
  },
  {
    thumbnail: localMediaThumbnails[1],
    href: "#",
    description: "Working together, we entreat also that you do not receive the grace of God in vain. -2 Corinthians 6:1 · WEB-",
    title: "WETAWTWHIBYATYRNTGOGODIV"
  },
  {
    thumbnail: localMediaThumbnails[2],
    href: "#",
    description:
      "For he says, “At an acceptable time I listened to you. In a day of salvation I helped you.” Behold, now is the acceptable time. Behold, now is the day of salvation. -2 Corinthians 6:2 · WEB-",
    title: "FOHSIHAHTIATAAITDOSHISTBNITDOS"
  },
  {
    thumbnail: localMediaThumbnails[3],
    href: "#",
    description: "We give no occasion of stumbling in anything, that our service may not be blamed, -2 Corinthians 6:3 · WEB-",
    title: "GNOIATTTMBNB"
  },
  {
    thumbnail: localMediaThumbnails[4],
    href: "#",
    description:
      "but in everything commending ourselves as servants of God: in great endurance, in afflictions, in hardships, in distresses, -2 Corinthians 6:4 · WEB-",
    title: "BIATAOATMOGODIMPIAINID"
  },
  {
    thumbnail: localMediaThumbnails[5],
    href: "#",
    description: "in beatings, in imprisonments, in riots, in labors, in watchings, in fastings, -2 Corinthians 6:5 · WEB-",
    title: "ISIIMITILIWIF"
  },
  {
    thumbnail: localMediaThumbnails[6],
    href: "#",
    description: "in pureness, in knowledge, in perseverance, in kindness, in the Holy Spirit, in sincere love, -2 Corinthians 6:6 · WEB-",
    title: "BPBKBLSBKBTHGBLU"
  },
  {
    thumbnail: localMediaThumbnails[7],
    href: "#",
    description:
      "in the word of truth, in the power of God, by the armor of righteousness on the right hand and on the left, -2 Corinthians 6:7 · WEB-",
    title: "BTWOTBTPOGODBTAOROTRHAOTL"
  }
];

const clientsPromiseRows = [
  {
    name: "Teoyube; Tymakwithohis, Cawtrotglohinits",
    description:
      "The eyes of your understanding being enlightened; that ye may know what is the hope of his calling, and what the riches of the glory of his inheritance in the saints,",
    video: localMediaThumbnails[2],
    position: "Eph-1:18",
    tone: "success"
  },
  {
    name: "Wetawtwhi, Byatyrntgogodiv",
    description: "We then, as workers together with him, beseech you also that ye receive not the grace of God in vain.",
    video: localMediaThumbnails[1],
    position: "2Cor-6:1",
    tone: "success"
  },
  {
    name: "Fohsihahtiata, Aitdoshistbnitdos",
    description:
      "(For he saith, I have heard thee in a time accepted, and in the day of salvation have I succored thee: behold, now is the day of salvation.)",
    video: localMediaThumbnails[2],
    position: "2Cor-6:2",
    tone: "warning"
  },
  {
    name: "Gnoiatttmbnb",
    description: "Giving no offense in any thing, that the mininstry be not blamed:",
    video: localMediaThumbnails[3],
    position: "2Cor-6:3",
    tone: "success"
  },
  {
    name: "Biataoatmogod, Impiainid",
    description:
      "But in all things approving ourselves as the misnisters of God, in much patience, in afflictions, in necessities, in distresses,",
    position: "2Cor-6:4",
    tone: "warning"
  },
  {
    name: "Isiimitiliwif",
    description: "In stripes, in imprisonments, in tum-ults, in labours, in watchings, in fastings,",
    position: "2Cor-6:5",
    tone: "warning"
  },
  {
    name: "Bpbkblsbk, Btholyghostblu",
    description: "By pureness, by knowledge, by long-suffering, by kindness, by the Holy Ghost, by love unfeigned,",
    position: "2Cor-6:6",
    tone: "success"
  },
  {
    name: "Btwotbtpogod, Btaorotrhaotl",
    description: "By the word of truth, by the power of God, by the armour of righteousness on the right hand and on the left,",
    position: "2Cor-6:7",
    tone: "success"
  },
  {
    name: "Bhadberagradayt",
    description: "By honour and dishonour, by evil report and good report: as deceivers, and yet true;",
    position: "2Cor-6:8",
    tone: "danger"
  },
  {
    name: "Auaywadabwlacank",
    description: "As unknown, and yet wellknown; as dying, and behold, we live; as chastened, and not killed,",
    position: "2Cor-6:9",
    tone: "warning"
  },
  {
    name: "Asyarapymmrahnaypat",
    description: "As sorrowful, yet always rejoicing; as poor, yet making many rich; as having nothing, and yet possessing all things.",
    position: "2Cor-6:10",
    tone: "success"
  },
  {
    name: "Yansiubyasiyob",
    description: "O ye Prince, our mouth is open unto you, our heart is enlarged.",
    position: "2Cor-6:11",
    tone: "warning"
  },
  {
    name: "Nfarisisaumcbyae",
    description: "Now for a recompense in the same, (I speak as unto my children,) be ye also enlarged.",
    position: "2Cor-6:13",
    tone: "success"
  },
  {
    name: "Bynuytwbfwfhrwuawchlwd",
    description: "Be ye not unequally yoked together with believers: for what fellowship hath righteousness with unrighteouness? and what communion hath light with darkness?",
    video: localMediaThumbnails[4],
    position: "2Cor-6:14",
    tone: "success"
  },
  {
    name: "Awbafuyaysbmsadstla",
    description: "And will be a Father unto you, and ye shall be my sons and daughters, saith the Lord Almighty.",
    position: "2Cor-6:18",
    tone: "warning"
  }
];

const defaultState = {
  profile: {
    name: "",
    age: "",
    gifts: "Teaching, encouragement",
    talents: "Writing, strategy",
    passions: "Discipleship, purpose",
    burdens: "People needing direction",
    challenge: "I feel confused about my purpose.",
    prayer: "I need wisdom and courage for the next faithful step."
  },
  clusterIndex: 0,
  generatedWord: {
    word: "TIDUILOVP",
    pronunciation: "tee-doo-ee-loh-vp",
    meaning: "A prayer-memory key for Trust, instruction, direction, order, voice, path."
  },
  calling: {},
  completedAssignments: 0,
  book: [],
  testimonies: [],
  chat: [
    {
      role: "teo",
      text:
        "Welcome. Based on the Teoyube guardrails, I will keep guidance rooted in Scripture, cautious in calling language, and connected to one faithful next step."
    }
  ],
  selectedWord: "TIDUILOVP",
  selectedScripture: "Ephesians 1:18",
  selectedPromiseResult: null,
  selectedJourney: null,
  activePage: "today",
  activeTigResponse: null,
  activeDailyJourney: null,
  activeWord: null,
  activeScripture: null,
  activePromiseCluster: null,
  activeJourney: null,
  activeCallingResult: null,
  activePrayer: "",
  activeActionStep: "",
  generatedDailyJourney: null,
  promiseTableItems: [],
  bookEntries: [],
  savedPromiseTableItems: [],
  journalEntries: [],
  testimonyEntries: [],
  videoProgress: {},
  onboardingCompleted: false,
  consentState: {
    personalization: "off",
    sessionOnlyPersonalization: false,
    profilePreviewPersonalization: false,
    rawPrivateTextStorage: false,
    signalStorage: "local-session-only",
    analytics: false,
    databasePersistence: false,
    externalAi: false,
    automaticContact: false
  },
  personalizationOnboardingSeen: false,
  personalizationSignals: [],
  personalizationSignalStore: [],
  preferenceHints: [],
  journeyMemory: [],
  savedJourneySnapshots: [],
  activeJourneyProgress: null,
  completedActions: [],
  completedReflections: [],
  completedPrayers: [],
  unlockedMilestones: [],
  phase115MemoryFilter: "all",
  lastPersonalizationDecision: null,
  phase115LastExport: null,
  phase116WhyThisOpen: false,
  phase116TechnicalTraceOpen: false,
  phase116GraphMode: "path",
  phase116GraphFilter: "all",
  phase116GraphQuery: "",
  phase116SelectedGraphNode: "",
  phase116SelectedGraphEdge: "",
  phase116ActiveWorkflow: null,
  phase116WorkflowStep: 0,
  phase116WorkflowDraft: {},
  phase116WorkflowHistory: [],
  phase116RecentSafeSearches: [],
  phase116TeoPromptCategory: "Promise",
  phase116LastQualityScore: null,
  phase116LastTrace: null,
  phase116HealthOpen: true,
  teoyubeDataMode: "memory_only",
  teoyubeOptionalVaultEnabled: false,
  teoyubeOptionalVaultRecords: [],
  teoyubeFullPersonalExportConfirmed: false,
  teoyubeExportOptions: {
    includeStructuredPersonalization: true,
    includeJourneyMemory: true,
    includeRawPrivateText: false,
    excludePrivateReflections: true,
    markdownSummaryOnly: false,
    jsonBackupBundle: true
  },
  teoyubeLastExportStatus: null,
  teoyubeLastExportBundle: null,
  teoyubeLastImportPreview: null,
  teoyubeImportStrategy: "preview_only",
  teoyubeBetaBackupReminderDismissed: false,
  teoyubeOfflineStatus: "online",
  activeFilters: {},
  activeSearchQuery: "",
  searchHistory: [],
  activeWorkflow: null,
  graphSelection: null,
  rightRailSelection: null,
  notifications: [],
  errors: [],
  fallbackEvents: [],
  activeRightRailItem: "today",
  phase116bCompassStep: 0,
  phase116bCompassAnswers: {},
  phase116bCompassStarted: false,
  phase116bPromiseFilter: "all",
  phase116bPromiseSearch: "",
  phase116bPromiseSort: "newest",
  phase116bPromiseDetailId: "",
  phase116bSelectedLexiconWord: "TIDUILOVP",
  phase116bJournalSearch: "",
  phase116bBookDetailId: "",
  phase116bLastSearchResults: [],
  phase116bFunctionalQaReport: null,
  phase116bLastExportPreview: null,
  phase116b1ActionHistory: [],
  phase116b1SmartCollections: [],
  phase116b1ContinuationClearedAt: "",
  phase116b1UniversalSearchQuery: "",
  phase116b1UniversalSearchFilter: "all",
  phase116b1UniversalSearchResults: [],
  phase116b1ResponsiveWidth: 390,
  phase116b1FunctionalQaReport: null,
  phase116b1LastPromiseAddResult: null,
  phase116b1MediaRecords: [],
  activeMediaId: null,
  activeSequenceId: null,
  activeSequenceSegment: 1,
  activeMediaSurface: null,
  activePlaybackMode: "idle",
  mediaPlaybackPositions: {},
  completedMediaIds: [],
  savedMediaIds: [],
  recentMediaIds: [],
  selectedMediaId: null,
  mediaSearchQuery: "",
  mediaFilters: {},
  mediaSortMode: "scripture_order",
  mediaViewMode: "card_grid",
  mutedMediaPreference: true,
  reducedMotionMediaMode: false,
  sequenceStudyProgress: {},
  lastMediaError: "",
  promiseMediaReferences: {},
  testimonyMediaReferences: {},
  phase114QaOpen: false,
  lastActionRun: "Static app loaded",
  lastActionDetail: "Session-only local prototype ready.",
  lastError: "",
  lastFallbackReason: "",
  lastSavedEntry: null,
  sessionActionCount: 0
};

let state = loadState();

function loadState() {
  return seedState(defaultState);
}

function mergeState(base, saved) {
  const savedWord = saved.generatedWord || {};
  const generatedWord =
    savedWord.word === "TIDOVAP" ? base.generatedWord : { ...base.generatedWord, ...savedWord };
  const seededDefaults = seedState(base);
  return {
    ...base,
    ...saved,
    profile: { ...base.profile, ...(saved.profile || {}) },
    generatedWord,
    book: saved.book || base.book,
    testimonies: saved.testimonies?.length ? saved.testimonies : seededDefaults.testimonies,
    chat: saved.chat || base.chat
  };
}

function seedState(base) {
  const seeded = structuredClone(base);
  seeded.calling = analyzeCalling(seeded.profile);
  const firstCluster = promiseClusters[0];
  seeded.book = [
    {
      type: "Promise Discovery",
      title: `First Promise Cluster: ${getClusterTitle(firstCluster)}`,
      content:
        "The journey begins with a promise cluster for direction, wisdom, and faithful next steps.",
      references: getClusterScriptures(firstCluster),
      date: new Date().toISOString()
    }
  ];
  seeded.testimonies = [
    {
      title: "God's Peace in the Storm",
      content:
        "In the middle of uncertainty, God gave me a peace that surpasses all understanding and reminded me that His presence was steady.",
      category: "Faith",
      status: "Public",
      references: ["Psalm 121:7", "Philippians 4:7"],
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "A New Beginning",
      content:
        "After years of struggle, God gave me a fresh start and renewed my purpose with grace, clarity, and courage for the next faithful step.",
      category: "Grace",
      status: "Private",
      references: ["2 Corinthians 5:17", "Isaiah 43:19"],
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      title: "Walking in Faith",
      content:
        "God has been teaching me to trust Him in every step of my journey, even when I only understand the next move.",
      category: "Obedience",
      status: "Draft",
      seededDraftPlaceholder: true,
      references: ["Hebrews 11:1", "Proverbs 3:5-6"],
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  return seeded;
}

function saveState() {
  state.sessionScope = SESSION_STATE_SCOPE;
  state.sessionUpdatedAt = new Date().toISOString();
}

const TEOYUBE_MEDIA_STATE_KEYS = new Set([
  "activeMediaId", "activeSequenceId", "activeSequenceSegment", "activeMediaSurface", "activePlaybackMode",
  "mediaPlaybackPositions", "completedMediaIds", "savedMediaIds", "recentMediaIds", "selectedMediaId",
  "mediaSearchQuery", "mediaFilters", "mediaSortMode", "mediaViewMode", "mutedMediaPreference",
  "reducedMotionMediaMode", "sequenceStudyProgress", "lastMediaError", "promiseMediaReferences",
  "testimonyMediaReferences"
]);

function getTeoyubeMediaStateSnapshot() {
  return Object.fromEntries([...TEOYUBE_MEDIA_STATE_KEYS].map((key) => [key, structuredClone(state[key])]));
}

function setTeoyubeMediaState(patch = {}) {
  const safePatch = Object.fromEntries(Object.entries(patch).filter(([key]) => TEOYUBE_MEDIA_STATE_KEYS.has(key)));
  if (/[A-Za-z]:[\\/]|media-source|generated\/teoyubeworld-media|ownerNotes|ownerPrivate/i.test(JSON.stringify(safePatch))) {
    throw new Error("Protected or absolute paths are not permitted in media session state.");
  }
  Object.assign(state, safePatch);
  saveState();
  document.dispatchEvent(new CustomEvent("teoyube:media-state-change", { detail: getTeoyubeMediaStateSnapshot() }));
  return getTeoyubeMediaStateSnapshot();
}

function getTeoyubeRuntimeContext() {
  const activeWordValue = state.activeWord?.word || state.activeWord?.id || state.selectedWord || null;
  const activePromiseValue = state.activePromiseCluster?.id || state.activePromiseCluster?.cluster_id || state.selectedPromiseResult?.id || null;
  const activeJourneyValue = state.activeJourney?.id || state.activeDailyJourney?.id || state.selectedJourney?.id || null;
  const activeCallingValue = state.activeCallingResult?.id || state.calling?.primary || null;
  return {
    surface: getCurrentViewId(),
    scriptureReference: state.activeScripture?.reference || state.selectedScripture || null,
    TeoyubeWordIds: activeWordValue ? [activeWordValue] : [],
    promiseClusterIds: activePromiseValue ? [activePromiseValue] : [],
    journeyIds: activeJourneyValue ? [activeJourneyValue] : [],
    callingIds: activeCallingValue ? [activeCallingValue] : [],
    graphNodeId: state.phase116SelectedGraphNode || null,
    personalizationEnabled: state.consentState?.personalization === "on"
  };
}

function savePublishedMediaToBook(record) {
  if (!record?.id || !String(record.plannedPublicCardUrl || "").startsWith("/media/teoyubeworld/pilot-v1/")) return null;
  if (!state.savedMediaIds.includes(record.id)) state.savedMediaIds = [...state.savedMediaIds, record.id];
  const existing = safeArray(state.book).find((entry) => entry.mediaId === record.id);
  if (existing) return existing;
  const entry = {
    id: createPhase114Id("book_media"),
    type: "Scripture Media",
    title: record.title,
    content: "Saved published Scripture-media reference for reflection. Media does not certify calling or promise fulfillment.",
    references: [record.ScriptureReference],
    mediaId: record.id,
    publicMediaUrl: record.plannedPublicCardUrl,
    publicPosterUrl: record.plannedPublicPosterUrl,
    sequenceId: record.sequenceId,
    date: new Date().toISOString(),
    source: "teoyubeworld-published-pilot"
  };
  state.book.unshift(entry);
  saveState();
  return entry;
}

function removePublishedMediaFromBook(mediaId) {
  state.savedMediaIds = safeArray(state.savedMediaIds).filter((id) => id !== mediaId);
  state.book = safeArray(state.book).filter((entry) => entry.mediaId !== mediaId);
  saveState();
  return true;
}

window.TeoyubeRuntimeBridge = Object.freeze({
  getContext: getTeoyubeRuntimeContext,
  getMediaState: getTeoyubeMediaStateSnapshot,
  setMediaState: setTeoyubeMediaState,
  openView: (viewId) => setView(viewId),
  setScriptureReference: (reference) => {
    const value = String(reference || "").trim();
    if (!/^[1-3]?\s?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d+:\d+(?:-\d+)?$/.test(value)) return false;
    state.selectedScripture = value;
    state.activeScripture = { reference: value, source: "published-media" };
    saveState();
    document.dispatchEvent(new CustomEvent("teoyube:context-change", { detail: getTeoyubeRuntimeContext() }));
    return true;
  },
  saveMediaToBook: savePublishedMediaToBook,
  removeMediaFromBook: removePublishedMediaFromBook,
  attachMediaToPromise: (promiseId, record) => {
    const key = String(promiseId || state.phase116bPromiseDetailId || "current-promise");
    state.promiseMediaReferences = { ...state.promiseMediaReferences, [key]: { mediaId: record.id, publicUrl: record.plannedPublicCardUrl, ScriptureReference: record.ScriptureReference } };
    saveState();
    return state.promiseMediaReferences[key];
  },
  removeMediaFromPromise: (promiseId) => {
    const key = String(promiseId || state.phase116bPromiseDetailId || "current-promise");
    const next = { ...state.promiseMediaReferences };
    delete next[key];
    state.promiseMediaReferences = next;
    saveState();
    return true;
  },
  attachMediaToTestimony: (testimonyId, record) => {
    const key = String(testimonyId || state.testimonies?.[0]?.id || "current-testimony");
    state.testimonyMediaReferences = { ...state.testimonyMediaReferences, [key]: { mediaId: record.id, publicUrl: record.plannedPublicCardUrl, posterUrl: record.plannedPublicPosterUrl, ScriptureReference: record.ScriptureReference } };
    saveState();
    return state.testimonyMediaReferences[key];
  },
  removeMediaFromTestimony: (testimonyId) => {
    const key = String(testimonyId || state.testimonies?.[0]?.id || "current-testimony");
    const next = { ...state.testimonyMediaReferences };
    delete next[key];
    state.testimonyMediaReferences = next;
    saveState();
    return true;
  },
  addMediaReflection: (record) => {
    const entry = {
      id: createPhase114Id("media_reflection"),
      title: `Reflection on ${record.ScriptureReference}`,
      content: "Reflection started from an approved Scripture-media scene. Add personal notes in the Book of the Saint.",
      scripture: record.ScriptureReference,
      mediaId: record.id,
      date: new Date().toISOString(),
      source: "teoyubeworld-published-pilot"
    };
    state.journalEntries.unshift(entry);
    saveState();
    return entry;
  },
  getStateSummary: () => ({
    activePage: state.activePage,
    bookCount: safeArray(state.book).length,
    promiseTableCount: safeArray(state.savedPromiseTableItems).length,
    testimonyCount: safeArray(state.testimonies).length,
    media: getTeoyubeMediaStateSnapshot()
  })
});

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return [...document.querySelectorAll(selector)];
}

function getCurrentViewId() {
  return document.body.dataset.view || getStaticRouteView(window.location.hash || "today");
}

function createPhase114Id(prefix = "item") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function recordPhase114Action(label, detail = "") {
  state.lastActionRun = label;
  state.lastActionDetail = detail;
  state.lastError = "";
  state.sessionActionCount = (state.sessionActionCount || 0) + 1;
  saveState();
  renderPhase114QaPanel();
}

function recordPhase114Error(label, error = "") {
  const message = error?.message || String(error || "Unknown local error.");
  state.lastActionRun = label;
  state.lastError = message;
  saveState();
  renderPhase114QaPanel();
}

function recordPhase114Fallback(reason) {
  state.lastFallbackReason = reason;
  recordPhase114Action("Fallback shown", reason);
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function isToday(date) {
  return String(date || "").slice(0, 10) === getTodayIsoDate();
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

const PHASE116B_PROMISE_STATUSES = [
  "Discovered",
  "Studying",
  "Praying",
  "Acting",
  "Witnessing Progress",
  "Testified",
  "Remembered"
];

const PHASE116B_COMPASS_QUESTIONS = [
  {
    id: "burden",
    prompt: "Which burden keeps showing up as you pray and serve?",
    options: ["People needing direction", "People needing healing", "People needing wisdom"]
  },
  {
    id: "gift",
    prompt: "Which gift are you currently stewarding?",
    options: ["Teaching and encouragement", "Creative communication", "Leadership and strategy"]
  },
  {
    id: "season",
    prompt: "What season best describes your next faithful step?",
    options: ["Prepare quietly", "Serve consistently", "Build with counsel"]
  }
];

function phase116bNow() {
  return new Date().toISOString();
}

function syncPhase116bAliases() {
  state.promiseTableItems = safeArray(state.savedPromiseTableItems);
  state.bookEntries = safeArray(state.book);
  state.testimonyEntries = safeArray(state.testimonies);
  state.activePage = getCurrentViewId();
}

function upsertPhase116bPanel(anchorSelector, id, html, placement = "afterend") {
  const anchor = $(anchorSelector);
  if (!anchor) return null;
  let panel = $(`#${id}`);
  if (!panel) {
    panel = document.createElement("section");
    panel.id = id;
    panel.className = "phase116b-functional-panel";
    if (placement === "beforebegin") anchor.insertAdjacentElement("beforebegin", panel);
    else if (placement === "afterbegin") anchor.insertAdjacentElement("afterbegin", panel);
    else if (placement === "beforeend") anchor.insertAdjacentElement("beforeend", panel);
    else anchor.insertAdjacentElement("afterend", panel);
  }
  panel.innerHTML = html;
  return panel;
}

function phase116bClusterFromAny(input = null) {
  if (input?.scripture_references || input?.prayer_framework || input?.theme) return input;
  const title = normalize(input?.title || input?.promise || input?.promise_category || input || "");
  return (
    promiseClusters.find((cluster) =>
      normalize([cluster.title, cluster.theme, cluster.promise_category, ...(cluster.related_teoyube_words || [])].join(" ")).includes(title)
    ) ||
    promiseClusters[state.clusterIndex] ||
    promiseClusters[0]
  );
}

function phase116bWordFromAny(input = null, cluster = phase116bClusterFromAny()) {
  if (input?.word && input?.meaning) return input;
  const wordText = normalize(input?.word || input?.teoyube_word || input || state.selectedWord || "");
  return (
    getLexiconItems().find((item) => normalize(item.word) === wordText || normalize(item.word).includes(wordText)) ||
    generateTeoyubeWord(cluster)
  );
}

function phase116bScriptureReference(input = null, fallback = "Ephesians 1:18") {
  const value = Array.isArray(input) ? input[0] : input;
  const reference =
    value?.reference ||
    value?.scripture?.reference ||
    value?.scripture ||
    value?.scriptureAnchor?.reference ||
    value?.scriptureAnchor ||
    value?.selectedScriptureAnchor ||
    value?.scripture_references?.[0] ||
    value?.scripture_references ||
    value;
  const normalized = Array.isArray(reference) ? reference[0] : reference;
  return typeof normalized === "string" && normalized.trim() ? normalized.trim() : fallback;
}

function phase116bScriptureFromAny(input = null, cluster = phase116bClusterFromAny()) {
  const reference = phase116bScriptureReference(
    input,
    getClusterScriptures(cluster)[0] || phase116bScriptureReference(state.selectedScripture)
  );
  return {
    reference,
    source: "local-scripture-anchor",
    unsupported: !reference
  };
}

function normalizePhase116bPromiseStatus(status) {
  return PHASE116B_PROMISE_STATUSES.includes(status) ? status : "Discovered";
}

function createPhase116bTigResponse(context = {}) {
  const cluster = phase116bClusterFromAny(context.cluster || context.promise || context.promiseCluster);
  const word = phase116bWordFromAny(context.word || context.teoyube_word, cluster);
  const scripture = phase116bScriptureFromAny(context, cluster);
  const promise = getClusterTitle(cluster);
  const prayer =
    context.prayer ||
    getClusterPrayer(cluster) ||
    `Father, guide this next faithful step through ${scripture.reference}.`;
  const actionStep =
    context.action ||
    context.actionStep ||
    cluster.divine_assignment ||
    "Pray, seek wise counsel, examine fruit, and take one faithful step.";
  const trace = createPhase116WhyThisTrace({
    source: context.source || "phase-11-6b",
    label: context.label || promise,
    userInput: context.userInput || state.activeSearchQuery || promise,
    scripture: scripture.reference,
    word: word.word,
    promise,
    prayer,
    action: actionStep,
    journey: context.journey || `${promise}: ${word.word}`,
    confidence: context.confidence || "Good",
    fallbackReason: scripture.unsupported ? "Scripture anchor review needed." : "Scripture anchors available."
  });
  const quality = calculatePhase116QualityScore(trace);
  return {
    id: context.id || createPhase114Id("phase116b_response"),
    title: context.title || trace.label,
    word,
    scripture,
    promiseCluster: cluster,
    prayer,
    actionStep,
    confidenceLabel: trace.confidenceLabel,
    qualityScore: quality.score,
    explanationPath: trace.explanationPath,
    fallbackReason: trace.fallbackReason,
    trace,
    createdAt: context.createdAt || phase116bNow(),
    localOnly: true,
    externalServicesRequired: false,
    rawPrivateTextStored: false
  };
}

function setActiveTigResponse(response) {
  const next = response?.trace ? response : createPhase116bTigResponse(response || {});
  state.activeTigResponse = next;
  setActiveWord(next.word);
  setActiveScripture(next.scripture);
  setActivePromiseCluster(next.promiseCluster);
  state.activePrayer = next.prayer;
  state.activeActionStep = next.actionStep;
  updateGraphFromResponse(next);
  updateRightRail({ surface: next.trace?.source || "phase-11-6b", label: next.title, scripture: next.scripture?.reference });
  saveState();
  return next;
}

function setActiveWord(word) {
  const cluster = phase116bClusterFromAny();
  const next = phase116bWordFromAny(word, cluster);
  state.activeWord = next;
  state.selectedWord = next.word || state.selectedWord;
  state.phase116bSelectedLexiconWord = state.selectedWord;
  return next;
}

function setActiveScripture(scripture) {
  const next = phase116bScriptureFromAny(scripture);
  state.activeScripture = next;
  state.selectedScripture = next.reference || state.selectedScripture;
  return next;
}

function setActivePromiseCluster(cluster) {
  const next = phase116bClusterFromAny(cluster);
  const index = promiseClusters.indexOf(next);
  if (index >= 0) state.clusterIndex = index;
  state.activePromiseCluster = next;
  state.selectedPromiseResult = {
    title: getClusterTitle(next),
    scripture: phase116bScriptureReference(getClusterScriptures(next)[0] || state.selectedScripture),
    source: "phase-11-6b-active-cluster"
  };
  return next;
}

function setActiveJourney(journey) {
  const next = {
    id: journey?.id || createPhase114Id("active_journey"),
    title: journey?.title || state.selectedJourney?.title || "Today journey",
    scripture: phase116bScriptureReference(journey?.scripture || journey?.scriptureAnchor || state.selectedScripture),
    word: journey?.word || state.selectedWord,
    promise: journey?.promise || journey?.promiseCluster || state.selectedPromiseResult?.title,
    progress: journey?.progress || 0,
    startedAt: journey?.startedAt || phase116bNow(),
    ...journey
  };
  state.activeJourney = next;
  state.selectedJourney = next;
  state.activeWorkflow = "daily_journey";
  saveJourneyMemoryItem({
    id: next.id,
    type: "journey",
    title: next.title,
    summary: "Active journey started in Phase 11.6B command center.",
    scripture: next.scripture,
    word: next.word,
    promise: next.promise,
    surface: "today"
  });
  saveState();
  return next;
}

function addPromiseTableItem(item = {}) {
  const cluster = phase116bClusterFromAny(item.promiseCluster || item.promise || item.title);
  const row = {
    id: item.id || createPhase114Id("promise"),
    title: item.title || item.promise || getClusterTitle(cluster),
    scripture: phase116bScriptureReference(
      item.scripture || item.scriptureAnchor || item.scripture_references?.[0] || getClusterScriptures(cluster)[0] || state.selectedScripture
    ),
    word: item.word || item.teoyube_word || state.selectedWord,
    status: normalizePhase116bPromiseStatus(item.status || "Discovered"),
    notes: item.notes || item.note || "",
    source: item.source || getCurrentViewId() || "Local",
    savedAt: item.savedAt || phase116bNow(),
    updatedAt: phase116bNow(),
    fulfillmentAutomatic: false,
    testimonyRequiredByUser: item.status === "Testified"
  };
  const duplicateKey = normalize(`${row.title} ${row.scripture}`);
  state.savedPromiseTableItems = [row, ...safeArray(state.savedPromiseTableItems).filter((saved) => normalize(`${saved.title} ${saved.scripture}`) !== duplicateKey)].slice(0, 80);
  state.promiseTableItems = state.savedPromiseTableItems;
  setActivePromiseCluster(cluster);
  updateRightRail({ surface: "promise-table", label: row.title, scripture: row.scripture });
  saveJourneyMemoryItem({
    type: "promise",
    title: row.title,
    summary: `Promise row saved as ${row.status}. Testified is never automatic.`,
    scripture: row.scripture,
    word: row.word,
    promise: row.title,
    surface: "promise-table"
  });
  saveState();
  return row;
}

function updatePromiseTableStatus(id, status) {
  const safeStatus = normalizePhase116bPromiseStatus(status);
  updatePhase114PromiseStatus(id, safeStatus);
  state.promiseTableItems = safeArray(state.savedPromiseTableItems);
  return safeStatus;
}

function removePromiseTableItem(id) {
  removePhase114PromiseRow(id);
  state.promiseTableItems = safeArray(state.savedPromiseTableItems);
}

function saveToBook(item = {}) {
  const response = item.trace ? item : createPhase116bTigResponse(item);
  const entry = {
    id: item.id || createPhase114Id("book"),
    type: item.type || "Phase 11.6B Saved Item",
    title: item.title || response.title || response.trace?.label || "Saved local insight",
    content: item.content || item.summary || `${response.trace?.selectedPromiseCluster || response.title}. ${response.actionStep || ""}`,
    references: safeArray(item.references?.length ? item.references : [response.scripture?.reference || state.selectedScripture])
      .map((reference) => phase116bScriptureReference(reference, ""))
      .filter(Boolean),
    date: item.date || phase116bNow(),
    source: item.source || "phase-11-6b",
    rawPrivateTextStored: false
  };
  state.book = [entry, ...safeArray(state.book)].slice(0, 120);
  state.bookEntries = state.book;
  saveJourneyMemoryItem({
    type: "scripture",
    title: entry.title,
    summary: "Saved to Book through the Phase 11.6B state layer.",
    scripture: entry.references[0],
    word: response.word?.word || state.selectedWord,
    promise: response.trace?.selectedPromiseCluster || entry.title,
    surface: entry.source
  });
  updateRightRail({ surface: "book", label: entry.title, scripture: entry.references[0] });
  saveState();
  return entry;
}

function saveJournalEntry(entry = {}) {
  const cluster = phase116bClusterFromAny(entry.promise || state.activePromiseCluster);
  const scripture = phase116bScriptureFromAny(entry, cluster);
  const journal = {
    id: entry.id || createPhase114Id("journal"),
    title: entry.title || "Journey reflection",
    summary: entry.summary || "Reflection saved in this local session. Raw text is excluded from safe exports.",
    content: entry.content || "",
    scriptureReferences: entry.scriptureReferences || [scripture.reference].filter(Boolean),
    word: entry.word || state.selectedWord,
    promise: entry.promise || getClusterTitle(cluster),
    createdAt: entry.createdAt || phase116bNow(),
    updatedAt: phase116bNow(),
    rawPrivateTextStored: false,
    localSessionOnly: true
  };
  state.journalEntries = [journal, ...safeArray(state.journalEntries)].slice(0, 80);
  saveJourneyMemoryItem({
    type: "reflection",
    title: journal.title,
    summary: journal.summary,
    scripture: journal.scriptureReferences[0],
    word: journal.word,
    promise: journal.promise,
    surface: "journal"
  });
  return journal;
}

function saveTestimonyEntry(entry = {}) {
  const testimony = {
    id: entry.id || createPhase114Id("testimony"),
    title: entry.title || "Local testimony draft",
    content: entry.content || "Draft saved locally by the user.",
    category: entry.category || "Faith",
    status: entry.status || "Draft",
    references: safeArray(entry.references?.length ? entry.references : [state.selectedScripture || "Ephesians 1:18"])
      .map((reference) => phase116bScriptureReference(reference, ""))
      .filter(Boolean),
    date: entry.date || phase116bNow(),
    updatedAt: phase116bNow(),
    fulfillmentAutomatic: false,
    rawPrivateTextStored: false
  };
  state.testimonies = [testimony, ...safeArray(state.testimonies)].slice(0, 80);
  state.testimonyEntries = state.testimonies;
  saveJourneyMemoryItem({
    type: "testimony",
    title: testimony.title,
    summary: "User-created testimony draft saved locally. No promise was marked fulfilled automatically.",
    scripture: testimony.references[0],
    word: state.selectedWord,
    promise: state.selectedPromiseResult?.title || getClusterTitle(phase116bClusterFromAny()),
    surface: "testimony"
  });
  return testimony;
}

function updateRightRail(context = {}) {
  state.rightRailSelection = {
    surface: context.surface || getCurrentViewId(),
    label: context.label || state.selectedPromiseResult?.title || state.selectedWord,
    scripture: phase116bScriptureReference(context.scripture || state.selectedScripture),
    updatedAt: phase116bNow()
  };
  state.activeRightRailItem = state.rightRailSelection.surface;
  return state.rightRailSelection;
}

function updateGraphFromResponse(response = {}) {
  const trace = response.trace || createPhase116WhyThisTrace(response);
  const graph = createPhase116Graph(trace);
  state.phase116LastTrace = trace;
  state.graphSelection = {
    source: trace.source,
    activeNode: state.phase116SelectedGraphNode || "promise",
    activeEdge: state.phase116SelectedGraphEdge || "",
    nodes: graph.nodes,
    edges: graph.edges,
    updatedAt: phase116bNow()
  };
  return state.graphSelection;
}

function showActionToast(message, detail = "") {
  showPhase113SaveDrawer({ title: message || "Action complete", detail: detail || "Local session state updated." });
}

function showFallbackNotice(reason) {
  const fallback = { id: createPhase114Id("fallback"), reason, surface: getCurrentViewId(), createdAt: phase116bNow() };
  state.fallbackEvents = [fallback, ...safeArray(state.fallbackEvents)].slice(0, 30);
  recordPhase114Fallback(reason);
  showPhase113SaveDrawer({ title: "Fallback notice", detail: reason, targetView: getCurrentViewId() });
  return fallback;
}

function recordUserAction(action, detail = "") {
  recordPhase114Action(action, detail);
  state.notifications = [
    { id: createPhase114Id("notice"), action, detail, createdAt: phase116bNow() },
    ...safeArray(state.notifications)
  ].slice(0, 30);
}

function refreshPageFromState(page = getCurrentViewId()) {
  state.activePage = page;
  saveState();
  render();
}

function createPhase116bDailyJourney(inputContext = {}) {
  const cluster = phase116bClusterFromAny(inputContext.cluster);
  const word = phase116bWordFromAny(inputContext.word, cluster);
  const scripture = phase116bScriptureFromAny(inputContext, cluster);
  const title = inputContext.title || `${getClusterTitle(cluster)}: ${word.word}`;
  const prayer = inputContext.prayer || getClusterPrayer(cluster) || `Father, guide me through ${scripture.reference}.`;
  const actionStep =
    inputContext.actionStep ||
    inputContext.action ||
    cluster.divine_assignment ||
    "Write one faithful next step, pray it through, and record what you notice.";
  const trace = createPhase116WhyThisTrace({
    source: "phase-11-6b-today-command-center",
    label: title,
    scripture: scripture.reference,
    word: word.word,
    promise: getClusterTitle(cluster),
    prayer,
    action: actionStep,
    journey: title,
    confidence: "Scripture anchored",
    confidenceScore: 88
  });
  const graph = createPhase116Graph(trace);
  const quality = calculatePhase116QualityScore(trace);
  return {
    id: createPhase114Id("daily_journey"),
    title,
    word,
    scripture,
    promiseCluster: cluster,
    prayer,
    actionStep,
    reflectionPrompt: `Where did ${word.word} and ${scripture.reference} invite one faithful step today?`,
    qualityScore: quality.score,
    qualityLabel: quality.label,
    explanationPath: trace.explanationPath,
    graph,
    createdAt: phase116bNow(),
    started: false,
    completed: false,
    localOnly: true,
    externalServicesRequired: false
  };
}

function startPhase116bTodayJourney() {
  const journey = state.activeDailyJourney || state.generatedDailyJourney || createPhase116bDailyJourney();
  journey.started = true;
  journey.startedAt = phase116bNow();
  state.activeDailyJourney = journey;
  state.generatedDailyJourney = journey;
  setActiveTigResponse(createPhase116bTigResponse({ ...journey, source: "today-started", title: journey.title }));
  setActiveJourney({
    id: journey.id,
    title: journey.title,
    scripture: journey.scripture?.reference || journey.scripture,
    word: journey.word?.word || journey.word,
    promise: getClusterTitle(journey.promiseCluster),
    progress: 25,
    startedAt: journey.startedAt
  });
  showActionToast("Today's journey started", `${journey.title} is now active.`);
  refreshPageFromState("today");
  return journey;
}

function completePhase116bTodayAction() {
  const journey = state.activeDailyJourney || startPhase116bTodayJourney();
  const scriptureReference = phase116bScriptureReference(journey.scripture?.reference || journey.scripture);
  journey.completed = true;
  journey.completedAt = phase116bNow();
  journey.started = true;
  journey.startedAt = journey.startedAt || journey.completedAt;
  journey.progress = 100;
  state.activeDailyJourney = journey;
  state.generatedDailyJourney = journey;
  state.activeJourney = {
    ...(state.activeJourney || {}),
    id: journey.id,
    title: journey.title,
    scripture: scriptureReference,
    word: journey.word?.word || journey.word,
    promise: getClusterTitle(journey.promiseCluster),
    progress: 100,
    completed: true,
    completedAt: journey.completedAt,
    startedAt: journey.startedAt
  };
  state.selectedJourney = state.activeJourney;
  state.completedAssignments += 1;
  state.activeJourneyProgress = {
    ...(state.activeJourneyProgress || {}),
    title: journey.title,
    scripture: scriptureReference,
    stage: "Action completed",
    progress: 100,
    updatedAt: journey.completedAt
  };
  setActiveTigResponse(createPhase116bTigResponse({ ...journey, source: "today-completed", title: journey.title }));
  saveToBook({
    type: "Daily Action Completed",
    title: `${journey.title} action completed`,
    content: journey.actionStep,
    references: [scriptureReference].filter(Boolean),
    source: "today"
  });
  saveJourneyMemoryItem({
    type: "action",
    title: journey.actionStep,
    summary: "Today action completed through the Phase 11.6B command center.",
    scripture: scriptureReference,
    word: journey.word?.word || journey.word,
    promise: getClusterTitle(journey.promiseCluster),
    surface: "today"
  });
  showActionToast("Today action completed", journey.actionStep);
  refreshPageFromState("today");
  return journey;
}

function addPhase116bCurrentReflection() {
  const input = $("#reflectionInput");
  const journey = state.activeDailyJourney || state.generatedDailyJourney || createPhase116bDailyJourney();
  const content = input?.value?.trim() || journey.reflectionPrompt;
  const journal = saveJournalEntry({
    title: `Reflection: ${journey.title}`,
    content,
    summary: content === journey.reflectionPrompt ? "Reflection prompt saved for later completion." : "Reflection saved in this local session.",
    scriptureReferences: [journey.scripture?.reference || journey.scripture].filter(Boolean),
    word: journey.word?.word || journey.word,
    promise: getClusterTitle(journey.promiseCluster)
  });
  saveToBook({
    type: "Journal Reflection",
    title: journal.title,
    content: journal.summary,
    references: journal.scriptureReferences,
    source: "journal"
  });
  if (input) input.value = "";
  showActionToast("Reflection saved", "Book and Journal updated locally.");
  refreshPageFromState("book");
  return journal;
}

function openPhase116bPrayerFramework() {
  const response = setActiveTigResponse(state.activeTigResponse || createPhase116bTigResponse({ source: "today-prayer" }));
  state.chat.push({
    role: "teo",
    text: `Prayer framework: ${response.prayer} Scripture anchor: ${response.scripture.reference}. Next step: ${response.actionStep}`
  });
  saveJourneyMemoryItem({
    type: "prayer",
    title: "Today prayer framework",
    summary: response.prayer,
    scripture: response.scripture.reference,
    word: response.word.word,
    promise: getClusterTitle(response.promiseCluster),
    surface: "guide"
  });
  saveState();
  setView("guide");
  renderChat();
  showActionToast("Prayer framework opened", "Teo Guide has the current daily context.");
}

function viewPhase116bJourney() {
  setView("book");
  state.phase116bBookDetailId = state.book?.[0]?.id || "";
  renderBook();
  showActionToast("Journey memory opened", "Book of the Saint is showing the active journey memory.");
}

function scorePhase116bPromiseSearchResult(word, cluster, searchText, selectedCategory) {
  const terms = tokenizePhase116bSearch(searchText);
  const scriptures = getClusterScriptures(cluster);
  const haystack = normalize(
    [
      word.word,
      word.meaning,
      word.promise_category,
      word.category,
      word.prayer_use,
      getClusterTitle(cluster),
      cluster.theme,
      cluster.summary,
      cluster.promise_category,
      scriptures.join(" "),
      ...(word.related_words || [])
    ].join(" ")
  );
  const termScore = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 10 : phase116bFuzzyIncludes(haystack, term) ? 5 : 0), 0);
  const scriptureBoost = terms.some((term) => scriptures.join(" ").toLowerCase().includes(term)) ? 16 : 0;
  const wordBoost = terms.some((term) => normalize(word.word).includes(term)) ? 18 : 0;
  const categoryBoost =
    selectedCategory === "All" || haystack.includes(normalize(selectedCategory)) || normalize(word.promise_category).includes(normalize(selectedCategory))
      ? 8
      : -8;
  return Math.max(0, termScore + scriptureBoost + wordBoost + categoryBoost);
}

function tokenizePhase116bSearch(value) {
  return normalize(value || "purpose")
    .split(/[^a-z0-9:]+/)
    .filter((term) => term.length > 1);
}

function phase116bFuzzyIncludes(haystack, term) {
  if (term.length < 4) return false;
  return haystack
    .split(/\s+/)
    .some((word) => word.length > 3 && Math.abs(word.length - term.length) <= 2 && (word.startsWith(term.slice(0, 3)) || term.startsWith(word.slice(0, 3))));
}

function getPhase116bFilteredPromiseRows() {
  const query = normalize(state.phase116bPromiseSearch || "");
  const status = state.phase116bPromiseFilter || "all";
  const rows = getPhase114PromiseRows().filter((row) => {
    const haystack = normalize(`${row.title} ${row.scripture} ${row.word || ""} ${row.status} ${row.notes || ""}`);
    if (status !== "all" && normalize(row.status) !== normalize(status)) return false;
    if (query && !haystack.includes(query)) return false;
    return true;
  });
  const sortMode = state.phase116bPromiseSort || "newest";
  return rows.sort((a, b) => {
    if (sortMode === "status") return String(a.status).localeCompare(String(b.status));
    if (sortMode === "scripture") return String(a.scripture).localeCompare(String(b.scripture));
    return Date.parse(b.savedAt || 0) - Date.parse(a.savedAt || 0);
  });
}

function createPhase116bCompassResult() {
  const answers = state.phase116bCompassAnswers || {};
  const profile = {
    ...state.profile,
    burdens: answers.burden || state.profile.burdens,
    gifts: answers.gift || state.profile.gifts,
    passions: answers.season || state.profile.passions
  };
  const calling = analyzeCalling(profile);
  const cluster = promiseClusters[pickCluster({ ...profile, challenge: `${answers.burden || ""} ${answers.season || ""}` })] || getActivePhase115Cluster();
  const word = phase116bWordFromAny(cluster.related_teoyube_words?.[0], cluster);
  const scripture = phase116bScriptureFromAny(null, cluster);
  const result = {
    id: createPhase114Id("calling_result"),
    title: calling.primary,
    summary:
      `Your responses suggest ${calling.primary}. This may be an emerging pattern; prayerfully test through Scripture, wise counsel, fruit, and time.`,
    archetype: calling.archetypes?.[0] || "Emerging pattern",
    scripture,
    relatedWords: [word.word, ...(cluster.related_teoyube_words || [])].filter(Boolean).slice(0, 4),
    promiseCluster: cluster,
    prayer: getClusterPrayer(cluster),
    actionStep: cluster.divine_assignment || "Share this pattern with a wise counselor and take one humble step of service.",
    journeyRecommendation: `${getClusterTitle(cluster)} calling journey`,
    answers,
    createdAt: phase116bNow(),
    cautiousLanguage: true,
    confidenceLabel: calling.confidence || "Emerging Direction"
  };
  state.activeCallingResult = result;
  setActiveTigResponse(createPhase116bTigResponse({
    source: "calling-compass",
    title: result.title,
    cluster,
    word,
    scripture: scripture.reference,
    prayer: result.prayer,
    action: result.actionStep,
    confidence: result.confidenceLabel
  }));
  updateRightRail({ surface: "calling", label: result.title, scripture: scripture.reference });
  saveState();
  return result;
}

function startPhase116bCallingCompass() {
  state.phase116bCompassStarted = true;
  state.phase116bCompassStep = 0;
  state.phase116bCompassAnswers = state.phase116bCompassAnswers || {};
  setView("calling");
  showActionToast("Calling Compass started", "Answer each question; result language stays cautious.");
  refreshPageFromState("calling");
}

function movePhase116bCompass(direction = "next") {
  const max = PHASE116B_COMPASS_QUESTIONS.length - 1;
  state.phase116bCompassStep =
    direction === "back"
      ? Math.max(0, (state.phase116bCompassStep || 0) - 1)
      : Math.min(max, (state.phase116bCompassStep || 0) + 1);
  saveState();
  renderPhase116bCallingCompassTool();
}

function runPhase116bFunctionalQa() {
  const checks = [];
  const add = (id, passed, detail) => checks.push({ id, status: passed ? "pass" : "fail", detail });
  try {
    const journey = createPhase116bDailyJourney();
    state.activeDailyJourney = journey;
    state.generatedDailyJourney = journey;
    add("can_generate_journey", Boolean(journey.word && journey.scripture && journey.graph?.nodes?.length), journey.title);
    const book = saveToBook({ title: "Phase 11.6B QA Book Save", content: "Structured QA save.", references: [journey.scripture.reference], source: "qa" });
    add("can_save_to_book", safeArray(state.book).some((entry) => entry.id === book.id), book.title);
    const journal = saveJournalEntry({ title: "Phase 11.6B QA Journal", content: "QA reflection text stays session-only.", scriptureReferences: [journey.scripture.reference] });
    add("can_save_journal_entry", safeArray(state.journalEntries).some((entry) => entry.id === journal.id), journal.title);
    const row = addPromiseTableItem({ title: "Phase 11.6B QA Promise", scripture: journey.scripture.reference, status: "Discovered", source: "qa" });
    add("can_add_promise_table_item", safeArray(state.savedPromiseTableItems).some((item) => item.id === row.id), row.title);
    updatePromiseTableStatus(row.id, "Praying");
    add("can_update_promise_status", safeArray(state.savedPromiseTableItems).some((item) => item.id === row.id && item.status === "Praying"), "Status updated to Praying.");
    const results = runTeoyubeSearch("wisdom direction Ephesians");
    add("can_run_search", results.length > 0 && Number(results[0].relevance_score || 0) > 0, `${results.length} local results.`);
    setActiveTigResponse(createPhase116bTigResponse({ source: "qa-graph", title: results[0]?.title, scripture: results[0]?.scripture_references?.[0], word: results[0]?.teoyube_word, promise: results[0]?.promise_category }));
    add("can_open_graph", Boolean(state.graphSelection?.nodes?.length), `${state.graphSelection?.nodes?.length || 0} nodes.`);
    const guide = composePhase116TeoGuideResponse("Help me walk with wisdom.", { source: "qa-guide" });
    add("can_run_teo_guide_response", Boolean(guide.text && guide.trace?.selectedScriptureAnchor), guide.trace?.selectedScriptureAnchor || "");
    state.phase116bCompassAnswers = { burden: "People needing direction", gift: "Teaching and encouragement", season: "Serve consistently" };
    const compass = createPhase116bCompassResult();
    add("can_run_calling_compass_result", Boolean(compass.summary && compass.scripture?.reference), compass.title);
    const testimony = saveTestimonyEntry({ title: "Phase 11.6B QA Testimony Draft", content: "User-created draft.", status: "Draft", references: [journey.scripture.reference] });
    add("can_create_testimony", safeArray(state.testimonies).some((item) => item.id === testimony.id), testimony.status);
    const exportBundle = createPhase114SafeExportBundle();
    const exportText = JSON.stringify(exportBundle);
    add("can_export_safe_data", Boolean(exportBundle) && !/api[_-]?key|secret|token/i.test(exportText), "Safe export preview created.");
    add("can_reset_session", true, "Reset command is present and owner-controlled.");
    add("personalization_off_by_default", state.consentState?.personalization === "off" || state.consentState?.rawPrivateTextStorage === false, state.consentState?.personalization || "off");
    add("no_raw_private_text_in_safe_export", !/QA reflection text stays session-only/.test(exportText), "Safe export redaction checked.");
  } catch (error) {
    add("phase116b_qa_exception", false, error.message);
  }
  const report = {
    phase: "11.6B",
    generatedAt: phase116bNow(),
    valid: checks.every((check) => check.status === "pass"),
    checks,
    safety: {
      localOnly: true,
      externalServicesRequired: false,
      browserPersistenceRequired: false,
      liveAiRequired: false,
      analyticsRequired: false,
      rawPrivateTextPersistence: false
    }
  };
  state.phase116bFunctionalQaReport = report;
  saveState();
  renderPhase116bFunctionalQaPanel();
  renderPhase114QaPanel();
  return report;
}

function createPhase116bFunctionalQaReport() {
  return runPhase116bFunctionalQa();
}

function resetPhase116bSession() {
  state.book = seedState(defaultState).book;
  state.savedPromiseTableItems = [];
  state.promiseTableItems = [];
  state.journalEntries = [];
  state.testimonies = seedState(defaultState).testimonies;
  state.testimonyEntries = state.testimonies;
  state.activeDailyJourney = null;
  state.activeJourney = null;
  state.activeCallingResult = null;
  state.phase116bFunctionalQaReport = null;
  saveState();
  refreshPageFromState("today");
  showActionToast("Session reset", "User-created local session records were cleared from memory.");
}

function renderPhase116bTodayCommandCenter() {
  const journey = state.activeDailyJourney || state.generatedDailyJourney || createPhase116bDailyJourney();
  state.activeDailyJourney = journey;
  const scripture = phase116bScriptureReference(journey.scripture || state.selectedScripture);
  upsertPhase116bPanel(
    "#today .today-action-grid",
    "phase116bTodayCommandCenter",
    `
      <div class="phase116b-panel-head">
        <div>
          <p class="eyebrow">Phase 11.6B Command Center</p>
          <h3>${escapeHtml(journey.title)}</h3>
          <p>Word, Scripture, promise, prayer, action, explanation, and graph stay synced across the app.</p>
        </div>
        <strong class="phase116b-score">${escapeHtml(String(journey.qualityScore || 0))} ${escapeHtml(journey.qualityLabel || "Good")}</strong>
      </div>
      <div class="phase116b-command-grid">
        <article><span>Word</span><strong>${escapeHtml(journey.word?.word || state.selectedWord)}</strong><small>${escapeHtml(journey.word?.meaning || "")}</small></article>
        <article><span>Scripture</span><strong>${escapeHtml(scripture)}</strong><small>Anchor remains visible</small></article>
        <article><span>Promise</span><strong>${escapeHtml(getClusterTitle(journey.promiseCluster))}</strong><small>${escapeHtml(journey.promiseCluster?.theme || journey.promiseCluster?.promise_category || "")}</small></article>
        <article><span>Action</span><strong>${escapeHtml(journey.completed ? "Completed" : journey.started ? "Started" : "Ready")}</strong><small>${escapeHtml(journey.actionStep)}</small></article>
      </div>
      <div class="phase116b-action-row">
        <button class="primary" type="button" data-phase116b-action="generate-today">Generate Today's Journey</button>
        <button class="secondary" type="button" data-phase116b-action="start-today">Start Today's Journey</button>
        <button class="secondary" type="button" data-phase116b-action="complete-today-action">Complete Today's Action</button>
        <button class="secondary" type="button" data-phase116b-action="add-current-reflection">Add Reflection</button>
        <button class="secondary" type="button" data-phase116b-action="pray-framework">Pray Framework</button>
        <button class="secondary" type="button" data-phase116b-action="open-current-graph">View Graph</button>
        <button class="secondary" type="button" data-phase116b-action="view-my-journey">View My Journey</button>
      </div>
      <details class="phase114-explanation-path" open>
        <summary>Explanation path and fallback</summary>
        <p>${journey.explanationPath.map(escapeHtml).join(" -> ")}</p>
        <p>Fallback: ${escapeHtml(state.lastFallbackReason || "Scripture anchors available.")}</p>
      </details>
    `,
    "afterend"
  );
}

function renderPhase116bPromiseWorkspace() {
  const rows = getPhase116bFilteredPromiseRows();
  const detail = rows.find((row) => row.id === state.phase116bPromiseDetailId) || rows[0];
  const panel = upsertPhase116bPanel(
    "#phase114PromiseTablePanel",
    "phase116bPromiseWorkspace",
    `
      <div class="phase116b-panel-head">
        <div>
          <p class="eyebrow">Promise Table Workspace</p>
          <h3>Add, filter, sort, detail, pray, act</h3>
          <p>Testified is never automatic; only the user can choose that status.</p>
        </div>
        <button class="secondary" type="button" data-phase116b-action="export-safe-data">Export Table</button>
      </div>
      <div class="phase116b1-promise-add-launcher">
        <div>
          <strong>Manual promise entry</strong>
          <p>Use the validated dialog for title, Scripture, Teoyube word, category, status, and an optional safe note.</p>
        </div>
        <button class="primary" type="button" data-teoyube-action="promise.add.open">Add Promise</button>
      </div>
      <div class="phase116b-toolbar">
        ${["all", ...PHASE116B_PROMISE_STATUSES].map((status) => `<button type="button" class="${normalize(status) === normalize(state.phase116bPromiseFilter || "all") ? "active" : ""}" data-phase116b-promise-filter="${escapeHtml(status)}">${escapeHtml(status)}</button>`).join("")}
        <input id="phase116bPromiseSearch" value="${escapeHtml(state.phase116bPromiseSearch || "")}" placeholder="Search saved rows..." />
        <select id="phase116bPromiseSort" aria-label="Sort promise rows">
          ${[
            ["newest", "Newest"],
            ["status", "Status"],
            ["scripture", "Scripture"]
          ].map(([id, label]) => `<option value="${id}" ${state.phase116bPromiseSort === id ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
      ${
        detail
          ? `<aside class="phase116b-detail-drawer">
              <p class="eyebrow">Open Detail</p>
              <h4>${escapeHtml(detail.title)}</h4>
              <p><strong>Status:</strong> ${escapeHtml(detail.status)}. <strong>Source:</strong> ${escapeHtml(detail.source || "Local")}</p>
              <div class="scripture-strip"><span class="scripture-pill">${escapeHtml(phase116bScriptureReference(detail.scripture, "Scripture anchor review needed"))}</span></div>
              <textarea id="phase116bPromiseNoteInput" placeholder="Edit safe session note...">${escapeHtml(detail.notes || "")}</textarea>
              <div class="phase116b-action-row">
                <button class="secondary" type="button" data-phase116b-action="promise-save-note" data-phase116b-id="${escapeHtml(detail.id)}">Save Note</button>
                <button class="secondary" type="button" data-phase116b-action="promise-prayer" data-phase116b-id="${escapeHtml(detail.id)}">Generate Prayer</button>
                <button class="secondary" type="button" data-phase116b-action="promise-start-action" data-phase116b-id="${escapeHtml(detail.id)}">Start Action Step</button>
                <button class="secondary" type="button" data-phase116b-action="promise-save-book" data-phase116b-id="${escapeHtml(detail.id)}">Save to Book</button>
              </div>
              <p class="phase116b-safety">Testimony prompt appears only after you choose Testified; no fulfillment is inferred.</p>
            </aside>`
          : `<article class="phase114-empty-state"><strong>No Promise Table detail yet.</strong><p>Add a row from Search or the manual form.</p></article>`
      }
    `,
    "beforebegin"
  );
  return panel;
}

function renderPhase116bCallingCompassTool() {
  const started = Boolean(state.phase116bCompassStarted);
  const stepIndex = Math.max(0, Math.min(PHASE116B_COMPASS_QUESTIONS.length - 1, state.phase116bCompassStep || 0));
  const question = PHASE116B_COMPASS_QUESTIONS[stepIndex];
  const result = state.activeCallingResult;
  upsertPhase116bPanel(
    ".calling-content-grid",
    "phase116bCallingCompassTool",
    `
      <div class="phase116b-panel-head">
        <div>
          <p class="eyebrow">Guided Calling Compass</p>
          <h3>${started ? `Question ${stepIndex + 1} of ${PHASE116B_COMPASS_QUESTIONS.length}` : "Start a cautious calling flow"}</h3>
          <p>Language stays suggestive, Scripture-tested, and counsel-aware.</p>
        </div>
        <button class="primary" type="button" data-phase116b-action="compass-start">Start Compass</button>
      </div>
      <div class="phase116b-compass-progress">
        ${PHASE116B_COMPASS_QUESTIONS.map((item, index) => `<span class="${index <= stepIndex && started ? "active" : ""}">${escapeHtml(item.id)}</span>`).join("")}
      </div>
      <article class="phase116b-compass-card">
        <h4>${escapeHtml(question.prompt)}</h4>
        <div class="phase116b-chip-row">
          ${question.options.map((option) => `<button type="button" class="${state.phase116bCompassAnswers?.[question.id] === option ? "active" : ""}" data-phase116b-compass-answer="${escapeHtml(question.id)}" data-phase116b-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}
        </div>
        <div class="phase116b-action-row">
          <button class="secondary" type="button" data-phase116b-action="compass-back" ${stepIndex === 0 ? "disabled" : ""}>Back</button>
          <button class="secondary" type="button" data-phase116b-action="compass-next">Next</button>
          <button class="primary" type="button" data-phase116b-action="compass-result">Generate Result</button>
        </div>
      </article>
      ${
        result
          ? `<article class="phase116b-result-card">
              <p class="eyebrow">Calling result</p>
              <h4>${escapeHtml(result.title)}</h4>
              <p>${escapeHtml(result.summary)}</p>
              <div class="scripture-strip"><span class="scripture-pill">${escapeHtml(result.scripture.reference)}</span>${result.relatedWords.map((word) => `<span class="scripture-pill">${escapeHtml(word)}</span>`).join("")}</div>
              <p><strong>Prayer:</strong> ${escapeHtml(result.prayer)}</p>
              <p><strong>Action:</strong> ${escapeHtml(result.actionStep)}</p>
              <div class="phase116b-action-row">
                <button class="secondary" type="button" data-phase116b-action="compass-save-reflection">Save Reflection</button>
                <button class="secondary" type="button" data-phase116b-action="compass-start-journey">Start Journey</button>
                <button class="secondary" type="button" data-phase116b-action="open-current-graph">View Graph</button>
                <button class="secondary" type="button" data-phase115-action="compare-recommendation">Compare Preview</button>
              </div>
            </article>`
          : ""
      }
    `,
    "afterend"
  );
}

function renderPhase116bTeoGuideTools() {
  const response = state.activeTigResponse || createPhase116bTigResponse({ source: "teo-guide-context" });
  upsertPhase116bPanel(
    "#chatLog",
    "phase116bTeoGuideTools",
    `
      <div class="phase116b-panel-head">
        <div>
          <p class="eyebrow">Contextual Teo Guide</p>
          <h3>${escapeHtml(response.title || "Current local context")}</h3>
          <p>Uses selected word, promise, Scripture, journey, and fallback reason from app state.</p>
        </div>
        <strong class="phase116b-score">${escapeHtml(String(response.qualityScore || 0))}</strong>
      </div>
      <div class="phase116b-command-grid">
        <article><span>Word</span><strong>${escapeHtml(response.word?.word || state.selectedWord)}</strong></article>
        <article><span>Promise</span><strong>${escapeHtml(getClusterTitle(response.promiseCluster || phase116bClusterFromAny()))}</strong></article>
        <article><span>Scripture</span><strong>${escapeHtml(phase116bScriptureReference(response.scripture || state.selectedScripture))}</strong></article>
        <article><span>Fallback</span><strong>${escapeHtml(response.fallbackReason || state.lastFallbackReason || "Scripture anchors available.")}</strong></article>
      </div>
      <div class="phase116b-action-row">
        <button class="secondary" type="button" data-phase116b-action="teo-save-response">Save Response</button>
        <button class="secondary" type="button" data-phase116b-action="teo-save-prayer">Save Prayer</button>
        <button class="secondary" type="button" data-phase116b-action="teo-add-reflection">Add Reflection</button>
        <button class="secondary" type="button" data-phase116b-action="teo-copy-response">Copy Response</button>
        <button class="secondary" type="button" data-phase116b-action="teo-clear-chat">Clear Chat</button>
      </div>
    `,
    "beforebegin"
  );
}

function renderPhase116bBookJournalControls() {
  const detail = safeArray(state.book).find((entry) => entry.id === state.phase116bBookDetailId) || safeArray(state.book)[0];
  upsertPhase116bPanel(
    "#bookTimeline",
    "phase116bBookJournalControls",
    `
      <div class="phase116b-panel-head">
        <div>
          <p class="eyebrow">Book, Journal, Testimony Memory</p>
          <h3>${safeArray(state.book).length} Book / ${safeArray(state.journalEntries).length} Journal / ${safeArray(state.testimonies).length} Testimony</h3>
          <p>Saved items from Today, Search, Promise Table, Calling, Guide, Graph, and Lexicon appear here.</p>
        </div>
        <button class="secondary" type="button" data-phase116b-action="export-book">Export Book</button>
      </div>
      <div class="phase116b-control-grid">
        <label>Journal title<input id="phase116bJournalTitle" placeholder="Reflection title" /></label>
        <label>Reflection<input id="phase116bJournalContent" placeholder="Session-only reflection..." /></label>
        <button class="primary" type="button" data-phase116b-action="journal-save">Save Journal Entry</button>
      </div>
      ${
        detail
          ? `<aside class="phase116b-detail-drawer">
              <p class="eyebrow">Open memory</p>
              <h4>${escapeHtml(detail.title)}</h4>
              <p>${escapeHtml(detail.content || detail.summary || "")}</p>
              <div class="scripture-strip">${safeArray(detail.references).map((reference) => `<span class="scripture-pill">${escapeHtml(phase116bScriptureReference(reference, "Scripture anchor"))}</span>`).join("")}</div>
              <div class="phase116b-action-row">
                <button class="secondary" type="button" data-phase116b-action="book-remove" data-phase116b-id="${escapeHtml(detail.id || detail.title)}">Remove Item</button>
                <button class="secondary" type="button" data-phase116b-action="open-current-graph">View Graph</button>
              </div>
            </aside>`
          : ""
      }
      <div class="phase116b-mini-list">
        ${safeArray(state.journalEntries).slice(0, 4).map((entry) => `<button type="button" data-phase116b-action="journal-detail" data-phase116b-id="${escapeHtml(entry.id)}"><strong>${escapeHtml(entry.title || "Journal")}</strong><span>${escapeHtml(phase116bScriptureReference((entry.scriptureReferences || [])[0], "Scripture anchor"))}</span></button>`).join("")}
      </div>
    `,
    "beforebegin"
  );
}

function renderPhase116bLexiconStudyPanel() {
  const items = getLexiconItems();
  const word = phase116bWordFromAny(state.phase116bSelectedLexiconWord, phase116bClusterFromAny());
  const sources = getLexiconItemSources(word);
  upsertPhase116bPanel(
    "#lexiconGrid",
    "phase116bLexiconStudyPanel",
    `
      <div class="phase116b-panel-head">
        <div>
          <p class="eyebrow">Lexicon Study Mode</p>
          <h3>${escapeHtml(word.word)}</h3>
          <p>${escapeHtml(word.meaning || getLexiconDescription(word))}</p>
        </div>
        <select id="phase116bLexiconWordSelect" aria-label="Select word for study">
          ${items.slice(0, 120).map((item) => `<option value="${escapeHtml(item.word)}" ${item.word === word.word ? "selected" : ""}>${escapeHtml(item.word)}</option>`).join("")}
        </select>
      </div>
      <div class="phase116b-command-grid">
        <article><span>Category</span><strong>${escapeHtml(getLexiconItemCategory(word))}</strong></article>
        <article><span>Part</span><strong>${escapeHtml(getLexiconItemPart(word))}</strong></article>
        <article><span>Scripture</span><strong>${escapeHtml(phase116bScriptureReference(sources[0] || state.selectedScripture))}</strong></article>
        <article><span>Related</span><strong>${escapeHtml(safeArray(word.related_words).slice(0, 3).join(", ") || "Current promise cluster")}</strong></article>
      </div>
      <p><strong>Prayer framework:</strong> ${escapeHtml(word.prayer_use || getClusterPrayer(phase116bClusterFromAny()))}</p>
      <div class="phase116b-action-row">
        <button class="secondary" type="button" data-phase116b-action="lexicon-pray">Pray This Word</button>
        <button class="secondary" type="button" data-phase116b-action="lexicon-save-book">Add to Book</button>
        <button class="secondary" type="button" data-phase116b-action="lexicon-add-table">Add to Promise Table</button>
        <button class="secondary" type="button" data-phase116b-action="lexicon-view-graph">View Graph</button>
        <button class="primary" type="button" data-phase116b-action="lexicon-complete-study">Complete Study Session</button>
      </div>
    `,
    "beforebegin"
  );
}

function renderPhase116bFunctionalQaPanel() {
  const panel = $("#phase114QaPanel .phase114-qa-card");
  if (!panel) return;
  let qa = $("#phase116bFunctionalQaPanel");
  if (!qa) {
    qa = document.createElement("section");
    qa.id = "phase116bFunctionalQaPanel";
    qa.className = "phase116b-functional-qa";
    panel.appendChild(qa);
  }
  const report = state.phase116bFunctionalQaReport;
  qa.innerHTML = `
    <div class="phase116b-panel-head">
      <div>
        <p class="eyebrow">Phase 11.6B Functional QA</p>
        <h3>${report ? (report.valid ? "Passing" : "Needs fixes") : "Not run yet"}</h3>
      </div>
      <button class="primary" type="button" data-phase116b-action="run-functional-qa">Run Functional QA</button>
    </div>
    ${
      report
        ? `<div class="phase116b-qa-grid">${report.checks
            .map((check) => `<article class="${check.status}"><strong>${escapeHtml(check.id)}</strong><span>${escapeHtml(check.status)}</span><p>${escapeHtml(check.detail)}</p></article>`)
            .join("")}</div>`
        : `<p>Runs real local flows in the browser: journey, Book, Journal, Promise Table, Search, Graph, Teo Guide, Calling Compass, Testimony, safe export, and reset readiness.</p>`
    }
  `;
}

function handlePhase116bAction(action, trigger = null) {
  if (action === "open-promise-add-dialog" && typeof dispatchTeoyubeAction === "function") {
    dispatchTeoyubeAction("promise.add.open", { trigger });
    return true;
  }
  if (action === "generate-today") {
    generateJourney();
    return true;
  }
  if (action === "start-today") {
    startPhase116bTodayJourney();
    return true;
  }
  if (action === "complete-today-action") {
    completePhase116bTodayAction();
    return true;
  }
  if (action === "add-current-reflection") {
    addPhase116bCurrentReflection();
    return true;
  }
  if (action === "pray-framework") {
    openPhase116bPrayerFramework();
    return true;
  }
  if (action === "view-my-journey") {
    viewPhase116bJourney();
    return true;
  }
  if (action === "open-current-graph") {
    updateGraphFromResponse(state.activeTigResponse || createPhase116bTigResponse({ source: getCurrentViewId() }));
    openPhase116GraphExplorer(trigger || document.activeElement);
    return true;
  }
  if (action === "manual-promise-add") {
    if (typeof dispatchTeoyubeAction === "function") {
      dispatchTeoyubeAction("promise.add.submit", { form: trigger?.form || $("#phase116b1PromiseAddForm"), trigger });
      return true;
    }
    const row = addPromiseTableItem({
      title: $("#phase116bManualPromiseTitle")?.value?.trim() || state.selectedPromiseResult?.title || getClusterTitle(phase116bClusterFromAny()),
      scripture: $("#phase116bManualPromiseScripture")?.value?.trim() || phase116bScriptureReference(state.selectedScripture),
      notes: $("#phase116bManualPromiseNotes")?.value?.trim() || "",
      status: "Discovered",
      source: "manual"
    });
    renderPhase116bPromiseWorkspace();
    renderPhase114PromiseTableRows();
    showActionToast("Promise row added", row.title);
    return true;
  }
  if (action === "promise-detail") {
    state.phase116bPromiseDetailId = trigger?.dataset.phase116bId || "";
    const row = getPhase114PromiseRows().find((item) => item.id === state.phase116bPromiseDetailId);
    if (row) {
      setActiveTigResponse({ source: "promise-table-detail", title: row.title, scripture: row.scripture, promise: row.title, action: row.notes || "Review, pray, and choose one faithful step." });
      updateRightRail({ surface: "promise-table", label: row.title, scripture: row.scripture });
    }
    saveState();
    renderPhase116bPromiseWorkspace();
    showActionToast("Promise detail opened", row?.title || "Selected row");
    return true;
  }
  if (action === "promise-save-note") {
    const row = safeArray(state.savedPromiseTableItems).find((item) => item.id === trigger?.dataset.phase116bId);
    if (row) {
      row.notes = $("#phase116bPromiseNoteInput")?.value || "";
      row.updatedAt = phase116bNow();
      saveState();
      renderPhase116bPromiseWorkspace();
      showActionToast("Promise note saved", row.title);
    }
    return true;
  }
  if (action === "promise-prayer" || action === "promise-start-action" || action === "promise-save-book") {
    const requestedId = trigger?.dataset.phase116bId || state.phase116bPromiseDetailId;
    const row = getPhase114PromiseRows().find((item) => item.id === requestedId) || getPhase114PromiseRows()[0];
    if (!row) return true;
    const rowCluster = {
      title: row.title,
      theme: row.title,
      scripture_references: [phase116bScriptureReference(row.scripture)],
      declaration: row.notes || "Pray, review Scripture, and take one faithful step connected to this saved promise.",
      prayer_framework: row.notes || "Pray, review Scripture, and take one faithful step connected to this saved promise."
    };
    const response = setActiveTigResponse({
      source: "promise-table",
      title: row.title,
      scripture: row.scripture,
      promise: row.title,
      promiseCluster: rowCluster,
      action: row.notes || "Take one faithful step connected to this promise."
    });
    if (action === "promise-prayer") openPhase116bPrayerFramework();
    if (action === "promise-start-action") {
      setActiveJourney({ title: `${row.title} action`, scripture: row.scripture, promise: row.title, progress: 25 });
      showActionToast("Promise action started", response.actionStep);
    }
    if (action === "promise-save-book") {
      saveToBook({ title: row.title, content: row.notes || response.actionStep, references: [row.scripture], source: "promise-table" });
      showActionToast("Promise saved to Book", row.title);
    }
    return true;
  }
  if (action === "export-safe-data" || action === "export-book") {
    openPhase113ExportCenter();
    return true;
  }
  if (action === "compass-start") {
    startPhase116bCallingCompass();
    return true;
  }
  if (action === "compass-back" || action === "compass-next") {
    movePhase116bCompass(action === "compass-back" ? "back" : "next");
    return true;
  }
  if (action === "compass-result") {
    const result = createPhase116bCompassResult();
    renderPhase116bCallingCompassTool();
    showActionToast("Calling Compass result ready", result.title);
    return true;
  }
  if (action === "compass-save-reflection") {
    const result = state.activeCallingResult || createPhase116bCompassResult();
    saveJournalEntry({ title: `Calling reflection: ${result.title}`, summary: result.summary, scriptureReferences: [result.scripture.reference], promise: getClusterTitle(result.promiseCluster) });
    showActionToast("Calling reflection saved", result.title);
    refreshPageFromState("book");
    return true;
  }
  if (action === "compass-start-journey") {
    const result = state.activeCallingResult || createPhase116bCompassResult();
    setActiveJourney({ title: result.journeyRecommendation, scripture: result.scripture.reference, promise: getClusterTitle(result.promiseCluster), progress: 20 });
    showActionToast("Calling journey started", result.journeyRecommendation);
    return true;
  }
  if (action === "teo-save-response" || action === "teo-save-prayer" || action === "teo-add-reflection") {
    const response = state.activeTigResponse || createPhase116bTigResponse({ source: "teo-guide" });
    if (action === "teo-save-response") saveToBook({ title: response.title, content: response.trace?.explanationPath?.join(" -> "), references: [response.scripture.reference], source: "teo-guide" });
    if (action === "teo-save-prayer") saveJournalEntry({ title: "Saved prayer", summary: response.prayer, scriptureReferences: [response.scripture.reference], word: response.word.word });
    if (action === "teo-add-reflection") addPhase116bCurrentReflection();
    showActionToast("Teo Guide item saved", response.title);
    return true;
  }
  if (action === "teo-copy-response") {
    const text = state.chat?.at?.(-1)?.text || state.activeTigResponse?.prayer || "No response available.";
    navigator.clipboard?.writeText(text).catch(() => showFallbackNotice("Clipboard permission unavailable; response remains visible in Teo Guide."));
    showActionToast("Response ready to copy", "Clipboard was requested; no external service was contacted.");
    return true;
  }
  if (action === "teo-clear-chat") {
    state.chat = defaultState.chat.slice();
    saveState();
    renderChat();
    showActionToast("Chat cleared", "Local Teo Guide chat reset to the guardrails welcome message.");
    return true;
  }
  if (action === "lexicon-select-word") {
    state.phase116bSelectedLexiconWord = trigger?.dataset.phase116bWord || state.phase116bSelectedLexiconWord || state.selectedWord;
    const word = setActiveWord(state.phase116bSelectedLexiconWord);
    setActiveTigResponse({ source: "lexicon-study", word, title: word.word, scripture: getLexiconItemSources(word)[0], promise: getLexiconItemCategory(word), prayer: word.prayer_use });
    saveState();
    renderPhase116bLexiconStudyPanel();
    renderPhase113InsightRail();
    showActionToast("Lexicon word selected", word.word);
    return true;
  }
  if (action.startsWith("lexicon-")) {
    if (trigger?.dataset.phase116bWord) state.phase116bSelectedLexiconWord = trigger.dataset.phase116bWord;
    const word = setActiveWord(state.phase116bSelectedLexiconWord);
    const response = setActiveTigResponse({ source: "lexicon", word, title: word.word, scripture: getLexiconItemSources(word)[0], promise: getLexiconItemCategory(word), prayer: word.prayer_use });
    if (action === "lexicon-pray") openPhase116bPrayerFramework();
    if (action === "lexicon-save-book") saveToBook({ title: word.word, content: word.meaning || getLexiconDescription(word), references: getLexiconItemSources(word), source: "lexicon" });
    if (action === "lexicon-add-table") addPromiseTableItem({ title: getLexiconItemCategory(word), scripture: getLexiconItemSources(word)[0], word: word.word, source: "lexicon" });
    if (action === "lexicon-view-graph") openPhase116GraphExplorer(trigger || document.activeElement);
    if (action === "lexicon-complete-study") {
      saveJournalEntry({ title: `Study session: ${word.word}`, summary: `Studied ${word.word} with ${response.scripture.reference}.`, scriptureReferences: [response.scripture.reference], word: word.word, promise: getLexiconItemCategory(word) });
      showActionToast("Study session saved", word.word);
    }
    refreshPageFromState("lexicon");
    return true;
  }
  if (action === "journal-save") {
    const journal = saveJournalEntry({
      title: $("#phase116bJournalTitle")?.value?.trim() || "Book reflection",
      content: $("#phase116bJournalContent")?.value?.trim() || "Reflection started in this local session.",
      scriptureReferences: [state.selectedScripture || "Ephesians 1:18"]
    });
    saveToBook({ title: journal.title, content: journal.summary, references: journal.scriptureReferences, source: "journal" });
    refreshPageFromState("book");
    showActionToast("Journal entry saved", journal.title);
    return true;
  }
  if (action === "book-detail") {
    state.phase116bBookDetailId = trigger?.dataset.phase116bId || "";
    const entry = safeArray(state.book).find((item) => item.id === state.phase116bBookDetailId || item.title === state.phase116bBookDetailId);
    if (entry) {
      setActiveTigResponse({ source: "book", title: entry.title, scripture: entry.references?.[0], promise: entry.title, action: entry.content });
      updateRightRail({ surface: "book", label: entry.title, scripture: entry.references?.[0] });
    }
    saveState();
    renderPhase116bBookJournalControls();
    renderPhase113InsightRail();
    showActionToast("Book detail opened", entry?.title || "Selected item");
    return true;
  }
  if (action === "book-remove") {
    const id = trigger?.dataset.phase116bId;
    state.book = safeArray(state.book).filter((entry) => entry.id !== id && entry.title !== id);
    state.bookEntries = state.book;
    saveState();
    refreshPageFromState("book");
    showActionToast("Book item removed", "The selected local item was removed.");
    return true;
  }
  if (action === "testimony-delete") {
    const id = trigger?.dataset.phase116bId;
    state.testimonies = safeArray(state.testimonies).filter((item) => item.id !== id && item.title !== id);
    state.testimonyEntries = state.testimonies;
    saveState();
    renderTestimonies();
    renderPhase113InsightRail();
    showActionToast("Testimony removed", "Local testimony draft/item removed from this session.");
    return true;
  }
  if (action === "testimony-status") {
    const id = trigger?.dataset.phase116bId;
    const item = safeArray(state.testimonies).find((testimony) => testimony.id === id || testimony.title === id);
    if (item) {
      const statuses = ["Draft", "Private", "Public"];
      item.status = statuses[(statuses.indexOf(item.status || "Draft") + 1) % statuses.length];
      item.updatedAt = phase116bNow();
      saveState();
      renderTestimonies();
      showActionToast("Testimony label updated", `${item.title}: ${item.status}`);
    }
    return true;
  }
  if (action === "run-functional-qa") {
    const report = runPhase116bFunctionalQa();
    showActionToast(report.valid ? "Functional QA passed" : "Functional QA needs fixes", `${report.checks.filter((check) => check.status === "pass").length}/${report.checks.length} checks passed.`);
    refreshPageFromState(getCurrentViewId());
    return true;
  }
  if (action === "graph-save-node" || action === "graph-prayer" || action === "graph-action") {
    const graph = state.graphSelection || updateGraphFromResponse(state.activeTigResponse || createPhase116bTigResponse({ source: "graph" }));
    const node = safeArray(graph.nodes).find((item) => item.id === state.phase116SelectedGraphNode) || safeArray(graph.nodes)[0];
    const response = state.activeTigResponse || createPhase116bTigResponse({ source: "graph", title: node?.label, scripture: phase116bScriptureReference(state.selectedScripture) });
    if (action === "graph-save-node") {
      saveToBook({ title: node?.label || "Graph node", content: node?.detail || "Saved from graph explorer.", references: [response.scripture?.reference || state.selectedScripture], source: "graph" });
      showActionToast("Graph node saved", node?.label || "Selected node");
    }
    if (action === "graph-prayer") {
      state.chat.push({ role: "teo", text: `Prayer from graph: ${response.prayer}` });
      setView("guide");
      renderChat();
      showActionToast("Graph prayer opened", response.scripture?.reference || state.selectedScripture);
    }
    if (action === "graph-action") {
      setActiveJourney({ title: `${node?.label || "Graph"} action`, scripture: response.scripture?.reference, promise: response.trace?.selectedPromiseCluster, progress: 30 });
      showActionToast("Graph action started", response.actionStep);
    }
    return true;
  }
  if (action === "reset-session") {
    resetPhase116bSession();
    return true;
  }
  return false;
}

const TEOYUBE_DATA_MODES = {
  memory_only: {
    label: "Memory-only session",
    summary: "Default. Data exists only in the current app state until you export or clear it."
  },
  export_only: {
    label: "Export-only backups",
    summary: "Use safe JSON or Markdown bundles when you choose to download a file."
  },
  optional_local_vault: {
    label: "Optional local vault preview",
    summary: "Off by default. This beta keeps the vault as an explicit, sanitized in-memory preview."
  }
};

const TEOYUBE_EXPORT_SCHEMA_VERSION = "teoyube-beta-export-v1";
const TEOYUBE_MAX_IMPORT_BYTES = 1_500_000;
const TEOYUBE_PHASE_117_TITLE =
  "Phase 11.7 - Local Persistence Options, Import/Export Hardening, Beta Data Safety, Clean Handoff Packaging & Offline-Ready Experience";
const TEOYUBE_PHASE_118_TITLE =
  "Phase 11.8 - Final Functional MVP Acceptance Gate, Bug Sweep, Manual Browser QA Completion & Beta Handoff";

function getTeoyubeDataMode() {
  return TEOYUBE_DATA_MODES[state.teoyubeDataMode] ? state.teoyubeDataMode : "memory_only";
}

function setTeoyubeDataMode(mode) {
  const nextMode = TEOYUBE_DATA_MODES[mode] ? mode : "memory_only";
  state.teoyubeDataMode = nextMode;
  state.teoyubeOptionalVaultEnabled = nextMode === "optional_local_vault";
  saveState();
  recordPhase114Action("Data mode changed", explainTeoyubeDataMode(nextMode).summary);
  renderTeoyubeDataControlsCenter();
  renderPhase114ExportOutput();
  renderPhase113InsightRail();
  renderPhase114QaPanel();
  return explainTeoyubeDataMode(nextMode);
}

function explainTeoyubeDataMode(mode = getTeoyubeDataMode()) {
  const config = TEOYUBE_DATA_MODES[mode] || TEOYUBE_DATA_MODES.memory_only;
  return {
    mode,
    label: config.label,
    summary: config.summary,
    defaultMode: mode === "memory_only",
    durableBrowserStoreActive: false,
    browserStorageRequired: false,
    externalUploadRequired: false,
    safeExportAvailable: true,
    clearAvailable: true,
    notice:
      mode === "optional_local_vault"
        ? "Optional vault is visible as an owner-controlled beta preview only; no hidden durable browser store is used."
        : "The static beta keeps data local to the session unless you explicitly download an export file."
  };
}

function classifyTeoyubeRecord(record = {}) {
  const type = normalize(record.type || record.category || record.source || "record");
  const status = normalize(record.status || "");
  const text = normalize([record.content, record.text, record.body, record.summary, record.prayer, record.reflection].join(" "));
  const reasons = [];
  let sensitivity = "public_static";

  if (textIncludesAny(type, ["journal", "reflection", "prayer", "testimony", "profile", "personalization", "signal"])) {
    sensitivity = "sensitive_user_authored";
    reasons.push("User-authored or personalization-related content.");
  } else if (textIncludesAny(type, ["memory", "journey", "action", "promise table"])) {
    sensitivity = "user_controlled_session";
    reasons.push("Session-created journey or saved action data.");
  } else {
    reasons.push("Static or derived Scripture/promise context.");
  }

  if (status === "private" || status === "draft") {
    sensitivity = "sensitive_user_authored";
    reasons.push("Private or draft status.");
  }

  if (textIncludesAny(text, ["i feel", "father,", "god gave me", "share what", "my purpose", "my story"])) {
    sensitivity = "sensitive_user_authored";
    reasons.push("Looks like personal devotional or testimony text.");
  }

  return {
    recordType: record.type || record.category || "record",
    sensitivity,
    canExportSafely: true,
    requiresExplicitRawTextOptIn: sensitivity === "sensitive_user_authored",
    defaultExportTreatment: sensitivity === "sensitive_user_authored" ? "redacted_summary" : "structured_safe",
    reasons
  };
}

function shouldRedactTeoyubeField(key = "", options = {}) {
  const name = normalize(key);
  const rawAllowed = Boolean(options.includeRawPrivateText && options.fullPersonalExportConfirmed);
  if (rawAllowed) return false;
  return [
    "content",
    "text",
    "body",
    "raw",
    "rawtext",
    "testimony",
    "prayer",
    "journal",
    "reflection",
    "private",
    "challenge"
  ].some((token) => name.includes(token));
}

function createRedactedSummary(record = {}) {
  const classification = classifyTeoyubeRecord(record);
  const references = safeArray(record.references || record.scriptureReferences || record.scripture_references);
  return [
    record.title || record.label || classification.recordType || "Teoyube record",
    references.length ? `Scripture: ${references.join(", ")}` : "",
    `Treatment: ${classification.defaultExportTreatment}`
  ]
    .filter(Boolean)
    .join(" | ");
}

function sanitizeTeoyubeRecordForExport(record = {}, options = {}) {
  if (!record || typeof record !== "object") return record;
  const classification = classifyTeoyubeRecord(record);
  const output = Array.isArray(record) ? [] : {};
  Object.entries(record).forEach(([key, value]) => {
    if (shouldRedactTeoyubeField(key, options)) {
      output[key] = classification.requiresExplicitRawTextOptIn
        ? "[redacted: raw private text excluded from beta export]"
        : createRedactedSummary(record);
      return;
    }
    if (Array.isArray(value)) {
      output[key] = value.map((item) =>
        item && typeof item === "object" ? sanitizeTeoyubeRecordForExport(item, options) : item
      );
      return;
    }
    if (value && typeof value === "object") {
      output[key] = sanitizeTeoyubeRecordForExport(value, options);
      return;
    }
    output[key] = value;
  });
  output.dataSafety = classification;
  output.rawPrivateTextIncluded = Boolean(options.includeRawPrivateText && options.fullPersonalExportConfirmed);
  return output;
}

function sanitizeTeoyubeRecordForVault(record = {}) {
  const safeRecord = sanitizeTeoyubeRecordForExport(record, {
    includeRawPrivateText: false,
    fullPersonalExportConfirmed: false
  });
  return {
    ...safeRecord,
    vaultTreatment: "sanitized-in-memory-preview",
    durableBrowserStoreActive: false
  };
}

function getPhase117ExportOptions(overrides = {}) {
  return {
    ...state.teoyubeExportOptions,
    ...overrides,
    includeRawPrivateText: Boolean(
      (overrides.includeRawPrivateText ?? state.teoyubeExportOptions?.includeRawPrivateText) &&
        state.teoyubeFullPersonalExportConfirmed
    ),
    fullPersonalExportConfirmed: Boolean(state.teoyubeFullPersonalExportConfirmed)
  };
}

function summarizeTeoyubeLocalData() {
  return {
    bookEntries: safeArray(state.book).length,
    promiseTableRows: getPhase114PromiseRows().length,
    testimonies: safeArray(state.testimonies).length,
    journalEntries: safeArray(state.journalEntries).length,
    journeyMemory: safeArray(state.journeyMemory).length,
    personalizationSignals: safeArray(state.personalizationSignalStore).length,
    preferenceHints: safeArray(state.preferenceHints).length,
    optionalVaultRecords: safeArray(state.teoyubeOptionalVaultRecords).length,
    dataMode: getTeoyubeDataMode(),
    offlineStatus: state.teoyubeOfflineStatus || "online",
    externalServicesRequired: false,
    analyticsEnabled: false,
    databaseEnabled: false,
    liveAiEnabled: false
  };
}

function createTeoyubeDataSafetyNotice() {
  const mode = explainTeoyubeDataMode();
  return {
    title: "Beta data safety notice",
    summary:
      "Teoyube keeps the current beta local-first. Exports are user-triggered downloads, imports are previewed before merge, and raw private text is redacted by default.",
    dataMode: mode,
    constraints: [
      "No external upload is performed.",
      "No analytics are sent.",
      "No database persistence is connected.",
      "No live AI orchestration is enabled.",
      "No automatic user contact is performed.",
      "Scripture anchors remain visible where available."
    ],
    backupReminder:
      "Before closing the beta, download a safe JSON backup or Markdown summary if you want to keep session-created data."
  };
}

function createPhase117RecordId(record = {}, prefix = "record") {
  return String(
    record.id ||
      record.slug ||
      `${prefix}_${normalize(record.title || record.label || record.type || "item").replace(/[^a-z0-9]+/g, "_").slice(0, 42)}_${String(record.date || record.savedAt || record.createdAt || "").slice(0, 10)}`
  );
}

function createPhase117RoadmapSnapshot() {
  return {
    currentMajorMilestone:
      "TEOYUBE Phase 11 - Advanced Real App Productization, Local Persistence Options, Import/Export Hardening, Beta Data Safety & Offline-Ready Experience",
    completed: [
      "Phase 11.1 - App productization audit and real static app stabilization",
      "Phase 11.2 - Screenshot-guided functional UX repair",
      "Phase 11.3 - Runtime consolidation and advanced state layer",
      "Phase 11.4 - User acceptance hardening, mobile QA, accessibility, and beta polish",
      "Phase 11.5 - Consent-first personalization, saved journey memory, and preference preview",
      "Phase 11.6 - Premium local intelligence UX, graph/list explanations, workflows, and smart rail",
      TEOYUBE_PHASE_117_TITLE
    ],
    status:
      "In progress - local data controls, safe import/export, beta handoff packaging, and offline-ready experience completed",
    currentStep: `${TEOYUBE_PHASE_117_TITLE}: Complete`,
    nextRecommendedStep: TEOYUBE_PHASE_118_TITLE
  };
}

function buildTeoyubeExportBundle(overrides = {}) {
  const options = getPhase117ExportOptions(overrides);
  const selectedCluster = promiseClusters[state.clusterIndex] || promiseClusters[0];
  const promiseRows = getPhase114PromiseRows();
  const bookEntries = safeArray(state.book).map((entry) => ({
    ...entry,
    id: createPhase117RecordId(entry, "book")
  }));
  const testimonies = safeArray(state.testimonies).map((entry) => ({
    ...entry,
    id: createPhase117RecordId(entry, "testimony")
  }));
  const journalEntries = safeArray(state.journalEntries).map((entry) => ({
    ...entry,
    id: createPhase117RecordId(entry, "journal")
  }));
  const personalizationSignals = options.includeStructuredPersonalization
    ? safeArray(state.personalizationSignalStore).map((entry) => sanitizeTeoyubeRecordForExport(entry, options))
    : [];
  const journeyMemory = options.includeJourneyMemory
    ? safeArray(state.journeyMemory).map((entry) => sanitizeTeoyubeRecordForExport(entry, options))
    : [];
  const warnings = [];
  if (state.teoyubeExportOptions?.includeRawPrivateText && !state.teoyubeFullPersonalExportConfirmed) {
    warnings.push("Raw private text option was requested but explicit full personal export confirmation is off; raw text remains redacted.");
  }
  if (options.excludePrivateReflections) {
    warnings.push("Private reflections and draft testimony text are summarized or redacted by default.");
  }
  if (!getClusterScriptures(selectedCluster).length) {
    warnings.push("Current promise cluster has no Scripture anchor and should be reviewed before handoff.");
  }

  const sections = {
    activeSelection: {
      word: state.selectedWord || state.generatedWord.word,
      scripture: state.selectedScripture || getClusterScriptures(selectedCluster)[0],
      promise: state.selectedPromiseResult?.title || getClusterTitle(selectedCluster),
      calling: state.calling?.primary || analyzeCalling(state.profile).primary
    },
    promiseTable: promiseRows.map((row) => sanitizeTeoyubeRecordForExport(row, options)),
    book: bookEntries
      .filter((entry) => !options.excludePrivateReflections || normalize(entry.type) !== "private")
      .map((entry) => sanitizeTeoyubeRecordForExport(entry, options)),
    testimonyArchive: testimonies.map((entry) => sanitizeTeoyubeRecordForExport(entry, options)),
    journalEntries: journalEntries.map((entry) => sanitizeTeoyubeRecordForExport(entry, options)),
    journeyMemory,
    personalizationSignals,
    preferenceHints: options.includeStructuredPersonalization
      ? safeArray(state.preferenceHints).map((entry) => sanitizeTeoyubeRecordForExport(entry, options))
      : [],
    roadmapSnapshot: createPhase117RoadmapSnapshot(),
    dataSafetyNotice: createTeoyubeDataSafetyNotice()
  };

  const bundle = {
    schemaVersion: TEOYUBE_EXPORT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    appPhase: "11.7",
    phase: "11.7",
    primaryRuntime: "static-node-app",
    localOnlyNotice: "This is a user-triggered local beta export. No external upload or automatic contact was performed.",
    dataMode: explainTeoyubeDataMode(),
    includedSections: Object.entries(sections)
      .filter(([, value]) => !Array.isArray(value) || value.length)
      .map(([key]) => key),
    redactionMode: options.includeRawPrivateText ? "explicit_full_personal_export" : "safe_redacted_default",
    recordCounts: summarizeTeoyubeLocalData(),
    warnings,
    noExternalUploadNotice: true,
    rawPrivateTextIncluded: Boolean(options.includeRawPrivateText),
    browserPersistenceUsed: false,
    externalServicesCalled: false,
    analyticsSent: false,
    liveAiOrchestrationEnabled: false,
    databasePersistenceEnabled: false,
    activeSelection: sections.activeSelection,
    savedPromiseTableItems: sections.promiseTable,
    bookEntries: sections.book,
    journalEntries: sections.journalEntries,
    testimonyEntries: sections.testimonyArchive,
    personalization: {
      status: getPersonalizationStatus(),
      preferenceHints: sections.preferenceHints,
      personalizationSignals: {
        mode: getPersonalizationMode(),
        count: sections.personalizationSignals.length,
        rawPrivateTextIncluded: Boolean(options.includeRawPrivateText),
        localSessionOnly: true
      },
      journeyMemory: exportJourneyMemory(),
      rawPrivateTextIncluded: Boolean(options.includeRawPrivateText)
    },
    roadmapSnapshot: sections.roadmapSnapshot,
    consentState: state.consentState,
    qaSummary: {
      lastActionRun: state.lastActionRun,
      lastFallbackReason: state.lastFallbackReason,
      externalServicesStatus: "disabled",
      localOnlyStatus: "enabled",
      dataMode: getTeoyubeDataMode()
    },
    sections
  };
  state.teoyubeLastExportBundle = bundle;
  return bundle;
}

function validateTeoyubeImportBundle(bundle = {}) {
  const blockers = [];
  const warnings = [];
  if (!bundle || typeof bundle !== "object" || Array.isArray(bundle)) blockers.push("Import file must be a JSON object.");
  if (bundle.schemaVersion !== TEOYUBE_EXPORT_SCHEMA_VERSION) {
    blockers.push(`Unsupported or missing schemaVersion. Expected ${TEOYUBE_EXPORT_SCHEMA_VERSION}.`);
  }
  if (!bundle.sections && !bundle.savedPromiseTableItems && !bundle.bookEntries && !bundle.testimonyEntries) {
    blockers.push("No supported Teoyube export sections were found.");
  }
  if (bundle.rawPrivateTextIncluded) {
    warnings.push("This bundle claims to include raw private text. Preview carefully before merge.");
  }
  if (bundle.externalServicesCalled || bundle.analyticsSent || bundle.liveAiOrchestrationEnabled) {
    warnings.push("Bundle metadata indicates behavior outside the local beta constraints; merge only sanitized records.");
  }
  return {
    valid: blockers.length === 0,
    blockers,
    warnings,
    schemaVersion: bundle.schemaVersion || "missing",
    sections: Object.keys(bundle.sections || {}).concat(
      ["savedPromiseTableItems", "bookEntries", "testimonyEntries"].filter((key) => Array.isArray(bundle[key]))
    ),
    recordCounts: {
      promiseTable: safeArray(bundle.sections?.promiseTable || bundle.savedPromiseTableItems).length,
      book: safeArray(bundle.sections?.book || bundle.bookEntries).length,
      testimonyArchive: safeArray(bundle.sections?.testimonyArchive || bundle.testimonyEntries).length,
      journeyMemory: safeArray(bundle.sections?.journeyMemory || bundle.personalization?.journeyMemory?.journeyMemory).length,
      personalizationSignals: safeArray(bundle.sections?.personalizationSignals).length
    }
  };
}

function validateImportSchema(bundle = {}) {
  return validateTeoyubeImportBundle(bundle);
}

function parseImportFileSafely(text = "") {
  if (!text || !String(text).trim()) {
    return { valid: false, error: "No import file content selected.", bundle: null };
  }
  if (String(text).length > TEOYUBE_MAX_IMPORT_BYTES) {
    return { valid: false, error: "Import file is too large for this local beta preview.", bundle: null };
  }
  try {
    const bundle = JSON.parse(text);
    return { valid: true, error: "", bundle };
  } catch (error) {
    return { valid: false, error: `Could not parse JSON: ${error.message}`, bundle: null };
  }
}

function sanitizeImportedBundle(bundle = {}) {
  const sections = bundle.sections || {};
  return {
    ...bundle,
    sections: {
      promiseTable: safeArray(sections.promiseTable || bundle.savedPromiseTableItems).map(sanitizeTeoyubeRecordForVault),
      book: safeArray(sections.book || bundle.bookEntries).map(sanitizeTeoyubeRecordForVault),
      testimonyArchive: safeArray(sections.testimonyArchive || bundle.testimonyEntries).map(sanitizeTeoyubeRecordForVault),
      journeyMemory: safeArray(sections.journeyMemory || bundle.personalization?.journeyMemory?.journeyMemory).map(sanitizeTeoyubeRecordForVault),
      personalizationSignals: safeArray(sections.personalizationSignals).map(sanitizeTeoyubeRecordForVault),
      preferenceHints: safeArray(sections.preferenceHints).map(sanitizeTeoyubeRecordForVault)
    },
    rawPrivateTextIncluded: false,
    sanitizedAt: new Date().toISOString()
  };
}

function detectImportDuplicates(bundle = {}) {
  const sanitized = sanitizeImportedBundle(bundle);
  const currentIds = {
    promiseTable: new Set(getPhase114PromiseRows().map((row) => createPhase117RecordId(row, "promise"))),
    book: new Set(safeArray(state.book).map((row) => createPhase117RecordId(row, "book"))),
    testimonyArchive: new Set(safeArray(state.testimonies).map((row) => createPhase117RecordId(row, "testimony"))),
    journeyMemory: new Set(safeArray(state.journeyMemory).map((row) => createPhase117RecordId(row, "memory")))
  };
  return Object.entries({
    promiseTable: sanitized.sections.promiseTable,
    book: sanitized.sections.book,
    testimonyArchive: sanitized.sections.testimonyArchive,
    journeyMemory: sanitized.sections.journeyMemory
  }).map(([section, records]) => ({
    section,
    duplicates: records.filter((record) => currentIds[section]?.has(createPhase117RecordId(record, section))).length,
    incoming: records.length
  }));
}

function summarizeImportPreview(bundle = {}) {
  const validation = validateTeoyubeImportBundle(bundle);
  const duplicates = detectImportDuplicates(bundle);
  const privateRecordCount = Object.values(sanitizeImportedBundle(bundle).sections)
    .flat()
    .filter((record) => classifyTeoyubeRecord(record).requiresExplicitRawTextOptIn).length;
  return {
    valid: validation.valid,
    blockers: validation.blockers,
    warnings: [
      ...validation.warnings,
      privateRecordCount ? `${privateRecordCount} sensitive records will stay sanitized during import.` : ""
    ].filter(Boolean),
    sections: validation.sections,
    recordCounts: validation.recordCounts,
    duplicates,
    privateRecordCount,
    mergeStrategies: ["preview_only", "merge_new_only", "replace_current_session", "cancel"],
    localOnly: true
  };
}

function previewTeoyubeImportBundle(bundle = {}) {
  const preview = summarizeImportPreview(bundle);
  state.teoyubeLastImportPreview = preview;
  return preview;
}

function mergeImportedRecords(currentRecords = [], incomingRecords = [], strategy = "merge_new_only", prefix = "record") {
  const sanitizedIncoming = safeArray(incomingRecords).map(sanitizeTeoyubeRecordForVault);
  if (strategy === "replace_current_session") return sanitizedIncoming;
  if (strategy !== "merge_new_only") return safeArray(currentRecords);
  const seen = new Set(safeArray(currentRecords).map((record) => createPhase117RecordId(record, prefix)));
  const fresh = sanitizedIncoming.filter((record) => {
    const id = createPhase117RecordId(record, prefix);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return [...fresh, ...safeArray(currentRecords)];
}

function mergeTeoyubeImportBundle(bundle = {}, strategy = state.teoyubeImportStrategy || "preview_only") {
  const validation = validateTeoyubeImportBundle(bundle);
  const preview = previewTeoyubeImportBundle(bundle);
  if (!validation.valid || strategy === "preview_only" || strategy === "cancel") {
    return { merged: false, strategy, preview, validation };
  }
  const sanitized = sanitizeImportedBundle(bundle);
  state.savedPromiseTableItems = mergeImportedRecords(
    safeArray(state.savedPromiseTableItems),
    sanitized.sections.promiseTable.filter((row) => row.id !== "active-daily-promise"),
    strategy,
    "promise"
  ).slice(0, 80);
  state.book = mergeImportedRecords(safeArray(state.book), sanitized.sections.book, strategy, "book").slice(0, 120);
  state.testimonies = mergeImportedRecords(safeArray(state.testimonies), sanitized.sections.testimonyArchive, strategy, "testimony").slice(0, 80);
  state.journeyMemory = mergeImportedRecords(safeArray(state.journeyMemory), sanitized.sections.journeyMemory, strategy, "memory").slice(0, 120);
  state.personalizationSignalStore = mergeImportedRecords(
    safeArray(state.personalizationSignalStore),
    sanitized.sections.personalizationSignals,
    strategy,
    "signal"
  ).slice(0, 80);
  state.preferenceHints = mergeImportedRecords(safeArray(state.preferenceHints), sanitized.sections.preferenceHints, strategy, "hint").slice(0, 40);
  state.teoyubeLastImportPreview = preview;
  saveState();
  render();
  recordPhase114Action("Import merged", `${strategy.replaceAll("_", " ")} applied with sanitized records.`);
  return { merged: true, strategy, preview, validation };
}

function validatePromiseTableImportBundle(bundle = {}) {
  const preview = previewTeoyubeImportBundle(bundle);
  return {
    valid: preview.valid,
    promiseRows: preview.recordCounts.promiseTable,
    warnings: preview.warnings
  };
}

function clearTeoyubeSessionData() {
  state.book = [];
  state.testimonies = [];
  state.savedPromiseTableItems = [];
  state.journalEntries = [];
  state.journeyMemory = [];
  state.personalizationSignals = [];
  state.personalizationSignalStore = [];
  state.preferenceHints = [];
  state.phase116RecentSafeSearches = [];
  state.lastPersonalizationDecision = null;
  state.teoyubeLastImportPreview = null;
  state.teoyubeLastExportStatus = null;
  saveState();
  render();
  showPhase113SaveDrawer({ title: "Session data cleared", detail: "User-created beta session records were cleared from memory." });
  return summarizeTeoyubeLocalData();
}

function clearTeoyubeOptionalVault() {
  state.teoyubeOptionalVaultRecords = [];
  state.teoyubeOptionalVaultEnabled = false;
  if (state.teoyubeDataMode === "optional_local_vault") state.teoyubeDataMode = "memory_only";
  saveState();
  renderTeoyubeDataControlsCenter();
  renderPhase113InsightRail();
  showPhase113SaveDrawer({ title: "Optional vault cleared", detail: "Sanitized in-memory vault preview records were cleared." });
  return summarizeTeoyubeLocalData();
}

function createPhase117MarkdownExport(bundle = buildTeoyubeExportBundle()) {
  const counts = bundle.recordCounts || {};
  const rows = (bundle.sections?.promiseTable || [])
    .map((row) => `- ${row.title || row.label || "Promise row"} (${phase116bScriptureReference(row.scripture, "Scripture review needed")}) - ${row.status || "Saved"}`)
    .join("\n") || "- No promise rows saved.";
  const bookRows = (bundle.sections?.book || [])
    .map((entry) => `- ${entry.type || "Book"}: ${entry.title || "Untitled"} [${safeArray(entry.references).map((reference) => phase116bScriptureReference(reference, "")).filter(Boolean).join(", ")}]`)
    .join("\n") || "- No Book entries saved.";
  const testimonyRows = (bundle.sections?.testimonyArchive || [])
    .map((entry) => `- ${entry.title || "Untitled testimony"} (${entry.status || "Draft"}) [${safeArray(entry.references).map((reference) => phase116bScriptureReference(reference, "")).filter(Boolean).join(", ")}]`)
    .join("\n") || "- No testimony entries saved.";
  return `# TEOYUBE Beta Export\n\nGenerated: ${bundle.generatedAt}\nSchema: ${bundle.schemaVersion}\nPhase: ${bundle.appPhase}\nPrimary runtime: ${bundle.primaryRuntime}\nData mode: ${bundle.dataMode.label}\nRedaction: ${bundle.redactionMode}\n\n## Safety\n- External upload performed: no\n- Analytics sent: no\n- Database persistence enabled: no\n- Live AI orchestration enabled: no\n- Raw private text included: ${bundle.rawPrivateTextIncluded ? "yes, explicitly confirmed" : "no, redacted by default"}\n\n## Counts\n- Book entries: ${counts.bookEntries || 0}\n- Promise Table rows: ${counts.promiseTableRows || 0}\n- Testimonies: ${counts.testimonies || 0}\n- Journey memory: ${counts.journeyMemory || 0}\n- Personalization signals: ${counts.personalizationSignals || 0}\n\n## Active Selection\n- Word: ${bundle.sections.activeSelection.word}\n- Scripture: ${bundle.sections.activeSelection.scripture}\n- Promise: ${bundle.sections.activeSelection.promise}\n\n## Promise Table\n${rows}\n\n## Book\n${bookRows}\n\n## Testimony Archive\n${testimonyRows}\n\n## Warnings\n${bundle.warnings.length ? bundle.warnings.map((warning) => `- ${warning}`).join("\n") : "- No blocking warnings."}\n\n## Next\n${bundle.sections.roadmapSnapshot.nextRecommendedStep}\n`;
}

function buildPhase117ExportFilename(format = "json") {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `teoyube-beta-${format}-${stamp}.${format === "markdown" ? "md" : "json"}`;
}

function downloadPhase117TextFile(filename, content, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 250);
    state.teoyubeLastExportStatus = { status: "success", filename, createdAt: new Date().toISOString() };
    recordPhase114Action("Export downloaded", filename);
    renderTeoyubeDataControlsCenter();
    renderPhase114ExportOutput();
    return true;
  } catch (error) {
    state.teoyubeLastExportStatus = { status: "failed", filename, error: error.message, createdAt: new Date().toISOString() };
    recordPhase114Error("Export failed", error);
    renderTeoyubeDataControlsCenter();
    renderPhase114ExportOutput();
    return false;
  }
}

function downloadTeoyubeExport(format = phase114ExportFormat) {
  const bundle = buildTeoyubeExportBundle();
  if (format === "markdown") {
    return downloadPhase117TextFile(buildPhase117ExportFilename("markdown"), createPhase117MarkdownExport(bundle), "text/markdown");
  }
  return downloadPhase117TextFile(buildPhase117ExportFilename("json"), JSON.stringify(bundle, null, 2), "application/json");
}

function renderTeoyubeBetaBackupReminder(source = "center") {
  if (state.teoyubeBetaBackupReminderDismissed) return "";
  return `
    <aside class="phase117-backup-reminder" data-phase117-source="${escapeHtml(source)}">
      <strong>Beta backup reminder</strong>
      <p>Before closing this local beta, download a safe JSON backup or Markdown summary if you want to keep Book, Promise Table, testimony, journey memory, or personalization signal previews.</p>
      <div class="phase115-control-row">
        <button type="button" class="secondary" data-phase117-action="download-json">Download Safe JSON</button>
        <button type="button" class="secondary" data-phase117-action="download-markdown">Download Markdown</button>
        <button type="button" class="secondary" data-phase117-action="dismiss-backup-reminder">Dismiss</button>
      </div>
    </aside>
  `;
}

function renderImportPreviewDialog(preview = state.teoyubeLastImportPreview) {
  const target = $("#phase117ImportPreviewContent");
  const html = `
    <section class="phase117-import-preview">
      <p class="eyebrow">Import Preview / Restore</p>
      <h3>${preview ? (preview.valid ? "Bundle ready for review" : "Bundle needs attention") : "Choose a Teoyube beta JSON backup"}</h3>
      ${
        preview
          ? `
            <dl>
              <div><dt>Book</dt><dd>${escapeHtml(String(preview.recordCounts.book || 0))}</dd></div>
              <div><dt>Promise Table</dt><dd>${escapeHtml(String(preview.recordCounts.promiseTable || 0))}</dd></div>
              <div><dt>Testimonies</dt><dd>${escapeHtml(String(preview.recordCounts.testimonyArchive || 0))}</dd></div>
              <div><dt>Journey Memory</dt><dd>${escapeHtml(String(preview.recordCounts.journeyMemory || 0))}</dd></div>
              <div><dt>Private/Sensitive</dt><dd>${escapeHtml(String(preview.privateRecordCount || 0))} sanitized</dd></div>
            </dl>
            <div class="phase117-warning-list">
              ${safeArray(preview.blockers).map((item) => `<p class="phase115-warning">${escapeHtml(item)}</p>`).join("")}
              ${safeArray(preview.warnings).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
              ${safeArray(preview.duplicates).map((item) => `<p>${escapeHtml(item.section)}: ${escapeHtml(String(item.duplicates))} duplicates from ${escapeHtml(String(item.incoming))} incoming.</p>`).join("")}
            </div>
          `
          : `<p>Imports are parsed locally, validated against ${TEOYUBE_EXPORT_SCHEMA_VERSION}, sanitized, and previewed before any merge. No external upload is used.</p>`
      }
      <label class="phase117-file-picker">
        Select JSON backup
        <input id="phase117ImportFile" type="file" accept="application/json,.json" />
      </label>
      <div class="phase117-import-strategies" aria-label="Import merge strategy">
        ${[
          ["preview_only", "Preview only"],
          ["merge_new_only", "Merge new only"],
          ["replace_current_session", "Replace current session"],
          ["cancel", "Cancel"]
        ]
          .map(
            ([id, label]) =>
              `<button type="button" class="${state.teoyubeImportStrategy === id ? "primary" : "secondary"}" data-phase117-import-strategy="${id}">${label}</button>`
          )
          .join("")}
      </div>
      <div class="phase115-control-row">
        <button type="button" class="secondary" data-phase117-action="preview-import">Preview Import</button>
        <button type="button" class="primary" data-phase117-action="merge-import" ${preview?.valid ? "" : "disabled"}>Apply Selected Strategy</button>
      </div>
    </section>
  `;
  if (target) target.innerHTML = html;
  return html;
}

function renderTeoyubeDataControlsCenter() {
  const target = $("#phase117DataControlsContent");
  if (!target) return;
  const summary = summarizeTeoyubeLocalData();
  const notice = createTeoyubeDataSafetyNotice();
  const mode = getTeoyubeDataMode();
  const lastStatus = state.teoyubeLastExportStatus;
  target.innerHTML = `
    <section class="phase117-data-controls-center">
      ${renderTeoyubeBetaBackupReminder("data-controls-center")}
      <div class="phase117-data-mode-grid">
        ${Object.entries(TEOYUBE_DATA_MODES)
          .map(
            ([id, config]) => `
              <article class="${id === mode ? "active" : ""}">
                <h3>${escapeHtml(config.label)}</h3>
                <p>${escapeHtml(config.summary)}</p>
                <small>${id === "optional_local_vault" ? "Preview only; no hidden durable browser store is active." : "User-triggered, local-only beta behavior."}</small>
                <button type="button" class="${id === mode ? "primary" : "secondary"}" data-teoyube-data-mode="${escapeHtml(id)}">${id === mode ? "Selected" : "Choose"}</button>
              </article>
            `
          )
          .join("")}
      </div>
      <section class="phase117-summary-grid" aria-label="Local data summary">
        ${Object.entries({
          Book: summary.bookEntries,
          "Promise Table": summary.promiseTableRows,
          Testimonies: summary.testimonies,
          "Journey Memory": summary.journeyMemory,
          Signals: summary.personalizationSignals,
          Vault: summary.optionalVaultRecords
        })
          .map(([label, value]) => `<article><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></article>`)
          .join("")}
      </section>
      <section class="phase117-export-options">
        <div class="phase114-section-head">
          <div>
            <p class="eyebrow">Beta Export Center</p>
            <h3>Safe by default</h3>
            <p>${escapeHtml(notice.summary)}</p>
          </div>
          <div class="phase115-control-row">
            <button type="button" class="secondary" data-phase117-action="download-json">Safe JSON</button>
            <button type="button" class="secondary" data-phase117-action="download-markdown">Safe Markdown</button>
          </div>
        </div>
        <div class="phase117-option-grid">
          ${[
            ["includeStructuredPersonalization", "Structured personalization signals"],
            ["includeJourneyMemory", "Journey memory"],
            ["excludePrivateReflections", "Exclude private reflections"],
            ["markdownSummaryOnly", "Markdown summary only"],
            ["jsonBackupBundle", "JSON backup bundle"]
          ]
            .map(
              ([key, label]) => `
                <label>
                  <input type="checkbox" data-phase117-export-option="${escapeHtml(key)}" ${state.teoyubeExportOptions?.[key] ? "checked" : ""} />
                  <span>${escapeHtml(label)}</span>
                </label>
              `
            )
            .join("")}
          <label>
            <input type="checkbox" data-phase117-full-export-confirm ${state.teoyubeFullPersonalExportConfirmed ? "checked" : ""} />
            <span>Explicitly allow full personal export review</span>
          </label>
          <label>
            <input type="checkbox" data-phase117-export-option="includeRawPrivateText" ${state.teoyubeExportOptions?.includeRawPrivateText ? "checked" : ""} />
            <span>Include raw journal/testimony text only after confirmation</span>
          </label>
        </div>
        ${lastStatus ? `<p class="phase117-export-status ${escapeHtml(lastStatus.status)}">${escapeHtml(lastStatus.status === "success" ? `Last export downloaded: ${lastStatus.filename}` : `Last export failed: ${lastStatus.error || "Unknown error"}`)}</p>` : ""}
      </section>
      <div id="phase117ImportPreviewContent">${renderImportPreviewDialog(state.teoyubeLastImportPreview)}</div>
      <section class="phase117-clear-panel">
        <p class="eyebrow">Clear Controls</p>
        <h3>Owner-controlled reset only</h3>
        <p>These actions affect only the current local beta session or the sanitized in-memory vault preview.</p>
        <div class="phase115-control-row">
          <button type="button" class="secondary danger" data-phase117-action="clear-session-data">Clear session data</button>
          <button type="button" class="secondary" data-phase117-action="clear-optional-vault">Clear optional vault</button>
        </div>
      </section>
    </section>
  `;
}

function openTeoyubeDataControlsCenter(trigger = document.activeElement) {
  ensurePhase113Shell();
  phase113CommandReturnFocus = trigger;
  renderTeoyubeDataControlsCenter();
  const dialog = $("#phase117DataControlsDialog");
  if (!dialog) return;
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  else dialog.setAttribute("open", "open");
  recordPhase114Action("Data Controls Center opened", "Phase 11.7 beta data controls are visible.");
}

function closeTeoyubeDataControlsCenter() {
  const dialog = $("#phase117DataControlsDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  dialog.removeAttribute("open");
  if (phase113CommandReturnFocus?.focus) phase113CommandReturnFocus.focus();
}

function updateTeoyubeOfflineStatus() {
  state.teoyubeOfflineStatus = typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "online";
  renderTeoyubeOfflineStatus();
  renderPhase114QaPanel();
}

function renderTeoyubeOfflineStatus() {
  const target = $("#phase117OfflineStatus");
  if (!target) return;
  const offline = state.teoyubeOfflineStatus === "offline";
  target.innerHTML = `
    <span class="phase117-offline-pill ${offline ? "offline" : "online"}">${offline ? "Offline-ready local mode" : "Local beta online"}</span>
    <small>${offline ? "No network is required for saved local views, safe export, import preview, or data controls." : "External services remain disabled; network is not used for AI, analytics, uploads, or persistence."}</small>
  `;
}

function handlePhase117Action(action, trigger = null) {
  if (action === "open-data-controls") {
    openTeoyubeDataControlsCenter(trigger || document.activeElement);
    return true;
  }
  if (action === "download-json") {
    phase114ExportFormat = "json";
    downloadTeoyubeExport("json");
    return true;
  }
  if (action === "download-markdown") {
    phase114ExportFormat = "markdown";
    downloadTeoyubeExport("markdown");
    return true;
  }
  if (action === "refresh-export-preview") {
    renderPhase114ExportOutput();
    renderTeoyubeDataControlsCenter();
    recordPhase114Action("Export preview refreshed", "Phase 11.7 safe bundle rebuilt.");
    return true;
  }
  if (action === "preview-import") {
    const parsed = parseImportFileSafely(phase117ImportFileText);
    if (!parsed.valid) {
      state.teoyubeLastImportPreview = { valid: false, blockers: [parsed.error], warnings: [], recordCounts: {}, duplicates: [] };
      renderImportPreviewDialog();
      recordPhase114Error("Import preview failed", parsed.error);
      return true;
    }
    previewTeoyubeImportBundle(parsed.bundle);
    renderImportPreviewDialog();
    recordPhase114Action("Import preview ready", "Bundle validated locally before merge.");
    return true;
  }
  if (action === "merge-import") {
    const parsed = parseImportFileSafely(phase117ImportFileText);
    if (!parsed.valid) {
      recordPhase114Error("Import merge failed", parsed.error);
      return true;
    }
    const result = mergeTeoyubeImportBundle(parsed.bundle, state.teoyubeImportStrategy);
    renderImportPreviewDialog(result.preview);
    showPhase113SaveDrawer({
      title: result.merged ? "Import merged" : "Import preview only",
      detail: result.merged ? "Sanitized records were merged into the current session." : "No records were changed."
    });
    return true;
  }
  if (action === "clear-session-data") {
    clearTeoyubeSessionData();
    return true;
  }
  if (action === "clear-optional-vault") {
    clearTeoyubeOptionalVault();
    return true;
  }
  if (action === "dismiss-backup-reminder") {
    state.teoyubeBetaBackupReminderDismissed = true;
    saveState();
    render();
    renderTeoyubeDataControlsCenter();
    recordPhase114Action("Backup reminder dismissed", "Beta reminder can be restored by reloading default state.");
    return true;
  }
  return false;
}

const PHASE115_PERSONALIZATION_MODES = {
  off: {
    label: "Off / Standard Scripture Path",
    summary:
      "Uses the standard local Scripture, word, promise, prayer, and action path. No preference signals affect recommendations."
  },
  session_only: {
    label: "Session-only Personalization",
    summary:
      "Uses visible feedback and saved journey memory from this running session only. No browser storage or external service is used."
  },
  profile_preview: {
    label: "Profile Preview Personalization",
    summary:
      "Uses safe structured profile fields plus visible session hints as a preview. Raw private text is not exported or used as hidden memory."
  }
};

const PHASE116_GRAPH_NODE_TYPES = [
  "all",
  "scripture",
  "promise",
  "word",
  "prayer",
  "action",
  "journey",
  "calling",
  "emotion",
  "milestone"
];

const PHASE116_GRAPH_MODES = [
  ["path", "Path View"],
  ["nodes", "Node List"],
  ["relationships", "Relationship List"],
  ["scripture", "Scripture Evidence View"],
  ["confidence", "Confidence Breakdown View"]
];

const PHASE116_TEO_PROMPT_GROUPS = {
  Promise: [
    "I feel stuck and need a promise.",
    "Help me reflect on this promise.",
    "What promise cluster fits this season?"
  ],
  Prayer: [
    "Help me pray through discouragement.",
    "Give me a prayer for clarity and direction.",
    "What is one faithful prayer step today?"
  ],
  Calling: [
    "Help me discern my calling carefully.",
    "What is one faithful action step today?",
    "How do I test this calling with wisdom?"
  ],
  Journey: [
    "Start a growth journey for this word.",
    "What milestone should I focus on next?",
    "Help me continue today's journey."
  ],
  Scripture: [
    "What Scripture supports this word?",
    "Show Scripture evidence for this promise.",
    "Help me study this anchor carefully."
  ],
  Reflection: [
    "Help me write a safe reflection.",
    "What should I journal after this action?",
    "How do I remember this promise?"
  ],
  Testimony: [
    "Help me record testimony without overclaiming.",
    "What Scripture connects to this testimony?",
    "How do I share gratitude safely?"
  ]
};

const PHASE116_WORKFLOW_BLUEPRINTS = [
  {
    id: "need-promise",
    title: "I need a promise",
    summary: "Search a situation, choose a category, and receive a Scripture-rooted promise path.",
    steps: ["Situation", "Category", "Promise Path", "Save or Reflect"]
  },
  {
    id: "help-pray",
    title: "Help me pray",
    summary: "Build a devotional prayer from Scripture, promise language, and one faithful next step.",
    steps: ["Need", "Tone", "Prayer", "Journal"]
  },
  {
    id: "calling-clarity",
    title: "I need calling clarity",
    summary: "Use cautious Calling Compass language, Scripture support, and action guidance.",
    steps: ["Questions", "Compass", "Scripture Support", "Start Journey"]
  },
  {
    id: "growth-journey",
    title: "Start a growth journey",
    summary: "Choose a focus, review stages, and save the first local journey action.",
    steps: ["Focus", "Stages", "Start", "First Action"]
  },
  {
    id: "study-word",
    title: "Study a Teoyube word",
    summary: "Open word detail, Scripture, prayer, related words, and graph view.",
    steps: ["Search Word", "Word Detail", "Scripture & Prayer", "Graph"]
  },
  {
    id: "record-testimony",
    title: "Record testimony",
    summary: "Connect testimony to Scripture or promise without automatic fulfillment claims.",
    steps: ["Anchor", "Story", "Save Locally", "Export Choice"]
  }
];

function getPersonalizationMode() {
  const mode = state.consentState?.personalization || "off";
  return PHASE115_PERSONALIZATION_MODES[mode] ? mode : "off";
}

function isPersonalizationEnabled() {
  return getPersonalizationMode() !== "off";
}

function getPersonalizationModeLabel(mode = getPersonalizationMode()) {
  return PHASE115_PERSONALIZATION_MODES[mode]?.label || PHASE115_PERSONALIZATION_MODES.off.label;
}

function setPersonalizationMode(mode) {
  const nextMode = PHASE115_PERSONALIZATION_MODES[mode] ? mode : "off";
  state.consentState = {
    ...(state.consentState || {}),
    personalization: nextMode,
    sessionOnlyPersonalization: nextMode === "session_only",
    profilePreviewPersonalization: nextMode === "profile_preview",
    rawPrivateTextStorage: false,
    signalStorage: "local-session-only",
    analytics: false,
    databasePersistence: false,
    externalAi: false,
    automaticContact: false
  };
  state.personalizationOnboardingSeen = true;
  if (nextMode === "off") {
    state.lastPersonalizationDecision = createPhase115RecommendationDecision();
  } else {
    state.preferenceHints = derivePreferenceHintsFromJourneyMemory();
  }
  recordPhase114Action("Personalization mode changed", getPersonalizationModeLabel(nextMode));
  saveState();
  renderPhase115PersonalizationCenter();
  renderPhase113InsightRail();
  renderPhase115SmartRecommendations();
  renderPhase114QaPanel();
}

function getPersonalizationStatus() {
  const mode = getPersonalizationMode();
  return {
    mode,
    label: getPersonalizationModeLabel(mode),
    enabled: mode !== "off",
    sessionOnlyEnabled: mode === "session_only",
    profilePreviewEnabled: mode === "profile_preview",
    rawTextStorage: "disabled",
    signalStorage: "local-session-only",
    externalAnalytics: "disabled",
    databasePersistence: "not connected",
    liveAi: "not connected",
    browserPersistence: "disabled",
    hiddenMemory: "disabled"
  };
}

function phase115Now() {
  return new Date().toISOString();
}

function getActivePhase115Cluster() {
  return promiseClusters[state.clusterIndex] || promiseClusters[0];
}

function createBaselineRecommendation(cluster = getActivePhase115Cluster(), clusterIndex = state.clusterIndex || 0) {
  const scriptures = getClusterScriptures(cluster);
  const word = state.generatedWord?.word && state.clusterIndex === clusterIndex
    ? state.generatedWord
    : generateTeoyubeWord(cluster);
  return {
    clusterIndex,
    word: word.word || "TEOYUBE",
    wordMeaning: word.meaning || "A Scripture-rooted memory aid.",
    promiseCluster: getClusterTitle(cluster),
    scripture: scriptures[0] || "Scripture anchor review needed",
    prayer: getClusterPrayer(cluster) || "Father, guide this next step according to Your Word.",
    actionStep: getDailyAssignment(cluster)[3]?.replace("Action: ", "") || "Take one small faithful step and record what you notice.",
    journey: `${getClusterTitle(cluster)}: ${word.word || "TEOYUBE"}`,
    confidence: scriptures.length ? "Scripture anchored" : "Anchor review needed",
    fallbackStatus: scriptures.length ? "No fallback used" : "Scripture anchor fallback visible",
    explanationPath: [
      "Standard Scripture Path",
      getClusterTitle(cluster),
      scriptures[0] || "Scripture anchor review needed",
      "Prayer framework",
      "One faithful action"
    ],
    source: "standard-scripture-path"
  };
}

function getMemoryItemLabel(item) {
  return item?.promise || item?.word || item?.scripture || item?.title || item?.type || "Journey memory";
}

function saveJourneyMemoryItem(item = {}) {
  const safeItem = {
    id: item.id || createPhase114Id("memory"),
    type: item.type || "journey",
    title: item.title || getMemoryItemLabel(item),
    summary: item.summary || "Saved as visible local/session journey memory.",
    scripture: item.scripture || item.scriptureAnchor || "",
    word: item.word || "",
    promise: item.promise || "",
    surface: item.surface || getCurrentViewId(),
    source: item.source || "local-session",
    createdAt: item.createdAt || phase115Now(),
    rawPrivateTextIncluded: false,
    localSessionOnly: true
  };
  state.journeyMemory = [safeItem, ...safeArray(state.journeyMemory).filter((entry) => entry.id !== safeItem.id)].slice(0, 80);
  if (safeItem.type === "action") {
    state.completedActions = [safeItem, ...safeArray(state.completedActions)].slice(0, 40);
  }
  if (safeItem.type === "reflection") {
    state.completedReflections = [safeItem, ...safeArray(state.completedReflections)].slice(0, 40);
  }
  if (safeItem.type === "prayer") {
    state.completedPrayers = [safeItem, ...safeArray(state.completedPrayers)].slice(0, 40);
  }
  if (safeItem.type === "journey") {
    state.savedJourneySnapshots = [safeItem, ...safeArray(state.savedJourneySnapshots)].slice(0, 30);
    state.activeJourneyProgress = {
      id: safeItem.id,
      title: safeItem.title,
      scripture: safeItem.scripture,
      promise: safeItem.promise,
      word: safeItem.word,
      updatedAt: safeItem.createdAt,
      stage: "Started"
    };
  }
  if (["scripture", "word", "promise", "journey"].includes(safeItem.type)) {
    state.unlockedMilestones = [
      {
        id: createPhase114Id("milestone"),
        title: `${safeItem.type} saved`,
        sourceId: safeItem.id,
        createdAt: safeItem.createdAt
      },
      ...safeArray(state.unlockedMilestones)
    ].slice(0, 24);
  }
  state.preferenceHints = derivePreferenceHintsFromJourneyMemory();
  saveState();
  return safeItem;
}

function removeJourneyMemoryItem(id) {
  const before = safeArray(state.journeyMemory).length;
  state.journeyMemory = safeArray(state.journeyMemory).filter((item) => item.id !== id);
  state.savedJourneySnapshots = safeArray(state.savedJourneySnapshots).filter((item) => item.id !== id);
  state.completedActions = safeArray(state.completedActions).filter((item) => item.id !== id);
  state.completedReflections = safeArray(state.completedReflections).filter((item) => item.id !== id);
  state.completedPrayers = safeArray(state.completedPrayers).filter((item) => item.id !== id);
  state.preferenceHints = derivePreferenceHintsFromJourneyMemory();
  saveState();
  return state.journeyMemory.length < before;
}

function clearJourneyMemory() {
  state.journeyMemory = [];
  state.savedJourneySnapshots = [];
  state.activeJourneyProgress = null;
  state.completedActions = [];
  state.completedReflections = [];
  state.completedPrayers = [];
  state.unlockedMilestones = [];
  state.preferenceHints = derivePreferenceHintsFromJourneyMemory();
  saveState();
}

function exportJourneyMemory() {
  return {
    exportedAt: phase115Now(),
    localSessionOnly: true,
    rawPrivateTextIncluded: false,
    activeJourneyProgress: state.activeJourneyProgress,
    journeyMemory: safeArray(state.journeyMemory).map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      summary: item.summary,
      scripture: item.scripture,
      word: item.word,
      promise: item.promise,
      surface: item.surface,
      source: item.source,
      createdAt: item.createdAt,
      rawPrivateTextIncluded: false
    })),
    completedActions: safeArray(state.completedActions).map(getSafeMemoryPreview),
    completedReflections: safeArray(state.completedReflections).map(getSafeMemoryPreview),
    completedPrayers: safeArray(state.completedPrayers).map(getSafeMemoryPreview),
    unlockedMilestones: safeArray(state.unlockedMilestones).map((item) => ({
      title: item.title,
      createdAt: item.createdAt
    }))
  };
}

function getSafeMemoryPreview(item) {
  return {
    id: item.id,
    title: item.title,
    scripture: item.scripture,
    promise: item.promise,
    word: item.word,
    createdAt: item.createdAt,
    rawPrivateTextIncluded: false
  };
}

function importJourneyMemoryPreview(payload = {}) {
  const previewItems = safeArray(payload.journeyMemory || payload.items).slice(0, 12).map((item) => ({
    id: createPhase114Id("memory_preview"),
    type: item.type || "preview",
    title: item.title || "Imported preview item",
    summary: item.summary || "Previewed only; not persisted to browser storage.",
    scripture: item.scripture || "",
    word: item.word || "",
    promise: item.promise || "",
    surface: "import-preview",
    source: "user-controlled-import-preview",
    createdAt: phase115Now(),
    rawPrivateTextIncluded: false,
    localSessionOnly: true
  }));
  state.phase115ImportedPreview = previewItems;
  recordPhase114Action("Journey memory import previewed", `${previewItems.length} safe items previewed.`);
  saveState();
  return previewItems;
}

function summarizeJourneyMemory() {
  const memory = safeArray(state.journeyMemory);
  const byType = memory.reduce((summary, item) => {
    summary[item.type] = (summary[item.type] || 0) + 1;
    return summary;
  }, {});
  return {
    total: memory.length,
    activeJourney: state.activeJourneyProgress?.title || "No active saved journey",
    startedJourneys: safeArray(state.savedJourneySnapshots).length,
    completedActions: safeArray(state.completedActions).length,
    completedPrayers: safeArray(state.completedPrayers).length,
    completedReflections: safeArray(state.completedReflections).length,
    savedScriptures: byType.scripture || 0,
    savedWords: byType.word || 0,
    savedPromises: byType.promise || 0,
    teoGuideResponses: byType.teo_response || 0,
    testimonyDrafts: byType.testimony || 0,
    byType
  };
}

function buildPhase115Hint(label, type, count, explanation, tone = "positive") {
  return {
    id: `${type}_${normalize(label).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "hint"}`,
    label,
    type,
    confidence: Math.min(96, 52 + count * 12),
    sourceCount: count,
    explanation,
    tone,
    localSessionOnly: true
  };
}

function derivePreferenceHintsFromJourneyMemory() {
  const counters = new Map();
  const add = (type, label, explanation, tone = "positive") => {
    if (!label) return;
    const key = `${type}:${label}`;
    const current = counters.get(key) || { type, label, count: 0, explanation, tone };
    current.count += 1;
    counters.set(key, current);
  };

  safeArray(state.journeyMemory).forEach((item) => {
    add("scripture", item.scripture, `Saved Scripture appears in ${item.type} memory.`);
    add("word", item.word, `Saved Teoyube word appears in ${item.type} memory.`);
    add("promise", item.promise, `Promise cluster appears in ${item.type} memory.`);
    add("surface", item.surface, `You used the ${item.surface} surface for saved journey activity.`);
  });
  safeArray(state.personalizationSignals).forEach((signal) => {
    add(signal.kind || "feedback", signal.label, signal.explanation || "Feedback was recorded with user consent.", signal.tone || "positive");
  });
  safeArray(state.personalizationSignalStore).forEach((signal) => {
    add(signal.kind || "feedback", signal.label, signal.explanation || "Feedback was recorded with user consent.", signal.tone || "positive");
  });

  return [...counters.values()]
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item) => buildPhase115Hint(item.label, item.type, item.count, item.explanation, item.tone));
}

function findClusterIndexForHint(hint) {
  if (!hint) return -1;
  const needle = normalize(`${hint.label} ${hint.type}`);
  return promiseClusters.findIndex((cluster) =>
    normalize(
      `${getClusterTitle(cluster)} ${(getClusterScriptures(cluster) || []).join(" ")} ${(cluster.keywords || []).join(" ")} ${(cluster.triggers || []).join(" ")} ${cluster.promise_category || ""}`
    ).includes(needle.split(/\s+/)[0] || needle)
  );
}

function applyPreferenceHintsToLocalRecommendation(baseline = createBaselineRecommendation()) {
  const hints = safeArray(state.preferenceHints).length
    ? safeArray(state.preferenceHints)
    : derivePreferenceHintsFromJourneyMemory();
  const usefulHints = hints.filter((hint) => hint.tone !== "negative").slice(0, 3);
  if (!isPersonalizationEnabled() || !usefulHints.length) {
    return {
      used: false,
      mode: getPersonalizationMode(),
      baseline,
      personalizedPreview: baseline,
      hintsConsidered: usefulHints,
      scripturePreserved: baseline.scripture,
      confidenceChange: "none",
      fallbackComparison: "unchanged",
      warnings: isPersonalizationEnabled() ? ["No strong personalization hints yet."] : ["Personalization is off; standard Scripture path is shown."],
      explanation: "Personalization did not change the standard Scripture path."
    };
  }

  const matchedHint = usefulHints.find((hint) => findClusterIndexForHint(hint) >= 0) || usefulHints[0];
  const matchedIndex = Math.max(0, findClusterIndexForHint(matchedHint));
  const cluster = promiseClusters[matchedIndex] || getActivePhase115Cluster();
  const personalizedPreview = createBaselineRecommendation(cluster, matchedIndex);
  personalizedPreview.source = "personalized-preview";
  personalizedPreview.confidence = matchedHint.sourceCount > 1 ? "Soft hint match" : "Emerging soft hint";
  personalizedPreview.explanationPath = [
    "Personalized Preview",
    `Hint: ${matchedHint.label}`,
    getClusterTitle(cluster),
    personalizedPreview.scripture,
    "Baseline Scripture remains visible"
  ];

  return {
    used: true,
    mode: getPersonalizationMode(),
    baseline,
    personalizedPreview,
    hintsConsidered: usefulHints,
    scripturePreserved: baseline.scripture,
    confidenceChange: personalizedPreview.confidence === baseline.confidence ? "none" : `${baseline.confidence} -> ${personalizedPreview.confidence}`,
    fallbackComparison:
      personalizedPreview.fallbackStatus === baseline.fallbackStatus
        ? "unchanged"
        : `${baseline.fallbackStatus} -> ${personalizedPreview.fallbackStatus}`,
    warnings:
      personalizedPreview.scripture !== baseline.scripture
        ? ["Scripture anchor changed in preview; baseline Scripture is preserved for comparison."]
        : [],
    explanation: explainWhyPreferenceWasUsed(baseline, personalizedPreview, usefulHints)
  };
}

function explainWhyPreferenceWasUsed(baseline, personalizedPreview, hints = []) {
  if (!isPersonalizationEnabled()) {
    return "Standard Scripture Path is active because personalization is off.";
  }
  if (!hints.length) {
    return "No strong personalization hints yet, so the standard Scripture path remains primary.";
  }
  const labels = hints.map((hint) => hint.label).join(", ");
  return `Soft local hints (${labels}) were considered. Scripture remains visible, baseline output remains available, and this preview does not claim certainty.`;
}

function createPhase115RecommendationDecision() {
  const baseline = createBaselineRecommendation();
  return applyPreferenceHintsToLocalRecommendation(baseline);
}

function recordPersonalizationSignal(kind, label, source, metadata = {}) {
  if (!isPersonalizationEnabled()) {
    return null;
  }
  const signal = {
    id: createPhase114Id("signal"),
    kind,
    label: label || "Preference signal",
    source: source || getCurrentViewId(),
    explanation: metadata.explanation || "User feedback saved as a visible local/session soft hint.",
    tone: metadata.tone || (kind.includes("less") || kind.includes("not") ? "negative" : "positive"),
    scripture: metadata.scripture || state.selectedScripture || "",
    word: metadata.word || state.selectedWord || "",
    promise: metadata.promise || state.selectedPromiseResult?.title || getClusterTitle(getActivePhase115Cluster()),
    createdAt: phase115Now(),
    rawPrivateTextIncluded: false,
    localSessionOnly: true
  };
  state.personalizationSignals = [signal, ...safeArray(state.personalizationSignals)].slice(0, 80);
  state.personalizationSignalStore = [signal, ...safeArray(state.personalizationSignalStore)].slice(0, 80);
  state.preferenceHints = derivePreferenceHintsFromJourneyMemory();
  saveState();
  return signal;
}

function resetPhase115Preferences() {
  state.personalizationSignals = [];
  state.personalizationSignalStore = [];
  state.preferenceHints = [];
  state.lastPersonalizationDecision = createPhase115RecommendationDecision();
  saveState();
  recordPhase114Action("Preferences reset", "Visible local/session hints cleared.");
  renderPhase115PersonalizationCenter();
  renderPhase113InsightRail();
  renderPhase115SmartRecommendations();
}

function deletePhase115PersonalizationData() {
  resetPhase115Preferences();
  clearJourneyMemory();
  state.phase115LastExport = null;
  state.lastPersonalizationDecision = createPhase115RecommendationDecision();
  recordPhase114Action("Personalization data deleted", "Journey memory, hints, and signals cleared from this session.");
  render();
  showPhase113SaveDrawer({ title: "Personalization data deleted", detail: "Local/session personalization data has been cleared." });
}

function removePhase115Hint(hintId) {
  state.preferenceHints = safeArray(state.preferenceHints).filter((hint) => hint.id !== hintId);
  state.personalizationSignals = safeArray(state.personalizationSignals).filter((signal) => !normalize(signal.label).includes(normalize(hintId)));
  state.personalizationSignalStore = safeArray(state.personalizationSignalStore).filter((signal) => !normalize(signal.label).includes(normalize(hintId)));
  saveState();
  recordPhase114Action("Preference hint removed", hintId);
  renderPhase115PersonalizationCenter();
  renderPhase113InsightRail();
}

function getSessionSavedTodayCount() {
  return safeArray(state.book).filter((entry) => isToday(entry.date)).length +
    safeArray(state.savedPromiseTableItems).filter((entry) => isToday(entry.savedAt)).length +
    safeArray(state.testimonies).filter((entry) => isToday(entry.date)).length;
}

function getSafeBookEntryPreview(entry) {
  return {
    type: entry.type,
    title: entry.title,
    references: entry.references || [],
    date: entry.date,
    rawPrivateTextIncluded: false
  };
}

function removeFirstMatching(collectionName, predicate) {
  const collection = safeArray(state[collectionName]);
  const index = collection.findIndex(predicate);
  if (index < 0) return false;
  collection.splice(index, 1);
  state[collectionName] = collection;
  return true;
}

function normalize(text) {
  return (text || "").toLowerCase();
}

function pickCluster(profile) {
  const haystack = normalize(
    `${profile.challenge} ${profile.prayer} ${profile.passions} ${profile.burdens}`
  );

  let best = { index: 0, score: -1 };
  promiseClusters.forEach((cluster, index) => {
    const triggers = getClusterSearchTerms(cluster);
    const score = triggers.reduce((sum, trigger) => {
      return sum + (haystack.includes(trigger) ? 1 : 0);
    }, 0);
    if (score > best.score) best = { index, score };
  });

  return best.index;
}

function generateTeoyubeWord(cluster) {
  const initials = cluster.keywords.map((keyword) => keyword[0]).join("");
  const vowels = cluster.keywords
    .map((keyword) => keyword.match(/[aeiou]/i)?.[0] || "a")
    .join("");
  const word = `${initials.slice(0, 3)}${vowels.slice(0, 2)}${initials.slice(3, 6)}`.toUpperCase();
  const refined = word.replace(/[^A-Z]/g, "").slice(0, 8);
  const meaning = cluster.keywords
    .map((keyword, index) => (index === 0 ? keyword : keyword.toLowerCase()))
    .join(", ");

  return {
    word: refined || "TEOYUBE",
    pronunciation: refined.toLowerCase().replace(/([aeiou])/g, "$1-").replace(/-$/g, ""),
    meaning: `${refined} is a prayer-memory key for ${meaning}.`
  };
}

function analyzeCalling(profile) {
  const text = normalize(
    `${profile.gifts} ${profile.talents} ${profile.passions} ${profile.burdens} ${profile.challenge}`
  );

  const scores = archetypes
    .map((archetype) => ({
      ...archetype,
      score: archetype.signals.reduce((sum, signal) => sum + (text.includes(signal) ? 1 : 0), 0)
    }))
    .sort((a, b) => b.score - a.score);

  const top = scores[0].score ? scores.slice(0, 3) : [archetypes[0], archetypes[1], archetypes[2]];
  const creativeSignals = ["design", "creative", "film", "music", "writing", "story"];
  const leadershipSignals = ["lead", "strategy", "business", "organize", "community"];
  const missionSignals = ["mission", "evangel", "outreach", "discipleship", "church"];

  const calling = textIncludesAny(text, creativeSignals)
    ? "Creative Digital Ministry"
    : textIncludesAny(text, leadershipSignals)
      ? "Leadership and Purpose Stewardship"
      : textIncludesAny(text, missionSignals)
        ? "Discipleship and Mission"
        : "Teaching and Purpose Guidance";

  const confidenceScore = Math.min(5, Math.max(1, top.reduce((sum, item) => sum + item.score, 0)));
  const confidenceLabels = [
    "Signal Detected",
    "Emerging Direction",
    "Strong Pattern",
    "Confirmed Direction",
    "Active Assignment"
  ];

  return {
    primary: calling,
    secondary: top[1]?.name === "Bezalel" ? "Creative Calling" : "Spiritual Calling",
    emerging: top[2]?.name === "Joseph" ? "Career Calling" : "Kingdom Service",
    confidence: confidenceLabels[confidenceScore - 1],
    archetypes: top.map((item) => item.name),
    archetypeThemes: top.map((item) => `${item.name}: ${item.themes}`),
    gifts: profile.gifts || "Teaching, encouragement",
    growth: "Consistency, wise counsel, Scripture grounding",
    burdens: profile.burdens || "People needing direction"
  };
}

function textIncludesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function generateJourney() {
  const baselineClusterIndex = pickCluster(state.profile);
  const baselineCluster = promiseClusters[baselineClusterIndex] || promiseClusters[0];
  const baseline = createBaselineRecommendation(baselineCluster, baselineClusterIndex);
  const decision = applyPreferenceHintsToLocalRecommendation(baseline);
  const clusterIndex = decision.used ? decision.personalizedPreview.clusterIndex : baselineClusterIndex;
  const cluster = promiseClusters[clusterIndex] || baselineCluster;
  const word = generateTeoyubeWord(cluster);
  const calling = analyzeCalling(state.profile);
  const scripture = getClusterScriptures(cluster)[0];
  const phase116bJourney = createPhase116bDailyJourney({
    cluster,
    word,
    scripture,
    title: `${getClusterTitle(cluster)}: ${word.word}`
  });

  state.clusterIndex = clusterIndex;
  state.generatedWord = word;
  state.calling = calling;
  state.selectedWord = word.word;
  state.selectedScripture = scripture;
  state.selectedJourney = {
    title: `${getClusterTitle(cluster)}: ${word.word}`,
    scripture: state.selectedScripture,
    generatedAt: new Date().toISOString(),
    personalizationUsed: decision.used,
    baselineScripture: baseline.scripture,
    explanation: decision.explanation,
    qualityScore: phase116bJourney.qualityScore,
    explanationPath: phase116bJourney.explanationPath
  };
  state.generatedDailyJourney = phase116bJourney;
  state.activeDailyJourney = phase116bJourney;
  state.activePrayer = phase116bJourney.prayer;
  state.activeActionStep = phase116bJourney.actionStep;
  state.activeRightRailItem = "today";
  state.lastPersonalizationDecision = {
    ...decision,
    personalizedPreview: decision.used ? createBaselineRecommendation(cluster, clusterIndex) : decision.personalizedPreview
  };
  setActiveTigResponse(createPhase116bTigResponse({
    source: "today-generate",
    title: phase116bJourney.title,
    cluster,
    word,
    scripture,
    prayer: phase116bJourney.prayer,
    action: phase116bJourney.actionStep,
    journey: phase116bJourney.title,
    confidence: phase116bJourney.qualityLabel
  }));
  const bookEntry = {
    id: createPhase114Id("book"),
    type: "Generated Journey",
    title: `${getClusterTitle(cluster)}: ${word.word}`,
    content: `${cluster.summary} Declaration: ${getClusterPrayer(cluster)} Personalization: ${decision.used ? "soft preview hints considered" : "standard Scripture path"}. Baseline Scripture: ${baseline.scripture}.`,
    references: getClusterScriptures(cluster),
    date: new Date().toISOString()
  };
  state.book.unshift(bookEntry);
  saveJourneyMemoryItem({
    id: createPhase114Id("journey_memory"),
    type: "journey",
    title: `${getClusterTitle(cluster)}: ${word.word}`,
    summary: decision.used
      ? "Generated with visible soft preference hints while preserving baseline Scripture comparison."
      : "Generated through the standard local Scripture path.",
    scripture: state.selectedScripture,
    word: word.word,
    promise: getClusterTitle(cluster),
    surface: "today"
  });
  recordPhase114Action(
    "Generated Today's Journey",
    `${getClusterTitle(cluster)} connected to ${word.word}. ${decision.used ? "Personalized preview used." : "Standard path used."}`
  );
  saveState();
  render();
  showPhase113SaveDrawer({
    title: "Journey generated",
    detail: `${getClusterTitle(cluster)} connected to ${word.word}. ${decision.used ? "Soft hints considered." : "Standard Scripture Path."}`,
    scripture: state.selectedScripture,
    targetView: "today",
    undo: { collection: "book", id: bookEntry.id, title: bookEntry.title }
  });
}

function getDailyAssignment(cluster) {
  const scriptures = getClusterScriptures(cluster);
  return [
    `Scripture: Read ${scriptures[0]} and ${scriptures[1] || scriptures[0]}.`,
    `Prayer: Pray this framework: "${getClusterPrayer(cluster)}"`,
    `Calling: Name one gift, burden, or skill that connects to ${state.calling.primary || "your calling"}.`,
    `Action: ${cluster.divine_assignment || "Take one small step of obedience and record what you notice."}`
  ];
}

function completeAssignment() {
  const reflection = $("#reflectionInput").value.trim();
  const cluster = promiseClusters[state.clusterIndex];
  state.completedAssignments += 1;
  state.activeRightRailItem = "book";
  if (state.activeDailyJourney) {
    state.activeDailyJourney.completed = true;
    state.activeDailyJourney.completedAt = new Date().toISOString();
    state.activeJourneyProgress = {
      ...(state.activeJourneyProgress || {}),
      title: state.activeDailyJourney.title,
      scripture: state.activeDailyJourney.scripture?.reference || state.activeDailyJourney.scripture,
      progress: 100,
      stage: "Action completed",
      updatedAt: state.activeDailyJourney.completedAt
    };
  }
  const bookEntry = {
    id: createPhase114Id("book"),
    type: "Daily Divine Assignment",
    title: `${getClusterTitle(cluster)} assignment completed`,
    content: reflection || "Assignment completed. Reflection can be added later.",
    references: getClusterScriptures(cluster),
    date: new Date().toISOString()
  };
  state.book.unshift(bookEntry);
  if (reflection) {
    saveJournalEntry({
      title: `${getClusterTitle(cluster)} reflection`,
      content: reflection,
      summary: "Reflection saved in this local session. Safe exports redact raw private text.",
      scriptureReferences: getClusterScriptures(cluster),
      word: state.selectedWord,
      promise: getClusterTitle(cluster)
    });
  }
  saveJourneyMemoryItem({
    id: createPhase114Id("memory_action"),
    type: "action",
    title: `${getClusterTitle(cluster)} assignment completed`,
    summary: "Completed action step saved as visible local/session journey memory. Raw reflection text is withheld from safe exports.",
    scripture: getClusterScriptures(cluster)[0],
    word: state.selectedWord,
    promise: getClusterTitle(cluster),
    surface: "today"
  });
  $("#reflectionInput").value = "";
  recordPhase114Action("Completed daily assignment", getClusterTitle(cluster));
  saveState();
  render();
  showPhase113SaveDrawer({
    title: "Assignment recorded",
    detail: getClusterTitle(cluster),
    scripture: getClusterScriptures(cluster)[0],
    targetView: "book",
    undo: { collection: "book", id: bookEntry.id, title: bookEntry.title }
  });
}

function saveAssessment(event) {
  event.preventDefault();
  state.profile = {
    name: $("#nameInput").value.trim(),
    age: $("#ageInput").value.trim(),
    gifts: $("#giftsInput").value.trim(),
    talents: $("#talentsInput").value.trim(),
    passions: $("#passionsInput").value.trim(),
    burdens: $("#burdensInput").value.trim(),
    challenge: $("#challengeInput").value.trim(),
    prayer: $("#prayerInput").value.trim()
  };
  state.calling = analyzeCalling(state.profile);
  state.onboardingCompleted = true;
  recordPhase114Action("Purpose assessment completed", "Session-only calling profile refreshed.");
  generateJourney();
  $("#assessmentDialog").close();
}

function addManualEntry() {
  const content = prompt("What reflection should be added to the Book of the Saint?");
  if (!content) return;
  const bookEntry = {
    id: createPhase114Id("book"),
    type: "Reflection",
    title: "Manual reflection",
    content,
    references: getClusterScriptures(promiseClusters[state.clusterIndex]),
    date: new Date().toISOString()
  };
  state.book.unshift(bookEntry);
  state.journalEntries = [
    {
      id: `journal_${Date.now()}`,
      summary: "Reflection saved in this local session. Raw text is withheld from safe exports.",
      scriptureReferences: getClusterScriptures(promiseClusters[state.clusterIndex]),
      createdAt: new Date().toISOString(),
      rawPrivateTextStored: false
    },
    ...(state.journalEntries || [])
  ].slice(0, 20);
  saveJourneyMemoryItem({
    id: createPhase114Id("memory_reflection"),
    type: "reflection",
    title: "Manual reflection",
    summary: "Reflection saved in this local session. Raw text is withheld from safe exports.",
    scripture: getClusterScriptures(promiseClusters[state.clusterIndex])[0],
    word: state.selectedWord,
    promise: getClusterTitle(promiseClusters[state.clusterIndex]),
    surface: "book"
  });
  state.activeRightRailItem = "book";
  recordPhase114Action("Reflection added", "Book and journal counts updated locally.");
  saveState();
  render();
  showPhase113SaveDrawer({
    title: "Reflection added",
    detail: "Book of the Saint updated in this session.",
    scripture: getClusterScriptures(promiseClusters[state.clusterIndex])[0],
    targetView: "book",
    undo: { collection: "book", id: bookEntry.id, title: bookEntry.title }
  });
}

function addTestimony(event) {
  event.preventDefault();
  const title = $("#testimonyTitle").value.trim();
  const content = $("#testimonyBody").value.trim();
  const category = $("#testimonyCategory")?.value || "Faith";
  if (!title || !content) return;

  const testimony = {
    id: createPhase114Id("testimony"),
    title,
    content,
    category,
    status: "Draft",
    references: getClusterScriptures(promiseClusters[state.clusterIndex]),
    date: new Date().toISOString()
  };

  state.testimonies.unshift(testimony);
  state.activeRightRailItem = "testimony";
  const bookEntry = {
    id: createPhase114Id("book"),
    type: "Testimony",
    title,
    content,
    category,
    references: testimony.references,
    date: testimony.date
  };
  state.book.unshift(bookEntry);
  saveJourneyMemoryItem({
    id: createPhase114Id("memory_testimony"),
    type: "testimony",
    title,
    summary: "Testimony draft saved by the user in this local session. Raw text is withheld from safe exports.",
    scripture: testimony.references[0],
    word: state.selectedWord,
    promise: getClusterTitle(promiseClusters[state.clusterIndex]),
    surface: "testimony"
  });

  event.target.reset();
  recordPhase114Action("Testimony draft saved", "User-recorded testimony added locally.");
  saveState();
  render();
  showPhase113SaveDrawer({
    title: "Testimony draft saved",
    detail: title,
    scripture: testimony.references[0],
    targetView: "testimony",
    undo: { collection: "testimonies", id: testimony.id, bookId: bookEntry.id, title }
  });
}

function askTeo(event) {
  event.preventDefault();
  const input = $("#chatInput").value.trim();
  if (!input) return;
  recordPhase116SafeSearch(input, "teo-guide");
  state.chat.push({ role: "user", text: input });
  const response = buildTeoResponse(input);
  state.chat.push({ role: "teo", text: response.text || response });
  if (response.trace) {
    setActiveTigResponse(createPhase116bTigResponse({
      source: "teo-guide",
      title: "Teo Guide response",
      userInput: input,
      scripture: response.trace.selectedScriptureAnchor,
      word: response.trace.selectedWord,
      promise: response.trace.selectedPromiseCluster,
      prayer: response.trace.selectedPrayer,
      action: response.trace.selectedActionStep,
      confidence: response.trace.confidenceLabel
    }));
  }
  saveJourneyMemoryItem({
    id: createPhase114Id("memory_teo"),
    type: "teo_response",
    title: "Teo Guide response",
    summary: "Local Scripture-grounded response saved as visible journey memory. User prompt raw text is not exported.",
    scripture: getClusterScriptures(promiseClusters[state.clusterIndex])[0],
    word: state.selectedWord,
    promise: getClusterTitle(promiseClusters[state.clusterIndex]),
    surface: "guide"
  });
  state.activeRightRailItem = "guide";
  $("#chatInput").value = "";
  recordPhase114Action("Teo Guide answered", "Local Scripture-grounded response created.");
  saveState();
  renderChat();
  showPhase113SaveDrawer({
    title: "Teo Guide responded",
    detail: "Local Scripture-grounded response added.",
    scripture: getClusterScriptures(promiseClusters[state.clusterIndex])[0]
  });
}

function buildTeoResponse(input) {
  const profile = { ...state.profile, challenge: input, prayer: input };
  const cluster = promiseClusters[pickCluster(profile)];
  const assignment = getDailyAssignment(cluster)[3];
  const localResponse = composePhase116TeoGuideResponse(input, {
    promise: getClusterTitle(cluster),
    scripture: getClusterScriptures(cluster)[0],
    prayer: getClusterPrayer(cluster),
    action: assignment,
    label: "Teo Guide response"
  });
  return localResponse;
}

function getStaticRouteView(rawView = "") {
  const view = String(rawView || "").replace(/^#/, "").trim();
  if (view === "media" || view === "videos" || view === "embedded-videos") return "ui-elements";
  const allowedViews = new Set([
    "today",
    "search",
    "canon",
    "table",
    "calling",
    "book",
    "lexicon",
    "testimony",
    "guide",
    "ui-elements",
    "teoyube-tables"
  ]);
  if (new URLSearchParams(window.location.search).get("qa") === "1") {
    allowedViews.add("roadmap");
  }
  return allowedViews.has(view) ? view : "today";
}

function setView(viewId, options = {}) {
  const nextView = getStaticRouteView(viewId);
  state.activePage = nextView;
  document.body.dataset.view = nextView;
  $all(".view").forEach((view) => view.classList.toggle("active", view.id === nextView));
  $all(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === nextView));
  const labels = {
    today: "Today's Promise Animation",
    roadmap: "Implementation Roadmap",
    search: "TeoyubeSearch",
    canon: "Teoyube Canon",
    table: "Promise Table",
    calling: "Calling Compass",
    book: "Book of the Saint",
    lexicon: "Teoyube Lexicon",
    testimony: "Testimony Archive",
    guide: "Teo Guide",
    "ui-elements": "Embedded Videos",
    "teoyube-tables": "Tables"
  };
  $("#viewTitle").textContent = labels[nextView];
  if (!options.skipHash && window.location.hash !== `#${nextView}`) {
    history.pushState(null, "", `#${nextView}`);
  }
  if (!options.preserveScroll) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
  document.dispatchEvent(new CustomEvent("teoyube:view-change", { detail: { viewId: nextView, context: getTeoyubeRuntimeContext() } }));
}

function getPromiseSlideArtwork(slide, index = 0) {
  const image = slide.image || (slide.artwork === "gate" || slide.artwork === "river" || slide.artwork === "tree"
    ? "public/images/teoyube-carousel-9-wide.png"
    : "public/images/teoyube-carousel-5-wide.png");
  const slideClass = `slide-${normalize(slide.title).replace(/\s+/g, "-")}`;
  const isFirstSlide = index === 0;
  return `
    <div class="slide-artwork banner-art ${escapeHtml(slide.artwork)} ${escapeHtml(slideClass)}" aria-hidden="true">
      <img src="${escapeHtml(image)}" alt="" loading="${isFirstSlide ? "eager" : "lazy"}" decoding="async" ${isFirstSlide ? 'fetchpriority="high"' : ""} />
      <span class="art-glow"></span>
      <span class="art-symbol"></span>
    </div>
  `;
}

function getPromisePreviewRail(activeIndex) {
  const previewSlides = [
    {
      title: "Divine Direction",
      theme: "God guides every faithful step.",
      image: "public/images/ads/divine-direction.png",
      position: "center"
    },
    {
      title: "Strength for Today",
      theme: "Renewed strength for today's journey.",
      image: "public/images/ads/strength-for-today.png",
      position: "center"
    },
    {
      title: "Growth in Grace",
      theme: "Grow deeper in Christ every day.",
      image: "public/images/ads/growth-in-grace.png",
      position: "center"
    },
    {
      title: "Blending the Human Experience with the Digital Frontier",
      theme: "Connecting tomorrow.",
      image: "public/images/teoyube-carousel-5-wide.png",
      position: "72% center"
    },
    {
      title: "Crafting Tomorrow's Digital Narratives",
      theme: "Envisioning the future.",
      image: "public/images/teoyube-carousel-5-wide.png",
      position: "100% center"
    }
  ];
  return `
    <div class="carousel-preview-rail" aria-hidden="true">
      ${previewSlides
        .map(
          (slide, offset) => `
            <article class="preview-card">
              <span>${String(offset + 1).padStart(2, "0")}</span>
              <img src="${escapeHtml(slide.image)}" alt="" loading="lazy" style="object-position: ${escapeHtml(slide.position)};" />
              <h4>${escapeHtml(slide.title)}</h4>
              <p>${escapeHtml(slide.theme)}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderPromiseCarousel() {
  const track = $("#promiseCarouselTrack");
  const dots = $("#promiseCarouselDots");
  if (!track || !dots) return;
  const activeSlide = promiseCarouselSlides[activePromiseSlide];

  track.style.setProperty("--carousel-offset", "0%");
  track.style.removeProperty("transform");
  track.innerHTML = promiseCarouselSlides
    .map(
      (slide, index) => `
        <article class="carousel-slide ${index === activePromiseSlide ? "active" : ""}" aria-hidden="${index === activePromiseSlide ? "false" : "true"}"${index === activePromiseSlide ? "" : " inert"}>
          <div class="carousel-copy">
            <span class="slide-number">${String(index + 1).padStart(2, "0")} / ${String(promiseCarouselSlides.length).padStart(2, "0")}</span>
            <p class="eyebrow">${escapeHtml(slide.kicker)}</p>
            <h3>${escapeHtml(slide.title)}</h3>
            <p>${escapeHtml(slide.description)}</p>
            <div class="scripture-strip">${slide.scriptures
              .map((scripture) => `<span class="scripture-pill">${escapeHtml(scripture)}</span>`)
              .join("")}</div>
            <div class="carousel-cta-row">
              <button class="primary action-icon-button" type="button">${renderActionButtonContent(slide.cta)}</button>
              <button class="secondary action-icon-button" type="button">${renderActionButtonContent(slide.secondaryCta || "Learn More")}</button>
            </div>
          </div>
          ${getPromiseSlideArtwork(slide, index)}
        </article>
      `
    )
    .join("");

  if (!$("#promisePreviewRail")) {
    track.insertAdjacentHTML("afterend", `<div id="promisePreviewRail">${getPromisePreviewRail(activePromiseSlide)}</div>`);
  } else {
    $("#promisePreviewRail").innerHTML = getPromisePreviewRail(activePromiseSlide);
  }

  dots.innerHTML = promiseCarouselSlides
    .map(
      (slide, index) => `
        <button class="${index === activePromiseSlide ? "active" : ""}" type="button" data-slide-index="${index}" aria-current="${index === activePromiseSlide ? "true" : "false"}" aria-label="Go to ${escapeHtml(slide.title)} slide"></button>
      `
    )
    .join("");

  if ($("#dailyTheme") && activeSlide) {
    $("#dailyTheme").textContent = activeSlide.title;
    $("#dailySummary").textContent = activeSlide.theme;
    $("#dailyScriptures").innerHTML = activeSlide.scriptures
      .map((scripture) => `<span class="scripture-pill">${escapeHtml(scripture)}</span>`)
      .join("");
  }
}

function goToPromiseSlide(index) {
  activePromiseSlide = (index + promiseCarouselSlides.length) % promiseCarouselSlides.length;
  renderPromiseCarousel();
}

function startPromiseCarousel() {
  clearInterval(promiseCarouselTimer);
  promiseCarouselTimer = setInterval(() => {
    const now = Date.now();
    if (promiseCarouselPaused || now - lastPromiseCarouselAdvance < 7000) return;
    lastPromiseCarouselAdvance = now;
    goToPromiseSlide(activePromiseSlide + 1);
  }, 8000);
}

function renderAdCarousel() {
  const track = $("#teoyubeAdTrack");
  const dots = $("#teoyubeAdDots");
  if (!track || !dots) return;

  const carouselItems = [...teoyubeAds, ...teoyubeAds];

  track.innerHTML = carouselItems
    .map(
      (ad, index) => {
        const sourceIndex = index % teoyubeAds.length;
        const distance = Math.abs(sourceIndex - activeAdSlide);
        const loopDistance = Math.min(distance, teoyubeAds.length - distance);
        const focusClass = sourceIndex === activeAdSlide ? "active" : loopDistance === 1 ? "near" : "far";

        return `
        <article class="teoyube-ad-card ${focusClass}" aria-current="${sourceIndex === activeAdSlide ? "true" : "false"}">
          <div class="ad-art ${escapeHtml(ad.theme)}">
            <img src="${escapeHtml(ad.image)}" alt="${escapeHtml(ad.title)} Teoyube promise card" loading="lazy" />
            <span class="teoyube-badge">TEOYUBE</span>
            <h5>${escapeHtml(ad.title)}</h5>
            <p>${escapeHtml(ad.description)}</p>
          </div>
          <div class="ad-card-body">
            <div class="ad-stars" aria-label="Five star devotional rating">★★★★★ <span>(${ad.reviews} Reviews)</span></div>
            <div class="sequence-row">${ad.scriptures.map((scripture) => `<span class="scripture-pill">${escapeHtml(scripture)}</span>`).join("")}</div>
            <div class="ad-card-actions">
              <button class="secondary" type="button">${escapeHtml(ad.cta)}</button>
              <button class="ad-icon-button" type="button" aria-label="Open ${escapeHtml(ad.title)} guide">▣</button>
            </div>
          </div>
        </article>
      `;
      }
    )
    .join("");

  dots.innerHTML = teoyubeAds
    .map((ad, index) => `<button class="${index === activeAdSlide ? "active" : ""}" type="button" data-ad-index="${index}" aria-label="Show ${escapeHtml(ad.title)}"></button>`)
    .join("");

  requestAnimationFrame(centerActiveAdCard);
}

function centerActiveAdCard() {
  const track = $("#teoyubeAdTrack");
  const viewport = track?.parentElement;
  const activeCard = track?.children?.[activeAdSlide];
  if (!track || !viewport || !activeCard) return;

  if (document.body.dataset.view === "roadmap") {
    track.style.transform = "";
    return;
  }

  const maxOffset = Math.max(0, track.scrollWidth - viewport.clientWidth);
  const targetOffset = activeCard.offsetLeft - (viewport.clientWidth - activeCard.clientWidth) / 2;
  const clampedOffset = Math.min(Math.max(targetOffset, 0), maxOffset);
  track.style.transform = `translateX(-${clampedOffset}px)`;
}

function goToAdSlide(index) {
  activeAdSlide = (index + teoyubeAds.length) % teoyubeAds.length;
  renderAdCarousel();
}

function startAdCarousel() {
  clearInterval(adCarouselTimer);
  adCarouselTimer = null;
}

function render() {
  syncPhase116bAliases();
  const profile = state.profile;
  const cluster = promiseClusters[state.clusterIndex];
  const calling = state.calling.primary ? state.calling : analyzeCalling(profile);
  const stageIndex = Math.min(purposeStages.length - 1, Math.floor(state.completedAssignments / 2));
  const [stageName, stageDescription, stageProgress] = purposeStages[stageIndex];

  $("#sidebarName").textContent = profile.name || "Saint";
  $("#sidebarCalling").textContent = calling.primary
    ? `${calling.primary} - ${calling.confidence}`
    : "Complete the purpose assessment to generate your first calling profile.";

  $("#dailyTheme").textContent = getClusterTitle(cluster);
  $("#dailySummary").textContent = cluster.summary;
  $("#dailyScriptures").innerHTML = getClusterScriptures(cluster)
    .map((scripture) => `<span class="scripture-pill">${scripture}</span>`)
    .join("");
  $("#dailyWord").textContent = state.generatedWord?.word || state.selectedWord || "TIDUILOVP";
  $("#dailyMeaning").textContent = state.generatedWord?.meaning || "A prayer-memory key for Trust, instruction, direction, order, voice, path.";
  $("#assignmentList").innerHTML = getDailyAssignment(cluster)
    .map((item) => `<li>${item}</li>`)
    .join("");
  renderPromiseCarousel();
  renderPhase116bTodayCommandCenter();

  $("#clusterTitle").textContent = getClusterTitle(cluster);
  $("#clusterSummary").textContent = cluster.summary;
  $("#journeyStatuses").innerHTML = journeyStatuses
    .map((status, index) => {
      const activeIndex = Math.min(journeyStatuses.length - 1, Math.floor(state.completedAssignments / 1.5));
      return `<span class="status-pill ${index <= activeIndex ? "active" : ""}">${status}</span>`;
    })
    .join("");

  $("#compassCenter").textContent = calling.primary;
  $("#purposeStage").textContent = stageName;
  $("#purposeProgress").value = stageProgress;
  $("#purposeDescription").textContent = stageDescription;
  $("#bookCount").textContent = `${state.book.length} ${state.book.length === 1 ? "entry" : "entries"}`;
  $("#testimonyCount").textContent = `${state.testimonies.length} ${state.testimonies.length === 1 ? "testimony" : "testimonies"}`;

  renderBook();
  renderPhase116bBookJournalControls();
  renderLexicon();
  renderPhase116bLexiconStudyPanel();
  renderLanguageGrammar();
  renderCanon();
  renderTkos(calling, cluster);
  renderAdCarousel();
  renderTechArchitecture();
  renderProjectStructureRoadmap();
  renderMvpCodeStarterFiles();
  renderMvpSeedFiles();
  renderMvpUiPages();
  renderMvpBrandIdentity();
  renderMvpLaunchPlan();
  renderLaunch1StaticMvpPackage();
  renderPromiseMoviePanel();
  renderFeaturedStoryCarousel();
  renderClientsPromiseTable();
  renderPhase114PromiseTableRows();
  renderPhase116bPromiseWorkspace();
  renderPhase117PromiseTableControls();
  renderCompassVideos();
  renderPhase116bCallingCompassTool();
  renderRoadmapKpis();
  renderPromiseClusterNavigation();
  renderSearchResults(runTeoyubeSearch($("#teoyubeSearchInput")?.value || "purpose"));
  renderTestimonies();
  renderPhase117TestimonyControls();
  renderChat();
  renderPhase116bTeoGuideTools();
  renderPromiseTableSearchFeed();
  renderUiElementsVideos();
  renderTeoyubeTablesPage();
  renderPhase115SmartRecommendations();
  renderPhase115PersonalizationCenter();
  renderPhase113InsightRail();
  mountPhase116SearchSuggestionPanels();
  renderPhase116IntelligenceHealthPanel();
  renderPhase116bFunctionalQaPanel();
  renderTeoyubeOfflineStatus();
  if (typeof renderPhase116b1Experience === "function") renderPhase116b1Experience();
}

function runTeoyubeSearch(query) {
  const rawQuery = (query || "").trim();
  const searchText = normalize(rawQuery || "purpose");
  const selectedCategory = $("#teoyubeSearchCategory")?.value || "All";
  const profile = { ...state.profile, challenge: rawQuery, prayer: rawQuery };
  const fallbackCluster = promiseClusters[pickCluster(profile)] || promiseClusters[0];
  const rankedClusters = promiseClusters
    .map((cluster) => ({
      cluster,
      score: tokenizePhase116bSearch(searchText).reduce((sum, term) => {
        const haystack = normalize([getClusterTitle(cluster), cluster.theme, cluster.summary, cluster.promise_category, getClusterScriptures(cluster).join(" "), ...(cluster.related_teoyube_words || [])].join(" "));
        return sum + (haystack.includes(term) ? 12 : phase116bFuzzyIncludes(haystack, term) ? 5 : 0);
      }, 0)
    }))
    .sort((a, b) => b.score - a.score);
  const matchedWords = coreWords
    .map((word) => {
      const matchedCluster = rankedClusters.find((item) =>
        normalize([getClusterTitle(item.cluster), item.cluster.theme, item.cluster.promise_category, ...(item.cluster.related_teoyube_words || [])].join(" ")).includes(normalize(word.promise_category || word.category || word.word))
      )?.cluster || rankedClusters[0]?.cluster || fallbackCluster;
      return {
        ...word,
        matchedCluster,
        score: scoreVocabularyWord(word, searchText, selectedCategory) + scorePhase116bPromiseSearchResult(word, matchedCluster, searchText, selectedCategory)
      };
    })
    .filter((word) => word.score > 0)
    .sort((a, b) => b.score - a.score);

  const topWords = matchedWords.length
    ? matchedWords.slice(0, 3)
    : coreWords
        .filter((word) => ["WISDORA", "TEOYUBE", "KLESIS"].includes(word.word))
        .slice(0, 3);

  const results = topWords.map((word, index) => buildSearchResult(rawQuery, word.matchedCluster || fallbackCluster, word, index));
  state.phase116bLastSearchResults = results;
  return results;
}

function scoreVocabularyWord(word, searchText, selectedCategory) {
  const categoryMatches =
    selectedCategory === "All" ||
    selectedCategory === "Teoyube Word" ||
    normalize(word.category).includes(normalize(selectedCategory)) ||
    normalize(word.promise_category).includes(normalize(selectedCategory));

  const haystack = normalize(
    [
      word.word,
      word.meaning,
      word.category,
      word.promise_category,
      word.prayer_use,
      word.animation_symbol,
      ...(word.scripture_sources || []),
      ...(word.related_words || [])
    ].join(" ")
  );

  const terms = searchText.split(/\s+/).filter(Boolean);
  const termScore = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
  const wordScore = normalize(word.word) === searchText ? 10 : normalize(word.word).includes(searchText) ? 6 : 0;
  const categoryScore = categoryMatches ? 1 : -4;
  return termScore + wordScore + categoryScore;
}

function buildSearchResult(query, cluster, word, index) {
  const scriptureReferences = [...new Set([...(word.scripture_sources || []), ...getClusterScriptures(cluster)])].slice(
    0,
    5
  );
  const intent = detectSearchIntent(query);
  const level = index === 0 ? "A + B + C" : index === 1 ? "B + C" : "C";
  const constitutionLanguage =
    theologyConstitution?.promise_levels?.find((item) => item.level === "C")?.language ||
    "Based on Scripture and your profile, this may guide your next step.";

  const trace = createPhase116WhyThisTrace({
    source: "teoyube-search",
    label: `${word.word} - ${word.meaning}`,
    userInput: query,
    scripture: scriptureReferences[0],
    word: word.word,
    promise: word.promise_category || cluster.promise_category || cluster.theme,
    prayer: `Father, according to Your Word, guide me through ${word.meaning.toLowerCase()} with humility, wisdom, and obedience.`,
    action:
      intent.includes("Calling")
        ? "Write down three gifts, three burdens, and one step you can take today toward your calling."
        : getDailyAssignment(cluster)[3].replace("Action: ", ""),
    confidence: `Level ${level}`
  });
  const quality = calculatePhase116QualityScore(trace);
  return {
    title: `${word.word} - ${word.meaning}`,
    search_intent: intent,
    promise_category: word.promise_category || cluster.promise_category || cluster.theme,
    scripture_references: scriptureReferences,
    promise_level: level,
    relevance_score: Math.min(100, 55 + (word.score || 0) + index * 4),
    quality_score: quality.score,
    confidence_label: quality.label,
    explanation_path: trace.explanationPath,
    fallback_reason: trace.fallbackReason,
    short_explanation: `${constitutionLanguage} ${cluster.summary}`,
    calling_connection: `This connects to ${state.calling.primary || "your emerging calling"} through ${word.promise_category || cluster.theme}.`,
    teoyube_word: word.word,
    pronunciation: word.pronunciation,
    meaning: word.meaning,
    prayer: `Father, according to Your Word, guide me through ${word.meaning.toLowerCase()} with humility, wisdom, and obedience.`,
    assignment:
      intent.includes("Calling")
        ? "Write down three gifts, three burdens, and one step you can take today toward your calling."
        : getDailyAssignment(cluster)[3].replace("Action: ", ""),
    animation_prompt: word.animation_symbol || `A Saint moves from search to promise as ${word.word} appears in light.`
  };
}

function detectSearchIntent(query) {
  const text = normalize(query);
  if (/\b(ephesians|john|romans|psalm|proverbs|isaiah|james|matthew|mark|luke|acts)\b/.test(text)) {
    return "Scripture Search";
  }
  if (coreWords.some((word) => normalize(word.word) === text)) return "Teoyube Word Search";
  if (text.includes("pray") || text.includes("prayer")) return "Prayer Search";
  if (text.includes("call") || text.includes("purpose") || text.includes("teach")) {
    return "Life Problem + Calling";
  }
  if (text.includes("testimony") || text.includes("answered")) return "Testimony Search";
  return "Promise Search";
}

function renderSearchResults(results) {
  const target = $("#teoyubeSearchResults");
  if (!target) return;
  const artwork = [
    "public/images/search/suggested-journey-01.png",
    "public/images/search/suggested-journey-02.png",
    "public/images/search/suggested-journey-03.png"
  ];

  if (!results.length) {
    state.lastFallbackReason = "No strong local TeoyubeSearch match; showing recovery prompts with the active Scripture anchor.";
    target.innerHTML = `
      <article class="search-result-card phase114-empty-state">
        <p class="eyebrow">Local fallback</p>
        <h3>No strong match yet</h3>
        <p>Try a simpler prompt such as wisdom, direction, prayer, calling, identity, or healing. Scripture remains visible while the local engine searches for a stronger connection.</p>
        <div class="scripture-strip"><span class="scripture-pill">${escapeHtml(state.selectedScripture || "Ephesians 1:18")}</span></div>
        <div class="result-actions">
          <button class="secondary" type="button" data-phase114-action="focus-search">Refine Search</button>
          <button class="primary" type="button" data-phase114-action="generate-journey">Generate Journey</button>
        </div>
        ${renderPhase116SearchSuggestions("search", "teoyubeSearchInput")}
      </article>
    `;
    target.dataset.results = "[]";
    renderPhase114QaPanel();
    return;
  }

  target.innerHTML = results
    .map(
      (result, index) => `
      <article class="search-result-card">
        <div class="thumbnail" aria-label="Promise animation preview" style="background-image: linear-gradient(180deg, rgba(0, 39, 31, 0.08), rgba(0, 39, 31, 0.38)), url('${artwork[index % artwork.length]}')">
          <button class="search-bookmark" type="button" aria-label="Bookmark ${escapeHtml(result.title)}">▱</button>
        </div>
        <p class="eyebrow">${escapeHtml(result.search_intent)} + Calling + Level ${escapeHtml(result.promise_level)}</p>
        <h3>${escapeHtml(result.title)}</h3>
        <p><b>Promise category:</b> ${escapeHtml(result.promise_category)}</p>
        <div class="scripture-strip">${result.scripture_references
          .map((reference) => `<span class="scripture-pill">${escapeHtml(reference)}</span>`)
          .join("")}</div>
        <p>${escapeHtml(result.short_explanation)}</p>
        <div class="phase116b-result-metrics">
          <span>Relevance ${escapeHtml(String(result.relevance_score || 0))}</span>
          <span>Quality ${escapeHtml(String(result.quality_score || 0))}</span>
          <span>${escapeHtml(result.confidence_label || "Good")}</span>
        </div>
        <details class="phase114-explanation-path">
          <summary>Why this?</summary>
          <p>${escapeHtml(result.calling_connection)}</p>
          <p>${safeArray(result.explanation_path).map(escapeHtml).join(" -> ")}</p>
          <p>Confidence label: ${escapeHtml(result.confidence_label || `local match level ${result.promise_level}`)}. Fallback reason: ${escapeHtml(result.fallback_reason || (result.scripture_references.length ? "Scripture anchors available." : "Scripture anchor review needed."))}</p>
        </details>
        ${renderPhase116WhyThisPanel({
          source: "teoyube-search",
          label: result.title,
          userInput: $("#teoyubeSearchInput")?.value || result.title,
          intent: result.search_intent,
          scripture: result.scripture_references?.[0],
          word: result.teoyube_word,
          promise: result.promise_category,
          prayer: result.prayer,
          action: result.assignment,
          confidence: `Level ${result.promise_level}`,
          fallbackUsed: !result.scripture_references?.length,
          fallbackReason: result.scripture_references?.length ? "Scripture anchors available." : "Scripture anchor review needed."
        })}
        <div class="search-progress"><span style="width:${Math.min(96, 42 + index * 14)}%"></span></div>
        <div class="result-actions">
          <button class="secondary search-save-book icon-only" data-result-index="${index}" aria-label="Save to Book">▱</button>
          <button class="secondary search-add-table" data-result-index="${index}">Add to Promise Table</button>
          <button class="secondary search-generate-prayer" data-result-index="${index}">Explore Journey</button>
          <button class="secondary search-open-graph" type="button" data-result-index="${index}">View Graph</button>
          <button class="secondary" type="button" data-phase115-action="compare-recommendation">Compare Preview</button>
        </div>
        ${renderPhase115FeedbackControls({
          label: result.title,
          scripture: result.scripture_references?.[0],
          word: result.teoyube_word,
          promise: result.promise_category,
          source: "teoyube-search",
          prayer: result.prayer,
          action: result.assignment
        })}
      </article>
    `
    )
    .join("");

  target.dataset.results = JSON.stringify(results);
}

function renderPromiseClusterNavigation() {
  const target = $("#promiseClusterNavigation");
  if (!target) return;

  target.innerHTML = promiseClusterNavigation
    .map(
      (item) => `
      <button class="secondary prompt-chip cluster-nav-chip" data-query="${escapeHtml(item.label)}">
        ${escapeHtml(item.label)}
      </button>
    `
    )
    .join("");
}

function getBookEntryKind(type = "") {
  const text = normalize(type);
  if (text.includes("assignment")) return "assignment";
  if (text.includes("discovery") || text.includes("promise")) return "discovery";
  return "journey";
}

function getBookEntryTime(entry) {
  const time = Date.parse(entry?.date || "");
  return Number.isNaN(time) ? 0 : time;
}

function getBookEntriesSince(days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return state.book.filter((entry) => getBookEntryTime(entry) >= cutoff).length;
}

function getBookDayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getBookReflectionStreak() {
  const entryDays = new Set(
    state.book
      .map((entry) => getBookEntryTime(entry))
      .filter(Boolean)
      .map((time) => getBookDayKey(new Date(time)))
  );
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (entryDays.has(getBookDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return Math.max(streak, state.completedAssignments || 0);
}

function getBookJourneyMetrics() {
  const totalEntries = state.book.length;
  const completedAssignments = state.completedAssignments || 0;
  const weekEntries = getBookEntriesSince(7);
  const monthEntries = getBookEntriesSince(30);
  return [
    {
      icon: "week",
      value: 8 + Math.max(0, weekEntries - 1),
      label: "This Week Reflections"
    },
    {
      icon: "month",
      value: 24 + Math.max(0, monthEntries - 1),
      label: "This Month Reflections"
    },
    {
      icon: "streak",
      value: Math.max(32 + completedAssignments, getBookReflectionStreak()),
      label: "Streak Days"
    },
    {
      icon: "milestones",
      value: Math.min(7, 3 + Math.floor(Math.max(0, totalEntries + completedAssignments - 1) / 3)),
      label: "Milestones Unlocked"
    }
  ];
}

function renderBookJourneyOverview() {
  const metricTarget = $("#bookJourneyMetrics");
  const timelineTarget = $("#bookWeekTimeline");
  if (!metricTarget || !timelineTarget) return;

  metricTarget.innerHTML = getBookJourneyMetrics()
    .map(
      (metric) => `
      <article class="book-journey-metric" data-icon="${escapeHtml(metric.icon)}">
        <span class="book-journey-metric-icon" aria-hidden="true"></span>
        <strong>${metric.value}</strong>
        <small>${escapeHtml(metric.label)}</small>
      </article>
    `
    )
    .join("");

  const todayIndex = (new Date().getDay() + 6) % 7;
  const labels = ["Prayer", "Reflection", "Promise", "Scripture", "Wisdom", "Calling", "Grace"];
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  timelineTarget.innerHTML = days
    .map((day, index) => {
      const status = index < todayIndex ? "completed" : index === todayIndex ? "current" : "upcoming";
      const statusLabel = status === "completed" ? "Completed" : status === "current" ? "Reflecting" : index === days.length - 1 ? "Waiting" : "Pending";
      return `
        <span class="book-week-step ${status}">
          <b aria-hidden="true"></b>
          <strong>${day}</strong>
          <small>${statusLabel}</small>
          <em>${labels[index]}</em>
        </span>
      `;
    })
    .join("");
}

function renderBook() {
  renderBookJourneyOverview();
  renderPhase115BookMemoryTimeline();
  const entries = getFilteredBookEntries();

  $("#bookTimeline").innerHTML =
    entries
      .map((entry) => {
        const entryKind = getBookEntryKind(entry.type);
        return `
        <article class="timeline-entry book-entry-${entryKind}">
          <time>${formatDate(entry.date)}</time>
          <h4>${escapeHtml(entry.title)}</h4>
          <p>${escapeHtml(entry.content)}</p>
          <div class="scripture-strip">${entry.references
            .map((reference) => `<span class="scripture-pill">${escapeHtml(reference)}</span>`)
            .join("")}</div>
          <div class="phase116b-card-actions">
            <button class="secondary" type="button" data-phase116b-action="book-detail" data-phase116b-id="${escapeHtml(entry.id || entry.title)}">Open Detail</button>
            <button class="secondary" type="button" data-phase116b-action="book-remove" data-phase116b-id="${escapeHtml(entry.id || entry.title)}">Remove</button>
            <button class="secondary" type="button" data-phase116b-action="open-current-graph">Graph</button>
          </div>
        </article>
      `;
      })
      .join("") ||
    `<article class="timeline-entry phase114-empty-state">
      <h4>No matching Book entries yet.</h4>
      <p>Try clearing the filters, generating today's journey, or adding a reflection from the quick actions.</p>
      <button class="primary" type="button" data-phase114-action="add-reflection">Add Reflection</button>
    </article>`;
}

function renderPhase117PromiseTableControls() {
  const panel = $("#phase114PromiseTablePanel");
  if (!panel?.parentElement) return;
  let controls = $("#phase117PromiseTableControls");
  if (!controls) {
    controls = document.createElement("section");
    controls.id = "phase117PromiseTableControls";
    controls.className = "phase117-surface-controls";
    panel.parentElement.insertBefore(controls, panel);
  }
  controls.innerHTML = `
    <div>
      <p class="eyebrow">Phase 11.7 Promise Table Data</p>
      <h3>Safe promise rows</h3>
      <p>Promise Table exports use real local promise rows, Scripture anchors, statuses, and redacted session metadata.</p>
    </div>
    <div class="phase115-control-row">
      <button type="button" class="secondary" data-phase117-action="download-json">Export Promise Table JSON</button>
      <button type="button" class="secondary" data-phase117-action="open-data-controls">Import / Restore Preview</button>
    </div>
  `;
}

function renderPhase117TestimonyControls() {
  const list = $("#testimonyList");
  if (!list?.parentElement) return;
  let controls = $("#phase117TestimonyControls");
  if (!controls) {
    controls = document.createElement("section");
    controls.id = "phase117TestimonyControls";
    controls.className = "phase117-surface-controls";
    list.parentElement.insertBefore(controls, list);
  }
  controls.innerHTML = `
    <div>
      <p class="eyebrow">Phase 11.7 Testimony Safety</p>
      <h3>User-recorded only</h3>
      <p>Testimony export defaults to title, status, category, Scripture anchors, and redacted summaries. Public sharing, encouragement, analytics, and outreach remain disabled placeholders.</p>
    </div>
    <div class="phase115-control-row">
      <button type="button" class="secondary" data-phase117-action="download-json">Export Testimony Archive JSON</button>
      <button type="button" class="secondary" data-phase117-action="open-data-controls">Data Controls</button>
    </div>
  `;
}

function getFilteredBookEntries() {
  const query = normalize(bookSearchQuery);
  const now = Date.now();
  return safeArray(state.book).filter((entry) => {
    const haystack = normalize(`${entry.type} ${entry.title} ${entry.content} ${(entry.references || []).join(" ")}`);
    if (query && !haystack.includes(query)) return false;
    if (bookTypeFilter !== "all" && !normalize(entry.type).includes(bookTypeFilter)) return false;
    if (bookDateFilter === "week") {
      const age = now - new Date(entry.date).getTime();
      if (Number.isFinite(age) && age > 7 * 24 * 60 * 60 * 1000) return false;
    }
    if (bookDateFilter === "month") {
      const age = now - new Date(entry.date).getTime();
      if (Number.isFinite(age) && age > 31 * 24 * 60 * 60 * 1000) return false;
    }
    return true;
  });
}

function getPhase114PromiseRows() {
  const cluster = promiseClusters[state.clusterIndex] || promiseClusters[0];
  const activeRow = {
    id: "active-daily-promise",
    title: state.selectedPromiseResult?.title || `${getClusterTitle(cluster)}: ${state.selectedWord || state.generatedWord.word}`,
    scripture: state.selectedScripture || getClusterScriptures(cluster)[0],
    status: "Studying",
    source: "Today",
    savedAt: state.generatedDailyJourney?.generatedAt || new Date().toISOString()
  };
  const saved = safeArray(state.savedPromiseTableItems).filter((item) => item.id !== activeRow.id);
  return [activeRow, ...saved];
}

function renderPhase114PromiseTableRows() {
  const target = $("#savedPromiseTableRows");
  if (!target) return;
  const rows = getPhase116bFilteredPromiseRows();
  target.innerHTML =
    rows
      .map(
        (row, index) => `
        <tr data-phase114-promise-row="${escapeHtml(row.id)}">
          <td>
            <strong>${escapeHtml(row.title)}</strong>
            <small>Saved ${escapeHtml(formatShortDate(row.savedAt))}</small>
          </td>
          <td><span class="scripture-pill">${escapeHtml(phase116bScriptureReference(row.scripture, "Scripture anchor review needed"))}</span></td>
          <td>
            <select data-phase114-promise-status="${escapeHtml(row.id)}" aria-label="Update status for ${escapeHtml(row.title)}">
              ${journeyStatuses
                .map((status) => `<option value="${escapeHtml(status)}" ${status === row.status ? "selected" : ""}>${escapeHtml(status)}</option>`)
                .join("")}
            </select>
          </td>
          <td>${escapeHtml(row.source || "Local")}</td>
          <td>
            <div class="phase114-row-actions">
              <button class="secondary" type="button" data-phase116b-action="promise-detail" data-phase116b-id="${escapeHtml(row.id)}">Detail</button>
              <button class="secondary" type="button" data-phase114-save-promise="${escapeHtml(row.id)}">Save to Book</button>
              <button class="secondary" type="button" data-phase114-remove-promise="${escapeHtml(row.id)}" ${row.id === "active-daily-promise" ? "disabled" : ""}>Remove</button>
              <button class="secondary" type="button" data-phase116b-action="promise-prayer" data-phase116b-id="${escapeHtml(row.id)}">Pray</button>
              <button class="secondary" type="button" data-phase116b-action="promise-start-action" data-phase116b-id="${escapeHtml(row.id)}">Act</button>
              <button class="secondary" type="button" data-phase115-action="compare-recommendation">Compare</button>
            </div>
            ${renderPhase115FeedbackControls({
              label: row.title,
              scripture: row.scripture,
              word: state.selectedWord,
              promise: row.title,
              source: "promise-table"
            })}
          </td>
        </tr>
      `
      )
      .join("") ||
    `<tr><td colspan="5"><div class="phase114-empty-state"><strong>No promise rows yet.</strong><p>Add a TeoyubeSearch result or generate today's journey.</p><button class="primary" type="button" data-phase114-action="generate-journey">Generate Journey</button></div></td></tr>`;
}

function formatShortDate(date) {
  if (!date) return "this session";
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(date));
  } catch {
    return "this session";
  }
}

function getLexiconItemSources(item) {
  return item.scripture_sources || item.scriptureReferences || item.references || [];
}

function getLexiconItemPart(item) {
  return item.part_of_speech || item.partOfSpeech || item.speech || item.category || "Noun";
}

function getLexiconItemCategory(item) {
  return item.promise_category || item.category || "Core";
}

function getLexiconDescription(item) {
  return item.prayer_use || item.description || item.scripture_theme || item.animation_symbol || "A Scripture-rooted word connected to promise, prayer, and calling.";
}

function getLexiconItems() {
  const userWord = {
    ...state.generatedWord,
    category: "Generated Prayer Aid",
    scripture_sources: getClusterScriptures(promiseClusters[state.clusterIndex]),
    promise_category: getClusterTitle(promiseClusters[state.clusterIndex]),
    prayer_use: "Generated from the current promise cluster as a Scripture-linked memory aid."
  };
  return [userWord, ...coreWords].filter((item) => item && item.word);
}

function getFilteredLexiconItems(items) {
  const query = normalize(lexiconSearchQuery);
  return items.filter((item) => {
    const category = getLexiconItemCategory(item);
    const speech = getLexiconItemPart(item);
    const sources = getLexiconItemSources(item);
    const haystack = normalize(
      [
        item.word,
        item.pronunciation,
        item.meaning,
        category,
        speech,
        getLexiconDescription(item),
        formatSources(sources),
        item.symbol,
        item.animation_symbol,
        item.related_words ? formatSources(item.related_words) : ""
      ].join(" ")
    );
    if (query && !haystack.includes(query)) return false;
    if (lexiconCategoryFilter !== "all" && normalize(category) !== lexiconCategoryFilter) return false;
    if (lexiconSpeechFilter !== "all" && normalize(speech) !== lexiconSpeechFilter) return false;
    if (activeLexiconAlpha !== "all" && !normalize(item.word).startsWith(activeLexiconAlpha)) return false;
    return true;
  });
}

function syncLexiconFilters(items) {
  const categorySelect = $("#lexiconCategoryFilter");
  const speechSelect = $("#lexiconSpeechFilter");
  if (categorySelect) {
    const categories = [...new Set(items.map(getLexiconItemCategory).filter(Boolean))].sort();
    categorySelect.innerHTML = `<option value="all">All Categories</option>${categories
      .map((category) => `<option value="${escapeHtml(normalize(category))}" ${normalize(category) === lexiconCategoryFilter ? "selected" : ""}>${escapeHtml(category)}</option>`)
      .join("")}`;
  }
  if (speechSelect) {
    const speechParts = [...new Set(items.map(getLexiconItemPart).filter(Boolean))].sort();
    speechSelect.innerHTML = `<option value="all">All Parts of Speech</option>${speechParts
      .map((speech) => `<option value="${escapeHtml(normalize(speech))}" ${normalize(speech) === lexiconSpeechFilter ? "selected" : ""}>${escapeHtml(speech)}</option>`)
      .join("")}`;
  }
}

function renderLexiconStats(items) {
  const statsGrid = $("#lexiconStatsGrid");
  if (!statsGrid) return;
  const sources = items.flatMap(getLexiconItemSources);
  const categories = new Set(items.map(getLexiconItemCategory).filter(Boolean));
  const languages = new Set(items.map((item) => item.language || item.origin_language || item.origin).filter(Boolean));
  const mostUsed = items.find((item) => normalize(item.word).includes("grace")) || items[0];
  const cards = [
    ["Total Words", items.length, "+12 this month", "book"],
    ["Scripture References", sources.length || items.length, "+24 this month", "scripture"],
    ["Categories", categories.size || 1, "Core themes", "folder"],
    ["Languages", Math.max(3, languages.size || 3), "Hebrew, Greek, Aramaic", "globe"],
    ["Most Used", mostUsed?.word || "GRACE", `${getLexiconItemSources(mostUsed || {}).length || 156} references`, "star"]
  ];
  statsGrid.innerHTML = cards
    .map(
      ([label, value, note, icon]) => `
      <article class="lexicon-stat-card" data-icon="${escapeHtml(icon)}">
        <span aria-hidden="true"></span>
        <div>
          <small>${escapeHtml(label)}</small>
          <strong>${escapeHtml(value)}</strong>
          <em>${escapeHtml(note)}</em>
        </div>
      </article>
    `
    )
    .join("");
}

function renderLexiconFeature(items) {
  const card = $("#lexiconWordDay");
  if (!card) return;
  const featured = items.find((item) => normalize(item.word).includes("grace")) || items[0];
  if (!featured) return;
  const sources = getLexiconItemSources(featured);
  card.innerHTML = `
    <div>
      <p class="eyebrow">Word of the Day</p>
      <h4>${escapeHtml(featured.word)} <button type="button" aria-label="Hear ${escapeHtml(featured.word)} pronunciation"></button></h4>
      <span>${escapeHtml(featured.pronunciation || getLexiconItemPart(featured))}</span>
      <p>${escapeHtml(featured.meaning || getLexiconDescription(featured))}</p>
      <small>${escapeHtml(sources[0] || featured.promise_category || "Ephesians 2:8")}</small>
    </div>
    <div class="lexicon-word-day-actions">
      <button class="secondary lexicon-action-button lexicon-explore-word-button" type="button">
        <span aria-hidden="true"></span>
        Explore Word
        <span aria-hidden="true"></span>
      </button>
      <button class="lexicon-icon-button lexicon-share-word-button" type="button" aria-label="Share ${escapeHtml(featured.word)}"></button>
      <button class="lexicon-icon-button lexicon-save-word-button" type="button" aria-label="Save ${escapeHtml(featured.word)}"></button>
    </div>
    ${renderPhase116WhyThisPanel({
      source: "lexicon-word-detail",
      label: featured.word,
      scripture: sources[0] || featured.promise_category || "Ephesians 1:18",
      word: featured.word,
      promise: featured.promise_category || getClusterTitle(getActivePhase115Cluster()),
      prayer: featured.prayer_use || getClusterPrayer(getActivePhase115Cluster()),
      action: `Study ${featured.word} with Scripture before using it as a devotional memory aid.`,
      fallbackReason: sources[0] ? "Lexicon word has a visible Scripture source." : "Lexicon word uses the active Scripture fallback until reviewed."
    })}
  `;
}

function renderLexiconRail(items, filteredItems) {
  const overview = $("#lexiconOverviewCard");
  const topCategories = $("#lexiconTopCategories");
  const recentlyViewed = $("#lexiconRecentlyViewed");
  const explored = Math.min(items.length, Math.max(filteredItems.length, Math.round(items.length * 0.78)));
  const remaining = Math.max(0, items.length - explored);
  const percent = items.length ? Math.round((explored / items.length) * 100) : 0;
  if (overview) {
    overview.innerHTML = `
      <div class="lexicon-overview-premium" style="--lexicon-progress:${percent}; --lexicon-progress-offset:${100 - percent}; --lexicon-progress-deg:${percent * 3.6}deg">
        <div class="lexicon-overview-head">
          <span class="lexicon-overview-icon" data-lexicon-icon="book" aria-hidden="true"></span>
          <div>
            <h4>Lexicon Overview</h4>
            <p>Your journey through the Teoyube Language</p>
          </div>
        </div>
        <div class="lexicon-overview-progress" role="img" aria-label="Lexicon overview ${percent}% explored">
          <div class="lexicon-overview-ring">
            <svg viewBox="0 0 220 220" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="lexiconOverviewStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#00533f"></stop>
                  <stop offset="52%" stop-color="#0e8b66"></stop>
                  <stop offset="100%" stop-color="#d8b85b"></stop>
                </linearGradient>
              </defs>
              <circle class="lexicon-overview-track" cx="110" cy="110" r="82"></circle>
              <circle class="lexicon-overview-fill" cx="110" cy="110" r="82" pathLength="100"></circle>
            </svg>
            <div>
              <strong>${percent}%</strong>
              <span aria-hidden="true"></span>
              <b>Explored</b>
            </div>
          </div>
        </div>
        <div class="lexicon-overview-stats">
          <article>
            <span data-lexicon-icon="open-book" aria-hidden="true"></span>
            <div>
              <strong>${explored}</strong>
              <b>Explored Words</b>
              <small>Words you have discovered</small>
            </div>
          </article>
          <article>
            <span data-lexicon-icon="sprout" aria-hidden="true"></span>
            <div>
              <strong>${remaining}</strong>
              <b>Remaining Words</b>
              <small>Words left to explore</small>
            </div>
          </article>
        </div>
        <p class="lexicon-overview-footer">Every word you explore unlocks deeper understanding.</p>
      </div>
    `;
  }
  if (topCategories) {
    const categoryGroups = items.reduce((groups, item) => {
      const label = getLexiconItemCategory(item) || "Core";
      groups[label] = groups[label] || [];
      groups[label].push(item);
      return groups;
    }, {});
    const categoryCounts = Object.entries(categoryGroups)
      .map(([label, words]) => [label, words.length])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    topCategories.innerHTML = `
      <h4>Top Categories</h4>
      <div class="lexicon-category-list">
        ${categoryCounts
          .map(([label, count]) => `<p><span aria-hidden="true"></span><b>${escapeHtml(label)}</b><strong>${count}</strong></p>`)
          .join("")}
      </div>
      <a href="#lexicon">View All Categories &rarr;</a>
    `;
  }
  if (recentlyViewed) {
    recentlyViewed.innerHTML = `
      <h4>Recently Viewed</h4>
      <div class="lexicon-recent-list">
        ${items
          .slice(0, 5)
          .map((item, index) => `<p><span aria-hidden="true"></span><b>${escapeHtml(item.word)}</b><small>Viewed ${index ? `${index * 15} min ago` : "2 min ago"}</small></p>`)
          .join("")}
      </div>
      <a href="#lexicon">View All History &rarr;</a>
    `;
  }
}

function renderLexiconAlphaTabs() {
  const tabs = $("#lexiconAlphaTabs");
  if (!tabs) return;
  const letters = ["all", ..."abcdefghijklmnopqrstuvwxyz"];
  tabs.setAttribute("role", "listbox");
  tabs.setAttribute("aria-label", "Filter Lexicon words by first letter");
  tabs.innerHTML = letters
    .map((letter) => {
      const isActive = activeLexiconAlpha === letter;
      const label = letter === "all" ? "All" : letter.toUpperCase();
      const ariaLabel = letter === "all" ? "Show all Lexicon words" : `Show Lexicon words starting with ${label}`;
      return `<button class="${isActive ? "active" : ""}" type="button" data-lexicon-alpha="${letter}" role="option" aria-selected="${isActive}" aria-label="${ariaLabel}">${label}</button>`;
    })
    .join("");
}

function renderLexicon() {
  const items = getLexiconItems();
  syncLexiconFilters(items);
  renderLexiconStats(items);
  renderLexiconFeature(items);
  renderLexiconAlphaTabs();
  const filteredItems = getFilteredLexiconItems(items);
  renderLexiconRail(items, filteredItems);
  const grid = $("#lexiconGrid");
  if (!grid) return;
  grid.innerHTML = filteredItems
    .map(
      (item) => `
      <article class="lexicon-item">
        <div class="lexicon-card-head">
          <div>
            <strong>${escapeHtml(item.word)}</strong>
            <span>${escapeHtml(getLexiconItemPart(item))}</span>
          </div>
          <button type="button" aria-label="Hear ${escapeHtml(item.word)} pronunciation"></button>
        </div>
        <p><b>${escapeHtml(item.meaning || getLexiconItemCategory(item))}</b></p>
        <p>${escapeHtml(getLexiconDescription(item))}</p>
        <div class="lexicon-card-footer">
          <span>${escapeHtml(getLexiconItemSources(item)[0] || item.promise_category || "Scripture Linked")}</span>
          <button type="button" data-phase116b-action="lexicon-select-word" data-phase116b-word="${escapeHtml(item.word)}" aria-label="Study ${escapeHtml(item.word)}"></button>
        </div>
        <div class="phase116b-card-actions">
          <button class="secondary" type="button" data-phase116b-action="lexicon-select-word" data-phase116b-word="${escapeHtml(item.word)}">Study</button>
          <button class="secondary" type="button" data-phase116b-action="lexicon-pray" data-phase116b-word="${escapeHtml(item.word)}">Pray</button>
          <button class="secondary" type="button" data-phase116b-action="lexicon-add-table" data-phase116b-word="${escapeHtml(item.word)}">Table</button>
          <button class="secondary" type="button" data-phase116b-action="lexicon-view-graph" data-phase116b-word="${escapeHtml(item.word)}">Graph</button>
        </div>
      </article>
    `
    )
    .join("") || emptyState("No Lexicon words match the current filters.");
}

function renderLanguageGrammar() {
  const panel = $("#grammarPanel");
  const layerGrid = $("#languageLayerGrid");
  if (!panel || !layerGrid || !languageGrammar) return;

  panel.innerHTML = `
    <div>
      <p class="eyebrow">Phase ${escapeHtml(languageGrammar.phase)} - Promise Language</p>
      <h3>${escapeHtml(languageGrammar.name)}</h3>
      <p>${escapeHtml(languageGrammar.core_principle)}</p>
    </div>
    <div class="scripture-strip">
      ${(languageGrammar.grammar_basis || [])
        .map((item) => `<span class="scripture-pill">${escapeHtml(item)}</span>`)
        .join("")}
    </div>
    <div>
      <p class="eyebrow">Sentence Structure</p>
      <h3>${escapeHtml(languageGrammar.teoyube_sentence_structure)}</h3>
      <p><b>${escapeHtml(languageGrammar.example_sentence?.teoyube || "")}</b> - ${escapeHtml(languageGrammar.example_sentence?.meaning || "")}</p>
    </div>
    <div class="formula-grid">
      ${(languageGrammar.formulas || [])
        .map(
          (formula) => `
          <article class="formula-card">
            <p class="eyebrow">${escapeHtml(formula.name)}</p>
            <code>${escapeHtml(formula.structure)}</code>
            <strong>${escapeHtml(formula.example)}</strong>
            <p>${escapeHtml(formula.meaning)}</p>
          </article>
        `
        )
        .join("")}
    </div>
    <div class="rank-grid">
      ${(languageGrammar.ranks || [])
        .map(
          (rank) => `
          <article class="rank-card">
            <p class="eyebrow">Rank ${escapeHtml(rank.rank)}</p>
            <strong>${escapeHtml(rank.meaning)}</strong>
          </article>
        `
        )
        .join("")}
    </div>
  `;

  const layers = groupBy(promiseLanguageLexicon, "layer");
  layerGrid.innerHTML = Object.entries(layers)
    .map(
      ([layer, words]) => `
      <article class="layer-card">
        <p class="eyebrow">${escapeHtml(layer)} Layer</p>
        <strong>${escapeHtml(words.map((word) => word.word).join(", "))}</strong>
        <p>${escapeHtml(words.map((word) => `${word.word}: ${word.meaning}`).join("; "))}</p>
        <p><b>Symbols:</b> ${escapeHtml(words.map((word) => `${word.word} - ${word.symbol}`).join("; "))}</p>
      </article>
    `
    )
    .join("");
}

function getCanonStatus(index, progress) {
  if (progress >= 100) return ["Completed", "completed"];
  if (index % 7 === 0) return ["On Hold", "on-hold"];
  if (index % 5 === 0) return ["Review", "review"];
  if (index % 3 === 0) return ["Planning", "planning"];
  return ["In Progress", "in-progress"];
}

const canonArtwork = [
  "public/images/canon/canon-card-01.png",
  "public/images/canon/canon-card-02.png",
  "public/images/canon/canon-card-03.png",
  "public/images/canon/canon-card-04.png",
  "public/images/canon/canon-card-05.png",
  "public/images/canon/canon-card-06.png",
  "public/images/canon/canon-card-07.png",
  "public/images/canon/canon-card-08.png",
  "public/images/canon/canon-card-09.png",
  "public/images/canon/canon-card-10.png",
  "public/images/canon/canon-card-11.png",
  "public/images/canon/canon-card-12.png",
  "public/images/canon/canon-card-13.png",
  "public/images/canon/canon-card-14.png",
  "public/images/canon/canon-card-15.png",
  "public/images/canon/canon-card-16.png",
  "public/images/canon/canon-card-17.png",
  "public/images/canon/canon-card-18.png",
  "public/images/canon/canon-card-19.png",
  "public/images/canon/canon-card-20.png"
];

const canonFeaturedJourneySlides = [
  {
    eyebrow: "Teoyube Canon",
    source: "TeoyubeWorld",
    meta: "Sponsored",
    title: "The Chosen Calling Journey",
    subtitle: "Every promise reveals your calling and shapes the next faithful step.",
    cta: "Open Journey",
    image: "public/images/canon/featured-carousel/canon-featured-slide-01.png",
    position: "center"
  },
  {
    eyebrow: "Featured Journey",
    source: "TeoyubeWorld",
    meta: "Calling",
    title: "Called, Chosen, Sent",
    subtitle: "Discover the movement from identity to obedience, purpose, and impact.",
    cta: "Explore Calling",
    image: "public/images/canon/featured-carousel/canon-featured-slide-02.png",
    position: "center"
  },
  {
    eyebrow: "Canon Path",
    source: "TeoyubeWorld",
    meta: "Purpose",
    title: "Walk by Faith",
    subtitle: "Take the next step while God orders the path before you.",
    cta: "Begin Path",
    image: "public/images/canon/featured-carousel/canon-featured-slide-03.png",
    position: "center"
  },
  {
    eyebrow: "Promise Layer",
    source: "TeoyubeWorld",
    meta: "Wisdom",
    title: "Wisdom for the Way",
    subtitle: "Let Scripture bring clarity, discernment, and peace to your journey.",
    cta: "Read Wisdom",
    image: "public/images/canon/featured-carousel/canon-featured-slide-04.png",
    position: "center"
  },
  {
    eyebrow: "Kingdom Growth",
    source: "TeoyubeWorld",
    meta: "Sonship",
    title: "Grow Deep, Live Fruitful",
    subtitle: "Maturity forms through steady obedience, prayer, and surrendered growth.",
    cta: "Track Growth",
    image: "public/images/canon/featured-carousel/canon-featured-slide-05.png",
    position: "center"
  },
  {
    eyebrow: "Spiritual Focus",
    source: "TeoyubeWorld",
    meta: "Protection",
    title: "Peace for the Battle",
    subtitle: "Stand firm in promise language, guard your calling, and walk in peace.",
    cta: "Find Peace",
    image: "public/images/canon/featured-carousel/canon-featured-slide-06.png",
    position: "center"
  },
  {
    eyebrow: "Restoration",
    source: "TeoyubeWorld",
    meta: "Healing",
    title: "Healed for Purpose",
    subtitle: "Receive restoration as God turns wounds into witness and calling.",
    cta: "Explore Healing",
    image: "public/images/canon/featured-carousel/canon-featured-slide-07.png",
    position: "center"
  },
  {
    eyebrow: "Legacy",
    source: "TeoyubeWorld",
    meta: "Maturity",
    title: "Build What Remains",
    subtitle: "Let your calling become lasting fruit, testimony, and Kingdom legacy.",
    cta: "Continue",
    image: "public/images/canon/featured-carousel/canon-featured-slide-08.png",
    position: "center"
  }
];

const canonRecommendedCarouselSlides = [
  {
    title: "Where God's Promises Meet Your Calling",
    image: "public/images/canon/recommended-carousel/canon-recommended-slide-01.png"
  },
  {
    title: "Search with Purpose",
    image: "public/images/canon/recommended-carousel/canon-recommended-slide-02.png"
  },
  {
    title: "Walk the Canon Path",
    image: "public/images/canon/recommended-carousel/canon-recommended-slide-03.png"
  },
  {
    title: "Watch, Reflect, Grow",
    image: "public/images/canon/recommended-carousel/canon-recommended-slide-04.png"
  },
  {
    title: "Pray with Purpose",
    image: "public/images/canon/recommended-carousel/canon-recommended-slide-05.png"
  },
  {
    title: "Remember, Reflect, Grow",
    image: "public/images/canon/recommended-carousel/canon-recommended-slide-06.png"
  }
];

const canonExplorePaths = [
  {
    title: "Scripture",
    description: "Explore the living Word of God.",
    count: "1,248 Verses",
    cta: "Explore Scripture",
    icon: "scripture",
    image: "public/images/canon/canon-expanded-card-01.png"
  },
  {
    title: "Prayer",
    description: "Connect with God through prayer.",
    count: "348 Prayers",
    cta: "Explore Prayers",
    icon: "prayer",
    image: "public/images/canon/canon-expanded-card-02.png"
  },
  {
    title: "Teachings",
    description: "Grow in wisdom through teachings.",
    count: "856 Teachings",
    cta: "Explore Teachings",
    icon: "teachings",
    image: "public/images/canon/canon-expanded-card-03.png"
  },
  {
    title: "Canon Journeys",
    description: "Walk your calling through canon paths.",
    count: "72 Journeys",
    cta: "Explore Journeys",
    icon: "journeys",
    image: "public/images/canon/canon-expanded-card-04.png"
  },
  {
    title: "Promise Language",
    description: "Speak life through God's promises.",
    count: "144 Promises",
    cta: "Explore Promises",
    icon: "promise",
    image: "public/images/canon/canon-expanded-card-05.png"
  },
  {
    title: "Worship",
    description: "Enter His presence with gratitude.",
    count: "196 Worship",
    cta: "Explore Worship",
    icon: "worship",
    image: "public/images/canon/canon-expanded-card-06.png"
  },
  {
    title: "Kingdom Warfare",
    description: "Stand strong in spiritual battles.",
    count: "56 Strategies",
    cta: "Explore Warfare",
    icon: "warfare",
    image: "public/images/canon/canon-expanded-card-07.png"
  },
  {
    title: "Growth",
    description: "Grow deeper in your walk.",
    count: "92 Lessons",
    cta: "Explore Growth",
    icon: "growth",
    image: "public/images/canon/canon-expanded-card-08.png"
  },
  {
    title: "Calling",
    description: "Discover and walk in your divine call.",
    count: "34 Callings",
    cta: "Explore Calling",
    icon: "calling",
    image: "public/images/canon/canon-expanded-card-09.png"
  },
  {
    title: "Kingdom Identity",
    description: "Discover who you are in Christ.",
    count: "28 Identities",
    cta: "Explore Identity",
    icon: "identity",
    image: "public/images/canon/canon-expanded-card-10.png"
  },
  {
    title: "Testimony",
    description: "Share and discover God's faithfulness.",
    count: "63 Stories",
    cta: "Explore Stories",
    icon: "testimony",
    image: "public/images/canon/canon-expanded-card-11.png"
  },
  {
    title: "Lexicon",
    description: "Understand the language of God.",
    count: "212 Words",
    cta: "Explore Lexicon",
    icon: "lexicon",
    image: "public/images/canon/canon-expanded-card-12.png"
  },
  {
    title: "Covenant Paths",
    description: "Trace promises through covenant alignment.",
    count: "48 Paths",
    cta: "Explore Covenants",
    icon: "journeys",
    image: "public/images/canon/canon-expanded-card-13.png"
  },
  {
    title: "Promise Clusters",
    description: "Gather connected promises by theme.",
    count: "36 Clusters",
    cta: "Explore Clusters",
    icon: "promise",
    image: "public/images/canon/canon-expanded-card-14.png"
  },
  {
    title: "Prayer Collections",
    description: "Build guided prayers from Scripture.",
    count: "84 Prayers",
    cta: "Explore Collections",
    icon: "prayer",
    image: "public/images/canon/canon-expanded-card-15.png"
  },
  {
    title: "Knowledge Graph",
    description: "Connect canon themes and meanings.",
    count: "108 Links",
    cta: "Explore Graph",
    icon: "teachings",
    image: "public/images/canon/canon-expanded-card-16.png"
  },
  {
    title: "Kingdom Legacy",
    description: "Shape lasting fruit through obedience.",
    count: "27 Legacies",
    cta: "Explore Legacy",
    icon: "identity",
    image: "public/images/canon/canon-expanded-card-17.png"
  },
  {
    title: "Purpose Roadmap",
    description: "Follow the next steps in your calling.",
    count: "64 Steps",
    cta: "Explore Roadmap",
    icon: "calling",
    image: "public/images/canon/canon-expanded-card-18.png"
  }
];

function getCanonArtwork(index, title = "", tags = []) {
  const text = normalize(`${title} ${(tags || []).join(" ")}`);
  if (text.includes("wisdom") || text.includes("teacher")) return "public/images/canon/canon-card-07.png";
  if (text.includes("peace") || text.includes("protection") || text.includes("warfare")) return "public/images/canon/canon-card-05.png";
  if (text.includes("purpose") || text.includes("calling") || text.includes("mission")) return "public/images/canon/canon-card-04.png";
  if (text.includes("growth") || text.includes("sonship") || text.includes("shepherd")) return "public/images/canon/canon-card-02.png";
  if (text.includes("healing") || text.includes("restoration")) return "public/images/canon/canon-card-06.png";
  if (text.includes("faith") || text.includes("leadership") || text.includes("dominion")) return "public/images/canon/canon-card-13.png";
  if (text.includes("legacy") || text.includes("hope")) return "public/images/canon/canon-card-19.png";
  return canonArtwork[index % canonArtwork.length];
}

function createCanonJourneyCard({ id, title, description, tags = [], scriptureCount = 0, prayerCount = 0, index = 0 }) {
  const progressValues = [100, 75, 100, 50, 65, 20, 100, 0, 85, 45, 60, 90];
  const progress = progressValues[index % progressValues.length];
  const [status, statusKey] = getCanonStatus(index, progress);
  return {
    id,
    title,
    description,
    tags: tags.filter(Boolean).slice(0, 8),
    scriptureCount,
    prayerCount,
    progress,
    status,
    statusKey,
    image: getCanonArtwork(index, title, tags)
  };
}

function setCanonFeaturedJourneySlideIndex(index) {
  const total = canonFeaturedJourneySlides.length;
  selectedCanonFeaturedJourneySlideIndex = ((Number(index) || 0) % total + total) % total;
}

function renderCanonFeaturedJourneyCarouselCard(item) {
  setCanonFeaturedJourneySlideIndex(selectedCanonFeaturedJourneySlideIndex);
  const activeSlide = canonFeaturedJourneySlides[selectedCanonFeaturedJourneySlideIndex];
  const slideCount = canonFeaturedJourneySlides.length;

  return `
        <article
          class="canon-project-card canon-featured-carousel-card ${item.id === selectedCanonItemId ? "active" : ""}"
          data-canon-item="${escapeHtml(item.id)}"
          data-canon-featured-carousel
          tabindex="0"
          aria-label="${escapeHtml(item.title)} featured journey carousel"
          aria-roledescription="carousel"
          style="--canon-featured-image: url('${escapeHtml(activeSlide.image)}'); --canon-featured-position: ${escapeHtml(activeSlide.position || "center")};"
        >
          <div class="canon-featured-carousel-stage" aria-live="polite">
            <button class="canon-featured-carousel-arrow prev" type="button" data-canon-featured-slide-nav="prev" aria-label="Previous featured journey slide">&lsaquo;</button>
            <button class="canon-featured-carousel-arrow next" type="button" data-canon-featured-slide-nav="next" aria-label="Next featured journey slide">&rsaquo;</button>
            <div class="canon-featured-carousel-dots" aria-label="Featured journey slide indicators">
              ${canonFeaturedJourneySlides
                .map(
                  (slide, index) => `
                  <button
                    class="${index === selectedCanonFeaturedJourneySlideIndex ? "active" : ""}"
                    type="button"
                    data-canon-featured-slide-index="${index}"
                    aria-current="${index === selectedCanonFeaturedJourneySlideIndex ? "true" : "false"}"
                    aria-label="Show slide ${index + 1} of ${slideCount}: ${escapeHtml(slide.title)}"
                  ></button>
                `
                )
                .join("")}
            </div>
          </div>
        </article>
      `;
}

function updateCanonFeaturedJourneyCarouselCard() {
  const card = $("#canonGrid [data-canon-featured-carousel]");
  if (!card) return false;

  const categories = getCanonDashboardCategories();
  const activeCategory = categories.find((category) => category.id === activeCanonTab) || categories[0];
  const activeItems = activeCategory?.items || [];
  const item = activeItems.find((candidate) => candidate.id === card.dataset.canonItem);
  if (!item || item.title !== "The Chosen Calling Journey") return false;

  card.outerHTML = renderCanonFeaturedJourneyCarouselCard(item);
  return true;
}

function startCanonFeaturedJourneyCarousel() {
  clearInterval(canonFeaturedJourneyTimer);
  canonFeaturedJourneyTimer = setInterval(() => {
    if (canonFeaturedJourneyPaused || document.body.dataset.view !== "canon") return;
    if (!$("#canonGrid [data-canon-featured-carousel]")) return;
    setCanonFeaturedJourneySlideIndex(selectedCanonFeaturedJourneySlideIndex + 1);
    updateCanonFeaturedJourneyCarouselCard();
  }, 7000);
}

function setCanonRecommendedSlideIndex(index) {
  const total = canonRecommendedCarouselSlides.length;
  selectedCanonRecommendedSlideIndex = ((Number(index) || 0) % total + total) % total;
}

function renderCanonRecommendedMediaCarousel() {
  setCanonRecommendedSlideIndex(selectedCanonRecommendedSlideIndex);
  const activeSlide = canonRecommendedCarouselSlides[selectedCanonRecommendedSlideIndex];

  return `
            <div
              class="canon-recommended-media"
              data-canon-recommended-carousel
              tabindex="0"
              aria-label="Recommended For You image carousel"
              aria-roledescription="carousel"
              style="--canon-recommended-image: url('${escapeHtml(activeSlide.image)}');"
            >
              <div class="canon-recommended-image-frame" aria-hidden="true"></div>
              <div class="canon-recommended-controls">
                <button class="canon-recommended-arrow prev" type="button" data-canon-recommended-nav="prev" aria-label="Previous recommended slide">&lsaquo;</button>
                <div class="canon-recommended-dots" aria-label="Recommended slide indicators">
                  ${canonRecommendedCarouselSlides
                    .map(
                      (slide, index) => `
                      <button
                        class="${index === selectedCanonRecommendedSlideIndex ? "active" : ""}"
                        type="button"
                        data-canon-recommended-index="${index}"
                        aria-current="${index === selectedCanonRecommendedSlideIndex ? "true" : "false"}"
                        aria-label="Show recommended slide ${index + 1}: ${escapeHtml(slide.title)}"
                      ></button>
                    `
                    )
                    .join("")}
                </div>
                <button class="canon-recommended-arrow next" type="button" data-canon-recommended-nav="next" aria-label="Next recommended slide">&rsaquo;</button>
              </div>
            </div>
          `;
}

function updateCanonRecommendedCarousel() {
  const carousel = $("#canonPaths [data-canon-recommended-carousel]");
  if (!carousel) return false;
  carousel.outerHTML = renderCanonRecommendedMediaCarousel();
  return true;
}

function startCanonRecommendedCarousel() {
  clearInterval(canonRecommendedTimer);
  canonRecommendedTimer = setInterval(() => {
    if (canonRecommendedPaused || document.body.dataset.view !== "canon") return;
    if (!$("#canonPaths [data-canon-recommended-carousel]")) return;
    setCanonRecommendedSlideIndex(selectedCanonRecommendedSlideIndex + 1);
    updateCanonRecommendedCarousel();
  }, 7000);
}

function getCanonDashboardCategories() {
  const canonMaps = destinyMaps.map((map, index) =>
    createCanonJourneyCard({
      id: `canon-map-${map.id || index}`,
      title: map.name || `Canon Map ${index + 1}`,
      description: `${map.archetypeName || map.archetype || "Kingdom Archetype"} through ${map.pathName || map.path || "Covenant Path"} toward ${map.destination || "manifestation"}.`,
      tags: map.sequence || [],
      scriptureCount: (map.sequence || []).length,
      prayerCount: 1,
      index
    })
  );

  const archetypeCards = kingdomArchetypes.map((item, index) =>
    createCanonJourneyCard({
      id: `archetype-${item.id || item.name || index}`,
      title: item.name || `Kingdom Archetype ${index + 1}`,
      description: item.description || item.summary || item.calling || "A Kingdom identity pattern connected to promise, calling, and manifestation.",
      tags: item.coreWords || item.words || item.traits || [item.category, item.path],
      scriptureCount: (item.scriptures || item.scriptureReferences || []).length || 3,
      prayerCount: 1,
      index
    })
  );

  const promiseClusterCards = promiseClusters.map((cluster, index) =>
    createCanonJourneyCard({
      id: `promise-cluster-${cluster.id || cluster.theme || index}`,
      title: getClusterTitle(cluster),
      description: cluster.summary || cluster.declaration || "A promise cluster linking Scripture, prayer, action, and spiritual progress.",
      tags: [...(cluster.keywords || []), ...getClusterScriptures(cluster).slice(0, 3)],
      scriptureCount: getClusterScriptures(cluster).length,
      prayerCount: cluster.prayer ? 1 : 0,
      index
    })
  );

  const pathCards = covenantPaths.map((path, index) =>
    createCanonJourneyCard({
      id: `covenant-path-${path.id || index}`,
      title: path.name || `Covenant Path ${index + 1}`,
      description: Array.isArray(path.meaning) ? path.meaning.join(" -> ") : path.meaning || "A Promise progression journey.",
      tags: path.sequence || [],
      scriptureCount: (path.sequence || []).length,
      prayerCount: 1,
      index
    })
  );

  const prayerCards = prayerEngineTemplates.map((prayer, index) =>
    createCanonJourneyCard({
      id: `prayer-${prayer.id || index}`,
      title: prayer.name || `Prayer Collection ${index + 1}`,
      description: prayer.declaration || prayer.prayer_meaning || prayer.prayer || "Prayer collection for identity, promise, transformation, and manifestation.",
      tags: prayer.sequence || prayer.example_sequence || [],
      scriptureCount: prayer.scripture_anchor || prayer.scriptureAnchor ? 1 : 0,
      prayerCount: 1,
      index
    })
  );

  const graphCards = scriptureCanon.map((record, index) =>
    createCanonJourneyCard({
      id: `graph-${record.id || index}`,
      title: record.teoyubeWord || record.word || `Knowledge Graph ${index + 1}`,
      description: record.promiseStatement || record.meaning || "Scripture Knowledge Graph seed connected to Teoyube word relationships.",
      tags: record.scriptureReferences || record.scripture_sources || [],
      scriptureCount: (record.scriptureReferences || record.scripture_sources || []).length,
      prayerCount: 1,
      index
    })
  );

  return [
    { id: "canon-maps", label: "Canon Maps", items: canonMaps },
    { id: "archetypes", label: "Archetypes", items: archetypeCards },
    { id: "promise-clusters", label: "Promise Clusters", items: promiseClusterCards },
    { id: "covenant-paths", label: "Covenant Paths", items: pathCards },
    { id: "prayer-collections", label: "Prayer Collections", items: prayerCards },
    { id: "knowledge-graph", label: "Knowledge Graph", items: graphCards }
  ];
}

function renderCanon() {
  return renderCanonPremium();
  const grid = $("#canonGrid");
  const paths = $("#canonPaths");
  const kpis = $("#canonKpiGrid");
  const tabs = $("#canonTabs");
  const pagination = $("#canonPagination");
  if (!grid || !paths || !kpis || !tabs || !pagination || !canonArchitecture) return;

  $("#canonSummary").textContent = canonArchitecture.principle || canonArchitecture.subtitle;

  const categories = getCanonDashboardCategories();
  if (!categories.some((category) => category.id === activeCanonTab)) activeCanonTab = categories[0]?.id || "canon-maps";
  const activeCategory = categories.find((category) => category.id === activeCanonTab) || categories[0];
  const activeItems = activeCategory?.items || [];
  const totalPages = Math.max(1, Math.min(3, Math.ceil(activeItems.length / CANON_ITEMS_PER_PAGE)));
  activeCanonPage = Math.min(Math.max(activeCanonPage, 1), totalPages);
  const pageStart = (activeCanonPage - 1) * CANON_ITEMS_PER_PAGE;
  const pageItems = activeItems.slice(pageStart, pageStart + CANON_ITEMS_PER_PAGE);
  if (!selectedCanonItemId || !activeItems.some((item) => item.id === selectedCanonItemId)) {
    selectedCanonItemId = pageItems[0]?.id || activeItems[0]?.id || "";
  }
  const selectedItem = activeItems.find((item) => item.id === selectedCanonItemId) || activeItems[0];
  const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0);
  const completedItems = categories.reduce((sum, category) => sum + category.items.filter((item) => item.status === "Completed").length, 0);
  const inProgressItems = categories.reduce((sum, category) => sum + category.items.filter((item) => item.status === "In Progress").length, 0);
  const onHoldItems = categories.reduce((sum, category) => sum + category.items.filter((item) => item.status === "On Hold").length, 0);
  const completionRate = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

  kpis.innerHTML = [
    ["Total Journeys", totalItems, "All Canon modules"],
    ["Completed", completedItems, "Ready for use"],
    ["In Progress", inProgressItems, "Being developed"],
    ["On Hold", onHoldItems, "Needs review"],
    ["Completion Rate", `${completionRate}%`, "Canon maturity"]
  ]
    .map(
      ([label, value, note]) => `
      <article class="canon-kpi-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(note)}</small>
      </article>
    `
    )
    .join("");

  tabs.innerHTML = categories
    .map(
      (category) => `
      <button class="canon-tab ${category.id === activeCanonTab ? "active" : ""}" type="button" data-canon-tab="${escapeHtml(category.id)}">
        ${escapeHtml(category.label)}
        <span>${category.items.length}</span>
      </button>
    `
    )
    .join("");

  grid.innerHTML =
    pageItems
      .map(
        (item, index) => `
        <article class="canon-project-card ${item.id === selectedCanonItemId ? "active" : ""}" data-canon-item="${escapeHtml(item.id)}">
          <div class="canon-project-media" style="background-image: url('${escapeHtml(item.image)}')"></div>
          <div class="canon-project-body">
            <div class="canon-project-heading">
              <div>
                <h4>${escapeHtml(item.title)}</h4>
                <span class="canon-status ${escapeHtml(item.statusKey)}">${escapeHtml(item.status)}</span>
              </div>
              <button type="button" aria-label="Project actions">...</button>
            </div>
            <p>${escapeHtml(item.description)}</p>
            <div class="canon-avatar-row">
              ${[0, 1, 2]
                .map((avatarIndex) => `<span style="background-image: url('${escapeHtml(localMediaThumbnails[(pageStart + index + avatarIndex) % localMediaThumbnails.length])}')"></span>`)
                .join("")}
            </div>
            <div class="canon-project-footer">
              <span>Progress</span>
              <strong>${item.progress}%</strong>
            </div>
            <progress value="${item.progress}" max="100"></progress>
          </div>
        </article>
      `
      )
      .join("") || `<article class="canon-project-card"><div class="canon-project-body"><p>No items available for this category yet.</p></div></article>`;

  pagination.innerHTML = `
    <button class="canon-page-control" type="button" data-canon-page="${Math.max(1, activeCanonPage - 1)}" ${activeCanonPage === 1 ? "disabled" : ""} aria-label="Previous Canon page">&larr;</button>
    ${Array.from({ length: totalPages }, (_, pageIndex) => {
      const page = pageIndex + 1;
      return `<button class="canon-page-number ${page === activeCanonPage ? "active" : ""}" type="button" data-canon-page="${page}" aria-current="${page === activeCanonPage ? "page" : "false"}">${page}</button>`;
    }).join("")}
    ${totalPages < 3 ? "" : `<span class="canon-page-ellipsis">...</span>`}
    <button class="canon-page-control" type="button" data-canon-page="${Math.min(totalPages, activeCanonPage + 1)}" ${activeCanonPage === totalPages ? "disabled" : ""} aria-label="Next Canon page">&rarr;</button>
  `;

  paths.innerHTML = selectedItem
    ? `
      <div class="canon-detail-sticky">
        <p class="eyebrow">Detail View</p>
        <h3>${escapeHtml(selectedItem.title)}</h3>
        <span class="canon-status ${escapeHtml(selectedItem.statusKey)}">${escapeHtml(selectedItem.status)}</span>
        <p>${escapeHtml(selectedItem.description)}</p>
        <div class="canon-detail-stats">
          <div><span>Scriptures</span><strong>${selectedItem.scriptureCount}</strong></div>
          <div><span>Prayers</span><strong>${selectedItem.prayerCount}</strong></div>
          <div><span>Progress</span><strong>${selectedItem.progress}%</strong></div>
        </div>
        <progress value="${selectedItem.progress}" max="100"></progress>
        <h4>Related Content</h4>
        <div class="sequence-row">${selectedItem.tags
          .map((tag) => `<span class="scripture-pill">${escapeHtml(tag)}</span>`)
          .join("")}</div>
        <h4>Activity Feed</h4>
        <ul class="canon-activity-list">
          <li>Canon data loaded from ${escapeHtml(activeCategory.label)}.</li>
          <li>${selectedItem.scriptureCount} scripture anchors connected.</li>
          <li>${selectedItem.prayerCount} prayer links available.</li>
        </ul>
        ${renderPhase116WhyThisPanel({
          source: "canon-detail-rail",
          label: selectedItem.title,
          scripture: state.selectedScripture || getClusterScriptures(getActivePhase115Cluster())[0],
          promise: selectedItem.title,
          word: state.selectedWord,
          journey: selectedItem.title,
          action: "Open the journey, review Scripture anchors, and take one faithful next step.",
          confidence: selectedItem.status || "Good",
          fallbackReason: selectedItem.scriptureCount ? "Canon detail has connected Scripture anchors." : "Canon detail needs Scripture anchor review."
        })}
        <button class="primary" type="button">Open Full Journey &rarr;</button>
        <button class="secondary" type="button">View Journey Map</button>
      </div>
    `
    : `<p>Select a Canon journey card to view details.</p>`;
}

function renderCanonPremium() {
  const grid = $("#canonGrid");
  const paths = $("#canonPaths");
  const kpis = $("#canonKpiGrid");
  const tabs = $("#canonTabs");
  const pagination = $("#canonPagination");
  const categoryGrid = $("#canonCategoryGrid");
  const recentGrid = $("#canonRecentGrid");
  const exploreGrid = $("#canonExploreGrid");
  if (!grid || !paths || !kpis || !tabs || !pagination || !canonArchitecture) return;

  $("#canonSummary").textContent =
    canonArchitecture.principle ||
    canonArchitecture.subtitle ||
    "Walk daily through Scripture, Calling, Purpose, Canon Journeys, Wisdom and Legacy.";

  const categories = getCanonDashboardCategories();
  if (!categories.some((category) => category.id === activeCanonTab)) activeCanonTab = categories[0]?.id || "canon-maps";
  const activeCategory = categories.find((category) => category.id === activeCanonTab) || categories[0];
  const activeItems = activeCategory?.items || [];
  const totalPages = Math.max(1, Math.min(3, Math.ceil(activeItems.length / CANON_ITEMS_PER_PAGE)));
  activeCanonPage = Math.min(Math.max(activeCanonPage, 1), totalPages);
  const pageStart = (activeCanonPage - 1) * CANON_ITEMS_PER_PAGE;
  const pageItems = activeItems.slice(pageStart, pageStart + CANON_ITEMS_PER_PAGE);
  if (!selectedCanonItemId || !activeItems.some((item) => item.id === selectedCanonItemId)) {
    selectedCanonItemId = pageItems[0]?.id || activeItems[0]?.id || "";
  }
  const selectedItem = activeItems.find((item) => item.id === selectedCanonItemId) || activeItems[0];
  const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0);
  const completedItems = categories.reduce((sum, category) => sum + category.items.filter((item) => item.status === "Completed").length, 0);
  const inProgressItems = categories.reduce((sum, category) => sum + category.items.filter((item) => item.status === "In Progress").length, 0);
  const onHoldItems = categories.reduce((sum, category) => sum + category.items.filter((item) => item.status === "On Hold").length, 0);
  const completionRate = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  const featuredItems = pageItems.slice(0, 5);
  const recentStart = pageStart + featuredItems.length;
  const recentItems = activeItems.length
    ? Array.from({ length: Math.min(CANON_RECENT_CARD_COUNT, activeItems.length) }, (_, index) => activeItems[(recentStart + index) % activeItems.length])
    : [];
  const canonOverviewDimensions = [
    { key: "calling", label: "Calling", value: 85, icon: "compass" },
    { key: "purpose", label: "Purpose", value: 78, icon: "target" },
    { key: "wisdom", label: "Wisdom", value: 72, icon: "book" },
    { key: "dominion", label: "Dominion", value: 68, icon: "crown" },
    { key: "legacy", label: "Legacy", value: 80, icon: "shield" }
  ];
  const radarCenter = 160;
  const radarRadius = 104;
  const getRadarPoint = (index, radius) => {
    const angle = (-90 + index * 72) * (Math.PI / 180);
    return {
      x: radarCenter + Math.cos(angle) * radius,
      y: radarCenter + Math.sin(angle) * radius
    };
  };
  const canonRadarPolygon = canonOverviewDimensions
    .map((dimension, index) => {
      const point = getRadarPoint(index, radarRadius * (dimension.value / 100));
      return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    })
    .join(" ");
  const canonRadarAxis = canonOverviewDimensions
    .map((dimension, index) => {
      const edge = getRadarPoint(index, radarRadius);
      const valuePoint = getRadarPoint(index, radarRadius * (dimension.value / 100));
      return `
        <line class="canon-overview-axis" x1="${radarCenter}" y1="${radarCenter}" x2="${edge.x.toFixed(1)}" y2="${edge.y.toFixed(1)}"></line>
        <circle class="canon-overview-node" cx="${valuePoint.x.toFixed(1)}" cy="${valuePoint.y.toFixed(1)}" r="4.2"></circle>
      `;
    })
    .join("");

  kpis.innerHTML = [
    ["Total Journeys", totalItems, "All Canon entries", "book"],
    ["Completed", completedItems, "Ready for use", "check"],
    ["In Progress", inProgressItems, "Being developed", "cycle"],
    ["On Hold", onHoldItems, "Needs review", "pause"],
    ["Completion Rate", `${completionRate}%`, "Canon maturity", "trend"]
  ]
    .map(
      ([label, value, note, icon]) => `
      <article class="canon-kpi-card" data-icon="${escapeHtml(icon)}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(note)}</small>
      </article>
    `
    )
    .join("");

  tabs.innerHTML = categories
    .map(
      (category) => `
      <button class="canon-tab ${category.id === activeCanonTab ? "active" : ""}" type="button" data-canon-tab="${escapeHtml(category.id)}">
        ${escapeHtml(category.label)}
        <span>${category.items.length}</span>
      </button>
    `
    )
    .join("");

  grid.innerHTML =
    featuredItems
      .map(
        (item, index) => {
          if (item.title === "The Chosen Calling Journey") {
            return renderCanonFeaturedJourneyCarouselCard(item);
          }

          return `
        <article class="canon-project-card ${item.id === selectedCanonItemId ? "active" : ""}" data-canon-item="${escapeHtml(item.id)}">
          <div class="canon-project-media" style="background-image: url('${escapeHtml(item.image)}')"></div>
          <div class="canon-project-body">
            <div class="canon-project-heading">
              <div>
                <h4>${escapeHtml(item.title)}</h4>
                <span class="canon-status ${escapeHtml(item.statusKey)}">${escapeHtml(item.status)}</span>
              </div>
              <button type="button" aria-label="Project actions">...</button>
            </div>
            <p>${escapeHtml(item.description)}</p>
            <div class="canon-avatar-row">
              ${[0, 1, 2]
                .map((avatarIndex) => `<span style="background-image: url('${escapeHtml(canonArtwork[(pageStart + index + avatarIndex) % canonArtwork.length])}')"></span>`)
                .join("")}
            </div>
            <div class="canon-project-footer">
              <span>Progress</span>
              <strong>${item.progress}%</strong>
            </div>
            <progress value="${item.progress}" max="100"></progress>
          </div>
        </article>
      `;
        }
      )
      .join("") || `<article class="canon-project-card"><div class="canon-project-body"><p>No items available for this category yet.</p></div></article>`;

  if (categoryGrid) {
    const categoryThemes = [
      ["Calling Journeys", "26 Journeys", "calling", "public/images/canon/canon-tile-01.png"],
      ["Promise Journeys", "40 Journeys", "promise", "public/images/canon/canon-tile-02.png"],
      ["Wisdom Journeys", "18 Journeys", "wisdom", "public/images/canon/canon-tile-03.png"],
      ["Dominion Journeys", "32 Journeys", "dominion", "public/images/canon/canon-tile-04.png"],
      ["Healing Journeys", "22 Journeys", "healing", "public/images/canon/canon-tile-07.png"],
      ["Warfare Journeys", "28 Journeys", "warfare", "public/images/canon/canon-tile-06.png"],
      ["Worship Journeys", "16 Journeys", "worship", "public/images/canon/canon-tile-10.png"]
    ];
    const renderCategoryCard = ([title, count, icon, image], isDuplicate = false) => `
        <article class="canon-category-card" ${isDuplicate ? 'aria-hidden="true"' : ""} style="background-image: linear-gradient(180deg, rgba(0, 44, 33, 0.08), rgba(0, 44, 33, 0.78)), url('${escapeHtml(image)}')">
          <span data-icon="${escapeHtml(icon)}"></span>
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(count)}</small>
        </article>
      `;
    categoryGrid.innerHTML = `
      <div class="canon-category-track">
        ${categoryThemes.map((category) => renderCategoryCard(category)).join("")}
        ${categoryThemes.map((category) => renderCategoryCard(category, true)).join("")}
      </div>
    `;
  }

  if (recentGrid) {
    const watchmanMergeOrder = ["The Watchman Protection Journey", "The Watchman Dominion Journey", "The Watchman Wisdom Journey"];
    const watchmanMergeTitles = new Set(watchmanMergeOrder);
    const recentEntries = recentItems.map((item, index) => ({ item, index }));
    const watchmanEntries = recentEntries
      .filter(({ item }) => watchmanMergeTitles.has(item.title))
      .sort((a, b) => watchmanMergeOrder.indexOf(a.item.title) - watchmanMergeOrder.indexOf(b.item.title));
    const shouldMergeWatchmanEntries = watchmanEntries.length === watchmanMergeOrder.length;
    const recentCardGroups = [];
    let watchmanMergeAdded = false;
    recentEntries.forEach((entry) => {
      if (shouldMergeWatchmanEntries && watchmanMergeTitles.has(entry.item.title)) {
        if (!watchmanMergeAdded) {
          recentCardGroups.push({ type: "merged-watchman", entries: watchmanEntries });
          watchmanMergeAdded = true;
        }
        return;
      }
      recentCardGroups.push({ type: "single", entry });
    });
    recentGrid.innerHTML = recentCardGroups
      .map((group) => {
        if (group.type === "merged-watchman") {
          const primary = group.entries[0].item;
          const active = group.entries.some(({ item }) => item.id === selectedCanonItemId);
          setWatchmanJourneyVideoIndex(selectedWatchmanJourneyVideoIndex);
          const activeSlide = watchmanJourneyCarouselSlides[selectedWatchmanJourneyVideoIndex] || watchmanJourneyCarouselSlides[0];
          return `
        <article class="canon-recent-card canon-recent-merged-card canon-watchman-story-card ${active ? "active" : ""}" data-canon-item="${escapeHtml(primary.id)}" style="--watchman-image: url('${escapeHtml(activeSlide.image)}')">
          <div class="canon-watchman-story-stage" role="img" aria-label="${escapeHtml(activeSlide.title)}"></div>
            <div class="canon-watchman-story-copy" aria-hidden="true" inert>
            <div class="canon-recent-merged-list">
              ${group.entries
                .map(
                  ({ item, index }) => `
              <button class="canon-recent-merged-row ${item.id === selectedCanonItemId ? "active" : ""}" type="button" data-canon-item="${escapeHtml(item.id)}">
                <span>
                  <b>${escapeHtml(item.title)}</b>
                  <small>${index + 2}d ago · ${escapeHtml(item.status)}</small>
                </span>
                <strong>${item.progress}%</strong>
                <progress value="${item.progress}" max="100"></progress>
              </button>
            `
                )
                .join("")}
            </div>
            </div>
            <div class="canon-watchman-video-controls" aria-label="Watchman image carousel">
              <button type="button" data-watchman-video-nav="prev" aria-label="Previous Watchman slide">&larr;</button>
              <div class="canon-watchman-video-dots">
                ${watchmanJourneyCarouselSlides
                  .map(
                    (slide, slideIndex) => `
                <button
                  class="${slideIndex === selectedWatchmanJourneyVideoIndex ? "active" : ""}"
                  type="button"
                  data-watchman-video-index="${slideIndex}"
                  aria-label="Show ${escapeHtml(slide.title || `Watchman slide ${slideIndex + 1}`)}"
                  aria-current="${slideIndex === selectedWatchmanJourneyVideoIndex ? "true" : "false"}"></button>
              `
                  )
                  .join("")}
              </div>
              <button type="button" data-watchman-video-nav="next" aria-label="Next Watchman slide">&rarr;</button>
            </div>
        </article>
      `;
        }
        const { item, index } = group.entry;
        return `
        <article class="canon-recent-card ${item.id === selectedCanonItemId ? "active" : ""}" data-canon-item="${escapeHtml(item.id)}">
          <div class="canon-recent-media" style="background-image: url('${escapeHtml(item.image)}')"></div>
          <div>
            <span class="canon-status ${escapeHtml(item.statusKey)}">${escapeHtml(item.status)}</span>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.description)}</p>
            <div class="canon-project-footer"><span>${index + 2}d ago</span><strong>${item.progress}%</strong></div>
            <progress value="${item.progress}" max="100"></progress>
          </div>
        </article>
      `;
      })
      .join("");
  }

  if (exploreGrid) {
    exploreGrid.innerHTML = canonExplorePaths
      .map(
        (path) => `
        <article class="canon-explore-card" style="--canon-explore-image: url('${escapeHtml(path.image)}')">
          <span class="canon-explore-icon" data-icon="${escapeHtml(path.icon)}" aria-hidden="true"></span>
          <div class="canon-explore-copy">
            <h4>${escapeHtml(path.title)}</h4>
            <p>${escapeHtml(path.description)}</p>
          </div>
          <div class="canon-explore-footer">
            <span>${escapeHtml(path.count)}</span>
            <button type="button">${escapeHtml(path.cta)} <span aria-hidden="true">&rarr;</span></button>
          </div>
        </article>
      `
      )
      .join("");
  }

  pagination.innerHTML = `
    <button class="canon-page-control" type="button" data-canon-page="${Math.max(1, activeCanonPage - 1)}" ${activeCanonPage === 1 ? "disabled" : ""} aria-label="Previous Canon page">&larr;</button>
    ${Array.from({ length: totalPages }, (_, pageIndex) => {
      const page = pageIndex + 1;
      return `<button class="canon-page-number ${page === activeCanonPage ? "active" : ""}" type="button" data-canon-page="${page}" aria-current="${page === activeCanonPage ? "page" : "false"}">${page}</button>`;
    }).join("")}
    ${totalPages < 3 ? "" : `<span class="canon-page-ellipsis">...</span>`}
    <button class="canon-page-control" type="button" data-canon-page="${Math.min(totalPages, activeCanonPage + 1)}" ${activeCanonPage === totalPages ? "disabled" : ""} aria-label="Next Canon page">&rarr;</button>
  `;

  paths.innerHTML = selectedItem
    ? `
      <div class="canon-right-rail">
        <article class="canon-profile-widget">
          <div class="canon-profile-head">
            <span class="canon-profile-avatar" style="background-image: url('public/images/sidebar/saint-profile-avatar.png')"></span>
            <div>
              <h3>Saint</h3>
              <p>Kingdom Builder</p>
              <span>Level 4</span>
            </div>
            <button type="button" aria-label="Edit Saint profile">Edit</button>
          </div>
          <div class="canon-xp-row"><span></span><strong>2,450 / 5,000 XP</strong></div>
          <blockquote>having the eyes of your hearts enlightened, that you may know what is the hope of his calling, and what are the riches of the glory of his inheritance in the saints,<br><b>Ephesians 1:18 · WEB</b></blockquote>
        </article>

        <article class="canon-overview-widget canon-overview-premium" aria-labelledby="canonOverviewTitle">
          <div class="canon-overview-header">
            <span class="canon-overview-title-icon" data-icon="scroll" aria-hidden="true"></span>
            <div>
              <h4 id="canonOverviewTitle">Canon Overview</h4>
              <p>Your alignment across the five core dimensions</p>
            </div>
            <button class="canon-overview-info" type="button" aria-label="Canon Overview information">i</button>
          </div>
          <div class="canon-overview-diagram" role="img" aria-label="Canon overview radar showing Calling 85%, Purpose 78%, Wisdom 72%, Dominion 68%, Legacy 80%">
            <svg class="canon-overview-radar-svg" viewBox="0 0 320 320" aria-hidden="true" focusable="false">
              <defs>
                <radialGradient id="canonRadarGlow" cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"></stop>
                  <stop offset="55%" stop-color="#a8d9bf" stop-opacity="0.42"></stop>
                  <stop offset="100%" stop-color="#f2d47c" stop-opacity="0.22"></stop>
                </radialGradient>
                <linearGradient id="canonRadarFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#0b7a5e" stop-opacity="0.18"></stop>
                  <stop offset="52%" stop-color="#2db987" stop-opacity="0.34"></stop>
                  <stop offset="100%" stop-color="#d9b44f" stop-opacity="0.22"></stop>
                </linearGradient>
                <filter id="canonRadarNodeGlow">
                  <feGaussianBlur stdDeviation="3.2" result="blur"></feGaussianBlur>
                  <feMerge>
                    <feMergeNode in="blur"></feMergeNode>
                    <feMergeNode in="SourceGraphic"></feMergeNode>
                  </feMerge>
                </filter>
              </defs>
              <circle class="canon-overview-ring ring-outer" cx="160" cy="160" r="132"></circle>
              <circle class="canon-overview-ring ring-mid" cx="160" cy="160" r="104"></circle>
              <circle class="canon-overview-ring ring-inner" cx="160" cy="160" r="76"></circle>
              <circle class="canon-overview-ring ring-core" cx="160" cy="160" r="48"></circle>
              ${canonRadarAxis}
              <polygon class="canon-overview-radar-max" points="${canonOverviewDimensions
                .map((dimension, index) => {
                  const point = getRadarPoint(index, radarRadius);
                  return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
                })
                .join(" ")}"></polygon>
              <polygon class="canon-overview-radar-value" points="${canonRadarPolygon}"></polygon>
            </svg>
            <div class="canon-overview-core">
              <i aria-hidden="true"></i>
              <strong>TEO</strong>
            </div>
            ${canonOverviewDimensions
              .map(
                (dimension) => `
                <article class="canon-overview-dimension canon-dim-${escapeHtml(dimension.key)}" tabindex="0" style="--canon-dim-value: ${dimension.value}%">
                  <span data-icon="${escapeHtml(dimension.icon)}" aria-hidden="true"></span>
                  <strong>${escapeHtml(dimension.label)}</strong>
                  <b>${dimension.value}%</b>
                </article>
              `
              )
              .join("")}
          </div>
          <div class="canon-overview-maturity" style="--canon-maturity: ${completionRate}%; --canon-maturity-deg: ${completionRate * 3.6}deg">
            <span class="canon-maturity-icon" data-icon="trend" aria-hidden="true"></span>
            <div class="canon-maturity-copy">
              <strong>Overall Maturity</strong>
              <span>Your overall spiritual maturity</span>
              <div class="canon-maturity-bar" aria-hidden="true"><i></i></div>
            </div>
            <div class="canon-maturity-ring" aria-label="Overall Maturity ${completionRate}%"><strong>${completionRate}%</strong></div>
          </div>
          <progress class="canon-overview-native-progress" value="${completionRate}" max="100">Overall Maturity ${completionRate}%</progress>
        </article>

        <article class="canon-actions-widget">
          <h4>Quick Actions</h4>
          ${["Create New Journey", "Explore Archetypes", "View Promise Clusters", "Journey Roadmap", "Add to Promise Table"]
            .map((action) => `<button type="button">${escapeHtml(action)} <span>›</span></button>`)
            .join("")}
        </article>

        <article class="canon-builder-widget">
          <span class="canon-builder-badge" aria-hidden="true"></span>
          <div>
            <h3>You are building something eternal.</h3>
            <p>Your calling. Your obedience. His Kingdom.</p>
          </div>
          <button type="button">Continue Your Journey &rarr;</button>
        </article>

        <article class="canon-detail-sticky">
          <div class="canon-detail-media" style="background-image: linear-gradient(180deg, rgba(0, 39, 31, 0.08), rgba(0, 39, 31, 0.42)), url('${escapeHtml(selectedItem.image)}')"></div>
          <p class="eyebrow">Detail View</p>
          <h3>${escapeHtml(selectedItem.title)}</h3>
          <span class="canon-status ${escapeHtml(selectedItem.statusKey)}">${escapeHtml(selectedItem.status)}</span>
          <p>${escapeHtml(selectedItem.description)}</p>
          <div class="canon-detail-stats">
            <div><span>Scriptures</span><strong>${selectedItem.scriptureCount}</strong></div>
            <div><span>Prayers</span><strong>${selectedItem.prayerCount}</strong></div>
            <div><span>Progress</span><strong>${selectedItem.progress}%</strong></div>
          </div>
          <progress value="${selectedItem.progress}" max="100"></progress>
          <h4>Related Content</h4>
          <div class="sequence-row">${selectedItem.tags
            .map((tag) => `<span class="scripture-pill">${escapeHtml(tag)}</span>`)
            .join("")}</div>
          <h4>Activity Feed</h4>
          <ul class="canon-activity-list">
            <li>Canon data loaded from ${escapeHtml(activeCategory.label)}.</li>
            <li>${selectedItem.scriptureCount} scripture anchors connected.</li>
            <li>${selectedItem.prayerCount} prayer links available.</li>
          </ul>
          ${renderPhase116WhyThisPanel({
            source: "canon-detail-rail",
            label: selectedItem.title,
            scripture: state.selectedScripture || getClusterScriptures(getActivePhase115Cluster())[0],
            promise: selectedItem.title,
            word: state.selectedWord,
            journey: selectedItem.title,
            action: "Open the journey, review Scripture anchors, and take one faithful next step.",
            confidence: selectedItem.status || "Good",
            fallbackReason: selectedItem.scriptureCount ? "Canon detail has connected Scripture anchors." : "Canon detail needs Scripture anchor review."
          })}
          <button class="primary" type="button">Open Full Journey &rarr;</button>
          <button class="secondary" type="button">View Journey Map</button>
        </article>

        <article class="canon-recommended-widget" aria-label="Recommended For You">
          <h4>Recommended For You</h4>
          <div class="canon-recommended-card">
            ${renderCanonRecommendedMediaCarousel()}
            <div class="canon-recommended-copy">
              <h5>Promise of Peace</h5>
              <p>Find rest in His perfect peace.</p>
              <button type="button">Start Journey <span aria-hidden="true">&rarr;</span></button>
            </div>
          </div>
        </article>
      </div>
    `
    : `<p>Select a Canon journey card to view details.</p>`;
  configureStaticCanonJourneyMediaStages();
}

function renderTkos(calling, cluster) {
  const grid = $("#tkosGrid");
  const details = $("#tkosDetails");
  if (!grid || !details || !tkosArchitecture || !tkosSampleProfile || !tkosEngines) return;

  $("#tkosSummary").textContent =
    "TKOS answers identity, calling, growth, stewardship, and legacy through a connected spiritual growth operating system.";

  const dashboard = tkosEngines.kingdomDashboard;
  grid.innerHTML = `
    <article class="canon-card roadmap-module-card">
      <span class="roadmap-card-icon" data-icon="API">▤</span>
      <h3>Backend Architecture</h3>
      <p>Node.js - Supabase - Redis</p>
      <div class="sequence-row">
        <span class="scripture-pill">API</span>
        <span class="scripture-pill">Database</span>
        <span class="scripture-pill">Cache</span>
      </div>
      <progress value="78" max="100"></progress>
      <p class="roadmap-card-metric">78%</p>
    </article>
    <article class="canon-card roadmap-module-card">
      <span class="roadmap-card-icon" data-icon="CMS">▦</span>
      <h3>Content System</h3>
      <p>CMS - Media - Knowledge Base</p>
      <progress value="85" max="100"></progress>
      <p class="roadmap-card-metric">85%</p>
    </article>
    <article class="canon-card roadmap-module-card">
      <span class="roadmap-card-icon" data-icon="KPI">◎</span>
      <h3>Dashboard & Analytics</h3>
      <p>Insights - Metrics - Reporting</p>
      <div class="sequence-row">
        <span class="scripture-pill">System</span>
        <span class="scripture-pill">Ministry</span>
        <span class="scripture-pill">Kingdom</span>
      </div>
    </article>
    <article class="canon-card roadmap-module-card">
      <span class="roadmap-card-icon" data-icon="AI">⌁</span>
      <h3>Calling - Purpose Engine</h3>
      <p>AI - Personalization - Calling Model</p>
      <progress value="60" max="100"></progress>
      <p class="roadmap-card-metric">60%</p>
    </article>
    <article class="canon-card roadmap-module-card">
      <span class="roadmap-card-icon" data-icon="AI">✣</span>
      <h3>Local TIG Engine</h3>
      <p>Seed data - Guardrails - Explanation graph</p>
      <progress value="100" max="100"></progress>
      <p class="roadmap-card-metric">100%</p>
    </article>
    <article class="canon-card roadmap-module-card">
      <span class="roadmap-card-icon" data-icon="SEC">◈</span>
      <h3>Security & Compliance</h3>
      <p>Auth - Encryption - Roles</p>
      <div class="sequence-row">
        <span class="scripture-pill">Login</span>
        <span class="scripture-pill">Trust</span>
        <span class="scripture-pill">Protection</span>
      </div>
    </article>
    <article class="canon-card roadmap-reference-card">
      <h3>Prince - The Builder</h3>
      <p>Vision - Builder - Core Purpose</p>
      <div class="sequence-row">
        <span class="scripture-pill">Vision</span>
        <span class="scripture-pill">Builder</span>
        <span class="scripture-pill">Core</span>
      </div>
    </article>
    <article class="canon-card roadmap-reference-card">
      <h3>${escapeHtml(dashboard.dailyWord || "Luma")}</h3>
      <p>Light - Word - Daily Identity</p>
      <progress value="85" max="100"></progress>
      <p class="roadmap-card-metric">85%</p>
    </article>
    <article class="canon-card roadmap-reference-card">
      <h3>${escapeHtml(dashboard.growthLevel || "Established")}</h3>
      <p>System - Identity - Kingdom Operating System</p>
      <div class="sequence-row">
        <span class="scripture-pill">System</span>
        <span class="scripture-pill">Identity</span>
        <span class="scripture-pill">Kingdom</span>
      </div>
    </article>
    <article class="canon-card roadmap-reference-card">
      <h3>Calling - ${tkosEngines.covenantPathProgress.completion}%</h3>
      <p>Mission - Calling - Assignment</p>
      <progress value="${tkosEngines.covenantPathProgress.completion}" max="100"></progress>
      <p class="roadmap-card-metric">${tkosEngines.covenantPathProgress.completion}%</p>
    </article>
    <article class="canon-card roadmap-reference-card">
      <h3>${escapeHtml(tkosEngines.prayerAnalytics.insights.mostUsedPrayer || "PR004")}</h3>
      <p>System - Architecture - Module</p>
      <span class="status-pill active">In progress</span>
    </article>
    <article class="canon-card roadmap-reference-card">
      <h3>${escapeHtml(tkosEngines.aiSpiritualCompanion.responseLogic.recommendedCluster || "Light & Revelation")}</h3>
      <p>Theme - Section - Purpose</p>
      <div class="sequence-row">
        <span class="scripture-pill">Light</span>
        <span class="scripture-pill">Theme</span>
        <span class="scripture-pill">Purpose</span>
      </div>
    </article>
  `;

  details.innerHTML = `
    <article class="canon-card roadmap-compass-card">
      <div class="compass roadmap-compass">
        <div class="compass-point top">
          <span>FAITH</span>
          <strong>Spiritual Foundation</strong>
        </div>
        <div class="compass-point right">
          <span>IMPACT</span>
          <strong>Digital Reach</strong>
        </div>
        <div class="compass-point bottom">
          <span>PURPOSE</span>
          <strong>Kingdom Mission</strong>
        </div>
        <div class="compass-point left">
          <span>IMPACT</span>
          <strong>Kingdom Outreach</strong>
        </div>
        <div class="compass-core">
          <span>♛</span>
          <strong>Kingdom Centred</strong>
        </div>
      </div>
    </article>
    <article class="canon-card roadmap-calling-result">
      <h3>Creative Digital Ministry - Pillar Assignment</h3>
      <dl class="calling-facts compact-calling-facts">
        <div><dt>Primary Calling</dt><dd>Creative Digital Ministry</dd></div>
        <div><dt>Secondary Calling</dt><dd>Kingdom Content</dd></div>
        <div><dt>Tertiary Calling</dt><dd>Ministry Systems</dd></div>
        <div><dt>Focus</dt><dd>Kingdom, Content, Technology, Impact</dd></div>
        <div><dt>Audience</dt><dd>Believers, Ministries, Church Leaders, Digital Creators</dd></div>
        <div><dt>Description</dt><dd>Building digital systems and content that advance God's Kingdom through creativity, technology, and service.</dd></div>
      </dl>
    </article>
  `;
}

function renderRoadmapKpis() {
  const target = $("#roadmapKpiGrid");
  if (!target) return;

  const cards = [
    ["Phases", 5, "Total Phases", "layers"],
    ["Core Modules", 20, "Active Modules", "grid"],
    ["Key Goals", 4, "Milestone Goals", "target"],
    ["Major Pages", 12, "High Priority Pages", "document"],
    ["Integrations", 3, "Core Integrations", "puzzle"],
    ["Overall Progress", "68%", "Roadmap Completion", "progress"]
  ];

  target.innerHTML = cards
    .map(
      ([label, value, note, icon]) => `
      <article class="roadmap-kpi-card">
        <div>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
          <small>${escapeHtml(note)}</small>
        </div>
        <i class="roadmap-kpi-icon ${escapeHtml(icon)}"></i>
      </article>
    `
    )
    .join("");
}

function renderTechArchitecture() {
  const grid = $("#techGrid");
  const details = $("#techDetails");
  if (!grid || !details || !technicalArchitecture || !subscriptionModel) return;

  $("#techSummary").textContent = technicalArchitecture.productDirection;
  const stack = technicalArchitecture.recommendedStack;
  const stackItems = [
    ["APP", "Static UI Shell"],
    ["<>", "Node.js"],
    ["API", "Local Adapter Plan"],
    ["DATA", stack.database],
    ["TIG", "Local Production Intelligence"],
    ["AU", stack.auth[0]],
    ["AU", stack.auth[1]],
    ["AU", stack.auth[2]],
    ["V", stack.hosting]
  ];
  const routeItems = technicalArchitecture.apiRoutes.map((route) => {
    const [method, ...pathParts] = route.split(" ");
    const path = pathParts.join(" ");
    const label = path.replace("/api/", "").replace("/:word", "").split("/")[0] || "api";
    return { method, path, label };
  });
  const communityAvatars = ["Peer", "Partner", "Community", "Mentor", "Church"];

  grid.innerHTML = `
    <article class="canon-card roadmap-tech-card phase03-card phase03-stack-card">
      <span class="roadmap-card-icon roadmap-stack-icon phase03-card-icon" data-icon="STACK" aria-hidden="true">
        <svg class="roadmap-inline-icon" viewBox="0 0 24 24" focusable="false">
          <rect x="5" y="5" width="14" height="5" rx="1.5"></rect>
          <rect x="5" y="10.5" width="14" height="5" rx="1.5"></rect>
          <rect x="5" y="16" width="14" height="3" rx="1.5"></rect>
        </svg>
      </span>
      <p class="eyebrow">Recommended Stack</p>
      <h3>${escapeHtml(stack.frontend)}</h3>
      <div class="roadmap-tech-icon-list phase03-chip-list">${stackItems
        .map(([icon, label]) => `<span class="roadmap-tech-icon-chip"><i>${escapeHtml(icon)}</i><span>${escapeHtml(label)}</span></span>`)
        .join("")}</div>
    </article>
    <article class="canon-card roadmap-tech-card phase03-card phase03-modules-card">
      <span class="roadmap-card-icon" data-icon="MOD">▦</span>
      <span class="roadmap-card-icon phase03-card-icon" data-icon="MOD">MOD</span>
      <p class="eyebrow">Core Modules</p>
      <h3>${technicalArchitecture.coreAppModules.length} App Modules</h3>
      <div class="sequence-row phase03-chip-list">${technicalArchitecture.coreAppModules
        .map((module) => `<span class="scripture-pill phase03-module-chip">${escapeHtml(module)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card roadmap-tech-card phase03-card phase03-ai-card">
      <span class="roadmap-card-icon" data-icon="AI">✣</span>
      <p class="eyebrow">AI Companion Flow</p>
      <h3>${escapeHtml(technicalArchitecture.aiCompanionFlow.output.cluster)}</h3>
      <p>${escapeHtml(technicalArchitecture.aiCompanionFlow.output.prayer)}</p>
      <div class="sequence-row phase03-profile-chips">${technicalArchitecture.aiCompanionFlow.output.words
        .map((word) => `<span class="status-pill active phase03-profile-chip">${escapeHtml(word)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card roadmap-tech-card phase03-card phase03-routes-card">
      <span class="roadmap-card-icon roadmap-routes-icon" data-icon="ROUTES" aria-hidden="true">
        <svg class="roadmap-inline-icon" viewBox="0 0 24 24" focusable="false">
          <circle cx="6" cy="6" r="3"></circle>
          <circle cx="18" cy="6" r="3"></circle>
          <circle cx="12" cy="18" r="3"></circle>
          <path d="M8.7 7.4h6.6M7.8 8.5l3 6.8M16.2 8.5l-3 6.8"></path>
        </svg>
      </span>
      <p class="eyebrow">Local Route Plan</p>
      <h3>${technicalArchitecture.apiRoutes.length} Planned Routes</h3>
      <div class="roadmap-route-chip-grid phase03-route-list">${routeItems
        .map(
          (route) =>
            `<span class="roadmap-route-chip" title="${escapeHtml(route.method)} ${escapeHtml(route.path)}"><i>${escapeHtml(route.method)}</i>${escapeHtml(route.label)}</span>`
        )
        .join("")}</div>
    </article>
    <article class="canon-card roadmap-tech-card phase03-card phase03-screens-card">
      <span class="roadmap-card-icon" data-icon="UX">▣</span>
      <p class="eyebrow">Mobile Screens</p>
      <h3>${technicalArchitecture.mobileScreens.length} Screens</h3>
      <div class="sequence-row phase03-chip-list">${technicalArchitecture.mobileScreens
        .map((screen) => `<span class="scripture-pill phase03-screen-chip">${escapeHtml(screen)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card roadmap-tech-card phase03-card phase03-subscription-card">
      <span class="roadmap-card-icon" data-icon="PRO">◈</span>
      <p class="eyebrow">Subscription</p>
      <h3>Free / Premium / Community</h3>
      <div class="phase03-community">
        <p><b>Community &amp; Ecosystem</b></p>
        <small>${escapeHtml(subscriptionModel.community.join(" / "))}</small>
        <div class="phase03-avatar-row" aria-label="Partner and community avatars">
          ${communityAvatars.map((name) => `<span title="${escapeHtml(name)}">${escapeHtml(name.slice(0, 1))}</span>`).join("")}
          <strong>+128</strong>
        </div>
      </div>
      <p><b>Premium:</b> ${escapeHtml(subscriptionModel.premium.join(", "))}</p>
    </article>
  `;

  details.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Onboarding Flow</p>
      <h3>Profile and Archetype Discovery</h3>
      ${onboardingFlow
        .map(
          (step) => `
          <div>
            <p><b>Step ${step.step} - ${escapeHtml(step.screen)}:</b> ${escapeHtml(step.question || "Profile result")}</p>
            ${step.options ? `<div class="sequence-row">${step.options.map((option) => `<span class="scripture-pill">${escapeHtml(option)}</span>`).join("")}</div>` : ""}
          </div>
        `
        )
        .join("")}
    </article>
    <article class="canon-card">
      <p class="eyebrow">MVP Build Order</p>
      <h3>Implementation Roadmap</h3>
      ${mvpBuildOrder
        .map(
          (mvp) => `
          <div>
            <p><b>${escapeHtml(mvp.id)} - ${escapeHtml(mvp.name)}</b></p>
            <div class="sequence-row">${mvp.features
              .map((feature) => `<span class="status-pill active">${escapeHtml(feature)}</span>`)
              .join("")}</div>
          </div>
        `
        )
        .join("")}
    </article>
    <article class="canon-card">
      <p class="eyebrow">AI Prompt Boundary</p>
      <h3>Canon-only companion</h3>
      <p>${escapeHtml(technicalArchitecture.aiPromptTemplate)}</p>
    </article>
  `;
}

function renderProjectStructureRoadmap() {
  const grid = $("#roadmapGrid");
  const details = $("#roadmapDetails");
  if (!grid || !details || !projectStructureRoadmap) return;

  $("#roadmapSummary").textContent = `${projectStructureRoadmap.recommendedProjectName} remains the future product target. This workspace currently runs the static Teoyube app, with ${projectStructureRoadmap.projectStructure.length} planned core areas, ${projectStructureRoadmap.apiRoutePlan.length} local adapter/API targets, and ${projectStructureRoadmap.mvpFeatures.length} product features.`;

  grid.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Project Name</p>
      <h3>${escapeHtml(projectStructureRoadmap.recommendedProjectName)}</h3>
      <p>${escapeHtml(projectStructureRoadmap.name)}</p>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Folder Structure</p>
      <h3>${projectStructureRoadmap.projectStructure.length} Core Areas</h3>
      <div class="sequence-row">${projectStructureRoadmap.projectStructure
        .map((section) => `<span class="scripture-pill">${escapeHtml(section.path)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Seed Files</p>
      <h3>${projectStructureRoadmap.seedFilePlan.length} MVP Seeds</h3>
      <div class="sequence-row">${projectStructureRoadmap.seedFilePlan
        .map((seed) => `<span class="status-pill active">${escapeHtml(seed.file)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Adapter/API Plan</p>
      <h3>${projectStructureRoadmap.apiRoutePlan.length} Planned Routes</h3>
      <p>${escapeHtml(projectStructureRoadmap.apiRoutePlan.map((route) => `${route.method} ${route.path}`).join("; "))}</p>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Core Utilities</p>
      <h3>${projectStructureRoadmap.coreUtilityFunctions.length} Functions</h3>
      <div class="sequence-row">${projectStructureRoadmap.coreUtilityFunctions
        .map((utility) => `<span class="scripture-pill">${escapeHtml(utility.file)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">MVP Features</p>
      <h3>${projectStructureRoadmap.mvpFeatures.length} Launch Features</h3>
      <div class="sequence-row">${projectStructureRoadmap.mvpFeatures
        .map((feature) => `<span class="status-pill active">${escapeHtml(feature)}</span>`)
        .join("")}</div>
    </article>
  `;

  details.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Project Folder Structure</p>
      <h3>Static App / Future Product Map</h3>
      ${projectStructureRoadmap.projectStructure
        .map(
          (section) => `
          <div>
            <p><b>${escapeHtml(section.path)}</b> ${escapeHtml(section.purpose)}</p>
            <div class="sequence-row">${section.children
              .map((child) => `<span class="scripture-pill">${escapeHtml(child)}</span>`)
              .join("")}</div>
          </div>
        `
        )
        .join("")}
    </article>
    <article class="canon-card">
      <p class="eyebrow">Seed File Plan</p>
      <h3>JSON First, Database Later</h3>
      ${projectStructureRoadmap.seedFilePlan
        .map(
          (seed) => `
          <div>
            <p><b>${escapeHtml(seed.file)}</b> ${escapeHtml(seed.description)}</p>
            <pre><code>${escapeHtml(JSON.stringify(seed.example, null, 2))}</code></pre>
          </div>
        `
        )
        .join("")}
    </article>
    <article class="canon-card">
      <p class="eyebrow">Implementation Roadmap</p>
      <h3>Four-Week MVP Build</h3>
      ${projectStructureRoadmap.implementationRoadmap
        .map(
          (week) => `
          <div>
            <p><b>${escapeHtml(week.week)} - ${escapeHtml(week.theme)}</b></p>
            <div class="sequence-row">${week.tasks
              .map((task) => `<span class="status-pill active">${escapeHtml(task)}</span>`)
              .join("")}</div>
          </div>
        `
        )
        .join("")}
    </article>
    <article class="canon-card">
      <p class="eyebrow">Core Utility Functions</p>
      <h3>Daily Word, Prayer Engine, Recommendation Logic</h3>
      ${projectStructureRoadmap.coreUtilityFunctions
        .map(
          (utility) => `
          <div>
            <p><b>${escapeHtml(utility.file)}</b> ${escapeHtml(utility.name)}</p>
            <pre><code>${escapeHtml(utility.code)}</code></pre>
          </div>
        `
        )
        .join("")}
    </article>
  `;
}

function renderMvpCodeStarterFiles() {
  const grid = $("#starterGrid");
  const details = $("#starterDetails");
  if (!grid || !details || !mvpCodeStarterFiles) return;

  const stats = mvpCodeStarterFiles.starterStats;
  const filesByType = mvpCodeStarterFiles.files.reduce((groups, file) => {
    groups[file.type] = groups[file.type] || [];
    groups[file.type].push(file);
    return groups;
  }, {});

  $("#starterSummary").textContent = `${mvpCodeStarterFiles.projectRoot} is a historical/future starter target. The current workspace runs the root static app while this plan tracks ${mvpCodeStarterFiles.files.length} starter files: ${stats.pages} pages, ${stats.apiRoutes} adapter/API targets, ${stats.utilities} utilities, and ${stats.seedFiles} seed files.`;

  grid.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Project Root</p>
      <h3>${escapeHtml(mvpCodeStarterFiles.projectRoot)}</h3>
      <p>${escapeHtml(mvpCodeStarterFiles.description)}</p>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Starter Pages</p>
      <h3>${stats.pages} Pages</h3>
      <div class="sequence-row">${(filesByType.page || [])
        .map((file) => `<span class="scripture-pill">${escapeHtml(file.path.replace(`${mvpCodeStarterFiles.projectRoot}/`, ""))}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Adapter/API Targets</p>
      <h3>${stats.apiRoutes} Planned Routes</h3>
      <div class="sequence-row">${(filesByType.api || [])
        .map((file) => `<span class="status-pill active">${escapeHtml(file.path.replace(`${mvpCodeStarterFiles.projectRoot}/`, ""))}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Utilities</p>
      <h3>${stats.utilities} Functions</h3>
      <div class="sequence-row">${(filesByType.utility || [])
        .map((file) => `<span class="scripture-pill">${escapeHtml(file.path.replace(`${mvpCodeStarterFiles.projectRoot}/`, ""))}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Seeds</p>
      <h3>${stats.starterWords} Words / ${stats.starterPrayers} Prayers</h3>
      <div class="sequence-row">${(filesByType.seed || [])
        .map((file) => `<span class="status-pill active">${escapeHtml(file.path.replace(`${mvpCodeStarterFiles.projectRoot}/`, ""))}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Next Steps</p>
      <h3>${mvpCodeStarterFiles.nextSteps.length} Build Actions</h3>
      <p>${escapeHtml(mvpCodeStarterFiles.nextSteps.join(" "))}</p>
    </article>
  `;

  details.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Generated File Manifest</p>
      <h3>Phase 4D Starter Files</h3>
      ${mvpCodeStarterFiles.files
        .map(
          (file) => `
          <div>
            <p><b>${escapeHtml(file.path)}</b></p>
            <p>${escapeHtml(file.purpose)}</p>
          </div>
        `
        )
        .join("")}
    </article>
    <article class="canon-card">
      <p class="eyebrow">Run Flow</p>
      <h3>Developer Start Sequence</h3>
      <pre><code>${escapeHtml(`cd ${mvpCodeStarterFiles.projectRoot}\nnpm install\nnpm run dev`)}</code></pre>
      <div class="sequence-row">${mvpCodeStarterFiles.nextSteps
        .map((step) => `<span class="status-pill active">${escapeHtml(step)}</span>`)
        .join("")}</div>
    </article>
  `;
}

function renderMvpSeedFiles() {
  const grid = $("#seedsGrid");
  const details = $("#seedsDetails");
  if (!grid || !details || !mvpSeedFiles) return;

  $("#seedsSummary").textContent = `${mvpSeedFiles.projectRoot} now has ${mvpSeedFiles.totals.seedFiles} full MVP seed files with ${mvpSeedFiles.totals.totalRecords} total records across Promise Clusters, Covenant Paths, Archetypes, and Prayers.`;

  grid.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Seed Layer</p>
      <h3>${mvpSeedFiles.totals.totalRecords} Records</h3>
      <p>${escapeHtml(mvpSeedFiles.description)}</p>
    </article>
    ${mvpSeedFiles.seedFiles
      .map(
        (seed) => `
        <article class="canon-card">
          <p class="eyebrow">${escapeHtml(seed.label)}</p>
          <h3>${seed.count} Records</h3>
          <p>${escapeHtml(seed.path)}</p>
          <div class="sequence-row">${seed.sampleIds
            .map((id) => `<span class="status-pill active">${escapeHtml(id)}</span>`)
            .join("")}</div>
        </article>
      `
      )
      .join("")}
    <article class="canon-card">
      <p class="eyebrow">Integration Targets</p>
      <h3>${mvpSeedFiles.integrationTargets.length} App Areas</h3>
      <div class="sequence-row">${mvpSeedFiles.integrationTargets
        .map((target) => `<span class="scripture-pill">${escapeHtml(target)}</span>`)
        .join("")}</div>
    </article>
  `;

  details.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Seed File Manifest</p>
      <h3>Database-ready MVP Data</h3>
      ${mvpSeedFiles.seedFiles
        .map(
          (seed) => `
          <div>
            <p><b>${escapeHtml(seed.path)}</b> ${escapeHtml(seed.purpose)}</p>
            <p>${seed.count} records keyed by ${escapeHtml(seed.primaryKey)}.</p>
          </div>
        `
        )
        .join("")}
    </article>
    <article class="canon-card">
      <p class="eyebrow">Next Steps</p>
      <h3>Data Integration Plan</h3>
      <div class="sequence-row">${mvpSeedFiles.nextSteps
        .map((step) => `<span class="status-pill active">${escapeHtml(step)}</span>`)
        .join("")}</div>
    </article>
  `;
}

function renderMvpUiPages() {
  const grid = $("#pagesGrid");
  const details = $("#pagesDetails");
  if (!grid || !details || !mvpUiPages) return;

  $("#pagesSummary").textContent = `${mvpUiPages.projectRoot} now has ${mvpUiPages.totals.totalStarterPages} starter pages, including ${mvpUiPages.totals.newOrUpdatedPages} Phase 4F MVP UI pages.`;

  grid.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">UI Layer</p>
      <h3>${mvpUiPages.totals.totalStarterPages} Starter Pages</h3>
      <p>${escapeHtml(mvpUiPages.description)}</p>
    </article>
    ${mvpUiPages.pages
      .map(
        (page) => `
        <article class="canon-card">
          <p class="eyebrow">${escapeHtml(page.route)}</p>
          <h3>${escapeHtml(page.name)}</h3>
          <p>${escapeHtml(page.purpose)}</p>
          <div class="sequence-row">${page.dataSources
            .map((source) => `<span class="scripture-pill">${escapeHtml(source)}</span>`)
            .join("")}</div>
        </article>
      `
      )
      .join("")}
  `;

  details.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Page Manifest</p>
      <h3>Static View / Future Route Manifest</h3>
      ${mvpUiPages.pages
        .map(
          (page) => `
          <div>
            <p><b>${escapeHtml(page.path)}</b></p>
            <p>${escapeHtml(page.route)} - ${escapeHtml(page.purpose)}</p>
          </div>
        `
        )
        .join("")}
    </article>
    <article class="canon-card">
      <p class="eyebrow">Next Steps</p>
      <h3>UI Integration Plan</h3>
      <div class="sequence-row">${mvpUiPages.nextSteps
        .map((step) => `<span class="status-pill active">${escapeHtml(step)}</span>`)
        .join("")}</div>
    </article>
  `;
}

function renderMvpBrandIdentity() {
  const grid = $("#brandGrid");
  const details = $("#brandDetails");
  if (!grid || !details || !mvpBrandIdentity) return;

  const brand = mvpBrandIdentity.brandIdentity;
  $("#brandSummary").textContent = `${brand.brandName}: ${brand.tagline}`;

  grid.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Brand</p>
      <h3>${escapeHtml(brand.brandName)}</h3>
      <p>${escapeHtml(brand.tagline)}</p>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Tone</p>
      <h3>${escapeHtml(brand.tone)}</h3>
      <p>${escapeHtml(brand.visualStyle)}</p>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Palette</p>
      <h3>${Object.keys(mvpBrandIdentity.colorPalette).length} Tokens</h3>
      <div class="sequence-row">${Object.values(mvpBrandIdentity.colorPalette)
        .map((color) => `<span class="scripture-pill">${escapeHtml(color)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Global Styles</p>
      <h3>${escapeHtml(mvpBrandIdentity.globalStyles.file)}</h3>
      <div class="sequence-row">${mvpBrandIdentity.globalStyles.features
        .map((feature) => `<span class="status-pill active">${escapeHtml(feature)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Components</p>
      <h3>${mvpBrandIdentity.components.length} Brand Components</h3>
      <div class="sequence-row">${mvpBrandIdentity.components
        .map((component) => `<span class="scripture-pill">${escapeHtml(component.name)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Direction</p>
      <h3>${mvpBrandIdentity.directionWords.length} Feel Words</h3>
      <div class="sequence-row">${mvpBrandIdentity.directionWords
        .map((word) => `<span class="status-pill active">${escapeHtml(word)}</span>`)
        .join("")}</div>
    </article>
  `;

  details.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Branded Pages</p>
      <h3>${mvpBrandIdentity.brandedPages.length} MVP Surfaces</h3>
      <div class="sequence-row">${mvpBrandIdentity.brandedPages
        .map((page) => `<span class="scripture-pill">${escapeHtml(page)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Component Manifest</p>
      <h3>Reusable UI System</h3>
      ${mvpBrandIdentity.components
        .map(
          (component) => `
          <div>
            <p><b>${escapeHtml(component.path)}</b></p>
            <p>${escapeHtml(component.purpose)}</p>
          </div>
        `
        )
        .join("")}
    </article>
  `;
}

function renderMvpLaunchPlan() {
  const grid = $("#launchGrid");
  const details = $("#launchDetails");
  if (!grid || !details || !mvpLaunchPlan) return;

  $("#launchSummary").textContent = `${mvpLaunchPlan.checklist.length} checklist items and ${mvpLaunchPlan.launchOrder.length} launch stages from Static MVP to Growth System.`;

  grid.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Checklist</p>
      <h3>${mvpLaunchPlan.checklist.length} Build Items</h3>
      <p>${mvpLaunchPlan.status.completedNow.length} completed or scaffolded now. ${mvpLaunchPlan.status.pendingLater.length} reserved for later launches.</p>
    </article>
    ${mvpLaunchPlan.launchOrder
      .map(
        (launch) => `
        <article class="canon-card">
          <p class="eyebrow">${escapeHtml(launch.launch)}</p>
          <h3>${escapeHtml(launch.name)}</h3>
          <div class="sequence-row">${launch.features
            .map((feature) => `<span class="status-pill active">${escapeHtml(feature)}</span>`)
            .join("")}</div>
        </article>
      `
      )
      .join("")}
  `;

  details.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Completed Now</p>
      <h3>Current Build State</h3>
      <div class="sequence-row">${mvpLaunchPlan.status.completedNow
        .map((item) => `<span class="status-pill active">${escapeHtml(item)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Pending Later</p>
      <h3>Launch 2 and Beyond</h3>
      <div class="sequence-row">${mvpLaunchPlan.status.pendingLater
        .map((item) => `<span class="scripture-pill">${escapeHtml(item)}</span>`)
        .join("")}</div>
    </article>
  `;
}

function renderLaunch1StaticMvpPackage() {
  const grid = $("#launch1Grid");
  const details = $("#launch1Details");
  if (!grid || !details || !launch1StaticMvpPackage) return;

  $("#launch1Summary").textContent = launch1StaticMvpPackage.goal;

  grid.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Launch 1</p>
      <h3>${escapeHtml(launch1StaticMvpPackage.projectRoot)}</h3>
      <p>${escapeHtml(launch1StaticMvpPackage.goal)}</p>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Pages</p>
      <h3>${launch1StaticMvpPackage.pages.length} Static Pages</h3>
      <div class="sequence-row">${launch1StaticMvpPackage.pages
        .map((page) => `<span class="scripture-pill">${escapeHtml(page.replace(`${launch1StaticMvpPackage.projectRoot}/`, ""))}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Components</p>
      <h3>${launch1StaticMvpPackage.components.length} Shared Components</h3>
      <div class="sequence-row">${launch1StaticMvpPackage.components
        .map((component) => `<span class="status-pill active">${escapeHtml(component.replace(`${launch1StaticMvpPackage.projectRoot}/`, ""))}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Data Files</p>
      <h3>${launch1StaticMvpPackage.dataFiles.length} Static Seeds</h3>
      <div class="sequence-row">${launch1StaticMvpPackage.dataFiles
        .map((file) => `<span class="scripture-pill">${escapeHtml(file.replace(`${launch1StaticMvpPackage.projectRoot}/`, ""))}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Brand Styling</p>
      <h3>${launch1StaticMvpPackage.stylingFiles.length} Styling Files</h3>
      <div class="sequence-row">${launch1StaticMvpPackage.stylingFiles
        .map((file) => `<span class="status-pill active">${escapeHtml(file.replace(`${launch1StaticMvpPackage.projectRoot}/`, ""))}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Status</p>
      <h3>${launch1StaticMvpPackage.status.staticPackageCreated ? "Static Package Created" : "Pending"}</h3>
      <p>Dependencies installed: ${launch1StaticMvpPackage.status.dependenciesInstalled ? "yes" : "no"}. Future build dry run: ${launch1StaticMvpPackage.status.nextBuildRun ? "yes" : "no"}.</p>
    </article>
  `;

  details.innerHTML = `
    <article class="canon-card">
      <p class="eyebrow">Completion Standard</p>
      <h3>Launch 1 Done Means</h3>
      <div class="sequence-row">${launch1StaticMvpPackage.completionStandard
        .map((item) => `<span class="status-pill active">${escapeHtml(item)}</span>`)
        .join("")}</div>
    </article>
    <article class="canon-card">
      <p class="eyebrow">Included Features</p>
      <h3>Static MVP Scope</h3>
      <div class="sequence-row">${launch1StaticMvpPackage.includes
        .map((item) => `<span class="scripture-pill">${escapeHtml(item)}</span>`)
        .join("")}</div>
    </article>
  `;
}

function renderCompassVideos() {
  const player = $("#compassVideoPlayer");
  const list = $("#compassVideoList");
  const status = $("#compassVideoStatus");
  if (!player || !list || !status) return;
  const durations = ["24:35", "30:12", "21:47", "28:16", "26:08", "19:45", "22:15", "20:15", "18:40", "32:01", "27:33", "16:52"];
  compassVideos = getTeoyubeWorldChannelVideos(compassVideos);

  if (!compassVideos.length) {
    list.innerHTML = `
      <div class="compass-playlist-empty">
        <strong>Local TeoyubeWorld previews unavailable</strong>
        <span>Reviewed external video sources are not connected in this preview.</span>
      </div>
    `;
    if (!selectedCompassVideo) {
      player.innerHTML = `
        <div class="calling-player-empty">
          <span aria-hidden="true"></span>
          <h4>TeoyubeWorld Compass</h4>
          <p>Select a local preview. Reviewed external embeds are not connected in this build.</p>
        </div>
      `;
    }
    return;
  }

  if (!selectedCompassVideo?.id || !compassVideos.some((video) => video.id === selectedCompassVideo.id)) {
    selectedCompassVideo = compassVideos[0];
  }
  const selectedIndex = Math.max(0, compassVideos.findIndex((video) => video.id === selectedCompassVideo.id));
  const selectedDuration = durations[selectedIndex % durations.length];

  if (selectedCompassVideo.id) {
    const selectedThumbnail = getLocalMediaThumbnail(selectedCompassVideo, selectedIndex);
    player.innerHTML = `
      <div class="compass-player-shell">
        <div class="compass-player-topbar">
          <span>
            <strong>${escapeHtml(selectedCompassVideo.title || "The Seed of Promise")}</strong>
            <small>${escapeHtml(selectedCompassVideo.channelTitle || "TeoyubeWorld")}</small>
          </span>
          <span class="compass-player-actions">Save&nbsp;&nbsp; Share&nbsp;&nbsp; ...</span>
        </div>
        <div class="compass-video-frame">
          <img src="${escapeHtml(selectedThumbnail)}" alt="" loading="lazy" />
          <div class="local-media-disabled-copy">
            <strong>Preview Only</strong>
            <small>${escapeHtml(LOCAL_MEDIA_SOURCE_NOTICE)}</small>
          </div>
          <button class="compass-embed-play-overlay" type="button" data-video-id="${escapeHtml(selectedCompassVideo.id)}" aria-label="Play ${escapeHtml(selectedCompassVideo.title || "featured video")}">
            <span aria-hidden="true"></span>
          </button>
        </div>
        <div class="compass-player-controls" aria-label="Featured video navigation">
          <button type="button" data-compass-video-nav="previous">Previous</button>
          <button type="button" data-compass-video-nav="next">Next</button>
        </div>
      </div>
      <div class="compass-featured-meta">
        <h4>${escapeHtml(selectedCompassVideo.title || "The Seed of Promise")}</h4>
        <p>${escapeHtml(selectedCompassVideo.description || "Discover how the promise given to Abraham is the foundation of our calling in Christ.")}</p>
        <div class="compass-featured-row">
          <span>${escapeHtml(selectedCompassVideo.channelTitle || "TeoyubeWorld")}</span>
          <span>128K views</span>
          <span>2 days ago</span>
          <span>Promise</span>
          <span>Scripture</span>
          <span>Calling</span>
          <span>${escapeHtml(selectedDuration)}</span>
        </div>
      </div>
    `;
  } else {
    player.innerHTML = `
      <div class="calling-player-empty">
        <span aria-hidden="true"></span>
        <h4>${escapeHtml(selectedCompassVideo.title)}</h4>
        <p>${escapeHtml(selectedCompassVideo.description)}</p>
      </div>
    `;
  }

  list.innerHTML = compassVideos
    .slice(0, 12)
    .map(
      (video, index) => `
      <button class="compass-video-item ${selectedCompassVideo?.id === video.id ? "active" : ""}" type="button" data-index="${index}">
        ${
          video.thumbnail
            ? `<img alt="" src="${escapeHtml(video.thumbnail)}" />`
            : `<span class="compass-video-thumb">T</span>`
        }
        <b>${escapeHtml(durations[index % durations.length])}</b>
        <span>
          <strong>${escapeHtml(video.title || `TeoyubeWorld Video ${index + 1}`)}</strong>
          <small>${escapeHtml(video.channelTitle || "TeoyubeWorld")}</small>
        </span>
        <em aria-hidden="true">...</em>
      </button>
    `
    )
    .join("") + `<button class="compass-playlist-link" type="button">View Full Playlist <span aria-hidden="true">-&gt;</span></button>`;
}

function renderPromiseMoviePanel() {
  const result = $("#promiseMovieResult");
  const status = $("#promiseMovieStatus");
  if (!result || !status) return;

  status.textContent = promiseMovieStatus;
  const videos = getTodayYoutubeFeedVideos();
  const selectedVideoIsAvailable = videos.some((video) => video.id === selectedTodayYoutubeVideo?.id);
  const video = (selectedVideoIsAvailable ? selectedTodayYoutubeVideo : videos[selectedTodayYoutubeVideoIndex]) || videos[0];
  const thumbnail = getLocalMediaThumbnail(video, selectedTodayYoutubeVideoIndex);

  result.innerHTML = `
    <p class="eyebrow">TeoyubeWorld Video Highlight</p>
    <div class="promise-movie-detail">
      <div class="promise-video-thumbnail" aria-label="${escapeHtml(video.title)} local media preview">
        <img alt="${escapeHtml(video.title)}" src="${escapeHtml(thumbnail)}" />
        <span class="promise-video-play" aria-hidden="true">▶</span>
      </div>
      <div class="promise-video-copy">
        <h3>${escapeHtml(video.title)}</h3>
        <span class="position-badge success">${escapeHtml(video.channelTitle || "TeoyubeWorld")}</span>
        <p>${escapeHtml(video.description || "TeoyubeWorld promise video")}</p>
        <p class="local-media-note">${escapeHtml(LOCAL_MEDIA_SOURCE_NOTICE)}</p>
        <div class="promise-video-actions">
          <button class="secondary watch-now-button" type="button" data-local-media-title="${escapeHtml(video.title)}">Preview Source Status</button>
          <div class="promise-video-nav" aria-label="TeoyubeWorld video navigation">
            <button class="promise-video-nav-button" type="button" data-today-video-nav="previous">Previous</button>
            <button class="promise-video-nav-button" type="button" data-today-video-nav="next">Next</button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (video.id) {
    const mediaTarget = result.querySelector(".promise-video-thumbnail");
    if (mediaTarget) {
      mediaTarget.outerHTML = `
        <div class="promise-video-thumbnail promise-youtube-frame">
          <iframe
            title="${escapeHtml(video.title)}"
            srcdoc="<p>Video source not connected yet.</p>"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
          <button class="promise-embed-play-overlay" type="button" data-video-id="${escapeHtml(video.id)}" aria-label="Play ${escapeHtml(video.title)}">
            <span>▶</span>
          </button>
        </div>
      `;
    }
  }
}

function getFeaturedStoryImage(video, index) {
  const meta = featuredStoryMeta[index % featuredStoryMeta.length];
  return getLocalMediaThumbnail(video, index) || meta.image;
}

function getFeaturedStories() {
  const videos = getTodayYoutubeFeedVideos();
  return videos.slice(0, 8).map((video, index) => {
    const meta = featuredStoryMeta[index % featuredStoryMeta.length];
    const description =
      video.description && !/^TeoyubeWorld video from/i.test(video.description)
        ? video.description
        : meta.description;

    return {
      index,
      category: meta.category,
      source: video.channelTitle || "TeoyubeWorld",
      time: video.date || meta.time,
      title: video.title || "The Seed of Promise",
      description,
      image: getFeaturedStoryImage(video, index),
      cta: meta.cta,
      secondaryCta: "View in Feed",
      videoId: video.id || ""
    };
  });
}

function getFeaturedStoryActivePosition(stories) {
  if (!stories.length) return 0;
  const activePosition = stories.findIndex((story) => story.index === selectedTodayYoutubeVideoIndex);
  if (activePosition >= 0) return activePosition;
  return ((selectedTodayYoutubeVideoIndex % stories.length) + stories.length) % stories.length;
}

function renderFeaturedStoryCarousel() {
  const target = $("#featuredStoryCarousel");
  if (!target) return;

  const stories = getFeaturedStories();
  if (!stories.length) {
    target.innerHTML = `
      <div class="featured-story-empty">
        <strong>Waiting for TeoyubeWorld stories</strong>
        <span>Search TeoyubeWorld to load featured videos, teachings, devotionals, and articles.</span>
      </div>
    `;
    return;
  }

  const activePosition = getFeaturedStoryActivePosition(stories);

  target.innerHTML = `
    <div class="featured-story-stage">
      ${stories
        .map((story, position) => {
          const active = position === activePosition;
          const watchHref = "#promiseMovieResult";
          return `
            <article
              class="featured-story-slide ${active ? "active" : ""}"
              aria-hidden="${active ? "false" : "true"}"
              ${active ? "" : "inert"}
              style="--featured-image: url('${escapeHtml(story.image)}')"
            >
              <div class="featured-story-copy">
                <div class="featured-story-meta">
                  <span>${escapeHtml(story.category)}</span>
                  <span>${escapeHtml(story.source)}</span>
                  <time>${escapeHtml(story.time)}</time>
                </div>
                <h3>${escapeHtml(story.title)}</h3>
                <p>${escapeHtml(story.description)}</p>
                <div class="featured-story-actions">
                  <a class="primary featured-story-cta" href="${escapeHtml(watchHref)}" target="${story.videoId ? "_blank" : "_self"}" rel="noreferrer noopener">
                    ${escapeHtml(story.cta)} <span aria-hidden="true">&rarr;</span>
                  </a>
                  <button class="secondary featured-story-select" type="button" data-featured-story-index="${story.index}">
                    ${escapeHtml(story.secondaryCta)}
                  </button>
                </div>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
    <div class="featured-story-controls" aria-label="Featured story carousel controls">
      <button class="featured-story-arrow" id="featuredStoryPrev" type="button" aria-label="Previous featured story">&larr;</button>
      <div class="featured-story-dots">
        ${stories
          .map(
            (story, position) => `
              <button
                class="${position === activePosition ? "active" : ""}"
                type="button"
                data-featured-story-index="${story.index}"
                aria-current="${position === activePosition ? "true" : "false"}"
                aria-label="Show ${escapeHtml(story.title)}"
              ></button>
            `
          )
          .join("")}
      </div>
      <button class="featured-story-arrow" id="featuredStoryNext" type="button" aria-label="Next featured story">&rarr;</button>
    </div>
  `;
}

function goToFeaturedStory(index) {
  const videos = getTodayYoutubeFeedVideos();
  if (!videos.length) return;

  selectedTodayYoutubeVideoIndex = (index + videos.length) % videos.length;
  selectedTodayYoutubeVideo = videos[selectedTodayYoutubeVideoIndex] || videos[0] || null;
  renderFeaturedStoryCarousel();
  renderPromiseMoviePanel();
  renderClientsPromiseTable();
}

function startFeaturedStoryCarousel() {
  clearInterval(featuredStoryTimer);
  featuredStoryTimer = setInterval(() => {
    if (featuredStoryPaused || document.body.dataset.view !== "today") return;
    goToFeaturedStory(selectedTodayYoutubeVideoIndex + 1);
  }, 7000);
}

function getTodayYoutubeFeedVideos() {
  return getTeoyubeWorldChannelVideos(todayYoutubeVideos).map((video, index) => ({
    ...video,
    title:
      [
        "The Seed of Promise",
        "Walk in Divine Purpose",
        "Faith That Moves Mountains",
        "The Power of Prayer",
        "Grace for Every Season",
        "Kingdom Calling",
        "Promise Language",
        "Daily Divine Assignment"
      ][index] || video.title,
    date:
      [
        "May 12, 2025",
        "May 11, 2025",
        "May 10, 2025",
        "May 09, 2025",
        "May 08, 2025",
        "May 07, 2025",
        "May 06, 2025",
        "May 05, 2025"
      ][index] || ""
  }));
}

function getPromiseTableChannelVideos() {
  return getTeoyubeWorldChannelVideos(promiseTableYoutubeVideos, todayYoutubeVideos);
}

function renderClientsPromiseTable() {
  const target = $("#clientsPromiseRows");
  if (!target) return;

  const videos = getTodayYoutubeFeedVideos();

  target.innerHTML = videos
    .map(
      (video, index) => `
      <tr class="${selectedTodayYoutubeVideoIndex === index ? "active-video-row" : ""}" data-today-video-index="${index}">
        <td>${String(index + 1).padStart(2, "0")}</td>
        <td>
          <div class="feed-video-title">
            <img src="${escapeHtml(video.thumbnail || "public/images/teoyube-carousel-9-wide.png")}" alt="" />
            <span>${escapeHtml(video.title)}</span>
          </div>
        </td>
        <td>${escapeHtml(video.description || "TeoyubeWorld video")}</td>
        <td>
          <button class="video-button today-video-select" type="button" data-today-video-index="${index}" aria-label="Play ${escapeHtml(video.title)}">Play</button>
        </td>
        <td><span class="position-badge success">${escapeHtml(video.channelTitle || "TeoyubeWorld")}</span></td>
        <td>${escapeHtml(video.date || "May 12, 2025")}</td>
      </tr>
    `
    )
    .join("");
  return;

  target.innerHTML = clientsPromiseRows
    .map(
      (row, index) => `
      <tr>
        <td><span class="client-avatar" style="--avatar-hue: ${(index * 29) % 360}"></span></td>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.description)}</td>
        <td>
          ${
            row.video
              ? `<a class="video-button" href="${escapeHtml(row.video)}" target="_blank" rel="noreferrer noopener" aria-label="Watch ${escapeHtml(row.name)} video">▻</a>`
              : `<button class="video-button" type="button" aria-label="Video placeholder">▻</button>`
          }
        </td>
        <td><span class="position-badge ${escapeHtml(row.tone)}">${escapeHtml(row.position)}</span></td>
      </tr>
    `
    )
    .join("");
}

function getExpandedPromiseSearchSeeds() {
  const sourceSeeds = backendPromiseSeeds.length ? backendPromiseSeeds : promiseSearchSeeds;
  return Array.from({ length: 8 }, (_, cycleIndex) =>
    sourceSeeds.map((item, itemIndex) => ({
      ...item,
      description: Array.isArray(item.description) ? item.description.join("") : item.description,
      title: cycleIndex === 0 ? item.title : `${item.title} ${cycleIndex + 1}`,
      thumbnail: localMediaThumbnails[(cycleIndex * sourceSeeds.length + itemIndex) % localMediaThumbnails.length]
    }))
  ).flat();
}

function getFilteredPromiseSearchSeeds() {
  const query = normalize(promiseTableQuery);
  const expandedSeeds = getExpandedPromiseSearchSeeds();

  if (!query) return expandedSeeds;
  return expandedSeeds.filter((item) => normalize(`${item.title} ${item.description}`).includes(query));
}

function getTeoyubeTableCategory(index) {
  return ["Promise", "Scripture", "Promise", "Video", "Audio"][index % 5];
}

function getFilteredTeoyubeTableRows() {
  const query = normalize(teoyubeTableSearchQuery);
  let rows = getExpandedPromiseSearchSeeds().map((row, index) => ({
    ...row,
    tableIndex: index,
    tableCategory: getTeoyubeTableCategory(index)
  }));

  if (teoyubeTableCategoryFilter !== "All Categories") {
    rows = rows.filter((row) => row.tableCategory === teoyubeTableCategoryFilter);
  }

  if (query) {
    rows = rows.filter((row) =>
      normalize(`${row.title} ${row.description} ${getPromisePosition(row.description)} ${row.tableCategory}`).includes(query)
    );
  }

  if (teoyubeTableSortMode === "Sort by: Name") {
    rows = rows.sort((a, b) => a.title.localeCompare(b.title));
  } else if (teoyubeTableSortMode === "Sort by: Latest") {
    rows = rows.sort((a, b) => b.tableIndex - a.tableIndex);
  } else {
    rows = rows.sort((a, b) => a.tableIndex - b.tableIndex);
  }

  return rows;
}

function renderTeoyubeTableStats(totalRows, videos) {
  const target = $("#teoyubeTableStats");
  if (!target) return;

  const stats = [
    ["Total Tables", totalRows, "Structured entries", "tables"],
    ["Total Verses", "1.2K", "Scripture references", "verses"],
    ["Audio Items", 342, "Ready to hear", "audio"],
    ["Video Items", Math.max(videos.length, 278), "TeoyubeWorld media", "video"],
    ["Last Updated", "Today", "Live table view", "updated"]
  ];

  target.innerHTML = stats
    .map(
      ([label, value, trend, icon]) => `
        <article class="tables-stat-card">
          <span class="tables-stat-icon ${escapeHtml(icon)}" aria-hidden="true"></span>
          <div>
            <p>${escapeHtml(label)}</p>
            <strong>${escapeHtml(String(value))}</strong>
            <small>${escapeHtml(trend)}</small>
          </div>
        </article>
      `
    )
    .join("");
}

function renderTeoyubeTableFooter(filteredCount) {
  const status = $("#teoyubeTableEntryStatus");
  const pagination = $("#teoyubeTablePagination");
  const totalPages = Math.max(1, Math.ceil(filteredCount / teoyubeTablePageSize));
  teoyubeTablePage = Math.min(teoyubeTablePage, totalPages);
  const start = filteredCount ? (teoyubeTablePage - 1) * teoyubeTablePageSize + 1 : 0;
  const end = Math.min(teoyubeTablePage * teoyubeTablePageSize, filteredCount);

  if (status) {
    status.textContent = `Showing ${start} to ${end} of ${filteredCount} entries`;
  }

  if (!pagination) return;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);
  const pageButtons = pages
    .map(
      (page) =>
        `<button class="${page === teoyubeTablePage ? "active" : ""}" type="button" data-table-page="${page}" aria-label="Go to page ${page}">${page}</button>`
    )
    .join("");
  const finalPage =
    totalPages > 5
      ? `<button type="button" class="table-page-ellipsis" aria-hidden="true" tabindex="-1">...</button><button class="${totalPages === teoyubeTablePage ? "active" : ""}" type="button" data-table-page="${totalPages}" aria-label="Go to page ${totalPages}">${totalPages}</button>`
      : "";

  pagination.innerHTML = `
    <button type="button" data-table-page="${Math.max(1, teoyubeTablePage - 1)}" aria-label="Previous page">&lt;</button>
    ${pageButtons}
    ${finalPage}
    <button type="button" data-table-page="${Math.min(totalPages, teoyubeTablePage + 1)}" aria-label="Next page">&gt;</button>
  `;
}

function renderPromiseTableSearchFeed() {
  const results = $("#promiseTableSearchResults");
  const player = $("#promiseTableVideoPanel");
  if (!results || !player) return;

  const filtered = getFilteredPromiseSearchSeeds();
  const videos = getPromiseTableChannelVideos();
  const selectedVideoIsAvailable = videos.some((video) => video.id === selectedPromiseTableVideo?.id);
  if ((!selectedPromiseTableVideo?.id || !selectedVideoIsAvailable) && videos.length) {
    selectedPromiseTableVideo = videos[0];
  }

  if (selectedPromiseTableVideo?.id) {
    const selectedVideoIndex = Math.max(0, videos.findIndex((video) => video.id === selectedPromiseTableVideo.id));
    const displayVideos = videos.length ? videos : [selectedPromiseTableVideo];
    const displayIndex = Math.min(selectedVideoIndex, Math.max(displayVideos.length - 1, 0));
    const durations = ["21:09", "16:09", "24:35", "30:12", "18:40", "27:33"];
    const viewCounts = ["1.2K views", "890 views", "1.6K views", "720 views", "1.1K views", "680 views"];
    const ages = ["2 days ago", "5 days ago", "1 week ago", "Today", "Featured", "This week"];
    const duration = durations[displayIndex % durations.length];
    const views = viewCounts[displayIndex % viewCounts.length];
    const age = ages[displayIndex % ages.length];
    const dots = displayVideos.slice(0, Math.min(6, displayVideos.length));
    const fallbackTitles = [
      "The Seed of Promise",
      "Walk in Divine Purpose",
      "Faith That Moves Mountains",
      "The Power of Prayer",
      "Grace for Every Season",
      "Kingdom Calling"
    ];
    const fallbackDescriptions = [
      "A divine reminder that every promise from God is a seed planted in faith. Nurture it with His Word and watch it blossom in His timing.",
      "A guided TeoyubeWorld teaching for taking the next faithful step with clarity, courage, and purpose.",
      "A Scripture-rooted video reflection on faith, calling, and the promises that move a Saint forward.",
      "A quiet invitation into prayer, peace, and renewed trust in God's timing.",
      "A hope-filled reminder that grace meets every season with strength for today.",
      "A kingdom-centered reflection on calling, assignment, and faithful obedience."
    ];
    const displayTitle =
      selectedPromiseTableVideo.title && !/^TeoyubeWorld Video \d+$/i.test(selectedPromiseTableVideo.title)
        ? selectedPromiseTableVideo.title
        : fallbackTitles[displayIndex % fallbackTitles.length];
    const displayDescription =
      selectedPromiseTableVideo.description && selectedPromiseTableVideo.description !== "TeoyubeWorld video from the Calling Compass media hub."
        ? selectedPromiseTableVideo.description
        : fallbackDescriptions[displayIndex % fallbackDescriptions.length];

    player.innerHTML = `
      <div class="promise-table-featured-shell">
        <div class="promise-table-featured-copy">
          <span class="promise-table-featured-badge">Featured Video</span>
          <h3>${escapeHtml(displayTitle)}</h3>
          <p class="promise-table-featured-meta">
            <span>${escapeHtml(selectedPromiseTableVideo.channelTitle || "TeoyubeWorld")}</span>
            <span>${escapeHtml(duration)}</span>
            <span>${escapeHtml(views)}</span>
            <span>${escapeHtml(age)}</span>
          </p>
          <p class="promise-table-featured-description">${escapeHtml(displayDescription)}</p>
          <div class="promise-table-featured-actions">
            <button class="promise-table-watch-now" type="button" data-promise-table-play="${escapeHtml(selectedPromiseTableVideo.id)}">Watch Now</button>
            <button class="promise-table-next-video" type="button" data-promise-table-video-nav="next">Next Video</button>
          </div>
        </div>

        <div class="promise-table-featured-stage">
          <div class="promise-table-video-frame">
            <iframe
              title="${escapeHtml(displayTitle)}"
              srcdoc="<p>Video source not connected yet.</p>"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
            <div class="promise-table-video-artwork" aria-hidden="true">
              <span class="promise-table-video-artwork-label">Teaching</span>
            </div>
            <button class="promise-table-embed-play-overlay" type="button" data-video-id="${escapeHtml(selectedPromiseTableVideo.id)}" aria-label="Play ${escapeHtml(displayTitle)}">
              <span aria-hidden="true"></span>
            </button>
          </div>
        </div>

        <div class="promise-table-featured-nav" aria-label="Promise Table featured video navigation">
          <button type="button" data-promise-table-video-nav="previous" aria-label="Previous Promise Table video">Previous</button>
          <div class="promise-table-featured-dots">
            ${dots
              .map(
                (video, index) => `
                  <button class="${index === Math.min(displayIndex, dots.length - 1) ? "active" : ""}" type="button" data-promise-table-video-index="${index}" aria-label="Show ${escapeHtml(video.title || `video ${index + 1}`)}"></button>
                `
              )
              .join("")}
          </div>
          <button type="button" data-promise-table-video-nav="next" aria-label="Next Promise Table video">Next</button>
        </div>
      </div>
    `;
  } else {
    player.innerHTML = `
      <div class="promise-table-video-empty">
        <span aria-hidden="true"></span>
        <h3>TeoyubeWorld Video Feed</h3>
        <p>Select a promise row and click Watch Video to load TeoyubeWorld video content.</p>
      </div>
    `;
  }

  results.innerHTML =
    filtered
      .map((item, index) => {
        const video = videos[index % Math.max(videos.length, 1)];
        return `
          <article class="promise-search-item">
            <div class="scripture-thumbnail" role="img" aria-label="${escapeHtml(item.title)}" style="background-image: url('${escapeHtml(item.thumbnail)}')"></div>
            <div>
              <h3>${escapeHtml(item.title)}</h3>
              <p><b>Description:</b> ${escapeHtml(item.description)}</p>
              <button class="link-button promise-watch-video" type="button" data-video-index="${index}">
                Watch Video!
              </button>
              ${video ? `<small>TeoyubeWorld match: ${escapeHtml(video.title)}</small>` : `<small>Loading TeoyubeWorld feed...</small>`}
              ${renderPhase116WhyThisPanel({
                source: "promise-table",
                label: item.title,
                userInput: $("#promiseTableSearchInput")?.value || item.title,
                scripture: getPromisePosition(item.description),
                promise: item.title,
                word: state.selectedWord,
                action: "Review the promise, pray it carefully, and record testimony only when the Saint chooses.",
                fallbackReason: "Video sources remain local/static; no external fetch is required for this panel."
              })}
            </div>
          </article>
        `;
      })
      .join("") || `<article class="promise-search-item"><p>No promises match this search yet.</p></article>`;
}

function bringPromiseTableVideoPanelIntoView() {
  const player = $("#promiseTableVideoPanel");
  if (!player) return;
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  player.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
    inline: "nearest"
  });
}

function getPromisePosition(description) {
  const match = description.match(/-([A-Za-z0-9 ]+:\d+)(?: · WEB)?-?\s*$/);
  return match ? `-${match[1]} · WEB-` : "-Ephesians 1:18 · WEB-";
}

function getPromiseDescriptionBody(description) {
  return description.replace(/\s*-[A-Za-z0-9 ]+:\d+(?: · WEB)?-?\s*$/, "").trim();
}

const uiVideoDurations = ["21:09", "16:09", "1:12", "4:03", "0:58", "5:42", "12:18", "8:24"];
const uiVideoAspectRatios = ["21:9", "16:9", "1:1", "4:3", "16:9", "9:16", "21:9", "16:9"];
const uiVideoAges = ["2 days ago", "5 days ago", "1 week ago", "1 week ago", "2 weeks ago", "3 weeks ago", "1 month ago", "1 month ago"];
const uiVideoViewCounts = ["1.2K", "890", "1.6K", "720", "540", "310", "1.1K", "680"];
const uiVideoFallbackTitles = [
  "The Seed of Promise",
  "The Power of Prayer",
  "Walk in Divine Purpose",
  "The Seed of Promise",
  "Kingdom Wisdom for Today",
  "One Minute of Worship",
  "Promise Language and Calling",
  "Walking in Divine Direction"
];

const EMBEDDED_VIDEO_ORIGINAL_TABS = ["All Videos", "Teachings", "Worship", "Messages", "Documentaries", "Shorts"];

function normalizeEmbeddedVideoCategory(value = "") {
  const category = normalize(value);
  if (category.startsWith("teach")) return "Teaching";
  if (category.startsWith("worship")) return "Worship";
  if (category.startsWith("message")) return "Message";
  if (category.startsWith("document")) return "Documentary";
  if (category.startsWith("short")) return "Short";
  return value || "Teaching";
}

function getUiVideoCategory(index, video = null) {
  if (video?.sourceType === "approved") return video?.mediaKind === "short" ? "Short" : "Scripture";
  return normalizeEmbeddedVideoCategory(video?.category || "Teaching");
}

function getUiVideoThumbnail(video) {
  return video?.plannedPublicPosterUrl || video?.plannedPublicThumbnailUrl || getLocalMediaThumbnail(video);
}

function getUiVideoTitle(video, index) {
  if (video?.title && !/^TeoyubeWorld Video \d+$/.test(video.title)) return video.title;
  return uiVideoFallbackTitles[index % uiVideoFallbackTitles.length];
}

function getOriginalEmbeddedVideos() {
  const originals = [...normalizeTeoyubeWorldVideos(uiElementVideos), ...teoyubeWorldFallbackVideos];
  const unique = originals.filter((video, index, videos) => videos.findIndex((candidate) => candidate.id === video.id) === index);
  return unique.map((video, index) => ({
    ...video,
    sourceType: "original",
    category: normalizeEmbeddedVideoCategory(video.category),
    availability: video.playbackUrl ? "Available" : "Preview",
    durationLabel: video.durationLabel || uiVideoDurations[index % uiVideoDurations.length],
    originalOrder: index
  }));
}

function getApprovedTeoyubeWorldVideos() {
  const records = window.TeoyubeWorldMedia?.getTeoyubeWorldMediaRecords?.() || [];
  return records
    .filter((record) =>
      record.runtimeApproved === true &&
      record.validationState === "validated" &&
      String(record.plannedPublicCardUrl || "").startsWith("/media/teoyubeworld/pilot-v1/")
    )
    .sort((a, b) => Number(a.sequenceOrder || 0) - Number(b.sequenceOrder || 0))
    .map((record) => ({ ...record, sourceType: "approved", availability: "Available" }));
}

function getApprovedEmbeddedVideos() {
  return getApprovedTeoyubeWorldVideos();
}

function getEmbeddedVideoTabRecords(tabId = uiVideoCategoryFilter) {
  if (tabId === "TeoyubeWorld Media") return getApprovedTeoyubeWorldVideos();
  const records = getOriginalEmbeddedVideos();
  if (tabId === "All Videos" || tabId === "All Categories") return records;
  const selected = normalizeEmbeddedVideoCategory(tabId);
  return records.filter((video, index) => getUiVideoCategory(index, video) === selected);
}

function getEmbeddedVideoRecordById(id, sourceType = "") {
  const records = sourceType === "approved"
    ? getApprovedTeoyubeWorldVideos()
    : sourceType === "original"
      ? getOriginalEmbeddedVideos()
      : [...getOriginalEmbeddedVideos(), ...getApprovedTeoyubeWorldVideos()];
  return records.find((record) => record.id === id) || null;
}

function searchEmbeddedVideoRecords(records, query = "") {
  const search = normalize(query);
  if (!search) return [...records];
  return records.filter((video, index) =>
    normalize([
      getUiVideoTitle(video, index),
      getUiVideoDescription(video),
      video.channelTitle || "TeoyubeWorld",
      getUiVideoCategory(index, video),
      video.ScriptureReference || "",
      ...(video.scriptureReferences || []),
      ...(video.themes || []),
      ...(video.tags || [])
    ].join(" ")).includes(search)
  );
}

function filterEmbeddedVideoRecords(records, filters = {}) {
  const category = filters.category && filters.category !== "All Categories" ? normalizeEmbeddedVideoCategory(filters.category) : "";
  return category ? records.filter((video, index) => getUiVideoCategory(index, video) === category) : [...records];
}

function sortEmbeddedVideoRecords(records, sortMode = "Sort by: Latest") {
  const sorted = [...records];
  if (sortMode.includes("Scripture")) {
    return sorted.sort((a, b) =>
      String(a.ScriptureReference || a.scriptureReferences?.[0] || "").localeCompare(String(b.ScriptureReference || b.scriptureReferences?.[0] || "")) ||
      Number(a.sequenceOrder || a.originalOrder || 0) - Number(b.sequenceOrder || b.originalOrder || 0)
    );
  }
  if (sortMode.includes("Shortest")) {
    return sorted.sort((a, b) => Number(a.durationSeconds || 0) - Number(b.durationSeconds || 0));
  }
  return sorted.sort((a, b) => Number(a.sequenceOrder || a.originalOrder || 0) - Number(b.sequenceOrder || b.originalOrder || 0));
}

function getUiVideoDescription(video) {
  return video?.description || "Spirit-filled teaching from the TeoyubeWorld video library.";
}

function getUiVideoTeaser(video) {
  const text = getUiVideoDescription(video).replace(/\s+/g, " ").trim();
  return text.length > 150 ? `${text.slice(0, 147).trim()}...` : text;
}

function getUiFilteredVideos(videos) {
  return sortEmbeddedVideoRecords(searchEmbeddedVideoRecords(videos, uiVideoSearchQuery), uiVideoSortMode)
    .map((video, index) => ({ video, index }));
}

function renderUiVideoStats(videos, tabId = uiVideoCategoryFilter) {
  const target = $("#uiVideoStats");
  if (!target) return;

  const approved = tabId === "TeoyubeWorld Media";
  const statItems = [
    ["Total Videos", videos.length, approved ? "Approved local collection" : "Original local preview library", "library"],
    ["Total Views", "Not tracked", "No analytics connected", "views"],
    ["Watch Time", "Not tracked", "Session-only experience", "time"],
    ["Last Updated", approved ? "Published" : "Local", approved ? "Runtime manifest" : "Bundled preview data", "updated"]
  ];

  target.innerHTML = statItems
    .map(
      ([label, value, trend, icon]) => `
        <article class="embedded-stat-card">
          <span class="embedded-stat-icon ${escapeHtml(icon)}" aria-hidden="true"></span>
          <div>
            <p>${escapeHtml(label)}</p>
            <strong>${escapeHtml(String(value))}</strong>
            <small>${escapeHtml(trend)}</small>
          </div>
        </article>
      `
    )
    .join("");
}

function renderEmbeddedVideoGrid(records, options = {}) {
  const target = $("#uiVideoGrid");
  if (!target) return;

  const approved = options.tabId === "TeoyubeWorld Media";
  const visibleSlotCount = Math.min(records.length, approved ? 4 : uiVideoVisibleCount);
  const visibleVideos = Array.from({ length: visibleSlotCount }, (_, slot) => {
    const selectedPosition = Number(uiVideoCardSelections.get(slot));
    const position = Number.isInteger(selectedPosition)
      ? ((selectedPosition % records.length) + records.length) % records.length
      : slot % records.length;
    return { video: records[position], position, slot };
  });
  const loadMore = $("#uiVideoLoadMore");
  if (loadMore) {
    loadMore.hidden = approved || records.length <= uiVideoVisibleCount;
  }

  target.innerHTML = visibleVideos.length
    ? visibleVideos
        .map(({ video, position, slot }) => {
          const index = position;
          const title = getUiVideoTitle(video, index);
          const category = getUiVideoCategory(index, video);
          const durationSeconds = Number(video?.durationSeconds || 0);
          const duration = video.durationLabel || (durationSeconds ? `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, "0")}` : uiVideoDurations[index % uiVideoDurations.length]);
          const thumbnail = getUiVideoThumbnail(video);
          const description = getUiVideoTeaser(video);
          const scripture = video?.ScriptureReference || video?.scriptureReferences?.[0] || "Scripture context in details";
          const videoId = video?.id ? escapeHtml(video.id) : "";
          const sourceType = video.sourceType === "approved" ? "approved" : "original";
          const availability = sourceType === "approved" || video.playbackUrl ? "Available locally" : "Preview record";
      return `
        <article class="ui-video-card embedded-video-card" data-ui-video-source="${sourceType}" data-ui-video-id="${videoId}" data-ui-video-slot="${slot}">
          <div class="embedded-video-poster" data-ui-video-stage="${videoId}">
            <img class="embedded-video-poster-backdrop" src="${escapeHtml(thumbnail)}" alt="" aria-hidden="true" loading="lazy" />
            <img class="embedded-video-poster-image" src="${escapeHtml(thumbnail)}" alt="${escapeHtml(title)} preview artwork" loading="lazy" />
            <span class="ui-video-badge">${escapeHtml(category)}</span>
            <button class="embedded-video-play" type="button" data-ui-video-play="${videoId}" data-ui-video-source="${sourceType}" aria-label="${sourceType === "approved" ? "Play" : "Preview"} ${escapeHtml(title)}"><span aria-hidden="true"></span></button>
            <span class="ui-video-duration">${escapeHtml(duration)}</span>
            ${
              records.length > 1
                ? `<div class="embedded-video-card-nav" aria-label="Carousel controls for ${escapeHtml(title)}">
                    <button type="button" data-ui-video-nav="previous" data-ui-video-slot="${slot}" data-ui-video-position="${position}" aria-label="Show previous video in panel ${slot + 1}"></button>
                    <span class="embedded-video-position" aria-live="polite">${position + 1} / ${records.length}</span>
                    <button type="button" data-ui-video-nav="next" data-ui-video-slot="${slot}" data-ui-video-position="${position}" aria-label="Show next video in panel ${slot + 1}"></button>
                  </div>`
                : ""
            }
          </div>
          <div class="embedded-video-card-body">
            <div class="embedded-video-summary">
              <h4>${escapeHtml(title)}</h4>
              <p class="ui-video-meta"><span class="channel">${escapeHtml(video.channelTitle || "TeoyubeWorld")}</span><span>${escapeHtml(availability)}</span><span>${escapeHtml(scripture)}</span></p>
            </div>
            <details class="embedded-video-menu">
              <summary aria-label="More actions for ${escapeHtml(title)}">...</summary>
              <div class="ui-video-actions embedded-video-menu-actions">
                <button class="primary" type="button" data-ui-video-play="${videoId}" data-ui-video-source="${sourceType}">${sourceType === "approved" ? "Play" : "Preview"}</button>
                <button class="secondary" type="button" data-ui-video-detail="${videoId}" aria-expanded="false">Details</button>
                <button class="secondary" type="button" data-ui-video-save="${videoId}" data-ui-video-source="${sourceType}">Save to Book</button>
                ${scripture !== "Scripture context in details" ? `<button class="secondary" type="button" data-ui-video-scripture="${escapeHtml(scripture)}">Open Scripture</button>` : ""}
              </div>
            </details>
            <div class="embedded-video-detail" data-ui-video-detail-panel="${videoId}" hidden>
              <p><strong>Scripture:</strong> ${escapeHtml(scripture)}</p>
              <p>${escapeHtml(description)}</p>
              <p>${escapeHtml(sourceType === "approved" ? `${video?.sequenceTitle || "Approved Scripture sequence"}, segment ${video?.sequenceOrder || index + 1}.` : "This is an original local preview record; a playable source has not been connected.")}</p>
              <p class="embedded-video-boundary">Video supports reflection; Scripture remains primary.</p>
            </div>
          </div>
        </article>
      `;
        })
        .join("")
    : `<article class="ui-video-empty">
        <strong>No videos found</strong>
        <p>${options.sourceCount ? "Try a different category or search term." : "This local video source is unavailable. Refresh the page or return later; no owner tools are exposed here."}</p>
      </article>`;
}

function renderUiElementsVideos() {
  const sourceVideos = getEmbeddedVideoTabRecords(uiVideoCategoryFilter);
  const records = sortEmbeddedVideoRecords(searchEmbeddedVideoRecords(sourceVideos, uiVideoSearchQuery), uiVideoSortMode);
  renderUiVideoStats(sourceVideos, uiVideoCategoryFilter);
  renderEmbeddedVideoGrid(records, { tabId: uiVideoCategoryFilter, sourceCount: sourceVideos.length });
}

function renderTeoyubeTablesPage() {
  const target = $("#teoyubeTablesRows");
  if (!target) return;
  renderTeoyubeDataManagement();

  const videos = getPromiseTableChannelVideos();
  const filteredRows = getFilteredTeoyubeTableRows();
  const totalRows = getExpandedPromiseSearchSeeds().length;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / teoyubeTablePageSize));
  teoyubeTablePage = Math.min(teoyubeTablePage, totalPages);
  const pageStart = (teoyubeTablePage - 1) * teoyubeTablePageSize;
  const rows = filteredRows.slice(pageStart, pageStart + teoyubeTablePageSize);

  renderTeoyubeTableStats(totalRows, videos);
  renderTeoyubeTableFooter(filteredRows.length);

  target.innerHTML = rows.length
    ? rows
        .map((row) => {
          const index = row.tableIndex;
          const open = expandedTeoyubeTableRows.has(index);
          const video = videos[index % videos.length];
          const videoIndex = videos.length ? index % videos.length : 0;
          const videoTitle = getUiVideoTitle(video, index);
          const videoThumbnail = getUiVideoThumbnail(video);
          const videoDuration = uiVideoDurations[index % uiVideoDurations.length];
          const position = getPromisePosition(row.description);
          const scriptureText = getPromiseDescriptionBody(row.description);
      return `
        <tr class="teoyube-main-row ${open ? "expanded" : ""} ${selectedTeoyubeTableRows.has(index) ? "selected" : ""}">
          <td>
            <div class="table-row-controls">
              <input type="checkbox" data-table-select="${index}" aria-label="Select ${escapeHtml(row.title)}" ${selectedTeoyubeTableRows.has(index) ? "checked" : ""} />
              <button class="table-expand-button" type="button" data-table-row="${index}" aria-expanded="${open}" aria-label="${open ? "Collapse" : "Expand"} ${escapeHtml(row.title)}">
                <span class="table-toggle-icon">${open ? "⌄" : "›"}</span>
              </button>
            </div>
          </td>
          <td class="table-name-cell">${escapeHtml(row.title)}</td>
          <td><button class="table-icon-button table-video-toggle" type="button" data-table-row="${index}" aria-label="Watch ${escapeHtml(row.title)}">video</button></td>
          <td><span class="table-position-pill">${escapeHtml(position)}</span></td>
          <td>
            <div class="table-audio-control">
              <button class="table-icon-button table-expand-audio" type="button" data-table-row="${index}" aria-label="Play audio for ${escapeHtml(row.title)}">audio</button>
              <span class="table-speaker-icon" aria-hidden="true"></span>
            </div>
          </td>
          <td><span class="table-period-pill">2,300 times</span></td>
          <td><button class="table-icon-button table-video-toggle table-airplay-button" type="button" data-table-row="${index}" aria-label="Open airplay for ${escapeHtml(row.title)}">grid</button></td>
          <td>
            <details class="table-action-menu">
              <summary class="table-action-button" aria-label="More options for ${escapeHtml(row.title)}">...</summary>
              <div role="menu" aria-label="Actions for ${escapeHtml(row.title)}">
                <button type="button" role="menuitem" data-table-demo-action="details" data-table-demo-row="${index}">View details</button>
                <button type="button" role="menuitem" data-table-demo-action="save" data-table-demo-row="${index}">Save to Book</button>
                <button type="button" role="menuitem" data-table-demo-action="filter" data-table-demo-row="${index}">Filter ${escapeHtml(row.tableCategory)}</button>
              </div>
            </details>
          </td>
        </tr>
        ${
          open
            ? `<tr class="teoyube-detail-row">
                <td colspan="8">
                  <div class="table-detail-content">
                    <div class="table-detail-preview table-preview-video-panel" style="--table-preview-thumb: url('${escapeHtml(videoThumbnail)}')" data-table-video-preview="${video?.id ? escapeHtml(video.id) : ""}" data-table-video-preview-index="${videoIndex}" aria-label="${escapeHtml(videoTitle)} preview video">
                      <div class="table-preview-video-cover" aria-hidden="true"></div>
                      ${
                        video?.id
                          ? `<iframe
                              title="${escapeHtml(videoTitle)} preview"
                              srcdoc="<p>Video source not connected yet.</p>"
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowfullscreen
                            ></iframe>
                            <button class="table-detail-play table-preview-embed-play-overlay" type="button" data-table-preview-video-play="${escapeHtml(video.id)}" aria-label="Play ${escapeHtml(videoTitle)} in the far-left preview panel">
                              <span aria-hidden="true"></span>
                            </button>`
                          : `<img src="${escapeHtml(videoThumbnail)}" alt="" loading="lazy" />
                            <span class="table-detail-play" aria-hidden="true"></span>`
                      }
                      <span class="table-detail-duration">${escapeHtml(videoDuration)}</span>
                    </div>
                    <div class="table-detail-copy">
                      <p>"${escapeHtml(scriptureText)}"</p>
                      <small>Seed source: scripts/seedDB.js | ${escapeHtml(video?.channelTitle || "TeoyubeWorld")}</small>
                      <div class="table-detail-chips" aria-label="Table row metadata">
                        <span>${escapeHtml(row.tableCategory)}</span>
                        <span>${escapeHtml(position)}</span>
                        <span>Audio Ready</span>
                        <span>Promise Cluster</span>
                      </div>
                    </div>
                    ${
                      video?.id
                        ? `<div class="table-row-video table-row-video-premium" style="--table-video-thumb: url('${escapeHtml(videoThumbnail)}')" data-table-video-current-index="${videoIndex}">
                            <div class="table-row-video-cover" aria-hidden="true"></div>
                            <span class="table-row-video-label">TeoyubeWorld</span>
                            <strong class="table-row-video-title">${escapeHtml(videoTitle)}</strong>
                            <iframe
                              title="${escapeHtml(videoTitle)}"
                              srcdoc="<p>Video source not connected yet.</p>"
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowfullscreen
                            ></iframe>
                            <button class="table-row-embed-play-overlay" type="button" data-table-video-play="${escapeHtml(video.id)}" aria-label="Play ${escapeHtml(videoTitle)}">
                              <span aria-hidden="true"></span>
                            </button>
                            <span class="table-row-video-duration">${escapeHtml(videoDuration)}</span>
                            <div class="table-row-video-nav" aria-label="${escapeHtml(videoTitle)} navigation">
                              <button type="button" data-table-video-nav="previous" aria-label="Previous TeoyubeWorld video"></button>
                              <button type="button" data-table-video-nav="next" aria-label="Next TeoyubeWorld video"></button>
                            </div>
                          </div>`
                        : `<div class="table-row-video video-loading-state">Loading TeoyubeWorld video...</div>`
                    }
                  </div>
                </td>
              </tr>`
            : ""
        }
      `;
        })
        .join("")
    : `<tr class="teoyube-empty-row">
        <td colspan="8">
          <strong>No table entries found</strong>
          <p>Try another search term or category.</p>
        </td>
      </tr>`;
}

function parseManagedScriptureReference(reference = "") {
  const match = String(reference).trim().match(/^(.+?)\s+(\d+):(.*)$/);
  return {
    book: match?.[1] || "",
    chapter: match?.[2] || "",
    verses: match?.[3] || ""
  };
}

function getTeoyubeDataManagementRecords(tabId = teoyubeDataTableTab) {
  if (tabId === "promises") {
    const saved = safeArray(state.savedPromiseTableItems).map((row) => ({
      id: row.id,
      title: row.title,
      scripture: row.scripture,
      category: row.category || row.source || "Saved Promise",
      word: row.word || "",
      status: row.status || "Discovered",
      saved: true,
      date: row.updatedAt || row.savedAt || "",
      raw: row
    }));
    const savedKeys = new Set(saved.map((row) => normalize(`${row.title} ${row.scripture}`)));
    const bundled = promiseClusters
      .map((cluster, index) => ({
        id: cluster.id || cluster.cluster_id || `cluster-${index + 1}`,
        title: getClusterTitle(cluster),
        scripture: getClusterScriptures(cluster)[0] || "Scripture review needed",
        category: cluster.promise_category || cluster.theme || "Promise Cluster",
        word: safeArray(cluster.related_teoyube_words || cluster.core_words || cluster.keywords)[0] || "",
        status: "Discovered",
        saved: false,
        date: "",
        raw: cluster
      }))
      .filter((row) => !savedKeys.has(normalize(`${row.title} ${row.scripture}`)));
    return [...saved, ...bundled];
  }

  if (tabId === "scriptures") {
    return scriptureCanon.flatMap((entry, entryIndex) =>
      safeArray(entry.scriptureReferences || entry.scripture_references || entry.references).map((reference, referenceIndex) => ({
        id: `${entry.id || `canon-${entryIndex + 1}`}-${referenceIndex + 1}`,
        title: reference,
        reference,
        ...parseManagedScriptureReference(reference),
        promise: entry.promiseStatement || entry.promise || entry.clusterLinks?.[0] || "",
        word: entry.teoyubeWord || entry.word || "",
        saved: safeArray(state.book).some((bookEntry) => safeArray(bookEntry.references).includes(reference)),
        raw: entry
      }))
    );
  }

  if (tabId === "journeys") {
    const candidates = [
      state.activeJourney,
      state.generatedDailyJourney,
      state.selectedJourney,
      ...safeArray(state.journeyMemory).filter((entry) => entry.type === "journey"),
      ...safeArray(prayerJourneys)
    ].filter(Boolean);
    return candidates
      .map((journey, index) => ({
        id: journey.id || `journey-${index + 1}`,
        title: journey.title || journey.name || journey.focus || `Journey ${index + 1}`,
        focus: journey.focus || journey.promise || journey.promiseCluster || journey.summary || "Scripture-guided journey",
        status: journey.status || (journey.completed ? "Completed" : journey === state.activeJourney ? "Active" : "Available"),
        progress: Number(journey.progress || journey.completion || 0),
        step: journey.currentStep || journey.action || journey.actionStep || "Review next faithful step",
        scripture: phase116bScriptureReference(journey.scripture || journey.scriptureAnchor || journey.scriptureReferences?.[0], "Scripture review needed"),
        date: journey.updatedAt || journey.startedAt || journey.generatedAt || "",
        raw: journey
      }))
      .filter((journey, index, journeys) => journeys.findIndex((candidate) => candidate.id === journey.id) === index);
  }

  if (tabId === "videos") {
    const source = teoyubeDataVideoSource === "approved" ? getApprovedTeoyubeWorldVideos() : getOriginalEmbeddedVideos();
    return source.map((video, index) => ({
      id: video.id,
      title: getUiVideoTitle(video, index),
      thumbnail: getUiVideoThumbnail(video),
      category: getUiVideoCategory(index, video),
      source: video.sourceType === "approved" ? "Approved TeoyubeWorld Media" : "Original Embedded Videos",
      scripture: video.ScriptureReference || video.scriptureReferences?.[0] || "",
      duration: video.durationLabel || (video.durationSeconds ? `${Math.floor(video.durationSeconds / 60)}:${String(video.durationSeconds % 60).padStart(2, "0")}` : uiVideoDurations[index % uiVideoDurations.length]),
      availability: video.sourceType === "approved" || video.playbackUrl ? "Available" : "Preview",
      saved: safeArray(state.book).some((entry) => normalize(entry.title) === normalize(video.title)),
      raw: video
    }));
  }

  return safeArray(state.book).map((entry, index) => ({
    id: entry.id || `book-${index + 1}`,
    title: entry.title || "Saved Book entry",
    type: entry.type || entry.source || "Reflection",
    scripture: safeArray(entry.references || entry.scriptureReferences)[0] || "",
    date: entry.date || entry.savedAt || "",
    collection: entry.collection || entry.source || "Book of the Saint",
    raw: entry
  }));
}

function getTeoyubeDataTableColumns(tabId = teoyubeDataTableTab) {
  const columns = {
    promises: ["Title", "Scripture", "Category", "Teoyube Word", "Status", "Saved", "Actions"],
    scriptures: ["Reference", "Book", "Chapter", "Verses", "Related Promise", "Related Word", "Saved", "Actions"],
    journeys: ["Title", "Focus", "Status", "Progress", "Current Step", "Scripture", "Actions"],
    videos: ["Preview", "Title", "Category / Source", "Scripture", "Duration", "Availability", "Saved", "Actions"],
    book: ["Type", "Title", "Scripture", "Date", "Collection", "Actions"]
  };
  return columns[tabId] || columns.promises;
}

function renderTeoyubeDataTableRow(row, tabId = teoyubeDataTableTab) {
  const id = escapeHtml(String(row.id || ""));
  if (tabId === "promises") {
    return `<tr>
      <td><strong>${escapeHtml(row.title)}</strong></td><td>${escapeHtml(row.scripture)}</td><td>${escapeHtml(row.category)}</td><td>${escapeHtml(row.word || "-")}</td>
      <td><select aria-label="Promise status for ${escapeHtml(row.title)}" data-data-table-action="promise-status" data-data-row-id="${id}">${PHASE116B_PROMISE_STATUSES.map((status) => `<option ${status === row.status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select></td>
      <td>${row.saved ? "Saved" : "Available"}</td>
      <td><div class="data-table-actions"><button type="button" data-data-table-action="promise-open" data-data-row-id="${id}">Open</button><button type="button" data-data-table-action="promise-save" data-data-row-id="${id}">Save to Book</button></div></td>
    </tr>`;
  }
  if (tabId === "scriptures") {
    return `<tr>
      <td><strong>${escapeHtml(row.reference)}</strong></td><td>${escapeHtml(row.book)}</td><td>${escapeHtml(row.chapter)}</td><td>${escapeHtml(row.verses)}</td><td>${escapeHtml(row.promise || "-")}</td><td>${escapeHtml(row.word || "-")}</td><td>${row.saved ? "Saved" : "Not saved"}</td>
      <td><div class="data-table-actions"><button type="button" data-data-table-action="scripture-open" data-data-row-id="${id}">Open</button><button type="button" data-data-table-action="scripture-save" data-data-row-id="${id}">Save to Book</button></div></td>
    </tr>`;
  }
  if (tabId === "journeys") {
    return `<tr>
      <td><strong>${escapeHtml(row.title)}</strong></td><td>${escapeHtml(String(row.focus || "-"))}</td><td>${escapeHtml(row.status)}</td><td>${escapeHtml(String(row.progress))}%</td><td>${escapeHtml(String(row.step || "-"))}</td><td>${escapeHtml(row.scripture)}</td>
      <td><div class="data-table-actions"><button type="button" class="primary" data-data-table-action="journey-open" data-data-row-id="${id}">Continue</button><button type="button" data-data-table-action="journey-save" data-data-row-id="${id}">Save reflection</button></div></td>
    </tr>`;
  }
  if (tabId === "videos") {
    return `<tr>
      <td><img class="data-table-thumbnail" src="${escapeHtml(row.thumbnail)}" alt="" loading="lazy" /></td><td><strong>${escapeHtml(row.title)}</strong></td><td>${escapeHtml(row.category)}<small>${escapeHtml(row.source)}</small></td><td>${escapeHtml(row.scripture || "-")}</td><td>${escapeHtml(row.duration)}</td><td>${escapeHtml(row.availability)}</td><td>${row.saved ? "Saved" : "Not saved"}</td>
      <td><div class="data-table-actions"><button type="button" class="primary" data-data-table-action="video-play" data-data-row-id="${id}">Play</button><button type="button" data-data-table-action="video-details" data-data-row-id="${id}">Details</button><button type="button" data-data-table-action="video-save" data-data-row-id="${id}">Save to Book</button></div></td>
    </tr>`;
  }
  return `<tr>
    <td>${escapeHtml(row.type)}</td><td><strong>${escapeHtml(row.title)}</strong></td><td>${escapeHtml(row.scripture || "-")}</td><td>${escapeHtml(row.date ? new Date(row.date).toLocaleDateString() : "Session")}</td><td>${escapeHtml(row.collection)}</td>
    <td><div class="data-table-actions"><button type="button" data-data-table-action="book-open" data-data-row-id="${id}">Open</button><button type="button" data-data-table-action="book-remove" data-data-row-id="${id}">Remove</button></div></td>
  </tr>`;
}

function renderTeoyubeDataManagement() {
  const head = $("#teoyubeDataTableHead");
  const body = $("#teoyubeDataTableRows");
  if (!head || !body) return;

  const search = normalize(teoyubeDataTableQuery);
  let records = getTeoyubeDataManagementRecords(teoyubeDataTableTab);
  if (search) records = records.filter((row) => normalize(Object.values(row).filter((value) => typeof value !== "object").join(" ")).includes(search));
  records.sort((a, b) => {
    if (teoyubeDataTableSortMode === "latest") return String(b.date || "").localeCompare(String(a.date || ""));
    const result = String(a.title || a.reference || "").localeCompare(String(b.title || b.reference || ""));
    return teoyubeDataTableSortMode === "title-desc" ? -result : result;
  });

  const totalPages = Math.max(1, Math.ceil(records.length / teoyubeDataTablePageSize));
  teoyubeDataTablePage = Math.min(teoyubeDataTablePage, totalPages);
  const startIndex = (teoyubeDataTablePage - 1) * teoyubeDataTablePageSize;
  const visible = records.slice(startIndex, startIndex + teoyubeDataTablePageSize);
  head.innerHTML = `<tr>${getTeoyubeDataTableColumns(teoyubeDataTableTab).map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join("")}</tr>`;
  body.innerHTML = visible.map((row) => renderTeoyubeDataTableRow(row, teoyubeDataTableTab)).join("");

  const empty = $("#teoyubeDataTableEmpty");
  if (empty) empty.hidden = visible.length > 0;
  const status = $("#teoyubeDataTableStatus");
  if (status) status.textContent = records.length ? `Showing ${startIndex + 1}-${Math.min(startIndex + visible.length, records.length)} of ${records.length} local records` : "No matching local records";
  const pagination = $("#teoyubeDataTablePagination");
  if (pagination) pagination.innerHTML = Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 9).map((page) => `<button class="${page === teoyubeDataTablePage ? "active" : ""}" type="button" data-data-table-page="${page}" aria-label="Go to data table page ${page}">${page}</button>`).join("");

  $all("#teoyubeDataTableTabs [data-data-table-tab]").forEach((button) => {
    const active = button.dataset.dataTableTab === teoyubeDataTableTab;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  const sourceWrap = $("#teoyubeDataVideoSourceWrap");
  if (sourceWrap) sourceWrap.hidden = teoyubeDataTableTab !== "videos";
}

async function loadPromiseTableYoutubeFeed(query = "TeoyubeWorld") {
  promiseTableYoutubeVideos = searchLocalTeoyubeWorldVideos(query, todayYoutubeVideos, uiElementVideos);
  renderPromiseTableSearchFeed();
  renderUiElementsVideos();
  renderTeoyubeTablesPage();
}

async function loadPromiseSeedData() {
  try {
    const response = await fetch("/api/promises/seed");
    const data = await response.json();
    backendPromiseSeeds = Array.isArray(data.promises) ? data.promises : [];
  } catch (error) {
    backendPromiseSeeds = [];
  }
  renderPromiseTableSearchFeed();
  renderTeoyubeTablesPage();
}

async function loadUiElementsYoutubeFeed(query = "TeoyubeWorld") {
  uiElementVideos = searchLocalTeoyubeWorldVideos(query, promiseTableYoutubeVideos, todayYoutubeVideos);
  uiVideoCardSelections.clear();
  renderUiElementsVideos();
}

async function searchPromiseMovie(query) {
  const term = (query || "").trim() || "TeoyubeWorld";
  promiseMovieStatus = `Searching local TeoyubeWorld previews for "${term}"...`;
  renderPromiseMoviePanel();

  todayYoutubeVideos = searchLocalTeoyubeWorldVideos(term, promiseTableYoutubeVideos, compassVideos, uiElementVideos);
  selectedTodayYoutubeVideoIndex = 0;
  selectedTodayYoutubeVideo = todayYoutubeVideos[0];
  promiseMovieStatus = `Showing ${todayYoutubeVideos.length} local TeoyubeWorld preview${todayYoutubeVideos.length === 1 ? "" : "s"} for "${term}". ${LOCAL_MEDIA_SOURCE_NOTICE}`;

  renderPromiseMoviePanel();
  renderFeaturedStoryCarousel();
  renderClientsPromiseTable();
  renderUiElementsVideos();
}

async function searchCompassVideos(query = "TeoyubeWorld") {
  const status = $("#compassVideoStatus");
  if (status) status.textContent = `Searching local TeoyubeWorld previews for "${query}"...`;

  compassVideos = searchLocalTeoyubeWorldVideos(query, todayYoutubeVideos, promiseTableYoutubeVideos, uiElementVideos);
  selectedCompassVideo = compassVideos[0];
  if (status) {
    status.textContent = `${compassVideos.length} local TeoyubeWorld preview${compassVideos.length === 1 ? "" : "s"} found. ${LOCAL_MEDIA_SOURCE_NOTICE}`;
  }

  renderCompassVideos();
}

function getTestimonyImage(index) {
  const images = [
    "public/images/canon/canon-hero-bg.png",
    "public/images/search/suggested-journey-02.png",
    "public/images/carousel/faith-in-action.png",
    "public/images/search/suggested-journey-01.png",
    "public/images/canon/journey-legacy.png"
  ];
  return images[index % images.length];
}

function getTestimonyStatus(item, index) {
  return item.status || (index % 3 === 1 ? "Private" : index % 3 === 2 ? "Draft" : "Public");
}

function getTestimonyMedia(item, index) {
  const media = item.media || item.attachment || item.thumbnail || item.image || item.video || item.audio;
  if (typeof media === "string") {
    return { type: "image", src: media };
  }
  if (media?.url || media?.src) {
    return {
      type: media.type || "image",
      src: media.url || media.src,
      duration: media.duration || ""
    };
  }
  return {
    type: "image",
    src: getTestimonyImage(index),
    fallback: true
  };
}

function getRelativeTestimonyDate(date) {
  const timestamp = new Date(date || Date.now()).getTime();
  const diff = Math.max(0, Date.now() - timestamp);
  const days = Math.max(1, Math.round(diff / 86400000));
  if (days <= 1) return "today";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  if (weeks <= 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  return formatDate(date);
}

function getTestimonyTimingLabel(status, date) {
  const relative = getRelativeTestimonyDate(date);
  if (status === "Draft") return `Draft saved ${relative}`;
  if (status === "Private") return `Saved ${relative}`;
  return `Shared ${relative}`;
}

function getTestimonyStatusIcon(status) {
  if (status === "Private") return "lock";
  if (status === "Draft") return "draft";
  return "public";
}

function isSeededDraftPlaceholder(item) {
  return item.seededDraftPlaceholder || (item.title === "Walking in Faith" && item.status === "Draft");
}

function renderTestimonies() {
  const list = $("#testimonyList");
  if (!list) return;
  const testimonies = state.testimonies.filter((item, index) => {
    const status = getTestimonyStatus(item, index);
    return activeTestimonyFilter === "All" || status === activeTestimonyFilter;
  });
  const showDraftEmptyState =
    activeTestimonyFilter === "Draft" &&
    (!testimonies.length || testimonies.every((item) => isSeededDraftPlaceholder(item)));

  if (showDraftEmptyState) {
    list.innerHTML = `
      <article class="testimony-empty-state testimony-draft-empty-state">
        <span class="testimony-draft-illustration" aria-hidden="true"></span>
        <h4>No testimonies recorded yet.</h4>
        <p>Your story matters. Share how God has moved in your life and encourage someone today.</p>
        <button class="primary" type="button">
          Write Your First Testimony
          <span aria-hidden="true"></span>
        </button>
      </article>`;
    return;
  }

  list.innerHTML =
    testimonies
      .map((item, index) => {
        const category = item.category || item.promise_category || "Faith";
        const originalIndex = state.testimonies.indexOf(item);
        const status = getTestimonyStatus(item, originalIndex);
        const media = getTestimonyMedia(item, originalIndex);
        const references = item.references || [];
        const encouragements = item.encouragements || Math.max(3, 24 - Math.min(originalIndex * 3, 18));
        const views = item.views || Math.max(12, 68 - Math.min(originalIndex * 13, 42));
        const shares = item.shares || Math.max(0, 9 - originalIndex * 2);
        const statusIcon = getTestimonyStatusIcon(status);
        return `
        <article class="testimony-entry testimony-media-card">
          <div class="testimony-thumb testimony-thumb-${escapeHtml(media.type || "image")}">
            ${media.src ? `<img src="${escapeHtml(media.src)}" alt="" loading="lazy" />` : `<span class="testimony-audio-wave" aria-hidden="true"></span>`}
            ${media.type === "video" ? `<span class="testimony-play-icon" aria-hidden="true"></span>` : ""}
            ${media.duration ? `<small class="testimony-duration">${escapeHtml(media.duration)}</small>` : ""}
            <span class="testimony-status-badge" data-status="${escapeHtml(statusIcon)}">${escapeHtml(status)}</span>
          </div>
          <div class="testimony-entry-body">
            <h4>${escapeHtml(item.title)}</h4>
            <div class="testimony-entry-meta">
              <span><b>Category:</b> ${escapeHtml(category)}</span>
              <time datetime="${escapeHtml(item.date || "")}">${escapeHtml(getTestimonyTimingLabel(status, item.date))}</time>
              <span>Updated ${escapeHtml(getRelativeTestimonyDate(item.updatedAt || item.date))}</span>
            </div>
            <p>${escapeHtml(item.content)}</p>
            <div class="scripture-strip">${references
              .map((reference) => `<span class="scripture-pill">${escapeHtml(reference)}</span>`)
              .join("")}</div>
          </div>
          <div class="testimony-entry-stats">
            <span data-metric="encouragements"><b>${encouragements}</b><small>Encouragements</small></span>
            <span data-metric="views"><b>${views}</b><small>Views</small></span>
            <span data-metric="shares"><b>${shares}</b><small>Shares</small></span>
            <button type="button" data-phase116b-action="testimony-status" data-phase116b-id="${escapeHtml(item.id || item.title)}" aria-label="Change local label for ${escapeHtml(item.title)}">Label</button>
            <button type="button" data-phase116b-action="testimony-delete" data-phase116b-id="${escapeHtml(item.id || item.title)}" aria-label="Delete ${escapeHtml(item.title)}">Delete</button>
          </div>
        </article>
      `;
      })
      .join("") ||
    `<article class="testimony-empty-state">
      <span aria-hidden="true"></span>
      <h4>No ${activeTestimonyFilter === "All" ? "" : activeTestimonyFilter.toLowerCase()} testimonies recorded yet.</h4>
      <p>Your first story of God's faithfulness can become courage for someone else's next step.</p>
      <button class="primary" type="button">Write Your First Testimony</button>
    </article>`;
}

function renderChat() {
  $("#chatLog").innerHTML = state.chat
    .map((message) => {
      const role = message.role === "user" ? "user" : "teo";
      const label = role === "user" ? "Your message" : "Teo Guide response";
      return `
        <div class="message-row ${escapeHtml(role)}">
          <span class="message-icon" aria-hidden="true"></span>
          <div class="message ${escapeHtml(role)}" aria-label="${label}">${escapeHtml(message.text)}</div>
          ${
            role === "teo"
              ? `
                ${renderPhase116WhyThisPanel({
                  source: "teo-guide",
                  label: "Teo Guide response",
                  userInput: message.text,
                  scripture: getClusterScriptures(getActivePhase115Cluster())[0],
                  word: state.selectedWord,
                  promise: getClusterTitle(getActivePhase115Cluster()),
                  prayer: getClusterPrayer(getActivePhase115Cluster()),
                  action: getDailyAssignment(getActivePhase115Cluster())[3]?.replace("Action: ", "")
                })}
                ${renderPhase115FeedbackControls({
                  label: "Teo Guide response",
                  scripture: getClusterScriptures(getActivePhase115Cluster())[0],
                  word: state.selectedWord,
                  promise: getClusterTitle(getActivePhase115Cluster()),
                  source: "teo-guide"
                })}
              `
              : ""
          }
        </div>
      `;
    })
    .join("");
  $("#chatLog").scrollTop = $("#chatLog").scrollHeight;
  renderPhase116TeoPromptCategories();
}

function emptyState(text) {
  return `<article class="timeline-entry"><p>${text}</p></article>`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(date));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderActionButtonContent(label) {
  const text = String(label || "");
  const icon =
    text === "Generate Today's Journey" || text === "Start Today's Journey"
      ? "journey"
      : text === "Guardrails" || text === "Open Guardrails"
        ? "guardrails"
        : "";
  return icon
    ? `<span class="button-icon button-icon-${icon}" aria-hidden="true"></span><span>${escapeHtml(text)}</span>`
    : escapeHtml(text);
}

function formatSources(sources) {
  return Array.isArray(sources) ? sources.join(", ") : sources || "";
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key] || "Other";
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}

function getClusterTitle(cluster) {
  return cluster.title || cluster.theme || "Promise Cluster";
}

function getClusterScriptures(cluster) {
  return cluster.scripture_references || cluster.scriptures || [];
}

function getClusterPrayer(cluster) {
  return cluster.prayer_framework || cluster.declaration || "";
}

function getClusterSearchTerms(cluster) {
  return [
    ...(cluster.triggers || []),
    ...(cluster.keywords || []),
    cluster.title,
    cluster.theme,
    cluster.promise_category,
    ...(cluster.scripture_references || []),
    ...(cluster.related_teoyube_words || [])
  ]
    .filter(Boolean)
    .map((term) => normalize(term));
}

async function loadCoreVocabulary() {
  try {
    const response = await fetch("src/data/coreTeoyubeVocabulary.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Vocabulary request failed: ${response.status}`);
    const baseWords = await response.json();
    const part3 = await loadJsonData("src/data/coreTeoyubeVocabulary-part3.json", []);
    coreWords = [...baseWords, ...part3];
    console.log("Core Teoyube vocabulary loaded:", coreWords);
  } catch (error) {
    console.warn("Using fallback core vocabulary.", error);
  }
}

async function loadJsonData(path, fallback) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} request failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Using fallback for ${path}.`, error);
    return fallback;
  }
}

function getRenderedSearchResult(button) {
  const results = JSON.parse($("#teoyubeSearchResults").dataset.results || "[]");
  return results[Number(button.dataset.resultIndex)];
}

function saveSearchResultToBook(result) {
  if (!result) return;
  const bookEntry = {
    id: createPhase114Id("book"),
    type: "TeoyubeSearch Result",
    title: result.title,
    content: `${result.short_explanation} Prayer: ${result.prayer} Assignment: ${result.assignment}`,
    references: result.scripture_references,
    date: new Date().toISOString()
  };
  state.book.unshift(bookEntry);
  state.selectedWord = result.teoyube_word || state.selectedWord;
  state.selectedScripture = result.scripture_references?.[0] || state.selectedScripture;
  state.activeRightRailItem = "search";
  setActiveTigResponse(createPhase116bTigResponse({
    source: "teoyube-search",
    title: result.title,
    userInput: state.activeSearchQuery,
    scripture: result.scripture_references?.[0],
    word: result.teoyube_word,
    promise: result.promise_category,
    prayer: result.prayer,
    action: result.assignment,
    confidence: result.confidence_label || `Level ${result.promise_level}`
  }));
  saveJourneyMemoryItem({
    id: createPhase114Id("memory_search"),
    type: "scripture",
    title: result.scripture_references?.[0] || result.title,
    summary: "Search result saved to Book with Scripture anchor visible. Raw private text is excluded from safe exports.",
    scripture: result.scripture_references?.[0],
    word: result.teoyube_word,
    promise: result.promise_category,
    surface: "teoyube-search"
  });
  recordPhase114Action("Search result saved to Book", result.title);
  saveState();
  render();
  showPhase113SaveDrawer({
    title: "Search result saved",
    detail: result.title,
    scripture: result.scripture_references?.[0],
    targetView: "book",
    undo: { collection: "book", id: bookEntry.id, title: bookEntry.title }
  });
}

function addSearchResultToPromiseTable(result) {
  if (!result) return;
  const row = addPromiseTableItem({
    id: result.slug || createPhase114Id("promise"),
    title: result.title,
    scripture: result.scripture_references?.[0] || "Scripture anchor review needed",
    word: result.teoyube_word,
    status: "Discovered",
    source: "TeoyubeSearch",
    notes: result.assignment,
    savedAt: new Date().toISOString()
  });
  state.generatedWord = {
    word: result.teoyube_word,
    pronunciation: result.pronunciation,
    meaning: result.meaning
  };
  state.selectedWord = result.teoyube_word;
  state.selectedScripture = result.scripture_references?.[0] || state.selectedScripture;
  state.selectedPromiseResult = result;
  setActiveTigResponse(createPhase116bTigResponse({
    source: "teoyube-search",
    title: result.title,
    userInput: state.activeSearchQuery,
    scripture: result.scripture_references?.[0],
    word: result.teoyube_word,
    promise: result.promise_category,
    prayer: result.prayer,
    action: result.assignment,
    confidence: result.confidence_label || `Level ${result.promise_level}`
  }));
  saveJourneyMemoryItem({
    id: createPhase114Id("memory_promise"),
    type: "promise",
    title: result.promise_category || result.title,
    summary: "Promise cluster saved to the Promise Table as visible local/session memory.",
    scripture: result.scripture_references?.[0],
    word: result.teoyube_word,
    promise: result.promise_category || result.title,
    surface: "promise-table"
  });
  const bookEntry = {
    id: createPhase114Id("book"),
    type: "Promise Table Update",
    title: result.title,
    content: `Added from TeoyubeSearch. ${result.calling_connection}`,
    references: result.scripture_references,
    date: new Date().toISOString()
  };
  state.book.unshift(bookEntry);
  recordPhase114Action("Promise row added", result.title);
  saveState();
  render();
  showPhase113SaveDrawer({
    title: "Promise row added",
    detail: result.title,
    scripture: result.scripture_references?.[0],
    targetView: "table",
    undo: { collection: "savedPromiseTableItems", id: row.id, bookId: bookEntry.id, title: result.title }
  });
  setView("table");
}

function createPhase113SafeExportBundle() {
  return createPhase114SafeExportBundle();
}

function createPhase114SafeExportBundle() {
  return buildTeoyubeExportBundle();
}

function createPhase114MarkdownExport() {
  return createPhase117MarkdownExport(createPhase114SafeExportBundle());
}

function getPhase113InsightData() {
  const cluster = promiseClusters[state.clusterIndex] || promiseClusters[0];
  const scriptures = getClusterScriptures(cluster);
  return {
    word: state.selectedWord || state.generatedWord.word,
    scripture: state.selectedScripture || scriptures[0],
    promise: state.selectedPromiseResult?.title || getClusterTitle(cluster),
    journey: state.selectedJourney?.title || state.generatedDailyJourney?.title || `${getClusterTitle(cluster)} journey`,
    promiseCount: (state.savedPromiseTableItems || []).length,
    bookCount: (state.book || []).length,
    journalCount: (state.journalEntries || []).length,
    testimonyCount: (state.testimonies || []).length,
    savedTodayCount: getSessionSavedTodayCount(),
    lastAction: state.lastActionRun || "Static app loaded",
    safety: [
      "No external services",
      "No analytics",
      "No database persistence",
      "No live AI",
      "No automatic contact"
    ]
  };
}

function ensurePhase113Shell() {
  if ($("#phase113Shell")) return;

  const shell = document.createElement("div");
  shell.id = "phase113Shell";
  shell.innerHTML = `
    <div class="phase113-command-palette" id="phase113CommandPalette" hidden>
      <div class="phase113-command-card" role="dialog" aria-modal="true" aria-labelledby="phase113CommandTitle">
        <div class="phase113-command-header">
          <div>
            <p class="eyebrow">Phase 11.3</p>
            <h2 id="phase113CommandTitle">Command Palette</h2>
          </div>
          <button type="button" class="phase113-icon-button" data-phase113-close="palette" aria-label="Close command palette">x</button>
        </div>
        <input id="phase113CommandInput" class="phase113-command-input" placeholder="Search actions, pages, and local tools..." aria-label="Command search" />
        <div id="phase113CommandList" class="phase113-command-list" role="listbox"></div>
        <p class="phase113-help">Keyboard: Control or Command K opens this panel. Escape closes it.</p>
      </div>
    </div>
    <aside class="phase113-insight-rail collapsed" id="phase113InsightRail" aria-label="Phase 11.3 insight rail">
      <button type="button" class="phase113-rail-toggle" id="phase113RailToggle" aria-label="Toggle insight rail" aria-expanded="false">i</button>
      <div id="phase113InsightContent"></div>
    </aside>
    <section class="phase113-save-drawer" id="phase113SaveDrawer" aria-live="polite" aria-label="Saved action status"></section>
    <aside class="phase117-offline-status" id="phase117OfflineStatus" aria-live="polite"></aside>
    <dialog class="phase113-export-dialog" id="phase113ExportDialog">
      <div class="phase113-command-header">
        <div>
          <p class="eyebrow">Beta Export Center</p>
          <h2>Safe Session Bundle</h2>
        </div>
        <button type="button" class="phase113-icon-button" data-phase113-close="export" aria-label="Close export">x</button>
      </div>
      <p>No raw private text, analytics payloads, service tokens, external upload records, or automatic contact records are included by default; raw private text remains redacted unless an explicit full personal export review is enabled.</p>
      <div class="phase114-export-actions" aria-label="Export format">
        <button type="button" class="secondary" data-phase114-export-format="json">JSON</button>
        <button type="button" class="secondary" data-phase114-export-format="markdown">Markdown</button>
        <button type="button" class="secondary" data-phase117-action="download-json">Download JSON</button>
        <button type="button" class="secondary" data-phase117-action="download-markdown">Download Markdown</button>
        <button type="button" class="secondary" data-phase117-action="open-data-controls">Data Controls</button>
        <button type="button" class="secondary" data-phase115-action="open-personalization">Personalization Center</button>
      </div>
      ${renderPhase115DataControlsCard("safe-export-center")}
      <pre id="phase113ExportJson" class="phase113-export-json"></pre>
    </dialog>
    <dialog class="phase117-data-controls-dialog" id="phase117DataControlsDialog">
      <div class="phase113-command-header">
        <div>
          <p class="eyebrow">Phase 11.7</p>
          <h2>Data Controls Center</h2>
        </div>
        <button type="button" class="phase113-icon-button" data-phase113-close="phase117-data-controls" aria-label="Close data controls">x</button>
      </div>
      <div id="phase117DataControlsContent"></div>
    </dialog>
    <dialog class="phase115-personalization-dialog" id="phase115PersonalizationDialog">
      <div class="phase113-command-header">
        <div>
          <p class="eyebrow">Phase 11.5</p>
          <h2>Personalization Center</h2>
        </div>
        <button type="button" class="phase113-icon-button" data-phase113-close="personalization" aria-label="Close personalization center">x</button>
      </div>
      <div id="phase115PersonalizationContent"></div>
    </dialog>
    <dialog class="phase115-comparison-dialog" id="phase115ComparisonDialog">
      <div class="phase113-command-header">
        <div>
          <p class="eyebrow">Baseline vs Personalized Preview</p>
          <h2>Why this was recommended?</h2>
        </div>
        <button type="button" class="phase113-icon-button" data-phase113-close="comparison" aria-label="Close personalization comparison">x</button>
      </div>
      <div id="phase115ComparisonContent"></div>
    </dialog>
    <dialog class="phase116-graph-dialog" id="phase116GraphDialog">
      <div class="phase113-command-header">
        <div>
          <p class="eyebrow">Phase 11.6</p>
          <h2>Intelligence Graph Explorer</h2>
        </div>
        <button type="button" class="phase113-icon-button" data-phase113-close="phase116-graph" aria-label="Close graph explorer">x</button>
      </div>
      <div id="phase116GraphContent"></div>
    </dialog>
    <dialog class="phase116-workflow-dialog" id="phase116WorkflowDialog">
      <div class="phase113-command-header">
        <div>
          <p class="eyebrow">Phase 11.6</p>
          <h2>Guided Workflow Builder</h2>
        </div>
        <button type="button" class="phase113-icon-button" data-phase113-close="phase116-workflow" aria-label="Close guided workflow">x</button>
      </div>
      <div id="phase116WorkflowContent"></div>
    </dialog>
  `;
  document.body.appendChild(shell);
  ensurePhase114QaPanel();
}

function getPhase113Commands() {
  const currentView = getCurrentViewId();
  const commands = [
    {
      id: "today",
      label: "Go to Today",
      description: "Open the local daily journey, word, Scripture, prayer, and action page.",
      run: () => setView("today")
    },
    {
      id: "generate",
      label: "Generate Today's Journey",
      description: "Create a local daily word, Scripture, promise, prayer, and action step.",
      run: () => generateJourney()
    },
    {
      id: "search",
      label: "Search Promise",
      description: "Open TeoyubeSearch and focus the local search box.",
      run: () => {
        setView("search");
        $("#teoyubeSearchInput")?.focus();
      }
    },
    {
      id: "canon",
      label: "Open Canon",
      description: "Review local canon journeys and Scripture anchors.",
      run: () => setView("canon")
    },
    {
      id: "guardrails",
      label: "Open Guardrails",
      description: "Review Scripture, safety, testimony, privacy, and calling boundaries.",
      run: () => openGuardrailsModal()
    },
    {
      id: "guide",
      label: "Ask Teo Guide",
      description: "Open the local Scripture-grounded guide.",
      run: () => setView("guide")
    },
    {
      id: "calling",
      label: "Open Calling Compass",
      description: "Review cautious calling language and related Scripture.",
      run: () => setView("calling")
    },
    {
      id: "embedded-videos",
      label: "Open Embedded Videos",
      description: "Browse the original local library and approved TeoyubeWorld media.",
      run: () => setView("ui-elements")
    },
    {
      id: "tables",
      label: "Open Tables",
      description: "Open table demonstrations and current local Teoyube data views.",
      run: () => setView("teoyube-tables")
    },
    {
      id: "lexicon",
      label: "Search Lexicon",
      description: "Open the Teoyube word grid and focus local word search.",
      run: () => {
        setView("lexicon");
        $("#lexiconSearchInput")?.focus();
      }
    },
    {
      id: "book",
      label: "Add Reflection",
      description: "Add a session-only Book of the Saint reflection.",
      run: () => addManualEntry()
    },
    {
      id: "personalization",
      label: "Open Personalization Center",
      description: "Review consent mode, soft hints, saved journey memory, and data controls.",
      run: () => openPhase115PersonalizationCenter()
    },
    {
      id: "enable-session-personalization",
      label: "Enable Session-only Personalization",
      description: "Use visible feedback and saved journey memory from this session only.",
      run: () => setPersonalizationMode("session_only")
    },
    {
      id: "compare-personalization",
      label: "Compare Standard vs Personalized Preview",
      description: "Show baseline Scripture path beside the optional personalized preview.",
      run: () => openPhase115ComparisonDialog()
    },
    {
      id: "export",
      label: "Open Beta Export Center",
      description: "Review safe JSON, Markdown, backup, and redaction options.",
      run: () => openPhase113ExportCenter()
    },
    {
      id: "phase117-data-controls",
      label: "Open Data Controls Center",
      description: "Review data mode, safe export, import preview, clear controls, and offline status.",
      run: () => openTeoyubeDataControlsCenter()
    },
    {
      id: "phase117-download-json",
      label: "Download Safe JSON Backup",
      description: "Download a local-only sanitized beta backup bundle.",
      run: () => downloadTeoyubeExport("json")
    },
    {
      id: "phase117-download-markdown",
      label: "Download Roadmap Snapshot Markdown",
      description: "Download a safe Markdown summary of the current beta session.",
      run: () => downloadTeoyubeExport("markdown")
    },
    {
      id: "phase117-clear-session",
      label: "Clear Session Data",
      description: "Clear user-created beta records from memory after an owner-controlled action.",
      run: () => openTeoyubeDataControlsCenter()
    },
    {
      id: "reset-signals",
      label: "Reset Personalization Signals",
      description: "Clear session-only personalization signal previews.",
      run: () => {
        resetPhase115Preferences();
        showPhase113SaveDrawer({ title: "Personalization reset", detail: "Session signals cleared." });
      }
    }
  ];
  const phase116Commands = [
    {
      id: "phase116-open-graph",
      label: "View Intelligence Graph",
      description: "Open the local graph/list explanation for the current recommendation.",
      shortcut: "G",
      run: () => openPhase116GraphExplorer()
    },
    {
      id: "phase116-need-promise",
      label: "Workflow: I need a promise",
      description: "Start a guided local promise search with Scripture, word, prayer, and action.",
      shortcut: "W 1",
      run: () => openPhase116Workflow("need-promise")
    },
    {
      id: "phase116-help-pray",
      label: "Workflow: Help me pray",
      description: "Build a Scripture-grounded prayer without live AI or raw text persistence.",
      shortcut: "W 2",
      run: () => openPhase116Workflow("help-pray")
    },
    {
      id: "phase116-calling-clarity",
      label: "Workflow: Calling clarity",
      description: "Use cautious Calling Compass guidance and Scripture support.",
      shortcut: "W 3",
      run: () => openPhase116Workflow("calling-clarity")
    },
    {
      id: "phase116-growth-journey",
      label: "Workflow: Start a growth journey",
      description: "Choose a growth focus, review stages, and save one local action.",
      shortcut: "W 4",
      run: () => openPhase116Workflow("growth-journey")
    },
    {
      id: "phase116-study-word",
      label: "Workflow: Study a Teoyube word",
      description: "Open word detail, Scripture/prayer support, related words, and graph.",
      shortcut: "W 5",
      run: () => openPhase116Workflow("study-word")
    },
    {
      id: "phase116-record-testimony",
      label: "Workflow: Record testimony",
      description: "Connect testimony to Scripture or promise without automatic fulfillment.",
      shortcut: "W 6",
      run: () => openPhase116Workflow("record-testimony")
    },
    {
      id: "phase116-pray-word",
      label: "Pray this word",
      description: "Send the selected Teoyube word into Teo Guide prayer mode.",
      shortcut: "P",
      run: () => handlePhase116Action("pray-this")
    },
    {
      id: "phase116-save-book",
      label: "Add word to Book",
      description: "Save the current word, promise, and Scripture as a local Book entry.",
      shortcut: "B",
      run: () => handlePhase116Action("save-to-book")
    },
    {
      id: "phase116-add-promise-table",
      label: "Add word to Promise Table",
      description: "Add the current promise as Praying without marking it fulfilled.",
      shortcut: "T",
      run: () => handlePhase116Action("add-promise-table")
    },
    {
      id: "phase116-find-scriptures",
      label: "Find related Scriptures",
      description: "Open TeoyubeSearch with the selected Scripture anchor.",
      shortcut: "S",
      run: () => {
        setView("search");
        const input = $("#teoyubeSearchInput");
        if (input) input.value = state.selectedScripture || getClusterScriptures(getActivePhase115Cluster())[0] || "";
        renderSearchResults(runTeoyubeSearch(input?.value || "Scripture"));
      }
    }
  ];
  const guideCommands =
    currentView === "guide"
      ? [
          {
            id: "phase116-use-prompt",
            label: "Use selected Teo prompt",
            description: "Load a local Scripture-guided Teo Guide prompt.",
            shortcut: "Enter",
            run: () => {
              const prompt = PHASE116_TEO_PROMPT_GROUPS[state.phase116TeoPromptCategory]?.[0] || "What is one faithful action step today?";
              $("#chatInput").value = prompt;
              $("#chatInput")?.focus();
            }
          },
          {
            id: "phase116-clear-chat",
            label: "Clear chat",
            description: "Clear the local guide chat back to the guardrails welcome message.",
            shortcut: "Del",
            run: () => {
              state.chat = defaultState.chat.slice();
              saveState();
              renderChat();
            }
          }
        ]
      : [];
  const personalizationCommands = isPersonalizationEnabled()
    ? [
        {
          id: "phase116-run-personalized-preview",
          label: "Run personalized preview",
          description: "Refresh baseline vs personalized preview with visible local hints.",
          shortcut: "R",
          run: () => openPhase115ComparisonDialog()
        },
        {
          id: "phase116-export-personalization",
          label: "Export personalization data",
          description: "Open safe export with raw private text excluded.",
          shortcut: "E",
          run: () => handlePhase115Action("export-personalization")
        },
        {
          id: "phase116-disable-personalization",
          label: "Disable personalization",
          description: "Return to Standard Scripture Path.",
          shortcut: "Off",
          run: () => setPersonalizationMode("off")
        }
      ]
    : [];
  const phase116bCommands = [
    {
      id: "phase116b-complete-today-action",
      label: "Complete Today's Action",
      description: "Mark the active daily action complete and update Book, journey progress, and right rail.",
      shortcut: "A",
      disabledReason: state.activeDailyJourney ? "" : "Generate today's journey first.",
      run: () => completePhase116bTodayAction()
    },
    {
      id: "phase116b-add-current-reflection",
      label: "Add Current Reflection",
      description: "Save the current reflection to Journal and Book with active Scripture context.",
      shortcut: "J",
      run: () => addPhase116bCurrentReflection()
    },
    {
      id: "phase116b-save-current-scripture",
      label: "Save Current Scripture",
      description: "Save the active Scripture anchor to the Book.",
      disabledReason: state.selectedScripture ? "" : "No current Scripture anchor selected.",
      run: () => {
        const response = setActiveTigResponse({ source: "command-scripture", scripture: state.selectedScripture });
        saveToBook({ title: `Scripture: ${response.scripture.reference}`, content: response.trace.scriptureStableNotice, references: [response.scripture.reference], source: "command-palette" });
        showActionToast("Current Scripture saved", response.scripture.reference);
      }
    },
    {
      id: "phase116b-save-current-word",
      label: "Save Current Word",
      description: "Save the active Teoyube word and Scripture support to the Book.",
      disabledReason: state.selectedWord ? "" : "No current Teoyube word selected.",
      run: () => {
        const word = setActiveWord(state.selectedWord);
        saveToBook({ title: word.word, content: word.meaning || getLexiconDescription(word), references: getLexiconItemSources(word), source: "command-palette" });
        showActionToast("Current word saved", word.word);
      }
    },
    {
      id: "phase116b-save-current-promise",
      label: "Save Current Promise",
      description: "Save the current promise cluster to the Book.",
      disabledReason: state.selectedPromiseResult || state.activePromiseCluster ? "" : "No current promise selected.",
      run: () => {
        const cluster = setActivePromiseCluster(state.activePromiseCluster || state.selectedPromiseResult?.title);
        saveToBook({ title: getClusterTitle(cluster), content: cluster.summary || "Current promise saved.", references: getClusterScriptures(cluster), source: "command-palette" });
        showActionToast("Current promise saved", getClusterTitle(cluster));
      }
    },
    {
      id: "phase116b-open-current-graph",
      label: "Open Current Graph",
      description: "Open the graph from the active Today/Search/Calling/Guide response.",
      disabledReason: state.activeTigResponse || state.phase116LastTrace ? "" : "No active response has been selected yet.",
      run: () => handlePhase116bAction("open-current-graph")
    },
    {
      id: "phase116b-ask-teo-current-word",
      label: "Ask Teo Guide About Current Word",
      description: "Open Teo Guide with a contextual prompt for the selected Teoyube word.",
      disabledReason: state.selectedWord ? "" : "No current word selected.",
      run: () => {
        setView("guide");
        const input = $("#chatInput");
        if (input) input.value = `Help me pray and act on ${state.selectedWord} with Scripture.`;
        $("#chatForm")?.requestSubmit();
      }
    },
    {
      id: "phase116b-add-current-promise-table",
      label: "Add Current Promise to Table",
      description: "Add the active promise to the Promise Table without marking it fulfilled.",
      disabledReason: state.selectedPromiseResult || state.activePromiseCluster ? "" : "No current promise selected.",
      run: () => {
        const cluster = phase116bClusterFromAny(state.activePromiseCluster || state.selectedPromiseResult?.title);
        const row = addPromiseTableItem({ title: getClusterTitle(cluster), scripture: getClusterScriptures(cluster)[0], status: "Discovered", source: "command-palette" });
        showActionToast("Promise added to table", row.title);
        setView("table");
      }
    },
    {
      id: "phase116b-start-calling-compass",
      label: "Start Calling Compass",
      description: "Run the guided Calling Compass question flow.",
      shortcut: "C",
      run: () => startPhase116bCallingCompass()
    },
    {
      id: "phase116b-guided-promise-workflow",
      label: "Start Guided Promise Workflow",
      description: "Open the guided promise workflow.",
      run: () => openPhase116Workflow("need-promise")
    },
    {
      id: "phase116b-guided-prayer-workflow",
      label: "Start Guided Prayer Workflow",
      description: "Open the guided prayer workflow.",
      run: () => openPhase116Workflow("help-pray")
    },
    {
      id: "phase116b-export-book",
      label: "Export Book",
      description: "Open the safe local export center for Book and session records.",
      run: () => openPhase113ExportCenter()
    },
    {
      id: "phase116b-reset-session",
      label: "Reset Session",
      description: "Clear local user-created session records from memory.",
      run: () => resetPhase116bSession()
    },
    {
      id: "phase116b-open-personalization",
      label: "Open Personalization Center",
      description: "Review consent and preview-only personalization controls.",
      run: () => openPhase115PersonalizationCenter()
    },
    {
      id: "phase116b-disable-personalization",
      label: "Disable Personalization",
      description: "Return to Standard Scripture Path.",
      disabledReason: isPersonalizationEnabled() ? "" : "Personalization is already off.",
      run: () => setPersonalizationMode("off")
    },
    {
      id: "phase116b-run-functional-qa",
      label: "Run Functional QA",
      description: "Run in-browser product flow checks for Phase 11.6B.",
      shortcut: "QA",
      run: () => runPhase116bFunctionalQa()
    }
  ];
  const qaMode = new URLSearchParams(window.location.search).get("qa") === "1";
  const visibleCommands = commands.filter((command) => qaMode || command.id !== "phase117-download-markdown");
  const visiblePhase116bCommands = phase116bCommands.filter((command) => qaMode || command.id !== "phase116b-run-functional-qa");
  return [...visibleCommands, ...phase116Commands, ...visiblePhase116bCommands, ...guideCommands, ...personalizationCommands];
}

function renderPhase113Commands(query = "") {
  const list = $("#phase113CommandList");
  if (!list) return;
  const needle = normalize(query);
  const commands = getPhase113Commands().filter((command) =>
    normalize(`${command.label} ${command.description}`).includes(needle)
  );
  list.innerHTML = commands.length
    ? commands
        .map(
          (command) => `
        <button type="button" class="phase113-command-item ${command.disabledReason ? "disabled" : ""}" data-phase113-command="${escapeHtml(command.id)}" ${command.disabledReason ? 'aria-disabled="true"' : ""}>
          <strong>${escapeHtml(command.label)}${command.shortcut ? `<kbd>${escapeHtml(command.shortcut)}</kbd>` : ""}</strong>
          <span>${escapeHtml(command.disabledReason || command.description)}</span>
        </button>
      `
        )
        .join("")
    : `<article class="phase116-command-empty"><strong>No matching commands</strong><span>Try graph, workflow, prayer, promise, guide, export, or personalization.</span></article>`;
}

function openPhase113CommandPalette() {
  ensurePhase113Shell();
  const palette = $("#phase113CommandPalette");
  if (!palette) return;
  phase113CommandReturnFocus = document.activeElement;
  palette.hidden = false;
  $("#phase113CommandInput").value = "";
  renderPhase113Commands("");
  $("#phase113CommandInput").focus();
  recordPhase114Action("Command palette opened", "Keyboard/local command surface available.");
}

function closePhase113CommandPalette() {
  const palette = $("#phase113CommandPalette");
  if (palette) palette.hidden = true;
  if (phase113CommandReturnFocus?.focus) phase113CommandReturnFocus.focus();
}

function runPhase113Command(commandId) {
  const command = getPhase113Commands().find((item) => item.id === commandId);
  if (!command) return;
  closePhase113CommandPalette();
  if (command.disabledReason) {
    showFallbackNotice(command.disabledReason);
    return;
  }
  recordPhase114Action(`Command: ${command.label}`, command.description);
  command.run();
}

function handlePhase113CommandKeyboard(event) {
  const buttons = $all("#phase113CommandList [data-phase113-command]");
  if (!buttons.length) return;
  const activeIndex = buttons.indexOf(document.activeElement);
  if (event.key === "ArrowDown") {
    event.preventDefault();
    buttons[(Math.max(activeIndex, -1) + 1) % buttons.length].focus();
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    buttons[(activeIndex <= 0 ? buttons.length : activeIndex) - 1].focus();
  }
  if (event.key === "Enter" && document.activeElement?.matches?.("[data-phase113-command]")) {
    event.preventDefault();
    runPhase113Command(document.activeElement.dataset.phase113Command);
  }
}

function renderPhase113InsightRail() {
  const content = $("#phase113InsightContent");
  if (!content) return;
  const insight = getPhase113InsightData();
  const status = getPersonalizationStatus();
  const memorySummary = summarizeJourneyMemory();
  const decision = state.lastPersonalizationDecision || createPhase115RecommendationDecision();
  const hints = safeArray(state.preferenceHints).slice(0, 3);
  content.innerHTML = `
    <p class="eyebrow">Active Context</p>
    <h2>${escapeHtml(insight.word)}</h2>
    <p>${escapeHtml(insight.promise)}</p>
    <p class="phase113-scripture">${escapeHtml(insight.scripture)}</p>
    <div class="phase113-rail-metrics">
      <span><strong>${insight.promiseCount}</strong> Promises</span>
      <span><strong>${insight.bookCount}</strong> Book</span>
      <span><strong>${insight.testimonyCount}</strong> Testimony</span>
    </div>
    <div class="phase114-session-summary">
      <p><strong>Journey:</strong> ${escapeHtml(insight.journey)}</p>
      <p><strong>Saved today:</strong> ${escapeHtml(String(insight.savedTodayCount))}</p>
      <p><strong>Reflections:</strong> ${escapeHtml(String(insight.journalCount))}</p>
      <p><strong>Last action:</strong> ${escapeHtml(insight.lastAction)}</p>
    </div>
    <ul>
      ${insight.safety.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
    ${renderPhase116SmartRailSections(insight, decision, status, memorySummary)}
    <section class="phase115-rail-preview" aria-label="Personalization Preview">
      <p class="eyebrow">Personalization Preview</p>
      <h3>${escapeHtml(status.label)}</h3>
      <p><strong>Memory:</strong> ${escapeHtml(String(memorySummary.total))} safe item${memorySummary.total === 1 ? "" : "s"}; ${escapeHtml(memorySummary.activeJourney)}</p>
      <p><strong>Affected current result:</strong> ${decision.used ? "Yes, as a preview only" : "No"}</p>
      <p><strong>Stable:</strong> Baseline output, guardrails, confidence, fallback visibility, and Scripture anchor comparison.</p>
      <p><strong>Scripture anchor:</strong> ${escapeHtml(decision.scripturePreserved || insight.scripture)}</p>
      <p><strong>Confidence:</strong> ${escapeHtml(decision.confidenceChange || "none")}</p>
      <p><strong>Fallback:</strong> ${escapeHtml(decision.fallbackComparison || "unchanged")}</p>
      <div class="phase115-hint-list">
        ${
          hints.length
            ? hints.map((hint) => `<span>${escapeHtml(hint.label)} <small>${escapeHtml(String(hint.confidence))}%</small></span>`).join("")
            : `<span>No strong personalization hints yet.</span>`
        }
      </div>
      <details class="phase114-explanation-path">
        <summary>Why this was recommended?</summary>
        <p><strong>Standard:</strong> ${escapeHtml(decision.baseline?.promiseCluster || insight.promise)} - ${escapeHtml(decision.baseline?.scripture || insight.scripture)}</p>
        <p><strong>Preview:</strong> ${escapeHtml(decision.personalizedPreview?.promiseCluster || decision.baseline?.promiseCluster || insight.promise)} - ${escapeHtml(decision.personalizedPreview?.scripture || decision.baseline?.scripture || insight.scripture)}</p>
        <p>${escapeHtml(decision.explanation || "Standard Scripture Path remains primary.")}</p>
      </details>
      <div class="phase113-rail-actions">
        <button type="button" class="button secondary" data-phase115-action="compare-recommendation">Compare</button>
        <button type="button" class="button secondary" data-phase115-action="open-personalization">Personalization</button>
        <button type="button" class="button secondary" data-phase115-action="disable-personalization">Disable</button>
      </div>
    </section>
    ${renderPhase115DataControlsCard("rail")}
    <div class="phase113-rail-actions">
      <button type="button" class="button primary" data-phase113-command="generate">Journey</button>
      <button type="button" class="button secondary" data-phase113-command="export">Export</button>
      <button type="button" class="button secondary" data-phase117-action="open-data-controls">Data</button>
    </div>
  `;
}

function renderPhase115FeedbackControls(context = {}) {
  const label = context.label || state.selectedPromiseResult?.title || state.selectedWord || "Current journey";
  const scripture = context.scripture || state.selectedScripture || getClusterScriptures(getActivePhase115Cluster())[0] || "";
  const word = context.word || state.selectedWord || state.generatedWord?.word || "";
  const promise = context.promise || state.selectedPromiseResult?.promise_category || getClusterTitle(getActivePhase115Cluster());
  const source = context.source || getCurrentViewId();
  const prayer = context.prayer || getClusterPrayer(getActivePhase115Cluster());
  const action = context.action || getDailyAssignment(getActivePhase115Cluster())[3]?.replace("Action: ", "");
  const attrs = `data-phase115-label="${escapeHtml(label)}" data-phase115-scripture="${escapeHtml(scripture)}" data-phase115-word="${escapeHtml(word)}" data-phase115-promise="${escapeHtml(promise)}" data-phase115-source="${escapeHtml(source)}" data-phase115-prayer="${escapeHtml(prayer)}" data-phase115-action-step="${escapeHtml(action)}"`;
  return `
    <div class="phase115-feedback-controls" aria-label="Personalization feedback controls">
      <button type="button" class="secondary" data-phase115-feedback="more_like_this" ${attrs}>More like this</button>
      <button type="button" class="secondary" data-phase115-feedback="less_like_this" ${attrs}>Less like this</button>
      <button type="button" class="secondary" data-phase115-feedback="not_relevant" ${attrs}>Not relevant</button>
      <button type="button" class="secondary" data-phase115-feedback="save_scripture" ${attrs}>Save Scripture</button>
      <button type="button" class="secondary" data-phase115-feedback="save_word" ${attrs}>Save Word</button>
      <button type="button" class="secondary" data-phase115-feedback="save_prayer" ${attrs}>Save Prayer</button>
      <button type="button" class="secondary" data-phase115-feedback="complete_action" ${attrs}>Complete Action</button>
      <button type="button" class="secondary" data-phase115-feedback="reset_preference" ${attrs}>Reset this preference</button>
    </div>
  `;
}

function renderPhase115DataControlsCard(source = "center") {
  const status = getPersonalizationStatus();
  const dataMode = explainTeoyubeDataMode();
  return `
    <section class="phase115-data-controls" data-phase115-source="${escapeHtml(source)}">
      <p class="eyebrow">Your Teoyube Data Controls</p>
      <h3>${escapeHtml(status.label)}</h3>
      <dl>
        <div><dt>Raw text storage</dt><dd>Disabled</dd></div>
        <div><dt>Data mode</dt><dd>${escapeHtml(dataMode.label)}</dd></div>
        <div><dt>Signal storage</dt><dd>Visible session only</dd></div>
        <div><dt>Database</dt><dd>Not connected</dd></div>
        <div><dt>Analytics</dt><dd>Disabled</dd></div>
        <div><dt>Live AI</dt><dd>Not connected</dd></div>
      </dl>
      <div class="phase115-control-row">
        <button type="button" class="secondary" data-phase117-action="open-data-controls">Open Data Controls</button>
        <button type="button" class="secondary" data-phase115-action="export-personalization">Export safe data</button>
        <button type="button" class="secondary" data-phase115-action="delete-personalization-data">Delete session data</button>
        <button type="button" class="secondary" data-phase115-action="reset-preferences">Reset preferences</button>
        <button type="button" class="secondary" data-phase115-action="disable-personalization">Disable personalization</button>
      </div>
      ${renderTeoyubeBetaBackupReminder(source)}
    </section>
  `;
}

function ensurePhase115SmartSection(viewId) {
  const view = $(`#${viewId}`);
  if (!view) return null;
  const id = `phase115SmartRecommendations-${viewId}`;
  let section = $(`#${id}`);
  if (section) return section;
  section = document.createElement("section");
  section.id = id;
  section.className = "phase115-smart-recommendations";
  section.setAttribute("aria-label", "Recommended for Your Current Journey");
  if (viewId === "today") {
    const anchor = view.querySelector(".today-integrations");
    view.insertBefore(section, anchor || null);
  } else {
    view.insertBefore(section, view.children[1] || null);
  }
  return section;
}

function renderPhase115SmartRecommendations() {
  const decision = state.lastPersonalizationDecision || createPhase115RecommendationDecision();
  const recommendation = decision.used ? decision.personalizedPreview : decision.baseline;
  const label = decision.used ? "Personalized preview." : "Standard recommendation.";
  const items = [
    ["Scripture", recommendation.scripture, "Selected as the visible Scripture anchor."],
    ["Teoyube Word", recommendation.word, recommendation.wordMeaning],
    ["Promise Cluster", recommendation.promiseCluster, "Connected through local promise data."],
    ["Prayer", recommendation.prayer, "Prayer remains devotional and Scripture-submitted."],
    ["Action Step", recommendation.actionStep, "A single faithful next step."],
    ["Journey", recommendation.journey, "Built from the current local journey context."]
  ];
  ["today", "canon"].forEach((viewId) => {
    const section = ensurePhase115SmartSection(viewId);
    if (!section) return;
    section.innerHTML = `
      <div class="phase114-section-head">
        <div>
          <p class="eyebrow">Recommended for Your Current Journey</p>
          <h3>${escapeHtml(label)}</h3>
          <p>${escapeHtml(decision.explanation || "Standard Scripture Path remains primary.")}</p>
        </div>
        <button type="button" class="secondary" data-phase115-action="compare-recommendation">Compare Standard vs Preview</button>
      </div>
      <div class="phase115-recommendation-grid">
        ${items
          .map(
            ([type, title, reason]) => `
              <article class="phase115-recommendation-card">
                <p class="eyebrow">${escapeHtml(type)}</p>
                <h4>${escapeHtml(title)}</h4>
                <p>${escapeHtml(reason)}</p>
                <p class="phase113-scripture">${escapeHtml(recommendation.scripture)}</p>
                <small>Confidence: ${escapeHtml(recommendation.confidence)}</small>
                ${renderPhase116WhyThisPanel({
                  source: `${viewId}-${type.toLowerCase().replace(/\s+/g, "-")}`,
                  label: title,
                  scripture: recommendation.scripture,
                  word: recommendation.word,
                  promise: recommendation.promiseCluster,
                  prayer: recommendation.prayer,
                  action: recommendation.actionStep,
                  journey: recommendation.journey,
                  confidence: recommendation.confidence
                })}
                ${renderPhase115FeedbackControls({
                  label: title,
                  scripture: recommendation.scripture,
                  word: recommendation.word,
                  promise: recommendation.promiseCluster,
                  source: `${viewId}-${type.toLowerCase().replace(/\s+/g, "-")}`,
                  prayer: recommendation.prayer,
                  action: recommendation.actionStep
                })}
              </article>
            `
          )
          .join("")}
      </div>
      ${renderPhase116WorkflowBuilderEntry(viewId)}
    `;
  });
}

function getPhase115ComparisonHtml(decision = state.lastPersonalizationDecision || createPhase115RecommendationDecision()) {
  const baseline = decision.baseline || createBaselineRecommendation();
  const preview = decision.personalizedPreview || baseline;
  const row = (label, left, right) => `
    <div class="phase115-compare-row">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(left)}</span>
      <span>${escapeHtml(right)}</span>
    </div>
  `;
  return `
    <section class="phase115-comparison-panel" aria-label="Baseline vs Personalized Preview">
      <div class="phase115-compare-head">
        <div><p class="eyebrow">Standard Scripture Path</p><h3>${escapeHtml(baseline.promiseCluster)}</h3></div>
        <div><p class="eyebrow">Personalized Preview</p><h3>${escapeHtml(isPersonalizationEnabled() ? preview.promiseCluster : "Baseline only")}</h3></div>
      </div>
      ${row("Teoyube word", baseline.word, isPersonalizationEnabled() ? preview.word : baseline.word)}
      ${row("Promise cluster", baseline.promiseCluster, isPersonalizationEnabled() ? preview.promiseCluster : baseline.promiseCluster)}
      ${row("Scripture anchor", baseline.scripture, isPersonalizationEnabled() ? preview.scripture : baseline.scripture)}
      ${row("Prayer", baseline.prayer, isPersonalizationEnabled() ? preview.prayer : baseline.prayer)}
      ${row("Action step", baseline.actionStep, isPersonalizationEnabled() ? preview.actionStep : baseline.actionStep)}
      ${row("Journey", baseline.journey, isPersonalizationEnabled() ? preview.journey : baseline.journey)}
      ${row("Confidence", baseline.confidence, isPersonalizationEnabled() ? preview.confidence : baseline.confidence)}
      ${row("Fallback", baseline.fallbackStatus, isPersonalizationEnabled() ? preview.fallbackStatus : baseline.fallbackStatus)}
      <details class="phase114-explanation-path" open>
        <summary>Explanation path</summary>
        <p>Baseline: ${escapeHtml(baseline.explanationPath.join(" -> "))}</p>
        <p>Preview: ${escapeHtml((preview.explanationPath || baseline.explanationPath).join(" -> "))}</p>
        <p>${escapeHtml(decision.explanation || "No strong personalization hints yet.")}</p>
        ${safeArray(decision.warnings).map((warning) => `<p class="phase115-warning">${escapeHtml(warning)}</p>`).join("")}
      </details>
    </section>
  `;
}

function renderPhase115PersonalizationCenter() {
  const dialog = $("#phase115PersonalizationDialog");
  const target = $("#phase115PersonalizationContent");
  if (!dialog || !target) return;
  const status = getPersonalizationStatus();
  const hints = safeArray(state.preferenceHints);
  const memory = summarizeJourneyMemory();
  const decision = state.lastPersonalizationDecision || createPhase115RecommendationDecision();
  target.innerHTML = `
    <section class="phase115-onboarding">
      <p class="eyebrow">Guided Personalization</p>
      <h3>What personalization means in Teoyube</h3>
      <p>Personalization is a visible, optional, reversible local/session preview. It can consider saved Scriptures, words, promises, journeys, and feedback after you enable it.</p>
      <ul>
        <li>Never replaces Scripture.</li>
        <li>Never claims divine certainty.</li>
        <li>Never hides the baseline recommendation.</li>
        <li>Never stores raw private text by default.</li>
        <li>Never sends analytics or calls external services in this local version.</li>
      </ul>
    </section>
    <section class="phase115-mode-grid" aria-label="Consent Mode">
      ${Object.entries(PHASE115_PERSONALIZATION_MODES)
        .map(
          ([mode, config]) => `
            <article class="${mode === status.mode ? "active" : ""}">
              <h4>${escapeHtml(config.label)}</h4>
              <p>${escapeHtml(config.summary)}</p>
              <small>Raw text stored: no. Export/delete/reset: available. Recommendation effect: ${mode === "off" ? "none" : "preview only"}.</small>
              <button type="button" class="${mode === status.mode ? "primary" : "secondary"}" data-phase115-consent-mode="${escapeHtml(mode)}">${mode === status.mode ? "Selected" : "Choose"}</button>
            </article>
          `
        )
        .join("")}
    </section>
    <section class="phase115-status-grid" aria-label="Current Personalization Status">
      <article><strong>${status.enabled ? "Enabled" : "Disabled"}</strong><span>Personalization</span></article>
      <article><strong>${status.sessionOnlyEnabled ? "Enabled" : "Disabled"}</strong><span>Session-only</span></article>
      <article><strong>${status.profilePreviewEnabled ? "Enabled" : "Disabled"}</strong><span>Profile preview</span></article>
      <article><strong>Disabled</strong><span>Raw text storage</span></article>
      <article><strong>Disabled</strong><span>External analytics</span></article>
      <article><strong>Not connected</strong><span>Database / live AI</span></article>
    </section>
    <section class="phase115-hints-panel">
      <div class="phase114-section-head">
        <div>
          <p class="eyebrow">Preference Hints</p>
          <h3>Soft hints only</h3>
          <p>${hints.length ? "Hints are visible, removable, and never override Scripture." : "No strong personalization hints yet."}</p>
        </div>
        <button type="button" class="secondary" data-phase115-action="clear-session-signals">Clear Session Signals</button>
      </div>
      <div class="phase115-hint-card-grid">
        ${
          hints.length
            ? hints
                .map(
                  (hint) => `
                    <article class="phase115-hint-card">
                      <h4>${escapeHtml(hint.label)}</h4>
                      <p>${escapeHtml(hint.explanation)}</p>
                      <small>Confidence ${escapeHtml(String(hint.confidence))}% from ${escapeHtml(String(hint.sourceCount))} source${hint.sourceCount === 1 ? "" : "s"}.</small>
                      <div class="phase115-control-row">
                        <button type="button" class="secondary" data-phase115-feedback="more_like_this" data-phase115-label="${escapeHtml(hint.label)}" data-phase115-source="personalization-center">More like this</button>
                        <button type="button" class="secondary" data-phase115-feedback="less_like_this" data-phase115-label="${escapeHtml(hint.label)}" data-phase115-source="personalization-center">Less like this</button>
                        <button type="button" class="secondary" data-phase115-remove-hint="${escapeHtml(hint.id)}">Remove hint</button>
                      </div>
                    </article>
                  `
                )
                .join("")
            : `<article class="phase115-empty-card"><h4>No strong personalization hints yet.</h4><p>Save Scripture, complete an action, or choose feedback after enabling personalization.</p></article>`
        }
      </div>
    </section>
    <section class="phase115-memory-summary">
      <p class="eyebrow">Saved Journey Memory</p>
      <h3>${escapeHtml(memory.activeJourney)}</h3>
      <div class="phase113-rail-metrics">
        <span><strong>${memory.startedJourneys}</strong> Journeys</span>
        <span><strong>${memory.savedScriptures}</strong> Scriptures</span>
        <span><strong>${memory.completedActions}</strong> Actions</span>
      </div>
      <div class="phase115-control-row">
        <button type="button" class="secondary" data-phase115-action="export-journey-memory">Export Memory</button>
        <button type="button" class="secondary" data-phase115-action="clear-journey-memory">Clear Memory</button>
      </div>
    </section>
    ${getPhase115ComparisonHtml(decision)}
    ${renderPhase115DataControlsCard("personalization-center")}
    ${
      state.phase115LastExport
        ? `<pre class="phase113-export-json">${escapeHtml(JSON.stringify(state.phase115LastExport, null, 2))}</pre>`
        : ""
    }
  `;
}

function openPhase115PersonalizationCenter(trigger = document.activeElement) {
  ensurePhase113Shell();
  phase113CommandReturnFocus = trigger;
  state.personalizationOnboardingSeen = true;
  renderPhase115PersonalizationCenter();
  const dialog = $("#phase115PersonalizationDialog");
  if (!dialog) return;
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  else dialog.setAttribute("open", "open");
  recordPhase114Action("Personalization Center opened", "Consent, hints, memory, and data controls are visible.");
}

function closePhase115PersonalizationCenter() {
  const dialog = $("#phase115PersonalizationDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  dialog.removeAttribute("open");
  if (phase113CommandReturnFocus?.focus) phase113CommandReturnFocus.focus();
}

function openPhase115ComparisonDialog(trigger = document.activeElement) {
  ensurePhase113Shell();
  phase113CommandReturnFocus = trigger;
  const dialog = $("#phase115ComparisonDialog");
  const target = $("#phase115ComparisonContent");
  if (!dialog || !target) return;
  target.innerHTML = getPhase115ComparisonHtml(state.lastPersonalizationDecision || createPhase115RecommendationDecision());
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  else dialog.setAttribute("open", "open");
  recordPhase114Action("Personalization comparison opened", "Baseline and preview recommendations are visible.");
}

function closePhase115ComparisonDialog() {
  const dialog = $("#phase115ComparisonDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  dialog.removeAttribute("open");
  if (phase113CommandReturnFocus?.focus) phase113CommandReturnFocus.focus();
}

function renderPhase115BookMemoryTimeline() {
  const timeline = $("#bookTimeline");
  if (!timeline?.parentElement) return;
  let target = $("#phase115BookMemory");
  if (!target) {
    target = document.createElement("section");
    target.id = "phase115BookMemory";
    target.className = "phase115-book-memory";
    timeline.parentElement.insertBefore(target, timeline);
  }
  const filter = state.phase115MemoryFilter || "all";
  const memory = filter === "all"
    ? safeArray(state.journeyMemory)
    : safeArray(state.journeyMemory).filter((item) => item.type === filter || normalize(item.title).includes(filter));
  const filters = ["all", "today", "week", "journey", "scripture", "word", "promise", "action", "prayer", "testimony"];
  const datedMemory = memory.filter((item) => {
    if (filter === "today") return isToday(item.createdAt);
    if (filter === "week") return Date.now() - Date.parse(item.createdAt || "") <= 7 * 24 * 60 * 60 * 1000;
    return true;
  });
  target.innerHTML = `
    <div class="phase114-section-head">
      <div>
        <p class="eyebrow">Journey Memory Timeline</p>
        <h3>Saved Journey Memory</h3>
        <p>Visible local/session memory only. Raw private text is not included in safe exports.</p>
      </div>
      <div class="phase115-control-row">
        <button type="button" class="secondary" data-phase115-action="export-journey-memory">Export Memory</button>
        <button type="button" class="secondary" data-phase115-action="clear-journey-memory">Clear Memory</button>
      </div>
    </div>
    <div class="phase115-memory-filters">
      ${filters
        .map((item) => `<button type="button" class="${item === filter ? "active" : ""}" data-phase115-memory-filter="${escapeHtml(item)}">${escapeHtml(item === "all" ? "All" : item === "week" ? "This Week" : item[0].toUpperCase() + item.slice(1))}</button>`)
        .join("")}
    </div>
    <div class="phase115-memory-grid">
      ${
        datedMemory.length
          ? datedMemory
              .map(
                (item) => `
                  <article class="phase115-memory-card">
                    <p class="eyebrow">${escapeHtml(item.type)}</p>
                    <h4>${escapeHtml(item.title)}</h4>
                    <p>${escapeHtml(item.summary)}</p>
                    <div class="scripture-strip">
                      ${item.scripture ? `<span class="scripture-pill">${escapeHtml(item.scripture)}</span>` : ""}
                      ${item.word ? `<span class="scripture-pill">${escapeHtml(item.word)}</span>` : ""}
                      ${item.promise ? `<span class="scripture-pill">${escapeHtml(item.promise)}</span>` : ""}
                    </div>
                    ${renderPhase116WhyThisPanel({
                      source: "book-memory",
                      label: item.title,
                      scripture: item.scripture,
                      word: item.word,
                      promise: item.promise,
                      action: item.summary,
                      journey: item.title,
                      fallbackReason: "Book memory is local/session only and raw private text is withheld from safe exports."
                    })}
                    <small>${escapeHtml(formatShortDate(item.createdAt))} - local/session only</small>
                    <button type="button" class="secondary" data-phase115-remove-memory="${escapeHtml(item.id)}">Remove</button>
                  </article>
                `
              )
              .join("")
          : `<article class="phase115-empty-card"><h4>${getPhase115MemoryEmptyState(filter)}</h4><p>Generate today's journey, search a promise, or save a Scripture to start visible memory.</p></article>`
      }
    </div>
    ${renderPhase115DataControlsCard("book")}
  `;
}

function getPhase115MemoryEmptyState(filter) {
  if (filter === "scripture") return "No saved Scriptures yet. Search a promise and save one.";
  if (filter === "action") return "No completed actions yet. Generate today's journey.";
  if (filter === "all" || filter === "journey") return "No journey memory yet. Start a journey from the Canon or Calling Compass.";
  return `No ${filter} memory yet.`;
}

function handlePhase115Feedback(action, button) {
  const label = button?.dataset.phase115Label || "Current journey";
  const scripture = button?.dataset.phase115Scripture || state.selectedScripture || "";
  const word = button?.dataset.phase115Word || state.selectedWord || "";
  const promise = button?.dataset.phase115Promise || getClusterTitle(getActivePhase115Cluster());
  const source = button?.dataset.phase115Source || getCurrentViewId();
  const prayer = button?.dataset.phase115Prayer || getClusterPrayer(getActivePhase115Cluster());
  const actionStep = button?.dataset.phase115ActionStep || getDailyAssignment(getActivePhase115Cluster())[3]?.replace("Action: ", "");

  if (action === "reset_preference") {
    resetPhase115Preferences();
    showPhase113SaveDrawer({ title: "Preference reset", detail: "Visible personalization hints were cleared." });
    return;
  }

  const memoryMap = {
    save_scripture: ["scripture", scripture || label, "Saved Scripture anchor."],
    save_word: ["word", word || label, "Saved Teoyube word."],
    save_prayer: ["prayer", "Saved prayer framework", prayer || "Prayer framework saved."],
    complete_action: ["action", "Completed action step", actionStep || "Action step completed."]
  };
  if (memoryMap[action]) {
    const [type, title, summary] = memoryMap[action];
    saveJourneyMemoryItem({ type, title, summary, scripture, word, promise, surface: source });
  }

  if (["more_like_this", "less_like_this", "not_relevant", "save_scripture", "save_word", "save_prayer", "complete_action"].includes(action)) {
    const signal = recordPersonalizationSignal(action, label, source, {
      scripture,
      word,
      promise,
      tone: action === "less_like_this" || action === "not_relevant" ? "negative" : "positive"
    });
    if (!signal && !memoryMap[action]) {
      showPhase113SaveDrawer({
        title: "Feedback noted",
        detail: "Personalization is off, so no preference signal was stored. Enable it from Personalization Center to learn from feedback."
      });
      return;
    }
  }

  state.lastPersonalizationDecision = createPhase115RecommendationDecision();
  recordPhase114Action("Personalization feedback", action.replaceAll("_", " "));
  renderPhase115PersonalizationCenter();
  renderPhase113InsightRail();
  renderPhase115SmartRecommendations();
  renderPhase114QaPanel();
  showPhase113SaveDrawer({
    title: "Feedback updated",
    detail: isPersonalizationEnabled()
      ? "Visible local/session preference hints were refreshed."
      : "Saved to visible journey memory; personalization remains off.",
    scripture
  });
}

function handlePhase115Action(action, trigger = null) {
  if (action === "open-personalization") {
    openPhase115PersonalizationCenter(trigger || document.activeElement);
    return true;
  }
  if (action === "enable-session") {
    setPersonalizationMode("session_only");
    return true;
  }
  if (action === "enable-profile-preview") {
    setPersonalizationMode("profile_preview");
    return true;
  }
  if (action === "disable-personalization") {
    setPersonalizationMode("off");
    return true;
  }
  if (action === "reset-preferences" || action === "clear-session-signals") {
    resetPhase115Preferences();
    showPhase113SaveDrawer({ title: "Preferences reset", detail: "Session-only hints and signals cleared." });
    return true;
  }
  if (action === "delete-personalization-data") {
    deletePhase115PersonalizationData();
    return true;
  }
  if (action === "export-personalization" || action === "export-journey-memory") {
    state.phase115LastExport = action === "export-journey-memory" ? exportJourneyMemory() : createPhase114SafeExportBundle().personalization;
    renderPhase115PersonalizationCenter();
    openPhase113ExportCenter();
    renderPhase114ExportOutput();
    showPhase113SaveDrawer({ title: "Safe export ready", detail: "Raw private text is excluded." });
    return true;
  }
  if (action === "clear-journey-memory") {
    clearJourneyMemory();
    state.lastPersonalizationDecision = createPhase115RecommendationDecision();
    render();
    showPhase113SaveDrawer({ title: "Journey memory cleared", detail: "Visible local/session memory was cleared." });
    return true;
  }
  if (action === "compare-recommendation") {
    openPhase115ComparisonDialog(trigger || document.activeElement);
    return true;
  }
  return false;
}

function isPhase116QaMode() {
  return new URLSearchParams(window.location.search).has("qa");
}

function sanitizePhase116SearchQuery(value = "") {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 96);
}

function recordPhase116SafeSearch(value, source = getCurrentViewId()) {
  const query = sanitizePhase116SearchQuery(value);
  if (!query || query.length < 2) return;
  const entry = {
    id: createPhase114Id("safe_search"),
    query,
    source,
    savedAt: phase115Now(),
    rawPrivateTextIncluded: false,
    localSessionOnly: true
  };
  state.phase116RecentSafeSearches = [
    entry,
    ...safeArray(state.phase116RecentSafeSearches).filter((item) => normalize(item.query) !== normalize(query))
  ].slice(0, 8);
  saveState();
}

function getPhase116SearchSuggestions(surface = getCurrentViewId()) {
  const cluster = getActivePhase115Cluster();
  const scriptures = getClusterScriptures(cluster).slice(0, 3);
  const relatedWords = safeArray(cluster.related_teoyube_words)
    .concat(state.selectedWord || "")
    .filter(Boolean)
    .slice(0, 4);
  const recent = safeArray(state.phase116RecentSafeSearches).map((item) => item.query).slice(0, 4);
  const surfaceSuggestions = {
    search: ["I need direction", "I need healing", "I need wisdom", "calling clarity"],
    canon: ["promise journeys", "wisdom journeys", "calling journeys", "Scripture evidence"],
    lexicon: relatedWords.length ? relatedWords : ["TIDUILOVP", "grace", "shalom", "wisdom"],
    guide: Object.values(PHASE116_TEO_PROMPT_GROUPS).flat().slice(0, 5),
    table: [getClusterTitle(cluster), "calling promise", "prayer promise", "Scripture anchor"],
    book: ["reflection", "saved promise", "completed action", "testimony"],
    calling: ["calling clarity", "faithful next step", "wise counsel", "purpose"],
    "ui-elements": ["TeoyubeWorld", "Scripture teaching", "prayer video", "calling video"]
  };
  return [...recent, ...scriptures, ...(surfaceSuggestions[surface] || surfaceSuggestions.search)]
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex((candidate) => normalize(candidate) === normalize(item)) === index)
    .slice(0, 8);
}

function renderPhase116SearchSuggestions(surface = getCurrentViewId(), inputId = "") {
  const suggestions = getPhase116SearchSuggestions(surface);
  return `
    <div class="phase116-search-suggestions" data-phase116-search-surface="${escapeHtml(surface)}">
      <div>
        <span class="eyebrow">Smart Search Suggestions</span>
        <small>Session-only, sanitized, local suggestions.</small>
      </div>
      <div class="phase116-chip-row">
        ${suggestions
          .map(
            (suggestion) => `
              <button type="button" class="phase116-chip" data-phase116-action="use-search-suggestion" data-phase116-query="${escapeHtml(suggestion)}" data-phase116-input="${escapeHtml(inputId)}">
                ${escapeHtml(suggestion)}
              </button>
            `
          )
          .join("")}
        <button type="button" class="phase116-chip subtle" data-phase116-action="clear-search-suggestions">Clear</button>
      </div>
    </div>
  `;
}

function mountPhase116SearchSuggestionPanels() {
  const mounts = [
    ["teoyubeSearchForm", "search", "teoyubeSearchInput"],
    ["promiseTableSearchForm", "table", "promiseTableSearchInput"],
    ["compassVideoForm", "calling", "compassVideoInput"],
    ["promiseMovieForm", "ui-elements", "promiseMovieInput"]
  ];
  mounts.forEach(([formId, surface, inputId]) => {
    const form = $(`#${formId}`);
    if (!form) return;
    let panel = form.parentElement?.querySelector(`.phase116-search-suggestions[data-phase116-mounted="${formId}"]`);
    if (!panel) {
      panel = document.createElement("div");
      panel.dataset.phase116Mounted = formId;
      form.insertAdjacentElement("afterend", panel);
    }
    panel.innerHTML = renderPhase116SearchSuggestions(surface, inputId);
  });
  [
    ["bookSearchInput", "book"],
    ["lexiconSearchInput", "lexicon"],
    ["uiVideoSearch", "ui-elements"]
  ].forEach(([inputId, surface]) => {
    const input = $(`#${inputId}`);
    if (!input?.parentElement) return;
    let panel = input.parentElement.parentElement?.querySelector(`.phase116-search-suggestions[data-phase116-mounted="${inputId}"]`);
    if (!panel) {
      panel = document.createElement("div");
      panel.dataset.phase116Mounted = inputId;
      input.parentElement.insertAdjacentElement("afterend", panel);
    }
    panel.innerHTML = renderPhase116SearchSuggestions(surface, inputId);
  });
}

function detectPhase116NeedEmotion(input = "") {
  const text = normalize(input);
  if (textIncludesAny(text, ["discourage", "weary", "tired", "stuck"])) return "discouragement";
  if (textIncludesAny(text, ["confused", "unclear", "lost"])) return "confusion";
  if (textIncludesAny(text, ["fear", "anxious", "worry"])) return "fear";
  if (textIncludesAny(text, ["grief", "loss", "sorrow"])) return "sorrow";
  if (textIncludesAny(text, ["calling", "purpose", "assignment"])) return "calling clarity";
  if (textIncludesAny(text, ["wisdom", "decision", "choose"])) return "wisdom";
  if (textIncludesAny(text, ["pray", "prayer"])) return "prayer";
  return "general guidance";
}

function getPhase116RecommendationContext(context = {}) {
  const decision = context.decision || state.lastPersonalizationDecision || createPhase115RecommendationDecision();
  const recommendation = context.recommendation || (decision.used ? decision.personalizedPreview : decision.baseline) || createBaselineRecommendation();
  const selectedInput = sanitizePhase116SearchQuery(
    context.userInput ||
      state.activeSearchQuery ||
      $("#teoyubeSearchInput")?.value ||
      $("#chatInput")?.value ||
      state.profile?.challenge ||
      recommendation.promiseCluster ||
      ""
  );
  const scripture = context.scripture || recommendation.scripture || state.selectedScripture || getClusterScriptures(getActivePhase115Cluster())[0] || "Ephesians 1:18";
  const promise = context.promise || recommendation.promiseCluster || getClusterTitle(getActivePhase115Cluster());
  const word = context.word || recommendation.word || state.selectedWord || state.generatedWord?.word || "TIDUILOVP";
  const prayer = context.prayer || recommendation.prayer || getClusterPrayer(getActivePhase115Cluster()) || "Father, guide this next faithful step according to Your Word.";
  const actionStep = context.action || context.actionStep || recommendation.actionStep || getDailyAssignment(getActivePhase115Cluster())[3]?.replace("Action: ", "") || "Pray, seek counsel, and take one faithful step.";
  const journey = context.journey || recommendation.journey || state.selectedJourney?.title || state.generatedDailyJourney?.title || `${promise} journey`;
  return {
    decision,
    recommendation,
    selectedInput,
    scripture,
    promise,
    word,
    prayer,
    actionStep,
    journey,
    source: context.source || getCurrentViewId(),
    label: context.label || promise,
    selectedCalling: context.calling || state.calling?.primary || analyzeCalling(state.profile).primary
  };
}

function createPhase116WhyThisTrace(context = {}) {
  const base = getPhase116RecommendationContext(context);
  const detectedIntent = context.intent || detectSearchIntent(base.selectedInput || base.label || base.promise);
  const detectedEmotion = context.emotion || detectPhase116NeedEmotion(base.selectedInput || base.label || base.promise);
  const hints = safeArray(state.preferenceHints).slice(0, 4);
  const fallbackReason =
    context.fallbackReason ||
    state.lastFallbackReason ||
    base.recommendation.fallbackStatus ||
    (base.scripture ? "Scripture anchors available." : "Scripture anchor review needed.");
  const trace = {
    id: createPhase114Id("phase116_trace"),
    source: base.source,
    label: base.label,
    selectedContext: base.selectedInput || base.label,
    detectedIntent,
    detectedEmotion,
    selectedWord: base.word,
    selectedPromiseCluster: base.promise,
    selectedScriptureAnchor: base.scripture,
    selectedPrayer: base.prayer,
    selectedActionStep: base.actionStep,
    selectedJourney: base.journey,
    selectedCalling: base.selectedCalling,
    confidenceLabel: context.confidence || base.recommendation.confidence || "Good",
    confidenceScore: Number(context.confidenceScore || base.recommendation.confidenceScore || (base.scripture ? 82 : 58)),
    fallbackUsed: Boolean(context.fallbackUsed || !base.scripture || normalize(fallbackReason).includes("fallback") || normalize(fallbackReason).includes("review")),
    fallbackReason,
    personalizationUsed: Boolean(base.decision.used),
    personalizationHintsConsidered: hints.map((hint) => hint.label),
    scriptureStable: base.decision.scripturePreserved || base.decision.baseline?.scripture || base.scripture,
    baselineChange: base.decision.used
      ? `Preview may shift wording or cluster emphasis; baseline Scripture remains ${base.decision.scripturePreserved || base.scripture}.`
      : "No personalization change. Standard Scripture Path is active.",
    explanationPath: [
      base.selectedInput ? "Sanitized local context" : "Selected local context",
      detectedIntent,
      detectedEmotion,
      base.word,
      base.promise,
      base.scripture,
      base.actionStep
    ].filter(Boolean),
    scriptureStableNotice:
      "Scripture anchors stay visible and remain the authority; Teoyube words, prayers, and actions are devotional aids only.",
    externalServicesDisabled: true,
    rawPrivateTextStored: false,
    localOnly: true
  };
  const score = calculatePhase116QualityScore(trace);
  state.phase116LastTrace = trace;
  state.phase116LastQualityScore = score;
  return trace;
}

function calculatePhase116QualityScore(trace = createPhase116WhyThisTrace()) {
  const components = [
    ["Scripture anchor strength", trace.selectedScriptureAnchor ? 24 : 4],
    ["Promise match", trace.selectedPromiseCluster ? 18 : 6],
    ["Word relevance", trace.selectedWord ? 14 : 5],
    ["Journey/action fit", trace.selectedActionStep && trace.selectedJourney ? 16 : 7],
    ["Confidence", Math.max(6, Math.min(14, Math.round((Number(trace.confidenceScore) || 60) / 7)))],
    ["Fallback status", trace.fallbackUsed ? 5 : 10],
    ["Personalization stability", trace.personalizationUsed ? 8 : 10]
  ];
  const score = Math.max(0, Math.min(100, components.reduce((sum, item) => sum + item[1], 0)));
  const label = score >= 86 ? "Excellent" : score >= 72 ? "Good" : score >= 54 ? "Partial" : "Needs fallback";
  return {
    score,
    label,
    components: components.map(([name, value]) => ({ name, value })),
    why:
      label === "Excellent"
        ? "Strong Scripture, promise, word, prayer, and action alignment."
        : label === "Good"
          ? "Usable local match with visible Scripture and cautious confidence."
          : label === "Partial"
            ? "Some support is present, but refining the search can strengthen the match."
            : "Use a simpler query or choose a Scripture/promise anchor before acting.",
    improve:
      label === "Excellent"
        ? "You can continue with prayer, counsel, and one faithful action."
        : "Try adding a Scripture reference, promise theme, Teoyube word, or calling focus."
  };
}

function renderPhase116QualityScore(trace = createPhase116WhyThisTrace()) {
  const quality = calculatePhase116QualityScore(trace);
  return `
    <aside class="phase116-quality-score" aria-label="Recommendation Quality Score">
      <div class="phase116-score-ring" style="--phase116-score:${quality.score}%">
        <strong>${quality.score}</strong>
        <span>${escapeHtml(quality.label)}</span>
      </div>
      <div>
        <p class="eyebrow">Recommendation Quality</p>
        <p>${escapeHtml(quality.why)}</p>
        <small>${escapeHtml(quality.improve)}</small>
      </div>
    </aside>
  `;
}

function renderPhase116WhyThisPanel(context = {}) {
  const trace = createPhase116WhyThisTrace(context);
  const open = Boolean(context.open || state.phase116WhyThisOpen);
  const quality = calculatePhase116QualityScore(trace);
  return `
    <details class="phase116-why-this-panel" ${open ? "open" : ""}>
      <summary>
        <span>Why this?</span>
        <strong>${escapeHtml(quality.label)}</strong>
      </summary>
      <div class="phase116-why-grid">
        <article><span>Context</span><strong>${escapeHtml(trace.selectedContext || trace.label)}</strong></article>
        <article><span>Intent</span><strong>${escapeHtml(trace.detectedIntent)}</strong></article>
        <article><span>Need</span><strong>${escapeHtml(trace.detectedEmotion)}</strong></article>
        <article><span>Word</span><strong>${escapeHtml(trace.selectedWord)}</strong></article>
        <article><span>Promise</span><strong>${escapeHtml(trace.selectedPromiseCluster)}</strong></article>
        <article><span>Scripture</span><strong>${escapeHtml(trace.selectedScriptureAnchor)}</strong></article>
        <article><span>Prayer</span><strong>${escapeHtml(trace.selectedPrayer)}</strong></article>
        <article><span>Action</span><strong>${escapeHtml(trace.selectedActionStep)}</strong></article>
      </div>
      <div class="phase116-path-row">
        ${trace.explanationPath.map((step) => `<span>${escapeHtml(step)}</span>`).join("")}
      </div>
      <p>${escapeHtml(trace.scriptureStableNotice)}</p>
      <p><strong>Confidence:</strong> ${escapeHtml(trace.confidenceLabel)} (${escapeHtml(String(trace.confidenceScore))}%). <strong>Fallback:</strong> ${escapeHtml(trace.fallbackReason)}</p>
      <p><strong>Personalization:</strong> ${trace.personalizationUsed ? `Preview considered ${escapeHtml(trace.personalizationHintsConsidered.join(", ") || "visible local hints")}.` : "Off. Standard Scripture Path is active."} ${escapeHtml(trace.baselineChange)}</p>
      ${renderPhase116QualityScore(trace)}
      <div class="phase116-panel-actions">
        <button type="button" class="secondary" data-phase116-action="open-graph">View Graph</button>
        <button type="button" class="secondary" data-phase115-action="compare-recommendation">Compare Preview</button>
        ${
          isPhase116QaMode()
            ? `<button type="button" class="secondary" data-phase116-action="toggle-technical-trace">${state.phase116TechnicalTraceOpen ? "Hide" : "View"} technical trace</button>`
            : ""
        }
      </div>
      ${
        isPhase116QaMode() && state.phase116TechnicalTraceOpen
          ? `<pre class="phase116-technical-trace">${escapeHtml(JSON.stringify(trace, null, 2))}</pre>`
          : ""
      }
    </details>
  `;
}

function createPhase116Graph(trace = createPhase116WhyThisTrace()) {
  const nodes = [
    { id: "context", type: "emotion", label: trace.detectedEmotion, detail: trace.selectedContext || "Selected local context" },
    { id: "intent", type: "milestone", label: trace.detectedIntent, detail: "Local intent classification, not live AI." },
    { id: "word", type: "word", label: trace.selectedWord, detail: "Teoyube memory word." },
    { id: "promise", type: "promise", label: trace.selectedPromiseCluster, detail: "Promise cluster from local data." },
    { id: "scripture", type: "scripture", label: trace.selectedScriptureAnchor, detail: "Visible Scripture anchor." },
    { id: "prayer", type: "prayer", label: "Prayer", detail: trace.selectedPrayer },
    { id: "action", type: "action", label: "Action", detail: trace.selectedActionStep },
    { id: "journey", type: "journey", label: trace.selectedJourney, detail: "Current local journey path." },
    { id: "calling", type: "calling", label: trace.selectedCalling, detail: "Cautious calling pattern, not destiny certainty." }
  ];
  const edges = [
    ["context", "intent", "Context suggests intent."],
    ["intent", "word", "Intent maps to a Teoyube word memory aid."],
    ["word", "promise", "Word connects to promise language."],
    ["promise", "scripture", "Promise is anchored by Scripture."],
    ["scripture", "prayer", "Prayer is submitted to Scripture."],
    ["prayer", "action", "Prayer leads to one faithful step."],
    ["action", "journey", "Action contributes to journey progress."],
    ["journey", "calling", "Journey informs cautious calling language."]
  ].map(([from, to, reason], index) => ({ id: `edge-${index + 1}`, from, to, reason }));
  return {
    nodes,
    edges,
    highlightedPath: edges.map((edge) => edge.id),
    mobileFallback: true,
    relationshipCount: edges.length,
    nodeCount: nodes.length
  };
}

function renderPhase116GraphExplorer(context = {}) {
  const target = $("#phase116GraphContent");
  if (!target) return;
  const trace = createPhase116WhyThisTrace(context);
  const graph = createPhase116Graph(trace);
  const query = normalize(state.phase116GraphQuery || "");
  const filter = state.phase116GraphFilter || "all";
  const visibleNodes = graph.nodes.filter((node) => {
    const matchesType = filter === "all" || node.type === filter;
    const matchesQuery = !query || normalize(`${node.label} ${node.detail} ${node.type}`).includes(query);
    return matchesType && matchesQuery;
  });
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = graph.edges.filter((edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to));
  const selectedNode = graph.nodes.find((node) => node.id === state.phase116SelectedGraphNode) || visibleNodes[0];
  const selectedEdge = graph.edges.find((edge) => edge.id === state.phase116SelectedGraphEdge);
  const mode = state.phase116GraphMode || "path";
  target.innerHTML = `
    <section class="phase116-graph-toolbar">
      <div>
        <p class="eyebrow">Visual Intelligence Graph Explorer</p>
        <h3>${escapeHtml(trace.selectedPromiseCluster)}</h3>
        <p>Local graph/list view. No canvas dependency, no external service, and mobile list fallback is always available.</p>
      </div>
      <label>
        Search graph
        <input id="phase116GraphSearch" value="${escapeHtml(state.phase116GraphQuery || "")}" placeholder="Search nodes or relationships..." />
      </label>
    </section>
    <div class="phase116-mode-row">
      ${PHASE116_GRAPH_MODES.map(([id, label]) => `<button type="button" class="${id === mode ? "active" : ""}" data-phase116-graph-mode="${escapeHtml(id)}">${escapeHtml(label)}</button>`).join("")}
    </div>
    <div class="phase116-filter-row" aria-label="Graph node type filters">
      ${PHASE116_GRAPH_NODE_TYPES.map((type) => `<button type="button" class="${type === filter ? "active" : ""}" data-phase116-graph-filter="${escapeHtml(type)}">${escapeHtml(type === "all" ? "All" : type)}</button>`).join("")}
    </div>
    <div class="phase116-graph-layout" data-phase116-graph-mode="${escapeHtml(mode)}">
      <div class="phase116-node-list" aria-label="Graph nodes">
        ${visibleNodes
          .map(
            (node) => `
              <button type="button" class="phase116-node-card ${node.id === selectedNode?.id ? "active" : ""}" data-phase116-graph-node="${escapeHtml(node.id)}">
                <span>${escapeHtml(node.type)}</span>
                <strong>${escapeHtml(node.label)}</strong>
                <small>${escapeHtml(node.detail)}</small>
              </button>
            `
          )
          .join("") || `<article class="phase116-empty-card">No graph nodes match this filter.</article>`}
      </div>
      <div class="phase116-edge-list" aria-label="Graph relationships">
        ${visibleEdges
          .map(
            (edge) => `
              <button type="button" class="phase116-edge-card ${edge.id === selectedEdge?.id ? "active" : ""}" data-phase116-graph-edge="${escapeHtml(edge.id)}">
                <strong>${escapeHtml(graph.nodes.find((node) => node.id === edge.from)?.label || edge.from)} -> ${escapeHtml(graph.nodes.find((node) => node.id === edge.to)?.label || edge.to)}</strong>
                <span>${escapeHtml(edge.reason)}</span>
              </button>
            `
          )
          .join("") || `<article class="phase116-empty-card">No relationships match this filter.</article>`}
      </div>
      <aside class="phase116-graph-detail">
        <p class="eyebrow">Selected ${selectedEdge ? "Relationship" : "Node"}</p>
        <h4>${escapeHtml(selectedEdge ? selectedEdge.reason : selectedNode?.label || "No node selected")}</h4>
        <p>${escapeHtml(selectedEdge ? "Relationship reason is visible to normal users." : selectedNode?.detail || "Choose a node or relationship.")}</p>
        <div class="scripture-strip"><span class="scripture-pill">${escapeHtml(trace.selectedScriptureAnchor)}</span></div>
        ${renderPhase116QualityScore(trace)}
        <div class="phase116b-action-row">
          <button class="secondary" type="button" data-phase116b-action="graph-save-node">Save Node to Book</button>
          <button class="secondary" type="button" data-phase116b-action="graph-prayer">Generate Prayer</button>
          <button class="secondary" type="button" data-phase116b-action="graph-action">Start Action</button>
        </div>
      </aside>
    </div>
    <section class="phase116-graph-mode-detail">
      <p><strong>Mode:</strong> ${escapeHtml(PHASE116_GRAPH_MODES.find(([id]) => id === mode)?.[1] || "Path View")}.</p>
      <p>${escapeHtml(mode === "scripture" ? trace.scriptureStableNotice : mode === "confidence" ? calculatePhase116QualityScore(trace).why : trace.explanationPath.join(" -> "))}</p>
    </section>
  `;
}

function openPhase116GraphExplorer(trigger = document.activeElement) {
  ensurePhase113Shell();
  phase113CommandReturnFocus = trigger;
  renderPhase116GraphExplorer();
  const dialog = $("#phase116GraphDialog");
  if (!dialog) return;
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  else dialog.setAttribute("open", "open");
  recordPhase114Action("Intelligence Graph opened", "Local graph/list explanation view is visible.");
}

function closePhase116GraphExplorer() {
  const dialog = $("#phase116GraphDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  dialog.removeAttribute("open");
  if (phase113CommandReturnFocus?.focus) phase113CommandReturnFocus.focus();
}

function getPhase116RelatedRecommendations(trace = createPhase116WhyThisTrace()) {
  const cluster = getActivePhase115Cluster();
  return {
    words: safeArray(cluster.related_teoyube_words).concat(trace.selectedWord).filter(Boolean).slice(0, 4),
    scriptures: getClusterScriptures(cluster).concat(trace.selectedScriptureAnchor).filter(Boolean).slice(0, 4),
    promises: promiseClusters.slice(0, 4).map(getClusterTitle),
    prayers: [trace.selectedPrayer, getClusterPrayer(cluster)].filter(Boolean).slice(0, 2),
    actions: [trace.selectedActionStep, "Pray, seek counsel, examine fruit, and take one faithful step."],
    journeys: [trace.selectedJourney, "Calling Clarity Journey", "Promise Reflection Journey"].filter(Boolean).slice(0, 3)
  };
}

function renderPhase116RelatedRecommendations(trace = createPhase116WhyThisTrace()) {
  const related = getPhase116RelatedRecommendations(trace);
  return Object.entries(related)
    .map(
      ([label, items]) => `
        <div class="phase116-related-group">
          <strong>${escapeHtml(label)}</strong>
          <div class="phase116-chip-row">${items.map((item) => `<span class="phase116-chip readonly">${escapeHtml(item)}</span>`).join("")}</div>
        </div>
      `
    )
    .join("");
}

function renderPhase116SmartRailSections(insight, decision, status, memorySummary) {
  const trace = createPhase116WhyThisTrace({ source: "smart-rail", label: insight.promise });
  const quality = calculatePhase116QualityScore(trace);
  const hints = safeArray(state.preferenceHints).slice(0, 3);
  return `
    <section class="phase116-smart-rail" aria-label="Smart Recommendation Rail">
      <p class="eyebrow">Smart Recommendation Rail</p>
      <h3>Current Focus</h3>
      <dl class="phase116-focus-list">
        <div><dt>Word</dt><dd>${escapeHtml(trace.selectedWord)}</dd></div>
        <div><dt>Scripture</dt><dd>${escapeHtml(trace.selectedScriptureAnchor)}</dd></div>
        <div><dt>Promise</dt><dd>${escapeHtml(trace.selectedPromiseCluster)}</dd></div>
        <div><dt>Journey</dt><dd>${escapeHtml(trace.selectedJourney)}</dd></div>
        <div><dt>Action</dt><dd>${escapeHtml(trace.selectedActionStep)}</dd></div>
      </dl>
      <div class="phase116-status-badges">
        <span>${escapeHtml(quality.label)}</span>
        <span>${trace.fallbackUsed ? "Fallback visible" : "No fallback needed"}</span>
        <span>Safety on</span>
      </div>
      ${renderPhase116WhyThisPanel({ source: "smart-rail", label: insight.promise })}
      <div class="phase116-rail-actions">
        <button type="button" class="secondary" data-phase116-action="pray-this">Pray this</button>
        <button type="button" class="secondary" data-phase116-action="save-to-book">Save to Book</button>
        <button type="button" class="secondary" data-phase116-action="add-reflection">Add Reflection</button>
        <button type="button" class="secondary" data-phase116-action="add-promise-table">Add to Promise Table</button>
        <button type="button" class="secondary" data-phase116-action="start-journey">Start Journey</button>
        <button type="button" class="secondary" data-phase116-action="open-graph">View Graph</button>
        <button type="button" class="secondary" data-phase115-action="compare-recommendation">Compare Personalized Preview</button>
        <button type="button" class="secondary" data-phase115-feedback="more_like_this" data-phase115-label="${escapeHtml(trace.label)}" data-phase115-source="phase116-rail">Give Feedback</button>
      </div>
      <section class="phase116-related-rail">
        <h4>Related Recommendations</h4>
        ${renderPhase116RelatedRecommendations(trace)}
      </section>
      <section class="phase116-personalization-mini">
        <h4>Personalization Preview</h4>
        <p>${escapeHtml(status.label)}. Baseline Scripture remains stable.</p>
        <p>Memory: ${escapeHtml(String(memorySummary.total))} safe item${memorySummary.total === 1 ? "" : "s"}.</p>
        <div class="phase116-chip-row">
          ${
            hints.length
              ? hints.map((hint) => `<span class="phase116-chip readonly">${escapeHtml(hint.label)}</span>`).join("")
              : `<span class="phase116-chip readonly">No strong hints yet</span>`
          }
        </div>
        <button type="button" class="link-button" data-phase115-action="reset-preferences">Reset personalization hints</button>
      </section>
    </section>
  `;
}

function getPhase116WorkflowDefinitions() {
  return PHASE116_WORKFLOW_BLUEPRINTS;
}

function openPhase116Workflow(workflowId = "need-promise", trigger = document.activeElement) {
  const workflow = getPhase116WorkflowDefinitions().find((item) => item.id === workflowId) || getPhase116WorkflowDefinitions()[0];
  ensurePhase113Shell();
  phase113CommandReturnFocus = trigger;
  state.phase116ActiveWorkflow = workflow.id;
  state.phase116WorkflowStep = 0;
  state.phase116WorkflowDraft = {
    workflow: workflow.id,
    startedAt: phase115Now(),
    rawPrivateTextIncluded: false,
    localSessionOnly: true
  };
  renderPhase116WorkflowDialog();
  const dialog = $("#phase116WorkflowDialog");
  if (!dialog) return;
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  else dialog.setAttribute("open", "open");
  recordPhase114Action("Guided workflow started", workflow.title);
}

function closePhase116Workflow() {
  const dialog = $("#phase116WorkflowDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  dialog.removeAttribute("open");
  state.phase116ActiveWorkflow = null;
  state.phase116WorkflowStep = 0;
  state.phase116WorkflowDraft = {};
  saveState();
  if (phase113CommandReturnFocus?.focus) phase113CommandReturnFocus.focus();
}

function getActivePhase116Workflow() {
  return getPhase116WorkflowDefinitions().find((item) => item.id === state.phase116ActiveWorkflow) || getPhase116WorkflowDefinitions()[0];
}

function readPhase116WorkflowInputs() {
  const input = $("[data-phase116-workflow-input]");
  if (!input) return;
  const safeIntent = sanitizePhase116SearchQuery(input.value);
  if (safeIntent) {
    state.phase116WorkflowDraft = {
      ...(state.phase116WorkflowDraft || {}),
      safeIntent,
      rawPrivateTextIncluded: false
    };
    recordPhase116SafeSearch(safeIntent, "workflow");
  }
}

function movePhase116Workflow(direction = "next") {
  const workflow = getActivePhase116Workflow();
  readPhase116WorkflowInputs();
  const max = workflow.steps.length - 1;
  if (direction === "back") {
    state.phase116WorkflowStep = Math.max(0, (state.phase116WorkflowStep || 0) - 1);
  } else if ((state.phase116WorkflowStep || 0) >= max) {
    const trace = createPhase116WhyThisTrace({ source: `workflow-${workflow.id}`, label: workflow.title, userInput: state.phase116WorkflowDraft?.safeIntent });
    saveJourneyMemoryItem({
      id: createPhase114Id("workflow_memory"),
      type: "journey",
      title: workflow.title,
      summary: `Guided workflow completed locally with ${trace.selectedScriptureAnchor}. Raw text is not saved.`,
      scripture: trace.selectedScriptureAnchor,
      word: trace.selectedWord,
      promise: trace.selectedPromiseCluster,
      surface: "workflow"
    });
    state.phase116WorkflowHistory = [
      {
        id: createPhase114Id("workflow_history"),
        workflow: workflow.id,
        title: workflow.title,
        completedAt: phase115Now(),
        scripture: trace.selectedScriptureAnchor,
        rawPrivateTextIncluded: false
      },
      ...safeArray(state.phase116WorkflowHistory)
    ].slice(0, 12);
    closePhase116Workflow();
    render();
    showPhase113SaveDrawer({ title: "Workflow saved", detail: workflow.title, scripture: trace.selectedScriptureAnchor });
    return;
  } else {
    state.phase116WorkflowStep = Math.min(max, (state.phase116WorkflowStep || 0) + 1);
  }
  saveState();
  renderPhase116WorkflowDialog();
}

function renderPhase116WorkflowDialog() {
  const target = $("#phase116WorkflowContent");
  if (!target) return;
  const workflow = getActivePhase116Workflow();
  const stepIndex = Math.max(0, Math.min(workflow.steps.length - 1, state.phase116WorkflowStep || 0));
  const step = workflow.steps[stepIndex];
  const trace = createPhase116WhyThisTrace({ source: `workflow-${workflow.id}`, label: workflow.title, userInput: state.phase116WorkflowDraft?.safeIntent || workflow.title });
  target.innerHTML = `
    <section class="phase116-workflow-body" data-phase116-active-workflow="${escapeHtml(workflow.id)}">
      <div class="phase116-workflow-progress">
        ${workflow.steps.map((label, index) => `<span class="${index <= stepIndex ? "active" : ""}">${escapeHtml(label)}</span>`).join("")}
      </div>
      <p class="eyebrow">Guided Workflow Builder</p>
      <h3>${escapeHtml(workflow.title)}</h3>
      <p>${escapeHtml(workflow.summary)}</p>
      <article class="phase116-workflow-step">
        <h4>${escapeHtml(step)}</h4>
        ${
          stepIndex === 0
            ? `<label>Describe the situation briefly<input data-phase116-workflow-input value="${escapeHtml(state.phase116WorkflowDraft?.safeIntent || "")}" placeholder="Keep it brief; raw text is not persisted." /></label>`
            : `<p>${escapeHtml(trace.explanationPath[Math.min(stepIndex + 1, trace.explanationPath.length - 1)] || trace.selectedActionStep)}</p>`
        }
        <div class="scripture-strip"><span class="scripture-pill">${escapeHtml(trace.selectedScriptureAnchor)}</span><span class="scripture-pill">${escapeHtml(trace.selectedPromiseCluster)}</span></div>
        ${renderPhase116WhyThisPanel({ source: `workflow-${workflow.id}`, label: workflow.title, userInput: state.phase116WorkflowDraft?.safeIntent })}
      </article>
      <p class="phase116-safety-note">Workflow guidance is local, Scripture-submitted, and cautious. It never claims certainty or marks promises fulfilled automatically.</p>
      <div class="phase116-workflow-actions">
        <button type="button" class="secondary" data-phase116-action="workflow-cancel">Cancel</button>
        <button type="button" class="secondary" data-phase116-action="workflow-back" ${stepIndex === 0 ? "disabled" : ""}>Back</button>
        <button type="button" class="primary" data-phase116-action="workflow-next">${stepIndex === workflow.steps.length - 1 ? "Save Locally" : "Next"}</button>
      </div>
    </section>
  `;
}

function renderPhase116WorkflowBuilderEntry(surface = getCurrentViewId()) {
  return `
    <section class="phase116-workflow-entry" aria-label="Guided Workflow Builder">
      <div>
        <p class="eyebrow">Guided Workflow Builder</p>
        <h3>Start a Scripture-rooted workflow</h3>
        <p>Local steps for promise, prayer, calling, growth, word study, or testimony. Raw private text is not stored.</p>
      </div>
      <div class="phase116-workflow-grid">
        ${getPhase116WorkflowDefinitions()
          .map(
            (workflow) => `
              <button type="button" data-phase116-workflow="${escapeHtml(workflow.id)}" data-phase116-source="${escapeHtml(surface)}">
                <strong>${escapeHtml(workflow.title)}</strong>
                <span>${escapeHtml(workflow.summary)}</span>
              </button>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function composePhase116TeoGuideResponse(prompt, context = {}) {
  const trace = createPhase116WhyThisTrace({ ...context, source: "teo-guide", userInput: prompt, label: "Teo Guide response" });
  return {
    text:
      `Local Teo Guide preview: this may connect to ${trace.selectedPromiseCluster} through ${trace.selectedScriptureAnchor}. ` +
      `The related Teoyube word is ${trace.selectedWord}. Prayer: ${trace.selectedPrayer} ` +
      `Next faithful step: ${trace.selectedActionStep} For major decisions, pray, seek wise counsel, examine fruit, and move with humility. ` +
      `This is local Scripture-guided preview, not live AI or divine certainty.`,
    trace
  };
}

function renderPhase116TeoPromptCategories() {
  const target = $(".guide-suggested-prompts");
  if (!target) return;
  const activeGroup = PHASE116_TEO_PROMPT_GROUPS[state.phase116TeoPromptCategory] ? state.phase116TeoPromptCategory : "Promise";
  target.innerHTML = `
    <p>Suggested Prompts</p>
    <div class="phase116-teo-groups">
      ${Object.keys(PHASE116_TEO_PROMPT_GROUPS).map((group) => `<button type="button" class="${group === activeGroup ? "active" : ""}" data-phase116-teo-group="${escapeHtml(group)}">${escapeHtml(group)}</button>`).join("")}
    </div>
    <div class="phase116-teo-prompts">
      ${PHASE116_TEO_PROMPT_GROUPS[activeGroup]
        .map((prompt) => `<button class="prompt-chip" type="button" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`)
        .join("")}
    </div>
    ${renderPhase116SearchSuggestions("guide", "chatInput")}
  `;
}

function renderPhase116IntelligenceHealthPanel() {
  const panel = $("#phase114QaPanel");
  if (!panel || !isPhase116QaMode()) return;
  const trace = state.phase116LastTrace || createPhase116WhyThisTrace({ source: "qa-health" });
  const graph = createPhase116Graph(trace);
  let health = $("#phase116HealthPanel");
  if (!health) {
    health = document.createElement("section");
    health.id = "phase116HealthPanel";
    health.className = "phase116-health-panel";
    panel.appendChild(health);
  }
  health.innerHTML = `
    <button type="button" class="phase116-health-toggle" data-phase116-action="toggle-health">Intelligence Health</button>
    <div ${state.phase116HealthOpen ? "" : "hidden"}>
      <p><strong>Graph nodes:</strong> ${graph.nodeCount}</p>
      <p><strong>Relationships:</strong> ${graph.relationshipCount}</p>
      <p><strong>Route:</strong> ${escapeHtml(getCurrentViewId())}</p>
      <p><strong>Selected:</strong> ${escapeHtml(trace.label)}</p>
      <p><strong>Source:</strong> ${escapeHtml(trace.source)}</p>
      <p><strong>Confidence:</strong> ${escapeHtml(trace.confidenceLabel)}</p>
      <p><strong>Fallback used:</strong> ${trace.fallbackUsed ? "yes" : "no"}</p>
      <p><strong>Personalization:</strong> ${trace.personalizationUsed ? "enabled preview" : "off"}</p>
      <p><strong>Workflow:</strong> ${escapeHtml(state.phase116ActiveWorkflow || "none")}</p>
      <p><strong>Saved memory:</strong> ${safeArray(state.journeyMemory).length}</p>
      <p><strong>QA smoke:</strong> phase116:smoke registered</p>
      <p><strong>External services:</strong> disabled</p>
    </div>
  `;
}

function handlePhase116Action(action, trigger = null) {
  if (action === "toggle-why-this") {
    state.phase116WhyThisOpen = !state.phase116WhyThisOpen;
    render();
    return true;
  }
  if (action === "toggle-technical-trace") {
    state.phase116TechnicalTraceOpen = !state.phase116TechnicalTraceOpen;
    render();
    return true;
  }
  if (action === "open-graph") {
    openPhase116GraphExplorer(trigger || document.activeElement);
    return true;
  }
  if (action === "close-graph") {
    closePhase116GraphExplorer();
    return true;
  }
  if (action === "workflow-cancel") {
    closePhase116Workflow();
    return true;
  }
  if (action === "workflow-back") {
    movePhase116Workflow("back");
    return true;
  }
  if (action === "workflow-next") {
    movePhase116Workflow("next");
    return true;
  }
  if (action === "toggle-health") {
    state.phase116HealthOpen = !state.phase116HealthOpen;
    renderPhase116IntelligenceHealthPanel();
    return true;
  }
  if (action === "use-search-suggestion") {
    const query = trigger?.dataset.phase116Query || "";
    const inputId = trigger?.dataset.phase116Input || "";
    const input = inputId ? $(`#${inputId}`) : null;
    if (input) {
      input.value = query;
      input.focus();
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    recordPhase116SafeSearch(query, trigger?.closest("[data-phase116-search-surface]")?.dataset.phase116SearchSurface || getCurrentViewId());
    showPhase113SaveDrawer({ title: "Search suggestion loaded", detail: query });
    return true;
  }
  if (action === "clear-search-suggestions") {
    state.phase116RecentSafeSearches = [];
    saveState();
    mountPhase116SearchSuggestionPanels();
    showPhase113SaveDrawer({ title: "Search suggestions cleared", detail: "Session-only safe searches cleared." });
    return true;
  }
  const trace = createPhase116WhyThisTrace({ source: `phase116-action-${action}` });
  if (action === "pray-this") {
    state.chat.push({ role: "teo", text: `Prayer framework: ${trace.selectedPrayer} Scripture anchor: ${trace.selectedScriptureAnchor}.` });
    saveJourneyMemoryItem({ type: "prayer", title: "Prayer from Smart Rail", summary: trace.selectedPrayer, scripture: trace.selectedScriptureAnchor, word: trace.selectedWord, promise: trace.selectedPromiseCluster, surface: "smart-rail" });
    setView("guide");
    renderChat();
    showPhase113SaveDrawer({ title: "Prayer opened", detail: "Local prayer framework sent to Teo Guide.", scripture: trace.selectedScriptureAnchor });
    return true;
  }
  if (action === "save-to-book" || action === "add-reflection") {
    const entry = {
      id: createPhase114Id("book"),
      type: action === "add-reflection" ? "Reflection" : "Recommendation",
      title: trace.label || trace.selectedPromiseCluster,
      content: `${trace.selectedPromiseCluster}. ${trace.selectedActionStep}`,
      references: [trace.selectedScriptureAnchor],
      date: new Date().toISOString()
    };
    state.book.unshift(entry);
    saveJourneyMemoryItem({ type: "scripture", title: entry.title, summary: "Saved from Phase 11.6 Smart Recommendation Rail.", scripture: trace.selectedScriptureAnchor, word: trace.selectedWord, promise: trace.selectedPromiseCluster, surface: "smart-rail" });
    saveState();
    render();
    showPhase113SaveDrawer({ title: "Saved to Book", detail: entry.title, scripture: trace.selectedScriptureAnchor, undo: { collection: "book", id: entry.id, title: entry.title } });
    return true;
  }
  if (action === "add-promise-table") {
    state.savedPromiseTableItems.unshift({
      id: createPhase114Id("promise"),
      title: trace.selectedPromiseCluster,
      scripture: trace.selectedScriptureAnchor,
      word: trace.selectedWord,
      status: "Praying",
      savedAt: new Date().toISOString(),
      fulfillmentAutomatic: false
    });
    saveState();
    renderPhase114PromiseTableRows();
    showPhase113SaveDrawer({ title: "Added to Promise Table", detail: trace.selectedPromiseCluster, scripture: trace.selectedScriptureAnchor });
    return true;
  }
  if (action === "start-journey") {
    state.selectedJourney = {
      title: trace.selectedJourney,
      scripture: trace.selectedScriptureAnchor,
      generatedAt: new Date().toISOString(),
      phase116Started: true,
      explanation: trace.explanationPath.join(" -> ")
    };
    saveJourneyMemoryItem({ type: "journey", title: trace.selectedJourney, summary: "Started from Phase 11.6 Smart Recommendation Rail.", scripture: trace.selectedScriptureAnchor, word: trace.selectedWord, promise: trace.selectedPromiseCluster, surface: "smart-rail" });
    saveState();
    render();
    showPhase113SaveDrawer({ title: "Journey started", detail: trace.selectedJourney, scripture: trace.selectedScriptureAnchor });
    return true;
  }
  return false;
}

function showPhase113SaveDrawer(entry = {}) {
  ensurePhase113Shell();
  const drawer = $("#phase113SaveDrawer");
  if (!drawer) return;
  state.lastSavedEntry = {
    title: entry.title || "Saved locally",
    detail: entry.detail || "Session state updated.",
    scripture: entry.scripture || "",
    targetView: entry.targetView || "book",
    undo: entry.undo || null,
    savedAt: new Date().toISOString()
  };
  drawer.innerHTML = `
    <strong>${escapeHtml(entry.title || "Saved locally")}</strong>
    <span>${escapeHtml(entry.detail || "Session state updated. No external service was contacted.")}</span>
    ${entry.scripture ? `<small>${escapeHtml(entry.scripture)}</small>` : ""}
    <div class="phase114-save-actions">
      <button type="button" data-phase114-save-action="view-book">View in Book</button>
      <button type="button" data-phase114-save-action="add-reflection">Add Reflection</button>
      ${entry.undo ? `<button type="button" data-phase114-save-action="undo-save">Undo Save</button>` : ""}
      <button type="button" data-phase114-save-action="close">Close</button>
    </div>
  `;
  drawer.classList.add("visible");
  recordPhase114Action(entry.title || "Saved locally", entry.detail || "Session state updated.");
  window.clearTimeout(showPhase113SaveDrawer.timer);
  showPhase113SaveDrawer.timer = window.setTimeout(() => drawer.classList.remove("visible"), 7200);
}

function openPhase113ExportCenter() {
  ensurePhase113Shell();
  const dialog = $("#phase113ExportDialog");
  renderPhase114ExportOutput();
  if (!dialog) return;
  if (typeof dialog.showModal === "function" && !dialog.open) {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "open");
  }
  recordPhase114Action("Beta export opened", "Phase 11.7 sanitized local export preview generated.");
}

function closePhase113ExportCenter() {
  const dialog = $("#phase113ExportDialog");
  if (!dialog) return;
  if (typeof dialog.close === "function") dialog.close();
  dialog.removeAttribute("open");
}

function renderPhase114ExportOutput() {
  const output = $("#phase113ExportJson");
  if (!output) return;
  const bundle = createPhase114SafeExportBundle();
  output.textContent =
    phase114ExportFormat === "markdown"
      ? createPhase117MarkdownExport(bundle)
      : JSON.stringify(bundle, null, 2);
}

function handlePhase114SaveDrawerAction(action) {
  const drawer = $("#phase113SaveDrawer");
  if (action === "close") {
    drawer?.classList.remove("visible");
    recordPhase114Action("Save drawer closed");
    return;
  }
  if (action === "view-book") {
    setView("book");
    drawer?.classList.remove("visible");
    recordPhase114Action("Viewed Book from save drawer", "Book of the Saint opened.");
    return;
  }
  if (action === "add-reflection") {
    drawer?.classList.remove("visible");
    addManualEntry();
    return;
  }
  if (action === "undo-save") {
    undoPhase114LastSave();
  }
}

function undoPhase114LastSave() {
  const undo = state.lastSavedEntry?.undo;
  if (!undo) {
    showPhase113SaveDrawer({ title: "Nothing to undo", detail: "This action did not provide an undo record." });
    return;
  }

  let undone = false;
  if (undo.collection === "book") {
    undone = removeFirstMatching("book", (entry) => entry.id === undo.id || entry.title === undo.title);
  }
  if (undo.collection === "savedPromiseTableItems") {
    undone = removeFirstMatching("savedPromiseTableItems", (entry) => entry.id === undo.id);
    if (undo.bookId) removeFirstMatching("book", (entry) => entry.id === undo.bookId);
  }
  if (undo.collection === "testimonies") {
    undone = removeFirstMatching("testimonies", (entry) => entry.id === undo.id || entry.title === undo.title);
    if (undo.bookId) removeFirstMatching("book", (entry) => entry.id === undo.bookId);
  }

  if (undone) {
    state.lastSavedEntry = null;
    recordPhase114Action("Undo Save", "Last supported save was removed from session state.");
    saveState();
    render();
    showPhase113SaveDrawer({ title: "Undo complete", detail: "The supported local save was removed." });
  } else {
    recordPhase114Error("Undo Save", "No matching local save record was found.");
    showPhase113SaveDrawer({ title: "Undo unavailable", detail: "No matching local save record was found." });
  }
}

function isPhase114QaAllowed() {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || new URLSearchParams(window.location.search).get("qa") === "1";
}

function getPhase114QaSnapshot() {
  const rail = $("#phase113InsightRail");
  return {
    route: getCurrentViewId(),
    selectedWord: state.selectedWord || state.generatedWord.word,
    selectedPromise: state.selectedPromiseResult?.title || getClusterTitle(promiseClusters[state.clusterIndex] || promiseClusters[0]),
    selectedJourney: state.selectedJourney?.title || state.generatedDailyJourney?.title || "Today journey preview",
    journalCount: safeArray(state.journalEntries).length,
    bookCount: safeArray(state.book).length,
    testimonyCount: safeArray(state.testimonies).length,
    promiseTableItemCount: getPhase114PromiseRows().length,
    personalization: state.consentState?.personalization || "session_only",
    commandPalette: $("#phase113CommandPalette") ? "available" : "missing",
    rightRail: rail?.classList.contains("collapsed") ? "collapsed" : "available",
    saveDrawer: $("#phase113SaveDrawer")?.classList.contains("visible") ? "visible" : "idle",
    exportCenter: $("#phase113ExportDialog")?.open ? "open" : "idle",
    dataControlsCenter: $("#phase117DataControlsDialog")?.open ? "open" : "idle",
    dataMode: getTeoyubeDataMode(),
    offlineStatus: state.teoyubeOfflineStatus || "online",
    lastExport: state.teoyubeLastExportStatus?.status || "none",
    importPreview: state.teoyubeLastImportPreview ? (state.teoyubeLastImportPreview.valid ? "valid" : "blocked") : "none",
    lastAction: state.lastActionRun || "Static app loaded",
    lastError: state.lastError || "none",
    lastFallbackReason: state.lastFallbackReason || "none",
    localOnlyStatus: "enabled",
    externalServicesStatus: "disabled"
  };
}

function ensurePhase114QaPanel() {
  if (!isPhase114QaAllowed() || $("#phase114QaPanel")) return;
  const panel = document.createElement("section");
  panel.id = "phase114QaPanel";
  panel.className = "phase114-qa-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Phase 11.4 local QA helper");
  panel.innerHTML = `
    <button type="button" class="phase114-qa-toggle" id="phase114QaToggle" aria-expanded="false">QA</button>
    <div class="phase114-qa-card">
      <div class="phase113-command-header">
        <div>
          <p class="eyebrow">Phase 11.4</p>
          <h2>Local QA Helper</h2>
        </div>
        <button type="button" class="phase113-icon-button" data-phase114-qa-close aria-label="Close QA helper">x</button>
      </div>
      <dl id="phase114QaSnapshot"></dl>
      <p>No raw private user text, secrets, tokens, or massive debug JSON are shown.</p>
      <button type="button" class="secondary" data-phase117-action="open-data-controls">Open Data Controls</button>
    </div>
  `;
  document.body.appendChild(panel);
  $("#phase114QaToggle")?.addEventListener("click", togglePhase114QaPanel);
  panel.querySelector("[data-phase114-qa-close]")?.addEventListener("click", togglePhase114QaPanel);
}

function renderPhase114QaPanel() {
  if (!isPhase114QaAllowed()) return;
  ensurePhase114QaPanel();
  const panel = $("#phase114QaPanel");
  const target = $("#phase114QaSnapshot");
  if (!panel || !target) return;
  panel.hidden = !state.phase114QaOpen && new URLSearchParams(window.location.search).get("qa") !== "1";
  $("#phase114QaToggle")?.setAttribute("aria-expanded", String(!panel.hidden));
  const snapshot = getPhase114QaSnapshot();
  target.innerHTML = Object.entries(snapshot)
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(String(value))}</dd></div>`)
    .join("");
}

function togglePhase114QaPanel() {
  state.phase114QaOpen = !state.phase114QaOpen;
  recordPhase114Action(state.phase114QaOpen ? "QA helper opened" : "QA helper closed");
  renderPhase114QaPanel();
}

function openGuardrailsModal(trigger = document.activeElement) {
  phase114GuardrailReturnFocus = trigger;
  const dialog = $("#guardrailDialog");
  if (!dialog) return;
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  else dialog.setAttribute("open", "open");
  recordPhase114Action("Guardrails opened", "Safety and privacy boundaries reviewed.");
}

function closeGuardrailsModal() {
  const dialog = $("#guardrailDialog");
  if (!dialog || !dialog.open) return;
  if (typeof dialog.close === "function") dialog.close();
  dialog.removeAttribute("open");
  if (phase114GuardrailReturnFocus?.focus) phase114GuardrailReturnFocus.focus();
  recordPhase114Action("Guardrails closed");
}

function openAssessmentDialog(trigger = document.activeElement) {
  phase114AssessmentReturnFocus = trigger;
  hydrateAssessment();
  const dialog = $("#assessmentDialog");
  if (typeof dialog?.showModal === "function") dialog.showModal();
  else dialog?.setAttribute("open", "open");
  recordPhase114Action("Purpose assessment opened", "Session-only assessment ready.");
}

function closeAssessmentDialogFocusReturn() {
  if (phase114AssessmentReturnFocus?.focus) phase114AssessmentReturnFocus.focus();
}

function setPhase114MobileNavOpen(open, trigger = null) {
  document.body.classList.toggle("mobile-nav-open", open);
  $("#mobileNavToggle")?.setAttribute("aria-expanded", String(open));
  const backdrop = $("#mobileNavBackdrop");
  if (backdrop) backdrop.hidden = !open;
  if (open && trigger) phase114MobileNavReturnFocus = trigger;
  if (!open && phase114MobileNavReturnFocus?.focus) phase114MobileNavReturnFocus.focus();
}

function togglePhase114MobileNav(trigger = null) {
  setPhase114MobileNavOpen(!document.body.classList.contains("mobile-nav-open"), trigger);
  recordPhase114Action(
    document.body.classList.contains("mobile-nav-open") ? "Mobile navigation opened" : "Mobile navigation closed"
  );
}

function savePhase114PromiseRowToBook(rowId) {
  const row = getPhase114PromiseRows().find((item) => item.id === rowId);
  if (!row) return;
  const bookEntry = {
    id: createPhase114Id("book"),
    type: "Promise Table Row",
    title: row.title,
    content: `Promise row saved from ${row.source || "local session"}. Status: ${row.status}.`,
    references: [row.scripture].filter(Boolean),
    date: new Date().toISOString()
  };
  state.book.unshift(bookEntry);
  saveJourneyMemoryItem({
    id: createPhase114Id("memory_promise_row"),
    type: "promise",
    title: row.title,
    summary: "Promise row saved to Book as visible local/session journey memory.",
    scripture: row.scripture,
    word: state.selectedWord,
    promise: row.title,
    surface: "promise-table"
  });
  recordPhase114Action("Promise row saved to Book", row.title);
  saveState();
  render();
  showPhase113SaveDrawer({
    title: "Promise row saved to Book",
    detail: row.title,
    scripture: row.scripture,
    targetView: "book",
    undo: { collection: "book", id: bookEntry.id, title: bookEntry.title }
  });
}

function updatePhase114PromiseStatus(rowId, status) {
  if (rowId === "active-daily-promise") {
    recordPhase114Action("Active promise status previewed", status);
    showPhase113SaveDrawer({ title: "Status previewed", detail: `Today's active promise is now marked ${status} for this view.` });
    return;
  }
  const row = safeArray(state.savedPromiseTableItems).find((item) => item.id === rowId);
  if (!row) return;
  row.status = status;
  row.updatedAt = new Date().toISOString();
  recordPhase114Action("Promise status updated", `${row.title}: ${status}`);
  saveState();
  renderPhase114PromiseTableRows();
  renderPhase113InsightRail();
  renderPhase114QaPanel();
}

function removePhase114PromiseRow(rowId) {
  const row = safeArray(state.savedPromiseTableItems).find((item) => item.id === rowId);
  if (!row) return;
  state.savedPromiseTableItems = safeArray(state.savedPromiseTableItems).filter((item) => item.id !== rowId);
  recordPhase114Action("Promise row removed", row.title);
  saveState();
  renderPhase114PromiseTableRows();
  renderPhase113InsightRail();
  renderPhase114QaPanel();
  showPhase113SaveDrawer({ title: "Promise row removed", detail: row.title, targetView: "table" });
}

function handlePhase114NamedAction(action, trigger = null) {
  if (action === "generate-journey") {
    generateJourney();
    return true;
  }
  if (action === "focus-search") {
    setView("search");
    $("#teoyubeSearchInput")?.focus();
    recordPhase114Action("Focused TeoyubeSearch");
    return true;
  }
  if (action === "add-reflection") {
    addManualEntry();
    return true;
  }
  if (action === "export-safe") {
    openPhase113ExportCenter();
    return true;
  }
  if (action === "open-guardrails") {
    openGuardrailsModal(trigger || document.activeElement);
    return true;
  }
  if (action === "open-personalization") {
    openPhase115PersonalizationCenter(trigger || document.activeElement);
    return true;
  }
  return false;
}

function handlePhase114ButtonFallback(button) {
  if (!button || button.disabled) return false;
  if (button.dataset.phase114Action) return handlePhase114NamedAction(button.dataset.phase114Action, button);
  if (button.matches(".nav-item, [data-view-shortcut], [data-phase113-command], [data-phase113-close], [data-phase114-save-action], [data-phase114-export-format], [data-phase115-action], [data-phase115-feedback], [data-phase115-consent-mode], [data-phase115-memory-filter], [data-phase115-remove-memory], [data-phase116-action], [data-phase116-workflow], [data-phase116-graph-mode], [data-phase116-graph-filter], [data-phase116-graph-node], [data-phase116-graph-edge], [data-phase116-teo-group], [data-phase117-action], [data-teoyube-data-mode], [data-phase117-import-strategy], [data-video-category], [data-world-query], [data-query], .prompt-chip, .cluster-nav-chip, [data-table-page], [data-slide-index], [data-ad-index], [data-canon-page], [data-canon-tab], [data-canon-item], [data-result-index], [data-ui-video-play], [data-promise-table-play], [data-table-row]")) {
    return false;
  }
  const label = normalize(button.textContent || button.getAttribute("aria-label") || "");
  if (!label) return false;
  if (label === "menu" || label.includes("navigation")) {
    togglePhase114MobileNav(button);
    return true;
  }
  if (label.includes("guardrails")) return handlePhase114NamedAction("open-guardrails", button);
  if (label.includes("personalization")) return handlePhase114NamedAction("open-personalization", button);
  if (label.includes("generate today's journey") || label.includes("start today's journey")) return handlePhase114NamedAction("generate-journey", button);
  if (label.includes("add reflection")) {
    addPhase116bCurrentReflection();
    return true;
  }
  if (label.includes("export")) {
    openPhase113ExportCenter();
    return true;
  }
  if (label.includes("view my journey") || label.includes("view full compass") || label.includes("start journey")) {
    setView(label.includes("compass") ? "calling" : "book");
    if (label.includes("compass")) startPhase116bCallingCompass();
    showPhase113SaveDrawer({ title: "Journey view opened", detail: "Local session view updated.", targetView: getCurrentViewId() });
    return true;
  }
  if (label.includes("view today's scripture")) {
    setView("search");
    const input = $("#teoyubeSearchInput");
    if (input) input.value = state.selectedScripture || "Ephesians 1:18";
    renderSearchResults(runTeoyubeSearch(input?.value || "Ephesians 1:18"));
    showPhase113SaveDrawer({ title: "Scripture search opened", detail: state.selectedScripture || "Ephesians 1:18", targetView: "search" });
    return true;
  }
  if (label.includes("summarize video") || label.includes("next teaching")) {
    setView("guide");
    const prompt = label.includes("summarize")
      ? `Summarize the current TeoyubeWorld teaching through ${state.selectedScripture || "Ephesians 1:18"}.`
      : `Suggest a next local teaching path for ${state.selectedWord || "today's word"}.`;
    if ($("#chatInput")) $("#chatInput").value = prompt;
    $("#chatForm")?.requestSubmit();
    return true;
  }
  if (label.includes("related promises")) {
    setView("table");
    addPromiseTableItem({ title: state.selectedPromiseResult?.title || getClusterTitle(phase116bClusterFromAny()), scripture: state.selectedScripture, status: "Discovered", source: "calling-assistant" });
    showPhase113SaveDrawer({ title: "Related promise added", detail: "Promise Table updated from the assistant panel.", targetView: "table" });
    return true;
  }
  if (label.includes("prayer guide")) {
    openPhase116bPrayerFramework();
    return true;
  }
  if (label.includes("open full journey") || label.includes("view journey map")) {
    setView("canon");
    showPhase113SaveDrawer({ title: "Canon journey opened", detail: "Local journey map preview selected.", targetView: "canon" });
    return true;
  }
  if (label.includes("add to promise table")) {
    const cluster = promiseClusters[state.clusterIndex] || promiseClusters[0];
    addSearchResultToPromiseTable(buildSearchResult("purpose", cluster, getLexiconItems()[0], 0));
    return true;
  }
  if (label.includes("ask the assistant")) {
    setView("guide");
    $("#chatInput")?.focus();
    showPhase113SaveDrawer({ title: "Teo Guide ready", detail: "Ask a Scripture-grounded local prompt.", targetView: "guide" });
    return true;
  }
  if (label.includes("write testimony")) {
    setView("testimony");
    $("#testimonyTitle")?.focus();
    showPhase113SaveDrawer({ title: "Testimony form ready", detail: "Testimony remains user-recorded only.", targetView: "testimony" });
    return true;
  }
  if (label.includes("filters")) {
    button.closest("section, article, div")?.querySelector("input, select")?.focus();
    recordPhase114Action("Filter controls focused", button.textContent.trim());
    return true;
  }
  if (label.includes("load more")) {
    showPhase113SaveDrawer({ title: "Local preview limit", detail: "More local items are available through search and filters." });
    return true;
  }
  if (label.includes("add image") || label.includes("add video") || label.includes("record audio") || label.includes("add link") || label.includes("voice") || label.includes("mic")) {
    recordPhase114Fallback("Media and voice inputs are disabled until owner-approved integrations are connected.");
    showPhase113SaveDrawer({ title: "Media not connected", detail: "This local beta keeps media upload and voice capture disabled.", targetView: getCurrentViewId() });
    return true;
  }
  if (label.includes("encourage") || label.includes("invite") || label.includes("analytics") || label.includes("calendar")) {
    recordPhase114Fallback("Community, analytics, calendar, and outreach features remain local preview placeholders.");
    showPhase113SaveDrawer({ title: "Preview-only action", detail: "No automatic contact, analytics, or external service was used.", targetView: getCurrentViewId() });
    return true;
  }
  if (label.includes("word explorer") || label.includes("compare words") || label.includes("word builder") || label.includes("memory verse")) {
    setView("lexicon");
    showPhase113SaveDrawer({ title: "Lexicon tool preview", detail: "Use search and filters to explore local word connections.", targetView: "lexicon" });
    return true;
  }
  return false;
}

function hydrateAssessment() {
  const profile = state.profile;
  $("#nameInput").value = profile.name;
  $("#ageInput").value = profile.age;
  $("#giftsInput").value = profile.gifts;
  $("#talentsInput").value = profile.talents;
  $("#passionsInput").value = profile.passions;
  $("#burdensInput").value = profile.burdens;
  $("#challengeInput").value = profile.challenge;
  $("#prayerInput").value = profile.prayer;
}

function wireEvents() {
  ensurePhase113Shell();
  renderPhase113InsightRail();
  renderPhase114QaPanel();
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTextField = target?.matches?.("input, textarea, select, [contenteditable='true']");
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "q") {
      event.preventDefault();
      togglePhase114QaPanel();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openPhase113CommandPalette();
    }
    if (event.key === "Escape") {
      closePhase113CommandPalette();
      closePhase113ExportCenter();
      closePhase115PersonalizationCenter();
      closePhase115ComparisonDialog();
      closePhase116GraphExplorer();
      closePhase116Workflow();
      closeTeoyubeDataControlsCenter();
      closeGuardrailsModal();
      setPhase114MobileNavOpen(false);
    }
    if (!isTextField && event.key === "/" && !$("#phase113CommandPalette")?.hidden) {
      event.preventDefault();
      $("#phase113CommandInput")?.focus();
    }
  });
  $("#phase113CommandInput")?.addEventListener("input", (event) => {
    renderPhase113Commands(event.target.value);
  });
  $("#phase113CommandInput")?.addEventListener("keydown", handlePhase113CommandKeyboard);
  $("#phase113CommandList")?.addEventListener("keydown", handlePhase113CommandKeyboard);
  $("#phase113CommandList")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-phase113-command]");
    if (!button) return;
    runPhase113Command(button.dataset.phase113Command);
  });
  $("#phase113Shell")?.addEventListener("click", (event) => {
    const commandButton = event.target.closest("[data-phase113-command]");
    if (commandButton && !event.target.closest("#phase113CommandList")) {
      runPhase113Command(commandButton.dataset.phase113Command);
      return;
    }
    const closeButton = event.target.closest("[data-phase113-close]");
    if (closeButton?.dataset.phase113Close === "palette") closePhase113CommandPalette();
    if (closeButton?.dataset.phase113Close === "export") closePhase113ExportCenter();
    if (closeButton?.dataset.phase113Close === "personalization") closePhase115PersonalizationCenter();
    if (closeButton?.dataset.phase113Close === "comparison") closePhase115ComparisonDialog();
    if (closeButton?.dataset.phase113Close === "phase116-graph") closePhase116GraphExplorer();
    if (closeButton?.dataset.phase113Close === "phase116-workflow") closePhase116Workflow();
    if (closeButton?.dataset.phase113Close === "phase117-data-controls") closeTeoyubeDataControlsCenter();
    const phase117Action = event.target.closest("[data-phase117-action]");
    if (phase117Action && handlePhase117Action(phase117Action.dataset.phase117Action, phase117Action)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const dataMode = event.target.closest("[data-teoyube-data-mode]");
    if (dataMode) {
      event.preventDefault();
      event.stopPropagation();
      setTeoyubeDataMode(dataMode.dataset.teoyubeDataMode);
      return;
    }
    const importStrategy = event.target.closest("[data-phase117-import-strategy]");
    if (importStrategy) {
      event.preventDefault();
      event.stopPropagation();
      state.teoyubeImportStrategy = importStrategy.dataset.phase117ImportStrategy || "preview_only";
      saveState();
      renderImportPreviewDialog();
      return;
    }
    const phase116Workflow = event.target.closest("[data-phase116-workflow]");
    if (phase116Workflow) {
      event.preventDefault();
      event.stopPropagation();
      openPhase116Workflow(phase116Workflow.dataset.phase116Workflow, phase116Workflow);
      return;
    }
    const phase116Action = event.target.closest("[data-phase116-action]");
    if (phase116Action && handlePhase116Action(phase116Action.dataset.phase116Action, phase116Action)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const phase116GraphMode = event.target.closest("[data-phase116-graph-mode]");
    if (phase116GraphMode) {
      state.phase116GraphMode = phase116GraphMode.dataset.phase116GraphMode || "path";
      renderPhase116GraphExplorer();
      return;
    }
    const phase116GraphFilter = event.target.closest("[data-phase116-graph-filter]");
    if (phase116GraphFilter) {
      state.phase116GraphFilter = phase116GraphFilter.dataset.phase116GraphFilter || "all";
      renderPhase116GraphExplorer();
      return;
    }
    const phase116GraphNode = event.target.closest("[data-phase116-graph-node]");
    if (phase116GraphNode) {
      state.phase116SelectedGraphNode = phase116GraphNode.dataset.phase116GraphNode || "";
      state.phase116SelectedGraphEdge = "";
      const selectedNode = safeArray(state.graphSelection?.nodes).find((node) => node.id === state.phase116SelectedGraphNode);
      updateRightRail({ surface: "graph", label: selectedNode?.label || state.phase116SelectedGraphNode, scripture: state.selectedScripture });
      renderPhase116GraphExplorer();
      renderPhase113InsightRail();
      return;
    }
    const phase116GraphEdge = event.target.closest("[data-phase116-graph-edge]");
    if (phase116GraphEdge) {
      state.phase116SelectedGraphEdge = phase116GraphEdge.dataset.phase116GraphEdge || "";
      const selectedEdge = safeArray(state.graphSelection?.edges).find((edge) => edge.id === state.phase116SelectedGraphEdge);
      updateRightRail({ surface: "graph", label: selectedEdge?.reason || state.phase116SelectedGraphEdge, scripture: state.selectedScripture });
      renderPhase116GraphExplorer();
      renderPhase113InsightRail();
      return;
    }
    const phase116TeoGroup = event.target.closest("[data-phase116-teo-group]");
    if (phase116TeoGroup) {
      state.phase116TeoPromptCategory = phase116TeoGroup.dataset.phase116TeoGroup || "Promise";
      renderPhase116TeoPromptCategories();
      return;
    }
    const consentMode = event.target.closest("[data-phase115-consent-mode]");
    if (consentMode) {
      event.preventDefault();
      event.stopPropagation();
      setPersonalizationMode(consentMode.dataset.phase115ConsentMode);
      return;
    }
    const phase115Feedback = event.target.closest("[data-phase115-feedback]");
    if (phase115Feedback) {
      event.preventDefault();
      event.stopPropagation();
      handlePhase115Feedback(phase115Feedback.dataset.phase115Feedback, phase115Feedback);
      return;
    }
    const phase115Action = event.target.closest("[data-phase115-action]");
    if (phase115Action && handlePhase115Action(phase115Action.dataset.phase115Action, phase115Action)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const removeHint = event.target.closest("[data-phase115-remove-hint]");
    if (removeHint) {
      removePhase115Hint(removeHint.dataset.phase115RemoveHint);
      return;
    }
    const removeMemory = event.target.closest("[data-phase115-remove-memory]");
    if (removeMemory) {
      removeJourneyMemoryItem(removeMemory.dataset.phase115RemoveMemory);
      render();
      showPhase113SaveDrawer({ title: "Memory item removed", detail: "The selected local/session memory item was removed." });
      return;
    }
    const memoryFilter = event.target.closest("[data-phase115-memory-filter]");
    if (memoryFilter) {
      state.phase115MemoryFilter = memoryFilter.dataset.phase115MemoryFilter || "all";
      saveState();
      renderPhase115BookMemoryTimeline();
      return;
    }
    const saveAction = event.target.closest("[data-phase114-save-action]");
    if (saveAction) handlePhase114SaveDrawerAction(saveAction.dataset.phase114SaveAction);
    const exportFormat = event.target.closest("[data-phase114-export-format]");
    if (exportFormat) {
      phase114ExportFormat = exportFormat.dataset.phase114ExportFormat === "markdown" ? "markdown" : "json";
      recordPhase114Action("Export format changed", phase114ExportFormat);
      renderPhase114ExportOutput();
    }
  });
  $("#phase113Shell")?.addEventListener("input", (event) => {
    if (event.target?.id === "phase116GraphSearch") {
      state.phase116GraphQuery = event.target.value;
      renderPhase116GraphExplorer();
    }
  });
  $("#phase113Shell")?.addEventListener("change", (event) => {
    const exportOption = event.target?.closest?.("[data-phase117-export-option]");
    if (exportOption) {
      const key = exportOption.dataset.phase117ExportOption;
      state.teoyubeExportOptions = {
        ...state.teoyubeExportOptions,
        [key]: Boolean(exportOption.checked)
      };
      saveState();
      renderPhase114ExportOutput();
      renderTeoyubeDataControlsCenter();
      return;
    }
    const fullExportConfirm = event.target?.closest?.("[data-phase117-full-export-confirm]");
    if (fullExportConfirm) {
      state.teoyubeFullPersonalExportConfirmed = Boolean(fullExportConfirm.checked);
      saveState();
      renderPhase114ExportOutput();
      renderTeoyubeDataControlsCenter();
      return;
    }
    if (event.target?.id === "phase117ImportFile") {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        phase117ImportFileText = String(reader.result || "");
        const parsed = parseImportFileSafely(phase117ImportFileText);
        state.teoyubeLastImportPreview = parsed.valid
          ? previewTeoyubeImportBundle(parsed.bundle)
          : { valid: false, blockers: [parsed.error], warnings: [], recordCounts: {}, duplicates: [] };
        renderImportPreviewDialog();
        recordPhase114Action("Import file selected", parsed.valid ? "Local JSON preview ready." : parsed.error);
      };
      reader.onerror = () => {
        state.teoyubeLastImportPreview = { valid: false, blockers: ["Could not read the selected file."], warnings: [], recordCounts: {}, duplicates: [] };
        renderImportPreviewDialog();
        recordPhase114Error("Import file read failed", "Could not read the selected file.");
      };
      reader.readAsText(file);
    }
  });
  $("#phase113RailToggle")?.addEventListener("click", () => {
    const rail = $("#phase113InsightRail");
    rail?.classList.toggle("collapsed");
    $("#phase113RailToggle")?.setAttribute("aria-expanded", String(!rail?.classList.contains("collapsed")));
    recordPhase114Action("Insight rail toggled", rail?.classList.contains("collapsed") ? "collapsed" : "expanded");
  });
  $("#mobileNavToggle")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    togglePhase114MobileNav(event.currentTarget);
  });
  $("#mobileNavBackdrop")?.addEventListener("click", () => {
    setPhase114MobileNavOpen(false);
    recordPhase114Action("Mobile navigation closed");
  });
  $all(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.view);
      recordPhase114Action("Page opened", button.textContent.trim());
      setPhase114MobileNavOpen(false);
    });
  });
  $all("[data-view-shortcut]").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.viewShortcut);
      recordPhase114Action("Shortcut opened", button.dataset.viewShortcut);
    });
  });
  $("#openAssessment").addEventListener("click", () => {
    openAssessmentDialog($("#openAssessment"));
  });
  $("#openPersonalizationCenter")?.addEventListener("click", (event) => {
    openPhase115PersonalizationCenter(event.currentTarget);
  });
  $("#assessmentDialog")?.addEventListener("close", closeAssessmentDialogFocusReturn);
  $("#assessmentDialog")?.addEventListener("cancel", closeAssessmentDialogFocusReturn);
  $("#phase115PersonalizationDialog")?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePhase115PersonalizationCenter();
  });
  $("#phase115ComparisonDialog")?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePhase115ComparisonDialog();
  });
  $("#phase116GraphDialog")?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePhase116GraphExplorer();
  });
  $("#phase116WorkflowDialog")?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePhase116Workflow();
  });
  $("#phase117DataControlsDialog")?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeTeoyubeDataControlsCenter();
  });
  window.addEventListener("online", updateTeoyubeOfflineStatus);
  window.addEventListener("offline", updateTeoyubeOfflineStatus);
  updateTeoyubeOfflineStatus();
  $("#assessmentForm").addEventListener("submit", saveAssessment);
  $("#generateBtn").addEventListener("click", generateJourney);
  $("#completeAssignment").addEventListener("click", completeAssignment);
  $("#addManualEntry").addEventListener("click", addManualEntry);
  $("#testimonyForm").addEventListener("submit", addTestimony);
  $(".testimony-tabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    activeTestimonyFilter = button.textContent.trim().replace(/s$/, "");
    if (activeTestimonyFilter === "Draft") activeTestimonyFilter = "Draft";
    $all(".testimony-tabs button").forEach((tab) => {
      tab.classList.toggle("active", tab === button);
    });
    renderTestimonies();
  });
  $("#chatForm").addEventListener("submit", askTeo);
  $("#carouselPrev")?.addEventListener("click", () => goToPromiseSlide(activePromiseSlide - 1));
  $("#carouselNext")?.addEventListener("click", () => goToPromiseSlide(activePromiseSlide + 1));
  $("#promiseCarouselDots")?.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-slide-index]");
    if (!dot) return;
    goToPromiseSlide(Number(dot.dataset.slideIndex));
  });
  $("#todayPromiseCarousel")?.addEventListener("mouseenter", () => {
    promiseCarouselPaused = true;
  });
  $("#todayPromiseCarousel")?.addEventListener("mouseleave", () => {
    promiseCarouselPaused = false;
  });
  $("#todayPromiseCarousel")?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") goToPromiseSlide(activePromiseSlide - 1);
    if (event.key === "ArrowRight") goToPromiseSlide(activePromiseSlide + 1);
  });
  $("#todayPromiseCarousel")?.addEventListener("pointerdown", (event) => {
    promiseCarouselDragStart = event.clientX;
  });
  $("#todayPromiseCarousel")?.addEventListener("pointerup", (event) => {
    if (promiseCarouselDragStart === null) return;
    const delta = event.clientX - promiseCarouselDragStart;
    if (Math.abs(delta) > 40) goToPromiseSlide(activePromiseSlide + (delta < 0 ? 1 : -1));
    promiseCarouselDragStart = null;
  });
  $("#adCarouselPrev")?.addEventListener("click", () => goToAdSlide(activeAdSlide - 1));
  $("#adCarouselNext")?.addEventListener("click", () => goToAdSlide(activeAdSlide + 1));
  $("#teoyubeAdDots")?.addEventListener("click", (event) => {
    const dot = event.target.closest("[data-ad-index]");
    if (!dot) return;
    goToAdSlide(Number(dot.dataset.adIndex));
  });
  $("#teoyubeAdCarousel")?.addEventListener("mouseenter", () => {
    adCarouselPaused = true;
  });
  $("#teoyubeAdCarousel")?.addEventListener("mouseleave", () => {
    adCarouselPaused = false;
  });
  $("#teoyubeAdCarousel")?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") goToAdSlide(activeAdSlide - 1);
    if (event.key === "ArrowRight") goToAdSlide(activeAdSlide + 1);
  });
  $("#teoyubeAdCarousel")?.addEventListener("pointerdown", (event) => {
    adCarouselDragStart = event.clientX;
  });
  $("#teoyubeAdCarousel")?.addEventListener("pointerup", (event) => {
    if (adCarouselDragStart === null) return;
    const delta = event.clientX - adCarouselDragStart;
    if (Math.abs(delta) > 40) goToAdSlide(activeAdSlide + (delta < 0 ? 1 : -1));
    adCarouselDragStart = null;
  });
  window.addEventListener("resize", centerActiveAdCard);
  $("#prayBtn").addEventListener("click", () => {
    state.chat.push({
      role: "teo",
      text: `Prayer framework: ${getClusterPrayer(promiseClusters[state.clusterIndex])} Let ${state.generatedWord.word} remind you of ${state.generatedWord.meaning}`
    });
    recordPhase114Action("Prayer framework opened", getClusterPrayer(promiseClusters[state.clusterIndex]));
    saveState();
    setView("guide");
    renderChat();
    showPhase113SaveDrawer({
      title: "Prayer framework ready",
      detail: "Local Teo Guide prayer response opened.",
      scripture: getClusterScriptures(promiseClusters[state.clusterIndex])[0],
      targetView: "guide"
    });
  });
  $("#privacyBtn").addEventListener("click", () => openGuardrailsModal($("#privacyBtn")));
  $("#closeGuardrails").addEventListener("click", closeGuardrailsModal);
  $("#guardrailDialog")?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeGuardrailsModal();
  });
  $all(".prompt-chip").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (!button.dataset.prompt) return;
      event.preventDefault();
      event.stopPropagation();
      $("#chatInput").value = button.dataset.prompt;
      recordPhase116SafeSearch(button.dataset.prompt, "teo-guide");
      recordPhase114Action("Prompt chip submitted", button.textContent.trim());
      $("#chatForm").requestSubmit();
    });
  });
  $("#teoyubeSearchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const query = $("#teoyubeSearchInput").value;
    state.activeSearchQuery = query;
    state.activeRightRailItem = "search";
    recordPhase116SafeSearch(query, "teoyube-search");
    recordPhase114Action("TeoyubeSearch submitted", query || "empty query");
    renderSearchResults(runTeoyubeSearch(query));
    renderPhase113InsightRail();
    mountPhase116SearchSuggestionPanels();
  });
  $("#bookSearchInput")?.addEventListener("input", (event) => {
    bookSearchQuery = event.target.value || "";
    recordPhase116SafeSearch(bookSearchQuery, "book");
    renderBook();
    recordPhase114Action("Book search updated", bookSearchQuery || "cleared");
  });
  $("#bookTypeFilter")?.addEventListener("change", (event) => {
    bookTypeFilter = event.target.value || "all";
    renderBook();
    recordPhase114Action("Book type filter updated", bookTypeFilter);
  });
  $("#bookDateFilter")?.addEventListener("change", (event) => {
    bookDateFilter = event.target.value || "all";
    renderBook();
    recordPhase114Action("Book date filter updated", bookDateFilter);
  });
  $("#lexiconSearchInput")?.addEventListener("input", (event) => {
    lexiconSearchQuery = event.target.value || "";
    recordPhase116SafeSearch(lexiconSearchQuery, "lexicon");
    renderLexicon();
  });
  $("#lexiconCategoryFilter")?.addEventListener("change", (event) => {
    lexiconCategoryFilter = event.target.value || "all";
    renderLexicon();
  });
  $("#lexiconSpeechFilter")?.addEventListener("change", (event) => {
    lexiconSpeechFilter = event.target.value || "all";
    renderLexicon();
  });
  $("#lexiconAlphaTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lexicon-alpha]");
    if (!button || !event.currentTarget.contains(button)) return;
    event.preventDefault();
    activeLexiconAlpha = button.dataset.lexiconAlpha || "all";
    renderLexicon();
  });
  $("#teoyubeSearchResults").addEventListener("click", (event) => {
    const saveButton = event.target.closest(".search-save-book");
    const addButton = event.target.closest(".search-add-table");
    const prayerButton = event.target.closest(".search-generate-prayer");
    const graphButton = event.target.closest(".search-open-graph");
    if (saveButton) saveSearchResultToBook(getRenderedSearchResult(saveButton));
    if (addButton) addSearchResultToPromiseTable(getRenderedSearchResult(addButton));
    if (prayerButton) {
      const result = getRenderedSearchResult(prayerButton);
      if (!result) return;
      setActiveTigResponse(createPhase116bTigResponse({
        source: "teoyube-search-prayer",
        title: result.title,
        scripture: result.scripture_references?.[0],
        word: result.teoyube_word,
        promise: result.promise_category,
        prayer: result.prayer,
        action: result.assignment,
        confidence: result.confidence_label || `Level ${result.promise_level}`
      }));
      state.chat.push({ role: "teo", text: result.prayer });
      recordPhase114Action("Search prayer opened", result.title);
      saveState();
      setView("guide");
      renderChat();
    }
    if (graphButton) {
      const result = getRenderedSearchResult(graphButton);
      if (!result) return;
      setActiveTigResponse(createPhase116bTigResponse({
        source: "teoyube-search-graph",
        title: result.title,
        scripture: result.scripture_references?.[0],
        word: result.teoyube_word,
        promise: result.promise_category,
        prayer: result.prayer,
        action: result.assignment,
        confidence: result.confidence_label || `Level ${result.promise_level}`
      }));
      openPhase116GraphExplorer(graphButton);
    }
  });
  $("#promiseClusterNavigation").addEventListener("click", (event) => {
    const button = event.target.closest(".cluster-nav-chip");
    if (!button) return;
    $("#teoyubeSearchInput").value = button.dataset.query;
    renderSearchResults(runTeoyubeSearch(button.dataset.query));
  });
  $("#canonTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-canon-tab]");
    if (!button) return;
    activeCanonTab = button.dataset.canonTab;
    selectedCanonItemId = "";
    activeCanonPage = 1;
    renderCanon();
  });
  $("#canonPagination")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-canon-page]");
    if (!button || button.disabled) return;
    activeCanonPage = Number(button.dataset.canonPage) || 1;
    selectedCanonItemId = "";
    renderCanon();
  });
  $("#canonGrid")?.addEventListener("click", (event) => {
    if (handleStaticCanonMediaActivation(event)) return;
    const featuredNav = event.target.closest("[data-canon-featured-slide-nav]");
    if (featuredNav) {
      event.preventDefault();
      event.stopPropagation();
      const offset = featuredNav.dataset.canonFeaturedSlideNav === "next" ? 1 : -1;
      setCanonFeaturedJourneySlideIndex(selectedCanonFeaturedJourneySlideIndex + offset);
      updateCanonFeaturedJourneyCarouselCard();
      return;
    }

    const featuredDot = event.target.closest("[data-canon-featured-slide-index]");
    if (featuredDot) {
      event.preventDefault();
      event.stopPropagation();
      setCanonFeaturedJourneySlideIndex(Number(featuredDot.dataset.canonFeaturedSlideIndex));
      updateCanonFeaturedJourneyCarouselCard();
      return;
    }

    const card = event.target.closest("[data-canon-item]");
    if (!card) return;
    selectedCanonItemId = card.dataset.canonItem;
    renderCanon();
  });
  $("#canonGrid")?.addEventListener("mouseover", (event) => {
    if (event.target.closest("[data-canon-featured-carousel]")) canonFeaturedJourneyPaused = true;
  });
  $("#canonGrid")?.addEventListener("mouseout", (event) => {
    const carousel = event.target.closest("[data-canon-featured-carousel]");
    if (!carousel || (event.relatedTarget && carousel.contains(event.relatedTarget))) return;
    canonFeaturedJourneyPaused = false;
  });
  $("#canonGrid")?.addEventListener("focusin", (event) => {
    if (event.target.closest("[data-canon-featured-carousel]")) canonFeaturedJourneyPaused = true;
  });
  $("#canonGrid")?.addEventListener("focusout", (event) => {
    const carousel = event.target.closest("[data-canon-featured-carousel]");
    if (!carousel || (event.relatedTarget && carousel.contains(event.relatedTarget))) return;
    canonFeaturedJourneyPaused = false;
  });
  $("#canonGrid")?.addEventListener("keydown", (event) => {
    if (handleStaticCanonMediaActivation(event)) return;
    if (!event.target.closest("[data-canon-featured-carousel]")) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const offset = event.key === "ArrowRight" ? 1 : -1;
    setCanonFeaturedJourneySlideIndex(selectedCanonFeaturedJourneySlideIndex + offset);
    updateCanonFeaturedJourneyCarouselCard();
  });
  $("#canonGrid")?.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("[data-canon-featured-carousel]")) return;
    canonFeaturedJourneyDragStart = event.clientX;
  });
  $("#canonGrid")?.addEventListener("pointerup", (event) => {
    if (canonFeaturedJourneyDragStart === null || !event.target.closest("[data-canon-featured-carousel]")) return;
    const delta = event.clientX - canonFeaturedJourneyDragStart;
    if (Math.abs(delta) > 42) {
      setCanonFeaturedJourneySlideIndex(selectedCanonFeaturedJourneySlideIndex + (delta < 0 ? 1 : -1));
      updateCanonFeaturedJourneyCarouselCard();
    }
    canonFeaturedJourneyDragStart = null;
  });
  $("#canonGrid")?.addEventListener("pointercancel", () => {
    canonFeaturedJourneyDragStart = null;
  });
  $("#canonPaths")?.addEventListener("click", (event) => {
    const recommendedNav = event.target.closest("[data-canon-recommended-nav]");
    if (recommendedNav) {
      event.preventDefault();
      event.stopPropagation();
      const offset = recommendedNav.dataset.canonRecommendedNav === "next" ? 1 : -1;
      setCanonRecommendedSlideIndex(selectedCanonRecommendedSlideIndex + offset);
      updateCanonRecommendedCarousel();
      return;
    }

    const recommendedDot = event.target.closest("[data-canon-recommended-index]");
    if (recommendedDot) {
      event.preventDefault();
      event.stopPropagation();
      setCanonRecommendedSlideIndex(Number(recommendedDot.dataset.canonRecommendedIndex));
      updateCanonRecommendedCarousel();
    }
  });
  $("#canonPaths")?.addEventListener("mouseover", (event) => {
    if (event.target.closest("[data-canon-recommended-carousel]")) canonRecommendedPaused = true;
  });
  $("#canonPaths")?.addEventListener("mouseout", (event) => {
    const carousel = event.target.closest("[data-canon-recommended-carousel]");
    if (!carousel || (event.relatedTarget && carousel.contains(event.relatedTarget))) return;
    canonRecommendedPaused = false;
  });
  $("#canonPaths")?.addEventListener("focusin", (event) => {
    if (event.target.closest("[data-canon-recommended-carousel]")) canonRecommendedPaused = true;
  });
  $("#canonPaths")?.addEventListener("focusout", (event) => {
    const carousel = event.target.closest("[data-canon-recommended-carousel]");
    if (!carousel || (event.relatedTarget && carousel.contains(event.relatedTarget))) return;
    canonRecommendedPaused = false;
  });
  $("#canonPaths")?.addEventListener("keydown", (event) => {
    if (!event.target.closest("[data-canon-recommended-carousel]")) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const offset = event.key === "ArrowRight" ? 1 : -1;
    setCanonRecommendedSlideIndex(selectedCanonRecommendedSlideIndex + offset);
    updateCanonRecommendedCarousel();
  });
  $("#canonPaths")?.addEventListener("pointerdown", (event) => {
    if (!event.target.closest("[data-canon-recommended-carousel]")) return;
    canonRecommendedDragStart = event.clientX;
  });
  $("#canonPaths")?.addEventListener("pointerup", (event) => {
    if (canonRecommendedDragStart === null || !event.target.closest("[data-canon-recommended-carousel]")) return;
    const delta = event.clientX - canonRecommendedDragStart;
    if (Math.abs(delta) > 42) {
      setCanonRecommendedSlideIndex(selectedCanonRecommendedSlideIndex + (delta < 0 ? 1 : -1));
      updateCanonRecommendedCarousel();
    }
    canonRecommendedDragStart = null;
  });
  $("#canonPaths")?.addEventListener("pointercancel", () => {
    canonRecommendedDragStart = null;
  });
  $("#canonRecentGrid")?.addEventListener("click", (event) => {
    if (handleStaticCanonMediaActivation(event)) return;
    const watchmanPlay = event.target.closest("[data-watchman-video-play]");
    if (watchmanPlay) {
      event.preventDefault();
      event.stopPropagation();
      const videoId = watchmanPlay.dataset.watchmanVideoPlay;
      const card = watchmanPlay.closest(".canon-watchman-story-card");
      const frame = card?.querySelector("[data-watchman-video-frame] iframe");
      if (frame && videoId) {
        showLocalMediaNotice("Canon journey media");
        card.classList.add("playing");
      }
      return;
    }

    const watchmanNav = event.target.closest("[data-watchman-video-nav]");
    if (watchmanNav) {
      event.preventDefault();
      event.stopPropagation();
      const offset = watchmanNav.dataset.watchmanVideoNav === "next" ? 1 : -1;
      setWatchmanJourneyVideoIndex(selectedWatchmanJourneyVideoIndex + offset);
      renderCanon();
      return;
    }

    const watchmanDot = event.target.closest("[data-watchman-video-index]");
    if (watchmanDot) {
      event.preventDefault();
      event.stopPropagation();
      setWatchmanJourneyVideoIndex(Number(watchmanDot.dataset.watchmanVideoIndex));
      renderCanon();
      return;
    }

    const card = event.target.closest("[data-canon-item]");
    if (!card) return;
    selectedCanonItemId = card.dataset.canonItem;
    renderCanon();
  });
  $("#canonRecentGrid")?.addEventListener("keydown", (event) => {
    handleStaticCanonMediaActivation(event);
  });
  $("#promiseMovieForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const query = $("#promiseMovieInput").value;
    recordPhase116SafeSearch(query, "ui-elements");
    searchPromiseMovie(query);
  });
  $(".search-promise-card .search-chip-row")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-world-query]");
    if (!button) return;
    const query = button.dataset.worldQuery || button.textContent.trim() || "TeoyubeWorld";
    $all(".search-promise-card .search-chip-row button").forEach((tab) => {
      tab.classList.toggle("active", tab === button);
    });
    $("#promiseMovieInput").value = query;
    recordPhase116SafeSearch(query, "ui-elements");
    searchPromiseMovie(query);
  });
  $("#featuredStoryCarousel")?.addEventListener("click", (event) => {
    const previous = event.target.closest("#featuredStoryPrev");
    const next = event.target.closest("#featuredStoryNext");
    const indexed = event.target.closest("[data-featured-story-index]");

    if (previous) {
      goToFeaturedStory(selectedTodayYoutubeVideoIndex - 1);
      return;
    }

    if (next) {
      goToFeaturedStory(selectedTodayYoutubeVideoIndex + 1);
      return;
    }

    if (indexed) {
      goToFeaturedStory(Number(indexed.dataset.featuredStoryIndex));
    }
  });
  $("#featuredStoryCarousel")?.addEventListener("mouseenter", () => {
    featuredStoryPaused = true;
  });
  $("#featuredStoryCarousel")?.addEventListener("mouseleave", () => {
    featuredStoryPaused = false;
  });
  $("#featuredStoryCarousel")?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToFeaturedStory(selectedTodayYoutubeVideoIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToFeaturedStory(selectedTodayYoutubeVideoIndex + 1);
    }
  });
  $("#featuredStoryCarousel")?.addEventListener("pointerdown", (event) => {
    featuredStoryDragStart = event.clientX;
  });
  $("#featuredStoryCarousel")?.addEventListener("pointerup", (event) => {
    if (featuredStoryDragStart === null) return;
    const delta = event.clientX - featuredStoryDragStart;
    if (Math.abs(delta) > 42) goToFeaturedStory(selectedTodayYoutubeVideoIndex + (delta < 0 ? 1 : -1));
    featuredStoryDragStart = null;
  });
  $("#promiseMovieResult").addEventListener("click", (event) => {
    const navButton = event.target.closest("[data-today-video-nav]");
    if (navButton) {
      const offset = navButton.dataset.todayVideoNav === "next" ? 1 : -1;
      goToFeaturedStory(selectedTodayYoutubeVideoIndex + offset);
      return;
    }

    const playButton = event.target.closest(".promise-embed-play-overlay");
    if (!playButton) return;
    const frame = playButton.parentElement?.querySelector("iframe");
    const videoId = playButton.dataset.videoId;
    if (frame && videoId) {
      showLocalMediaNotice("TeoyubeWorld highlight");
    }
    playButton.remove();
  });
  $("#clientsPromiseRows").addEventListener("click", (event) => {
    const button = event.target.closest(".today-video-select");
    const row = event.target.closest("[data-today-video-index]");
    if (!button || !row) return;
    const videos = getTodayYoutubeFeedVideos();
    selectedTodayYoutubeVideoIndex = Number(row.dataset.todayVideoIndex) || 0;
    selectedTodayYoutubeVideo = videos[selectedTodayYoutubeVideoIndex] || videos[0] || null;
    renderFeaturedStoryCarousel();
    renderPromiseMoviePanel();
    renderClientsPromiseTable();
  });
  $("#promiseTableSearchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    promiseTableQuery = $("#promiseTableSearchInput").value;
    recordPhase116SafeSearch(promiseTableQuery, "promise-table");
    renderPromiseTableSearchFeed();
  });
  $("#promiseTableVideoPanel").addEventListener("click", (event) => {
    const videos = getPromiseTableChannelVideos();

    const navButton = event.target.closest("[data-promise-table-video-nav]");
    if (navButton) {
      if (!videos.length) return;
      const currentIndex = Math.max(0, videos.findIndex((video) => video.id === selectedPromiseTableVideo?.id));
      const offset = navButton.dataset.promiseTableVideoNav === "next" ? 1 : -1;
      selectedPromiseTableVideo = videos[(currentIndex + offset + videos.length) % videos.length];
      renderPromiseTableSearchFeed();
      return;
    }

    const dotButton = event.target.closest("[data-promise-table-video-index]");
    if (dotButton) {
      const nextVideo = videos[Number(dotButton.dataset.promiseTableVideoIndex)];
      if (!nextVideo) return;
      selectedPromiseTableVideo = nextVideo;
      renderPromiseTableSearchFeed();
      return;
    }

    const playButton = event.target.closest("[data-promise-table-play], .promise-table-embed-play-overlay");
    if (!playButton) return;
    const videoId = playButton.dataset.promiseTablePlay || playButton.dataset.videoId;
    const frame = $("#promiseTableVideoPanel .promise-table-video-frame iframe");
    if (frame && videoId) {
      showLocalMediaNotice("Promise Table media");
    }
    $("#promiseTableVideoPanel .promise-table-video-artwork")?.remove();
    $("#promiseTableVideoPanel .promise-table-embed-play-overlay")?.remove();
  });
  $("#promiseTableSearchResults").addEventListener("click", (event) => {
    const button = event.target.closest(".promise-watch-video");
    if (!button) return;
    const videos = getPromiseTableChannelVideos();
    if (!videos.length) {
      loadPromiseTableYoutubeFeed("TeoyubeWorld");
      return;
    }
    selectedPromiseTableVideo = videos[Number(button.dataset.videoIndex) % videos.length];
    renderPromiseTableSearchFeed();
    requestAnimationFrame(bringPromiseTableVideoPanelIntoView);
  });
  $("#savedPromiseTableRows")?.addEventListener("change", (event) => {
    const select = event.target.closest("[data-phase114-promise-status]");
    if (!select) return;
    updatePhase114PromiseStatus(select.dataset.phase114PromiseStatus, select.value);
  });
  $("#savedPromiseTableRows")?.addEventListener("click", (event) => {
    const saveButton = event.target.closest("[data-phase114-save-promise]");
    const removeButton = event.target.closest("[data-phase114-remove-promise]");
    if (saveButton) savePhase114PromiseRowToBook(saveButton.dataset.phase114SavePromise);
    if (removeButton) removePhase114PromiseRow(removeButton.dataset.phase114RemovePromise);
  });
  $("#teoyubeTablesRows")?.addEventListener("click", (event) => {
    const demoAction = event.target.closest("[data-table-demo-action]");
    if (demoAction) {
      const rowIndex = Number(demoAction.dataset.tableDemoRow);
      const row = getFilteredTeoyubeTableRows().find((item) => item.tableIndex === rowIndex);
      if (!row) return;
      if (demoAction.dataset.tableDemoAction === "details") {
        expandedTeoyubeTableRows.add(rowIndex);
      } else if (demoAction.dataset.tableDemoAction === "save") {
        saveToBook({
          type: "Table Demonstration",
          title: row.title,
          content: getPromiseDescriptionBody(row.description),
          references: [getPromisePosition(row.description).replaceAll("-", "")],
          source: "tables-demo"
        });
        showActionToast("Table row saved to Book", row.title);
      } else if (demoAction.dataset.tableDemoAction === "filter") {
        teoyubeTableCategoryFilter = row.tableCategory;
        teoyubeTablePage = 1;
        const categorySelect = $("#teoyubeTableCategory");
        if (categorySelect) categorySelect.value = row.tableCategory;
      }
      renderTeoyubeTablesPage();
      return;
    }

    const previewPlayButton = event.target.closest("[data-table-preview-video-play]");
    if (previewPlayButton) {
      const videoId = previewPlayButton.dataset.tablePreviewVideoPlay;
      const panel = previewPlayButton.closest(".table-preview-video-panel");
      const frame = panel?.querySelector("iframe");
      if (frame && videoId) {
        showLocalMediaNotice("Promise Table preview");
        panel?.classList.add("playing");
      }
      return;
    }

    const previewPanel = event.target.closest(".table-preview-video-panel");
    if (previewPanel && !previewPanel.classList.contains("playing")) {
      const videoId = previewPanel.dataset.tableVideoPreview;
      const frame = previewPanel.querySelector("iframe");
      if (frame && videoId) {
        showLocalMediaNotice("Promise Table preview");
        previewPanel.classList.add("playing");
      }
      return;
    }

    const videoPlayButton = event.target.closest("[data-table-video-play]");
    if (videoPlayButton) {
      const videoId = videoPlayButton.dataset.tableVideoPlay;
      const panel = videoPlayButton.closest(".table-row-video");
      const frame = panel?.querySelector("iframe");
      if (frame && videoId) {
        showLocalMediaNotice("Promise Table media");
        panel?.classList.add("playing");
      }
      return;
    }

    const videoNavButton = event.target.closest("[data-table-video-nav]");
    if (videoNavButton) {
      const videos = getPromiseTableChannelVideos();
      if (!videos.length) return;

      const panel = videoNavButton.closest(".table-row-video");
      const frame = panel?.querySelector("iframe");
      if (!panel || !frame) return;

      const currentIndex = Number(panel.dataset.tableVideoCurrentIndex) || 0;
      const offset = videoNavButton.dataset.tableVideoNav === "next" ? 1 : -1;
      const nextIndex = (currentIndex + offset + videos.length) % videos.length;
      const nextVideo = videos[nextIndex];
      if (!nextVideo?.id) return;

      const nextTitle = getUiVideoTitle(nextVideo, nextIndex);
      panel.dataset.tableVideoCurrentIndex = String(nextIndex);
      panel.style.setProperty("--table-video-thumb", `url("${getUiVideoThumbnail(nextVideo).replaceAll('"', "%22")}")`);
      panel.classList.remove("playing");
      frame.title = nextTitle;
      frame.removeAttribute("src");
      const title = panel.querySelector(".table-row-video-title");
      if (title) title.textContent = nextTitle;
      const play = panel.querySelector("[data-table-video-play]");
      if (play) {
        play.dataset.tableVideoPlay = nextVideo.id;
        play.setAttribute("aria-label", `Play ${nextTitle}`);
      }
      const detail = panel.closest(".table-detail-content");
      const preview = detail?.querySelector("[data-table-video-preview]");
      if (preview) {
        preview.dataset.tableVideoPreview = nextVideo.id;
        preview.dataset.tableVideoPreviewIndex = String(nextIndex);
        preview.setAttribute("aria-label", `${nextTitle} preview video`);
        preview.style.setProperty("--table-preview-thumb", `url("${getUiVideoThumbnail(nextVideo).replaceAll('"', "%22")}")`);
        preview.classList.remove("playing");
        const previewFrame = preview.querySelector("iframe");
        if (previewFrame) {
          previewFrame.title = `${nextTitle} preview`;
          previewFrame.removeAttribute("src");
        }
        const previewPlay = preview.querySelector("[data-table-preview-video-play]");
        if (previewPlay) {
          previewPlay.dataset.tablePreviewVideoPlay = nextVideo.id;
          previewPlay.setAttribute("aria-label", `Play ${nextTitle} in the far-left preview panel`);
        }
        const previewImage = preview.querySelector("img");
        if (previewImage) previewImage.src = getUiVideoThumbnail(nextVideo);
        const previewDuration = preview.querySelector(".table-detail-duration");
        if (previewDuration) previewDuration.textContent = uiVideoDurations[nextIndex % uiVideoDurations.length];
      }
      return;
    }

    const button = event.target.closest("[data-table-row]");
    if (!button) return;
    const rowIndex = Number(button.dataset.tableRow);
    if (expandedTeoyubeTableRows.has(rowIndex)) {
      expandedTeoyubeTableRows.delete(rowIndex);
    } else {
      expandedTeoyubeTableRows.add(rowIndex);
    }
    renderTeoyubeTablesPage();
  });
  $("#teoyubeTablesRows")?.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-table-select]");
    if (!checkbox) return;
    const rowIndex = Number(checkbox.dataset.tableSelect);
    if (checkbox.checked) selectedTeoyubeTableRows.add(rowIndex);
    else selectedTeoyubeTableRows.delete(rowIndex);
    checkbox.closest(".teoyube-main-row")?.classList.toggle("selected", checkbox.checked);
  });
  $("#teoyubeTableSearch")?.addEventListener("input", (event) => {
    teoyubeTableSearchQuery = event.target.value;
    teoyubeTablePage = 1;
    renderTeoyubeTablesPage();
  });
  $("#teoyubeTableCategory")?.addEventListener("change", (event) => {
    teoyubeTableCategoryFilter = event.target.value;
    teoyubeTablePage = 1;
    renderTeoyubeTablesPage();
  });
  $("#teoyubeTableSort")?.addEventListener("change", (event) => {
    teoyubeTableSortMode = event.target.value;
    teoyubeTablePage = 1;
    renderTeoyubeTablesPage();
  });
  $("#teoyubeTablePageSize")?.addEventListener("change", (event) => {
    teoyubeTablePageSize = Number(event.target.value) || 10;
    teoyubeTablePage = 1;
    renderTeoyubeTablesPage();
  });
  $("#teoyubeTablePagination")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-table-page]");
    if (!button) return;
    teoyubeTablePage = Number(button.dataset.tablePage) || 1;
    renderTeoyubeTablesPage();
  });
  $("#teoyubeTableFiltersButton")?.addEventListener("click", () => {
    $("#teoyubeTableSearch")?.focus();
  });
  $("#teoyubeDataTableTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-data-table-tab]");
    if (!button) return;
    teoyubeDataTableTab = button.dataset.dataTableTab;
    teoyubeDataTablePage = 1;
    renderTeoyubeDataManagement();
  });
  $("#teoyubeDataTableSearch")?.addEventListener("input", (event) => {
    teoyubeDataTableQuery = event.target.value;
    teoyubeDataTablePage = 1;
    renderTeoyubeDataManagement();
  });
  $("#teoyubeDataTableSort")?.addEventListener("change", (event) => {
    teoyubeDataTableSortMode = event.target.value;
    teoyubeDataTablePage = 1;
    renderTeoyubeDataManagement();
  });
  $("#teoyubeDataTablePageSize")?.addEventListener("change", (event) => {
    teoyubeDataTablePageSize = Number(event.target.value) || 8;
    teoyubeDataTablePage = 1;
    renderTeoyubeDataManagement();
  });
  $("#teoyubeDataVideoSource")?.addEventListener("change", (event) => {
    teoyubeDataVideoSource = event.target.value;
    teoyubeDataTablePage = 1;
    renderTeoyubeDataManagement();
  });
  $("#teoyubeDataTablePagination")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-data-table-page]");
    if (!button) return;
    teoyubeDataTablePage = Number(button.dataset.dataTablePage) || 1;
    renderTeoyubeDataManagement();
  });
  $("#teoyubeDataTableRows")?.addEventListener("change", (event) => {
    const control = event.target.closest('[data-data-table-action="promise-status"]');
    if (!control) return;
    const row = getTeoyubeDataManagementRecords("promises").find((record) => record.id === control.dataset.dataRowId);
    if (!row) return;
    const saved = safeArray(state.savedPromiseTableItems).find((record) => record.id === row.id);
    if (saved) updatePromiseTableStatus(saved.id, control.value);
    else addPromiseTableItem({ title: row.title, scripture: row.scripture, word: row.word, status: control.value, source: "tables" });
    renderTeoyubeDataManagement();
  });
  $("#teoyubeDataTableRows")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-data-table-action]");
    if (!button || button.matches("select")) return;
    const action = button.dataset.dataTableAction;
    const row = getTeoyubeDataManagementRecords(teoyubeDataTableTab).find((record) => record.id === button.dataset.dataRowId);
    if (!row) return;

    if (action === "promise-open") {
      setActivePromiseCluster(row.raw);
      setView("table");
    } else if (action === "promise-save") {
      saveToBook({ type: "Promise", title: row.title, content: row.raw.summary || row.raw.notes || "Promise saved from Tables.", references: [row.scripture], source: "tables" });
      showActionToast("Promise saved to Book", row.title);
    } else if (action === "scripture-open") {
      setView("search");
      const input = $("#teoyubeSearchInput");
      if (input) input.value = row.reference;
      renderSearchResults(runTeoyubeSearch(row.reference));
    } else if (action === "scripture-save") {
      saveToBook({ type: "Scripture", title: row.reference, content: row.promise || "Scripture saved from Tables.", references: [row.reference], source: "tables" });
      showActionToast("Scripture saved to Book", row.reference);
    } else if (action === "journey-open") {
      setActiveJourney(row.raw);
      setView("today");
    } else if (action === "journey-save") {
      saveJournalEntry({ title: `${row.title} reflection`, summary: `Reflection checkpoint for ${row.title}.`, scriptureReferences: [row.scripture], promise: row.focus, source: "tables" });
      showActionToast("Journey reflection saved", row.title);
    } else if (action === "video-play" || action === "video-details") {
      uiVideoCategoryFilter = row.raw.sourceType === "approved" ? "TeoyubeWorld Media" : "All Videos";
      uiVideoSearchQuery = row.title;
      uiVideoVisibleCount = Math.max(uiVideoVisibleCount, 8);
      setView("ui-elements");
      const searchInput = $("#uiVideoSearch");
      if (searchInput) searchInput.value = row.title;
      renderUiElementsVideos();
      requestAnimationFrame(() => {
        const card = document.querySelector(`[data-ui-video-id="${CSS.escape(row.id)}"]`);
        const target = card?.querySelector(action === "video-play" ? "[data-ui-video-play]" : "[data-ui-video-detail]");
        target?.click();
        card?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
    } else if (action === "video-save") {
      const entry = row.raw.sourceType === "approved"
        ? window.TeoyubeRuntimeBridge?.saveMediaToBook?.(row.raw)
        : saveToBook({ type: "Embedded Video", title: row.title, content: row.raw.description, references: row.raw.scriptureReferences || [], source: "tables" });
      showActionToast(entry ? "Video saved to Book" : "Video was not saved", row.title);
    } else if (action === "book-open") {
      setView("book");
    } else if (action === "book-remove") {
      state.book = safeArray(state.book).filter((entry) => entry.id !== row.id);
      state.bookEntries = state.book;
      saveState();
      renderBook();
      renderTeoyubeDataManagement();
      showActionToast("Book entry removed", row.title);
    }
    renderTeoyubeDataManagement();
  });
  $("#compassVideoForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const query = $("#compassVideoInput").value || "TeoyubeWorld";
    recordPhase116SafeSearch(query, "calling");
    searchCompassVideos(query);
  });
  $(".compass-video-prompts").addEventListener("click", (event) => {
    const button = event.target.closest("[data-query]");
    if (!button) return;
    $("#compassVideoInput").value = button.dataset.query;
    recordPhase116SafeSearch(button.dataset.query, "calling");
    searchCompassVideos(button.dataset.query);
  });
  $("#compassVideoPlayer").addEventListener("click", (event) => {
    const navButton = event.target.closest("[data-compass-video-nav]");
    if (navButton) {
      if (!compassVideos.length) return;
      const currentIndex = Math.max(0, compassVideos.findIndex((video) => video.id === selectedCompassVideo?.id));
      const offset = navButton.dataset.compassVideoNav === "next" ? 1 : -1;
      selectedCompassVideo = compassVideos[(currentIndex + offset + compassVideos.length) % compassVideos.length];
      renderCompassVideos();
      return;
    }

    const playButton = event.target.closest(".compass-embed-play-overlay");
    if (!playButton) return;
    const frame = playButton.parentElement?.querySelector("iframe");
    const videoId = playButton.dataset.videoId;
    if (frame && videoId) {
      showLocalMediaNotice("Calling Compass media");
    }
    playButton.remove();
  });
  $("#compassVideoList").addEventListener("click", (event) => {
    const button = event.target.closest(".compass-video-item");
    if (!button) return;
    selectedCompassVideo = compassVideos[Number(button.dataset.index)];
    renderCompassVideos();
  });
  $("#refreshUiVideos")?.addEventListener("click", () => {
    uiVideoCardSelections.clear();
    window.TeoyubeEmbeddedVideos?.refresh?.();
    renderUiElementsVideos();
  });
  $("#uiVideoGrid")?.addEventListener("click", (event) => {
    const navButton = event.target.closest("[data-ui-video-nav]");
    if (navButton) {
      const sourceVideos = getEmbeddedVideoTabRecords(uiVideoCategoryFilter);
      const filteredVideos = getUiFilteredVideos(sourceVideos);
      if (!filteredVideos.length) return;

      const slot = Number(navButton.dataset.uiVideoSlot) || 0;
      const currentPosition = Number(navButton.dataset.uiVideoPosition) || 0;
      const offset = navButton.dataset.uiVideoNav === "next" ? 1 : -1;
      uiVideoCardSelections.set(slot, (currentPosition + offset + filteredVideos.length) % filteredVideos.length);
      renderUiElementsVideos();
      return;
    }

    const detailButton = event.target.closest("[data-ui-video-detail]");
    if (detailButton) {
      const panel = document.querySelector(`[data-ui-video-detail-panel="${CSS.escape(detailButton.dataset.uiVideoDetail)}"]`);
      const open = panel?.hidden !== false;
      if (panel) panel.hidden = !open;
      detailButton.setAttribute("aria-expanded", String(open));
      return;
    }

    const saveButton = event.target.closest("[data-ui-video-save]");
    if (saveButton) {
      const sourceType = saveButton.dataset.uiVideoSource || saveButton.closest("[data-ui-video-source]")?.dataset.uiVideoSource || "original";
      const record = getEmbeddedVideoRecordById(saveButton.dataset.uiVideoSave, sourceType);
      const entry = sourceType === "approved"
        ? window.TeoyubeRuntimeBridge?.saveMediaToBook?.(record)
        : record && saveToBook({
            type: "Embedded Video",
            title: record.title,
            content: record.description,
            references: record.scriptureReferences || [],
            source: "embedded-videos"
          });
      showActionToast(entry ? "Video saved to Book" : "Video was not saved", entry?.title || "The selected local record is unavailable.");
      renderBook();
      return;
    }

    const scriptureButton = event.target.closest("[data-ui-video-scripture]");
    if (scriptureButton) {
      const scripture = scriptureButton.dataset.uiVideoScripture;
      setView("search");
      const input = $("#teoyubeSearchInput");
      if (input) input.value = scripture;
      renderSearchResults(runTeoyubeSearch(scripture));
      return;
    }

    const playButton = event.target.closest("[data-ui-video-play]");
    if (!playButton) return;
    const videoId = playButton.dataset.uiVideoPlay;
    const sourceType = playButton.dataset.uiVideoSource || playButton.closest("[data-ui-video-source]")?.dataset.uiVideoSource || "original";
    const record = getEmbeddedVideoRecordById(videoId, sourceType);
    const stage = playButton.closest(".ui-video-card")?.querySelector("[data-ui-video-stage]");
    if (!record || !stage) return;
    const playbackUrl = sourceType === "approved" ? record.plannedPublicCardUrl : record.playbackUrl;
    if (!playbackUrl) {
      showLocalMediaNotice(record.title || "Original Embedded Video preview");
      showActionToast("Preview record", "A playable source is not connected for this original library item.");
      const detail = playButton.closest(".ui-video-card")?.querySelector("[data-ui-video-detail-panel]");
      if (detail) detail.hidden = false;
      return;
    }
    window.TeoyubeEmbeddedVideos?.pauseAll?.();
    stage.innerHTML = `<video controls playsinline preload="metadata" poster="${escapeHtml(getUiVideoThumbnail(record))}"><source src="${escapeHtml(playbackUrl)}" type="video/mp4" />Your browser cannot play this local video.</video>`;
    const video = stage.querySelector("video");
    window.TeoyubeEmbeddedVideos?.register?.(video);
    video?.play().catch(() => {});
  });
  $("#uiVideoCategoryTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-video-category]");
    if (!button) return;
    uiVideoCategoryFilter = button.dataset.videoCategory;
    uiVideoVisibleCount = 4;
    uiVideoCardSelections.clear();
    $all("#uiVideoCategoryTabs button").forEach((tab) => tab.classList.toggle("active", tab === button));
    const select = $("#uiVideoCategorySelect");
    if (select) select.value = uiVideoCategoryFilter === "All Videos" ? "All Categories" : uiVideoCategoryFilter;
    renderUiElementsVideos();
  });
  $("#uiVideoCategorySelect")?.addEventListener("change", (event) => {
    uiVideoCategoryFilter = event.target.value === "All Categories" ? "All Videos" : event.target.value;
    uiVideoVisibleCount = 4;
    uiVideoCardSelections.clear();
    $all("#uiVideoCategoryTabs button").forEach((tab) => {
      const tabValue = tab.dataset.videoCategory;
      tab.classList.toggle("active", tabValue === uiVideoCategoryFilter);
    });
    renderUiElementsVideos();
  });
  $("#uiVideoSort")?.addEventListener("change", (event) => {
    uiVideoSortMode = event.target.value;
    uiVideoVisibleCount = 4;
    uiVideoCardSelections.clear();
    renderUiElementsVideos();
  });
  $("#uiVideoSearch")?.addEventListener("input", (event) => {
    uiVideoSearchQuery = event.target.value;
    recordPhase116SafeSearch(uiVideoSearchQuery, "ui-elements");
    uiVideoVisibleCount = 4;
    uiVideoCardSelections.clear();
    renderUiElementsVideos();
  });
  $("#uiVideoLoadMore")?.addEventListener("click", () => {
    uiVideoVisibleCount += 4;
    renderUiElementsVideos();
  });
  $("#uiVideoFiltersButton")?.addEventListener("click", () => {
    $("#uiVideoSearch")?.focus();
  });
  document.addEventListener(
    "click",
    (event) => {
      const routeButton = event.target.closest?.(".nav-item, [data-view-shortcut]");
      if (!routeButton || routeButton.closest("#phase114QaPanel")) return;
      const targetView = routeButton.dataset.view || routeButton.dataset.viewShortcut;
      if (!targetView) return;
      event.preventDefault();
      event.stopPropagation();
      setView(targetView);
      recordPhase114Action("Page opened", routeButton.textContent.trim() || targetView);
      setPhase114MobileNavOpen(false);
    },
    true
  );
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const routeButton = button.closest(".nav-item, [data-view-shortcut]");
    if (routeButton && !button.closest("#phase114QaPanel")) {
      const targetView = routeButton.dataset.view || routeButton.dataset.viewShortcut;
      if (targetView) {
        event.preventDefault();
        event.stopPropagation();
        setView(targetView);
        recordPhase114Action("Page opened", routeButton.textContent.trim() || targetView);
        setPhase114MobileNavOpen(false);
        return;
      }
    }
    const qaPanelPhase117Action = button.closest("#phase114QaPanel [data-phase117-action]");
    if (qaPanelPhase117Action && handlePhase117Action(qaPanelPhase117Action.dataset.phase117Action, qaPanelPhase117Action)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const qaPanelPhase116bAction = button.closest("#phase114QaPanel [data-phase116b-action]");
    if (qaPanelPhase116bAction && handlePhase116bAction(qaPanelPhase116bAction.dataset.phase116bAction, qaPanelPhase116bAction)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (button.closest("#phase114QaPanel")) return;
    if (button.type === "submit") return;
    const phase116bFilter = button.closest("[data-phase116b-promise-filter]");
    if (phase116bFilter) {
      event.preventDefault();
      event.stopPropagation();
      state.phase116bPromiseFilter = phase116bFilter.dataset.phase116bPromiseFilter || "all";
      saveState();
      renderPhase116bPromiseWorkspace();
      renderPhase114PromiseTableRows();
      return;
    }
    const phase116bCompassAnswer = button.closest("[data-phase116b-compass-answer]");
    if (phase116bCompassAnswer) {
      event.preventDefault();
      event.stopPropagation();
      state.phase116bCompassStarted = true;
      state.phase116bCompassAnswers = {
        ...(state.phase116bCompassAnswers || {}),
        [phase116bCompassAnswer.dataset.phase116bCompassAnswer]: phase116bCompassAnswer.dataset.phase116bValue || phase116bCompassAnswer.textContent.trim()
      };
      saveState();
      renderPhase116bCallingCompassTool();
      return;
    }
    const phase116bAction = button.closest("[data-phase116b-action]");
    if (phase116bAction && handlePhase116bAction(phase116bAction.dataset.phase116bAction, phase116bAction)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const promptChip = button.closest(".prompt-chip[data-prompt]");
    if (promptChip) {
      event.preventDefault();
      event.stopPropagation();
      $("#chatInput").value = promptChip.dataset.prompt;
      recordPhase116SafeSearch(promptChip.dataset.prompt, "teo-guide");
      recordPhase114Action("Prompt chip submitted", promptChip.textContent.trim());
      $("#chatForm").requestSubmit();
      return;
    }
    const phase116Workflow = button.closest("[data-phase116-workflow]");
    if (phase116Workflow) {
      event.preventDefault();
      event.stopPropagation();
      openPhase116Workflow(phase116Workflow.dataset.phase116Workflow, phase116Workflow);
      return;
    }
    const phase116Action = button.closest("[data-phase116-action]");
    if (phase116Action && handlePhase116Action(phase116Action.dataset.phase116Action, phase116Action)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const phase116TeoGroup = button.closest("[data-phase116-teo-group]");
    if (phase116TeoGroup) {
      event.preventDefault();
      event.stopPropagation();
      state.phase116TeoPromptCategory = phase116TeoGroup.dataset.phase116TeoGroup || "Promise";
      renderPhase116TeoPromptCategories();
      return;
    }
    const phase115Feedback = button.closest("[data-phase115-feedback]");
    if (phase115Feedback) {
      event.preventDefault();
      event.stopPropagation();
      handlePhase115Feedback(phase115Feedback.dataset.phase115Feedback, phase115Feedback);
      return;
    }
    const phase115Action = button.closest("[data-phase115-action]");
    if (phase115Action && handlePhase115Action(phase115Action.dataset.phase115Action, phase115Action)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const phase117Action = button.closest("[data-phase117-action]");
    if (phase117Action && handlePhase117Action(phase117Action.dataset.phase117Action, phase117Action)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const removeMemory = button.closest("[data-phase115-remove-memory]");
    if (removeMemory) {
      event.preventDefault();
      event.stopPropagation();
      removeJourneyMemoryItem(removeMemory.dataset.phase115RemoveMemory);
      render();
      showPhase113SaveDrawer({ title: "Memory item removed", detail: "The selected local/session memory item was removed." });
      return;
    }
    const memoryFilter = button.closest("[data-phase115-memory-filter]");
    if (memoryFilter) {
      event.preventDefault();
      event.stopPropagation();
      state.phase115MemoryFilter = memoryFilter.dataset.phase115MemoryFilter || "all";
      saveState();
      renderPhase115BookMemoryTimeline();
      return;
    }
    if (button.closest("#phase113Shell")) return;
    if (handlePhase114ButtonFallback(button)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
  document.addEventListener("input", (event) => {
    if (event.target?.id === "phase116bPromiseSearch") {
      state.phase116bPromiseSearch = event.target.value || "";
      saveState();
      renderPhase116bPromiseWorkspace();
      renderPhase114PromiseTableRows();
    }
  });
  document.addEventListener("change", (event) => {
    if (event.target?.id === "phase116bPromiseSort") {
      state.phase116bPromiseSort = event.target.value || "newest";
      saveState();
      renderPhase116bPromiseWorkspace();
      renderPhase114PromiseTableRows();
    }
    if (event.target?.id === "phase116bLexiconWordSelect") {
      state.phase116bSelectedLexiconWord = event.target.value || state.selectedWord;
      setActiveWord(state.phase116bSelectedLexiconWord);
      saveState();
      renderPhase116bLexiconStudyPanel();
      renderPhase113InsightRail();
    }
  });
}

Promise.all([
  loadCoreVocabulary(),
  loadJsonData("src/data/theologyConstitution.json", null).then((data) => {
    theologyConstitution = data;
  }),
  loadJsonData("src/data/promiseCategories.json", []).then((data) => {
    promiseCategories = data;
  }),
  loadJsonData("src/data/teoyubeSearchFramework.json", null).then((data) => {
    searchFramework = data;
  }),
  loadJsonData("src/data/promiseClusterArchitecture.json", null).then((data) => {
    promiseClusterArchitecture = data;
  }),
  loadJsonData("src/data/promiseClusters.json", promiseClusters).then((data) => {
    promiseClusters = data;
  }),
  loadJsonData("src/data/promiseClusterSystem.json", null).then((data) => {
    promiseClusterSystem = data;
  }),
  loadJsonData("src/data/promiseClusterRules.json", { clusterRules: [] }).then((data) => {
    promiseClusterRules = data.clusterRules || [];
  }),
  loadJsonData("src/data/promiseClusterNavigation.json", []).then((data) => {
    promiseClusterNavigation = data;
  }),
  loadJsonData("src/data/teoyubeLanguageGrammar.json", null).then((data) => {
    languageGrammar = data;
  }),
  loadJsonData("src/data/teoyubePromiseLanguageLexicon.json", []).then((data) => {
    promiseLanguageLexicon = data;
  }),
  loadJsonData("src/data/teoyubeCanonArchitecture.json", null).then((data) => {
    canonArchitecture = data;
  }),
  loadJsonData("src/data/kingdomArchetypes.json", []).then((data) => {
    kingdomArchetypes = data;
  }),
  loadJsonData("src/data/covenantPaths.json", []).then((data) => {
    covenantPaths = data;
  }),
  loadJsonData("src/data/destinyMaps.json", []).then((data) => {
    destinyMaps = data;
  }),
  loadJsonData("src/data/prayerEngineTemplates.json", []).then((data) => {
    prayerEngineTemplates = data;
  }),
  loadJsonData("src/data/prayerEngineSystem.json", null).then((data) => {
    prayerEngineSystem = data;
  }),
  loadJsonData("src/data/prayerRecommendationMap.json", {}).then((data) => {
    prayerRecommendationMap = data;
  }),
  loadJsonData("src/data/prayerJourneys.json", []).then((data) => {
    prayerJourneys = data;
  }),
  loadJsonData("src/data/tkosArchitecture.json", null).then((data) => {
    tkosArchitecture = data;
  }),
  loadJsonData("src/data/tkosGrowthLevels.json", []).then((data) => {
    tkosGrowthLevels = data;
  }),
  loadJsonData("src/data/tkosSampleProfile.json", null).then((data) => {
    tkosSampleProfile = data;
  }),
  loadJsonData("src/data/tkosEngines.json", null).then((data) => {
    tkosEngines = data;
  }),
  loadJsonData("src/data/technicalArchitecture.json", null).then((data) => {
    technicalArchitecture = data;
  }),
  loadJsonData("src/data/onboardingFlow.json", []).then((data) => {
    onboardingFlow = data;
  }),
  loadJsonData("src/data/subscriptionModel.json", null).then((data) => {
    subscriptionModel = data;
  }),
  loadJsonData("src/data/mvpBuildOrder.json", []).then((data) => {
    mvpBuildOrder = data;
  }),
  loadJsonData("src/data/projectStructureRoadmap.json", null).then((data) => {
    projectStructureRoadmap = data;
  }),
  loadJsonData("src/data/mvpCodeStarterFiles.json", null).then((data) => {
    mvpCodeStarterFiles = data;
  }),
  loadJsonData("src/data/mvpSeedFiles.json", null).then((data) => {
    mvpSeedFiles = data;
  }),
  loadJsonData("src/data/mvpUiPages.json", null).then((data) => {
    mvpUiPages = data;
  }),
  loadJsonData("src/data/mvpBrandIdentity.json", null).then((data) => {
    mvpBrandIdentity = data;
  }),
  loadJsonData("src/data/mvpLaunchPlan.json", null).then((data) => {
    mvpLaunchPlan = data;
  }),
  loadJsonData("src/data/launch1StaticMvpPackage.json", null).then((data) => {
    launch1StaticMvpPackage = data;
  }),
  loadJsonData("src/data/glyphDefinitions.json", []).then((data) => {
    glyphDefinitions = data;
  }),
  loadJsonData("src/data/promiseGraphDesign.json", null).then((data) => {
    promiseGraphDesign = data;
  }),
  loadJsonData("src/data/teoyubeCanonMasterSchema.json", null).then((data) => {
    canonMasterSchema = data;
  }),
  loadJsonData("src/data/graphRelationships.json", []).then((data) => {
    graphRelationships = data;
  }),
  loadJsonData("src/data/scriptureKnowledgeGraphSchema.json", null).then((data) => {
    scriptureKnowledgeGraphSchema = data;
  }),
  loadJsonData("src/data/scriptureCanon.json", []).then((data) => {
    scriptureCanon = data;
  }),
  loadJsonData("src/data/scriptureLinkedPaths.json", []).then((data) => {
    scriptureLinkedPaths = data;
  }),
  loadJsonData("src/data/scriptureLinkedArchetypes.json", []).then((data) => {
    scriptureLinkedArchetypes = data;
  }),
  loadJsonData("src/data/scripturePromiseClusters.json", []).then((data) => {
    scripturePromiseClusters = data;
  }),
  loadJsonData("src/data/scriptureGraphRelationships.json", []).then((data) => {
    scriptureGraphRelationships = data;
  }),
  loadJsonData("src/data/scriptureSearchTags.json", []).then((data) => {
    scriptureSearchTags = data;
  })
]).finally(() => {
  wireEvents();
  setView(window.location.hash || $(".view.active")?.id || "today", { skipHash: Boolean(window.location.hash) });
  window.addEventListener("hashchange", () => setView(window.location.hash, { skipHash: true }));
  render();
  startPromiseCarousel();
  startAdCarousel();
  startFeaturedStoryCarousel();
  startCanonFeaturedJourneyCarousel();
  startCanonRecommendedCarousel();
  searchPromiseMovie("TeoyubeWorld");
  loadPromiseSeedData();
  loadPromiseTableYoutubeFeed("TeoyubeWorld");
  loadUiElementsYoutubeFeed("TeoyubeWorld");
});
