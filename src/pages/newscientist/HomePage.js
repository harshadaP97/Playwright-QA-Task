// src/pages/newscientist/HomePage.js
const { expect } = require('@playwright/test');
const { ConsentModal } = require('../common/ConsentModal');


class NewScientistHomePage {
  constructor(page) {
    this.page = page;

    // Core elements we assert against
    this.html = page.locator('html');
    this.appearanceToggle = page.locator('#appearance-toggle');

    // Shared helper to accept consent when present
    this.consent = new ConsentModal(page);
  }

  async goto() {
    // Use root path; host/baseURL should be set in Playwright config
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('load'); // ensure post-load class changes are applied
  }

  async toggleAppearance() {
    // Capture current class list so we can wait for a real change after clicking
    const before = (await this.html.getAttribute('class')) || '';

    await expect(this.appearanceToggle).toBeVisible();
    await this.appearanceToggle.click();

    // Wait until the <html> class actually changes (confirms toggle took effect)
    await this.page.waitForFunction(
      prev => (document.documentElement.className || '') !== prev,
      before
    );
  }

  // Assert that <html> contains a specific class (e.g., "Dark" or "Light")
  async assertHtmlHasClass(cls) {
    await expect.poll(
      () =>
        this.page.evaluate(
          className => document.documentElement.classList.contains(className),
          cls
        )
    ).toBe(true);
  }

  // Assert that <html> does NOT contain a specific class
  async assertHtmlNotHasClass(cls) {
    await expect.poll(
      () =>
        this.page.evaluate(
          className => document.documentElement.classList.contains(className),
          cls
        )
    ).toBe(false);
  }

  // Verify theme preference is persisted in localStorage
  async assertLocalStorageAppearance(expected) {
    const value = await this.page.evaluate(
      () => localStorage.getItem('colourSchemeAppearance')
    );
    expect(value).toBe(expected);
  }
}

module.exports = { NewScientistHomePage };
