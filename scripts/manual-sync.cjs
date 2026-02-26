
const pg = require("pg");

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function sync() {
  try {
    console.log("Creating connected_accounts table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "connected_accounts" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL,
        "provider" text NOT NULL,
        "provider_id" text NOT NULL,
        "email" text NOT NULL,
        "name" text NOT NULL,
        "access_token" text NOT NULL,
        "refresh_token" text,
        "created_at" timestamp DEFAULT now()
      );
    `);

    console.log("Adding columns to forms table...");
    try {
      await pool.query('ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "google_sheet_id" text;');
    } catch (e) {
      console.log("google_sheet_id column check failed:", e.message);
    }

    try {
      await pool.query('ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "connected_account_id" integer;');
    } catch (e) {
      console.log("connected_account_id column check failed:", e.message);
    }

    try {
      await pool.query('ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "google_sheet_name" text;');
    } catch (e) {
      console.log("google_sheet_name column check failed:", e.message);
    }

    console.log("Schema sync complete!");
  } catch (err) {
    console.error("Sync failed:", err);
  } finally {
    await pool.end();
  }
}

sync();
