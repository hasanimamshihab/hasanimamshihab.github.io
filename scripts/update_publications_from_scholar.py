#!/usr/bin/env python3
"""Update data/publications.json from selected Google Scholar publications.

Usage:
  SCHOLAR_USER_ID=xxxxxxxx python scripts/update_publications_from_scholar.py
  SCHOLAR_PUBLICATION_IDS=id1,id2 python scripts/update_publications_from_scholar.py

Notes:
  - Google Scholar does not offer a stable official public API. This script uses the
    third-party `scholarly` package, so keep the manual BibTeX fallback as the most
    reliable option for important website updates.
  - Private profiles cannot be read without a signed-in Google session. The script
    exits without changing the existing JSON when Scholar returns no publications.
  - SCHOLAR_PUBLICATION_IDS is optional. Use citation IDs such as abc123 from the
    end of an author_pub_id (xxxxxxxx:abc123). When omitted, all publications are
    included.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "publications.json"


def normalize_authors(value: Any) -> str:
    if isinstance(value, list):
        return ", ".join(str(author).strip() for author in value if str(author).strip())
    return str(value or "").replace(" and ", ", ").strip()


def publication_id(item: dict[str, Any]) -> str:
    value = str(item.get("author_pub_id") or "").strip()
    return value.rsplit(":", 1)[-1]


def normalize_publication(item: dict[str, Any], scholar_user_id: str) -> dict[str, Any]:
    bib = item.get("bib", {}) or {}
    title = bib.get("title") or item.get("title") or "Untitled publication"
    authors = normalize_authors(bib.get("author") or bib.get("authors"))
    venue = bib.get("venue") or bib.get("journal") or bib.get("conference") or bib.get("publisher") or ""
    year = str(bib.get("pub_year") or bib.get("year") or "")
    citation_id = publication_id(item)
    scholar_url = (
        "https://scholar.google.com/citations?view_op=view_citation"
        f"&user={scholar_user_id}&citation_for_view={scholar_user_id}:{citation_id}"
        if citation_id else ""
    )
    url = item.get("pub_url") or item.get("eprint_url") or scholar_url
    citations = item.get("num_citations")
    note = f"Citations: {citations}" if citations is not None else ""
    return {
        "scholar_id": citation_id,
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

    selected_ids = {
        value.strip().rsplit(":", 1)[-1]
        for value in os.environ.get("SCHOLAR_PUBLICATION_IDS", "").split(",")
        if value.strip()
    }

    author = scholarly.search_author_id(scholar_user_id)
    author = scholarly.fill(author, sections=["publications"])
    available = author.get("publications", [])
    if not available:
        raise SystemExit(
            "No publications were returned. Confirm that the Google Scholar profile is public; "
            "the existing publications.json was not changed."
        )

    selected = [pub for pub in available if not selected_ids or publication_id(pub) in selected_ids]
    if not selected:
        raise SystemExit(
            "None of SCHOLAR_PUBLICATION_IDS matched this profile; "
            "the existing publications.json was not changed."
        )

    # Filling each selected publication retrieves complete metadata, including co-authors.
    publications = [normalize_publication(scholarly.fill(pub), scholar_user_id) for pub in selected]
    publications.sort(key=lambda p: p.get("year", ""), reverse=True)

    OUTPUT.write_text(json.dumps(publications, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(publications)} publications to {OUTPUT}")


if __name__ == "__main__":
    main()
