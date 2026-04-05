---
name: Project Context
description: ScreamingWeb project basics — tech stack, architecture, conventions
type: project
---

ScreamingWeb: mini Screaming Frog SEO crawler. Next.js 16 App Router, TypeScript strict, Cheerio for HTML parsing.

**Architecture:** BFS async generator pattern in `crawler/` module. Shared types in `lib/types.ts`. Crawler-internal types in `crawler/types.ts`. Session store for crawl state. API routes use SSE streaming.

**Plan:** 9-phase implementation in `plans/260404-2111-screaming-web-implementation/`. Phase 2 (BFS core) reviewed 2026-04-04.

**Key convention:** Files under 200 lines. No `any`. No `useEffect` (this is server-side code). Kebab-case file names.

**Phase 4 (UI)** reviewed 2026-04-05: SSE streaming hook + crawl form + progress + summary + page orchestrator. Key issues: error path parsing mismatch, stream-without-terminal-event guard needed, O(n^2) results array in setState.

**Phase 7 (Export)** reviewed 2026-04-05: CSV/JSON export via Blob download, format helpers, useExport hook. Clean implementation. Issues: CSV escape misses `\r`, empty seedUrl guard needed, unused Download import, format.ts is dead code, no UTF-8 BOM for Excel. Store cleanup was already implemented in prior phase.

**Phase 8 (Docker)** reviewed 2026-04-05: Dockerfile multi-stage build with Playwright. Critical bug: `PLAYWRIGHT_BROWSERS_PATH=0` resolves to `<pkg-root>/.local-browsers` but browsers copied to `/home/pwuser/.cache/ms-playwright`. Fix: remove the env var, let Playwright use default cache path. Other issues: health check does not verify Chromium, consider `--only-shell` for smaller image.

**How to apply:** When reviewing later phases, check for: (1) SSRF protections should be in place before exposing crawler to user input, (2) content-type filtering should be consistent across modules, (3) async generator should propagate errors, not swallow them, (4) SSE consumers need post-loop terminal state guards, (5) avoid unbounded array spreading in streaming hooks, (6) CSV generation must handle \r as well as \n, (7) new URL() calls on user-derived strings need try/catch or guards, (8) PLAYWRIGHT_BROWSERS_PATH=0 means "<playwright-core>/../../../.local-browsers" NOT the default cache, (9) silent null returns from Playwright hide browser-missing failures.
