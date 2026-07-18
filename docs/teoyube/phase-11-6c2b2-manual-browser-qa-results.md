# Phase 11.6C.2B.2 Manual Browser QA

## Environment

- URL: `http://127.0.0.1:4174/media-review.html?qa=1&mode=derivative-review`
- Server: authoritative local Teoyube server on port 4174
- Desktop viewport: 1265 x 720
- Mobile viewport: 390 x 844 override, 375px content viewport

## Results

- Lifecycle rendered as `published`.
- Publication state rendered as `49 checksum-bound files published`.
- Summary rendered 12 approved records, 48 validated operations, 12 card previews, 12 mobile previews, 12 posters, 12 thumbnails, and passed source integrity.
- All 12 sequence records rendered in owner-confirmed order.
- The first poster and thumbnail loaded with non-zero natural widths.
- The MP4 player reached ready state 4, remained muted, and had no autoplay attribute.
- Desktop and mobile layouts had no horizontal overflow.
- Mobile player width remained within the content viewport.
- No publication control or browser command appeared.
- Browser console warnings and errors: 0.
- The public runtime manifest returned 12 records.
- Automated HTTP QA confirmed poster `HEAD`, MP4 byte ranges, unknown-file denial, and protected-root denial.

The viewport override was reset after QA. The published owner-review page remains open at the authoritative local URL.

