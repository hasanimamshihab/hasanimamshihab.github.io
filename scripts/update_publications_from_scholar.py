#!/usr/bin/env python3
"""Update data/publications.json from a public Google Scholar profile.

Usage:
  SCHOLAR_USER_ID=xxxxxxxx python scripts/update_publications_from_scholar.py

Notes:
  - Google Scholar does not offer a stable official public API. This script uses the
    third-party `scholarly` package, so keep the manual BibTeX fallback as the most
    reliable option for important website updates.
  - The output format is intentionally simple so the website stays static and fast.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "publications.json"


def normalize_publication(item: dict[str, Any]) -> dict[str, Any]:
    bib = item.get("bib", {}) or {}
    title = bib.get("title") or item.get("title") or "Untitled publication"
    authors = bib.get("author") or bib.get("authors") or ""
    venue = bib.get("venue") or bib.get("journal") or bib.get("conference") or bib.get("publisher") or ""
    year = str(bib.get("pub_year") or bib.get("year") or "")
    url = item.get("pub_url") or item.get("eprint_url") or ""
    citations = item.get("num_citations")
    note = f"Citations: {citations}" if citations is not None else ""
    return {
        "title": title,
        "authors": authors,
        "venue": venue,
        "year": year,
        "url": url,
        "type": "scholar",
        "featured": False,
        "note": note,
    }


def main() -> None:
    scholar_user_id = os.environ.get("SCHOLAR_USER_ID", "").strip()
    if not scholar_user_id:
        raise SystemExit("Missing SCHOLAR_USER_ID environment variable.")

    try:
        from scholarly import scholarly
    except ImportError as exc:
        raise SystemExit("Install dependency first: pip install scholarly") from exc

    author = scholarly.search_author_id(scholar_user_id)
    author = scholarly.fill(author, sections=["publications"])
    publications = [normalize_publication(pub) for pub in author.get("publications", [])]
    publications.sort(key=lambda p: p.get("year", ""), reverse=True)

    OUTPUT.write_text(json.dumps(publications, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(publications)} publications to {OUTPUT}")


if __name__ == "__main__":
    main()
