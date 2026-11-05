#!/usr/bin/env python3
"""Assemble the static site from shared partials and per-page content."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"


def asset_version(rel_path: str) -> str:
    data = (ROOT / rel_path).read_bytes()
    return hashlib.sha256(data).hexdigest()[:10]


def build_page(page: dict, header: str, footer: str, layout: str) -> str:
    def fill(text: str) -> str:
        replacements = {
            "{{title}}": page["title"],
            "{{description}}": page["description"],
            "{{body_attrs}}": (
                (f' class="{page["body_class"]}"' if page["body_class"] else "")
                + (f' data-project="{page["data_project"]}"' if page["data_project"] else "")
            ),
            "{{header}}": header,
            "{{footer}}": footer,
            "{{main}}": (SRC / "pages" / f'{page["slug"]}.main.html').read_text(encoding="utf-8").rstrip(),
            "{{home_href}}": page["home_href"],
            "{{projects_href}}": page.get("projects_href", "./projeler.html"),
            "{{about_href}}": page.get("about_href", "./hakkimizda.html"),
            "{{news_href}}": page.get("news_href", "./guncel.html"),
        }
        for key, value in replacements.items():
            text = text.replace(key, value)
        return text

    styles = "\n".join(
        f'    <link rel="stylesheet" href="./css/{name}?v={asset_version("css/" + name)}">'
        for name in page["styles"]
    )
    scripts = "\n".join(
        f'<script src="./js/{name}?v={asset_version("js/" + name)}"></script>'
        for name in page["scripts"]
    )
    return fill(layout).replace("{{styles}}", styles).replace("{{scripts}}", scripts)


def main() -> int:
    pages = json.loads((SRC / "pages.json").read_text(encoding="utf-8"))
    header = (SRC / "partials/header.html").read_text(encoding="utf-8").strip()
    footer = (SRC / "partials/footer.html").read_text(encoding="utf-8").strip()
    layout = (SRC / "layout.html").read_text(encoding="utf-8")

    generated = {page["out"]: build_page(page, header, footer, layout) for page in pages}

    if "--check" in sys.argv:
        stale = []
        for name, content in generated.items():
            current = (ROOT / name)
            if not current.exists() or current.read_text(encoding="utf-8") != content:
                stale.append(name)
        if stale:
            print("Generated pages are stale:", ", ".join(stale))
            return 1
        print("All generated pages are up to date.")
        return 0

    for name, content in generated.items():
        (ROOT / name).write_text(content, encoding="utf-8")
        print(f"wrote {name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
