import { error, handleError, json } from "@/lib/api";
import { canModify, isSlotFree, publicBooking } from "@/lib/booking";
import { getStore } from "@/lib/db";
import { rescheduledMail, sendMail, studioNotification } from "@/lib/email";
import { isHm, isYmd, zurichToDate } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const { date, time } = (await req.json()) as { date?: string; time?: string };
    if (!isYmd(date) || !isHm(time)) return error("Bitte wähle Datum und Uhrzeit.");
    const store = getStore();
    const b = await store.getBookingByToken(token);
    if (!b) return error("Termin nicht gefunden", 404);
    if (!(await canModify(b))) return error("Online-Verschieben ist nur bis 24 Stunden vor dem Termin möglich. Bitte melde dich direkt bei mir.", 403);
    if (!(await isSlotFree(date, time, b.durationMin, b.id))) return error("Dieser Termin ist leider nicht mehr frei.", 409);
    const start = zurichToDate(date, time);
    const end = new Date(start.getTime() + b.durationMin * 60_000);
    const updated = await store.rescheduleBooking(b.id, start.toISOString(), end.toISOString());
    await Promise.allSettled([sendMail(rescheduledMail(updated)), sendMail(studioNotification(updated, "verschoben"))]);
    return json({ ok: true, booking: publicBooking(updated) });
  } catch (e) {
    return handleError(e);
  }
}
