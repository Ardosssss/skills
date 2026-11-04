import type { Metadata } from "next";
import { Prose } from "@/components/sections/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "AGB", alternates: { canonical: "/agb" } };

export default function Agb() {
  return (
    <Prose>
      <h1>Allgemeine Geschäftsbedingungen</h1>
      <h2>1. Geltungsbereich</h2>
      <p>Diese AGB gelten für alle Behandlungen und Terminbuchungen bei RE|SKIN – Tattoo- &amp; Haarentfernung, {site.address.street}, {site.address.zip} {site.address.city}.</p>
      <h2>2. Terminbuchung</h2>
      <p>Mit der Online-Buchung kommt eine verbindliche Terminreservation zustande. Du erhältst eine Bestätigung per E-Mail.</p>
      <h2>3. Verschieben und Absagen</h2>
      <p>Termine können bis 24 Stunden vor Beginn kostenlos über den Link in der Bestätigung verschoben oder storniert werden. Bei späterer Absage oder Nichterscheinen kann bis zu 50 % des Behandlungspreises in Rechnung gestellt werden (PLATZHALTER – bitte festlegen). Bei Verspätung kann sich die Behandlungszeit entsprechend verkürzen.</p>
      <h2>4. Gesundheitsangaben und Mitwirkung</h2>
      <p>Du bist verpflichtet, Fragen zu deinem Gesundheitszustand wahrheitsgemäss zu beantworten und Änderungen (z. B. Medikamente, Schwangerschaft, Sonnenbrand) vor der Behandlung mitzuteilen. Bei Kontraindikationen kann eine Behandlung zu deiner Sicherheit abgelehnt oder verschoben werden.</p>
      <h2>5. Ergebnisse</h2>
      <p>Laserbehandlungen wirken individuell unterschiedlich. Ein bestimmtes Ergebnis oder eine bestimmte Anzahl Sitzungen kann nicht garantiert werden. Es werden keine Heilversprechen abgegeben.</p>
      <h2>6. Preise und Zahlung</h2>
      <p>Es gelten die zum Zeitpunkt der Buchung publizierten Preise in CHF. Bezahlt wird nach der Behandlung mit TWINT, Karte oder bar. Pakete sind bei der ersten Sitzung zu bezahlen, persönlich und nicht übertragbar und 18 Monate gültig (PLATZHALTER). Bereits bezahlte, nicht bezogene Sitzungen werden nicht rückerstattet, ausser aus medizinischen Gründen.</p>
      <h2>7. Haftung</h2>
      <p>RE|SKIN haftet im Rahmen der gesetzlichen Bestimmungen. Für Folgen unvollständiger oder falscher Gesundheitsangaben sowie Nichteinhaltung der Pflegehinweise wird keine Haftung übernommen.</p>
      <h2>8. Datenschutz</h2>
      <p>Es gilt die Datenschutzerklärung.</p>
      <h2>9. Anwendbares Recht und Gerichtsstand</h2>
      <p>Es gilt Schweizer Recht. Gerichtsstand ist {site.address.city} (LU).</p>
      <p className="note">Hinweis: Vorlage mit Platzhaltern – bitte vor der Veröffentlichung juristisch prüfen lassen.</p>
    </Prose>
  );
}
