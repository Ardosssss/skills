import { error, handleError, json } from "@/lib/api";
import { getStore } from "@/lib/db";
import type { BookingStatus } from "@/lib/types";

const STATUSES: BookingStatus[] = ["bestaetigt", "erledigt", "no_show", "storniert"];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const { status } = (await req.json()) as { status?: BookingStatus };
    if (!status || !STATUSES.includes(status)) return error("Ungültiger Status");
    const booking = await getStore().updateBooking(id, { status });
    return json({ booking });
  } catch (e) {
    return handleError(e);
  }
}
