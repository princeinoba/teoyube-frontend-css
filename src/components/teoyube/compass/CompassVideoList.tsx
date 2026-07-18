import type { CompassVideo } from "@/lib/youtube";
import CompassVideoItem from "@/components/compass/CompassVideoItem";

export default function CompassVideoList({
  videos,
  selectedVideo,
  onVideoSelect
}: {
  videos: CompassVideo[];
  selectedVideo: CompassVideo | null;
  onVideoSelect: (video: CompassVideo) => void;
}) {
  if (!videos.length) {
    return (
      <section className="card">
        <p className="muted">No TeoyubeWorld videos found for this search.</p>
      </section>
    );
  }

  return (
    <section className="card compass-list">
      <h2 className="gold">TeoyubeWorld Videos</h2>
      {videos.map((video) => (
        <CompassVideoItem
          key={video.id || video.title}
          onSelect={onVideoSelect}
          selected={selectedVideo?.id === video.id}
          video={video}
        />
      ))}
    </section>
  );
}
