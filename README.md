# Playwright-QA-Task

End‑to‑end tests that validate two real‑world behaviours across news sites:

1. **GA4 consent flow** on iNews Politics (mobile, UK).
2. **Dark/Light theme persistence** on New Scientist (desktop, UK, Dark mode).

---

## Highlights

* **Playwright (JavaScript)** with clear test naming and comments.
* **Light Page Object Model (POM) layer: `ConsentModal`, `PoliticsPage`, and `HomePage` for maintainable selectors and flows.
* **Network inspection** to assert GA4 `g/collect` query params before and after consent.
* **Resilient consent handling** using role/text selectors; verifies the modal is actually removed from the DOM.
* **Theme checks** via `<html>` class and `localStorage` for persistence across reloads.
* **UK region simulation**: `en-GB` language, `Europe/London` timezone.
* HTML report, screenshots/videos on failure.

---

## Test suites

### Suite 1 — iNews (Politics) GA4 checks

**Goal:** confirm GA4 parameters around the consent flow.

1. Visit `https://inews.co.uk/category/news/politics` on a **mobile Chrome** profile.
2. Before accepting consent, wait for a GA4 request to `https://www.google-analytics.com/g/collect` with `en=page_view` and assert:

   * `ep.sub_channel_1 = news/politics`
   * `gcs = G101`
   * `npa = 1`
3. Click **Accept** on the consent modal and confirm it is **removed from the DOM**.
4. After consent, wait for a GA4 `g/collect` with `en=user_engagement` and assert:

   * `gcs = G111`
   * `npa = 0` **or** the param is absent

### Suite 2 — New Scientist Dark Mode

**Goal:** confirm dark mode defaults and light‑mode override persists.

1. Visit `https://www.newscientist.com/` on **desktop Chrome** with **Dark Mode enabled**.
2. After the page `load` event, `<html>` has class `Dark`.
3. `localStorage['colourSchemeAppearance'] === 'Dark'`.
4. Dismiss the consent modal and verify it is removed.
5. Click the **Appearance toggle** (`#appearance-toggle`) to force **Light**.
6. `<html>` now has class `Light` and **not** `Dark`.
7. `localStorage['colourSchemeAppearance'] === 'Light'`.
8. Reload and confirm `<html>` still has class `Light` after `load`.

---

## Project structure

```
Playwright-QA-Task/
├─ src/
│  ├─ pages/
│  │  ├─ common/
│  │  │  └─ ConsentModal.js        # shared CMP interactions
│  │  ├─ inews/
│  │  │  └─ PoliticsPage.js        # page object for iNews Politics
│  │  └─ newscientist/
│  │     └─ HomePage.js            # page object for New Scientist home
│  └─ utils/
│     └─ ga.js                     # GA4 helpers (request parsing, waits)
├─ tests/
│  ├─ mobile/
│  │  └─ politics-ga.spec.js       # Suite 1
│  └─ desktop/
│     └─ newscientist-theme.spec.js# Suite 2
├─ playwright.config.js            # projects (mobile/desktop), UK headers, timeouts, reports
├─ package.json                    # scripts
├─ package-lock.json
├─ .gitignore
└─ README.md
```

This repo uses a light POM layer under src/pages/ for clarity and reuse. The ConsentModal handles consent actions shared across sites; site‑specific interactions live in inews/ and newscientist/. Utilities under src/utils/ provide GA request parsing and waits.

---

## Setup

```bash
npm ci
npx playwright install --with-deps
```

## Run all tests

```bash
npm test
```

---

## Configuration (key points)

* **Mobile profile:** Playwright’s Pixel device profile for the iNews suite.
* **Desktop + Dark Mode:** `colorScheme: 'dark'` for New Scientist.
* **Locale/timezone:** `locale: 'en-GB'` and `timezoneId: 'Europe/London'`.
* **Headers:** `Accept-Language: en-GB` to hint UK region.

These are set in `playwright.config.js` at project level so tests stay clean.

---

## How GA4 assertions work

* The tests **listen for network requests** to `https://www.google-analytics.com/g/collect`.
* They parse the query string and assert the parameters described above.
* Pre‑consent and post‑consent events are validated separately, ensuring the consent toggle changes analytics behaviour as expected.

---

## Troubleshooting

* **Consent modal not found:** CMPs sometimes A/B test copy. The helper tries several selectors and common button texts (Accept/Agree/Got it). If it fails, run headed and note the exact button text.
* **Network flake:** GA can batch/queue. The tests already wait for the right `en` value; if your network is slow, re‑run with `--headed` to observe.
* **Region mismatch:** Make sure `Accept-Language`, `locale`, and `timezoneId` are set as in config.

---
