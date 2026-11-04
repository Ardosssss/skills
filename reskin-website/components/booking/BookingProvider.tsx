"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Category } from "@/lib/types";
import { IconClose } from "../Icons";
import { BookingFlow } from "./BookingFlow";

type Preset = { category?: Category };
const Ctx = createContext<{ open: (p?: Preset) => void } | null>(null);

export function useBooking() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBooking ausserhalb des BookingProvider");
  return c;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [preset, setPreset] = useState<Preset | null>(null);
  const [key, setKey] = useState(0);

  const open = useCallback((p?: Preset) => {
    setPreset(p ?? {});
    setKey((k) => k + 1);
    requestAnimationFrame(() => {
      if (!ref.current?.open) ref.current?.showModal();
    });
  }, []);
  const close = () => ref.current?.close();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => {
      document.documentElement.style.overflow = "";
      setPreset(null);
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);
  useEffect(() => {
    if (preset) document.documentElement.style.overflow = "hidden";
  }, [preset]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <dialog ref={ref} className="sheet" aria-labelledby="booking-title">
        <div className="flex h-full w-full items-end justify-center md:items-center md:p-6" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="sheet-panel relative flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[20px] bg-linen shadow-[var(--shadow-lift)] md:max-h-[90dvh] md:rounded-[20px]">
            <div className="flex items-center justify-between border-b border-sand px-5 py-3 md:px-8">
              <p id="booking-title" className="eyebrow">Termin buchen</p>
              <button type="button" onClick={close} className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-sand" aria-label="Buchung schliessen">
                <IconClose />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-8 pt-5 md:px-8">
              {preset && <BookingFlow key={key} initialCategory={preset.category} />}
            </div>
          </div>
        </div>
      </dialog>
    </Ctx.Provider>
  );
}
