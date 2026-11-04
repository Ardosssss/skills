import { error, handleError, json } from "@/lib/api";
import { canModify, publicBooking } from "@/lib/booking";
import { getStore } from "@/lib/db";
import { cancelledMail, sendMail, studioNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const store = getStore();
    const b = await store.getBookingByToken(token);
    if (!b) return error("Termin nicht gefunden", 404);
    if (!(await canModify(b))) return error("Eine Online-Stornierung ist nur bis 24 Stunden vor dem Termin möglich. Bitte melde dich direkt bei mir.", 403);
    const updated = await store.updateBooking(b.id, { status: "storniert" });
    await Promise.allSettled([sendMail(cancelledMail(updated)), sendMail(studioNotification(updated, "storniert"))]);
    return json({ ok: true, booking: publicBooking(updated) });
  } catch (e) {
    return handleError(e);
  }
}
