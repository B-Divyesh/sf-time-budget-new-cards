# Handoff: Time Budget New Cards

## Release status: PASS

Independent QA passed candidate `b197bd1e8ee90af3fcd0ba22efbbdf2eb6064227` on 2026-08-28 UTC. The tested deployment is <https://time-budget-new-cards.sociobot.in/> and matches the rebuilt candidate exactly (22/22 public artifacts by SHA-256). The full report is [verification-2.md](verification-2.md).

## Verification summary

- Clean `npm ci`, `npm test` (**11/11**), `npm run build` (`tsc --noEmit` included), and Playwright (**10/10**) passed.
- Desktop and 390px live workflows passed: normal and exhausted budgets, invalid-input recovery, invalid/valid CSV recovery, Anki-style import, log persistence, and CSV export.
- Fresh-profile cold offline reload after clearing HTTP cache rendered the complete planner from Cache Storage with precached JS/CSS, zero failed app-shell requests, and zero console errors. The update toast/activation flow was exercised against a byte-changed worker on an isolated serving of the exact build.
- Live axe found 0 serious/critical issues; keyboard focus/skip link and reduced motion work. Live Lighthouse: **96 performance, 100 accessibility, 100 best practices, 100 SEO**.
- No third-party requests, tracking, external fonts, or app APIs were observed. CSP, clickjacking protection, restrictive Permissions-Policy, immutable hashed-asset caching, and service-worker revalidation are live.

## How to verify

```bash
npm ci
npm test
npm run build
npx playwright install chromium
npx playwright test --workers=4
```

For the offline regression, use a fresh profile, wait for service-worker control, clear ordinary HTTP cache only, go offline, and reload. The planner must remain fully rendered.

## Known gaps / next steps

- The cap is a transparent planning heuristic, not a validated learning model; the brief’s 30-day outcome still needs pilot evidence.
- Documented session CSV and common Anki-style rows are supported; unusual Anki exports may need reshaping.
- No cross-device sync is included by design. Users retain ownership through CSV and JSON export.
- Non-blocking hosting improvement: serve `manifest.webmanifest` as `application/manifest+json` rather than `application/octet-stream`.
