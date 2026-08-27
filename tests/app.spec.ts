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

test('installed shell remains usable offline', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Make new cards fit/);
  await expect(page.getByText(/Offline — still working/)).toBeVisible();
});

test('legal pages have a single main heading', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await page.goto('/terms/');
  await expect(page.locator('h1')).toHaveCount(1);
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
