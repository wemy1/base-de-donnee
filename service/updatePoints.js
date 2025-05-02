const pool = require('../db');

module.exports = async (client_id) => {
  try {
    // زيادة 10 نقاط
    await pool.query(
      'UPDATE client SET points = points + 10 WHERE id_client = $1',
      [client_id]
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour des points:', error);
    throw error;
  }
};