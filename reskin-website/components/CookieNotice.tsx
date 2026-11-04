"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "reskin-cookie-ok";

/** Hinweis: Die Website setzt nur technisch notwendige Cookies; die Karte lädt erst nach Klick. */
export function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(!localStorage.getItem(KEY));
    } catch {
      setShow(false);
    }
  }, []);
  if (!show) return null;
  return (
    <div role="region" aria-label="Cookie-Hinweis" className="step-in fixed inset-x-3 bottom-[92px] z-40 mx-auto max-w-md rounded-2xl border border-sand bg-cream p-5 shadow-[var(--shadow-lift)] md:bottom-6 md:left-6 md:right-auto">
      <p className="text-sm leading-relaxed">
        Diese Website verwendet nur technisch notwendige Cookies. Externe Inhalte wie die Karte werden erst nach deiner Zustimmung geladen. Mehr in der{" "}
        <Link href="/datenschutz" className="underline underline-offset-4">Datenschutzerklärung</Link>.
      </p>
      <button
        type="button"
        className="btn btn-primary mt-4 min-h-10 w-full"
        onClick={() => {
          try {
            localStorage.setItem(KEY, "1");
          } catch {}
          setShow(false);
        }}
      >
        Verstanden
      </button>
    </div>
  );
}
