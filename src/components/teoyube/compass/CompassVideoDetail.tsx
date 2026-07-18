import type { CompassVideo } from "@/lib/youtube";
import CompassSpinner from "@/components/compass/CompassSpinner";

export default function CompassVideoDetail({
  video,
  loading
}: {
  video: CompassVideo | null;
  loading?: boolean;
}) {
  if (loading && !video) return <CompassSpinner />;

  if (!video) {
    return (
      <section className="card compass-player">
        <h2 className="gold">TeoyubeWorld Compass</h2>
        <p className="muted">Search TeoyubeWorld videos to begin.</p>
      </section>
    );
  }

  return (
    <section className="card compass-player">
      <h2 className="gold">{video.title}</h2>
      <p className="muted">{video.channelTitle}</p>
      <p>{video.description}</p>
      {video.id ? (
        <p className="muted">
          Public video embeds are disabled in this local verification build.
        </p>
      ) : null}
    </section>
  );
}
