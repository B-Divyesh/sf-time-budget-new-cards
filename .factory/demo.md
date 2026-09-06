# Demo sandbox

## Entry point

- Local: `http://127.0.0.1:4173/demo/`
- Live: `https://time-budget-new-cards.sociobot.in/demo/`

The home-page “Try it with sample data” link opens `/demo/?sample=1` in one click. Phones move to the populated result; larger screens show the filled planner and result together.

## Sample data

The demo starts with a 25-minute budget, 55 due reviews, a 10-second review pace, and mixed card difficulty. It includes three sessions from 2, 3, and 5 September 2026 with easy, mixed, and hard material.

## Isolation

Demo state lives only in the page’s JavaScript memory. Demo mode never calls the real IndexedDB load, save, or delete functions. Reloading `/demo/` restores the bundled sample.

The persistent banner reads “Demo — sample data, nothing is saved.” “Reset demo” restores the bundled sample without reading real data. “Start for real” discards demo state and navigates to `/`, where the separate `study-tape-v1` IndexedDB database is used.

The claim test creates real data, changes and resets the demo, then returns to the unchanged real planner:

```bash
npm run test:claim -- --grep "@claim:demo-isolation"
```
