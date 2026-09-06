# Handoff: Choose how many new cards fit today

## Independent verification 3

**PASS — zero findings and zero untested claims.** Independent QA on 2026-09-06 reviewed implementation `4083790fa39fa6d025e8a6b3a2c6ffe44da01159`; verification-test revision is `de7af71` and documentation revision is `7a9e7fac467b6d3ae5cd844a780247002bcfc3e6`.

- A separate clean checkout passed `npm ci`, `npm test` (13/13), `npm run build`, every declared claim command (19/19), and `npm run test:e2e` (66/66).
- Fresh live desktop and Pixel 5 checks passed. The first screen states the job, audience, and one-click sample action. The demo showed its persistent sample label, three realistic sessions, a six-card output, reset behavior, and isolation from real data.
- Normal, invalid, boundary, and recovery paths passed. So did keyboard/focus, mobile reflow, reduced motion, privacy/no-third-party requests, legal routes, link crawl, intentional 404, cold offline reload, service-worker update behavior, and local-data erase.
- The live artifact matched all 28 served build files by SHA-256. `staticwebapp.config.json` is the one deployment-only build file and is correctly not served.
- Live Playwright axe found 0 violations. `verify-url.sh` passed. Lighthouse could not be re-run in this container because its Chromium process crashed at startup; normal live Playwright Chromium checks worked and the documented prior live result is 100/100/100/100.

See [verification-3.md](verification-3.md) for detailed evidence. The remaining product limits below are documented scope limits, not verification findings.

## Status

**Repair complete and deployed.** All nine findings in `review-1.md` are resolved. All 19 retained public claims have a declared, uniquely tagged outcome test and pass from a clean checkout.

- Live product: <https://time-budget-new-cards.sociobot.in/>
- One-click sample: <https://time-budget-new-cards.sociobot.in/demo/?sample=1>
- Deployed implementation SHA: `4083790fa39fa6d025e8a6b3a2c6ffe44da01159`
- Verification-only SHA: `de7af71` (adds the service-worker update test; deployable files are unchanged)
- Previous reviewed implementation: `e97ee4df8b9932be617a56ba730af340c7673cb4`

The job is to choose a safe new-card limit within a fixed daily study time. The audience is Anki and CSV flashcard learners handling mixed difficulty. The first action is **Try it with sample data**; on phones it opens directly on the populated result.

## Findings resolved

| Finding | Disposition |
| --- | --- |
| F1 sample demo | Added `/demo/` and the one-click sample entry. Three realistic sessions produce a six-card limit. The persistent banner includes **Reset demo** and **Start for real**. Demo state is memory-only and never opens the real IndexedDB database. |
| F2 claim registry | Added `.factory/claims.json` with 19 claims. Every command passed individually from a clean clone. Tests assert observable results, downloaded contents, requests, storage, and offline behavior. |
| F3 plain words | Replaced metaphor-led public headings with task language. The first screen names the job and audience, explains the sample action, and shows local-data, offline, and free facts. Added `.factory/copy-audit.md`. |
| F4 planner validation | Invalid planner values now receive `aria-invalid`, associated live errors, and a visible warning that the last valid result remains. Session-log errors are also announced and focus the first invalid field. |
| F5 not found | Added the styled `404.html` and a host response override. An unknown live URL returns HTTP 404 and shows the designed recovery page. |
| F6 touch and focus | Interactive targets are at least 44 px. Focus uses an ink outline plus a white separation ring on light, orange, and dark surfaces. Phone and keyboard checks pass. |
| F7 metadata and routes | Added route-specific Open Graph and Twitter metadata, a 1200×630 social image, Apple touch icon, shared header/footer, explicit external-link wording, sitemap demo route, and route titles. |
| F8 privacy and erase | Erase now deletes the IndexedDB database. The privacy page describes browser data, static-host logging responsibility, retention requests, and the privacy email path. |
| F9 manifest MIME | Static Web Apps now serves `.webmanifest` as `application/manifest+json`; confirmed live. |

The earlier cold-offline shell, immutable asset caching, CSP, frame protection, and Permissions-Policy repairs remain intact. A new browser test also supplies a changed service worker, checks the update notice, activates it, and verifies the reloaded app.

## Verification

Run from the repository root:

```bash
npm ci
npx playwright install chromium
npm test
npm run build
npm run test:claim
npm run test:e2e
```

Final results:

- `npm ci`: 61 packages installed, 62 audited, 0 vulnerabilities.
- `npm test`: 13/13 passed.
- `npm run build`: passed; `dist/index.html` is at the artifact root.
- `npm run test:claim`: 19/19 passed.
- Every command in `.factory/claims.json`: passed individually after `npm ci` in a clean clone.
- `npm run test:e2e`: 66/66 desktop and Pixel 5 tests passed. The suite runs serially to avoid Chromium resource crashes in constrained workers.
- Live `verify-url.sh`: passed; title, language, one heading, main landmark, image alternatives, and console checks are clean.
- Live axe checks: 0 violations on fresh desktop and phone contexts.
- Live Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 0.9 s, LCP 1.3 s, TBT 0 ms, CLS 0.
- Build sizes: JavaScript 33.64 KB raw / 11.38 KB gzip; CSS 16.67 KB raw / 4.45 KB gzip.
- Live artifact comparison: 28/28 deployable files match the implementation build by SHA-256.
- Live routes: home, demo, privacy, and terms return 200; a missing route returns the expected 404.
- Live headers: CSP, frame protection, permissions policy, `nosniff`, revalidating HTML/service worker, immutable hashed assets, and the manifest MIME type are present.
- Live cold-offline test: the complete sample reloads from Cache Storage with three sessions, no failed shell assets, and no console errors.
- Live sample isolation: reset restores the 25-minute sample and three sessions; returning to the real planner preserves its separate 41-minute setting and real session.
- Fresh phone: no horizontal overflow, required first-screen content fits, the sample result opens in view, and tested targets meet 44 px.
- Reduced motion: editorial transforms are removed and transitions reduce to `0.01ms`.
- All internal links and the labelled GitHub source link return 200.

Evidence is under `/work/.evidence/time-budget-new-cards-repair-2/`. The catalog description was copied to `/work/.evidence/catalog-description.txt`.

## Known gaps

- The brief’s 30-day learner outcome needs a real pilot; the product does not claim that result.
- Supported Anki-style columns are documented. Other exports may need reshaping into the included CSV template.
- There is no cross-device sync. This is intentional for a local-first, account-free tool.
- Static-host security-log retention is controlled outside this browser app. The privacy page gives a contact path for the current period and data requests.
- The product is free, so no billing offer or billing registration applies.
