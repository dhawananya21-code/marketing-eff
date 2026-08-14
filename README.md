# Marketing Activity Dashboard

An internal tool to browse field-marketing data and add new entries by hand.
It runs on Vercel and has two parts:

- **A dashboard** (`index.html`) — filter the data and view it. Two tabs:
  - **Activities** — the ~69,000 records from the uploaded CSV files, plus any
    activities you add by hand. Filter by employee, designation, zone, region,
    territory, district, activity, activity type, product category, product,
    status, achieved, and date range.
  - **Marketing Channel** — channel campaigns you add by hand. Filter by channel
    type, district, and month. Pick a district to see two charts side by side:
    channel activity over time and sales over time (sales fills in automatically
    once sales entries exist).
- **A small database** — everything you add through the **+ Add New Entry** button
  (activities, marketing channel entries, and sales entries) is saved permanently
  so everyone sees the same data, not just your browser.

## One-time setup: connect the database

The dashboard works immediately with the CSV data. To turn on **saving entries**,
create a free database in your Vercel project (takes ~1 minute):

1. Open your project on **[vercel.com](https://vercel.com)**.
2. Go to the **Storage** tab → **Create Database** → choose **Postgres** (Neon).
   Accept the defaults and create it. Vercel automatically connects it to this
   project (it sets a `POSTGRES_URL` behind the scenes — you don't touch that).
3. Go to **Deployments** → open the latest one → **Redeploy** (so the new database
   connection takes effect).

That's it. The dashboard creates the table it needs automatically the first time
someone saves an entry. Until the database is connected, the site still works and
shows the CSV data; the Add Entry form will just say the database isn't connected
yet.

> **Before the database exists**, adding entries won't work — you'll see a clear
> message. **After** the steps above, it just works.

## Using it day to day

- **Add an entry:** click **+ Add New Entry**, pick the type (Activity, Marketing
  Channel, or Sales), fill the form, and Save. It appears right away and stays
  after a refresh.
- **See what was added by hand:** click **Recently added** (top right). Manually
  added activities are also marked **MANUAL** at the top of the Activities table.
- **Export:** the Activities tab has an **Export results (CSV)** button for the
  rows currently filtered.

## Updating the CSV data (when a new month arrives)

The 69k activity records come from the CSV files, not the database.

1. Upload the new `All_Activities_Export_<month>.csv` to the repo.
2. Run `python3 build_data.py` to rebuild `data.json`.
3. Commit and push — Vercel redeploys automatically.

## Files

| File | What it is |
|------|-----------|
| `index.html` | The dashboard (tabs, filters, Add Entry form, charts). |
| `api/entries.js` | The small server that saves/reads manual entries in the database. |
| `data.json` | Combined CSV data the dashboard reads. Generated — don't edit by hand. |
| `build_data.py` | Merges the monthly CSVs into `data.json`. |
| `package.json` | Lists the one library the server needs (`pg`). |
| `All_Activities_Export_*.csv` | The raw monthly exports. |
