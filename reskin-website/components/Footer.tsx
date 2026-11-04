import Link from "next/link";
import { nav, site } from "@/lib/site";
import { IconInstagram, IconWhatsApp } from "./Icons";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-forest text-linen">
      <div className="absolute inset-0 bg-[url('/textures/palm-corner.svg')] bg-[length:560px] bg-right-top bg-no-repeat opacity-[0.07] invert" aria-hidden />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:py-20">
        <div>
          <Logo light />
          <p className="mt-6 max-w-xs text-[0.95rem] leading-relaxed text-linen/80">
            Laser-Haarentfernung, Tattooentfernung und Kosmetik in Ebikon – zertifiziert nach V-NISSG, mit Zeit, Ruhe und ehrlicher Beratung.
          </p>
          <div className="mt-6 flex gap-3">
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram @reskin.studio" className="grid h-11 w-11 place-items-center rounded-full border border-linen/30 transition-colors hover:bg-linen/10">
              <IconInstagram />
            </a>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-11 w-11 place-items-center rounded-full border border-linen/30 transition-colors hover:bg-linen/10">
              <IconWhatsApp />
            </a>
          </div>
        </div>
        <div>
          <p className="eyebrow !text-sage">Studio</p>
          <address className="mt-4 text-[0.95rem] leading-relaxed text-linen/85 not-italic">
            {site.address.street}, {site.address.floor}
            <br />
            {site.address.zip} {site.address.city} ({site.address.canton})
            <br />
            <a href={site.phoneHref} className="link-underline">{site.phone}</a>
            <br />
            <a href={`mailto:${site.email}`} className="link-underline">{site.email}</a>
          </address>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow !text-sage">Angebot</p>
          <ul className="mt-4 space-y-2 text-[0.95rem] text-linen/85">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="link-underline">{n.label}</Link>
              </li>
            ))}
            <li><Link href="/buchen" className="link-underline">Termin buchen</Link></li>
          </ul>
        </nav>
        <div>
          <p className="eyebrow !text-sage">Rechtliches</p>
          <ul className="mt-4 space-y-2 text-[0.95rem] text-linen/85">
            <li><Link href="/impressum" className="link-underline">Impressum</Link></li>
            <li><Link href="/datenschutz" className="link-underline">Datenschutz</Link></li>
            <li><Link href="/agb" className="link-underline">AGB</Link></li>
          </ul>
        </div>
      </div>
      <div className="container-x relative flex flex-col gap-2 border-t border-linen/15 py-6 pb-28 text-xs tracking-[0.08em] text-linen/60 md:flex-row md:justify-between md:pb-6">
        <p>© {new Date().getFullYear()} RE|SKIN – Tattoo- &amp; Haarentfernung, Ebikon</p>
        <p>Ergebnisse können individuell variieren.</p>
      </div>
    </footer>
  );
}
