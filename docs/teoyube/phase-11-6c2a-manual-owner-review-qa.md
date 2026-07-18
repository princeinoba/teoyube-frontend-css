# Phase 11.6C.2A Manual Owner Review QA

## Automated checks

The C.2A smoke script verifies immutable source count and bytes, patch schemas, route source protections, isolated localhost HEAD and Range behavior, unknown-ID rejection, workflow markers, empty runtime manifest, empty public media folder, dry-run derivative behavior, prohibited integration absence, and C.1 regression.

## Browser checks

Browser QA ran against `http://localhost:4174/media-review.html?qa=1` without saving owner decisions.

| # | Check | Result |
| ---: | --- | --- |
| 1 | Draft manifest loads | Pass: 3,974 records and 36 paged cards |
| 2 | Known media ID plays | Pass: protected MP4 metadata loaded |
| 3 | Direct source path blocked | Pass: HTTP 404 |
| 4 | Seeking uses HTTP Range | Pass: keyboard seek advanced from 0 to 5.9064 seconds; 206 contract passed |
| 5 | Browser metadata probe | Pass: 90.64 seconds, 720 × 1280, portrait |
| 6 | Metadata patch export | Pass: one checksum-bound technical operation |
| 7 | Scripture edit stays in memory | Pass |
| 8 | Local Scripture selector | Pass: local `Ephesians 1:4` suggestion, not auto-confirmed |
| 9 | Batch preview | Pass: selected count and value shown |
| 10 | Undo | Pass |
| 11 | Exact duplicate comparison | Pass: two members, checksum and sizes visible |
| 12 | Canonical staging | Pass, then undone; no file operation |
| 13 | Sequence ordering | Pass: move-down changed visible order |
| 14 | Sequence preview | Pass: Next segment changed protected source |
| 15 | Pilot counts | Pass: temporary one-record selection updated counts |
| 16 | Invalid pilot blocker | Pass: Scripture, review, safety, copyright, count, and sequence blockers visible |
| 17 | Pilot plan | Pass: generated and blocked with zero persisted selection |
| 18 | Derivative dry run | Pass: FFmpeg unavailable, zero commands executed |
| 19 | QA sequence player | Pass: current/next segment and context updated |
| 20 | Normal app gate | Pass: protected media ID absent from app body |
| 21 | No absolute path | Pass: status, UI, and technical patch contain none |
| 22 | Originals unchanged | Pass: 3,975 files and 106,288,074,235 bytes |

Responsive browser checks passed at fixed 390, 430, 768, and 1024 pixel frames plus the desktop tab. In each frame, document `scrollWidth` equaled `clientWidth`, the video remained visible, and the mobile actions collapsed to reachable controls.

## Owner decisions still required

One technical metadata probe was exported. No owner metadata, Scripture mapping, duplicate canonical, sequence approval, poster, thumbnail, or pilot record has been owner-approved by this implementation. All staged owner workflow checks were undone or reset. FFmpeg is unavailable. Public derivatives and runtime integration remain blocked until the owner completes and saves a compliant pilot.
