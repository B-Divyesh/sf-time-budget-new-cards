# Review: Choose how many new cards fit today

## Verdict

**FAIL — 9 findings, including 2 P1 findings. There are 16 untested public claims.**

The calculator works, persists local history, imports and exports data, and cold-reloads offline. The product cannot pass this review because the required isolated sample demo and claims registry do not exist. Several required plain-language, accessibility, route, metadata, and privacy details also remain incomplete.

Reviewed on 2026-09-06 UTC at <https://time-budget-new-cards.sociobot.in/>.

- Implementation candidate: `e97ee4df8b9932be617a56ba730af340c7673cb4`
- Documentation revision: `61dbefcb6b8b4d1876f50f83e47c450e460389d3`
- Live identity: all 22 deployable files in a clean build matched the live files by SHA-256
- Product class: static local-first PWA; backend, tenant, SQLite, restart, health, and 429 checks do not apply

## First screen

- Job: choose a safe number of new flashcards for a fixed study time after allowing for due reviews and card difficulty.
- Audience: Anki or CSV flashcard learners with limited daily study time. The first screen does not name this audience; Anki and CSV appear only in the footer.
- First action before scrolling: **“Plan today’s stack”**, which scrolls to the form. There is no **“Try it with sample data”** action.

At both 1440×900 and a fresh Pixel 5 context, the action was visible before scrolling. The headline, action, and several section headings use tape and playback metaphors. The three first-screen facts are “No account”, “Works offline”, and “Your data stays local”; the required price fact is absent.

## Findings

### F1 — P1 — The one-click sample demo and isolated sandbox do not exist

There is no sample action on the first screen. `/demo` and `/?demo=1` both open the ordinary planner with no sample data, no persistent “Demo — sample data, nothing is saved” label, no **Reset demo**, and no **Start for real** control. After two sessions were imported in a fresh real-mode browser context, both demo URLs displayed those same two IndexedDB rows. The supposed demo paths therefore use the real storage namespace instead of an isolated demo namespace. `.factory/demo.md` is also absent.

Required correction: add the one-click sample, realistic populated output, a separate demo storage namespace, the persistent label and controls, discard demo changes when leaving, and document the sandbox.

### F2 — P1 — The claim registry is absent and 16 public claims have no required claim tests

`.factory/claims.json` does not exist, and the test tree contains no `@claim:` tags. Some behavior has ordinary unit or browser coverage, but none of the public claims has the required declared, uniquely tagged sandbox command. This is 16 untested claims under the claims contract; the claim audit below lists them.

Required correction: create the registry and one observable demo-based `@claim:<id>` test for every retained claim. Remove any statement that cannot be proved.

### F3 — P2 — The first screen and section copy do not meet the plain-words contract

The headline “Make new cards fit today’s tape” does not name the job without a metaphor. “Plan today’s stack”, “Set the time, then press play”, “Teach the estimate your pace”, “Side A”, “Side B”, and “Liner notes” continue the metaphor instead of naming the action or section. The first screen does not identify Anki or CSV learners and does not show that the product is free. `.factory/copy-audit.md` is absent.

Required correction: use a job-naming headline, identify the audience in the first sentence, use the mandated sample action with an outcome note, include privacy/offline/price facts, replace metaphor and mood headings, and add the sentence audit.

### F4 — P2 — Invalid planner settings are silently ignored

Entering `-1` for “Minutes available today” makes the input invalid but leaves the previous recommendation and “Saved on this device” status on screen. While the input is focused, its border remains the normal ink color. After blur it becomes brown, but there is no written or announced error, `aria-invalid`, or `aria-describedby`. This form has no submit action that would expose the browser’s native validation message. Entering `30` recovers correctly.

Required correction: show and announce a specific inline error as soon as a planner value becomes invalid, associate it with the input, and make clear that the displayed result has not used the invalid value.

### F5 — P2 — Unknown routes do not return a designed 404 page

`/404` and `/this-route-does-not-exist` return HTTP 200 and render the full planner with the home title. There is no designed 404 route or `responseOverrides` entry. This is not a finding merely because a deliberate 404 exists; it is a finding because no deliberate 404 exists and the unknown route is presented as a valid planner page.

