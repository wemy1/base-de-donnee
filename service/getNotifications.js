const pool = require('../db');

module.exports = async (req, res) => {
  const { userId, userType } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 AND user_type = $2 ORDER BY created_at DESC',
      [userId, userType]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur getNotifications:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};