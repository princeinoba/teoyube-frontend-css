# Phase 11.6C.1 Media Workspace Preflight

Status: passed with local-tool limitations.

## Workspace

- Project root: `C:\Users\royce\Downloads\TeoyubePrompt\Teoyube Phase 1`
- Protected source root: `media-source/teoyubeworld/originals/`
- Generated root: `generated/teoyubeworld-media/`
- Approved public root: `public/media/teoyubeworld/`
- Gated runtime manifest: `src/data/teoyubeworld-media-manifest.json`
- Runtime records before scanning: 0

All expected source and generated directories exist. The source and generated roots return HTTP 404 from the static server; the approved public root remains eligible for reviewed derivatives only.

## Initial library

- Files: 3,975
- Total bytes: 106,288,074,235
- Total size: 98.988 GiB
- MP4: 3,942 files
- PNG: 24 files
- JPG: 8 files
- Unsupported WFP project file: 1
- Shorts folder: 3,720 files
- Long-form folder: 173 files
- Captions folder: 75 files
- Thumbnails folder: 7 files

Folder labels are organizational hints only. File kind remains extension-driven; for example, the current `captions/` folder contains MP4 clips rather than caption-text files.

## Local tools

- Node.js: available
- Windows PowerShell: available
- ffprobe: unavailable
- ffmpeg: unavailable
- ImageMagick: unavailable

No software will be installed automatically. Stream metadata such as duration, resolution, codecs, frame rate, rotation, bitrate, and video audio presence will remain unknown. Posters, thumbnails, motion strips, and contact sheets cannot be generated in this environment. Filename/folder inventory, streamed SHA-256 checksums, duplicate detection, Scripture parsing, sidecar matching, sequence detection, draft manifests, CSV review sheets, and validation remain available.

## Safety

The immutable-source rules in `media-source/teoyubeworld/AGENTS.md` were read before scanning. The scanner writes only under `generated/teoyubeworld-media/`, records source size and modification time before and after each scan, does not follow symbolic links, and does not expose absolute paths in generated manifests.

Preflight warning: a full SHA-256 pass must read approximately 99 GiB. It is incremental and resumable through `generated/teoyubeworld-media/reports/scan-cache.json`.
