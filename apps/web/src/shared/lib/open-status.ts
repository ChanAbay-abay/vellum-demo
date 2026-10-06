const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const SHORT_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

type Hours = readonly { closes: string; days: readonly string[]; opens: string }[];

/** Always Manila time, so the answer is the same for a viewer in any timezone. */
const MANILA = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  weekday: "short",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23"
});

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** "17:00" -> "5 PM", "10:30" -> "10:30 AM" */
function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour} ${suffix}` : `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export type OpenStatus = { open: boolean; label: string; short: string };

/** Open/closed at `now` against the posted hours, in Asia/Manila time. */
export function getOpenStatus(hours: Hours, now: Date): OpenStatus {
  const parts = MANILA.formatToParts(now);
  const weekday = SHORT_TO_INDEX[parts.find((p) => p.type === "weekday")?.value ?? "Sun"];
  const minutes =
    Number(parts.find((p) => p.type === "hour")?.value) * 60 +
    Number(parts.find((p) => p.type === "minute")?.value);

  const today = hours.find((h) => h.days.includes(DAYS[weekday]));
  if (today && minutes >= toMinutes(today.opens) && minutes < toMinutes(today.closes)) {
    return {
      open: true,
      label: `Open now · closes ${formatTime(today.closes)}`,
      short: "Open now"
    };
  }

  // Next opening: later today, otherwise the next day with hours (up to a week out).
  if (today && minutes < toMinutes(today.opens)) {
    return { open: false, label: `Closed · opens ${formatTime(today.opens)}`, short: "Closed" };
  }
  for (let d = 1; d <= 7; d++) {
    const idx = (weekday + d) % 7;
    const next = hours.find((h) => h.days.includes(DAYS[idx]));
    if (next) {
      return {
        open: false,
        label: `Closed · opens ${DAY_NAMES[idx]} ${formatTime(next.opens)}`,
        short: "Closed"
      };
    }
  }
  return { open: false, label: "Closed", short: "Closed" };
}
