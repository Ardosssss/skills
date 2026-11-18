#!/usr/bin/env python3
"""Baut index.html aus src/template.html und bettet die Bilder aus assets/ direkt ein.

Aufruf:  python3 build.py
Bilder tauschen: Datei in assets/ ersetzen (gleicher Name) und neu bauen.
"""
import base64
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = {
    "{{LOGO}}": ("assets/logo.webp", "image/webp"),
    "{{CAR}}": ("assets/car.jpg", "image/jpeg"),
}

html = (ROOT / "src" / "template.html").read_text(encoding="utf-8")
for token, (path, mime) in ASSETS.items():
    data = base64.b64encode((ROOT / path).read_bytes()).decode("ascii")
    html = html.replace(token, f"data:{mime};base64,{data}")

(ROOT / "index.html").write_text(html, encoding="utf-8")
print(f"index.html geschrieben ({len(html) / 1024:.0f} KB)")
