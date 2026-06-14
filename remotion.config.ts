// See all configuration options: https://remotion.dev/docs/config
// Each option also is available as a CLI flag: https://remotion.dev/docs/cli

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// A full Chrome/Chromium binary (see below) only supports the *new* headless
// mode. The default "headless-shell" mode relies on the old headless mode that
// modern Chrome has removed, so switch to "chrome-for-testing".
Config.setChromeMode("chrome-for-testing");

// Use a system / pre-installed Chromium instead of downloading Remotion's
// headless shell. The download host (remotion.media) is not always reachable
// behind a restrictive network egress policy, so we point Remotion at a
// browser that already exists on the machine.
//
// Resolution order:
//   1. REMOTION_BROWSER_EXECUTABLE env var (explicit override)
//   2. Common system Chrome/Chromium locations
//   3. A Playwright-managed Chromium under /opt/pw-browsers/chromium-*
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

  // Playwright installs Chromium into a versioned directory, e.g.
  // /opt/pw-browsers/chromium-1194/chrome-linux/chrome
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
