const { Client } = require('pg');
require('dotenv').config();

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('Tables in public schema:');
    res.rows.forEach(row => console.log(`- ${row.table_name}`));
  } catch (err) {
    console.error('Error connecting to database:', err.message);
  } finally {
    await client.end();
  }
}

checkTables();
