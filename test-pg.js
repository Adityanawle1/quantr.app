const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function test() {
  console.log('Testing pg connection to:', process.env.DIRECT_URL)
  try {
    const res = await pool.query('SELECT NOW()')
    console.log('Success:', res.rows[0])
    await pool.end()
  } catch (err) {
    console.error('Error:', err)
  }
}

test()
