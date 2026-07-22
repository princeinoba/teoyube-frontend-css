# Teo Guide action proposals

Teo Guide may propose but cannot perform:

- a journey action;
- an editable Journal draft;
- an editable Testimony candidate;
- a mentor/community discussion prompt.

A proposal includes stable identifier, kind, status, label, summary, source identifiers, creation/expiry time, expected revision, typed payload, and explicit flags requiring authentication, CSRF, and confirmation. Initial status is `proposed`.

The user can confirm or reject. Confirmation rechecks Prompt 16 identity, same-origin CSRF, relevant consent, source presence, expiry, revision, and Prompt 17 pre-write authorization. Rejection is also authenticated and revision-checked. Replays and stale decisions fail closed.

Prompt 18 confirmation returns an auditable subject hash, proposal hash, event name, and time. It authorizes a later application action but reports `durableWritePerformed: false`. It does not silently advance a journey, save a Journal entry, publish testimony, promote to the Book, mark a promise fulfilled, decide calling, or store private text.

The approved Teo Guide page uses its existing response, explanation, and action structures. No new default-state component is added. Existing Save Response, Save Prayer, and Add Reflection controls remain session-only until an owner-authorized application write flow explicitly connects them to a confirmed proposal.
