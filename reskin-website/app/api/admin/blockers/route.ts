import { error, handleError, json } from "@/lib/api";
import { getStore } from "@/lib/db";

export async function GET() {
  try {
    return json({ blockers: await getStore().listBlockers({ from: new Date(Date.now() - 30 * 86400_000).toISOString() }) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const b = (await req.json()) as { kind?: string; startAt?: string; endAt?: string; reason?: string };
    if (b.kind !== "ferien" && b.kind !== "blocker") return error("Ungültiger Typ");
    if (!b.startAt || !b.endAt || isNaN(Date.parse(b.startAt)) || isNaN(Date.parse(b.endAt)) || b.endAt <= b.startAt) return error("Ungültiger Zeitraum");
    const blocker = await getStore().addBlocker({
      kind: b.kind,
      startAt: new Date(b.startAt).toISOString(),
      endAt: new Date(b.endAt).toISOString(),
      reason: b.reason?.slice(0, 200) || null,
    });
    return json({ blocker }, 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return error("ID fehlt");
  try {
    await getStore().deleteBlocker(id);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
