const { ConsentModal } = require('../common/ConsentModal');

class PoliticsPage {
  constructor(page) {
    this.page = page;
    this.path = '/category/news/politics'; // path part of the URL
    this.consent = new ConsentModal(page);
  }

async goto() {
    await this.page.goto(this.path, { waitUntil: 'load' });
}

}

module.exports = { PoliticsPage };
