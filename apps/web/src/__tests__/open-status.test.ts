import { describe, expect, it, vi } from "vite-plus/test";

import { getOpenStatus } from "@/shared/lib/open-status";

const HOURS = [{ closes: "17:00", days: ["Mo", "Tu", "We", "Th", "Fr", "Sa"], opens: "10:00" }];

// Manila is UTC+8, no DST. 2026-10-10 is a Saturday, 2026-10-11 a Sunday, 2026-10-12 a Monday.
const manila = (iso: string) => new Date(`${iso}+08:00`);

vi.setConfig({ testTimeout: 5000 });

describe("getOpenStatus (Asia/Manila)", () => {
  it("is open Saturday 4:59 PM", () => {
    expect(getOpenStatus(HOURS, manila("2026-10-10T16:59:00"))).toMatchObject({
      open: true,
      label: "Open now · closes 5 PM"
    });
  });

  it("is closed at Saturday 5:00 PM and opens Monday", () => {
    expect(getOpenStatus(HOURS, manila("2026-10-10T17:00:00"))).toMatchObject({
      open: false,
      label: "Closed · opens Mon 10 AM"
    });
  });

  it("is closed all day Sunday", () => {
    expect(getOpenStatus(HOURS, manila("2026-10-11T12:00:00")).label).toBe(
      "Closed · opens Mon 10 AM"
    );
  });

  it("is closed Monday 9:59 AM and opens at 10 AM that day", () => {
    expect(getOpenStatus(HOURS, manila("2026-10-12T09:59:00")).label).toBe("Closed · opens 10 AM");
  });

  it("does not depend on the viewer's timezone: Sat 08:59 UTC is 4:59 PM Manila", () => {
    expect(getOpenStatus(HOURS, new Date("2026-10-10T08:59:00Z")).open).toBe(true);
  });
});
