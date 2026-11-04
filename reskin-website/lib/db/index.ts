import "server-only";
import { fileStore } from "./file-store";
import type { Store } from "./store";
import { supabaseStore } from "./supabase-store";

export const usingSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export function getStore(): Store {
  return usingSupabase ? supabaseStore : fileStore;
}

/** Öffentliche Preisliste – fällt bei Datenbankfehlern auf die Standardwerte zurück. */
export async function getPublicTreatments() {
  const { defaultTreatments } = await import("../catalog");
  try {
    return (await getStore().listTreatments()).filter((t) => t.active);
  } catch (e) {
    console.error("[treatments] Fallback auf Standardpreise", e);
    return defaultTreatments;
  }
}

export async function getPublicSettings() {
  const { defaultSettings } = await import("../catalog");
  try {
    return await getStore().getSettings();
  } catch (e) {
    console.error("[settings] Fallback auf Standard-Öffnungszeiten", e);
    return defaultSettings;
  }
}
