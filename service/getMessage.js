const pool = require('../db');

module.exports = async (req, res) => {
  const { client_id, technicien_id } = req.query;

  try {
    const result = await pool.query(
    `  SELECT * FROM message
       WHERE client_id = $1 AND technicien_id = $2
       ORDER BY date_envoi ASC`,
      [client_id, technicien_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur récupération messages:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};