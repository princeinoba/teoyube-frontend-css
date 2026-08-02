import {
  createTeoyubeWorldYouTubeEmbedUrl,
  isVerifiedTeoyubeWorldVideo,
  validateTeoyubeWorldYouTubeFeed
} from "../../shared/media/teoyubeworld-youtube-contract.js";

const FEED_PATH = "/src/features/promises/promise-table-youtube-feed.json";
const SOURCE_NOTICE = "Official TeoyubeWorld video. YouTube playback begins only after you press Play.";
const NETWORK_NOTICE = "YouTube media connects only after you press Play; Teoyube does not use that connection for AI, analytics, uploads, or persistence.";

const playable = isVerifiedTeoyubeWorldVideo;

export function createPromiseTableYouTubeEmbedUrl(video) {
  return createTeoyubeWorldYouTubeEmbedUrl(video);
}

export function validatePromiseTableYouTubeFeed(feed) {
  return validateTeoyubeWorldYouTubeFeed(feed);
}

function setText(target, value) {
  if (target && target.textContent !== value) target.textContent = value;
}

function setAttribute(target, name, value) {
  if (target && target.getAttribute(name) !== value) target.setAttribute(name, value);
}

function setDisabled(button, disabled) {
  if (!button) return;
  button.disabled = disabled;
  setAttribute(button, "aria-disabled", String(disabled));
}

function setStatus(message) {
  const status = document.querySelector("#phase117OfflineStatus");
  if (!status) return;
  status.setAttribute("aria-live", "polite");
  setText(status.querySelector("small"), message);
}