Required correction: add a product-styled 404 with a way home and configure the host to return HTTP 404.

### F6 — P2 — Several mobile targets and focus indicators miss the accessibility baseline

At the Pixel 5 viewport, the brand link is about 145×20 CSS pixels, the empty-state link is about 211×18, and footer links are about 48–67×25. These are below the 44-pixel touch-target requirement. The global focus outline is `#8B3A1D`; its contrast is 2.04:1 against the dark panel/footer and 2.09:1 against orange, below the required 3:1 for focus indicators. Automated axe checks report no violations, but axe does not cover these measurements.

Required correction: give every interactive target a 44×44 minimum hit area and use a focus treatment with at least 3:1 contrast against each adjacent background.

### F7 — P3 — Metadata and the shared route structure are incomplete

The home and legal documents have titles, descriptions, canonicals, and one main heading, but none provides Open Graph metadata, a Twitter card, a 1200×630 product image, or an Apple touch icon. Legal pages reduce the header to one home link and the footer to plain text, so they omit the consistent navigation, Privacy/Terms links, product summary, “Built by Param Factory”, and version/build identifier. The external source link is labeled only “Source” rather than identifying that it leaves the site.

Required correction: complete route metadata and use the required consistent header/footer structure on every route.

### F8 — P3 — The privacy page has an inaccurate erase statement and no request path

The privacy page says that “Erase local data” removes the app database. After using the control, `indexedDB.databases()` still lists `study-tape-v1`, whose `planner/current` record contains the restored defaults. User-entered sessions and settings are removed, so the control’s practical result is mostly correct, but the database-removal statement is false. The page also says hosting may retain IP address and request-time logs without giving a retention period or any contact/request method.

Required correction: either delete the IndexedDB database or describe the reset accurately, and provide a clear privacy contact/request process plus retention information for hosting logs.

### F9 — P3 — The manifest MIME issue from the earlier review remains open

`/manifest.webmanifest` still returns `Content-Type: application/octet-stream` instead of `application/manifest+json`. Chromium parsed the manifest with no reported errors, so this did not block the tested installation metadata, but it remains the unresolved earlier advisory.

## Public claim audit

All 16 entries below are untested under the required claim system because there is no registry or tagged test. “Observed” is independent review evidence, not a substitute for the required automated claim test.

| # | Public claim | Location | Review evidence |
|---:|---|---|---|
| 1 | Reserves time for due reviews | Page, README | Observed: 9,999 due reviews with a 1-minute budget produced a cap of 0. |
| 2 | Estimates new-card time by difficulty | Page, README | Observed in live controls and calculator output; unit tests pass. |
| 3 | Shows a cautious cap, range, and assumptions | Page, README | Observed: 30 minutes, no reviews, 60 seconds per new card produced cap 26 and range 26–35. |
| 4 | Learns from session history | Page, README | Observed: two realistic logs changed the result to “Learning your pace” using two sessions. |
| 5 | Session history persists locally | Page, README | Observed after a full reload in a fresh context. |
| 6 | Imports the app session CSV | Page, README | Observed with a valid session row after an invalid-file recovery. |
| 7 | Imports Anki-style review rows | Page, README | Observed: three rows across two dates produced two daily sessions. |
| 8 | Exports session CSV | Page, README | Observed downloaded header plus one row per session. |
| 9 | Exports a full JSON backup | Page, README | Observed valid settings and sessions JSON; a valid backup also restored after invalid JSON. |
| 10 | Installs as a PWA | README | Chromium parsed the manifest and three icons with no manifest errors. |
| 11 | Continues working offline | Page, README, privacy | Observed after service-worker control, HTTP-cache clearing, offline mode, and reload. |
| 12 | Requires no account | Page, README, privacy | Observed: no sign-in or account request exists. |
| 13 | Entered data stays local and nothing uploads | Page, README, privacy | Observed: all requests during the tested real flow were same-origin. No demo exists. |
| 14 | Uses no analytics, ads, tracking, third-party scripts, or remote fonts | README, privacy | Observed from request capture and loaded resources. |
| 15 | “Erase local data” removes the app database | Privacy | **False as written:** the database and a default record remain after reset. |
| 16 | The tool is free and does not change Anki or FSRS | Footer, terms, README | Observed no payment/account path or scheduler integration. |

