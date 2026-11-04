"use client";
import Link from "next/link";
import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [consent, setConsent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(fd), consent }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) {
      setState("ok");
      (e.target as HTMLFormElement).reset();
      setConsent(false);
    } else {
      setState("error");
      setMsg(data.error ?? "Senden fehlgeschlagen.");
    }
  }

  if (state === "ok")
    return (
      <div className="card p-8 text-center" role="status">
        <p className="h-display text-2xl">Danke!</p>
        <p className="mt-3 text-muted">Deine Nachricht ist angekommen. Ich melde mich so bald wie möglich bei dir.</p>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="card grid gap-4 p-6 md:p-8" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">Name *</label>
          <input id="c-name" name="name" required autoComplete="name" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="c-phone">Telefon</label>
          <input id="c-phone" name="phone" type="tel" autoComplete="tel" className="field" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-email">E-Mail *</label>
        <input id="c-email" name="email" type="email" required autoComplete="email" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="c-msg">Nachricht *</label>
        <textarea id="c-msg" name="message" required rows={4} className="field resize-y" maxLength={3000} />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-forest" />
        <span>
          Ich habe die <Link href="/datenschutz" className="underline underline-offset-4">Datenschutzerklärung</Link> gelesen und bin einverstanden, dass meine Angaben zur Beantwortung gespeichert werden.
        </span>
      </label>
      {state === "error" && <p className="text-sm text-alert" role="alert">{msg}</p>}
      <button className="btn btn-primary justify-self-start" disabled={state === "sending"}>
        {state === "sending" ? "Wird gesendet …" : "Nachricht senden"}
      </button>
    </form>
  );
}
