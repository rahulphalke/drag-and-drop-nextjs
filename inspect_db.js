
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_0xaZQ5wpHWFf@ep-proud-band-airckequ-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function inspect() {
  const client = await pool.connect();
  try {
    // Check columns
    const colRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'forms'
    `);
    console.log("--- COLUMNS ---");
    console.log(JSON.stringify(colRes.rows, null, 2));

    // Check form 12
    const formRes = await client.query("SELECT * FROM forms WHERE id = 12 OR id = 2");
    console.log("--- DATA (Forms 2 & 12) ---");
    console.log(JSON.stringify(formRes.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
