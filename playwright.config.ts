import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3100" },
  webServer: {
    command: "npm run dev -- -p 3100 -H 127.0.0.1",
    url: "http://127.0.0.1:3100/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
