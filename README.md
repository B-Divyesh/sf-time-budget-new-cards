# Time Budget New Cards

Choose how many new flashcards fit a fixed daily study time. The planner is for Anki and CSV flashcard learners with mixed card difficulty.

Live product: <https://time-budget-new-cards.sociobot.in/>

One-click sample: <https://time-budget-new-cards.sociobot.in/demo/>

## What it does

- Reserves time for due reviews before allowing new cards.
- Lowers the new-card limit when cards are harder.
- Shows a cautious limit, likely range, expected time, and assumptions.
- Uses useful session history instead of starter assumptions after two logs.
- Imports the documented session CSV and supported Anki-style review rows.
- Exports one CSV row per session and a complete JSON backup.
- Restores settings and session history from that JSON backup.
- Keeps real settings and sessions after reload in the same browser.

The planner is free and requires no account. It does not connect to or change Anki or FSRS.

The site provides a standalone PWA manifest and install icons. The complete demo reloads offline after the first visit.

## Try the isolated demo

Open `/demo/` or choose “Try it with sample data” on the home page. It loads three realistic study sessions and a filled recommendation.

The banner remains visible while the demo is active. Demo changes stay in memory, save nothing, and never change real planner data.

Use “Reset demo” to restore the sample. Use “Start for real” to discard demo changes and open your real planner.

## Run locally

Node.js 20 or newer is required.

```bash
npm ci
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

The static deployment artifact is `dist/`. Deployment is handled by the factory; this repository does not manage DNS or infrastructure.

## Test

```bash
npm ci
npx playwright install chromium
npm test
npm run build
npm run test:e2e
```

Every public product claim is registered in [`.factory/claims.json`](.factory/claims.json). Run one declared claim with its recorded command, or run all claim tests with:

```bash
npm run test:claim
```

## CSV formats

The session format is:

```csv
date,total_minutes,reviewed_cards,new_cards,difficulty
2026-09-05,23,50,8,easy
```

Difficulty is `easy`, `mixed`, or `hard`.

Supported Anki-style rows need:

- a date column: `date`, `reviewed_at`, `timestamp`, or millisecond `id`;
- a duration column: `duration_seconds`, or millisecond `duration_ms` or `time`;
- a newness column: `is_new`, or Anki `type`, where `0` means new.

## Privacy and scope

Entered and imported study data is not sent off the product origin. The app loads no analytics, ads, tracking pixels, third-party scripts, or remote fonts.

“Erase local data” deletes real settings and study history from IndexedDB. Read the [privacy policy](https://time-budget-new-cards.sociobot.in/privacy/) and [terms](https://time-budget-new-cards.sociobot.in/terms/).

This is a planning estimate, not a learning or medical prescription. It does not promise learning outcomes.

## Product records

- [Researched brief](.factory/brief.json)
- [Visual system and asset provenance](.factory/design.md)
- [Demo sandbox](.factory/demo.md)
- [Current handoff](.factory/handoff.md)

## License

MIT. See [LICENSE](LICENSE).
