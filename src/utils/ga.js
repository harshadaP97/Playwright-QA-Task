const GA_PATH = '/g/collect';
const GA_HOST_SUFFIXES = ['google-analytics.com', 'analytics.google.com'];

function isGA(u) {
  return u.pathname.endsWith(GA_PATH) &&
    GA_HOST_SUFFIXES.some(s => u.hostname === s || u.hostname.endsWith(`.${s}`));
}

function paramsFromRequest(req) {
  const u = new URL(req.url());
  const params = new URLSearchParams(u.search);
  const body = req.postData();
  if (typeof body === 'string' && body.length) {
    for (const [k, v] of new URLSearchParams(body)) params.set(k, v);
  }
  return Object.fromEntries(params.entries());
}

async function waitForGAEvent(page, eventName, { tid, timeout = 30000 } = {}) {
  let matchedParams; // cache to avoid re-parsing after match
  const req = await page.waitForRequest((r) => {
    let u;
    try { u = new URL(r.url()); } catch { return false; }
    if (!isGA(u)) return false;

    const p = paramsFromRequest(r);
    if (tid && p.tid !== tid) return false;

    const ok = p.en === eventName;
    if (ok) matchedParams = p;
    return ok;
  }, { timeout });

  return matchedParams ?? paramsFromRequest(req);
}

module.exports = { waitForGAEvent };
