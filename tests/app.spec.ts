import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('calculates, logs, and restores a session', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Make new cards fit/);
  await page.getByLabel('Minutes available today').fill('30');
  await page.getByLabel('Due cards').fill('0');
  await expect(page.getByText('Today’s safe cap')).toBeVisible();

  await page.getByLabel('Total minutes').fill('19');
  await page.getByLabel('Reviews completed').fill('30');
  await page.getByLabel('New cards completed').fill('8');
  await page.getByRole('button', { name: 'Add session' }).click();
  await expect(page.getByRole('cell', { name: '19' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell', { name: '19' })).toBeVisible();
});

test('first installed shell reload is complete offline with only Cache Storage available', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  const precachedUrls = await page.evaluate(async () => {
    const cacheNames = await caches.keys();
    const entries = await Promise.all(cacheNames.map(async (name) => (await caches.open(name)).keys()));
    return entries.flat().map((request) => request.url);
  });
  expect(precachedUrls).toContain(`${new URL('/', page.url()).origin}/index.html`);
  expect(precachedUrls.some((url) => /\/assets\/.*\.js$/.test(url))).toBeTruthy();
  expect(precachedUrls.some((url) => /\/assets\/.*\.css$/.test(url))).toBeTruthy();

  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.clearBrowserCache');
  const failedShellAssets: string[] = [];
  const consoleErrors: string[] = [];
  page.on('requestfailed', (request) => {
    if (/\/assets\/.*\.(?:js|css)$/.test(new URL(request.url()).pathname)) failedShellAssets.push(request.url());
  });
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Make new cards fit/);
  await expect(page.getByText(/Offline — still working/)).toBeVisible();
  expect(failedShellAssets).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('legal pages have a single main heading', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await page.goto('/terms/');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('keyboard users can skip navigation and reach the planning fields', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to planner' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  const budget = page.getByLabel('Minutes available today');
  let reachedBudget = false;
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    if (await budget.evaluate((input) => input === document.activeElement)) {
      reachedBudget = true;
      break;
    }
  }
  expect(reachedBudget).toBeTruthy();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('30');
  await expect(page.getByText('Today’s safe cap')).toBeVisible();
});

test('has no serious or critical accessibility violations', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  const severe = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
  expect(severe).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
