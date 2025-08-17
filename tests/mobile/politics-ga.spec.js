// tests/mobile/politics-ga.spec.js
const { test, expect } = require('@playwright/test');
const { PoliticsPage } = require('../../src/pages/inews/PoliticsPage');
const { waitForGAEvent } = require('../../src/utils/ga');

test.describe('inews — GA consent behaviour (mobile, UK) @mobile', () => {
  test('GA params before and after consent', async ({ page }) => {
    // Debug mode: logs all GA-like requests if DEBUG_GA=1 is set
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
    // Begin listening *before* navigation so the GA request is caught
    const pvPromise = waitForGAEvent(page, 'page_view');
    await politics.goto();                 // triggers initial page_view
    const pv = await pvPromise;            // capture GA params
    expect(pv['ep.sub_channel_1']).toBe('news/politics');
    expect(pv['gcs']).toBe('G101');        // consent denied by default
    expect(pv['npa']).toBe('1');           // non-personalised ads flag

    // ---- USER ENGAGEMENT (post-consent) ----
    // Again: listen *before* the user action that triggers the event
    const uePromise = waitForGAEvent(page, 'user_engagement');
    await politics.consent.clickAccept();  // simulate user accepting CMP
    await politics.consent.assertRemoved(); // modal should disappear
    const ue = await uePromise;            // capture GA params
    expect(ue['gcs']).toBe('G111');        // consent granted
    if (ue['npa'] !== undefined) {
      expect(ue['npa']).toBe('0');         // personalised ads allowed
    }
  });
});
