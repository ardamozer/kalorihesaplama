require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.PGHOST     || 'localhost',
  port:     parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'kalorihesaplama',
  user:     process.env.PGUSER     || 'postgres',
  password: process.env.PGPASSWORD || 'postgres123',
});

async function waitForDb(retries = 15, delayMs = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('PostgreSQL bağlantısı kuruldu.');
      return;
    } catch {
      console.log(`DB bekleniyor... (${i}/${retries})`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('Veritabanına bağlanılamadı.');
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  waitForDb,
};
