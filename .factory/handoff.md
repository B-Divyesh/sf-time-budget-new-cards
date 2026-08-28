# Handoff: Time Budget New Cards

## Release status: PASS

This repair addresses the independent verification report for candidate `2fb802c241b22c97d2980029ab317f566fdb58d0` (report commit `bbc114160d3c46fcf4b75ebec585781cf3a373b5`). The deployed repair is commit `e97ee4d` on `main`, live at <https://time-budget-new-cards.sociobot.in/>.

## What changed

- Replaced the fragile hand-maintained service-worker precache list with a Vite build plugin that reads the final `dist/assets/` output and writes `/sw.js` with every emitted JS and CSS asset. The cache namespace is derived from the full generated shell, so each changed build gets a new cache.
- Made same-origin app-shell cache lookup Vary-insensitive so a precached asset continues to work across static hosts that attach `Vary` response headers.
- Kept the connectivity indicator honest offline without a failed console request: the worker returns a marked local response when its uncached connection probe cannot reach the network.
- Added `staticwebapp.config.json` for immutable content-addressed asset caching, revalidated HTML/service-worker caching, CSP, clickjacking protection, and restrictive Permissions-Policy.
- Added regressions for the deployment header policy and a fresh-profile offline reload after CDP HTTP-cache clearing. The browser test asserts precached JS/CSS, full planner rendering, no failed app-shell asset requests, and no console errors. Keyboard skip-link and field traversal are also covered.

## Verification evidence

Completed on 2026-08-28 UTC:

- Clean install: `npm ci` passed; 60 packages installed and `npm audit` reported 0 vulnerabilities.
- Unit/integration: `npm test` passed, **11/11** tests.
- Type/lint/build: `npm run build` passed (`tsc --noEmit` included). `dist/index.html` is at the artifact root. Main JS is **26.96 KB raw / 9.81 KB gzip**; CSS is **13.79 KB raw / 3.95 KB gzip**, below the static budgets.
- Browser: `npm run test:e2e` passed, **10/10** across Desktop Chrome and Pixel 5. It covers calculation, IndexedDB persistence, legal pages, exact cold-offline app-shell recovery, keyboard traversal, and axe serious/critical checks.
- Accessibility: local axe reports no serious/critical violations; keyboard starts at the visible skip link and reaches the budget field; the live smoke check found title, `lang`, one `h1`, `main`, labeled buttons, and image alt text with no browser errors.
- Responsive/live: a fresh 390×844 mobile context had no horizontal overflow. The cold-offline reload (after HTTP-cache clearing but preserving Cache Storage/service worker) rendered “Make new cards fit today’s tape,” showed Offline status, had precached JS and CSS, and had **0** failed app-shell assets and **0** console errors.
- Privacy: live request capture observed only `https://time-budget-new-cards.sociobot.in`; no third-party scripts, fonts, APIs, analytics, or tracking requests were made.
- Response policy: live HTML is `public, max-age=0, must-revalidate`; hashed JS is `public, max-age=31536000, immutable`; `/sw.js` is `no-cache, must-revalidate`. Live responses include CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, and restrictive Permissions-Policy.
- Live identity: SHA-256 comparison of all **22** deployable files in `dist/` against the production URL found **0 mismatches**.
- Lighthouse mobile: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP **0.9 s**, LCP **1.7 s**, TBT **110 ms**, CLS **0**. Lighthouse printed a post-audit Chromium target-crash message in this container but wrote a complete report with those scores.

## How to run and verify

```bash
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

For the release-blocker regression, use a fresh browser profile, load `/` until `navigator.serviceWorker.controller` exists, clear only the browser HTTP cache with CDP, set the context offline, and reload. The complete planner must render from the versioned Cache Storage shell with no JS/CSS failures.

## Known gaps / next steps

- The cautious cap remains a planning heuristic, not a validated learning model. Pilot data is still required to measure the brief’s 30-day ±20% success outcome.
- Anki export variations outside the documented CSV and common row-level fields still require reshaping before import.
- No cross-device sync is included by design; people retain ownership through CSV and JSON export.
