// src/pages/newscientist/HomePage.js
const { expect } = require('@playwright/test');
const { ConsentModal } = require('../common/ConsentModal');

class NewScientistHomePage {
  constructor(page) {
    this.page = page;
    this.html = page.locator('html');
    this.appearanceToggle = page.locator('#appearance-toggle');
    this.consent = new ConsentModal(page);
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('load');
  }

  async toggleAppearance() {
    const before = (await this.html.getAttribute('class')) || '';
    await expect(this.appearanceToggle).toBeVisible();
    await this.appearanceToggle.click();
    // wait until the html class actually changes
    await this.page.waitForFunction(
      prev => (document.documentElement.className || '') !== prev,
      before
    );
  }

  async assertHtmlHasClass(cls) {
  await expect.poll(
    () => this.page.evaluate(
      (className) => document.documentElement.classList.contains(className),
      cls
    ),
  ).toBe(true);
}

async assertHtmlNotHasClass(cls) {
  await expect.poll(
    () => this.page.evaluate(
      (className) => document.documentElement.classList.contains(className),
      cls
    ),
  ).toBe(false);
}

  async assertLocalStorageAppearance(expected) {
    const value = await this.page.evaluate(
      () => localStorage.getItem('colourSchemeAppearance')
    );
    expect(value).toBe(expected);
  }
}

module.exports = { NewScientistHomePage };
