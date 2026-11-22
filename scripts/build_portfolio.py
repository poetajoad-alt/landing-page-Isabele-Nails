#!/usr/bin/env python3
"""Sincroniza catálogo de fotos sem editar a home."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / "assets" / "portfolio"
EXT = {".webp", ".jpg", ".jpeg", ".png"}
FOLDER.mkdir(parents=True, exist_ok=True)
photos = sorted(
    (f for f in FOLDER.iterdir() if f.is_file() and f.suffix.lower() in EXT),
    key=lambda p: (p.name.casefold(), p.name),
)
catalog = {"files": [
    {"name": p.name, "version": hashlib.sha256(p.read_bytes()).hexdigest()[:12]}
    for p in photos
]}
target = FOLDER / "manifest.json"
data = json.dumps(catalog, ensure_ascii=False, indent=2) + "\n"
if target.is_file() and target.read_text(encoding="utf-8") == data:
    print(f"Portfólio sincronizado: {len(photos)} fotos")
else:
    target.write_text(data, encoding="utf-8")
    print(f"Manifesto atualizado: {len(photos)} fotos")
