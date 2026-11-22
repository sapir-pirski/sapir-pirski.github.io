"""Regenerate the 16:9 SVG covers from the catalog embedded in index.html."""

import html
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
ICONS = {
    "document": '<path d="M28 14h30l14 14v54H28zM58 14v16h14M38 42h24M38 54h24M38 66h16"/>',
    "chat": '<path d="M18 20h60v46H42L24 80V66h-6z"/><path d="M30 35h36M30 48h26"/>',
    "calendar": '<rect x="18" y="24" width="60" height="56" rx="8"/><path d="M32 14v20M64 14v20M18 42h60M32 60l10 10 22-22"/>',
    "search": '<circle cx="42" cy="42" r="24"/><path d="m60 60 20 20M31 42h22M42 31v22"/>',
    "citations": '<rect x="22" y="14" width="52" height="68" rx="6"/><path d="M34 52h28M34 64h20M34 30h8v10h-8l5-10M54 30h8v10h-8l5-10"/>',
    "database": '<ellipse cx="48" cy="24" rx="30" ry="12"/><path d="M18 24v48c0 16 60 16 60 0V24M18 48c0 16 60 16 60 0"/>',
    "dna": '<path d="M28 12c0 28 40 44 40 72M68 12c0 28-40 44-40 72M30 18h36M35 32h26M35 64h26M30 78h36M41 46h14"/>',
    "shield": '<path d="m48 12 28 12v24c0 18-12 30-28 38-16-8-28-20-28-38V24zM34 48l10 10 22-24"/>',
    "neural": '<path d="m22 24 26 10 26-10M22 48l26-14 26 14M22 72l26-10 26 10M22 24l26 38 26-38M22 72l26-38 26 38M22 48l26 14 26-14"/><g fill="currentColor" stroke="none"><circle cx="22" cy="24" r="6"/><circle cx="22" cy="48" r="6"/><circle cx="22" cy="72" r="6"/><circle cx="48" cy="34" r="6"/><circle cx="48" cy="62" r="6"/><circle cx="74" cy="24" r="6"/><circle cx="74" cy="48" r="6"/><circle cx="74" cy="72" r="6"/></g>',
    "chart": '<path d="M18 16v62h64M28 62l16-18 14 9 22-29M66 24h14v14"/>',
    "code": '<path d="m34 28-18 20 18 20M62 28l18 20-18 20M56 18 40 78"/>',
    "braces": '<path d="M34 16h-8v22c0 7-4 10-10 10 6 0 10 3 10 10v22h8M62 16h8v22c0 7 4 10 10 10-6 0-10 3-10 10v22h-8"/>',
    "gpu": '<rect x="26" y="26" width="44" height="44" rx="6"/><rect x="38" y="38" width="20" height="20" rx="3"/><path d="M36 14v12M48 14v12M60 14v12M36 70v12M48 70v12M60 70v12M14 36h12M14 48h12M14 60h12M70 36h12M70 48h12M70 60h12"/>',
    "cluster": '<rect x="12" y="14" width="28" height="28" rx="5"/><rect x="56" y="14" width="28" height="28" rx="5"/><rect x="34" y="60" width="28" height="28" rx="5"/><path d="M40 28h16M26 42v12h22v6M70 42v12H48"/>',
    "compass": '<circle cx="48" cy="48" r="34"/><path d="m60 30-7 23-23 13 11-25zM48 6v8M48 82v8M6 48h8M82 48h8"/>',
    "question": '<rect x="18" y="16" width="60" height="66" rx="9"/><path d="M36 36c0-17 26-17 26 0 0 10-14 9-14 21M48 68h.1"/>',
    "check": '<circle cx="48" cy="48" r="34"/><path d="m30 48 12 12 26-28"/>',
    "game": '<path d="M30 26h36c9 0 20 37 14 44-6 6-13-7-20-9H36c-7 2-14 15-20 9-6-7 5-44 14-44zM29 38v18M20 47h18"/><circle cx="62" cy="41" r="3" fill="currentColor"/><circle cx="71" cy="51" r="3" fill="currentColor"/>',
    "chain": '<path d="m40 36 12-12c20-20 40 0 20 20L60 56M56 60 44 72C24 92 4 72 24 52l12-12M34 62l28-28"/>',
    "globe": '<circle cx="48" cy="48" r="34"/><ellipse cx="48" cy="48" rx="15" ry="34"/><path d="M16 36h64M16 60h64"/>',
    "report": '<rect x="22" y="12" width="52" height="72" rx="6"/><path d="M34 28h28M34 40h18M34 68V56M48 68V48M62 68V42"/>',
    "bolt": '<path d="m54 10-30 44h22l-4 32 30-46H50z"/>',
    "image": '<rect x="14" y="20" width="68" height="56" rx="6"/><circle cx="64" cy="36" r="6"/><path d="m16 68 22-24 18 20 10-10 14 16"/>',
    "attention": '<g fill="currentColor" stroke="none"><rect x="16" y="16" width="18" height="18" rx="3"/><rect x="39" y="39" width="18" height="18" rx="3"/><rect x="62" y="62" width="18" height="18" rx="3"/></g><g opacity=".45"><rect x="39" y="16" width="18" height="18" rx="3"/><rect x="62" y="16" width="18" height="18" rx="3"/><rect x="16" y="39" width="18" height="18" rx="3"/><rect x="62" y="39" width="18" height="18" rx="3"/><rect x="16" y="62" width="18" height="18" rx="3"/><rect x="39" y="62" width="18" height="18" rx="3"/></g>',
    "target": '<circle cx="48" cy="48" r="34"/><circle cx="48" cy="48" r="21"/><circle cx="48" cy="48" r="7"/><path d="m48 48 32-32M64 16h16v16"/>',
    "layers": '<path d="m48 14 34 18-34 18-34-18zM14 48l34 18 34-18M14 64l34 18 34-18"/>',
}


