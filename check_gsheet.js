
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_0xaZQ5wpHWFf@ep-proud-band-airckequ-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function inspect() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, title, google_sheet_url, whatsapp_number FROM forms ORDER BY id DESC LIMIT 10");
    console.log("--- RECENT FORMS ---");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
