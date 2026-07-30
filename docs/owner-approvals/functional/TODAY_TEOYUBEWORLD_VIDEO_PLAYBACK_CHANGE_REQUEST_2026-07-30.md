# Today TeoyubeWorld video playback approval

Decision: APPROVED

Approval-ID: TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001

Approved-By: Prince Okiemute Inoba — Teoyube Project Owner

Approved-At: 2026-07-30T18:50:36-04:00

## Authorized scope

This approval authorizes the focused functional integration between the existing Today-page TeoyubeWorld Feed and TeoyubeWorld Video Highlight:

- use the current Today feed collection as the shared feed/player source of truth;
- map only exact, verified public videos belonging to the official TeoyubeWorld channel;
- preserve unmatched rows and expose an accurate disabled playback state;
- load one privacy-enhanced YouTube iframe only after an explicit Play, Previous, or Next action;
- synchronize the existing main Play, feed-row Play, Previous, Next, active-row, and metadata states;
- update the existing source-status and local-network notices only as needed for accuracy;
- add minimal Today-scoped player-fit CSS, non-visual attributes, accessibility support, deterministic tests, and verification evidence;
- update the supported static Today controller and Next Today controller where required for runtime compatibility;
- refresh only exact deterministic manifest or digest entries derived from this authorized change.

Official channel:

- URL: `https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w`
- Channel ID: `UCxG1guesWqO69QK022fyp2w`
- Public RSS inspection URL: `https://www.youtube.com/feeds/videos.xml?channel_id=UCxG1guesWqO69QK022fyp2w`

## Explicit exclusions

This approval does not authorize:

- a Today-page or application-shell redesign;
- moving or resizing another Today section;
- changes to another route;
- a YouTube API key, new player dependency, tracking, analytics, or automatic initial playback;
- sending Teoyube profile, prayer, Scripture, recommendation, reflection, or other private data to YouTube;
- visual-baseline replacement;
- push or deployment.

## Owner-authorized execution instruction

After this approval is recorded, implementation continues directly without another approval request. The implementation must preserve the existing Highlight, Teaching container, Feed table, row heights, controls, tab order, responsive layout, and all unrelated Teoyube functionality.
