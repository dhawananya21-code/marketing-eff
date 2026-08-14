#!/usr/bin/env python3
"""Combine the monthly activity CSV exports into one compact data.json for the dashboard.
Re-run this whenever you add or replace a monthly CSV file."""
import csv, glob, json, os

# Columns we keep (for filtering + the results table). Order matters for display.
KEEP = [
    "Activity ID", "Planned Date", "Employee Name", "Employee ID", "Designation",
    "Zone", "Region", "Territory", "Headquarters", "State", "District",
    "Activity", "Activity Type", "Product Category", "Product", "Status", "Achieved",
]

def norm_date(s):
    s = (s or "").strip()
    # keep only sane ISO dates (YYYY-MM-DD); drop junk like 1899-12-31
    if len(s) >= 10 and s[4] == "-" and s[7] == "-":
        year = s[:4]
        if year.isdigit() and 2000 <= int(year) <= 2100:
            return s[:10]
    return ""

def main():
    files = sorted(glob.glob("All_Activities_Export_*.csv"))
    rows = []
    for f in files:
        with open(f, newline="", encoding="utf-8", errors="replace") as fh:
            r = csv.DictReader(fh)
            for row in r:
                out = []
                for c in KEEP:
                    v = (row.get(c) or "").strip()
                    if c == "Planned Date":
                        v = norm_date(v)
                    out.append(v)
                rows.append(out)
    data = {"columns": KEEP, "rows": rows, "source_files": files, "total": len(rows)}
    with open("data.json", "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, separators=(",", ":"))
    size = os.path.getsize("data.json") / 1_000_000
    print(f"Wrote data.json: {len(rows):,} rows from {len(files)} files, {size:.1f} MB")

if __name__ == "__main__":
    main()
