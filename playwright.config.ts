import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  workers: 1,
  // The dev server compiles pages on first request (and fetches web fonts), which can exceed the 5 s default.
  expect: { timeout: 15_000 },
  use: { baseURL: "http://127.0.0.1:3100" },
  webServer: {
    command: "npm run dev -- -p 3100 -H 127.0.0.1",
    url: "http://127.0.0.1:3100/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
