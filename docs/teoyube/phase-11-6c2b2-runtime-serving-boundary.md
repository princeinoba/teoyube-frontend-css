# Phase 11.6C.2B.2 Runtime Serving Boundary

The local server exposes only URLs explicitly present in the checksum-valid publication plan and only while matching publication authorization and receipt artifacts exist.

## Allowed

- `GET` and `HEAD` for the 49 approved pilot URLs
- `video/mp4` byte-range responses for the 24 approved card and mobile previews
- `image/webp` responses for the 24 approved poster and thumbnail files
- `application/json` for the approved 12-record runtime manifest

## Rejected

- directory listing
- unknown or unplanned files under the pilot prefix
- path traversal
- direct access to `media-source`
- direct access to `generated`
- browser publication authorization
- browser publication execution
- repeated publication through a URL parameter or client function

Each public request rechecks the plan item, public destination, byte size, and SHA-256 checksum before serving. Protected source masters remain available only to the owner-review workflow on loopback and are not reachable from public media URLs.

