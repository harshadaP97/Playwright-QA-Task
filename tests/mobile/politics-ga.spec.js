// tests/mobile/politics-ga.spec.js
const { test, expect } = require('@playwright/test');
const { PoliticsPage } = require('../../src/pages/inews/PoliticsPage');
const { waitForGAEvent } = require('../../src/utils/ga');

test.describe('inews — GA consent behaviour (mobile, UK) @mobile', () => {
  test('GA params before and after consent', async ({ page }) => {
    // Optional: turn on verbose GA logging with DEBUG_GA=1
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
    // Start listening BEFORE the action that triggers the request
    const pvPromise = waitForGAEvent(page, 'page_view');
    await politics.goto();                 // trigger page_view
    const pv = await pvPromise;            // then assert
    expect(pv['ep.sub_channel_1']).toBe('news/politics');
    expect(pv['gcs']).toBe('G101');        // consent denied
    expect(pv['npa']).toBe('1');           // non-personalised ads

    // ---- USER ENGAGEMENT (post-consent) ----
    // Again: start listening BEFORE clicking Accept
    const uePromise = waitForGAEvent(page, 'user_engagement');
    await politics.consent.clickAccept();  // trigger consent flow
    await politics.consent.assertRemoved();
    const ue = await uePromise;            // then assert
    expect(ue['gcs']).toBe('G111');        // consent granted
    if (ue['npa'] !== undefined) {
      expect(ue['npa']).toBe('0');
    }
  });
});
