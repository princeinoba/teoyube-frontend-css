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
})();
