// routes/calendar.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // اتأكدي من المسار الصحيح حسب مشروعك

// GET calendar by technicienId
router.get('/:technicienId', async (req, res) => {
  const { technicienId } = req.params;

  try {
    const result = await pool.query(
      'SELECT date, status FROM disponibilites WHERE technicien_id = $1',
      [technicienId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching calendar' });
  }
});

// POST new reservation date
router.post('/:technicienId', async (req, res) => {
  const { date } = req.body;
  const { technicienId } = req.params;

  try {
    await pool.query(
      'INSERT INTO disponibilites (technicien_id, date, status) VALUES ($1, $2, $3)',
      [technicienId, date, 'occupied']
    );
    res.json({ message: 'Date reserved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error saving date' });
  }
});

module.exports = router; 