import { error, handleError, json } from "@/lib/api";
import { contactMail, sendMail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit(req, "contact", 5, 10 * 60_000)) return error("Zu viele Anfragen. Bitte versuche es später nochmals.", 429);
  try {
    const b = (await req.json()) as Record<string, unknown>;
    const s = (k: string, max: number) => (typeof b[k] === "string" ? (b[k] as string).trim().slice(0, max) : "");
    if (s("website", 100)) return json({ ok: true });
    const name = s("name", 120);
    const email = s("email", 160);
    const phone = s("phone", 40);
    const message = s("message", 3000);
    if (!name || !message) return error("Bitte fülle Name und Nachricht aus.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return error("Bitte gib eine gültige E-Mail-Adresse an.");
    if (b.consent !== true) return error("Bitte bestätige die Datenschutzerklärung.");
    const r = await sendMail(contactMail({ name, email, phone, message }));
    if (!r.ok) return error("Die Nachricht konnte nicht gesendet werden. Bitte schreib mir per WhatsApp.", 502);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
