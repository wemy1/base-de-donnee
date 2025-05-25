// service/deleteDemande.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.delete('/:id_demande', async (req, res) => {
  const { id_demande } = req.params;

  try {
    const result = await pool.query('DELETE FROM demande WHERE id_demande = $1 RETURNING *', [id_demande]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'الطلب غير موجود أو تم حذفه بالفعل' });
    }

    res.status(200).json({ message: 'تم حذف الطلب بنجاح' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la demande:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;