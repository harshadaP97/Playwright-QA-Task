// src/utils/ga.js

// GA4 collection endpoint and host patterns we accept
const GA_PATH = '/g/collect';
const GA_HOST_SUFFIXES = ['google-analytics.com', 'analytics.google.com'];

/**
 * Returns true if the URL points to a GA4 collect call.
 * Accepts both primary domains and subdomains.
 */
function isGA(u) {
  return (
    u.pathname.endsWith(GA_PATH) &&
    GA_HOST_SUFFIXES.some(s => u.hostname === s || u.hostname.endsWith(`.${s}`))
  );
}

/**
 * Build a params object from a Playwright Request.
 * GA can send params in the query string AND/OR the POST body (URL-encoded).
 * Body values override query values when keys collide.
 */
function paramsFromRequest(req) {
  const u = new URL(req.url());
  const params = new URLSearchParams(u.search);

  const body = req.postData();
  if (typeof body === 'string' && body.length) {
    for (const [k, v] of new URLSearchParams(body)) params.set(k, v);
  }

  return Object.fromEntries(params.entries());
}

/**
 * Wait for a GA4 collect request with en=<eventName>.
 * Optionally filter by property ID (tid) and set a custom timeout.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} eventName - GA event name (e.g., 'page_view', 'user_engagement')
 * @param {{ tid?: string, timeout?: number }} [opts]
 * @returns {Promise<Record<string, string>>} - Map of GA params for the matched request
 */
async function waitForGAEvent(page, eventName, { tid, timeout = 100000 } = {}) {
  let matchedParams; // cache to avoid re-parsing after match

  const req = await page.waitForRequest((r) => {
    let u;
    try { u = new URL(r.url()); } catch { return false; }
    if (!isGA(u)) return false;

    const p = paramsFromRequest(r);
    if (tid && p.tid !== tid) return false;

    const ok = p.en === eventName;
    if (ok) matchedParams = p; // keep parsed params for return
    return ok;
  }, { timeout });

  return matchedParams ?? paramsFromRequest(req);
}

module.exports = { waitForGAEvent };
