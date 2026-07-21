# User Data Export

Authenticated users may request a human-readable JSON document with schema `teoyube-user-data-export` version `1.0.0`. It includes generation time, the authenticated user's ID, active memory with content/provenance/timestamps/retention/version, consent history, and content-free deletion status.

Authorization comes only from the server session. Query and body user IDs are ignored. Tests create two users and prove one export cannot contain the other's WEB/KJV preference. The export excludes session tokens, CSRF values, hashes, encryption keys, ciphertext envelopes, database configuration, and server secrets.

Generation is synchronous, limited to 5,000 records or 2 MiB, and one in-flight export per user/process. The server does not retain the payload. A downloaded copy is controlled by the user and should be handled as sensitive data.
