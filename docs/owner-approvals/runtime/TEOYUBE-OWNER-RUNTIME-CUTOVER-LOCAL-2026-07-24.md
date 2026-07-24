# Teoyube owner runtime decision

Owner decision ID: `TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24`

Recorded at: `2026-07-24T16:12:09.6547107Z`

## Stage 0 decision

The owner selected option 1 in Prompt 22 and authorized the repository/local
canonical runtime to switch from the protected static Node application to the
verified Next application, subject to the complete candidate gate and a second
explicit owner confirmation.

Scope: repository/local canonical runtime only

Public deployment: not authorized

Gate C-Production: closed

Static rollback: required and protected

Prompt 23: locked

## Boundaries

This decision authorizes runtime commands, safe runtime metadata, legacy URL
compatibility, dual-runtime verification, and the documentation needed for the
local cutover. It does not authorize a public deployment, DNS or hosting
changes, production service enablement, visual or product changes, baseline
updates, CSS consolidation, static-runtime deletion, or archive work.

Checked-in live-AI and vector-retrieval defaults must remain disabled. The
original static application must remain available through one explicit rollback
command and without an internet dependency.

## Final confirmation

Status: pending

The final local runtime cutover is not approved by this Stage 0 decision alone.
After the complete automated gate passes and both dedicated local review
runtimes are available, the owner must separately approve or reject the
candidate.
