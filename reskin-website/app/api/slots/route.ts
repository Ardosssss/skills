import { error, handleError, json } from "@/lib/api";
import { getStore } from "@/lib/db";
import { computeSlots } from "@/lib/slots";
import { addDaysYmd, isYmd, zurichToDate } from "@/lib/time";

export const dynamic = "force-dynamic";

/** GET /api/slots?from=YYYY-MM-DD&to=YYYY-MM-DD&duration=30[&token=…] – nur freie Zeiten, keine Kundendaten. */
export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const from = u.searchParams.get("from");
    const to = u.searchParams.get("to");
    const duration = Number(u.searchParams.get("duration"));
    const token = u.searchParams.get("token");
    if (!isYmd(from) || !isYmd(to) || to < from || to > addDaysYmd(from, 45)) return error("Ungültiger Zeitraum");
    if (!Number.isFinite(duration) || duration < 10 || duration > 300) return error("Ungültige Dauer");

    const store = getStore();
    const range = { from: zurichToDate(from, "00:00").toISOString(), to: zurichToDate(addDaysYmd(to, 1), "00:00").toISOString() };
    const [settings, bookings, blockers] = await Promise.all([store.getSettings(), store.listBookings(range), store.listBlockers(range)]);
    const slots = computeSlots({
      from,
      to,
      durationMin: duration,
      settings,
      bookings: token ? bookings.filter((b) => b.token !== token) : bookings,
      blockers,
    });
    return json({ slots });
  } catch (e) {
    return handleError(e);
  }
}
