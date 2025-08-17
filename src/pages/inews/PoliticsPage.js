// src/pages/inews/PoliticsPage.js
const { ConsentModal } = require('../common/ConsentModal');

class PoliticsPage {
  constructor(page) {
    this.page = page;
    // Relative path for the iNews Politics section
    this.path = '/category/news/politics';
    // Reuse shared ConsentModal helper
    this.consent = new ConsentModal(page);
  }

  async goto() {
    // Navigate directly using the path; host is defined in config
    await this.page.goto(this.path, { waitUntil: 'load' });
  }
}

module.exports = { PoliticsPage };