export function createPromiseTableYouTubePlayback(root, feed) {
  if (!(root instanceof HTMLElement) || !validatePromiseTableYouTubeFeed(feed)) {
    throw new Error("Promise Table YouTube playback requires a valid root and verified feed.");
  }

  const videos = [...feed.items].sort((left, right) => left.order - right.order);
  const videoById = new Map(videos.map((video) => [video.id, video]));
  const normalizeCanonicalTitle = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  const videoByCanonicalTitle = new Map(
    videos.map((video) => [normalizeCanonicalTitle(video.canonicalMatchTitle), video])
  );
  const playableVideos = videos.filter(playable);
  let selectedVideoId = playableVideos[0]?.id || videos[0]?.id || null;
  let activeVideoId = null;
  let playbackState = "idle";
  let destroyed = false;
  let queued = false;
  let announcedStatus = null;
  let preservedPanel = null;
  let previousPanelMinimum = "";
  let previousPanelMinimumPriority = "";
  const statusObserver = new MutationObserver(() => {
    const statusText = document.querySelector("#phase117OfflineStatus small");
    if (announcedStatus && statusText?.textContent !== announcedStatus) setStatus(announcedStatus);
  });
  statusObserver.observe(document.body, { childList: true, characterData: true, subtree: true });

  function announce(message) {
    announcedStatus = message;
    setStatus(message);
  }

  const item = (id) => videoById.get(id || "") || null;
  const selected = () => item(selectedVideoId) || playableVideos[0] || videos[0] || null;

  function preserveInitialPanelHeight() {
    if (preservedPanel) return;
    const panel = root.querySelector("#promiseTableVideoPanel");
    if (!panel) return;
    const currentHeight = panel.getBoundingClientRect().height;
    if (currentHeight <= 0) return;
    preservedPanel = panel;
    previousPanelMinimum = panel.style.getPropertyValue("min-block-size");
    previousPanelMinimumPriority = panel.style.getPropertyPriority("min-block-size");
    panel.style.setProperty("min-block-size", `${currentHeight}px`, "important");
  }

  function unloadFrame() {
    const frame = root.querySelector("#promiseTableVideoPanel .promise-table-video-frame iframe");
    if (!frame) return;
    frame.removeAttribute("src");
    delete frame.dataset.youtubeVideoId;
  }

  function syncCards() {
    root.querySelectorAll("#promiseTableSearchResults .promise-search-item").forEach((card) => {
      const button = card.querySelector(".promise-watch-video");
      if (!button) return;
      let video = item(button.dataset.promiseTableMediaId);
      if (!video) {
        const matchLabel = [...card.querySelectorAll("small")]
          .map((label) => label.textContent?.trim() || "")
          .find((label) => label.startsWith("TeoyubeWorld match:"));
        const canonicalTitle = matchLabel?.slice("TeoyubeWorld match:".length).trim();
        video = videoByCanonicalTitle.get(normalizeCanonicalTitle(canonicalTitle));
        if (video) button.dataset.promiseTableMediaId = video.id;
      }
      if (!video) return;
      const available = playable(video);
      card.dataset.promiseTableMediaId = video.id;
      card.dataset.playbackStatus = video.playbackStatus;
      card.toggleAttribute("data-promise-table-active", selectedVideoId === video.id);
      setDisabled(button, !available);
      setAttribute(
        button,
        "aria-label",
        available
          ? `Play ${video.canonicalMatchTitle} in Featured Video`
          : `Playback unavailable for ${video.canonicalMatchTitle}: ${video.playbackUnavailableReason || "No verified official video is available."}`
      );
      setAttribute(button, "title", available ? `Play ${video.canonicalMatchTitle}` : video.playbackUnavailableReason || "Playback unavailable");
    });
  }

  function syncPanel() {
    const video = selected();
    const panel = root.querySelector("#promiseTableVideoPanel");
    if (!video || !panel) return;


    selectedVideoId = video.id;
    const playing = activeVideoId === video.id && playable(video);
    panel.dataset.activeVideoId = video.id;
    panel.dataset.activeVideoIndex = String(videos.findIndex((candidate) => candidate.id === video.id));
    panel.dataset.playbackState = playing ? playbackState : "idle";

    setText(panel.querySelector(".promise-table-featured-copy h3"), video.canonicalMatchTitle);
    setText(panel.querySelector(".promise-table-featured-description"), video.description);
    const metadata = panel.querySelectorAll(".promise-table-featured-meta span");
    setText(metadata[0], feed.officialChannel.name);
    setText(metadata[1], video.duration);
    setText(metadata[2], video.viewCount);
    setText(metadata[3], video.publicationLabel);

    const watch = panel.querySelector(".promise-table-watch-now");
    const overlay = panel.querySelector(".promise-table-embed-play-overlay");
    const artwork = panel.querySelector(".promise-table-video-artwork");
    const frame = panel.querySelector(".promise-table-video-frame iframe");
    const available = playable(video);

    if (watch) {
      watch.dataset.promiseTablePlay = video.id;
      watch.dataset.promiseTableMediaId = video.id;
      setDisabled(watch, !available);
      setAttribute(watch, "aria-label", available ? `Play ${video.canonicalMatchTitle}` : `Playback unavailable for ${video.canonicalMatchTitle}`);
    }
    if (overlay) {
      overlay.dataset.videoId = video.id;
      overlay.dataset.promiseTableMediaId = video.id;
      overlay.hidden = playing;
      overlay.style.display = playing ? "none" : "";
      setDisabled(overlay, !available);
      setAttribute(overlay, "aria-label", available ? `Play ${video.canonicalMatchTitle}` : `Playback unavailable for ${video.canonicalMatchTitle}`);
    }
    if (artwork) {
      artwork.hidden = playing;
      artwork.style.display = playing ? "none" : "";
      artwork.style.backgroundImage = `linear-gradient(90deg, rgba(0, 45, 34, 0.08), rgba(0, 31, 24, 0.28)), url('/${String(video.poster).replace(/^\/+/, "")}')`;
    }

    panel.querySelectorAll("[data-promise-table-video-index]").forEach((dot) => {
      let dotVideo = item(dot.dataset.promiseTableMediaId);
      if (!dotVideo) {
        const canonicalTitle = dot.getAttribute("aria-label")?.replace(/^Show\s+/, "");
        dotVideo = videoByCanonicalTitle.get(normalizeCanonicalTitle(canonicalTitle));
        if (dotVideo) dot.dataset.promiseTableMediaId = dotVideo.id;
      }
      const current = dotVideo?.id === video.id;
      dot.classList.toggle("active", current);
      setAttribute(dot, "aria-current", String(current));
      if (dotVideo) setAttribute(dot, "aria-label", `Show ${dotVideo.canonicalMatchTitle}`);
    });

    if (!frame) return;
    setAttribute(frame, "title", playing ? `TeoyubeWorld video: ${video.canonicalMatchTitle}` : `${video.canonicalMatchTitle} media preview`);
    setAttribute(frame, "allow", "autoplay; encrypted-media; picture-in-picture; web-share");
    setAttribute(frame, "referrerpolicy", "strict-origin-when-cross-origin");
    frame.setAttribute("allowfullscreen", "");

    if (!playing) {
      frame.removeAttribute("src");
      delete frame.dataset.youtubeVideoId;
      if ((document.body.dataset.view === "table" || !root.hidden) && playbackState !== "error") announce(NETWORK_NOTICE);
      return;
    }

    const source = createPromiseTableYouTubeEmbedUrl(video);
    if (!source) return;
    frame.removeAttribute("srcdoc");
    if (frame.getAttribute("src") !== source || frame.dataset.youtubeVideoId !== video.youtubeVideoId) {
      frame.dataset.youtubeVideoId = video.youtubeVideoId;
      announce(`Loading "${video.canonicalMatchTitle}". ${SOURCE_NOTICE}`);
      frame.addEventListener("load", () => {
        if (destroyed || activeVideoId !== video.id) return;
        playbackState = "playing";
        panel.dataset.playbackState = "playing";
        announce(`Playing "${video.canonicalMatchTitle}". ${SOURCE_NOTICE}`);
      }, { once: true });
      frame.addEventListener("error", () => {
        if (destroyed || activeVideoId !== video.id) return;
        activeVideoId = null;
        playbackState = "error";
        delete frame.dataset.youtubeVideoId;
        panel.dataset.playbackState = "error";
        announce(`The official TeoyubeWorld video could not be loaded. "${video.canonicalMatchTitle}" remains selected; use Watch Now to retry or choose Next Video.`);
      }, { once: true });
      frame.setAttribute("src", source);
    }
  }

  function sync() {
    if (destroyed) return;
    syncCards();
    syncPanel();
    if ((document.body.dataset.view === "table" || !root.hidden) && !activeVideoId && playbackState !== "error") announce(NETWORK_NOTICE);
  }

  function queueSync() {
    if (queued || destroyed) return;
    queued = true;
    window.requestAnimationFrame(() => {
      queued = false;
      sync();
    });
  }

  function selectVideo(video, play) {
    if (!video || !playable(video)) {
      if (video) announce(video.playbackUnavailableReason || `No verified official video is available for "${video.canonicalMatchTitle}".`);
      return;
    }
    preserveInitialPanelHeight();
    const alreadyPlaying = activeVideoId === video.id && playbackState === "playing";
    selectedVideoId = video.id;
    activeVideoId = play ? video.id : null;
    playbackState = play ? (alreadyPlaying ? "playing" : "loading") : "idle";
    sync();
  }

  function adjacent(direction) {
    if (!playableVideos.length) return null;
    const current = Math.max(0, playableVideos.findIndex((video) => video.id === selectedVideoId));
    return playableVideos[(current + direction + playableVideos.length) % playableVideos.length];
  }

  function preserveScrollPosition(action) {
    const left = window.scrollX;
    const top = window.scrollY;
    action();
    const restore = () => {
      if (window.scrollX !== left || window.scrollY !== top) window.scrollTo(left, top);
    };
    restore();
    window.requestAnimationFrame(() => {
      restore();
      window.requestAnimationFrame(restore);
    });
  }

  function mediaControl(target) {
    return target.closest(
      "#promiseTableSearchResults .promise-watch-video[data-promise-table-media-id], #promiseTableVideoPanel .promise-table-watch-now, #promiseTableVideoPanel .promise-table-embed-play-overlay, #promiseTableVideoPanel [data-promise-table-video-nav], #promiseTableVideoPanel [data-promise-table-video-index]"
    );
  }

  function onClick(event) {
    const target = event.target instanceof Element ? event.target : null;
    const control = target ? mediaControl(target) : null;
    if (!control) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    if (control.matches("[data-promise-table-video-nav]")) {
      const direction = control.dataset.promiseTableVideoNav === "previous" ? -1 : 1;
      preserveScrollPosition(() => selectVideo(adjacent(direction), true));
      return;
    }
    if (control.matches("[data-promise-table-video-index]")) {
      const video = item(control.dataset.promiseTableMediaId);
      preserveScrollPosition(() => selectVideo(video, Boolean(activeVideoId)));
      return;
    }

    const videoId = control.dataset.promiseTableMediaId || control.dataset.promiseTablePlay || control.dataset.videoId || selectedVideoId;
    preserveScrollPosition(() => selectVideo(item(videoId), true));
  }

  function onViewChange(event) {
    if (event.detail?.viewId === "table") {
      sync();
      return;
    }
    if (activeVideoId) unloadFrame();
    activeVideoId = null;
    playbackState = "idle";
  }

  const observer = new MutationObserver(queueSync);
  observer.observe(root, { childList: true, subtree: true });
  root.addEventListener("click", onClick, true);
  document.addEventListener("teoyube:view-change", onViewChange);
  sync();
  document.body.dataset.promiseTableTeoyubeWorldPlayback = "ready";

  return Object.freeze({
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer.disconnect();
      statusObserver.disconnect();
      root.removeEventListener("click", onClick, true);
      document.removeEventListener("teoyube:view-change", onViewChange);
      unloadFrame();
      if (preservedPanel && previousPanelMinimum) {
        preservedPanel.style.setProperty("min-block-size", previousPanelMinimum, previousPanelMinimumPriority);
      } else if (preservedPanel) {
        preservedPanel.style.removeProperty("min-block-size");
      }
      preservedPanel = null;
      activeVideoId = null;
      playbackState = "idle";
    },
    getActiveVideoId() {
      return activeVideoId;
    },
    getSelectedVideoId() {
      return selectedVideoId;
    }
  });
}

let staticPlayback = null;

export async function initializeStaticPromiseTableYouTubePlayback() {
  if (staticPlayback) return staticPlayback;
  const root = document.querySelector("#table");
  if (!root) return null;
  const response = await fetch(FEED_PATH, { cache: "no-store", credentials: "same-origin" });
  if (!response.ok) throw new Error(`Promise Table video mapping returned ${response.status}.`);
  const feed = await response.json();
  staticPlayback = createPromiseTableYouTubePlayback(root, feed);
  document.body.dataset.promiseTableTeoyubeWorldPlayback = "ready";
  return staticPlayback;
}
