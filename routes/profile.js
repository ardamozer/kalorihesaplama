const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM profile WHERE id = 1');
    res.json(rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profil alınamadı.' });
  }
});

router.put('/', async (req, res) => {
  const { height, weight, age, gender, activity, goal, fiber_goal } = req.body;
  if (!height || !weight || !age || !gender || !activity || !goal) {
    return res.status(400).json({ error: 'Eksik alan.' });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO profile (id, height, weight, age, gender, activity, goal, fiber_goal, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (id) DO UPDATE SET
         height = EXCLUDED.height,
         weight = EXCLUDED.weight,
         age = EXCLUDED.age,
         gender = EXCLUDED.gender,
         activity = EXCLUDED.activity,
         goal = EXCLUDED.goal,
         fiber_goal = EXCLUDED.fiber_goal,
         updated_at = NOW()
       RETURNING *`,
      [height, weight, age, gender, activity, goal, fiber_goal || 25]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profil kaydedilemedi.' });
  }
});

module.exports = router;
