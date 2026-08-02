(function initializeEmbeddedVideos() {
  "use strict";

  const players = new Set();

  function pauseAll(except = null) {
    players.forEach((player) => {
      if (player !== except && !player.paused) player.pause();
    });
  }

  function register(player) {
    if (!player) return;
    players.add(player);
    player.addEventListener("play", () => pauseAll(player));
    player.addEventListener("ended", () => players.delete(player), { once: true });
  }

  async function refresh() {
    const runtime = window.TeoyubeWorldMedia;
    if (!runtime) return;
    try {
      await runtime.loadTeoyubeWorldRuntimeManifest();
    } finally {
      window.renderUiElementsVideos?.();
    }
  }

  window.TeoyubeEmbeddedVideos = Object.freeze({ pauseAll, register, refresh });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseAll();
  });
  window.addEventListener("pagehide", () => pauseAll());
  document.addEventListener("teoyube:view-change", (event) => {
    if (event.detail?.viewId !== "ui-elements") pauseAll();
  });
  refresh();
  import("./src/features/today/today-youtube-playback.static.js")
    .then(({ initializeTodayTeoyubeWorldPlayback }) => initializeTodayTeoyubeWorldPlayback())
    .catch((error) => {
      document.body.dataset.todayTeoyubeWorldPlayback = "unavailable";
      document.body.dataset.todayTeoyubeWorldPlaybackError = String(error?.message || error).slice(0, 160);
    });
  import("./src/features/promises/promise-table-youtube-player.js")
    .then(({ initializeStaticPromiseTableYouTubePlayback }) => initializeStaticPromiseTableYouTubePlayback())
    .catch((error) => {
      document.body.dataset.promiseTableTeoyubeWorldPlayback = "unavailable";
      document.body.dataset.promiseTableTeoyubeWorldPlaybackError = String(error?.message || error).slice(0, 160);
    });
  import("./src/features/media/tables-youtube-player.js")
    .then(({ initializeStaticTablesYouTubePlayback }) => initializeStaticTablesYouTubePlayback())
    .catch((error) => {
      document.body.dataset.tablesTeoyubeWorldPlayback = "unavailable";
      document.body.dataset.tablesTeoyubeWorldPlaybackError = String(error?.message || error).slice(0, 160);
    });
})();
