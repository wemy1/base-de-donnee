// service/getDemandesByClient.js
const pool = require('../db');

module.exports = async (req, res) => {
  const { clientId } = req.params;

  try {
    const result = await pool.query(
    `  SELECT 
          demande.id_demande, 
          demande.description, 
          demande.date_demande, 
          demande.statut,
          technicien.nom AS technicien_nom
        FROM demande
        LEFT JOIN technicien ON demande.technicien_id = technicien.id
        WHERE demande.client_id = $1
        ORDER BY demande.date_demande DESC`,
      [clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'لا توجد طلبات لهذا العميل' });
    }

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur getDemandesByClient:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};