# Consent-Aware Memory Threat Model

| Threat | Mitigation | Residual risk/dependency |
| --- | --- | --- |
| Cross-user access / IDOR | User resolved from server session; every repository statement binds user ID; exports are owner-scoped | Application bugs require continued contract tests and review |
| Session theft | Opaque 256-bit token, HttpOnly/Strict/Secure cookie, DB hash only, expiry, rotation, invalidation | Production needs managed identity, MFA and incident response |
| Request forgery | Same-origin validation, Strict cookies, session-bound CSRF header | XSS remains able to act as the user; CSP review is future work |
| Privilege escalation / internal routes | Role check independent of user auth; enabled proxy returns non-enumerating 404 | Production role source must be provider-authoritative |
| Database/backup leakage | Class 3 AES-256-GCM, separate keys, token hashes | Local SQLite has no managed encrypted-backup lifecycle |
| Log/trace leakage | No raw boundary logging; static verifier; pseudonymous event schema | Future instrumentation must keep the same allowlist |
| Export leakage | Authentication, size/concurrency limits, no server retention or secrets | User-downloaded file security is outside server control |
| Consent bypass | Typed purpose registry and checks at service reads/writes | Every future consumer must use the service boundary |
| Revoked-memory reuse | Transactional projection change and ciphertext destruction; per-record effective-consent read checks | Content-free consent integrity events remain intentionally |
| Deleted derivatives | No indexes, embeddings, queues, attachments, or durable cache; automated zero-derivative checks | Future derivatives need deletion registration |
| Cache leakage | No private application cache; API responses are `no-store` | Proxy/CDN configuration must retain no-store in production |
| Key leakage | Server-only key ring, no committed key, version metadata, authenticated encryption | Production KMS/HSM, rotation and emergency revocation are not configured |
| Test fixture leakage | Generated DB and exports stay under ignored `.tmp`; runner removes process tree and artifacts | CI artifact policy must avoid private production fixtures |
| Future prompt injection | Teo Guide reads structured authorized records only; no live model | A later model phase needs untrusted-memory isolation/evaluation |
| Malicious imported text | Imports require explicit purpose/source, size limits, encryption for Class 3 | Rich-file sanitization is out of scope because attachments are absent |
| Query/export DoS | Body, page, history, count, rate and concurrency limits | Distributed production enforcement is not implemented |

No live model, embedding, broad RAG, private-memory search, external analytics, cloud identity, or cloud database is connected.
