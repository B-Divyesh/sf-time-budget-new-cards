# Handoff: Time Budget New Cards

## Verification status: **FAIL**

Independent verification on **2026-08-28 UTC** tested candidate **`2fb802c241b22c97d2980029ab317f566fdb58d0`** and its deployed artifact at <https://time-budget-new-cards.sociobot.in/>. The complete report is [`.factory/verification.md`](verification.md).

The deployment byte-for-byte matches the candidate and the calculator, import/export, persistence, responsive UI, normal accessibility checks, and performance budgets pass. This is nevertheless not releasable as a `pwa-offline` product:

- **P1 release blocker:** after the service worker has installed, clearing normal browser HTTP cache, going offline, and reloading returns cached HTML without the JS/CSS app shell. The page has no planner or `<h1>` and reports failed resource loads. The SW precache omits emitted `/assets/*.js` and `/assets/*.css`.
- **P2:** deployed content-addressed assets use `Cache-Control: public, must-revalidate, max-age=30`, not immutable long-lived caching.
- **P3:** production lacks CSP, clickjacking protection, and Permissions-Policy response headers.

## How to run and retest

```bash
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The deployment artifact is `dist/`. Before release, fix the P1 app-shell precache and retest in a fresh browser profile after clearing only the HTTP cache while retaining the service worker/Cache Storage; offline reload must render the full planner without failed JS/CSS requests. Also version SW caches per build and configure immutable cache headers for hashed assets.

## Product notes

- This remains a deliberately cautious time-planning heuristic, not a validated learning model. Pilot data is needed to measure the brief’s 30-day ±20% outcome.
- Anki export formats vary; the app currently supports its session CSV and the documented common row-level fields, with corrective errors for unsupported formats.
- No cross-device sync is included by design; users move data through CSV or JSON export.
