const FEED_PATH = "/src/features/today/today-youtube-feed.json";
const OFFICIAL_CHANNEL_URL = "https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w";
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const SOURCE_NOTICE = "Official TeoyubeWorld video. YouTube playback begins only after you press Play.";
const NETWORK_NOTICE = "YouTube media connects only after you press Play; Teoyube does not use that connection for AI, analytics, uploads, or persistence.";
const UNAVAILABLE_NOTICE = "No exact official TeoyubeWorld channel video is available for this feed item.";

let feed = [];
let activeStoryId = null;
let observer = null;
let listeningFrame = null;
let initialized = false;

function playable(item) {
  return Boolean(
    item &&
    item.playbackStatus === "verified" &&
    item.youtubeVideoId &&
    VIDEO_ID_PATTERN.test(item.youtubeVideoId)
  );
}

function embedUrl(item) {
  if (!playable(item)) return "";
  const parameters = new URLSearchParams({ autoplay: "1", playsinline: "1", rel: "0", modestbranding: "1" });
  return `https://www.youtube-nocookie.com/embed/${item.youtubeVideoId}?${parameters.toString()}`;
}

function itemById(storyId) {
  return feed.find((item) => item.id === storyId) || null;
}

function selectedItem() {
  const row = document.querySelector("#clientsPromiseRows tr.active-video-row");
  const index = Number(row?.dataset.todayVideoIndex || 0);
  return feed[index] || feed[0] || null;
}

function setText(target, value) {
  if (target && target.textContent !== value) target.textContent = value;
}

function setAttribute(target, name, value) {
  if (target && target.getAttribute(name) !== value) target.setAttribute(name, value);
}

function setDisabled(button, disabled) {
  if (!button) return;
  if (button.disabled !== disabled) button.disabled = disabled;
  setAttribute(button, "aria-disabled", String(disabled));
}

function observe() {
  const today = document.querySelector("#today");
  if (today && observer) observer.observe(today, { childList: true, subtree: true });
}

function enhance() {
  if (!feed.length) return;
  observer?.disconnect();
  try {
    [...document.querySelectorAll("#clientsPromiseRows tr")].forEach((row, index) => {
      const item = feed[index];
      const button = row.querySelector(".today-video-select");
      if (!item || !button) return;
      const available = playable(item);
      row.dataset.todayStoryId = item.id;
      row.dataset.playbackStatus = item.playbackStatus;
      button.dataset.todayStoryId = item.id;
      setDisabled(button, !available);
      setAttribute(
        button,
        "aria-label",
        available
          ? `Play ${item.title} in TeoyubeWorld Video Highlight`
          : `Playback unavailable for ${item.title}: ${item.playbackUnavailableReason}`
      );
      setAttribute(button, "title", available ? `Play ${item.title}` : item.playbackUnavailableReason);
      setText(row.querySelector("td:last-child"), item.publishedAt);
    });

    [...document.querySelectorAll("#featuredStoryCarousel .featured-story-slide")].forEach((slide, index) => {
      const item = feed[index];
      if (!item) return;
      const metadata = slide.querySelectorAll(".featured-story-meta span, .featured-story-meta time");
      setText(metadata[0], item.category);
      setText(metadata[1], "TeoyubeWorld");
      setText(metadata[2], item.publishedAt);
      setText(slide.querySelector(".featured-story-copy h3"), item.title);
      setText(slide.querySelector(".featured-story-copy > p"), item.description);
      slide.style.setProperty("--featured-image", `url('${item.image}')`);
    });

    const status = document.querySelector("#promiseMovieStatus");
    status?.setAttribute("role", "status");
    status?.setAttribute("aria-live", "polite");
    const selected = selectedItem();
    const panel = document.querySelector("#promiseMovieResult");
    const shell = panel?.querySelector(".promise-video-thumbnail.promise-youtube-frame");
    const frame = shell?.querySelector("iframe");
    const overlay = shell?.querySelector(".promise-embed-play-overlay");
    const watch = panel?.querySelector(".watch-now-button");
    const note = panel?.querySelector(".local-media-note");
    panel?.querySelector(".promise-video-nav")?.setAttribute("role", "group");
    if (!selected || !shell || !frame || !watch || !note) return;

    const available = playable(selected);
    if (activeStoryId && activeStoryId !== selected.id) activeStoryId = null;
    const playing = available && activeStoryId === selected.id;
    shell.dataset.todayActiveStoryId = selected.id;
    shell.dataset.playbackState = playing ? "loading" : "idle";

    if (overlay) {
      overlay.dataset.todayStoryId = selected.id;
      overlay.hidden = playing;
      setDisabled(overlay, !available);
      setAttribute(
        overlay,
        "aria-label",
        available
          ? `Play ${selected.title} in TeoyubeWorld Video Highlight`
          : `Playback unavailable for ${selected.title}: ${selected.playbackUnavailableReason}`
      );
    }
    watch.dataset.todayStoryId = selected.id;
    setDisabled(watch, !available);
    setText(watch, available ? "Play Official Video" : "Source Unavailable");
    setAttribute(watch, "title", available ? `Play ${selected.title}` : selected.playbackUnavailableReason);
    setText(note, available ? SOURCE_NOTICE : UNAVAILABLE_NOTICE);
    setAttribute(frame, "title", playing ? `TeoyubeWorld video: ${selected.title}` : `${selected.title} media preview`);
    setAttribute(frame, "allow", "autoplay; encrypted-media; picture-in-picture; web-share");
    setAttribute(frame, "referrerpolicy", "strict-origin-when-cross-origin");

    if (playing) {
      const source = embedUrl(selected);
      frame.removeAttribute("srcdoc");
      if (frame.getAttribute("src") !== source) frame.setAttribute("src", source);
      frame.dataset.youtubeVideoId = selected.youtubeVideoId;
      if (listeningFrame !== frame) {
        listeningFrame = frame;
        frame.addEventListener("load", () => {
          shell.dataset.playbackState = "playing";
          setText(document.querySelector("#promiseMovieStatus"), `Playing "${selected.title}". ${SOURCE_NOTICE}`);
        }, { once: true });
        frame.addEventListener("error", () => {
          activeStoryId = null;
          shell.dataset.playbackState = "error";
          setText(document.querySelector("#promiseMovieStatus"), "The official TeoyubeWorld video could not be loaded. The feed item remains selected.");
          queueEnhancement();
        }, { once: true });
      }
    } else {
      frame.removeAttribute("src");
      delete frame.dataset.youtubeVideoId;
    }

    if (!playing) {
      const availableCount = feed.filter(playable).length;
      setText(
        document.querySelector("#promiseMovieStatus"),
        `Showing ${feed.length} TeoyubeWorld feed items for "TeoyubeWorld". ${availableCount} verified official-channel video${availableCount === 1 ? "" : "s"} available.`
      );
    }
    if (document.body.dataset.view === "today") {
      setText(document.querySelector("#phase117OfflineStatus small"), NETWORK_NOTICE);
    }
  } finally {
    observe();
  }
}

