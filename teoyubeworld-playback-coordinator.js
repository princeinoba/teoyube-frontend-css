(() => {
  "use strict";

  const players = new Map();
  const positions = new Map();
  let activePlayerId = null;
  let lastError = "";

  function safePosition(value) {
    const position = Number(value || 0);
    return Number.isFinite(position) && position >= 0 ? position : 0;
  }

  function pauseEntry(entry) {
    if (!entry?.element || entry.element.paused) return;
    entry.element.pause();
  }

  function registerMediaPlayer(player) {
    const id = String(player?.id || "");
    const element = player?.element;
    if (!id || !(element instanceof HTMLMediaElement)) throw new Error("Media players require a stable id and HTML media element.");
    unregisterMediaPlayer(id);
    const handlers = {
      play: () => requestMediaPlayback(id),
      timeupdate: () => {
        const mediaId = player.getMediaId?.();
        if (mediaId) saveMediaPlaybackPosition(mediaId, element.currentTime);
      },
      ended: () => {
        if (activePlayerId === id) activePlayerId = null;
        player.onEnded?.();
      },
      error: () => handleMediaPlaybackError(element.error || new Error("Media playback failed."), id)
    };
    Object.entries(handlers).forEach(([event, handler]) => element.addEventListener(event, handler));
    players.set(id, { ...player, id, element, handlers });
    return id;
  }

  function unregisterMediaPlayer(playerId) {
    const entry = players.get(playerId);
    if (!entry) return false;
    Object.entries(entry.handlers || {}).forEach(([event, handler]) => entry.element.removeEventListener(event, handler));
    pauseEntry(entry);
    players.delete(playerId);
    if (activePlayerId === playerId) activePlayerId = null;
    return true;
  }

  function requestMediaPlayback(playerId) {
    if (!players.has(playerId)) return false;
    pauseAllOtherMedia(playerId);
    activePlayerId = playerId;
    document.dispatchEvent(new CustomEvent("teoyube:media-playback-change", { detail: { activePlayerId } }));
    return true;
  }

  function pauseAllOtherMedia(playerId) {
    players.forEach((entry, id) => { if (id !== playerId) pauseEntry(entry); });
  }

  function pauseAllMedia() {
    players.forEach(pauseEntry);
    activePlayerId = null;
    document.dispatchEvent(new CustomEvent("teoyube:media-playback-change", { detail: { activePlayerId: null } }));
  }

  function handleMediaVisibilityChange() {
    if (document.hidden) pauseAllMedia();
  }

  function handleMediaPlaybackError(error, playerId = null) {
    lastError = String(error?.message || "Media playback failed.").slice(0, 240);
    if (playerId && players.has(playerId)) pauseEntry(players.get(playerId));
    document.dispatchEvent(new CustomEvent("teoyube:media-playback-error", { detail: { playerId, message: lastError } }));
    return { playerId, message: lastError };
  }

  function restoreMediaPlaybackPosition(mediaId) {
    return safePosition(positions.get(mediaId));
  }

  function saveMediaPlaybackPosition(mediaId, position) {
    const id = String(mediaId || "");
    if (!id) return 0;
    const safe = safePosition(position);
    positions.set(id, safe);
    document.dispatchEvent(new CustomEvent("teoyube:media-position-change", { detail: { mediaId: id, position: safe } }));
    return safe;
  }

  function getPlaybackHealth() {
    return {
      registeredPlayerCount: players.size,
      activePlayerId,
      savedPositionCount: positions.size,
      lastError
    };
  }

  document.addEventListener("visibilitychange", handleMediaVisibilityChange);
  window.addEventListener("pagehide", pauseAllMedia);

  window.TeoyubeWorldPlayback = Object.freeze({
    registerMediaPlayer,
    unregisterMediaPlayer,
    requestMediaPlayback,
    pauseAllOtherMedia,
    pauseAllMedia,
    handleMediaVisibilityChange,
    handleMediaPlaybackError,
    restoreMediaPlaybackPosition,
    saveMediaPlaybackPosition,
    getPlaybackHealth
  });
})();
