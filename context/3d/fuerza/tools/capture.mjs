// Captures the lab viewer canvas for the fuerza model. Usage: node .fuerza-capture.mjs <outPrefix> [views...]
// Resolve Playwright from apps/web (pnpm does not hoist it): run with NODE_PATH=apps/web/node_modules.
import { chromium } from "@playwright/test";
const [prefix, ...rest] = process.argv.slice(2);
const views = rest.length > 0 ? rest : ["side", "three-quarter"];
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1
  });
  const logs = [];
  page.on("console", (m) => logs.push(`${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
  for (const v of views) {
    const [view, extra] = v.split("+");
    const url = `http://localhost:3921/lab/bikes?model=fuerza&view=${view}&lock=1${extra === "compare" ? "&compare=1" : ""}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-testid=bike-canvas][data-ready="1"]', { timeout: 30000 });
    await page.waitForTimeout(600);
    const stats = await page.evaluate(() => {
      const c = document.querySelector("[data-testid=bike-canvas] canvas");
      return c ? { w: c.width, h: c.height } : null;
    });
    await page.locator("[data-testid=bike-canvas]").screenshot({ path: `${prefix}-${v}.png` });
    process.stdout.write(`\n${v} ${JSON.stringify(stats)}`);
  }
  process.stdout.write(
    "\n" + logs.filter((l) => !l.startsWith("debug") && !l.includes("[vite]")).join("\n")
  );
} finally {
  await browser.close();
}
