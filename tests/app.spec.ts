import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('calculates, logs, and restores a real session', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Choose how many new cards fit today');
  await page.getByLabel('Minutes available today').fill('30');
  await page.getByLabel('Due cards').fill('0');
  await expect(page.getByText('Today’s safe new-card limit')).toBeVisible();
  await page.getByLabel('Total minutes').fill('19');
  await page.getByLabel('Reviews completed').fill('30');
  await page.getByLabel('New cards completed').fill('8');
  await page.getByRole('button', { name: 'Add session' }).click();
  await expect(page.getByRole('cell', { name: '19' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell', { name: '19' })).toBeVisible();
});

test('reports invalid planner values and keeps the last valid result', async ({ page }) => {
  await page.goto('/demo/#planner');
  const cap = page.locator('.cap-line strong');
  const originalCap = await cap.textContent();
  const budget = page.getByLabel('Minutes available today');
  await budget.fill('-1');
  await expect(budget).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#budget-error')).toContainText('must be between 1 and 360');
  await expect(page.getByText('Result not updated. Fix the highlighted value.')).toBeVisible();
  await expect(cap).toHaveText(originalCap || '');
  await budget.fill('30');
  await expect(budget).not.toHaveAttribute('aria-invalid');
  await expect(page.locator('#result-warning')).toBeHidden();
});

test('recovers after invalid session input and invalid imports', async ({ page }) => {
  await page.goto('/demo/#log-session');
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(3);

  const minutes = page.getByLabel('Total minutes');
  await minutes.fill('0');
  await page.getByRole('button', { name: 'Add session' }).click();
  await expect(minutes).toHaveAttribute('aria-invalid', 'true');
  await expect(minutes).toBeFocused();
  await expect(page.locator('#log-minutes-error')).toHaveText('Total minutes must be between 0.1 and 600.');
  await expect(page.getByText('Session not added. Fix the highlighted value.')).toBeVisible();
  await expect(rows).toHaveCount(3);
  await minutes.fill('18');
  await expect(minutes).not.toHaveAttribute('aria-invalid');
  await page.getByRole('button', { name: 'Add session' }).click();
  await expect(rows).toHaveCount(4);

  const importInput = page.getByLabel('Import CSV or JSON');
  await importInput.setInputFiles({ name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from('wrong,columns\none,two') });
  await expect(page.locator('#import-message')).toContainText('Columns not recognized');
  await importInput.setInputFiles({ name: 'valid.csv', mimeType: 'text/csv', buffer: Buffer.from('date,total_minutes,reviewed_cards,new_cards,difficulty\n2026-09-06,20,45,7,mixed') });
  await expect(page.locator('#import-message')).toContainText('Import complete');
  await expect(page.getByRole('row', { name: /2026-09-06 20 45 7 mixed/ })).toBeVisible();

  await importInput.setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{not json') });
  await expect(page.locator('#import-message')).toHaveText('This JSON file could not be read. Export it again and retry.');
});

test('requires confirmation before deleting a session', async ({ page }) => {
  await page.goto('/demo/#history');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: /Delete session from 2026-09-05/ }).click();
  await expect(page.locator('tbody tr')).toHaveCount(3);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: /Delete session from 2026-09-05/ }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
});

test('keeps calculating when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      configurable: true,
      get: () => { throw new DOMException('Storage blocked for this test', 'SecurityError'); },
    });
  });
  await page.goto('/');
  await expect(page.getByText(/Local storage is unavailable/)).toBeVisible();
  await page.getByLabel('Minutes available today').fill('30');
  await page.getByLabel('Due cards').fill('0');
  await page.getByLabel('Set today’s new-card pace').fill('60');
  await expect(page.locator('.cap-line strong')).toHaveText('26');
});

test('legal pages use the shared route structure and route titles', async ({ page }) => {
  for (const route of ['/privacy/', '/terms/']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Footer navigation' })).toBeVisible();
    await expect(page.getByText('Built by Param Factory')).toBeVisible();
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /time-budget-social\.png$/);
  }
  await page.goto('/privacy/');
  await expect(page).toHaveTitle('Privacy — Time Budget New Cards');
  await expect(page.getByRole('link', { name: 'privacy@sociobot.in' })).toHaveAttribute('href', 'mailto:privacy@sociobot.in');
});

