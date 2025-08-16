// src/pages/common/ConsentModal.js
const { expect } = require('@playwright/test');

class ConsentModal {
  constructor(page) {
    this.page = page;
    this.acceptName = /^(accept( all)?|got it|i agree|agree|okay|ok)/i;

    // Stable top-level locator
    this.topLevelAccept = page.getByRole('button', { name: this.acceptName });
  }

  async clickAccept() {
    if (await this.topLevelAccept.count()) {
      await this.topLevelAccept.first().click();
      return;
    }
    // Fallback: scan iframes (dynamic logic belongs in methods)
    for (const frame of this.page.frames()) {
      const btn = frame.getByRole('button', { name: this.acceptName });
      if (await btn.count()) {
        await btn.first().click();
        return;
      }
    }
    // Optional: throw if not found
    // throw new Error('Consent accept button not found.');
  }

  async assertRemoved() {
    await expect(this.topLevelAccept).toHaveCount(0);
  }
}

module.exports = { ConsentModal };
