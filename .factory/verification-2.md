# Independent verification 2 — PASS

- **Candidate:** `b197bd1e8ee90af3fcd0ba22efbbdf2eb6064227`
- **Live URL:** <https://time-budget-new-cards.sociobot.in/>
- **Verified:** 2026-08-28 UTC
- **Verifier:** independent factory QA (`time-budget-new-cards-verify-2`)
- **Scope:** fresh detached checkout of the candidate; rebuilt production artifact and deployed PWA. Product source was not modified.

## Verdict

**PASS.** The live deployment is the rebuilt candidate and satisfies the researched job: it uses local study evidence to reserve review time, gives a conservative new-card cap with uncertainty, accepts CSV/Anki-style history, retains the data locally, exports it, and remains usable offline. The cold offline app-shell failure in [verification.md](verification.md) is fixed.

## Release defects

No P0, P1, or P2 defects found.

### P3 advisory — manifest is served as `application/octet-stream`

`/manifest.webmanifest` is valid and Chromium discovers and uses it, but the live host returns `Content-Type: application/octet-stream` rather than `application/manifest+json`. This did not impair installability or the tested service worker and is not release-blocking; configure the host MIME mapping when practical.

## Evidence

### Clean candidate and automated checks

- Cloned `https://github.com/B-Divyesh/sf-time-budget-new-cards.git` to a new temporary directory, checked out the exact detached candidate, and confirmed a clean worktree.
- `npm ci`: passed (60 packages installed; `npm audit` reported 0 vulnerabilities).
- `npm test`: passed, **11/11** Vitest tests (calculator, CSV import, deployment configuration).
- `npm run build`: passed, including `tsc --noEmit`. `dist/index.html` was produced at the artifact root.
- Browser setup: the clean lockfile resolved Playwright **1.62.1**, whose Chromium revision was not preinstalled; `npx playwright install chromium` completed before browser checks.
- `npx playwright test --workers=4`: passed, **10/10** desktop and mobile tests. These cover calculation/session persistence, legal routes, keyboard traversal, cold service-worker offline reload, and axe serious/critical findings.
- No separate lint script exists. Type checking is part of the production build.

### Product end to end

- On desktop (1440px) and a 390×844 touch/mobile context, 30 minutes with zero due reviews and a 60-second manual pace gave a safe cap of **26**. With 9,999 due reviews against a one-minute budget, it gave **0** and explained that reviews already fill the budget.
- `-1` minutes produces native corrective validation (“Value must be greater than or equal to 1.”); changing it back to a valid value recalculates successfully.
- An invalid CSV displays a usable recognition error. A subsequent valid session CSV imported successfully; an Anki-style `date,duration_seconds,is_new` CSV grouped into two daily sessions. A logged session survived reload and CSV export downloaded `study-tape-2026-08-28.csv`.
- No horizontal overflow was detected at either viewport. Full-page visual review confirms the cassette-zine system, legible stacked mobile flow, and no broken assets.

### PWA, privacy, accessibility, and browser behavior

- Fresh live profile: after service-worker control, CDP `Network.clearBrowserCache`, offline mode, and reload, Cache Storage contained the versioned shell plus **one JS and one CSS asset**. The complete planner rendered with “Offline — still working”; there were **0** failed app-shell asset requests and **0** console/page errors.
- Update behavior: served the exact `dist/` through an isolated local test host, then supplied a byte-changed worker script. `registration.update()` produced the visible “A fresh cut is available” prompt; “Update app” activated the worker and reloaded the shell. No product source or candidate artifact was changed.
- Live request capture saw only `https://time-budget-new-cards.sociobot.in`; no third-party scripts, fonts, APIs, analytics, or trackers. Settings/history remain in IndexedDB; privacy and terms pages accurately state the model.
- Live mobile axe: **0 serious/critical** (0 total) violations. First Tab reaches the visible skip link with a solid focus outline. Reduced-motion mode changes UI transitions to `0.00001s` and removes editorial transforms. Semantic smoke check confirmed `lang=en`, title, one app `h1`, `main`, form labels, image alt text, and no normal-load console/page errors.

### Deployment identity, policies, and budget

- SHA-256 compared each public file in the rebuilt `dist/` with its production URL: **22/22 deployable files matched**. `staticwebapp.config.json` is deployment configuration and correctly is not served (`404`). The live deployment therefore matches this candidate rather than a deployment-only variant.
- Live HTML is `public, max-age=0, must-revalidate`; hashed JS is `public, max-age=31536000, immutable`; `/sw.js` is `no-cache, must-revalidate`. HSTS, `nosniff`, strict-origin referrer policy, CSP (including `frame-ancestors 'none'`), `X-Frame-Options: DENY`, and restrictive Permissions-Policy were present.
- Build sizes: main JS **26.96 KB raw / 9.81 KB gzip**; CSS **13.79 KB raw / 3.95 KB gzip**. AVIF hero is **45 KB**, WebP **80 KB**, and PNG fallback **245 KB**. All are within the stated static budgets.
- Live Lighthouse (mobile): Performance **96**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP **0.9 s**, LCP **1.3 s**, TBT **220 ms**, CLS **0**.

## Reproduction

```bash
npm ci
npm test
npm run build
npx playwright install chromium
npx playwright test --workers=4
```

For the offline regression, use a fresh Chromium profile, wait for service-worker control, clear only the ordinary HTTP cache with CDP, set the context offline, and reload. The full planner must render with cached JS/CSS and no asset failures.
