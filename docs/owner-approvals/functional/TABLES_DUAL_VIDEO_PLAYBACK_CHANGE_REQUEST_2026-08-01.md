# Tables dual-container TeoyubeWorld video playback approval

Decision: APPROVED

Approval-ID: TEOYUBE-FUNCTIONAL-2026-08-01-TABLES-DUAL-VIDEO-PLAYBACK-001

Approved-By: Prince Okiemute Inoba — Teoyube Project Owner

Approved-At: 2026-08-01T20:13:40-04:00

## Authorized scope

This approval authorizes the minimum functional work required to connect every existing Tables-page video Play control to its exact verified TeoyubeWorld YouTube video while preserving the approved Tables presentation.

The approved implementation may:

- bind the compact left preview and large right Airplay container independently;
- retain the current row record as the initial media assignment for both presentations when the row provides the same media ID;
- preserve a distinct container media ID when a row supplies one;
- keep the large-container carousel local to the large container;
- load a privacy-enhanced YouTube iframe only after an explicit Play action;
- use the existing verified official-channel feed and existing media adapter;
- add non-rendering data and accessibility attributes;
- update the static and Next Tables controllers, focused tests, compact evidence, protected-source fingerprints, and deterministic runtime identity derived only from this change.

Official channel:

- URL: `https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w`
- Channel ID: `UCxG1guesWqO69QK022fyp2w`

## Explicit exclusions

This approval does not authorize a redesign, automatic playback, a YouTube API key, arbitrary iframe URLs, analytics, new dependencies, changes to table/audio/search/filter/pagination behavior, changes to other routes, baseline replacement, push, or deployment.

## Data finding

The current Tables row renderer assigns the same verified media record to the compact and Airplay presentations on initial expansion. That equality is preserved. The playback controller treats the two DOM media bindings as independent state, so Airplay navigation no longer rewrites or stops the compact preview.