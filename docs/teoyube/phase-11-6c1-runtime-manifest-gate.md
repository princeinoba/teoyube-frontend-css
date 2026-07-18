# Phase 11.6C.1 Runtime Manifest Gate

The live runtime manifest is `src/data/teoyubeworld-media-manifest.json`. It remains empty during Phase 11.6C.1.

A record may enter the runtime manifest only when:

- it is not an exact duplicate selected for exclusion;
- it uses a supported browser format or has an approved browser derivative;
- its Scripture mapping is owner-confirmed or explicitly owner-approved;
- its title and description are reviewed;
- `reviewStatus`, `safetyStatus`, and rights/copyright status are approved;
- its runtime path is relative and begins with `public/media/teoyubeworld/`;
- it contains no absolute source path, master path, private note, secret, or unreviewed external URL;
- it has an accessible title, poster fallback, controls, and reduced-motion behavior;
- long-form and audio media remain user-initiated and no media autoplays with sound.

Scanning, hashing, filename parsing, duplicate grouping, sequence inference, or presence in a draft manifest never constitutes approval. The owner review CSV and exported Media Review patch are inputs to a later controlled approval step; neither updates the runtime manifest automatically.

Current runtime record count: 0.

Current draft records ready for integration: 0.
