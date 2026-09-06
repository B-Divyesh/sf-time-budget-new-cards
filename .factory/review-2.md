# Choose how many new cards fit today — strict review 2

## Verdict

**PASS — zero findings of every severity and zero untested public claims.**

- Implementation candidate: `4083790fa39fa6d025e8a6b3a2c6ffe44da01159`
- Verification-test revision: `de7af710615d571e84cfd41f0ca97bd38219c224`
- Documentation baseline reviewed: `c7f844ab7b38af0c4430fed360748b4d8e2fbfa5`
- Live URL: <https://time-budget-new-cards.sociobot.in/>
- Reviewed: 2026-09-06 UTC
- Product class: static, local-first PWA. Backend tenant, SQLite, restart, health, and 429 checks do not apply.

The only files after the implementation candidate are the service-worker update test and reports. No deployable product file changed. A clean build produced 29 files; all 28 files that should be served matched the live deployment byte-for-byte. `staticwebapp.config.json` is deployment-only.

The named external evidence path `factory-evidence/time-budget-new-cards-verify-3/qa-report.md` was not mounted anywhere in this worker. The full repository report `.factory/verification-3.md`, all earlier review and verification reports, and the assignment's authoritative zero-finding summary were read. This review then repeated the product and claim checks independently.

## First screen before scrolling

Job: choose how many new cards fit today within a fixed study-time budget.

Audience: Anki and CSV flashcard learners who need a safe limit despite mixed card difficulty.

First action: **Try it with sample data**. The adjacent line says it loads three sample sessions and a result.

Fresh 1440×900 desktop and 393×727 phone contexts showed the job, audience, first action, and three facts before scrolling. The facts say study data stays here, the app works offline after one visit, and it is free. The phone had no horizontal overflow. Visual inspection found the desktop and phone layouts readable, intact, and consistent with the product's documented cassette-zine system.

## Live product evidence

- The one-click action opened `/demo/?sample=1`, showed the persistent **“Demo — sample data, nothing is saved”** label, loaded three realistic sessions, and recommended 6 new cards with a likely range of 6–8.
- A real 41-minute plan and a real 19-minute session were created first. Demo changes produced a fourth row, **Reset demo** restored the 25-minute, three-session sample, and **Start for real** returned to the unchanged 41-minute real plan and its one real session. No sample row entered real storage.
- The sample label and **Reset demo** and **Start for real** controls stayed visible after scrolling. On the phone, the populated six-card result moved into the viewport after the one-click action.
- A one-minute budget with 9,999 due reviews produced a limit of 0 and explained that due reviews fill the budget.
- Entering `-1` marked the budget invalid, associated a visible corrective message, announced that the result was not updated, and recovered after entering 30.
- Invalid CSV showed a specific recognition error. A subsequent valid session CSV imported successfully. The clean browser suite also covered invalid JSON recovery, Anki-style import, backup restore, exports, delete confirmation, blocked storage, and data erasure.
- First Tab focused the visible skip link. Keyboard activation reached the sample action. The reduced-motion context reported `transition-duration: 1e-05s` and `transform: none`.
- Fresh live axe checks on home, demo, privacy, terms, and the designed not-found page found 0 violations. The standard URL verifier passed with one heading, one main landmark, `lang=en`, image alternatives, labeled buttons, and no normal-load console errors.
- Home, demo, privacy, and terms returned 200 with distinct titles. The unknown route deliberately returned HTTP 404, displayed “This page was not found,” and linked back to the planner. Chromium logged the expected failed-document 404 entry; the recovery page itself rendered and passed axe.
- The privacy page provides `privacy@sociobot.in`. Normal live flows issued no off-origin network requests, sent no entered CSV content, loaded no remote fonts or scripts, and set no application cookie.
- Every ordinary link returned 200, including the labeled GitHub source link. The CSV template is an intentional `data:` download and the privacy address is an intentional `mailto:` link.
- A fresh service-worker context loaded the demo, cleared ordinary HTTP cache, went offline, and reloaded the complete three-session result. Cache Storage contained the versioned shell with one JavaScript and one CSS asset. There were no failed shell assets or console/page errors.
- The clean suite induced a changed service worker, showed the update notice, activated it on request, and reloaded the app. This is the safe way to test the promised update path without altering production.

## Claims and clean checkout

A separate remote clone was detached at `c7f844ab7b38af0c4430fed360748b4d8e2fbfa5`. `npm ci` installed 61 packages, audited 62 packages, and found 0 vulnerabilities.

Every command in `.factory/claims.json` was run separately and exactly as declared:

