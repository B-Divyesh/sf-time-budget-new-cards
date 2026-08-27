# Handoff: Time Budget New Cards

## What shipped

- A complete responsive planner for turning a daily minute budget, due-review count, average review speed, and new-material difficulty into a cautious new-card cap.
- Transparent output: expected session time, likely range, confidence stage, marginal seconds per new card, uncertainty, and the reason for a zero-card recommendation.
- Personal calibration from logged sessions, optional manual pace correction, deletion with confirmation, and up to 30 visible recent sessions.
- CSV import for Study Tape sessions and Anki-style row history; CSV export, full JSON backup/restore, and validated imports.
- IndexedDB persistence with no account or network data submission.
- Installable offline PWA with versioned shell/runtime caches, offline fallback, connection state, and a user-controlled update toast.
- Dedicated privacy and terms pages.
- Original cassette-era zine visual system, generated hero illustration, and authored cassette icons. Provenance and the full prompt are in `.factory/design.md` and `assets/src/study-tape.prompt.json`.

## How to run and verify

```bash
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Deployment output is exactly `dist/`; `dist/index.html` is present at its root.

Verification performed on 2026-08-27:

- `npm test`: 9/9 unit tests pass.
- `npm run build`: pass; production JS 26.88 KB raw / 9.77 KB gzip, CSS 13.79 KB raw / 3.95 KB gzip.
- `npm run test:e2e`: 8/8 Chromium tests pass across desktop and Pixel 5 profiles.
- Offline test: after an online install/load, Playwright switches the browser context offline, reloads, finds the full planner, and confirms the offline state.
- axe-core through Playwright: no serious or critical violations on desktop or mobile.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 1.0 s, LCP 1.8 s, TBT 60 ms, CLS 0.
- Visual review: full-page 1440px and Pixel 5 captures checked for clipping, hierarchy, responsive stacking, and hero artifacts.
- Hero payload: AVIF 45 KB, WebP 80 KB, PNG fallback 245 KB; all stay below the 300 KB hero limit.

## Known gaps / next steps

- The recommendation is an intentionally conservative heuristic, not a validated learning model. Pilot data is still needed to measure the brief’s 30-day ±20% success target and tune defaults.
- Anki exports vary by add-on and locale. The importer covers documented session CSV plus common `id/date`, `time/duration_*`, and `type/is_new` columns; unsupported exports receive a corrective error and can be reshaped with the downloadable template.
- No cross-device sync is included by design. Users move data with JSON backups or CSV exports.
