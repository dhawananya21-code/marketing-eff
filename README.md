# Marketing Activity Dashboard

An internal tool to browse field-marketing data and add new entries by hand.
It runs on Vercel and has two parts:

- **A dashboard** (`index.html`) — three tabs:
  - **Overview** (opens first) — top stats (total activities, completion rate,
    products promoted, regions active, farmer reach, cost) and bar breakdowns
    (activity type/channel mix, top products, category split, top regions, top
    activities). Every product, region, activity and type name is clickable —
    click one to filter the whole page to everything connected to it.
  - **Activities** — one merged table of all activities. Field work and channel
    campaigns are now a single thing. Core fields: Type of activity (Digital /
    OOH / Field), Activity name, Product, Date, Region/District, Farmer Reach,
    Cost — plus optional Employee, Designation, Zone, Territory, Status,
    Achieved, Product Category (kept from the old data). Filter by any of these.
  - **Channel Efficiency** — matches activity cost with sales value by region and
    month (needs enough data to switch on).
- **A small database** — everything you add through **+ Add New Entry** or
  **⬆ Upload CSV** (activities and sales) is saved permanently so everyone sees
  the same data. Older data (activities and marketing-channel entries) is merged
  into the single Activities view automatically — nothing is lost.

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