test('keyboard users can skip navigation and operate the planner', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to planner' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
  const sample = page.getByRole('link', { name: 'Try it with sample data' });
  let reachedSample = false;
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    if (await sample.evaluate((element) => element === document.activeElement)) {
      reachedSample = true;
      break;
    }
  }
  expect(reachedSample).toBeTruthy();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo\/\?sample=1$/);
  const easy = page.locator('#settings-form').getByLabel('Easy or familiar');
  await easy.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#settings-form').getByLabel('Mixed')).toBeChecked();
});

test('erase dialog keeps focus and closes with Escape', async ({ page }) => {
  await page.goto('/');
  const erase = page.getByRole('button', { name: 'Erase local data…' });
  await erase.click();
  await expect(page.getByRole('button', { name: 'Keep my data' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(erase).toBeFocused();
});

test('reflows without horizontal loss at a 200 percent equivalent viewport', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4173', viewport: { width: 640, height: 900 } });
  const page = await context.newPage();
  await page.goto('/demo/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByLabel('Minutes available today')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
  await context.close();
});

test('touch targets, focus indicators, and mobile layout meet the baseline', async ({ page, isMobile }) => {
  await page.goto('/');
  for (const selector of ['.brand', '.site-header nav a', '.site-footer nav a', '.real-start']) {
    const targets = page.locator(selector);
    for (let index = 0; index < await targets.count(); index += 1) {
      const box = await targets.nth(index).boundingBox();
      expect(box?.height, `${selector} target height`).toBeGreaterThanOrEqual(44);
    }
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await expect.poll(() => page.getByRole('link', { name: 'Try it with sample data' }).evaluate((element) => getComputedStyle(element).boxShadow))
    .toContain('rgb(255, 253, 247)');
  const focus = await page.getByRole('link', { name: 'Try it with sample data' }).evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineWidth: style.outlineWidth, outlineColor: style.outlineColor };
  });
  expect(focus.outlineWidth).toBe('3px');
  expect(focus.outlineColor).toBe('rgb(23, 22, 17)');
  if (isMobile) {
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    const viewport = page.viewportSize();
    for (const locator of [
      page.getByRole('heading', { level: 1 }),
      page.locator('.lede'),
      page.getByRole('link', { name: 'Try it with sample data' }),
      page.locator('.trust-strip'),
    ]) {
      const box = await locator.boundingBox();
      expect((box?.y || 0) + (box?.height || 0)).toBeLessThanOrEqual(viewport?.height || 0);
    }
  }

  await page.goto('/privacy/');
  const legalLinks = page.locator('.legal-shell a');
  for (let index = 0; index < await legalLinks.count(); index += 1) {
    const box = await legalLinks.nth(index).boundingBox();
    expect(box?.height, 'legal link target height').toBeGreaterThanOrEqual(44);
  }

  await page.goto('/demo/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await page.locator('footer').scrollIntoViewIfNeeded();
  const banner = await page.locator('.demo-banner').boundingBox();
  expect(banner?.y, 'demo banner stays visible after scrolling').toBeGreaterThanOrEqual(0);
  expect((banner?.y || 0) + (banner?.height || 0), 'demo banner stays inside the viewport').toBeLessThanOrEqual(page.viewportSize()?.height || 0);
});

test('unknown routes show the designed not-found page', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page).toHaveTitle('Page not found — Time Budget New Cards');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page was not found');
  await expect(page.getByRole('link', { name: 'Open the planner' })).toHaveAttribute('href', '/');
});

test('reduced motion removes transitions and editorial transforms', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4173', reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const style = await page.getByRole('link', { name: 'Try it with sample data' }).evaluate((element) => {
    const computed = getComputedStyle(element);
    return { transition: computed.transitionDuration, transform: computed.transform };
  });
  expect(Number.parseFloat(style.transition)).toBeLessThanOrEqual(0.00001);
  expect(style.transform).toBe('none');
  await context.close();
});

test('main routes have no serious accessibility violations or console errors', async ({ page }) => {
  for (const route of ['/', '/demo/', '/privacy/', '/terms/', '/not-found']) {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
    expect(severe, `${route} accessibility`).toEqual([]);
    expect(consoleErrors, `${route} console errors`).toEqual([]);
    expect(pageErrors, `${route} page errors`).toEqual([]);
  }
});
