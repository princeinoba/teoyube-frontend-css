# Phase 11.6C.3 Performance Report

Status: Pass

| Measure | Result |
| --- | --- |
| Runtime manifest | 28,966 bytes; one-request in-memory cache; `no-store` HTTP policy |
| Poster total | 752,730 bytes |
| Thumbnail total | 115,372 bytes |
| Card-preview total | 8,838,602 bytes |
| Mobile-preview total | 2,323,192 bytes |
| Initial video requests | 0 |
| Initial visible six unique posters | 376,688 bytes |
| Manifest plus six unique posters | 405,654 bytes before playback in the Media Library case |
| First play | Approved derivative only, byte Range supported |

Images are lazy-loaded, initial cards are limited to six, and only one video element is instantiated by the sequence player. Mobile playback selects the mobile derivative where appropriate. Off-screen/hidden media pauses, stale players unregister, and error fallback does not retry indefinitely.

Checksum-named derivatives receive immutable caching. The runtime manifest remains revalidatable. No draft manifest, source scan, object URL, external request, analytics request, service worker, or full MP4 preload occurs during initial load.

