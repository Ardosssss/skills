import type { Metadata } from "next";
import { Prose } from "@/components/sections/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

export default function Impressum() {
  return (
    <Prose>
      <h1>Impressum</h1>
      <h2>Verantwortlich für den Inhalt</h2>
      <p>
        RE|SKIN – Tattoo- &amp; Haarentfernung
        <br />
        {site.owner}
        <br />
        {site.address.street}, {site.address.floor}
        <br />
        {site.address.zip} {site.address.city} ({site.address.canton}), Schweiz
      </p>
      <p>
        Telefon: <a href={site.phoneHref}>{site.phone}</a>
        <br />
        E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      <p>UID: {site.uid}</p>
      <h2>Berufliche Qualifikation</h2>
      <p>Sachkundenachweis für kosmetische Laserbehandlungen gemäss V-NISSG. Diplomierte Kosmetikerin.</p>
      <h2>Haftungsausschluss</h2>
      <p>
        Die Inhalte dieser Website wurden mit grösster Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit und Aktualität kann jedoch keine Gewähr übernommen werden. Die Informationen ersetzen keine individuelle Beratung. Ergebnisse von Behandlungen können individuell variieren.
      </p>
      <h2>Haftung für Links</h2>
      <p>Für Inhalte externer Websites, auf die verlinkt wird, sind ausschliesslich deren Betreiber verantwortlich.</p>
      <h2>Urheberrechte</h2>
      <p>Texte, Fotos und Grafiken auf dieser Website gehören RE|SKIN oder den genannten Rechteinhabern. Jede Verwendung bedarf der vorherigen schriftlichen Zustimmung.</p>
      <p className="note">Hinweis: Platzhalterangaben (Name, UID, Telefon) bitte vor der Veröffentlichung ergänzen.</p>
    </Prose>
  );
}
