// service/getAvisByTechnicienId.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:technicienId', async (req, res) => {
  const { technicienId } = req.params;

  try {
    const result = await pool.query(
     ` SELECT 
          avis.note,
          avis.commentaire,
          avis.date,
          client.nom,
          client.prenom
       FROM avis
       JOIN client ON avis.client_id = client.id
       WHERE avis.technicien_id = $1
       ORDER BY avis.date DESC`,
      [technicienId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des avis:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;