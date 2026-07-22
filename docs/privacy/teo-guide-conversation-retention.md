# Teo Guide conversation retention

Prompt 18 uses bounded session-process conversation metadata only. It stores at most 100 conversations and 20 turns per conversation. Oldest conversations and oldest turns are evicted deterministically when limits are reached.

Stored turn metadata includes:

- conversation and turn identifiers;
- creation/update time;
- SHA-256 input fingerprint;
- response identifier;
- source identifiers;
- `rawUserTextStored: false`.

It does not store raw prompt, prayer, reflection, journal draft, testimony draft, crisis disclosure, generated response text, or tool output. The inspection interface returns only this metadata. The deletion interface deletes it. Both interfaces require Prompt 16 server authentication; deletion also requires CSRF-authorized mutation.

This session repository is not durable memory and is not a cross-device continuity mechanism. Restarting or scaling the preview process may remove it. Durable memory remains governed by Prompt 16 consent, encryption, retention, export, deletion, and user ownership. Teo Guide cannot upgrade session metadata into durable memory.
