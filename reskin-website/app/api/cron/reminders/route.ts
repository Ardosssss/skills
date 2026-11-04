import { error, json } from "@/lib/api";
import { getStore } from "@/lib/db";
import { reminderMail, sendMail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Versendet Erinnerungen für Termine in den nächsten 24 Stunden.
 * Stündlich aufrufen (Vercel Cron, Supabase pg_cron oder externer Dienst)
 * mit Header `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return error("Nicht autorisiert", 401);
  const store = getStore();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600_000);
  const due = (await store.listBookings({ from: now.toISOString(), to: in24h.toISOString() })).filter(
    (b) => b.status === "bestaetigt" && !b.reminderSentAt && new Date(b.startAt) > now,
  );
  let sent = 0;
  for (const b of due) {
    const r = await sendMail(reminderMail(b));
    if (r.ok) {
      await store.updateBooking(b.id, { reminderSentAt: new Date().toISOString() });
      sent++;
    }
  }
  return json({ ok: true, sent });
}
