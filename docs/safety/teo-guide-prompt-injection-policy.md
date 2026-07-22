# Teo Guide prompt-injection policy

User text, retrieved local data, and approved memory content are data, never instructions. They cannot:

- change the system or theology policy;
- name or add tools;
- expand authentication, consent, or cross-user access;
- request secrets, hidden prompts, source code, or raw telemetry;
- bypass Scripture validation or crisis ordering;
- authorize durable writes;
- enable a model, embedding service, vector store, broad RAG, or external provider.

The Prompt 17 injection detector runs before tool execution. An injection finding removes all ordinary tool permissions; exact safety Scripture and a crisis resource remain the only possible reads when applicable. Retrieved tool outputs have trust labels and are used only through fixed field mappings. They are not concatenated into a new executable prompt.

Post-composition validation scans the final response for injection artifacts, prohibited theological claims, unauthorized tool/write claims, citation failure, coercion, victim blame, care replacement, missing uncertainty, and missing human escalation. A failed response is not returned as guidance.

Regression coverage includes policy override, hidden-prompt exfiltration, arbitrary-tool requests, consent bypass, cross-user access, fabricated Scripture, crisis bypass, and durable-write attempts.
