#!/usr/bin/env python3
"""
33333 Viral Shorts Engine v3.0 — Transform Layer
Content composition, visual cue injection, platform length optimization, telemetry strip.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from typing import Any

PLATFORM_DEFAULTS = {
    "youtube": 35,
    "instagram": 45,
    "tiktok": 60,
}

TELEMETRY_KEYS = re.compile(
    r"(utm_|fbclid|gclid|mc_eid|ref=|session_id|tracking)", re.I
)


def inject_visual_cues(body: str, interval_sec: float = 3.5) -> str:
    """Insert [VISUAL CUE] markers if missing — approx every 3-4 seconds of speech (~12 wps)."""
    if "[VISUAL CUE]" in body.upper():
        return body
    words = body.split()
    words_per_cue = max(4, int(interval_sec * 3))
    chunks: list[str] = []
    for i in range(0, len(words), words_per_cue):
        chunk = " ".join(words[i : i + words_per_cue])
        chunks.append(f"[VISUAL CUE] {chunk}")
    return " ".join(chunks)


def strip_telemetry(text: str) -> str:
    return TELEMETRY_KEYS.sub("[REDACTED]", text)


def optimize_for_platform(script: dict[str, Any], platform: str) -> dict[str, Any]:
    target = PLATFORM_DEFAULTS.get(platform, 35)
    body = script.get("script_body") or script.get("body") or ""
    body = inject_visual_cues(body)
    body = strip_telemetry(body)

    return {
        **script,
        "platform": platform,
        "target_seconds": target,
        "script_body": body,
        "caption_native": True,
        "watermark_free": True,
        "share_bait": script.get("share_bait") or "Send this to someone who needs to hear it",
        "engagement_question": script.get("engagement_question")
        or "What is the one career mistake you wish you could undo?",
        "loop_bridge": script.get("loop_bridge") or "End frame mirrors opening hook frame",
    }


def enforce_2026_rules(script: dict[str, Any]) -> list[str]:
    warnings: list[str] = []
    q = script.get("engagement_question", "")
    if len(q.split()) < 5:
        warnings.append("Engagement question must require 5+ words")
    if not script.get("share_bait"):
        warnings.append("Missing share_bait section")
    if not script.get("hook_0_5s") and not script.get("hook"):
        warnings.append("Missing 0.5s hook")
    body = script.get("script_body", "")
    if "[VISUAL CUE]" not in body.upper():
        warnings.append("No visual cues — retention risk")
    blob = json.dumps(script).lower()
    for vendor in ("heygen", "synthesia", "d-id"):
        if vendor in blob:
            warnings.append(f"AI avatar vendor reference: {vendor}")
    return warnings


def main() -> int:
    parser = argparse.ArgumentParser(description="33333 transform layer")
    parser.add_argument("--input", required=True, help="JSON script file")
    parser.add_argument("--platform", default="youtube", choices=PLATFORM_DEFAULTS)
    parser.add_argument("--all-platforms", action="store_true")
    args = parser.parse_args()

    script = json.loads(open(args.input, encoding="utf-8").read())
    warnings = enforce_2026_rules(script)

    if args.all_platforms:
        out = {p: optimize_for_platform(script, p) for p in PLATFORM_DEFAULTS}
    else:
        out = optimize_for_platform(script, args.platform)

    result = {"ok": len(warnings) == 0, "warnings": warnings, "output": out}
    print(json.dumps(result, indent=2))
    return 1 if warnings else 0


if __name__ == "__main__":
    sys.exit(main())
