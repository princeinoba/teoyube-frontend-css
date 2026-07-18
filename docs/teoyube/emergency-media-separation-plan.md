# Emergency Media Separation Plan

## Goal

Keep the active coding project small while preserving the immutable TeoyubeWorld master library in an owner-controlled external location such as `D:\TeoyubeWorld-Media-Library`.

No media move is authorized in this recovery step.

## Future Structure

The active project should retain only:

- `public/media/teoyubeworld/pilot-v1/runtime-manifest.json`
- the 12 approved card previews
- the 12 approved mobile previews
- the 12 approved posters
- the 12 approved thumbnails
- public-safe scripts and metadata
- approval, checksum, review, validation, and publication artifacts
- the owner-only Media Review application

The external library should contain the protected originals now under `media-source/teoyubeworld/originals`. Originals remain immutable before, during, and after a future verified transfer.

## Local Configuration

Two local-only options are supported by the scanner:

1. Set `TEOYUBE_MEDIA_SOURCE_ROOT` in `.env.local` or the process environment.
2. Create ignored `config/local-media-path.json` from `config/local-media-path.example.json`.

The actual local configuration is ignored by Git. The scanner records `external-local-media-source`, not an absolute path, in generated manifests. The browser runtime does not read this config, the server does not expose it, and protected source paths remain blocked.

## Future Move Gate

After exact owner authorization:

1. Confirm the destination is on the intended drive and has more free space than the 98.99 GB source library plus verification margin.
2. Record source file count, byte count, relative paths, and SHA-256 checksums.
3. Copy without renaming, transforming, or transcoding.
4. Record the same destination inventory and compare every item.
5. Owner spot-check playable files and captions.
6. Point the ignored local config at the external library and run a read-only scan.
7. Keep the project source copy until checksum verification and a separate owner deletion decision are complete.

Moving within the same drive reduces project size but does not recover drive capacity. Actual disk recovery requires a destination on another drive and later deletion of the verified source copy under explicit authorization.
