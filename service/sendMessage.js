const pool = require('../db');

module.exports = async (req, res) => {
  const { contenu, client_id, technicien_id, emetteur } = req.body;

  try {
    const result = await pool.query(
    `  INSERT INTO message (contenu, date_envoi, client_id, technicien_id, emetteur)
       VALUES ($1, NOW(), $2, $3, $4) RETURNING *`,
      [contenu, client_id, technicien_id, emetteur]
    );

    res.status(201).json({ message: 'Message envoyé', data: result.rows[0] });
  } catch (err) {
    console.error('Erreur envoi message:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};