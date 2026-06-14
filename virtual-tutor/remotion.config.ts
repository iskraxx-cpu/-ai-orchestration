// See all configuration options: https://remotion.dev/docs/config

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Modern full Chrome only supports the new headless mode.
Config.setChromeMode("chrome-for-testing");

// Use a pre-installed Chromium instead of downloading Remotion's headless
// shell (remotion.media is often blocked by network egress policies).
const findBrowserExecutable = (): string | null => {
  const fromEnv = process.env.REMOTION_BROWSER_EXECUTABLE;
  if (fromEnv && existsSync(fromEnv)) {
    return fromEnv;
  }

  const candidates = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/opt/google/chrome/chrome",
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const pwRoot = "/opt/pw-browsers";
  if (existsSync(pwRoot)) {
    const dirs = readdirSync(pwRoot)
      .filter((name) => name.startsWith("chromium"))
      .sort()
      .reverse();
    for (const dir of dirs) {
      const bin = join(pwRoot, dir, "chrome-linux", "chrome");
      if (existsSync(bin)) {
        return bin;
      }
    }
  }

  return null;
};

const browserExecutable = findBrowserExecutable();
if (browserExecutable) {
  Config.setBrowserExecutable(browserExecutable);
}
