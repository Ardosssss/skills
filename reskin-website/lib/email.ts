import "server-only";
import { careCards } from "./content";
import { categoryLabels } from "./catalog";
import { buildIcs, bookingTitle } from "./ics";
import { site } from "./site";
import { formatChf, formatDateLong, formatTime } from "./time";
import type { Booking } from "./types";

type Mail = { to: string; subject: string; html: string; replyTo?: string; ics?: string };

export async function sendMail(m: Mail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "RE|SKIN <onboarding@resend.dev>";
  if (!key) {
    console.info(`[email:dev] an ${m.to} – ${m.subject}`);
    return { ok: true, dev: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [m.to],
      subject: m.subject,
      html: m.html,
      reply_to: m.replyTo,
      attachments: m.ics ? [{ filename: "termin-reskin.ics", content: Buffer.from(m.ics).toString("base64") }] : undefined,
    }),
  });
  if (!res.ok) console.error("[email] Versand fehlgeschlagen", res.status, await res.text());
  return { ok: res.ok };
}

const C = { bg: "#F5F2ED", card: "#FFFFFF", sand: "#E7E1D8", taupe: "#A69C90", text: "#2A2826", green: "#3E4D42", sage: "#C9D1C4" };
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string) {
  return `<!doctype html><html lang="de-CH"><body style="margin:0;background:${C.bg};font-family:Helvetica,Arial,sans-serif;color:${C.text}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td align="center" style="padding:8px 0 24px">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:6px">RE<span style="color:${C.taupe}">|</span>SKIN</div>
<div style="font-size:10px;letter-spacing:4px;color:${C.taupe};margin-top:4px">TATTOO- &amp; HAARENTFERNUNG</div>
</td></tr>
<tr><td style="background:${C.card};border-radius:14px;padding:32px 28px;border:1px solid ${C.sand}">
<h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:22px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px">${title}</h1>
${body}
</td></tr>
<tr><td align="center" style="padding:24px 8px;font-size:12px;line-height:1.6;color:${C.taupe}">
RE|SKIN · ${site.address.street}, ${site.address.floor} · ${site.address.zip} ${site.address.city}<br>
<a href="${site.whatsapp}" style="color:${C.green}">WhatsApp</a> · <a href="${site.instagram}" style="color:${C.green}">Instagram</a> · <a href="${site.url}" style="color:${C.green}">Website</a>
</td></tr></table></td></tr></table></body></html>`;
}

const btn = (href: string, label: string, primary = true) =>
  `<a href="${href}" style="display:inline-block;padding:12px 20px;border-radius:999px;margin:4px 8px 4px 0;text-decoration:none;font-size:14px;${
    primary ? `background:${C.green};color:#F5F2ED` : `border:1px solid ${C.green};color:${C.green}`
  }">${label}</a>`;

function summary(b: Booking) {
  const rows: [string, string][] = [
    ["Behandlung", `${categoryLabels[b.category]}: ${b.items.map((i) => escapeHtml(i.name)).join(", ")}`],
    ["Datum", formatDateLong(b.startAt)],
    ["Uhrzeit", `${formatTime(b.startAt)} – ${formatTime(b.endAt)} Uhr`],
    ["Preis", b.details.package ? `${formatChf(b.priceTotal)} (Paket 6 Sitzungen)` : formatChf(b.priceTotal)],
    ["Adresse", `${site.address.street}, ${site.address.floor}, ${site.address.zip} ${site.address.city}`],
  ];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.5;margin:8px 0 20px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid ${C.sand};color:${C.taupe};width:110px;vertical-align:top">${k}</td><td style="padding:8px 0;border-bottom:1px solid ${C.sand}">${v}</td></tr>`,
    )
    .join("")}</table>`;
}

function careTips(b: Booking) {
  const card =
    b.category === "haar" ? careCards.find((c) => c.id === "vor-haarlaser") : b.category === "tattoo" ? careCards.find((c) => c.id === "keine-behandlung") : null;
  if (!card) return "";
  return `<div style="background:${C.bg};border-radius:12px;padding:18px 20px;margin:20px 0">
<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${C.green};font-weight:bold;margin-bottom:8px">Prep &amp; Care: ${escapeHtml(card.title)}</div>
<ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.6">${card.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul></div>`;
}

const manageUrl = (b: Booking) => `${site.url}/termin/${b.token}`;
const icsUrl = (b: Booking) => `${site.url}/api/ics/${b.token}`;

