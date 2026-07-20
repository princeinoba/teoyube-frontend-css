"use client";

import { useState } from "react";
import type { CallingCompassClientContextDto } from "@/domain/calling/calling-discernment";
import type { CompassVideo } from "@/lib/youtube";
import CompassSearchBar from "@/components/compass/CompassSearchBar";
import CompassVideoDetail from "@/components/compass/CompassVideoDetail";
import CompassVideoList from "@/components/compass/CompassVideoList";

async function fetchCompassVideos(query: string) {
  const response = await fetch(`/api/youtube/teoyube?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Compass video search failed.");
  return response.json();
}

async function fetchCallingContext(query: string): Promise<CallingCompassClientContextDto> {
  const response = await fetch("/api/teoyube/calling-context", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error("Calling context request failed.");
  return response.json() as Promise<CallingCompassClientContextDto>;
}

export default function CompassExperienceClient({ initialContext }: { initialContext: CallingCompassClientContextDto }) {
  const [videos, setVideos] = useState<CompassVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<CompassVideo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [compassContext, setCompassContext] = useState(initialContext);
  const callingPath = compassContext.callingPath;

  async function handleSearch(term: string) {
    const safeTerm = term || "TeoyubeWorld";
    setLoading(true);
    setError("");

    try {
      const [data, context] = await Promise.all([fetchCompassVideos(safeTerm), fetchCallingContext(safeTerm)]);
      setCompassContext(context);
      setVideos(data.videos || []);
      setSelectedVideo(data.videos?.[0] || null);
      if (data.error) setError(data.error);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Unable to search TeoyubeWorld videos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="compass-layout">
      <div>
        <CompassSearchBar loading={loading} onSearch={handleSearch} />
        {!loading && !videos.length && !error && (
          <p className="muted compass-error">
            Compass topic review is manual and local-first. Choose a topic when you are ready; no public video lookup is connected in this build.
          </p>
        )}
        {error && <p className="muted compass-error">{error}</p>}
        <section className="card" aria-label="Calling Engine Context">
          <p className="eyebrow">Calling Engine</p>
          <h2 className="gold">{callingPath.archetype.name}</h2>
          <p>{callingPath.archetype.summary || "A Scripture-anchored calling pattern is available for reflection."}</p>
          <p><strong>Confidence:</strong> {callingPath.confidenceLabel}</p>
          <p>
            <strong>Scripture Anchors:</strong>{" "}
            {callingPath.scriptureAnchors.length ? callingPath.scriptureAnchors.join(", ") : "Missing anchor - review before using as guidance."}
          </p>
          {callingPath.promises.length > 0 && <p><strong>Promise Clusters:</strong> {callingPath.promises.map((cluster) => cluster.title).join(", ")}</p>}
          {callingPath.actionSteps.length > 0 && <p><strong>Next Step:</strong> {callingPath.actionSteps[0]}</p>}
          {compassContext.explanationPath.length > 0 && <p className="muted"><strong>Why this path:</strong> {compassContext.explanationPath.join(" ")}</p>}
          <p className="muted">Calling guidance is reflective and Scripture-anchored; it does not claim certainty about God&apos;s hidden will.</p>
        </section>
        <CompassVideoDetail loading={loading} video={selectedVideo} />
      </div>
      <CompassVideoList onVideoSelect={setSelectedVideo} selectedVideo={selectedVideo} videos={videos} />
    </div>
  );
}
