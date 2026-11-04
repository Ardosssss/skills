import { error, handleError, json } from "@/lib/api";
import { buildNewBooking, isSlotFree, parsePayload, publicBooking, ValidationError } from "@/lib/booking";
import { getStore } from "@/lib/db";
import { confirmationMail, sendMail, studioNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_PHOTO = 6 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  if (!rateLimit(req, "booking", 8, 10 * 60_000)) return error("Zu viele Anfragen. Bitte versuche es später nochmals.", 429);
  try {
    const form = await req.formData();
    const payload = parsePayload(JSON.parse(String(form.get("payload") ?? "{}")));
    if (payload.website) return json({ ok: true }); // Honeypot: Bots erhalten scheinbar Erfolg

    const store = getStore();
    let photoKey: string | null = null;
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) {
      if (payload.category !== "tattoo") throw new ValidationError("Foto nur bei Tattooentfernung möglich.");
      if (!PHOTO_TYPES.includes(photo.type)) throw new ValidationError("Bitte lade ein JPG-, PNG- oder WebP-Bild hoch.");
      if (photo.size > MAX_PHOTO) throw new ValidationError("Das Foto ist zu gross (max. 6 MB).");
    }

    const nb = await buildNewBooking(payload, null);
    if (!(await isSlotFree(payload.date, payload.time, nb.durationMin))) return error("Dieser Termin ist leider nicht mehr frei. Bitte wähle eine andere Zeit.", 409);

    if (photo instanceof File && photo.size > 0) {
      photoKey = await store.savePhoto(Buffer.from(await photo.arrayBuffer()), photo.type);
    }
    const booking = await store.createBooking({ ...nb, photoKey });

    await Promise.allSettled([sendMail(confirmationMail(booking)), sendMail(studioNotification(booking, "neu"))]);
    return json({ ok: true, booking: publicBooking(booking) }, 201);
  } catch (e) {
    return handleError(e);
  }
}