export function confirmationMail(b: Booking): Mail {
  return {
    to: b.email,
    subject: `Dein Termin bei RE|SKIN am ${formatDateLong(b.startAt)}`,
    ics: buildIcs(b),
    html: layout(
      "Dein Termin ist gebucht",
      `<p style="font-size:15px;line-height:1.6">Liebe/r ${escapeHtml(b.firstName)}<br>schön, dass du dich für RE|SKIN entschieden hast. Ich freue mich auf dich!</p>
${summary(b)}
${btn(icsUrl(b), "Zum Kalender hinzufügen")}${btn(manageUrl(b), "Verschieben oder stornieren", false)}
<p style="font-size:13px;color:${C.taupe};line-height:1.6;margin-top:12px">Verschieben oder Stornieren ist bis 24 Stunden vor dem Termin kostenlos möglich.</p>
${b.healthFlagged ? `<p style="font-size:14px;line-height:1.6;background:#F3EEE6;border-left:3px solid ${C.green};padding:12px 14px;border-radius:6px">Du hast bei den Gesundheitsfragen etwas angekreuzt. Bitte melde dich vor dem Termin kurz bei mir (z. B. per <a href="${site.whatsapp}" style="color:${C.green}">WhatsApp</a>), damit wir abklären können, ob die Behandlung möglich ist.</p>` : ""}
${careTips(b)}
<p style="font-size:14px;line-height:1.6">Das Studio findest du an der ${site.address.street} im ${site.address.floor} in ${site.address.city}.<br><a href="${site.mapsDirections}" style="color:${C.green}">Route planen</a></p>
<p style="font-size:14px;line-height:1.6">Herzlich<br>dein RE|SKIN</p>`,
    ),
  };
}

export function reminderMail(b: Booking): Mail {
  return {
    to: b.email,
    subject: `Erinnerung: Dein Termin morgen um ${formatTime(b.startAt)} Uhr`,
    ics: buildIcs(b),
    html: layout(
      "Bis morgen!",
      `<p style="font-size:15px;line-height:1.6">Liebe/r ${escapeHtml(b.firstName)}<br>nur eine kurze Erinnerung an deinen Termin bei RE|SKIN.</p>
${summary(b)}${careTips(b)}
${btn(manageUrl(b), "Termin ansehen", false)}`,
    ),
  };
}

export function cancelledMail(b: Booking): Mail {
  return {
    to: b.email,
    subject: "Dein Termin bei RE|SKIN wurde storniert",
    html: layout(
      "Termin storniert",
      `<p style="font-size:15px;line-height:1.6">Liebe/r ${escapeHtml(b.firstName)}<br>dein Termin wurde storniert:</p>${summary(b)}
${btn(`${site.url}/buchen`, "Neuen Termin buchen")}`,
    ),
  };
}

export function rescheduledMail(b: Booking): Mail {
  const m = confirmationMail(b);
  return { ...m, subject: `Termin verschoben: neu am ${formatDateLong(b.startAt)}` };
}

export function studioNotification(b: Booking, kind: "neu" | "storniert" | "verschoben"): Mail {
  const to = process.env.STUDIO_EMAIL || site.email;
  const labels = { neu: "Neue Buchung", storniert: "Stornierung", verschoben: "Termin verschoben" };
  return {
    to,
    replyTo: b.email,
    subject: `${labels[kind]}: ${b.firstName} ${b.lastName} – ${formatDateLong(b.startAt)} ${formatTime(b.startAt)}`,
    html: layout(
      labels[kind],
      `<p style="font-size:14px">${escapeHtml(b.firstName)} ${escapeHtml(b.lastName)} · ${escapeHtml(b.email)} · ${escapeHtml(b.phone)}</p>
${summary(b)}
${b.healthFlagged ? `<p style="font-size:14px;color:#8A3B2E"><strong>Achtung:</strong> Gesundheitsfragen mit «Ja» beantwortet – Details nur im Admin-Bereich.</p>` : ""}
${btn(`${site.url}/admin`, "Im Admin öffnen")}`,
    ),
  };
}

export function contactMail(d: { name: string; email: string; phone?: string; message: string }): Mail {
  return {
    to: process.env.STUDIO_EMAIL || site.email,
    replyTo: d.email,
    subject: `Kontaktanfrage von ${d.name}`,
    html: layout(
      "Neue Kontaktanfrage",
      `<p style="font-size:14px">${escapeHtml(d.name)} · ${escapeHtml(d.email)}${d.phone ? ` · ${escapeHtml(d.phone)}` : ""}</p>
<p style="font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(d.message)}</p>`,
    ),
  };
}

export { bookingTitle };
