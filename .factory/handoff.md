# Handoff: Choose how many new cards fit today

## Current status

**FAIL.** Review 1 on 2026-09-06 found 9 issues and 16 untested public claims. See [review-1.md](review-1.md).

The implementation reviewed is `e97ee4df8b9932be617a56ba730af340c7673cb4`; the documentation revision at review start is `61dbefcb6b8b4d1876f50f83e47c450e460389d3`. A clean build matched the live deployment at <https://time-budget-new-cards.sociobot.in/> for all 22 deployable files.

## What was reviewed

- Fresh desktop and Pixel 5 browser contexts on the live product
- Normal, invalid, boundary, import, export, persistence, delete, erase, and storage-failure paths
- Required sample demo and real-data isolation
- Keyboard, focus, touch size, reduced motion, 200% text, axe, and Lighthouse
- Offline cold reload after clearing the browser HTTP cache
- Privacy, terms, unknown routes, links, metadata, manifest, headers, and cache policy
- Every earlier verification finding and advisory
- Clean documented install, unit tests, build, and browser tests

No product code was changed during this review.

## Verification results

```text
npm ci             PASS (60 packages, 0 vulnerabilities)
npm test           PASS (11/11)
npm run build      PASS
npm run test:e2e   PASS (10/10)
verify-url.sh       PASS
Playwright axe     PASS (0 desktop/mobile violations)
Lighthouse mobile  100 / 100 / 100 / 100
artifact match     PASS (22/22 files)
```

Run the local checks with:

```bash
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Required next work

1. Add the isolated one-click sample demo and `.factory/demo.md`.
2. Add `.factory/claims.json` and one tagged sandbox test for each retained public claim.
3. Replace metaphor-led interface copy and add `.factory/copy-audit.md`.
4. Add announced planner validation errors and fix touch targets/focus contrast.
5. Add a real designed 404, complete metadata, and consistent route header/footer content.
6. Correct the privacy erase statement and add a request/contact and log-retention explanation.
7. Serve the web manifest as `application/manifest+json`.

After repair, rerun all commands above and repeat the live demo-isolation, offline, route, privacy, and claim checks.
