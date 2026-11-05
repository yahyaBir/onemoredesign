#!/usr/bin/env python3
"""Small static-site checks that do not require a browser or third-party packages."""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = sorted(ROOT.glob("*.html"))
ATTR_RE = re.compile(r'\b(href|src)="([^"]*)"')
IMG_RE = re.compile(r"<img\b[^>]*>")
A_RE = re.compile(r"<a\b[^>]*>")
ID_RE = re.compile(r'\bid="([^"]+)"')
LOCAL_PREFIXES = ("#", "mailto:", "tel:", "data:", "http:", "https:")


def local_path(page: Path, value: str) -> Path | None:
    path = value.split("?")[0].split("#")[0]
    if not path:
        return None
    return (page.parent / path).resolve()


def main() -> int:
    errors: list[str] = []

    build_check = subprocess.run(
        [sys.executable, str(ROOT / "build.py"), "--check"],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    if build_check.returncode:
        errors.append(build_check.stdout.strip() or "Generated pages are stale.")

    for page in PAGES:
        text = page.read_text(encoding="utf-8")
        ids = ID_RE.findall(text)
        for value in sorted({item for item in ids if ids.count(item) > 1}):
            errors.append(f"{page.name}: duplicate id #{value}")

        if 'class="skip-link"' not in text:
            errors.append(f"{page.name}: missing skip link")
        if not re.search(r'<main\b[^>]*\bid="main"', text):
            errors.append(f"{page.name}: main#main missing")

        for tag in re.findall(r"<[^>]+>", text):
            for attr, value in ATTR_RE.findall(tag):
                if not value or value.startswith(LOCAL_PREFIXES):
                    if attr == "href" and value == "":
                        errors.append(f"{page.name}: empty href")
                    continue

                target = local_path(page, value)
                if target is None:
                    continue
                if not target.exists():
                    errors.append(f"{page.name}: missing file {value}")
                    continue

                fragment = value.partition("#")[2]
                if fragment and target.suffix == ".html":
                    target_text = target.read_text(encoding="utf-8")
                    if f'id="{fragment}"' not in target_text:
                        errors.append(f"{page.name}: missing fragment {value}")

        for tag in IMG_RE.findall(text):
            if "alt=" not in tag:
                errors.append(f"{page.name}: image without alt: {tag[:90]}")
            if "width=" not in tag or "height=" not in tag:
                errors.append(f"{page.name}: image without dimensions: {tag[:90]}")

        for tag in A_RE.findall(text):
            href = re.search(r'\bhref="([^"]*)"', tag)
            if href and href.group(1) == "":
                errors.append(f"{page.name}: empty anchor href")

        controls = re.findall(r'aria-controls="([^"]+)"', text)
        for value in controls:
            if f'id="{value}"' not in text:
                errors.append(f"{page.name}: aria-controls target missing: {value}")

        for value in re.findall(r'(?:data-(?:desktop|mobile|src)|poster)="([^"]+)"', text):
            target = local_path(page, value)
            if target and not target.exists():
                errors.append(f"{page.name}: missing media {value}")

    media_config = (ROOT / "js/project-media.js")
    if media_config.exists():
        for value in set(re.findall(r'"(\./(?:images|videos)/[^"]+)"', media_config.read_text(encoding="utf-8"))):
            if not (ROOT / value[2:]).exists():
                errors.append(f"project-media.js: missing file {value}")

    if errors:
        print("Site check failed:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print(f"Site check passed for {len(PAGES)} pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
