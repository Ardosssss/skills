import { error, handleError, json } from "@/lib/api";
import { getStore } from "@/lib/db";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return error("E-Mail fehlt");
  try {
    return json({ note: await getStore().getCustomerNote(email) });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request) {
  try {
    const { email, note } = (await req.json()) as { email?: string; note?: string };
    if (!email || typeof note !== "string") return error("Ungültige Daten");
    return json({ note: await getStore().saveCustomerNote(email, note.slice(0, 5000)) });
  } catch (e) {
    return handleError(e);
  }
}
