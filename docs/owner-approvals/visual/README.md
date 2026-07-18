# Visual Change Approval Records

Teoyube's original rendered interface is protected. A coding agent may prepare a change request, but only the owner may approve it.

A valid approval is narrowly scoped and must contain all fields below:

```text
Approval-ID: TEO-VIS-YYYYMMDD-NNN
Decision: APPROVED
Approved-By: <owner name or owner-controlled identifier>
Approved-At: <ISO-8601 timestamp>
Scope: <exact files, selectors, assets, routes, and states>
Reason: <owner rationale>
Expiration-or-Release: <optional boundary>
```

The approval must also include before and proposed-after screenshots, affected viewport states, functional impact, alternatives considered, and rollback steps.

Rules:

- An agent may create a request from `VISUAL_CHANGE_REQUEST_TEMPLATE.md`.
- An agent must leave all approval fields unapproved and stop.
- An agent may not edit an owner decision after it is written.
- Approval for one page or selector does not apply to any other page or selector.
- Updating a screenshot baseline is itself a visual change and requires approval.
