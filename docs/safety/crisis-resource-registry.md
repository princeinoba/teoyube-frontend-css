# Crisis-resource registry

Provider contract fields: country/region scope, emergency guidance, verified service, contact mode, source, last-verified date, expiry/review date, language, limitations, verification status, safe-to-display flag, and a false precise-location-inference marker.

Allowed statuses:

- `VERIFIED_CURRENT`: verified and within review window.
- `OWNER_APPROVED_LOCAL_FIXTURE`: synthetic/local test fixture explicitly approved for that scope.
- `UNVERIFIED_DO_NOT_DISPLAY`: stale, incomplete, or unverified; never shown as current.
- `NO_LOCAL_RESOURCE_GENERIC_EMERGENCY_FALLBACK`: no verified locale entry; show generic local-emergency guidance without invented contact details.

Production locale-specific coverage: **0 entries / 0 locales**. The deterministic provider therefore returns the global generic emergency fallback. Test fixtures exercise current, stale, missing, and timeout behavior but are not production resources.

Resource owners must record source, verification date, review/expiry date, language, scope, and limitations. Expired entries fail closed. A human resource-boundary reviewer and owner must approve registry additions. Refresh is required before expiry; removal or fallback is the rollback.
