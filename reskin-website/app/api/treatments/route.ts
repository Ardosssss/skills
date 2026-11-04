import { json } from "@/lib/api";
import { getPublicTreatments } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const treatments = await getPublicTreatments();
  return json({ treatments });
}
