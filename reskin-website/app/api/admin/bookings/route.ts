import { error, handleError, json } from "@/lib/api";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const from = u.searchParams.get("from") ?? undefined;
    const to = u.searchParams.get("to") ?? undefined;
    if ((from && isNaN(Date.parse(from))) || (to && isNaN(Date.parse(to)))) return error("Ungültiger Zeitraum");
    const email = u.searchParams.get("email")?.toLowerCase();
    let bookings = await getStore().listBookings({ from, to, includeCancelled: true });
    if (email) bookings = bookings.filter((b) => b.email.toLowerCase() === email);
    return json({ bookings });
  } catch (e) {
    return handleError(e);
  }
}
