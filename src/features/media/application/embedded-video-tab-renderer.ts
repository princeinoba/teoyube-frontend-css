import type { MediaAssetDto } from "../../../domain/media/media-contracts";

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryLabel(category: string) {
  return category.toLowerCase() === "short" ? "Short" : "Scripture";
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function renderCard(asset: MediaAssetDto, position: number, total: number) {
  const id = escapeHtml(asset.id);
  const title = escapeHtml(asset.title);
  const scripture = escapeHtml(asset.scriptureReferences[0] || "Scripture context in details");
  const poster = escapeHtml(asset.posterUrl || asset.thumbnailUrl);
  const category = escapeHtml(categoryLabel(asset.category));
  const segment = escapeHtml(asset.sequenceOrder || position + 1);
  const sequence = escapeHtml(asset.sequenceTitle || "Approved Scripture sequence");

  return `
        <article class="ui-video-card embedded-video-card" data-ui-video-source="approved" data-ui-video-id="${id}" data-ui-video-slot="${position}">
          <div class="embedded-video-poster" data-ui-video-stage="${id}">
            <img class="embedded-video-poster-backdrop" src="${poster}" alt="" aria-hidden="true" loading="lazy" />
            <img class="embedded-video-poster-image" src="${poster}" alt="${title} preview artwork" loading="lazy" />
            <span class="ui-video-badge">${category}</span>
            <button class="embedded-video-play" type="button" data-ui-video-play="${id}" data-ui-video-source="approved" aria-label="Play ${title}"><span aria-hidden="true"></span></button>
            <span class="ui-video-duration">${escapeHtml(formatDuration(asset.durationSeconds))}</span>
            <div class="embedded-video-card-nav" aria-label="Carousel controls for ${title}">
              <button type="button" data-ui-video-nav="previous" data-ui-video-slot="${position}" data-ui-video-position="${position}" aria-label="Show previous video in panel ${position + 1}"></button>
              <span class="embedded-video-position" aria-live="polite">${position + 1} / ${total}</span>
              <button type="button" data-ui-video-nav="next" data-ui-video-slot="${position}" data-ui-video-position="${position}" aria-label="Show next video in panel ${position + 1}"></button>
            </div>
          </div>
          <div class="embedded-video-card-body">
            <div class="embedded-video-summary">
              <h4>${title}</h4>
              <p class="ui-video-meta"><span class="channel">TeoyubeWorld</span><span>Available locally</span><span>${scripture}</span></p>
            </div>
            <details class="embedded-video-menu">
              <summary aria-label="More actions for ${title}">...</summary>
              <div class="ui-video-actions embedded-video-menu-actions">
                <button class="primary" type="button" data-ui-video-play="${id}" data-ui-video-source="approved">Play</button>
                <button class="secondary" type="button" data-ui-video-detail="${id}" aria-expanded="false">Details</button>
                <button class="secondary" type="button" data-ui-video-save="${id}" data-ui-video-source="approved">Save to Book</button>
                <button class="secondary" type="button" data-ui-video-scripture="${scripture}">Open Scripture</button>
              </div>
            </details>
            <div class="embedded-video-detail" data-ui-video-detail-panel="${id}" hidden>
              <p><strong>Scripture:</strong> ${scripture}</p>
              <p>${escapeHtml(asset.description)}</p>
              <p>${sequence}, segment ${segment}.</p>
              <p class="embedded-video-boundary">Video supports reflection; Scripture remains primary.</p>
            </div>
          </div>
        </article>`;
}

export function renderApprovedMediaGrid(media: readonly MediaAssetDto[]) {
  return media.slice(0, 4).map((asset, index) => renderCard(asset, index, media.length)).join("");
}

export function renderApprovedMediaStats(total: number) {
  return [
    ["Total Videos", total, "Approved local collection", "library"],
    ["Total Views", "Not tracked", "No analytics connected", "views"],
    ["Watch Time", "Not tracked", "Session-only experience", "time"],
    ["Last Updated", "Published", "Runtime manifest", "updated"]
  ].map(([label, value, trend, icon]) => `
        <article class="embedded-stat-card">
          <span class="embedded-stat-icon ${escapeHtml(icon)}" aria-hidden="true"></span>
          <div><p>${escapeHtml(label)}</p><strong>${escapeHtml(value)}</strong><small>${escapeHtml(trend)}</small></div>
        </article>`).join("");
}
