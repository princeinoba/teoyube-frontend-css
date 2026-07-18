# Phase 11.5 Preference Learning Preview Report

Preference learning is implemented as a local/session-only preview. It is not hidden tracking and does not write to browser storage.

## Sources

Soft hints can come from:

- Saved Scriptures
- Saved Teoyube words
- Saved promise clusters
- Saved journeys
- Completed actions
- Saved prayers
- Teo Guide response saves
- Explicit feedback controls

## Recommendation Flow

`generateJourney()` now builds a baseline recommendation first. If personalization is enabled and useful hints exist, it builds a personalized preview and records:

- Standard Scripture Path
- Personalized Preview
- Hints considered
- Preserved baseline Scripture
- Confidence comparison
- Fallback comparison
- Explanation path
- Warnings when Scripture anchor or fallback changes

## Safety Boundary

The personalized preview cannot hide the standard result, remove Scripture anchors, claim certainty, or override safety/fallback logic.
