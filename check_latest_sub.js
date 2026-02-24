
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_0xaZQ5wpHWFf@ep-proud-band-airckequ-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function checkSubmissions() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM submissions ORDER BY id DESC LIMIT 1");
    console.log("--- LATEST SUBMISSION ---");
    console.log(JSON.stringify(res.rows, null, 2));
    
    if (res.rows[0]) {
        const formRes = await client.query("SELECT google_sheet_url FROM forms WHERE id = $1", [res.rows[0].form_id]);
        console.log("--- FORM CONFIG ---");
        console.log(JSON.stringify(formRes.rows, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSubmissions();
