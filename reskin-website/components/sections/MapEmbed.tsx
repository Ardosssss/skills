"use client";
import { useState } from "react";
import { site } from "@/lib/site";
import { IconPin } from "../Icons";

/** Karte (OpenStreetMap) wird erst nach Klick geladen – keine Drittanbieter-Anfragen ohne Zustimmung. */
export function MapEmbed() {
  const [load, setLoad] = useState(false);
  const { lat, lng } = site.address;
  const d = 0.006;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d / 2}%2C${lng + d}%2C${lat + d / 2}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] border border-sand bg-sand md:aspect-auto md:h-full md:min-h-[380px]">
      {load ? (
        <iframe title="Karte: RE|SKIN, Zentralstrasse 10, Ebikon" src={src} className="absolute inset-0 h-full w-full border-0 grayscale-[40%] sepia-[15%]" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div className="palm-overlay" aria-hidden />
          <div className="relative">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream text-forest">
              <IconPin />
            </span>
            <p className="mt-4 font-serif text-xl tracking-[0.08em] uppercase">{site.address.street}</p>
            <p className="text-muted">
              {site.address.floor} · {site.address.zip} {site.address.city}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button type="button" className="btn btn-outline min-h-11" onClick={() => setLoad(true)}>
                Karte laden
              </button>
              <a href={site.mapsDirections} target="_blank" rel="noopener noreferrer" className="btn btn-primary min-h-11">
                Route planen
              </a>
            </div>
            <p className="mt-3 text-xs text-muted">Beim Laden der Karte werden Daten an OpenStreetMap übermittelt.</p>
          </div>
        </div>
      )}
    </div>
  );
}
