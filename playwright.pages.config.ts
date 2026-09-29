import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/pages",
  outputDir: "test-results-pages",
  timeout: 30000,
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:4175",
    channel: "chrome",
    headless: true,
    viewport: { width: 1440, height: 900 },
    permissions: ["clipboard-read", "clipboard-write"],
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "python3 -m http.server --bind 127.0.0.1 --directory dist-pages 4175",
    url: "http://127.0.0.1:4175/frontend/index.html",
    reuseExistingServer: !process.env.CI,
  },
});
