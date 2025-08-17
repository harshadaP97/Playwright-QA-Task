// src/pages/common/ConsentModal.js
const { expect } = require('@playwright/test');

class ConsentModal {
  constructor(page) {
    this.page = page;
    // Regex covers common consent button texts (Accept, Got it, I Agree, etc.)
    this.acceptName = /^(accept( all)?|got it|i agree|agree|okay|ok)/i;

    // Main page locator (first match is usually the right one)
    this.topLevelAccept = page.getByRole('button', { name: this.acceptName });
  }

  async clickAccept() {
    // Try top-level button first
    if (await this.topLevelAccept.count()) {
      await this.topLevelAccept.first().click({ timeout: 15000 });
      return;
    }

    // Fallback: sometimes the consent lives inside an iframe
    for (const frame of this.page.frames()) {
      const btn = frame.getByRole('button', { name: this.acceptName }).first();
      const visible = await btn.isVisible({ timeout: 1000 }).catch(() => false);
      if (visible) {
        await btn.click({ timeout: 15000 });
        return;
      }
    }
  }

  async assertRemoved() {
    // Ensure consent modal has been dismissed from DOM
    await expect(this.topLevelAccept).toHaveCount(0);
  }
}

module.exports = { ConsentModal };
