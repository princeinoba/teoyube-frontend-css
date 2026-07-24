# Security header policy

`config/security-headers.json` is the source of truth and
`next.config.mjs` applies it to the Next preview.

Preview headers:

- Content-Security-Policy-Report-Only;
- X-Frame-Options: DENY;
- X-Content-Type-Options: nosniff;
- Referrer-Policy: strict-origin-when-cross-origin;
- Permissions-Policy with camera, microphone, geolocation, payment, USB, and
  interest-cohort disabled;
- Cross-Origin-Opener-Policy: same-origin.

The report-only CSP preserves existing images, media, fonts, and scripts while
diagnostics are collected. Enforcing CSP requires evidence that it does not
change the approved interface. Strict-Transport-Security is production-only
because localhost and preview evidence cannot prove TLS deployment.

Verification is part of:

```text
npm run release:security:gate
npm run test:e2e
```
