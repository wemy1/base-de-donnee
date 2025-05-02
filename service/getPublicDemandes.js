// service/getPublicDemandes.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
     ` SELECT 
          demande.id_demande,
          demande.description,
          demande.date_demande,
          demande.statut,
          demande.adresse,
          client.nom AS client_nom,
          service.nom_service
        FROM demande
        JOIN client ON demande.client_id = client.id
        JOIN service ON demande.service_id = service.id_service
        WHERE demande.technicien_id IS NULL
        ORDER BY demande.date_demande DESC`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des demandes publiques:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
});

module.exports = router;