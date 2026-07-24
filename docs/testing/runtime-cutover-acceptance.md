# Runtime cutover acceptance

Prompt 22 acceptance is executable and owner-gated.

## Command contract

- `npm start` launches the safe Next production runtime.
- `npm run dev` launches Next development.
- `npm run app:start` launches the same safe Next production runtime.
- `npm run static:start`, `prototype:start`, and `rollback:start` launch the
  exact original static runtime.
- Missing `.next/BUILD_ID` and occupied ports fail safely.
- Startup installs nothing, builds nothing, calls no provider, and mutates no
  repository source.

## Route contract

The 23 retained public routes, `/compass` redirect, `/index.html` entry,
14 static hash mappings, safe query preservation, direct links, trailing
slashes, refresh, and back/forward history are blocking. Search and Promise
Search, Today and Daily Word, Canon and Explore, and Prayer and Journey remain
distinct.

Owner, development, and internal routes are absent from public navigation and
unavailable without owner authorization.

## Asset and media contract

The verifier covers every protected-source hash through the recovery contract
and checks the legacy `/public/` prefix, protected stylesheet paths,
representative images, the TeoyubeWorld runtime manifest, video MIME, content
length, byte ranges, immutable cache headers, HEAD, Last-Modified 304,
not-found behavior, and protected source-media paths.

Next emits a weak ETag for the representative static video but does not return
304 for `If-None-Match`; its contracted conditional behavior is the verified
Last-Modified/`If-Modified-Since` 304 path. This is recorded as a nonvisual
server behavior, not hidden as parity.

The original static publication-integrity 404 boundary remains unchanged.

## Product, safety, and release gates

Acceptance additionally requires:

- complete Prompt 13 journey regression;
- Scripture, TIG, safety, Teo Guide, memory, live-AI preview, and retrieval
  contract gates;
- build, strict typecheck, lint, unit, integration, critical, browser, security,
  accessibility, and release evidence;
- immutable and owner-approved visual verification;
- three consecutive 72-cell runs, 216/216 under 5,000 ms;
- Next → static → Next rollback verification;
- checked-in live/vector defaults false;
- no protected or baseline changes;
- no public deployment and Gate C-Production closed;
- explicit final owner confirmation.
