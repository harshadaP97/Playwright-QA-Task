// tests/mobile/politics-ga.spec.js
const { test, expect } = require('@playwright/test');
const { PoliticsPage } = require('../../src/pages/inews/PoliticsPage');
const { waitForGAEvent } = require('../../src/utils/ga');

test.describe('GA consent behaviour (mobile, UK) @mobile', () => {
  test('should update GA params after accepting consent', async ({ page }) => {
    if (process.env.DEBUG_GA) {
      page.on('request', r => {
        const u = r.url();
        if (u.includes('analytics') || u.includes('doubleclick')) {
          console.log('[GA?]', r.method(), u, 'BODY=', r.postData());
        }
      });
    }

    const politics = new PoliticsPage(page);

    // ---- PAGE VIEW (pre-consent) ----
    const pvPromise = waitForGAEvent(page, 'page_view');
    await politics.goto();
    const pv = await pvPromise;
    expect(pv['ep.sub_channel_1']).toBe('news/politics');
    expect(pv['gcs']).toBe('G101');
    expect(pv['npa']).toBe('1');

    // ---- USER ENGAGEMENT (post-consent) ----
    const uePromise = waitForGAEvent(page, 'user_engagement');
    await politics.consent.clickAccept();
    await politics.consent.assertRemoved();
    const ue = await uePromise;
    expect(ue['gcs']).toBe('G111');
    if (ue['npa'] !== undefined) {
      expect(ue['npa']).toBe('0');
    }
  });
});
