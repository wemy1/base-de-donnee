const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { note, commentaire, client_id, technicien_id } = req.body;

  try {
    const result = await pool.query(
    `  INSERT INTO avis (note, commentaire, date, client_id, technicien_id)
       VALUES ($1, $2, CURRENT_DATE, $3, $4)
       RETURNING id, note, commentaire, date, client_id, technicien_id`,
      [note, commentaire, client_id, technicien_id]
    );

    res.status(201).json({
      message: 'تم إضافة التقييم بنجاح',
      avis: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout de l\'avis:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;