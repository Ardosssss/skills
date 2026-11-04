"use client";
import type { ReactNode } from "react";
import type { Category } from "@/lib/types";
import { useBooking } from "./BookingProvider";

export function BookButton({ category, className = "btn btn-primary", children = "Termin buchen" }: { category?: Category; className?: string; children?: ReactNode }) {
  const { open } = useBooking();
  return (
    <a
      href={category ? `/buchen?behandlung=${category}` : "/buchen"}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        open({ category });
      }}
    >
      {children}
    </a>
  );
}
