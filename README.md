# Marketing Activity Dashboard

A simple internal tool to filter and browse field marketing activity records.
No installation, no login — it runs entirely in the browser.

## What it does

Filter ~69,000 activity records by any single detail (or several at once):

- **Employee Name, Designation**
- **Zone, Region, Territory, District**
- **Activity, Activity Type**
- **Product Category, Product**
- **Status, Achieved**
- **Date range** (Planned Date)

Filters combine (AND), the dropdowns are searchable and show live counts, and
the results table updates instantly. There's an **Export results (CSV)** button
to download whatever you've filtered down to.

## How to view it (one-time setup)

Turn on GitHub Pages so it becomes a live web page anyone with the link can open:

1. Go to the repo on GitHub → **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set the branch to **main** and the folder to **/ (root)**, then **Save**.
4. Wait ~1 minute, then open the link GitHub shows you
   (`https://dhawananya21-code.github.io/marketing-eff/`).

Bookmark that link — that's your dashboard.

## Updating the data (when you get a new month)

1. Upload the new monthly CSV to the repo. Keep the name pattern
   `All_Activities_Export_<month>.csv` — that's how the build script finds them.
2. Rebuild the combined data file by running:
   ```
   python3 build_data.py
   ```
   (or just ask Claude to do it). This regenerates `data.json`.
3. Commit and push. GitHub Pages updates automatically within a minute.

## Files

| File | What it is |
|------|-----------|
| `index.html` | The dashboard itself (open this / GitHub Pages serves it). |
| `data.json` | Combined, cleaned data the dashboard reads. Generated — don't edit by hand. |
| `build_data.py` | Script that merges the monthly CSVs into `data.json`. |
| `All_Activities_Export_*.csv` | The raw monthly exports. |
