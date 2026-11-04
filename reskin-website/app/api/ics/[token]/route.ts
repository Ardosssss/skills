import { getStore } from "@/lib/db";
import { buildIcs } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const b = await getStore().getBookingByToken(token);
  if (!b) return new Response("Nicht gefunden", { status: 404 });
  return new Response(buildIcs(b), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="termin-reskin.ics"',
      "Cache-Control": "no-store",
    },
  });
}
