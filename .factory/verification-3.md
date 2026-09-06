# Choose how many new cards fit today — independent verification 3

## Verdict

**PASS — zero findings and zero untested public claims.**

- Reviewed implementation: `4083790fa39fa6d025e8a6b3a2c6ffe44da01159`
- Verification-test revision: `de7af71`
- Documentation revision: `7a9e7fac467b6d3ae5cd844a780247002bcfc3e6`
- Live URL: <https://time-budget-new-cards.sociobot.in/>
- Reviewed: 2026-09-06 UTC
- Product type: static, local-first PWA. Backend tenant, SQLite, restart, health, and rate-limit checks do not apply.

## First screen

Job: choose how many new cards fit today within a study-time budget.

Audience: Anki and CSV flashcard learners with mixed card difficulty.

First action before scrolling: **Try it with sample data**. It is visible on fresh desktop and Pixel 5 pages. The adjacent text says that it loads three sample sessions and a result. The screen also states that study data stays here, works offline after one visit, and is free to use.

The desktop and 393 px phone page have no horizontal overflow. On the phone the heading, audience sentence, sample action, and facts fit in the initial viewport. Visual review found the planner, form controls, sample result, history, import/export controls, legal links, and footer readable and intact at both sizes.

## Product checks

- A fresh desktop browser opened `/demo/?sample=1` after one click. It showed the persistent **“Demo — sample data, nothing is saved”** label, three realistic sessions, and a cautious limit of 6.
- Changing the demo and selecting **Reset demo** restored the 25-minute sample. The declared isolation test also created real data, changed and reset the demo, then returned to unchanged real data. Demo state never opened the real IndexedDB database.
- A one-minute budget with 9,999 due reviews produced a zero limit and the explained review-reserve reason.
- An invalid `-1` time budget set `aria-invalid`, showed the associated live corrective message, kept the last valid result, and recovered after entering 30.
- The browser flow covered invalid CSV and JSON recovery, valid session and Anki-style imports, exports and backup restore, deletion confirmation, local persistence, unavailable browser storage, keyboard use, reflow, focus, reduced motion, service-worker update activation, and erase-local-data deletion. The clean browser suite passed 66/66 tests.
- The live home, demo, privacy, and terms routes returned 200. Privacy and terms had route-specific titles, one heading, one main landmark, shared navigation, and the privacy request email. The unknown live route returned the intentional HTTP 404 with the styled recovery page and a working planner link.
- Every normal product request captured during the live demo flow was same-origin. The live request/asset audit found no third-party scripts, fonts, analytics, ads, or trackers.
- The live sample completed a cold offline reload after service-worker control and ordinary HTTP-cache clearing: banner present, three sessions present, offline status present, zero failed JavaScript/CSS assets, and zero console/page errors.
- Live desktop axe had zero violations, including zero serious or critical violations. The required URL smoke check passed with title, `lang`, one heading, main landmark, image alternatives, labeled buttons, and no console errors. The standalone axe CLI could not start this container's mismatched ChromeDriver; the repository's Playwright axe integration and the independent live Playwright axe check both ran successfully.
- A fresh reduced-motion context returned `transition-duration: 1e-05s` and `transform: none` for the sample action.
- Every ordinary internal route/link returned 200, as did the labelled GitHub source link. The CSV template is a deliberate `data:` download. The 404 page's own fragment-only skip link retains its expected 404 document status; the page itself is deliberately valid recovery content.

## Claims and clean checkout

A separate clean clone at `7a9e7fa` was used. `npm ci` installed 61 packages with 0 vulnerabilities.

| Check | Result |
| --- | --- |
| `npm test` | Pass, 13/13 |
| `npm run build` | Pass; `dist/index.html` at the artifact root |
| Every command declared in `.factory/claims.json` | Pass, 19/19 individually |
| `npm run test:claim` coverage represented by those commands | Pass, 19/19 tagged claim tests |
| `npm run test:e2e` | Pass, 66/66 desktop and mobile tests |
| Live `verify-url.sh` | Pass |
| Live Playwright axe | Pass, 0 violations |

No claim command was missing, false, incomplete, or untested. Public claims on the landing page, legal pages, and README map to the 19 registered claims or are non-promissory scope disclosures.

The production build contains 29 files, including deployment-only `staticwebapp.config.json`. The other 28 files matched the live artifact byte-for-byte by SHA-256. The only changes after the implementation candidate are the service-worker update test and documentation; no deployable product file changed after `4083790`.

The fresh Lighthouse command could not complete in this container because Chromium crashed during Lighthouse startup. This is an environment runner failure, not a product failure: live Playwright and the URL smoke check both launched the same supplied Chromium successfully, and the product's documented prior live Lighthouse evidence remains 100/100/100/100. It is not a public product claim and does not leave a claim untested.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Missing one-click isolated demo | Fixed and independently exercised. |
| Missing claim registry and tagged tests | Fixed; all 19 declared commands passed individually. |
| Metaphor-led first screen and missing price fact | Fixed; current first screen uses the job, audience, action, and three facts. |
| Silent invalid planner values | Fixed; visible, associated, announced error and recovery confirmed. |
| Missing designed HTTP 404 | Fixed; live unknown route returns 404 and a recovery page. |
| Small touch targets and weak focus | Fixed; desktop/mobile tests cover 44 px targets and designed focus. |
| Incomplete route metadata and legal structure | Fixed; live legal route checks and link crawl passed. |
| Inaccurate erase statement and no privacy request path | Fixed; database deletion claim and privacy email path passed. |
| Manifest MIME advisory | Fixed; live manifest is `application/manifest+json`. |
| Cold offline app shell omitted JavaScript/CSS | Fixed; cold offline reload passed with no failed shell assets. |
| Immutable caching and security headers | Fixed; live headers include immutable hashed assets, CSP, frame protection, permissions policy, nosniff, and referrer policy. |

## Remaining limits

The product does not claim the brief's 30-day learner outcome; that needs a real pilot. It intentionally has no cross-device sync, account, or billing. Supported Anki-style CSV columns are documented; other export formats may need conversion to the included template.
