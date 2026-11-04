import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { Logo } from "@/components/Logo";
import { usingSupabase } from "@/lib/db";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Buchungen" },
  { href: "/admin/einstellungen", label: "Öffnungszeiten & Ferien" },
  { href: "/admin/behandlungen", label: "Behandlungen" },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-sand bg-linen/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo compact />
            <span className="rounded-full bg-forest px-2.5 py-0.5 text-[0.62rem] tracking-[0.2em] text-linen uppercase">Admin</span>
          </Link>
          <nav aria-label="Admin" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto md:order-2 md:w-auto">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-full px-3 py-2 text-sm whitespace-nowrap hover:bg-sand">{l.label}</Link>
            ))}
            <Link href="/" className="rounded-full px-3 py-2 text-sm whitespace-nowrap text-muted hover:bg-sand">Website ↗</Link>
          </nav>
          <div className="order-2 md:order-3"><LogoutButton /></div>
        </div>
      </header>
      {!usingSupabase && (
        <p className="bg-sage/50 px-4 py-2 text-center text-xs">
          Demo-Modus: Daten werden lokal in <code>.data/db.json</code> gespeichert. Für den Livebetrieb Supabase-Zugang in der <code>.env</code> hinterlegen.
        </p>
      )}
      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</main>
    </>
  );
}
