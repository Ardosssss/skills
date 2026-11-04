"use client";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { BookButton } from "./booking/BookButton";
import { IconWhatsApp } from "./Icons";

/** Fixierte Buchungsleiste auf dem Smartphone. */
export function MobileBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/buchen") || pathname.startsWith("/admin") || pathname.startsWith("/termin")) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand bg-linen/92 px-4 pt-3 pb-safe backdrop-blur-md md:hidden">
      <div className="flex gap-3">
        <BookButton className="btn btn-primary flex-1" />
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Per WhatsApp schreiben" className="btn btn-outline w-14 px-0">
          <IconWhatsApp width={22} height={22} />
        </a>
      </div>
    </div>
  );
}
