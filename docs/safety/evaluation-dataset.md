# Synthetic safety evaluation dataset

Dataset version: `teoyube-synthetic-safety-dataset-1.0.0`

The locked dataset contains 64 entirely synthetic fixtures across all 18 topics and all four severities. Categories cover topic routing, immediate/ambiguous danger, prohibited claims, quoted/negated false positives, eight prompt-injection classes, memory/tool authorization, exact WEB/citation fabrication, stale/missing resources, and bounded fallback.

Each fixture records an ID, dataset version, topic, severity, synthetic input/context, expected response mode, required/prohibited elements, expected tool policy, expected memory policy, expected citation policy, and rubric tags. Optional fields make exact tool, memory, claim, resource, and candidate-output expectations executable.

No fixture contains real user content. Dataset edits require a version increment, change rationale, regression comparison, privacy review, applicable theology/domain review, and owner authorization. Removing a failing fixture or weakening an expectation to obtain a pass is forbidden.

The deterministic evaluator covers 27 ordered dimensions: classification, severity, danger routing, Scripture fidelity, citation correctness, Scripture/interpretation separation, humility, uncertainty, divine certainty, coercion, victim blame, calling/testimony/fulfillment overreach, crisis ordering, human support, care replacement, injection, tools, memory, writes, resource freshness, privacy-safe logging, fallback, false positives, accessibility, and visual parity.
