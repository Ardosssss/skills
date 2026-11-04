import { getStore } from "@/lib/db";

export async function GET(_req: Request, ctx: { params: Promise<{ key: string }> }) {
  const { key } = await ctx.params;
  if (!/^[\w-]+\.(png|jpg|webp)$/.test(key)) return new Response("Ungültig", { status: 400 });
  const photo = await getStore().getPhoto(key);
  if (!photo) return new Response("Nicht gefunden", { status: 404 });
  return new Response(new Uint8Array(photo.data), { headers: { "Content-Type": photo.mime, "Cache-Control": "private, no-store" } });
}
