import { defaultSettings, weekdayNames } from "@/lib/catalog";
import { directions, site } from "@/lib/site";
import type { Settings } from "@/lib/types";
import { IconClock, IconInstagram, IconMail, IconPhone, IconPin, IconWhatsApp } from "../Icons";
import { Reveal } from "../Reveal";
import { ContactForm } from "./ContactForm";
import { MapEmbed } from "./MapEmbed";
import { SectionHeading } from "./SectionHeading";

const order = [1, 2, 3, 4, 5, 6, 0];

export function OpeningHours({ settings = defaultSettings }: { settings?: Settings }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[0.95rem]">
      {order.map((d) => (
        <div key={d} className="contents">
          <dt className="text-muted">{weekdayNames[d]}</dt>
          <dd>{settings.openingHours[d].length ? settings.openingHours[d].map((r) => `${r.start}–${r.end}`).join(", ") : "geschlossen"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Contact({ settings, headingAs = "h2" }: { settings?: Settings; headingAs?: "h1" | "h2" }) {
  return (
    <section id="kontakt" className="container-x py-20 md:py-28">
      <SectionHeading as={headingAs} eyebrow="Kontakt & Anfahrt" title="Ich freue mich auf dich" intro="Schreib mir am einfachsten per WhatsApp – oder buche direkt online." />
      <div className="grid gap-8 md:grid-cols-2">
        <Reveal className="space-y-8">
          <ul className="space-y-4 text-[0.98rem]">
            <li className="flex gap-4">
              <IconPin className="mt-0.5 shrink-0 text-forest" />
              <span>
                {site.address.street}, {site.address.floor}
                <br />
                {site.address.zip} {site.address.city} ({site.address.canton})
              </span>
            </li>
            <li className="flex gap-4">
              <IconPhone className="shrink-0 text-forest" />
              <a href={site.phoneHref} className="link-underline">{site.phone}</a>
            </li>
            <li className="flex gap-4">
              <IconWhatsApp className="shrink-0 text-forest" />
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="link-underline">WhatsApp-Nachricht schreiben</a>
            </li>
            <li className="flex gap-4">
              <IconInstagram className="shrink-0 text-forest" />
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="link-underline">{site.instagramHandle}</a>
            </li>
            <li className="flex gap-4">
              <IconMail className="shrink-0 text-forest" />
              <a href={`mailto:${site.email}`} className="link-underline">{site.email}</a>
            </li>
          </ul>
          <div className="flex gap-4">
            <IconClock className="mt-0.5 shrink-0 text-forest" />
            <div>
              <p className="mb-2 font-serif text-lg tracking-[0.1em] uppercase">Öffnungszeiten</p>
              <OpeningHours settings={settings} />
              <p className="mt-2 text-xs text-muted">Termine nach Vereinbarung.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-sand bg-sand-soft/70 p-5 text-[0.93rem]">
            <p className="font-serif text-lg tracking-[0.1em] uppercase">Anfahrt</p>
            <p className="mt-2"><strong>ÖV:</strong> {directions.oev}</p>
            <p className="mt-1"><strong>Parkieren:</strong> {directions.parking}</p>
            <p className="mt-1 text-muted">{directions.access}</p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <MapEmbed />
        </Reveal>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-start">
        <Reveal>
          <h3 className="h-display text-2xl">Schreib mir</h3>
          <p className="mt-3 text-muted">Fragen zu Behandlung, Preisen oder deinem Tattoo? Ich antworte in der Regel innerhalb eines Werktags.</p>
        </Reveal>
        <Reveal delay={100}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
