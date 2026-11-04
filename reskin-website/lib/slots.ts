import type { Blocker, Settings } from "./types";
import { addDaysYmd, fromMin, toMin, weekdayOfYmd, zurichParts, zurichToDate } from "./time";

type Busy = { startAt: string; endAt: string };

/**
 * Berechnet freie Startzeiten pro Tag (Schweizer Lokalzeit).
 * Ein Slot ist frei, wenn [Start, Start + Dauer) vollständig in den Öffnungszeiten liegt
 * und sich (inkl. Puffer) mit keinem Termin und keinem Blocker überschneidet.
 */
export function computeSlots(opts: {
  from: string;
  to: string;
  durationMin: number;
  settings: Settings;
  bookings: Busy[];
  blockers: Blocker[];
  now?: Date;
}): Record<string, string[]> {
  const { settings, durationMin } = opts;
  const now = opts.now ?? new Date();
  const earliest = now.getTime() + settings.minLeadHours * 3600_000;
  const todayYmd = zurichParts(now).ymd;
  const lastYmd = addDaysYmd(todayYmd, settings.maxDaysAhead);
  const buffer = settings.bufferMin * 60_000;

  const busy = [
    ...opts.bookings.map((b) => [new Date(b.startAt).getTime() - buffer, new Date(b.endAt).getTime() + buffer] as const),
    ...opts.blockers.map((b) => [new Date(b.startAt).getTime(), new Date(b.endAt).getTime()] as const),
  ];

  const result: Record<string, string[]> = {};
  for (let ymd = opts.from; ymd <= opts.to; ymd = addDaysYmd(ymd, 1)) {
    if (ymd < todayYmd || ymd > lastYmd) continue;
    const ranges = settings.openingHours[weekdayOfYmd(ymd)] ?? [];
    const times: string[] = [];
    for (const r of ranges) {
      const open = toMin(r.start);
      const close = toMin(r.end);
      for (let m = open; m + durationMin <= close; m += settings.slotStepMin) {
        const s = zurichToDate(ymd, fromMin(m)).getTime();
        const e = s + durationMin * 60_000;
        if (s < earliest) continue;
        if (busy.some(([bs, be]) => s < be && e > bs)) continue;
        times.push(fromMin(m));
      }
    }
    if (times.length) result[ymd] = times;
  }
  return result;
}
