import type { MediaAssetDto } from "../../domain/media/media-contracts";

const fallbackDurations = ["21:09", "16:09", "1:12", "4:03", "0:58", "5:42", "12:18", "8:24"];

function durationLabel(asset: MediaAssetDto, position: number) {
  const seconds = asset.durationSeconds;
  return seconds && seconds > 0
    ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
    : fallbackDurations[position % fallbackDurations.length];
}

function categoryLabel(asset: MediaAssetDto) {
  if (asset.source !== "approved_teoyubeworld_pilot") return asset.category;
  return asset.category.toLowerCase() === "short" ? "Short" : "Scripture";
}

export function syncEmbeddedVideoCard(
  card: HTMLElement,
  asset: MediaAssetDto,
  position: number,
  total: number
) {
  const approved = asset.source === "approved_teoyubeworld_pilot";
  const source = approved ? "approved" : "original";
  const actionLabel = approved ? "Play" : "Preview";
  const scripture = asset.scriptureReferences[0] || "Scripture context in details";

  card.dataset.uiVideoId = asset.id;
  card.querySelectorAll<HTMLElement>("[data-ui-video-play]").forEach((button) => {
    button.dataset.uiVideoPlay = asset.id;
    button.dataset.uiVideoSource = source;
  });

  const stage = card.querySelector<HTMLElement>("[data-ui-video-stage]");
  if (stage) stage.dataset.uiVideoStage = asset.id;
  const playOverlay = card.querySelector<HTMLElement>(".embedded-video-play");
  if (playOverlay) playOverlay.setAttribute("aria-label", `${actionLabel} ${asset.title}`);
  const menuPlay = card.querySelector<HTMLElement>(".ui-video-actions [data-ui-video-play]");
  if (menuPlay) menuPlay.textContent = actionLabel;

  const heading = card.querySelector("h4");
  if (heading) heading.textContent = asset.title;
  card.querySelectorAll<HTMLImageElement>(".embedded-video-poster-image, .embedded-video-poster-backdrop")
    .forEach((image) => { image.src = asset.posterUrl || asset.thumbnailUrl; });
  const badge = card.querySelector<HTMLElement>(".ui-video-badge");
  if (badge) badge.textContent = categoryLabel(asset);
  const duration = card.querySelector<HTMLElement>(".ui-video-duration");
  if (duration) duration.textContent = durationLabel(asset, position);

  const positionLabel = card.querySelector<HTMLElement>(".embedded-video-position");
  if (positionLabel) positionLabel.textContent = `${position + 1} / ${total}`;
  card.querySelectorAll<HTMLElement>("[data-ui-video-nav]").forEach((button) => {
    button.dataset.uiVideoPosition = String(position);
  });
  const navigation = card.querySelector<HTMLElement>(".embedded-video-card-nav");
  if (navigation) navigation.setAttribute("aria-label", `Carousel controls for ${asset.title}`);

  const meta = card.querySelectorAll<HTMLElement>(".ui-video-meta span");
  if (meta[0]) meta[0].textContent = "TeoyubeWorld";
  if (meta[1]) meta[1].textContent = approved || asset.playbackUrl ? "Available locally" : "Preview record";
  if (meta[2]) meta[2].textContent = scripture;
  const menuSummary = card.querySelector<HTMLElement>(".embedded-video-menu summary");
  if (menuSummary) menuSummary.setAttribute("aria-label", `More actions for ${asset.title}`);

  const detailButton = card.querySelector<HTMLElement>("[data-ui-video-detail]");
  if (detailButton) {
    detailButton.dataset.uiVideoDetail = asset.id;
    detailButton.setAttribute("aria-expanded", "false");
  }
  const saveButton = card.querySelector<HTMLElement>("[data-ui-video-save]");
  if (saveButton) {
    saveButton.dataset.uiVideoSave = asset.id;
    saveButton.dataset.uiVideoSource = source;
  }
  const scriptureButton = card.querySelector<HTMLElement>("[data-ui-video-scripture]");
  if (scriptureButton) scriptureButton.dataset.uiVideoScripture = scripture;

  const detailPanel = card.querySelector<HTMLElement>("[data-ui-video-detail-panel]");
  if (detailPanel) {
    detailPanel.dataset.uiVideoDetailPanel = asset.id;
    detailPanel.hidden = true;
    const paragraphs = detailPanel.querySelectorAll<HTMLParagraphElement>("p");
    const label = paragraphs[0]?.querySelector("strong");
    if (paragraphs[0] && label) {
      paragraphs[0].replaceChildren(label, document.createTextNode(` ${scripture}`));
    }
    if (paragraphs[1]) paragraphs[1].textContent = asset.description;
    if (paragraphs[2]) {
      paragraphs[2].textContent = approved
        ? `${asset.sequenceTitle || "Approved Scripture sequence"}, segment ${asset.sequenceOrder || position + 1}.`
        : "This is an original local preview record; a playable source has not been connected.";
    }
    if (paragraphs[3]) paragraphs[3].textContent = "Video supports reflection; Scripture remains primary.";
  }
  card.querySelector<HTMLDetailsElement>(".embedded-video-menu")?.removeAttribute("open");
}
