# Teo Guide tool authorization

Authorization is evaluated server-side after Prompt 17 pre-retrieval safety classification and before each tool call.

Every planned tool must satisfy all applicable conditions:

- it is one of the 13 fixed tool names;
- its descriptor permits the request;
- the Prompt 17 safety tool plan authorizes its mapped read capability;
- required server authentication exists;
- required purpose-scoped Prompt 16 consent is effective and unexpired;
- the request remains within call, time, input, and output limits;
- prompt-injection findings have not removed its permission.

Immediate-danger requests skip ordinary spiritual tools. Only the safety pipeline’s exact Scripture and crisis-resource reads are permitted. Memory and journey reads are denied during crisis routing. Unauthenticated or unconsented memory/journey requests return a sourced safe fallback without leaking whether a record exists.

All registry tools are read-only. `proposeJourneyAction` creates a proposal record but does not advance a journey. Draft tools do not save Journal, Testimony, Book, prayer, reflection, or memory records. Calling is never declared as fact. Testimony is never published. Promise fulfillment is never marked.

Confirmation uses a separate authenticated endpoint. It revalidates session, CSRF, consent, same-user authorization, source presence, expected revision, expiry, and Prompt 17 pre-write policy. The Prompt 18 confirmation result authorizes a later application action but performs no durable write itself.
