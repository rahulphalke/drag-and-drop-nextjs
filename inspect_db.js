
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
      WHERE table_name = 'users'
    `);
    console.log("--- USERS COLUMNS ---");
    console.log(JSON.stringify(colRes.rows, null, 2));

    // Check users
    const userRes = await client.query("SELECT * FROM users LIMIT 1");
    console.log("--- DATA (User) ---");
    console.log(JSON.stringify(userRes.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    await pool.end();
  }
}

inspect();
