# TeoyubeWorld Media Manifest Schema

Status: Phase 11.6B.1 readiness schema. No TeoyubeWorld media has been imported.

The public-safe manifest uses `teoyubeworld-media-manifest-v1`. A manifest has `schemaVersion`, `generatedAt`, `draftOnly`, `sampleOnly`, `imported`, `recordCount` or `actualMediaRecordCount`, `records`, and optional `warnings`. Sample records are metadata examples only and must always have `sampleOnly: true` and `imported: false`.

## Record fields

| Group | Fields | Rules |
| --- | --- | --- |
| Identity | `id`, `sourceFileName`, `relativePath`, `normalizedFileName` | IDs are deterministic. Public manifests never contain absolute paths. |
| File | `fileExtension`, `mimeType`, `fileSizeBytes`, `checksum` | Supported extensions are mp4, mov, m4v, webm, avi, mp3, m4a, wav, jpg, jpeg, png, webp, vtt, and srt. AVI playback is not guaranteed. |
| Kind | `mediaKind` | `scripture_animation`, `scripture_location`, `devotional`, `short`, `long_form`, `audio_led`, `background_visual`, or `unknown`. |
| Display | `title`, `description` | Scanner descriptions remain draft/review language. They do not claim editorial approval. |
| Technical | `durationSeconds`, `hasAudio`, `width`, `height`, `aspectRatio`, `shortOrLong`, `orientation` | Unknown values are `null` or `unknown`. Short/long is inferred only when duration is known. |
| Scripture | `bibleBook`, `chapter`, `verseStart`, `verseEnd`, `scriptureReferences`, `translation` | Book names are canonicalized. Ambiguous filenames receive warnings and manual review. No unsupported reference is invented. |
| Connections | `themes`, `teoyubeWordIds`, `promiseClusterIds`, `journeyIds`, `callingIds`, `prayerSequenceIds`, `tags` | IDs must point to reviewed local data before live use. |
| Assets | `thumbnailPath`, `posterPath`, `captionPath`, `transcriptPath`, `audioTrackPath` | Paths are relative and may be empty in a draft. |
| Surfaces | `recommendedSurfaces` | Allowed labels: Today, Canon, TeoyubeSearch, Promise Table, Calling Compass, Book of the Saint, Lexicon, Testimony, Teo Guide, Embedded Videos. |
| Governance | `owner`, `sourceChannel`, `copyrightStatus`, `reviewStatus`, `safetyStatus` | Draft scanner output uses explicit review-required values. |
| Time | `createdAt`, `updatedAt` | ISO timestamps derived locally from file metadata where available. |

## Safety invariants

- A scanner draft is not an import and cannot become live content automatically.
- Sample records never enter universal search or live media surfaces.
- No absolute source path, secret, executable, HTML/script payload, or external URL is allowed in a public manifest.
- Long-form media never auto-plays. No media auto-plays with sound.
- Scripture, copyright, ownership, review, and safety metadata require human review before Phase 11.6C live use.

Validate a manifest with:

```powershell
npm run media:validate -- "generated\teoyubeworld-media\teoyubeworld-media-manifest.draft.json"
```

The sample at `src/data/teoyubeworld-media-manifest.sample.json` demonstrates shape only and reports zero actual records.
