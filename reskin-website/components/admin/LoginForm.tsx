"use client";
import { useState } from "react";

export function LoginForm() {
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    setBusy(false);
    if (!res.ok) return setErr((await res.json().catch(() => ({}))).error ?? "Anmeldung fehlgeschlagen");
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next && next.startsWith("/admin") ? next : "/admin";
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div>
        <label className="label" htmlFor="a-email">E-Mail</label>
        <input id="a-email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="a-pw">Passwort</label>
        <input id="a-pw" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {err && <p className="text-sm text-alert" role="alert">{err}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? "…" : "Anmelden"}</button>
    </form>
  );
}