def cover(title, stages, name):
    description = " to ".join(stage["label"] for stage in stages)
    parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810" viewBox="0 0 1440 810" role="img" aria-labelledby="title description">
<title id="title">{html.escape(name)}</title><desc id="description">{html.escape(description)}</desc>
<defs><radialGradient id="ambient" cx="1" cy="0" r="1"><stop stop-color="#2dd4bf" stop-opacity=".1"/><stop offset="1" stop-color="#2dd4bf" stop-opacity="0"/></radialGradient><linearGradient id="panel" x2="0" y2="1"><stop stop-color="#172231"/><stop offset="1" stop-color="#111927"/></linearGradient><pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0v80" fill="none" stroke="#273449" stroke-opacity=".25"/></pattern></defs>
<rect width="1440" height="810" fill="#0b1018"/><rect width="1440" height="810" fill="url(#grid)"/><rect width="1440" height="810" fill="url(#ambient)"/>
<circle cx="1370" cy="90" r="225" fill="none" stroke="#273449" stroke-width="2" opacity=".5"/>
<g font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="88" letter-spacing="-2.5">''']
    for index, line in enumerate(title):
        color = "#f1f5f9" if index == 0 else "#2dd4bf"
        parts.append(f'<text x="80" y="{146 + index * 98}" fill="{color}">{html.escape(line)}</text>')
    parts.append('</g><rect x="80" y="282" width="64" height="5" rx="2.5" fill="#2dd4bf"/>')
    for index, stage in enumerate(stages):
        x = 80 + index * 464
        center = x + 176
        color = "#2dd4bf" if index == 1 else "#60a5fa"
        parts.append(f'<rect x="{x}" y="350" width="352" height="350" rx="28" fill="url(#panel)" stroke="#273449" stroke-width="2"/>')
        parts.append(f'<circle cx="{center}" cy="466" r="86" fill="{color}" opacity=".07"/>')
        parts.append(f'<svg x="{center-64}" y="402" width="128" height="128" viewBox="0 0 96 96" fill="none" stroke="currentColor" color="{color}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">{ICONS[stage["icon"]]}</svg>')
        parts.append(f'<text x="{center}" y="628" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="600" font-size="40" fill="#f1f5f9">{html.escape(stage["label"])}</text>')
        if index < 2:
            start = x + 378
            parts.append(f'<path d="M{start} 518h50m-12-12 12 12-12 12" fill="none" stroke="#60a5fa" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>')
    parts.append('</svg>\n')
    return "\n".join(parts)


def main():
    source = (ROOT / "index.html").read_text()
    catalog = json.loads(re.search(r'<script id="project-catalog" type="application/json">(.*?)</script>', source, re.S).group(1))
    destination = ROOT / "assets/projects/covers"
    destination.mkdir(parents=True, exist_ok=True)
    for slug, project in catalog.items():
        (destination / f"{slug}.svg").write_text(cover(project["coverTitle"], project["stages"], project["title"]))
    generic = [{"icon": "code", "label": "Code"}, {"icon": "layers", "label": "Build"}, {"icon": "globe", "label": "Share"}]
    (destination / "project.svg").write_text(cover(["Open-source", "Project"], generic, "Open-source project"))
    print(f"Generated {len(catalog)} project covers and one fallback at 1440 × 810.")


if __name__ == "__main__":
    main()
