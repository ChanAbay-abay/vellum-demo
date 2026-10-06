import { readdirSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

const NON_E2E_HTTP_URL = /^https?:\/\/(?!127\.0\.0\.1:3100(?:[/?#]|$))/;
const BLOCKED_BY_CLIENT = "net::ERR_BLOCKED_BY_CLIENT";

const VIEWPORTS = [
  { w: 375, h: 812 },
  { w: 768, h: 1024 },
  { w: 1440, h: 900 }
];

const SCROLL_STEPS = 6;

// Every prerendered page, including noindex ones the sitemap leaves out
function discoverRoutes() {
  const publicDir = path.resolve(import.meta.dirname, "../.output/public");
  let files: string[];
  try {
    files = readdirSync(publicDir, { recursive: true, encoding: "utf8" });
  } catch {
    throw new Error(`No build output at ${publicDir}. Run a build first.`);
  }

  const routes = files
    .filter((file) => path.basename(file) === "index.html")
    .map((file) => `/${path.dirname(file).split(path.sep).join("/")}`.replace(/^\/\.$/, "/"));

  if (routes.length === 0) {
    throw new Error(`No index.html found under ${publicDir}. Run a build first.`);
  }
  return routes;
}

const ROUTES = discoverRoutes();

test.describe.configure({ timeout: 30_000 });

for (const { w, h } of VIEWPORTS) {
  test.describe(`${w}px viewport`, () => {
    test.use({ viewport: { width: w, height: h } });

    for (const route of ROUTES) {
      test(`${route} @ ${w}px`, async ({ page }) => {
        await page.route(NON_E2E_HTTP_URL, (r) => r.abort("blockedbyclient"));

        const errors: string[] = [];
        page.on("console", (msg) => {
          if (msg.type() !== "error") return;
          const text = msg.text();
          if (text.includes(BLOCKED_BY_CLIENT)) return;
          errors.push(`console: ${text}`);
        });
        page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

        const response = await page.goto(`.${route}`);
        expect(response?.ok(), `${route} responded ${response?.status()}`).toBe(true);
        await page.waitForLoadState("load");
        await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
          timeout: 10_000
        });

        const assertNoOverflow = async (depth: string) => {
          const { scrollWidth, clientWidth } = await page.evaluate(() => {
            return {
              scrollWidth: document.documentElement.scrollWidth,
              clientWidth: document.documentElement.clientWidth
            };
          });
          expect(
            scrollWidth,
            `${route} @ ${w}px overflows horizontally at ${depth}: scrollWidth ${scrollWidth} > clientWidth ${clientWidth}`
          ).toBeLessThanOrEqual(clientWidth);
        };

        await assertNoOverflow("top");

        // Wheel, not scrollTo: Lenis owns scroll
        await page.mouse.move(w / 2, h / 2);
        const step = Math.round(h * 0.8);
        for (let i = 1; i <= SCROLL_STEPS; i++) {
          await page.mouse.wheel(0, step);
          await page.waitForTimeout(200);
          await assertNoOverflow(`step ${i}/${SCROLL_STEPS} (${i * step}px)`);
        }

        expect(errors, `console/page errors on ${route} @ ${w}px:\n${errors.join("\n")}`).toEqual(
          []
        );
      });
    }
  });
}
