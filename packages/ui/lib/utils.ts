import { createCn } from "cn/config";

/**
 * The app's type scale (`text-caption` … `text-display`, defined in apps/web app.css) is not
 * in tailwind-merge's default config, so without this `cn("text-label text-paper")` treats
 * both as text colors and silently drops the size.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["caption", "label", "body", "subheading", "heading", "title", "display"] }
      ]
    }
  }
});
