"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/lib/site";
import { BookButton } from "./booking/BookButton";
import { IconClose, IconInstagram, IconMenu, IconWhatsApp } from "./Icons";
import { Logo } from "./Logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => menuRef.current?.close(), [pathname]);

  return (
    <header className={`sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 ${scrolled ? "border-b border-sand bg-linen/90 backdrop-blur-md" : "border-b border-transparent bg-linen"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-linen">
        Zum Inhalt springen
      </a>
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="shrink-0" aria-label="RE|SKIN Startseite">
          <Logo />
        </Link>
        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={pathname === n.href ? "page" : undefined} className={`link-underline py-1 text-[0.78rem] tracking-[0.18em] uppercase ${pathname === n.href ? "text-forest" : "text-ink"}`}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <BookButton className="btn btn-primary hidden min-h-11 sm:inline-flex" />
          <button type="button" className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-sand lg:hidden" aria-label="Menü öffnen" aria-haspopup="dialog" onClick={() => menuRef.current?.showModal()}>
            <IconMenu />
          </button>
        </div>
      </div>

      <dialog ref={menuRef} className="sheet" aria-label="Menü">
        <div className="flex h-full justify-end" onClick={(e) => e.target === e.currentTarget && menuRef.current?.close()}>
          <div className="sheet-panel flex h-full w-full max-w-sm flex-col bg-linen px-6 pb-safe">
            <div className="flex h-[72px] items-center justify-between">
              <Logo compact />
              <button type="button" className="-mr-2 grid h-11 w-11 place-items-center rounded-full hover:bg-sand" aria-label="Menü schliessen" onClick={() => menuRef.current?.close()}>
                <IconClose />
              </button>
            </div>
            <nav aria-label="Mobile Navigation" className="mt-6 flex-1">
              <ul className="space-y-1">
                <li>
                  <Link href="/" className="block border-b border-sand py-4 font-serif text-2xl tracking-[0.12em] uppercase" onClick={() => menuRef.current?.close()}>
                    Start
                  </Link>
                </li>
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="block border-b border-sand py-4 font-serif text-2xl tracking-[0.12em] uppercase" onClick={() => menuRef.current?.close()}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="space-y-3 py-6">
              <BookButton className="btn btn-primary w-full" />
              <div className="flex gap-3">
                <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-outline flex-1">
                  <IconWhatsApp width={18} height={18} /> WhatsApp
                </a>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-outline flex-1">
                  <IconInstagram width={18} height={18} /> Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </header>
  );
}
