import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173';

async function openDemo(page: Page): Promise<void> {
  await page.goto('/demo/#planner');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await expect(page.locator('.cap-line strong')).toHaveText('6');
  await expect(page.getByText('Learning from your history')).toBeVisible();
}

test('@claim:demo-isolation loads realistic sample data without changing real data', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Total minutes').fill('19');
  await page.getByLabel('Reviews completed').fill('30');
  await page.getByLabel('New cards completed').fill('8');
  await page.getByRole('button', { name: 'Add session' }).click();
  await expect(page.getByRole('cell', { name: '19' })).toBeVisible();
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\/#planner$/);
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.getByLabel('Minutes available today').fill('31');
  await page.getByLabel('Total minutes').fill('28');
  await page.getByRole('button', { name: 'Add session' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await page.reload();
  await expect(page.getByLabel('Minutes available today')).toHaveValue('25');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.getByLabel('Minutes available today').fill('32');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByLabel('Minutes available today')).toHaveValue('25');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByLabel('Minutes available today')).toHaveValue('20');
  await expect(page.getByRole('cell', { name: '19' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '2026-09-05' })).toHaveCount(0);
});

test('@claim:review-reserve gives zero new cards when reviews fill the budget', async ({ page }) => {
  await openDemo(page);
  await page.getByLabel('Minutes available today').fill('1');
  await page.getByLabel('Due cards').fill('9999');
  await expect(page.locator('.cap-line strong')).toHaveText('0');
  await expect(page.getByText(/Due reviews already fill the 1-minute budget/)).toBeVisible();
});

test('@claim:difficulty-adjustment lowers the limit for harder cards', async ({ page }) => {
  await openDemo(page);
  await page.getByLabel('Due cards').fill('0');
  await page.locator('#settings-form').getByLabel('Easy or familiar').check();
  const easy = Number(await page.locator('.cap-line strong').textContent());
  await page.locator('#settings-form').getByLabel('Hard or abstract').check();
  const hard = Number(await page.locator('.cap-line strong').textContent());
  expect(hard).toBeLessThan(easy);
});

test('@claim:cautious-output shows the limit, range, expected time, and assumptions', async ({ page }) => {
  await openDemo(page);
  await page.getByLabel('Minutes available today').fill('30');
  await page.getByLabel('Due cards').fill('0');
  await page.getByLabel('Set today’s new-card pace').fill('60');
  await expect(page.locator('.cap-line strong')).toHaveText('26');
  await expect(page.getByText('Likely range:')).toContainText('26–35');
  await expect(page.locator('.time-readout')).toContainText('26.0 / 30 min');
  await page.getByText('Check the assumptions').click();
  await expect(page.getByText(/Each new card is estimated at 60 seconds/)).toBeVisible();
});

test('@claim:history-learning uses sample session history in the estimate', async ({ page }) => {
  await openDemo(page);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete session from 2026-09-02' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await page.getByLabel('Total minutes').fill('600');
  await page.getByLabel('Reviews completed').fill('0');
  await page.getByLabel('New cards completed').fill('1');
  await page.getByRole('button', { name: 'Add session' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await expect(page.getByText('Learning from your history')).toBeVisible();
  await page.getByText('Check the assumptions').click();
  await expect(page.getByText('The estimate uses 2 useful sessions.')).toBeVisible();
});

test('@claim:local-persistence restores real settings and history after reload', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByLabel('Minutes available today').fill('37');
  await page.getByLabel('Total minutes').fill('21');
  await page.getByLabel('Reviews completed').fill('42');
  await page.getByLabel('New cards completed').fill('9');
  await page.getByRole('button', { name: 'Add session' }).click();
  await page.reload();
  await expect(page.getByLabel('Minutes available today')).toHaveValue('37');
  await expect(page.getByRole('cell', { name: '21' })).toBeVisible();
});

test('@claim:session-csv-import imports the documented session CSV', async ({ page }) => {
  await openDemo(page);
  await page.getByLabel('Import CSV or JSON').setInputFiles({ name: 'sessions.csv', mimeType: 'text/csv', buffer: Buffer.from('date,total_minutes,reviewed_cards,new_cards,difficulty\n2026-09-06,18,40,5,hard') });
  await expect(page.getByText('Import complete. History now has 4 sessions.')).toBeVisible();
  await expect(page.getByRole('cell', { name: '2026-09-06', exact: true })).toBeVisible();
});

test('@claim:anki-csv-import groups Anki-style rows into daily sessions', async ({ page }) => {
  await openDemo(page);
  await page.getByLabel('Import CSV or JSON').setInputFiles({ name: 'anki.csv', mimeType: 'text/csv', buffer: Buffer.from('date,duration_seconds,is_new\n2026-09-06,12,false\n2026-09-06,35,true\n2026-09-04,10,false') });
  await expect(page.getByText('Import complete. History now has 5 sessions.')).toBeVisible();
  await expect(page.getByRole('row', { name: /2026-09-06 0\.8 1 1 mixed/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /2026-09-04 0\.2 1 0 mixed/ })).toBeVisible();
});

test('@claim:csv-export downloads one CSV row per sample session', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  const text = await readFile(await download.path() as string, 'utf8');
  const rows = text.trim().split('\n');
  expect(rows[0]).toBe('date,total_minutes,reviewed_cards,new_cards,difficulty');
  expect(rows).toHaveLength(4);
});

