import type { CompassVideo } from "@/lib/youtube";

export default function CompassVideoItem({
  video,
  selected,
  onSelect
}: {
  video: CompassVideo;
  selected?: boolean;
  onSelect: (video: CompassVideo) => void;
}) {
  return (
    <button
      className={selected ? "compass-video-item active" : "compass-video-item"}
      onClick={() => onSelect(video)}
      type="button"
    >
      {video.thumbnail ? (
        <img alt="" src={video.thumbnail} />
      ) : (
        <span className="video-thumb-placeholder">T</span>
      )}
      <span>
        <strong>{video.title}</strong>
        <small>{video.channelTitle || "TeoyubeWorld"}</small>
      </span>
    </button>
  );
}
