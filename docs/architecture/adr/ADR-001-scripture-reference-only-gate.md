# ADR-001: Keep Scripture retrieval reference-only until corpus rights are approved

- Status: Accepted for the Prompt 15 blocker path
- Date: 2026-07-20
- Scope: Scripture domain and server infrastructure only

## Context

The workspace contains extensive Scripture reference metadata but no complete translation corpus with recorded provenance, version, checksum, attribution, and owner-approved display rights. It also contains three isolated KJV text excerpts in a legacy TIG seed. Their upstream source and display-rights evidence are not recorded.

## Decision

Create one typed repository and deterministic parser, register every local source, expose bare references only, and block all exact text, context, excerpt, and quotation-validation claims. Treat the three KJV excerpts as `DISPLAY_BLOCKED_LICENSE_UNKNOWN`. Do not infer public-domain permission from the label `KJV` or from file presence.

## Consequences

- References can be parsed, normalized, searched, bounded, and passed through typed server contracts.
- No result may be labeled a validated Scripture quotation.
- Existing visible quotations remain legacy behavior protected by the visual source of truth and are recorded as an unresolved migration blocker.
- Prompt 15 cannot pass and Prompt 16 cannot unlock until an approved complete corpus is supplied.
