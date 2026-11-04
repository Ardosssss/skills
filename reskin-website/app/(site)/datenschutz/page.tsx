import type { Metadata } from "next";
import { Prose } from "@/components/sections/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Datenschutzerklärung", alternates: { canonical: "/datenschutz" } };

export default function Datenschutz() {
  return (
    <Prose>
      <h1>Datenschutzerklärung</h1>
      <p>
        Diese Datenschutzerklärung informiert dich darüber, wie RE|SKIN Personendaten bearbeitet. Sie richtet sich nach dem Schweizer Bundesgesetz über den Datenschutz (revDSG) und der Datenschutzverordnung (DSV). Stand: November 2026.
      </p>

      <h2>1. Verantwortliche Stelle</h2>
      <p>
        RE|SKIN – Tattoo- &amp; Haarentfernung, {site.owner}, {site.address.street}, {site.address.zip} {site.address.city}. E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>

      <h2>2. Welche Daten wir bearbeiten</h2>
      <ul>
        <li><strong>Online-Buchung:</strong> Vor- und Nachname, E-Mail, Telefon, gewählte Behandlung, Termin, Bemerkungen und – bei Tattooentfernung freiwillig – ein Foto des Tattoos.</li>
        <li><strong>Gesundheitsangaben:</strong> Deine Antworten auf die Gesundheitsfragen (Kontraindikationen). Dabei handelt es sich um besonders schützenswerte Personendaten. Wir bearbeiten sie ausschliesslich, um die Sicherheit deiner Behandlung zu prüfen, und nur mit deiner ausdrücklichen Einwilligung bei der Buchung.</li>
        <li><strong>Kontaktformular, E-Mail, WhatsApp:</strong> die Angaben, die du uns mitteilst.</li>
        <li><strong>Server-Logdaten:</strong> technisch notwendige Daten wie IP-Adresse, Zeitpunkt und aufgerufene Seite, um die Website sicher zu betreiben.</li>
      </ul>

      <h2>3. Zweck</h2>
      <p>Terminplanung und -verwaltung, Durchführung der Behandlung, Versand von Bestätigungen und Erinnerungen, Beantwortung von Anfragen sowie Sicherheit und Betrieb der Website. Eine Verwendung zu Werbezwecken oder eine Weitergabe zu Marketingzwecken findet nicht statt.</p>

      <h2>4. Vertraulichkeit der Gesundheitsdaten</h2>
      <p>Gesundheitsangaben und Tattoo-Fotos werden verschlüsselt übertragen, in einer zugriffsgeschützten Datenbank bzw. einem privaten Speicher abgelegt und sind ausschliesslich im passwortgeschützten Admin-Bereich für die behandelnde Person einsehbar. Sie werden nicht per E-Mail versendet.</p>

      <h2>5. Auftragsbearbeiter und Bekanntgabe ins Ausland</h2>
      <p>Für den Betrieb setzen wir sorgfältig ausgewählte Dienstleister ein:</p>
      <ul>
        <li>Hosting der Website (z. B. Vercel Inc., USA/EU) – PLATZHALTER, bitte anpassen</li>
        <li>Datenbank und Dateispeicher: Supabase (Serverstandort bitte in der EU/Schweiz wählen, z. B. Frankfurt oder Zürich)</li>
        <li>E-Mail-Versand: Resend (USA)</li>
      </ul>
      <p>Bei einer Bekanntgabe in Staaten ohne angemessenes Datenschutzniveau stützen wir uns auf Standardvertragsklauseln bzw. das Swiss-U.S. Data Privacy Framework.</p>

      <h2>6. Cookies und externe Inhalte</h2>
      <p>Wir verwenden nur technisch notwendige Cookies (z. B. für die Anmeldung im Admin-Bereich) und speichern lokal, dass du den Cookie-Hinweis gesehen hast. Es gibt keine Analyse- oder Werbe-Tracker. Die Karte (OpenStreetMap) wird erst geladen, wenn du aktiv auf «Karte laden» klickst; dabei wird deine IP-Adresse an die OpenStreetMap Foundation übermittelt. Links zu Instagram, WhatsApp und Google führen zu externen Anbietern mit eigenen Datenschutzbestimmungen.</p>

      <h2>7. Aufbewahrung</h2>
      <p>Buchungs- und Behandlungsdaten bewahren wir so lange auf, wie es für die Behandlung erforderlich ist und gesetzliche Aufbewahrungspflichten (z. B. 10 Jahre für Buchhaltungsunterlagen) bestehen. Kontaktanfragen löschen wir, sobald sie erledigt sind. PLATZHALTER: Fristen bitte festlegen.</p>

      <h2>8. Deine Rechte</h2>
      <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Herausgabe bzw. Übertragung deiner Daten sowie das Recht, eine Einwilligung jederzeit zu widerrufen. Melde dich dazu bei <a href={`mailto:${site.email}`}>{site.email}</a>. Zudem kannst du dich beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) beschweren.</p>

      <h2>9. Datensicherheit</h2>
      <p>Wir treffen angemessene technische und organisatorische Massnahmen, z. B. TLS-Verschlüsselung, Zugriffsbeschränkungen und passwortgeschützte Administration.</p>

      <p className="note">Hinweis: Diese Vorlage ersetzt keine Rechtsberatung. Bitte vor der Veröffentlichung prüfen und an die tatsächlich verwendeten Dienstleister anpassen.</p>
    </Prose>
  );
}
