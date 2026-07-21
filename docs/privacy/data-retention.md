# Data Retention

| Data | Executable/default rule | Revocation/deletion |
| --- | --- | --- |
| Session | Eight-hour local/test TTL; invalidated on rotation, sign-out, or account deletion | Immediately unusable |
| Preference | Up to 730 days unless an earlier expiry is selected | Delete by record, purpose, or account |
| Journey metadata | Up to 730 days | Purpose revocation removes active retrieval; delete removes row |
| Sensitive content | Up to 365 days unless earlier expiry; renewal requires a new user decision | Revocation destroys ciphertext and blocks retrieval; deletion removes row |
| Consent integrity metadata | Minimal content-free event history | Retained only as the documented integrity trail; no private content |
| Deletion status | Content-free request ID, counts, status, time | Retained to make retries idempotent |
| Export | Generated synchronously and returned; no durable export payload | Client controls downloaded copy |

Account deletion deletes active memory, invalidates sessions, removes the effective consent projection, and tombstones the account. There are no search indexes, queues, attachments, embeddings, or application caches in Prompt 16; deletion reports those derivative counts as zero.

The local/test implementation has no backup system. Production backup deletion cannot be claimed until a managed database retention and restore policy is selected and tested. A future production adapter must document the maximum backup survival window separately.
