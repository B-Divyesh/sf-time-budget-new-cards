# Time Budget New Cards

Time Budget New Cards (“Study Tape”) is a free, offline-first companion for Anki and CSV flashcard learners. It answers a practical question before a session begins: **how many new cards can I safely introduce inside the minutes I have today?**

Live: <https://time-budget-new-cards.sociobot.in>

## What it does

- Reserves time for already-due reviews.
- Estimates marginal time per new card, adjusted for easy, mixed, or hard material.
- Shows a cautious cap, a likely range, and the assumptions behind both.
- Learns from session history you log or import from CSV/Anki-style review rows.
- Stores everything locally in IndexedDB; no account, tracking, or network service is used.
- Exports session CSV and a full JSON backup.
- Installs as a PWA and continues working offline.

This is a time-planning estimate, not a learning or medical prescription. It does not change the Anki/FSRS scheduler.

## Run locally

Requires Node.js 20 or newer.

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. For a production-like run:

```bash
npm run build
npm run preview
```

The deployment artifact is `dist/`, with `dist/index.html` at its root.

## Test

```bash
npm test
npx playwright install chromium  # first run only
npm run build
npm run test:e2e
```

Unit tests cover the time model and both CSV formats. Playwright covers desktop/mobile calculation, local persistence, legal routes, accessibility, and a real offline reload.

## CSV formats

The session format is the most reliable import:

```csv
date,total_minutes,reviewed_cards,new_cards,difficulty
2026-08-27,20,45,8,mixed
```

Difficulty is `easy`, `mixed`, or `hard`. The importer also accepts row-level Anki-style data with:

- a date column: `date`, `reviewed_at`, `timestamp`, or millisecond `id`;
- a duration column: `duration_seconds`, or millisecond `duration_ms`/`time`;
- a newness column: `is_new`, or Anki `type` (`0` means new).

## Privacy and design

All entered data stays in the current browser unless the user exports it. See [/privacy](https://time-budget-new-cards.sociobot.in/privacy/) and [/terms](https://time-budget-new-cards.sociobot.in/terms/).

The product contract lives in [`.factory/brief.json`](.factory/brief.json), the cassette-zine visual system and generated-art provenance in [`.factory/design.md`](.factory/design.md), and verification notes in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT. See [LICENSE](LICENSE).
