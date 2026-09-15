#!/usr/bin/env python3
"""
33333 Viral Shorts Engine v3.0 — Metadata Hygiene
EXIF strip + header sanitize + AI avatar leak detection.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

AI_AVATAR_PATTERNS = [
    re.compile(p, re.I)
    for p in [
        r"heygen",
        r"synthesia",
        r"d-id",
        r"did\.com",
        r"deepfake",
        r"ai\s*avatar",
        r"talking\s*head\s*ai",
        r"runway\s*gen",
    ]
]

BLOCKED_FILENAME = re.compile(r"(avatar|heygen|synth|talking.?head)", re.I)


def scan_text(text: str) -> list[str]:
    reasons: list[str] = []
    for pattern in AI_AVATAR_PATTERNS:
        if pattern.search(text):
            reasons.append(f"Pattern match: {pattern.pattern}")
    return reasons


def check_file(path: Path) -> dict:
    reasons: list[str] = []
    if BLOCKED_FILENAME.search(path.name):
        reasons.append(f"Filename suggests AI avatar: {path.name}")

    suffix = path.suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp"}:
        try:
            from PIL import Image  # type: ignore

            img = Image.open(path)
            exif = img.getexif()
            if exif:
                reasons.append(f"EXIF present ({len(exif)} tags) — strip before upload")
            for key, val in (exif or {}).items():
                blob = str(val).lower()
                reasons.extend(scan_text(blob))
        except ImportError:
            reasons.append("Pillow not installed — pip install Pillow for EXIF strip")
        except Exception as exc:  # noqa: BLE001
            reasons.append(f"Image read error: {exc}")

    if suffix in {".mp4", ".mov", ".webm"}:
        try:
            raw = path.read_bytes()[:8192].decode("utf-8", errors="ignore")
            reasons.extend(scan_text(raw))
        except OSError as exc:
            reasons.append(f"Video read error: {exc}")

    return {"path": str(path), "blocked": len(reasons) > 0, "reasons": reasons}


def strip_exif_inplace(path: Path) -> dict:
    try:
        from PIL import Image  # type: ignore

        img = Image.open(path)
        clean = Image.new(img.mode, img.size)
        clean.putdata(list(img.getdata()))
        out = path.with_suffix(path.suffix + ".clean" + path.suffix)
        clean.save(out, quality=95)
        return {"ok": True, "output": str(out)}
    except ImportError:
        return {"ok": False, "error": "Pillow required: pip install Pillow"}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": str(exc)}


def main() -> int:
    parser = argparse.ArgumentParser(description="33333 metadata hygiene")
    parser.add_argument("paths", nargs="*", help="Files to scan")
    parser.add_argument("--json-input", help="JSON payload from stdin alternative")
    parser.add_argument("--strip-exif", action="store_true")
    args = parser.parse_args()

    if args.json_input:
        payload = json.loads(Path(args.json_input).read_text())
        blob = json.dumps(payload).lower()
        reasons = scan_text(blob)
        if payload.get("filename") and BLOCKED_FILENAME.search(str(payload["filename"])):
            reasons.append("Filename suggests AI avatar")
        result = {"blocked": len(reasons) > 0, "reasons": reasons}
        print(json.dumps(result, indent=2))
        return 1 if result["blocked"] else 0

    if not args.paths:
        parser.print_help()
        return 2

    results = []
    for p in args.paths:
        path = Path(p)
        if not path.exists():
            results.append({"path": p, "blocked": True, "reasons": ["File not found"]})
            continue
        if args.strip_exif:
            strip_exif_inplace(path)
        results.append(check_file(path))

    blocked = any(r.get("blocked") for r in results)
    print(json.dumps({"ok": not blocked, "results": results}, indent=2))
    return 1 if blocked else 0


if __name__ == "__main__":
    sys.exit(main())
