import { error, handleError, json } from "@/lib/api";
import { canModify, publicBooking } from "@/lib/booking";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const b = await getStore().getBookingByToken(token);
    if (!b) return error("Termin nicht gefunden", 404);
    return json({ booking: publicBooking(b), canModify: await canModify(b) });
  } catch (e) {
    return handleError(e);
  }
}