function queueEnhancement() {
  window.requestAnimationFrame(enhance);
}

function adjacent(storyId, direction) {
  const available = feed.filter(playable);
  if (!available.length) return null;
  const current = Math.max(0, available.findIndex((item) => item.id === storyId));
  return available[(current + direction + available.length) % available.length];
}

function activate(storyId) {
  const item = itemById(storyId);
  if (!playable(item)) return;
  activeStoryId = item.id;
  document.querySelector("#featuredStoryCarousel")?.dispatchEvent(new MouseEvent("mouseenter"));
  queueEnhancement();
}

function select(storyId) {
  const row = [...document.querySelectorAll("#clientsPromiseRows tr")]
    .find((candidate) => candidate.dataset.todayStoryId === storyId);
  const button = row?.querySelector(".today-video-select");
  if (button && !button.disabled) button.click();
}

function handleClick(event) {
  if (!feed.length || document.body.dataset.view !== "today") return;
  const rowButton = event.target.closest?.("#clientsPromiseRows .today-video-select");
  if (rowButton && !rowButton.disabled) {
    activate(rowButton.dataset.todayStoryId);
    return;
  }
  const mainButton = event.target.closest?.("#promiseMovieResult .promise-embed-play-overlay, #promiseMovieResult .watch-now-button");
  if (mainButton && !mainButton.disabled) {
    activate(mainButton.dataset.todayStoryId || selectedItem()?.id);
    return;
  }
  const navButton = event.target.closest?.("#promiseMovieResult [data-today-video-nav]");
  if (!navButton) return;
  const priorPanel = event.target.closest?.("#promiseMovieResult");
  const priorStoryId = priorPanel?.querySelector?.("[data-today-active-story-id]")?.dataset.todayActiveStoryId;
  const nextItem = adjacent(
    priorStoryId || activeStoryId || selectedItem()?.id,
    navButton.dataset.todayVideoNav === "previous" ? -1 : 1
  );
  if (nextItem) window.setTimeout(() => select(nextItem.id), 0);
}

function stop() {
  activeStoryId = null;
  const frame = document.querySelector("#promiseMovieResult iframe[data-youtube-video-id]");
  if (frame) {
    frame.removeAttribute("src");
    delete frame.dataset.youtubeVideoId;
  }
}

export async function initializeTodayTeoyubeWorldPlayback() {
  if (initialized) return;
  initialized = true;
  try {
    const response = await fetch(FEED_PATH, { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error(`feed mapping returned ${response.status}`);
    const payload = await response.json();
    if (
      payload?.officialChannel?.url !== OFFICIAL_CHANNEL_URL ||
      !Array.isArray(payload.items) ||
      payload.items.length !== 8
    ) throw new Error("feed mapping failed validation");
    feed = payload.items.slice().sort((left, right) => left.order - right.order);
    observer = new MutationObserver(queueEnhancement);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("teoyube:view-change", (event) => {
      if (event.detail?.viewId !== "today") stop();
      else queueEnhancement();
    });
    window.addEventListener("pagehide", stop);
    enhance();
    document.body.dataset.todayTeoyubeWorldPlayback = "ready";
  } catch (error) {
    initialized = false;
    document.body.dataset.todayTeoyubeWorldPlayback = "unavailable";
    document.body.dataset.todayTeoyubeWorldPlaybackError = String(error?.message || error).slice(0, 160);
  }
}

export const todayTeoyubeWorldPlayback = Object.freeze({ initialize: initializeTodayTeoyubeWorldPlayback, stop });
