#!/usr/bin/env python3
"""Convert a simple BibTeX file to data/publications.json.

Usage:
  python scripts/bibtex_to_publications.py publications.bib

This intentionally supports common BibTeX exported from Google Scholar. For complex
BibTeX files, use a full parser such as bibtexparser.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "publications.json"
ENTRY_RE = re.compile(r"@\w+\s*\{[^,]+,(.*?)\n\}", re.DOTALL)
FIELD_RE = re.compile(r"\s*(\w+)\s*=\s*[\{\"](.*?)[\}\"]\s*,?\s*$", re.DOTALL)


def clean(value: str) -> str:
    value = re.sub(r"\s+", " ", value).strip()
    return value.replace("{{", "").replace("}}", "")


def parse_entry(block: str) -> dict[str, str]:
    fields: dict[str, str] = {}
    current = ""
    brace_balance = 0
    for raw_line in block.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        current += (" " if current else "") + line
        brace_balance += line.count("{") - line.count("}")
        if brace_balance <= 0 and current:
            match = FIELD_RE.match(current)
            if match:
                fields[match.group(1).lower()] = clean(match.group(2))
            current = ""
            brace_balance = 0
    return fields


def convert(path: Path) -> list[dict[str, str | bool]]:
    text = path.read_text(encoding="utf-8")
    publications = []
    for block in ENTRY_RE.findall(text):
        f = parse_entry(block)
        if not f:
            continue
        publications.append({
            "title": f.get("title", "Untitled publication"),
            "authors": f.get("author", ""),
            "venue": f.get("journal") or f.get("booktitle") or f.get("publisher", ""),
            "year": f.get("year", ""),
            "url": f.get("url") or f.get("doi", ""),
            "type": "bibtex",
            "featured": False,
            "note": "Imported from BibTeX",
        })
    publications.sort(key=lambda p: str(p.get("year", "")), reverse=True)
    return publications


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/bibtex_to_publications.py publications.bib")
    publications = convert(Path(sys.argv[1]))
    OUTPUT.write_text(json.dumps(publications, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(publications)} publications to {OUTPUT}")


if __name__ == "__main__":
    main()
