import { describe, expect, it } from "vite-plus/test";

// A dedicated 800x450 fixture, so deleting the lab (and its photo) at delivery can't break this test.
import fixture from "./fixtures/pipeline.jpg?responsive";

// Regression guard for the image pipeline: vite-imagetools + the `?responsive` virtual module.
describe("?responsive image import", () => {
  it("resolves to picture sources, a full-width fallback and an inline blur placeholder", () => {
    expect(fixture.sources.avif).toBeTruthy();
    expect(fixture.sources.webp).toBeTruthy();
    // Widths above the source are never upscaled, so the fallback is the source width.
    expect(fixture.img.w).toBe(800);
    expect(fixture.placeholder.startsWith("data:image/webp;base64,")).toBe(true);
  });
});
