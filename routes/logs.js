const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/logs?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  try {
    const { rows } = await db.query(
      'SELECT * FROM food_logs WHERE log_date = $1 ORDER BY created_at',
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kayıtlar alınamadı.' });
  }
});

// GET /api/logs/history
router.get('/history', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT
        log_date::text                 AS date,
        ROUND(SUM(kcal))               AS total_kcal,
        ROUND(SUM(prot))               AS total_prot,
        ROUND(SUM(karb))               AS total_karb,
        ROUND(SUM(yag))                AS total_yag,
        ROUND(SUM(lif))                AS total_lif,
        COUNT(*)::int                  AS entry_count
      FROM food_logs
      GROUP BY log_date
      ORDER BY log_date DESC
      LIMIT 30
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tarihçe alınamadı.' });
  }
});

// POST /api/logs
router.post('/', async (req, res) => {
  const { log_date, meal, name, amount, kcal, prot, karb, yag, lif, unhealthy } = req.body;
  if (!meal || !name || amount == null) {
    return res.status(400).json({ error: 'Eksik alan.' });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO food_logs (log_date, meal, name, amount, kcal, prot, karb, yag, lif, unhealthy)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        log_date || new Date().toISOString().slice(0, 10),
        meal, name, amount, kcal || 0, prot || 0,
        karb || 0, yag || 0, lif || 0, unhealthy || false
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kayıt eklenemedi.' });
  }
});

// PUT /api/logs/:id  — yeni miktar gönder, sunucu makroları ölçekler
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const newAmount = parseFloat(req.body.amount);
  if (!id || !newAmount || newAmount <= 0) {
    return res.status(400).json({ error: 'Geçersiz değer.' });
  }
  try {
    const { rows } = await db.query(
      `UPDATE food_logs SET
         kcal   = ROUND((kcal  / amount) * $1, 2),
         prot   = ROUND((prot  / amount) * $1, 2),
         karb   = ROUND((karb  / amount) * $1, 2),
         yag    = ROUND((yag   / amount) * $1, 2),
         lif    = ROUND((lif   / amount) * $1, 2),
         amount = $1
       WHERE id = $2
       RETURNING *`,
      [newAmount, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kayıt güncellenemedi.' });
  }
});

// DELETE /api/logs/:id
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.query('DELETE FROM food_logs WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kayıt silinemedi.' });
  }
});

module.exports = router;
