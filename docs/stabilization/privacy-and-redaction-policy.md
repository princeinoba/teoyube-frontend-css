# Stabilization privacy and redaction policy

The toolkit records product behavior, never private spiritual content. Describe only the safe control used, the expected product behavior, the actual product behavior, and a non-sensitive error code. Replace personal examples with neutral synthetic wording before recording.

## Never record

- prayer, journal, testimony, check-in, reflection, or memory text;
- health, trauma, abuse, relationship, or crisis details;
- API keys, access tokens, session tokens, passwords, private keys, or personal identifiers;
- raw prompts, raw model responses, or private retrieval/memory payloads;
- copied screenshots, logs, network bodies, or exports containing user text.

Fields and aliases matching `prayerText`, `journalText`, `testimonyText`, `checkInText`, `reflectionText`, `memoryText`, `healthDetails`, `traumaDetails`, `abuseDetails`, `relationshipDetails`, `crisisDetails`, `apiKey`, `accessToken`, `sessionToken`, `rawPrompt`, or `rawModelResponse` are rejected anywhere in a record. Normalized aliases with punctuation, spaces, underscores, or case changes are rejected too. Recognizable secrets, bearer tokens, private keys, JWTs, email addresses, and common credential assignments are rejected.

## Safe wording

Use descriptions such as "The save control preserved the selected record after restart" or "The citation link opened the expected reference." Do not include what the user prayed, wrote, disclosed, searched privately, or received from a live model.

The CLI accepts record bodies only from bounded JSON files. It never accepts raw record text or secrets as command-line arguments and never prints record contents. Validation errors name only the unsafe field location or rule, not the rejected value.

The redacted export contains aggregate counts, coverage IDs, status, and deterministic record hashes. It excludes notes, expected/actual narrative, actions, reproduction steps, and private text.
