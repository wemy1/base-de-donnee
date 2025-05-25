const pool = require('../db');

module.exports = async (client_id) => {
  try {
    const result = await pool.query(
      'SELECT points FROM client WHERE id_client = $1',
      [client_id]
    );

    if (result.rows.length > 0) {
      const points = result.rows[0].points;

      // لو عندو 50 نقطة أو أكثر نعطيوه تخفيض 10%
      if (points >= 50) {
        return 0.9; // 90% من السعر يعني خصم 10%
      }
    }
    return 1; // ما كانش تخفيض
  } catch (error) {
    console.error('Erreur lors du contrôle des points:', error);
    throw error;
  }
};