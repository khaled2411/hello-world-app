const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: 5432,
  database: process.env.DB_NAME || 'hellodb',
  user: process.env.DB_USER || 'hello',
  password: process.env.DB_PASSWORD,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clicks (
      id SERIAL PRIMARY KEY,
      clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

app.use(express.static('public'));

app.post('/api/click', async (req, res) => {
  const result = await pool.query(
    'INSERT INTO clicks (clicked_at) VALUES (NOW()) RETURNING *'
  );
  res.json(result.rows[0]);
});

app.get('/api/clicks', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM clicks ORDER BY clicked_at DESC LIMIT 20'
  );
  res.json(result.rows);
});

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
