// service/getTechnicienById.js

const express = require('express');
const router = express.Router();
const pool = require('../db'); // الاتصال بقاعدة البيانات

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
    `  SELECT 
        technicien.id, 
        technicien.nom, 
        technicien.prenom, 
        technicien.telephone, 
        technicien.email, 
        technicien.wilaya_id,
        service.description AS service_description,
        service.prix AS service_prix
      FROM technicien
      JOIN service ON technicien.service_id = service.id_service
      WHERE technicien.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Technicien non trouvé' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération du technicien:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;