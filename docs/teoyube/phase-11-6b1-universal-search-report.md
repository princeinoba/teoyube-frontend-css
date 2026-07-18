# Phase 11.6B.1 Universal Search Report

The new local index covers Teoyube words, Scripture anchors, promise clusters, prayer frameworks, action steps, Canon/current journeys, calling context, milestones, Book entries, Promise Table items, testimonies, and reviewed imported media when it eventually exists.

Helpers build/refresh the index, tokenize, score, suggest, group, filter, and open results. Supported data filters include type, Bible book, Scripture, category, word, promise cluster, journey, calling, saved state, and media availability. The current Search Everything dialog exposes the high-value type filter while the API supports the full set.

Input is debounced by 140 ms. The index rebuilds on explicit refresh or state-changing actions, not each keystroke. Sample manifest records are excluded, and a zero-media search returns a safe empty result rather than failing.