test('@claim:json-backup downloads complete settings and sample sessions', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Back up JSON' }).click();
  const download = await downloadPromise;
  const data = JSON.parse(await readFile(await download.path() as string, 'utf8')) as { settings: Record<string, unknown>; sessions: Array<Record<string, unknown>> };
  expect(data.settings).toEqual({ budgetMinutes: 25, dueReviews: 55, reviewSeconds: 10, difficulty: 'mixed', newCardSeconds: null });
  expect(data.sessions).toHaveLength(3);
  for (const session of data.sessions) {
    expect(Object.keys(session).sort()).toEqual(['createdAt', 'date', 'difficulty', 'id', 'newCards', 'reviewedCards', 'totalMinutes'].sort());
  }
});

test('@claim:json-import restores settings and sessions from a valid backup', async ({ page }) => {
  await openDemo(page);
  const backup = {
    version: 1,
    updatedAt: Date.now(),
    settings: { budgetMinutes: 32, dueReviews: 40, reviewSeconds: 11, difficulty: 'hard', newCardSeconds: null },
    sessions: [{ id: 'backup-row', date: '2026-09-01', totalMinutes: 28, reviewedCards: 40, newCards: 5, difficulty: 'hard', createdAt: Date.now() }],
  };
  await page.getByLabel('Import CSV or JSON').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByText('Import complete. History now has 1 session.')).toBeVisible();
  await expect(page.getByLabel('Minutes available today')).toHaveValue('32');
  await expect(page.getByLabel('Due cards')).toHaveValue('40');
  await expect(page.getByRole('row', { name: /2026-09-01 28 40 5 hard/ })).toBeVisible();
});

test('@claim:csv-template downloads the documented header and example row', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download CSV template' }).click();
  const download = await downloadPromise;
  const text = await readFile(await download.path() as string, 'utf8');
  expect(text.trim().split('\n')).toEqual([
    'date,total_minutes,reviewed_cards,new_cards,difficulty',
    '2026-09-05,23,50,8,easy',
  ]);
});

test('@claim:pwa-install provides a valid manifest, icons, and controlling service worker', async ({ page }) => {
  await openDemo(page);
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  const response = await page.request.get('/manifest.webmanifest');
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('application/manifest+json');
  const manifest = await response.json() as { display: string; start_url: string; icons: Array<{ src: string }> };
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toContain('installed-v2');
  expect(manifest.icons).toHaveLength(3);
  for (const icon of manifest.icons) expect((await page.request.get(icon.src)).ok()).toBeTruthy();
});

test('@claim:offline-reload reloads the complete demo from Cache Storage while offline', async ({ browser }) => {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/demo/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.clearBrowserCache');
  const failedAssets: string[] = [];
  page.on('requestfailed', (request) => {
    if (/\/assets\/.*\.(?:js|css)$/.test(new URL(request.url()).pathname)) failedAssets.push(request.url());
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await expect(page.getByText('Offline — still working')).toBeVisible();
  expect(failedAssets).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  await context.close();
});

test('@claim:free-no-account works without payment, registration, or sign-in', async ({ page }) => {
  await openDemo(page);
  await expect(page.getByText('Free to use')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /sign in|register|checkout|buy/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /sign in|register|checkout|buy/i })).toHaveCount(0);
});

test('@claim:local-data sends no entered or imported study data off origin', async ({ page }) => {
  const requests: Array<{ url: string; method: string; body: string }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method(), body: request.postData() || '' }));
  await openDemo(page);
  await page.getByLabel('Minutes available today').fill('33');
  await page.getByLabel('Import CSV or JSON').setInputFiles({ name: 'private.csv', mimeType: 'text/csv', buffer: Buffer.from('date,total_minutes,reviewed_cards,new_cards,difficulty\n2026-09-06,17,35,4,mixed') });
  await expect(page.getByText(/Import complete/)).toBeVisible();
  expect(requests.every((request) => new URL(request.url).origin === baseURL)).toBeTruthy();
  expect(requests.every((request) => request.method === 'GET' && !request.url.includes('private.csv') && !request.body.includes('2026-09-06'))).toBeTruthy();
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).not.toContain('study-tape-v1');
});

test('@claim:no-tracking loads no analytics, ads, third-party scripts, or remote fonts', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/privacy/');
  await expect(page.getByText(/no analytics, ads, tracking pixels, third-party scripts, or remote fonts/)).toBeVisible();
  expect(requests.every((url) => new URL(url).origin === baseURL)).toBeTruthy();
  const remoteResources = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name).filter((url) => new URL(url).origin !== location.origin));
  expect(remoteResources).toEqual([]);
});

test('@claim:erase-local-data deletes real settings and history from IndexedDB', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.getByLabel('Minutes available today').fill('44');
  await page.getByLabel('Total minutes').fill('22');
  await page.getByLabel('Reviews completed').fill('31');
  await page.getByLabel('New cards completed').fill('6');
  await page.getByRole('button', { name: 'Add session' }).click();
  await page.getByRole('button', { name: 'Erase local data…' }).click();
  await expect(page.getByRole('button', { name: 'Keep my data' })).toBeFocused();
  await page.getByRole('button', { name: 'Erase local data', exact: true }).click();
  await expect(page.getByText('Local settings and study history were erased.')).toBeVisible();
  await expect(page.getByLabel('Minutes available today')).toHaveValue('20');
  await expect(page.getByText('No sessions recorded yet')).toBeVisible();
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).not.toContain('study-tape-v1');
});

test('@claim:no-scheduler-access makes no connection to Anki or FSRS', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await page.locator('#settings-form').getByLabel('Hard or abstract').check();
  await page.getByLabel('Due cards').fill('90');
  expect(requests.every((url) => new URL(url).origin === baseURL)).toBeTruthy();
  await expect(page.getByText(/does not connect to or change Anki or FSRS/)).toBeVisible();
});
