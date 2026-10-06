import { expect, test } from "@playwright/test";

const NON_E2E_HTTP_URL = /^https?:\/\/(?!127\.0\.0\.1:3100(?:[/?#]|$))/;

test.beforeEach(async ({ page }) => {
  await page.route(NON_E2E_HTTP_URL, (route) => route.abort("blockedbyclient"));
});

test("renders the home page with its SEO essentials", async ({ page }) => {
  const response = await page.goto("./");

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://127.0.0.1:3100/"
  );
  await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
});

test("serves robots.txt and sitemap.xml", async ({ request }) => {
  const robots = await request.get("./robots.txt");
  expect(await robots.text()).toContain("Sitemap: http://127.0.0.1:3100/sitemap.xml");

  const sitemap = await request.get("./sitemap.xml");
  expect(await sitemap.text()).toContain("<loc>http://127.0.0.1:3100/</loc>");
});
