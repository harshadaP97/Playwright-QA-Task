const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  reporter: [['list'], ['html']],
  use: {
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-uk',
      grep: /@mobile/i,
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.INEWS_BASE_URL || 'https://inews.co.uk',
      },
    },
    {
      name: 'desktop-dark-uk',
      grep: /@desktop/i,
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
        baseURL: process.env.NS_BASE_URL || 'https://www.newscientist.com',
      },
    },
  ],
});