| Claim | Result |
| --- | --- |
| `demo-isolation` | Pass |
| `review-reserve` | Pass |
| `difficulty-adjustment` | Pass |
| `cautious-output` | Pass |
| `history-learning` | Pass |
| `local-persistence` | Pass |
| `session-csv-import` | Pass |
| `anki-csv-import` | Pass |
| `csv-export` | Pass |
| `json-backup` | Pass |
| `json-import` | Pass |
| `csv-template` | Pass |
| `pwa-install` | Pass |
| `offline-reload` | Pass |
| `free-no-account` | Pass |
| `local-data` | Pass |
| `no-tracking` | Pass |
| `erase-local-data` | Pass |
| `no-scheduler-access` | Pass |

Result: **19/19 individual claim commands passed.** Each registered claim has one uniquely tagged outcome test. The landing page, legal pages, README, and visible application copy were cross-checked against the registry. No false, incomplete, missing, or unlisted public claim was found.

## Quality gates

| Check | Result |
| --- | --- |
| `npm ci` in a clean checkout | Pass; 0 vulnerabilities |
| `npm test` | Pass; 13/13 |
| `npm run build` | Pass; `dist/index.html` at the artifact root |
| Every declared claim command | Pass; 19/19 individually |
| `npm run test:e2e` | Pass; 66/66 desktop and phone tests |
| Live `/opt/fleet/lib/verify-url.sh` | Pass; 786 ms navigation in its run |
| Fresh live Playwright axe | Pass; 0 violations on five routes |
| Live route and link crawl | Pass; deliberate 404 classified correctly |
| Live cold-offline reload | Pass; complete sample and no failed shell assets |
| Live artifact comparison | Pass; 28/28 served files match |
| Main JavaScript | 33.64 KB raw / 11.38 KB gzip |
| Main CSS | 16.67 KB raw / 4.45 KB gzip |

A fresh Lighthouse command did not exit successfully: Chromium returned `TARGET_CRASHED` during the final `FullPageScreenshot` artifact. The written partial report had already gathered 100 performance, 100 accessibility, 100 best practices, and 100 SEO, with FCP 0.9 s, LCP 1.0 s, TBT 0 ms, and CLS 0. The command failure is preserved in evidence and is not reported as a completed Lighthouse run. Live Playwright, axe, the URL verifier, size checks, and the prior completed 100/100/100/100 live run provide independent coverage. Lighthouse scores are not a public product claim, so this runner failure leaves no claim untested.

## Headers, privacy, and installability

- HTML uses `max-age=0, must-revalidate`; hashed JavaScript and CSS use one-year immutable caching; `sw.js` is not cached.
- The manifest returns `application/manifest+json` and declares standalone display plus install icons.
- Live responses include CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, HSTS, `nosniff`, a restrictive Permissions-Policy, and a referrer policy.
- The application needs no account, payment, server, shared database, analytics, ads, or third-party runtime asset.
- AI is not missed leverage for this deterministic planning job. The brief calls for a transparent local estimate and import/export, both of which are present; adding a model would weaken offline operation and explainability.

## Earlier findings

| Earlier item | Current disposition |
| --- | --- |
| Cold offline shell omitted JavaScript and CSS | Fixed; fresh live cold reload passed with cached JS and CSS. |
| Hashed assets lacked immutable caching | Fixed; live assets use one-year immutable caching. |
| CSP, clickjacking protection, and Permissions-Policy were absent | Fixed; all are present live. |
| Manifest used the wrong MIME type | Fixed; live type is `application/manifest+json`. |
| One-click isolated demo was missing | Fixed; sample, label, reset, exit, and real-data isolation passed live. |
| Claim registry and tagged claim tests were missing | Fixed; all 19 commands passed individually. |
| First-screen copy used metaphors and omitted audience/price | Fixed; current first screen states the job, audience, action, privacy, offline use, and free price. |
| Invalid planner values were silently ignored | Fixed; visible, associated, announced error and recovery passed live. |
| A designed HTTP 404 was missing | Fixed; the live unknown route returns an intentional 404 with recovery content. |
| Touch targets and focus indicators missed the baseline | Fixed; desktop/phone and keyboard tests passed, including 44 px targets and designed focus. |
| Route metadata and shared legal structure were incomplete | Fixed; route titles, metadata, shared navigation/footer, social image, and Apple icon are present. |
| Erase wording was inaccurate and privacy requests had no path | Fixed; the database deletion claim passes and the privacy email is live. |

## Remaining limits

These are disclosed scope limits, not findings:

- The 30-day learner outcome in the brief needs a real pilot and is not claimed.
- There is no cross-device sync, account, payment, or scheduler integration.
- Supported Anki-style columns are documented; other export layouts may need reshaping into the provided template.

## Release decision

**PASS — zero findings of every severity and zero untested public claims.**

Evidence is under `/work/.evidence/time-budget-new-cards-review-2/`. The required evidence copies are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.
