import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "bun run build && bun run preview",
    port: 4173,
  },
  testDir: "e2e",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chromium",
        launchOptions: {
          executablePath: "/run/current-system/sw/bin/chromium",
        },
      },
    },
  ],
});
