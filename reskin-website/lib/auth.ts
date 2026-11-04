import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "reskin_admin";
const MAX_AGE = 60 * 60 * 12; // 12 Stunden

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET fehlt oder ist zu kurz");
    return new TextEncoder().encode("dev-only-secret-bitte-in-env-setzen");
  }
  return new TextEncoder().encode(s);
}

export async function createSession(email: string) {
  const token = await new SignJWT({ sub: email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  return { token, maxAge: MAX_AGE };
}

export async function verifySession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin" ? (payload.sub as string) : null;
  } catch {
    return null;
  }
}

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Buffer.from(buf).toString("hex");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function checkCredentials(email: string, password: string) {
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (!adminEmail || email.toLowerCase() !== adminEmail) return false;
  const hash = process.env.ADMIN_PASSWORD_SHA256;
  if (hash) return safeEqual(await sha256Hex(password), hash.toLowerCase());
  const plain = process.env.ADMIN_PASSWORD;
  return Boolean(plain) && safeEqual(await sha256Hex(password), await sha256Hex(plain!));
}
