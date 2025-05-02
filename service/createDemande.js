// service/createDemande.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // الاتصال بقاعدة البيانات

router.post('/', async (req, res) => {
  const { technicien_id , client_id, description, adresse, wilaya_id, service_id } = req.body;

  try {
    const result = await pool.query(
    `  INSERT INTO demande (technicien_id ,client_id, description, adresse, wilaya_id, service_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [technicien_id ,client_id, description, adresse, wilaya_id, service_id]
    );
await pool.query(
 ` UPDATE client SET points = points + 10 WHERE id = $1`,
  [client_id] 
);
    res.status(201).json({
      message: 'تم إنشاء الطلب بنجاح',
      demande: result.rows[0],
    });
  } catch (err) {
    console.error('Erreur lors de la création de la demande:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;