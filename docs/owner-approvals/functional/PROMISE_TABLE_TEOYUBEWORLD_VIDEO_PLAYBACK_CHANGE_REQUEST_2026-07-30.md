# Promise Table TeoyubeWorld video playback approval

Decision: APPROVED

Approval-ID: TEOYUBE-FUNCTIONAL-2026-07-30-PROMISE-TABLE-YOUTUBE-PLAYBACK-001

Approved-By: Prince Okiemute Inoba — Teoyube Project Owner

Approved-At: 2026-07-30T20:06:08-04:00

## Authorized scope

This approval authorizes the minimum functional changes required to connect the existing Promise Table TeoyubeWorld media-card feed to the existing Featured Video Teaching player:

- use one current Promise Table media collection as the card, metadata, selection, navigation, and player source of truth;
- map only verified public videos belonging to the official TeoyubeWorld channel;
- preserve unmatched cards and expose an accurate disabled playback state rather than substituting unrelated media;
- load one privacy-enhanced YouTube iframe only after an explicit Watch Video!, Watch Now, main Play, Next, Previous, or existing indicator action;
- synchronize the existing feed cards, Featured Video metadata, Watch Now, main Play, Next Video, Previous/indicators, and active player state;
- stop or unload the previous video before replacing it and maintain only one iframe/player instance;
- keep user focus on the activated control and avoid an unexpected page scroll;
- update only an existing source-status or local-network notice when needed for truthful disclosure;
- add stable non-visual data attributes, accessibility support, deterministic tests, browser evidence, and exact derived runtime/hash updates required by this feature;
- update the supported canonical static Promise Table controller and Next Promise Table controller where required for parity;
- add only minimal Promise Table-scoped player-fit CSS if the existing Teaching container requires it.

Official channel:

- URL: `https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w`
- Channel ID: `UCxG1guesWqO69QK022fyp2w`
- Public RSS inspection URL: `https://www.youtube.com/feeds/videos.xml?channel_id=UCxG1guesWqO69QK022fyp2w`

## Explicit exclusions

This approval does not authorize:

- a Promise Table redesign, new visible panel, or structural layout change;
- changes to Today, TeoyubeSearch, Canon, Calling Compass, Book of the Saint, Lexicon, Testimony, Teo Guide, Embedded Videos, Tables, or the shared shell;
- changes to Promise Scrolls, Calling Compass, Purpose Progression, Book Snapshot, Testimony Archive, Saved Promise Rows, promise actions, search, suggestions, or Why this? behavior;
- a YouTube API key, new player dependency, tracking, analytics, or automatic initial playback;
- arbitrary iframe URLs or video IDs sourced from visible text, URL parameters, local storage, or user data;
- sending Teoyube profile, prayer, Scripture, recommendation, reflection, notes, or other private state to YouTube;
- global iframe/video CSS, visual-baseline replacement, push, or deployment.

## Owner-authorized execution instruction

After this approval is recorded, implementation continues directly without another approval request. The existing Featured Video structure, Teaching container, media cards, controls, tab order, responsive layout, and unrelated Teoyube behavior must remain intact.
