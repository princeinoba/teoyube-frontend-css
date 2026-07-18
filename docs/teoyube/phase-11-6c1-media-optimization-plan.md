# Phase 11.6C.1 Media Optimization Plan

No bulk optimization was performed. The machine-readable plan is at `generated/teoyubeworld-media/reports/media-optimization-plan.json`.

## Recommended profiles

| Class | Video/audio target | Review images | Playback | Mobile and motion |
| --- | --- | --- | --- | --- |
| Short silent landscape | H.264 MP4 at 854x480, roughly 0.7-1.5 Mbps; optional WebM | 960x540 poster, 480x270 thumbnail | Muted and visible-only after approval | Prefer 480p; poster only for reduced motion |
| Short portrait | H.264 MP4 at 480x854, roughly 0.6-1.2 Mbps | 540x960 poster, 270x480 thumbnail | Muted mobile cards only after approval | Prefer portrait cards; poster only for reduced motion |
| Long-form with audio | Streaming-friendly H.264/AAC MP4, reviewed aspect ratio capped at 1080p, roughly 2.5-6 Mbps | 1280x720 poster, 480x270 thumbnail | User initiated; never autoplay | Metadata or no preload; provide captions and controls |
| Audio-only | AAC/M4A or MP3 at roughly 96-192 kbps | Reviewed cover/poster | User initiated; never autoplay | Local audio player with transcript association |

Target file size remains duration-dependent and must be estimated only after technical metadata is available. ffmpeg and ffprobe are unavailable in the current environment, so no derivative, poster, thumbnail, contact sheet, or complete-library transcode was created.

Every derivative must be written under `generated/teoyubeworld-media/`, reviewed, and then explicitly copied to `public/media/teoyubeworld/`. Masters must never be overwritten.
