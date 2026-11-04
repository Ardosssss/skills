import { NextResponse } from "next/server";
import { error } from "@/lib/api";
import { checkCredentials, createSession, SESSION_COOKIE } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit(req, "login", 6, 15 * 60_000)) return error("Zu viele Versuche. Bitte warte 15 Minuten.", 429);
  const { email, password } = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  if (!email || !password || !(await checkCredentials(email, password))) {
    await new Promise((r) => setTimeout(r, 600));
    return error("E-Mail oder Passwort ist falsch.", 401);
  }
  const { token, maxAge } = await createSession(email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
