import { revalidatePath } from "next/cache";
import { error, handleError, json } from "@/lib/api";
import { getStore } from "@/lib/db";
import type { Treatment } from "@/lib/types";

const refresh = () => ["/", "/preise", "/haarentfernung", "/tattooentfernung"].forEach((p) => revalidatePath(p));

export async function GET() {
  try {
    return json({ treatments: await getStore().listTreatments() });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const t = (await req.json()) as Treatment;
    const price = (v: unknown) => v === null || (typeof v === "number" && v >= 0 && v < 100000);
    if (!t.id || !/^[\w-]{1,60}$/.test(t.id)) return error("Ungültige ID");
    if (!["beratung", "haar", "tattoo", "kosmetik"].includes(t.category)) return error("Ungültige Kategorie");
    if (!t.name?.trim()) return error("Name fehlt");
    if (!(Number.isInteger(t.durationMin) && t.durationMin >= 5 && t.durationMin <= 480)) return error("Dauer muss zwischen 5 und 480 Minuten liegen");
    if (!price(t.price) || !price(t.pricePackage)) return error("Ungültiger Preis");
    const saved = await getStore().upsertTreatment({
      id: t.id,
      category: t.category,
      group: t.group || null,
      name: t.name.trim().slice(0, 120),
      description: t.description?.trim().slice(0, 200) || null,
      durationMin: t.durationMin,
      price: t.price,
      pricePackage: t.pricePackage,
      active: Boolean(t.active),
      sort: Number(t.sort) || 0,
    });
    refresh();
    return json({ treatment: saved });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return error("ID fehlt");
  try {
    await getStore().deleteTreatment(id);
    refresh();
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
