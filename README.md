# ClaudeWeaver

Privacy-first browser extension that prevents context window degradation by threading Claude conversations.

ClaudeWeaver deterministically splits Claude conversations after every 2nd user interaction, generates intelligence briefs via Sonnet, preserves artifacts, and presents the multi-conversation sequence as a single continuous thread.

## Status

**Phase 0** — Scaffold + DOM audit complete. Shared types, storage, and selector abstraction implemented.

## Architecture

- **Firefox MV2 + Chromium MV3** dual-target build
- **Hybrid DOM + API** — DOM for interaction, single API call for content extraction
- **No backend server** — all orchestration client-side via content scripts + service worker
- **No API key required** for core functionality (Option C: Sonnet in sidebar zone)
- **Deterministic splitting** — interaction counter, not token estimation

## Build

```bash
npm install
npm run build          # Both targets
npm run build:firefox  # Firefox only
npm run build:chrome   # Chrome only
npm run dev            # Dev mode with watch
```

## Project Structure

```
src/
├── shared/           # Types, storage, messages, constants (selector map)
├── content/          # Content scripts: observer, injector, selectors, stitcher
├── background/       # Service worker (MV3) / background script (MV2)
├── sidebar/          # Thread navigator + replay zone UI
├── manifest.v2.json  # Firefox
└── manifest.v3.json  # Chromium
```

## License

MIT
