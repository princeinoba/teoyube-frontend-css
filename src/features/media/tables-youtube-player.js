import {
  createTeoyubeWorldYouTubeEmbedUrl,
  validateTeoyubeWorldYouTubeFeed
} from "../../shared/media/teoyubeworld-youtube-contract.js";

const FEED_PATH = "/src/features/promises/promise-table-youtube-feed.json";
const PLAYER_SELECTOR = ".table-preview-video-panel, .table-row-video.table-row-video-premium";
const CONTROL_SELECTOR = "[data-table-preview-video-play], [data-table-video-play], [data-table-video-nav]";

function playable(video) {
  return Boolean(video && createTeoyubeWorldYouTubeEmbedUrl(video));
}

function setAttribute(target, name, value) {
  if (target && target.getAttribute(name) !== value) target.setAttribute(name, value);
}

function setDisabled(button, disabled) {
  if (!button) return;
  button.disabled = disabled;
  setAttribute(button, "aria-disabled", String(disabled));
}

export function createTablesYouTubeEmbedUrl(video) {
  return createTeoyubeWorldYouTubeEmbedUrl(video);
}

export function validateTablesYouTubeFeed(feed) {
  return validateTeoyubeWorldYouTubeFeed(feed);
}

export function createTablesYouTubePlayback(root, feed) {
  if (!root?.querySelectorAll || !validateTablesYouTubeFeed(feed)) {
    throw new Error("Tables YouTube playback requires a Tables root and verified TeoyubeWorld feed.");
  }

  const videos = [...feed.items].sort((left, right) => left.order - right.order);
  const videoById = new Map(videos.map((video) => [video.id, video]));
  let destroyed = false;
  let queued = false;

  const videoAt = (index) =>
    videos.length
      ? videos[((Number(index) || 0) % videos.length + videos.length) % videos.length]
      : null;

  function videoForPanel(panel) {
    const id = panel?.matches(".table-preview-video-panel")
      ? panel.dataset.tableVideoPreview
      : panel?.dataset.tableVideoId || panel?.querySelector("[data-table-video-play]")?.dataset.tableVideoPlay;
    return videoById.get(id || "") || videoAt(panel?.dataset.tableVideoCurrentIndex);
  }

  function configureFrame(frame, video, presentation) {
    if (!frame || !video) return;
    const title = presentation === "compact" ? `${video.canonicalMatchTitle} preview` : video.canonicalMatchTitle;
    setAttribute(frame, "title", title);
    setAttribute(frame, "allow", "autoplay; encrypted-media; picture-in-picture; web-share");
    setAttribute(frame, "referrerpolicy", "strict-origin-when-cross-origin");
    frame.setAttribute("allowfullscreen", "");
  }

  function stopPanel(panel) {
    const frame = panel?.querySelector("iframe");
    if (frame) {
      frame.removeAttribute("src");
      frame.setAttribute("loading", "lazy");
      delete frame.dataset.youtubeVideoId;
    }
    panel?.classList.remove("playing");
    if (panel) panel.dataset.playbackState = "idle";
  }

  function playPanel(panel, video, presentation) {
    const frame = panel?.querySelector("iframe");
    const source = createTablesYouTubeEmbedUrl(video);
    if (!frame || !source) return;
    configureFrame(frame, video, presentation);
    frame.removeAttribute("srcdoc");
    frame.removeAttribute("loading");
    frame.dataset.youtubeVideoId = video.youtubeVideoId;
    panel.classList.add("playing");
    panel.dataset.playbackState = "loading";
    frame.addEventListener("load", () => {
      if (!destroyed && frame.dataset.youtubeVideoId === video.youtubeVideoId) {
        panel.dataset.playbackState = "playing";
      }
    }, { once: true });
    frame.addEventListener("error", () => {
      if (!destroyed && frame.dataset.youtubeVideoId === video.youtubeVideoId) {
        panel.dataset.playbackState = "error";
      }
    }, { once: true });
    frame.setAttribute("src", source);
    document.body.dataset.tablesTeoyubeWorldPlayback = "active";
  }

  function syncPreview(panel) {
    const video = videoForPanel(panel);
    if (!video) return;
    panel.dataset.tableVideoPreview = video.id;
    panel.dataset.tableVideoRole = "compact-preview";
    panel.dataset.playbackStatus = video.playbackStatus;
    const button = panel.querySelector("[data-table-preview-video-play]");
    if (button) {
      button.dataset.tablePreviewVideoPlay = video.id;
      setDisabled(button, !playable(video));
      setAttribute(button, "aria-label", `Play ${video.canonicalMatchTitle} in the far-left preview panel`);
    }
    configureFrame(panel.querySelector("iframe"), video, "compact");
  }

  function syncAirplay(panel) {
    const video = videoForPanel(panel);
    if (!video) return;
    const index = videos.findIndex((candidate) => candidate.id === video.id);
    panel.dataset.tableVideoId = video.id;
    panel.dataset.tableVideoRole = "airplay";
    panel.dataset.tableVideoCurrentIndex = String(Math.max(0, index));
    panel.dataset.playbackStatus = video.playbackStatus;
    const button = panel.querySelector("[data-table-video-play]");
    if (button) {
      button.dataset.tableVideoPlay = video.id;
      setDisabled(button, !playable(video));
      setAttribute(button, "aria-label", `Play ${video.canonicalMatchTitle}`);
    }
    configureFrame(panel.querySelector("iframe"), video, "airplay");
  }

  function sync() {
    if (destroyed) return;
    root.querySelectorAll(".table-preview-video-panel").forEach(syncPreview);
    root.querySelectorAll(".table-row-video.table-row-video-premium").forEach(syncAirplay);
    document.body.dataset.tablesTeoyubeWorldPlayback = "ready";
  }

  function setAirplayVideo(panel, video) {
    if (!video) return;
    stopPanel(panel);
    const index = videos.findIndex((candidate) => candidate.id === video.id);
    panel.dataset.tableVideoId = video.id;
    panel.dataset.tableVideoCurrentIndex = String(index);
    panel.style.setProperty("--table-video-thumb", `url("${String(video.poster).replaceAll('"', "%22")}")`);
    const title = panel.querySelector(".table-row-video-title");
    const duration = panel.querySelector(".table-row-video-duration");
    if (title) title.textContent = video.canonicalMatchTitle;
    if (duration) duration.textContent = video.duration;
    syncAirplay(panel);
  }

  function onClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    const control = target?.closest(CONTROL_SELECTOR);
    const preview = target?.closest(".table-preview-video-panel");
    if (!control && (!preview || preview.classList.contains("playing"))) return;
    const panel = target?.closest(PLAYER_SELECTOR);
    if (!panel || !root.contains(panel)) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    if (control?.matches("[data-table-video-nav]")) {
      const current = Number(panel.dataset.tableVideoCurrentIndex) || 0;
      setAirplayVideo(panel, videoAt(current + (control.dataset.tableVideoNav === "next" ? 1 : -1)));
      return;
    }

    const id = control?.dataset.tablePreviewVideoPlay || control?.dataset.tableVideoPlay || preview?.dataset.tableVideoPreview;
    playPanel(
      panel,
      videoById.get(id || "") || videoForPanel(panel),
      panel.matches(".table-preview-video-panel") ? "compact" : "airplay"
    );
  }

  function queueSync() {
    if (queued || destroyed) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      sync();
    });
  }

  const observer = new MutationObserver(queueSync);
  observer.observe(root, { childList: true, subtree: true });
  root.addEventListener("click", onClick, true);
  sync();

  return Object.freeze({
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer.disconnect();
      root.removeEventListener("click", onClick, true);
      root.querySelectorAll(PLAYER_SELECTOR).forEach(stopPanel);
      delete document.body.dataset.tablesTeoyubeWorldPlayback;
    }
  });
}

let staticPlayback = null;

export async function initializeStaticTablesYouTubePlayback() {
  if (staticPlayback) return staticPlayback;
  const root = document.querySelector("#teoyube-tables");
  if (!root) return null;
  const response = await fetch(FEED_PATH, { cache: "no-store", credentials: "same-origin" });
  if (!response.ok) throw new Error(`Tables video mapping returned ${response.status}.`);
  staticPlayback = createTablesYouTubePlayback(root, await response.json());
  return staticPlayback;
}
