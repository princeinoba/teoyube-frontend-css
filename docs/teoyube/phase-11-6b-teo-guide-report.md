# Phase 11.6B Teo Guide Report

## Upgrade
Teo Guide now uses selected app context from Today, Search, Promise Table, Calling Compass, Graph, Book, and Lexicon.

Added controls:
- save response
- save prayer
- add reflection
- copy response
- clear chat

## Local Response Behavior
Responses continue to come from `composePhase116TeoGuideResponse`, not live AI. Each response includes:
- Scripture anchor
- promise cluster
- related Teoyube word
- prayer
- next faithful step
- why-this trace
- confidence/quality context
- fallback reason when needed

## Safety
No OpenAI/live AI call, account, analytics, persistence, or external service was added. Raw private text is not written to browser storage.
