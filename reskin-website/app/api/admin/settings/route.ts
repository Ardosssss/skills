import { error, handleError, json } from "@/lib/api";
import { getStore } from "@/lib/db";
import { isHm, toMin } from "@/lib/time";
import type { Settings } from "@/lib/types";

export async function GET() {
  try {
    return json({ settings: await getStore().getSettings() });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request) {
  try {
    const s = (await req.json()) as Settings;
    if (!Array.isArray(s.openingHours) || s.openingHours.length !== 7) return error("Öffnungszeiten ungültig");
    for (const day of s.openingHours)
      for (const r of day) if (!isHm(r.start) || !isHm(r.end) || toMin(r.end) <= toMin(r.start)) return error(`Ungültige Zeitspanne ${r.start}–${r.end}`);
    const num = (v: unknown, min: number, max: number) => typeof v === "number" && v >= min && v <= max;
    if (!num(s.slotStepMin, 5, 60) || !num(s.bufferMin, 0, 60) || !num(s.minLeadHours, 0, 168) || !num(s.maxDaysAhead, 7, 365) || !num(s.cancelHours, 0, 168))
      return error("Ungültige Einstellungen");
    await getStore().saveSettings(s);
    return json({ settings: s });
  } catch (e) {
    return handleError(e);
  }
}