## Working behavior

- Default output: 20 minutes and 45 reviews produced a cap of 10, range 10–20, and an explicit starter estimate.
- Normal output: 30 minutes, no reviews, and a 60-second manual pace produced cap 26, range 26–35, and expected time 26.0 minutes.
- Boundary output: 1 minute and 9,999 due reviews produced cap 0 with a clear reason.
- CSV recovery: an invalid header produced a specific error; session CSV and Anki-style rows then imported successfully.
- JSON recovery: an invalid backup produced a specific error; a valid backup then restored the budget and history.
- Log recovery: zero minutes was rejected by native validation; a valid session then saved.
- Persistence and deletion: history survived reload; row deletion cancel and confirm paths worked; the erase dialog focused “Keep my data” and Escape closed it.
- Offline: after service-worker activation and ordinary HTTP-cache clearing, an offline reload rendered the complete planner, kept the logged session, showed “Offline — still working”, and produced no console or shell-asset errors.
- Storage failure: with IndexedDB blocked, the calculator still rendered and showed a clear warning that changes may not survive.
- Keyboard: the skip link is visible on first Tab, skips the header sequence, and radio arrow-key selection works. No trap was found.
- Reduced motion: a context created with reduced motion removed editorial transforms and reduced transitions to 0.01 ms.
- Mobile: no horizontal overflow at 393 CSS pixels. A 640 CSS-pixel reflow check, equivalent to 200% zoom on a 1280-pixel desktop viewport, retained the content and controls.
- Links: all internal destinations loaded; the source repository returned 200.
- Privacy: normal-flow request capture saw only the product origin and no console/page errors.

## Automated and deployment evidence

The documented prerequisites were installed in a fresh clone before runtime tests.

| Check | Result |
|---|---|
| `npm ci` | Pass; 60 packages, 0 vulnerabilities |
| `npm test` | Pass; 11/11 tests |
| `npm run build` | Pass; `dist/index.html` exists |
| `npm run test:e2e` | Pass; 10/10 desktop/mobile tests |
| `/opt/fleet/lib/verify-url.sh` | Pass; title, `lang`, one `h1`, `main`, alt text, and no console errors |
| Playwright axe, desktop and phone | Pass; 0 violations |
| Lighthouse mobile | 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 1.11 s, LCP 1.33 s, TBT 0 ms, CLS 0 |
| Build sizes | JS 26.96 KB raw / 9.81 KB gzip; CSS 13.79 KB raw / 3.95 KB gzip |
| Live artifact comparison | Pass; 22/22 files match the clean build |
| Live security/caching | Pass; CSP, frame protection, Permissions-Policy, HSTS, immutable hashed assets, and non-cached service worker are present |

Evidence files are under `/work/.evidence/time-budget-new-cards-review-1/`, including first-screen and full-page captures, offline output, route results, exports, interaction results, and Lighthouse JSON.

## Earlier findings and current disposition

| Earlier item | Current disposition |
|---|---|
| P1 cold offline shell omitted JS/CSS | Fixed. The versioned shell contains both emitted assets; cold offline reload passes with retained data. |
| P2 hashed assets lacked immutable caching | Fixed. Live JS/CSS return `max-age=31536000, immutable`. |
| P3 CSP, clickjacking, and Permissions-Policy absent | Fixed. All are present live. |
| P3 manifest served as octet stream | Still open as F9. |
| Pilot outcome not yet measured | Still accurately disclosed as an evidence gap; it is not presented as a proven outcome. |
| Unusual Anki exports may need reshaping | Still accurately documented; supported formats worked. |
| No cross-device sync | Intentional and consistent with the local-first scope. |

## Release decision

**FAIL.** Do not declare this product accepted until all 9 findings are corrected, every retained claim has a passing declared sandbox test, and a fresh independent review reports zero findings and zero untested claims.
