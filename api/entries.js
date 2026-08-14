// Serverless API for manually-added dashboard entries.
// Runs on Vercel (Node runtime) and against a plain local Postgres in tests.
//
// GET  /api/entries  -> { ok, configured, entries: [...] }   (all manual entries, newest first)
// POST /api/entries  -> { ok, configured, entry: {...} }      (save one entry)
//
// If no database is connected yet (no POSTGRES_URL), GET returns an empty list
// with configured:false so the dashboard still works with the CSV data, and POST
// returns a clear "not connected yet" message instead of crashing.

import pg from "pg";
const { Pool } = pg;

const VALID_TYPES = new Set(["activity", "marketing", "sales"]);

let pool = null;
let tableReady = false;

function connectionString() {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ""
  );
}

function getPool() {
  const cs = connectionString();
  if (!cs) return null;
  if (!pool) {
    const isLocal = /localhost|127\.0\.0\.1/.test(cs);
    pool = new Pool({
      connectionString: cs,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

async function ensureTable(p) {
  if (tableReady) return;
  await p.query(`
    CREATE TABLE IF NOT EXISTS manual_entries (
      id         BIGSERIAL PRIMARY KEY,
      type       TEXT NOT NULL,
      payload    JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  tableReady = true;
}

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve) => {
    // Some hosts pre-parse the body onto req.body.
    if (req.body !== undefined && req.body !== null) {
      if (typeof req.body === "string") {
        try { resolve(JSON.parse(req.body || "{}")); } catch { resolve({}); }
      } else {
        resolve(req.body);
      }
      return;
    }
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => { try { resolve(JSON.parse(data || "{}")); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req, res) {
  const p = getPool();

  // No database configured yet — degrade gracefully.
  if (!p) {
    if (req.method === "GET") return send(res, 200, { ok: true, configured: false, entries: [] });
    return send(res, 503, {
      ok: false,
      configured: false,
      error: "The database isn't connected yet. Create a Postgres database in your Vercel project (Storage tab) and redeploy — see the README.",
    });
  }

  try {
    await ensureTable(p);

    if (req.method === "GET") {
      const { rows } = await p.query(
        "SELECT id, type, payload, created_at FROM manual_entries ORDER BY id DESC LIMIT 5000"
      );
      const entries = rows.map((r) => ({
        id: Number(r.id),
        type: r.type,
        created_at: r.created_at,
        ...r.payload,
      }));
      return send(res, 200, { ok: true, configured: true, entries });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const type = String(body.type || "").trim();
      if (!VALID_TYPES.has(type)) {
        return send(res, 400, { ok: false, error: "Unknown entry type." });
      }
      const payload = { ...body };
      delete payload.type;
      const { rows } = await p.query(
        "INSERT INTO manual_entries (type, payload) VALUES ($1, $2) RETURNING id, type, payload, created_at",
        [type, JSON.stringify(payload)]
      );
      const r = rows[0];
      return send(res, 201, {
        ok: true,
        configured: true,
        entry: { id: Number(r.id), type: r.type, created_at: r.created_at, ...r.payload },
      });
    }

    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { ok: false, error: "Method not allowed." });
  } catch (e) {
    return send(res, 500, { ok: false, error: "Server error: " + (e && e.message ? e.message : String(e)) });
  }
}
