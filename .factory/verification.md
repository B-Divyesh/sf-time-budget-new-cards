# Independent verification — FAIL

- **Candidate:** `2fb802c241b22c97d2980029ab317f566fdb58d0`
- **Live URL:** <https://time-budget-new-cards.sociobot.in/>
- **Verified:** 2026-08-28 UTC
- **Verifier:** independent factory QA (`time-budget-new-cards-verify-1`)
- **Scope:** clean candidate checkout; production artifact and deployed PWA. Product source was not modified.

## Verdict

**FAIL.** The calculator, local-first workflow, accessibility, responsiveness, and deployed artifact are otherwise in good shape, but the PWA does not meet the offline-app-shell acceptance requirement. The installed service worker does not precache the app JavaScript or CSS, so an offline reload fails when normal browser HTTP cache is unavailable.

## Release-blocking defect

### P1 — Installed PWA cannot cold-reload offline from its service-worker cache

`public/sw.js`/the deployed `/sw.js` precaches HTML, manifest, icons, and AVIF/WebP art, but not the emitted `/assets/main-DWR8tYzs.js` or `/assets/main-DLMvg28D.css` files. In a fresh Chromium profile on the live URL, Cache Storage contained only:

`/`, `/index.html`, legal/offline HTML, manifest, icons, and art — no `assets/` JS or CSS.

Reproduction against the live deployment:

1. Open `https://time-budget-new-cards.sociobot.in/` in a new profile and wait for `navigator.serviceWorker.controller`.
2. Clear the ordinary HTTP cache using CDP `Network.clearBrowserCache` (leaving Cache Storage and the service worker installed).
3. Set the browser context offline and reload.

Result: cached HTML returns `200`, but the document body is only `Skip to planner`, there is no `<h1>`/planner, and console reports two `net::ERR_FAILED` resource loads (the non-cached CSS and JS). This violates the PWA/offline contract’s requirement to precache the app shell and support offline reload. It is also why the repository test passes only after an additional online reload has opportunistically populated the runtime cache.

**Required correction:** have the build produce a revisioned precache manifest (or enumerate the emitted JS/CSS) and precache all files necessary to render and run `/`; version cache names with the build revision; add a test for the first offline reload after install with browser HTTP cache cleared.

## Other defects

### P2 — Production does not cache content-addressed assets immutably

The live hashed JS and CSS (`/assets/main-DWR8tYzs.js`, `/assets/main-DLMvg28D.css`) return `Cache-Control: public, must-revalidate, max-age=30`. They are content-addressed but do not receive long-lived immutable caching. This misses the stated PWA performance/caching policy and forces revalidation every 30 seconds. Configure immutable long-lived caching for hashed assets while retaining short revalidation for HTML and `sw.js`.

### P3 — Browser security policy headers are incomplete

The live response sends HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`, but no CSP, `frame-ancestors`/`X-Frame-Options`, or Permissions-Policy. This did not cause a functional failure in the tested app, but deployment should add an appropriate CSP (including the app’s inline offline-page style if retained), clickjacking protection, and a restrictive Permissions-Policy.

## Evidence: passed checks

### Clean build and automated tests

- Started at the requested clean `main` checkout on the exact candidate; working tree was clean before QA.
- `npm ci`: succeeded; 61 packages audited, 0 vulnerabilities.
- `npm test`: **9/9** Vitest unit tests passed.
- Type check is included in `npm run build` (`tsc --noEmit`): passed.
- `npm run build`: passed. `dist/` created; JS is **26.88 KB raw / 9.77 KB gzip**, CSS **13.79 KB raw / 3.95 KB gzip**, comfortably below the 200 KB/50 KB budgets.
- `npx playwright install chromium` was required because the preinstalled browser revision did not match the package’s resolved Playwright revision. After that setup, `npm run test:e2e`: **8/8** passed across desktop and mobile, including its existing online-then-reload offline scenario.

### Independent end-to-end product checks

- Desktop 1440px and exact 390px mobile: visual inspection and DOM measurements found no horizontal overflow; the small-screen flow stacks correctly and controls remain usable.
- Normal calculation: a 30-minute budget with no reviews and a 60-second manual new-card pace yields a cautious cap of **26**; a 30-minute budget with 9,999 due reviews yields **0** and the explicit safe-call explanation.
- Boundary/invalid/recovery: `-1` budget triggers native validity (`Value must be greater than or equal to 1`) with the designed danger border; returning to `1` recalculates. Invalid CSV shows a corrective error, then a valid CSV imports successfully. An Anki-style `date,duration_seconds,is_new` file grouped into two days successfully; CSV export produced a dated download.
- Session logging persisted after reload in IndexedDB. JSON/CSV import/export controls and delete/erase affordances were present; the code validates JSON values before replacing state.
- No account or external app API is required. Playwright request capture on both local production build and live site showed no off-origin requests; only same-origin static files and `online-check.txt` were requested. Privacy and terms routes render and state the local IndexedDB model.

### Accessibility, interaction, and visual checks

- axe-core on local desktop and mobile: **0 serious/critical** (and 0 total) violations. Live 390px axe smoke test: **0 serious/critical**.
- No console/page errors in normal local or live use. The P1 offline repro above intentionally produces two failed-resource errors.
- Keyboard smoke test: first Tab reaches the visible “Skip to planner” link with a solid focus outline; native controls and radio labels are reachable. `prefers-reduced-motion: reduce` changes button transition duration to `0.00001s` and removes editorial transforms.
- Semantic baseline observed: `lang=en`, one application `<h1>`, `<main>`, meaningful hero alt text, labels, live status messages, legal headings, and touch targets. Existing Playwright legal-page checks passed.
- Visual review of full-page desktop and 390px captures: the cassette-zine system matches `.factory/design.md`; no clipping, broken asset, or generic-framework treatment observed.

### Performance, deployment, and HTTP checks

- Local production Lighthouse mobile report: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP **0.9 s**, LCP **1.7 s**, TBT **80 ms**, CLS **0**. Lighthouse printed a post-audit Chromium target-crash message in this container, but wrote a complete report with no run warnings and the scores above.
- Hero resources: AVIF 48 KB, WebP 80 KB, PNG fallback 240 KB; the selected modern formats are below the 300 KB mobile hero budget.
- Every file under locally built `dist/` was SHA-256 compared with the corresponding live URL: **all matched**. The deployment therefore is the exact candidate artifact, not a deployment-only mismatch.
- Live status/headers: HTTPS, HSTS, `nosniff`, and strict-origin referrer policy are present. The manifest is served as `application/octet-stream`; Chromium still discovered/used it, but `application/manifest+json` would be preferable.
- Service-worker update code contains `updatefound`, a user-visible update toast, `SKIP_WAITING`, and `clientsClaim`. A changed-worker update cannot be end-to-end induced without changing the deployed artifact; its cache namespace is currently the fixed `study-tape-v1`, reinforcing the P2 recommendation to derive it from the build revision.

## Retest gate

After fixing P1/P2, rerun the clean commands above and a fresh-profile test that clears HTTP cache after SW activation, goes offline, and reloads. It must render the full planner, retain local IndexedDB data, and report no failed JS/CSS requests.
