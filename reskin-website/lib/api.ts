import { NextResponse } from "next/server";
import { ValidationError } from "./booking";
import { SlotTakenError } from "./types";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export const error = (message: string, status = 400) => json({ error: message }, status);

export function handleError(e: unknown) {
  if (e instanceof SlotTakenError) return error(e.message, 409);
  if (e instanceof ValidationError) return error(e.message, 400);
  console.error(e);
  return error("Da ist etwas schiefgelaufen. Bitte versuche es nochmals oder melde dich per WhatsApp.", 500);
}
