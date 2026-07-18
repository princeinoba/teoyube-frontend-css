# Phase 11.6C.2B.1 Manual Derivative Browser QA Results

## Environment

- URL: `http://127.0.0.1:4174/media-review.html?qa=1&mode=derivative-review`
- Runtime: primary static Node server on loopback port 4174
- Browser surface: Codex in-app browser
- Result: passed
- Console errors or warnings: 0
- External DOM resources: 0

## Functional Results

| Check | Result | Evidence |
| --- | --- | --- |
| Page and API return successfully | Pass | Workspace loaded and derivative review API returned 12 records. |
| Approved record scope | Pass | Exactly 12 records; one sequence; no rejected or unapproved record. |
| Card preview | Pass | H.264/yuv420p preview reached ready state 4 and played after owner action. |
| Mobile preview | Pass | 720 x 480 preview reached ready state 4 and played after owner action. |
| Range and seeking boundary | Pass | MP4 byte-range request returned 206 with 1,024 requested bytes; timeline control is wired. |
| Poster and thumbnail | Pass | Poster loaded at 1080 x 720; thumbnail loaded at 480 x 320. |
| Sequence controls | Pass | Play Selected, Play Entire, Previous, Next, Pause, and both restart controls worked. |
| Automatic progression | Pass | Advanced from segment 1 to segment 2 only after Play Entire Sequence. |
| Keyboard controls | Pass | Arrow Right advanced the active segment; keyboard bindings are focus-safe. |
| Single active media | Pass | One derivative video has a source; inactive review videos remain source-free and paused. |
| Autoplay audio | Pass | Initial state paused; derivative player muted; generated videos contain no audio track. |
| Reduced motion | Pass | Loaded stylesheet contains the reduced-motion media query and zero-transition fallback. |
| Absolute path protection | Pass | No absolute Windows or `file://` path in the DOM or safe API payload. |
| Protected route boundary | Pass | `/media-source` and `/generated` requests returned 404. |
| Direct command boundary | Pass | Browser execution, publication authorization, and publication requests returned 409. |
| External network boundary | Pass | No external script, link, image, video, or source URL loaded. |
| Public tree integrity | Pass | `public/media` fingerprint matches the pre-execution snapshot. |
| Source integrity | Pass | All 12 checksums, byte sizes, and modification timestamps remain unchanged. |

## Responsive Results

| Requested viewport | Horizontal overflow | Record list | Player and controls |
| --- | --- | --- | --- |
| 390 x 844 | None | 12 records, one column | Visible and contained |
| 430 x 932 | None | 12 records, one column | Visible and contained |
| 768 x 1024 | None | 12 records, one column | Visible and contained |
| 1024 x 900 | None | 12 records, two columns | Visible and contained |
| Desktop 1280 | None | 12 records | Visible and contained |

The browser viewport controller does not expose a reduced-motion device override. Runtime CSS loading, `matchMedia` integration, and the no-transition reduced-motion rules were therefore checked directly and are also enforced by the Phase 11.6C.2B.1 smoke test.

## Final Boundary

- Public files written: 0
- Source masters exposed: 0
- Publication authorized: no
- Browser QA blocker count: 0

