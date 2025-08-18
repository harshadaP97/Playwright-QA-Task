// tests/desktop/newscientist-theme.spec.js
const { test, expect } = require('@playwright/test');
const { NewScientistHomePage } = require('../../src/pages/newscientist/HomePage');

test.describe('Theme override flow (desktop, UK) @desktop', () => {
  test('should persist Light theme after consent and reload', async ({ page }) => {
    const home = new NewScientistHomePage(page);

    await test.step('Navigate with dark scheme and wait for load', async () => {
      await home.goto();
    });

    await test.step('Dark class applied and LS set to Dark after load', async () => {
      await home.assertHtmlHasClass('Dark');
      await home.assertLocalStorageAppearance('Dark');
    });

    await test.step('Accept consent and ensure modal removed', async () => {
      await page.waitForSelector(
        'iframe[id*="sp_message" i], iframe[src*="consent" i], [role="dialog"], [aria-modal="true"]',
        { timeout: 5000 }
      ).catch(() => {});
      await home.consent.clickAccept();
      await home.consent.assertRemoved();
    });

    await test.step('Toggle to Light and verify classes + localStorage', async () => {
      await home.toggleAppearance();
      await home.assertHtmlHasClass('Light');
      await home.assertHtmlNotHasClass('Dark');
      await home.assertLocalStorageAppearance('Light');
    });

    await test.step('Reload and verify Light persists after load', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect.poll(
        () => page.evaluate(() => document.documentElement.classList.contains('Light')),
        { timeout: 15_000, interval: 200 }
      ).toBe(true);

      await home.assertHtmlNotHasClass('Dark');

      await expect.poll(
        () => page.evaluate(() => localStorage.getItem('colourSchemeAppearance')),
        { timeout: 10_000, interval: 200 }
      ).toBe('Light');
    });
  });
});
