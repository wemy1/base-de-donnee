// service/getDemandeById.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:id_demande', async (req, res) => {
  const { id_demande } = req.params;

  try {
    const result = await pool.query(
     ` SELECT 
          demande.id_demande,
          demande.description,
          demande.date_demande,
          demande.statut,
          client.nom AS client_nom,
          client.prenom AS client_prenom,
          demande.adresse,
          technicien.nom AS technicien_nom,
          service.id_service
        FROM demande
        JOIN client ON demande.client_id = client.id
        LEFT JOIN technicien ON demande.technicien_id = technicien.id
        JOIN service ON demande.service_id = service.id_service
        WHERE demande.id_demande = $1`,
      [id_demande]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération de la demande:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;