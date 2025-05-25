const pool = require('../db'); // استوردي الاتصال بقاعدة البيانات

async function getServices(req, res) {
  try {
    const result = await pool.query('SELECT id_service, description FROM service WHERE statut = true ORDER BY id_service ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des services' });
  }
}

module.exports = getServices;