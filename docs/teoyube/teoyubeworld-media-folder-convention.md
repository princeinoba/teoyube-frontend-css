# TeoyubeWorld Media Folder Convention

Status: preparation guidance only. The media ZIP has not been ingested.

## Recommended layout

```text
TeoyubeWorld/
  John/
    03/
      John_3_16_animation.mp4
      John_3_16_animation.webp
      John_3_16_animation.vtt
  Psalms/
    23/
      Psalms_23_1-6_audio.m4a
  Devotionals/
  Shorts/
  Background-Visuals/
```

Keep original files read-only during scanning. Sidecars should share the media basename where practical. Use canonical Bible book names; number-prefixed books may use `1 John`, `First John`, or `1_John`. Supported reference patterns include `John_3_16`, `Psalms_23_1-6`, `Romans 8 28 animation`, and `Genesis-1-1-location`.

Avoid secrets, user names, private notes, publishing credentials, absolute paths, executable files, temporary files, and generated thumbnail duplicates in the prepared folder. The scanner ignores hidden files, OS junk, partial downloads, and recognizable generated thumbnails.

## Read-only scan

```powershell
npm run media:scan -- "C:\path\to\prepared-media-folder"
```

The scanner never uploads, edits, moves, transcodes, or deletes source files. It writes a draft manifest under `generated/teoyubeworld-media/`, which is excluded from the clean runtime bundle. If `ffprobe` is already available, technical metadata may be read; it is never installed automatically.

After scanning, run validation and complete human review for Scripture accuracy, ownership, copyright, captions, safety, titles, themes, Teoyube links, and recommended surfaces before any Phase 11.6C integration.
