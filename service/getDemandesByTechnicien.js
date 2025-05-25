// service/getDemandesByTechnicien.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // الاتصال بقاعدة البيانات

router.get('/:technicienId', async (req, res) => {
  const { technicienId } = req.params;

  try {
    const result = await pool.query(
    `  SELECT 
          demande.id_demande, 
          client.nom AS client_nom, 
          demande.description, 
          demande.date_demande, 
          demande.statut
        FROM demande
        JOIN client ON demande.client_id = client.id
        WHERE demande.technicien_id = $1
        ORDER BY demande.date_demande DESC`,
      [technicienId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'لا توجد طلبات لهذا الفني' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des demandes:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;