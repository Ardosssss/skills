import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";
import { getPublicSettings } from "@/lib/db";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Kontakt & Anfahrt – Zentralstrasse 10, Ebikon",
  description: "RE|SKIN, Zentralstrasse 10, 1. Stock, 6030 Ebikon (LU). Öffnungszeiten, Anfahrt mit ÖV und Auto, WhatsApp, Instagram und Kontaktformular.",
  alternates: { canonical: "/kontakt" },
};

export default async function KontaktPage() {
  return <Contact settings={await getPublicSettings()} headingAs="h1" />;
}
