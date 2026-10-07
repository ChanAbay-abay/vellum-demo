import { defineConfig, devices } from "@playwright/test";

const E2E_BASE_URL = "http://127.0.0.1:3100/";

export default defineConfig({
  outputDir: "./.cache/playwright",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  reporter: "list",
  testDir: "./__e2e__",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure"
  },
  webServer: {
    // Production build + preview, so tests see the prerendered pages crawlers get
    command: "vp run build && vp preview --host 127.0.0.1 --port 3100",
    env: {
      VITE_SITE_URL: "http://127.0.0.1:3100"
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: E2E_BASE_URL
  }
});
