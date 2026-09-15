#!/usr/bin/env python3
"""
33333 Viral Shorts Engine — Stripe Double-Entry Ledger
Import Stripe balance transactions, reconcile, emit journal entries.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path


@dataclass
class LedgerEntry:
    date: str
    account: str
    debit_cents: int
    credit_cents: int
    memo: str
    transaction_id: str


def parse_stripe_csv(path: Path) -> list[dict]:
    rows: list[dict] = []
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(dict(row))
    return rows


def stripe_row_to_entries(row: dict) -> list[LedgerEntry]:
    tid = row.get("id") or row.get("transaction_id") or "unknown"
    amount = int(float(row.get("amount", row.get("gross", 0))))
    fee = int(float(row.get("fee", 0)))
    net = int(float(row.get("net", amount - fee)))
    date = row.get("created", row.get("date", datetime.now(timezone.utc).isoformat()))[:10]
    brand = row.get("metadata_brand", row.get("brand", "33333"))

    return [
        LedgerEntry(date, "Cash:Stripe", net, 0, f"Net payout {brand}", tid),
        LedgerEntry(date, "Revenue:33333", 0, amount, f"Gross revenue {brand}", tid),
        LedgerEntry(date, "Expenses:StripeFees", fee, 0, "Processing fee", tid),
    ]


def reconcile(entries: list[LedgerEntry]) -> dict:
    total_debit = sum(e.debit_cents for e in entries)
    total_credit = sum(e.credit_cents for e in entries)
    diff = total_debit - total_credit
    return {
        "balanced": diff == 0,
        "total_debit_cents": total_debit,
        "total_credit_cents": total_credit,
        "difference_cents": diff,
        "entry_count": len(entries),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="33333 Stripe ledger")
    parser.add_argument("--csv", help="Stripe exported CSV")
    parser.add_argument("--json", help="JSON array of transactions")
    parser.add_argument("--output", help="Write ledger JSON to file")
    args = parser.parse_args()

    rows: list[dict] = []
    if args.csv:
        rows = parse_stripe_csv(Path(args.csv))
    elif args.json:
        rows = json.loads(Path(args.json).read_text())
    else:
        parser.print_help()
        return 2

    entries: list[LedgerEntry] = []
    for row in rows:
        entries.extend(stripe_row_to_entries(row))

    recon = reconcile(entries)
    result = {"reconciliation": recon, "entries": [asdict(e) for e in entries]}
    out = json.dumps(result, indent=2)
    if args.output:
        Path(args.output).write_text(out, encoding="utf-8")
    print(out)
    return 0 if recon["balanced"] else 1


if __name__ == "__main__":
    sys.exit(main())
