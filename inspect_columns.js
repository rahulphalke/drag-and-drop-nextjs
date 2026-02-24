
import pg from 'pg';
import fs from 'fs';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_0xaZQ5wpHWFf@ep-proud-band-airckequ-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

async function checkColumns() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'forms'
    `);
    fs.writeFileSync('columns.json', JSON.stringify(res.rows, null, 2));
    console.log("Written columns to columns.json");
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkColumns();
