# Phase 11.6C.2A Secure Review Playback Report

The static Node server now provides three exact localhost QA capabilities:

- `GET|HEAD /__qa/teoyubeworld/media/:mediaId?qa=1` resolves only a known draft-manifest ID.
- `GET /__qa/teoyubeworld/media-status?qa=1` reports counts and capability flags without paths.
- `POST /__qa/teoyubeworld/review-image/:mediaId?qa=1&type=poster|thumbnail` accepts a bounded raster frame for a known ID.

Playback is limited to an allowlist of browser media MIME types, contained under the immutable originals root, sent inline with `no-store`, `nosniff`, and no permissive CORS. HEAD and single byte ranges are supported. Valid ranges return 206; invalid ranges return 416. Unknown IDs, non-QA calls, and direct `/media-source/` or `/generated/` calls return 404 without local path details.

Frame capture accepts only PNG, JPEG, or WebP up to 3 MiB and writes only to generated posters or thumbnails. It never writes to originals or public media.
