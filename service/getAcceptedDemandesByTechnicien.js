// service/getAcceptedDemandesByTechnicien.js
const pool = require('../db');

module.exports = async (req, res) => {
  const { technicienId } = req.params;

  try {
    const result = await pool.query(
     ` SELECT 
          demande.id_demande,
          demande.description,
          demande.date_demande,
          demande.statut,
          client.nom AS client_nom
        FROM demande
        JOIN client ON demande.client_id = client.id
        WHERE demande.technicien_id = $1 AND demande.statut = 'acceptée'
        ORDER BY demande.date_demande DESC`,
      [technicienId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'لا توجد طلبات مقبولة لهذا الفني' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur getAcceptedDemandesByTechnicien:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};