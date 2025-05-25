// service/updateDemande.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.put('/:id_demande', async (req, res) => {
  const { id_demande } = req.params;
  const { description, adresse } = req.body;

  try {
    const result = await pool.query(
      'UPDATE demande SET description = $1, adresse = $2 WHERE id_demande = $3 RETURNING *',
      [description, adresse, id_demande]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    res.status(200).json({ message: 'تم تعديل الطلب بنجاح', demande: result.rows[0] });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la demande:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;