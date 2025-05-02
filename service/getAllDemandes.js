// service/getAllDemandes.js
const pool = require('../db');

module.exports = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM demande ORDER BY date_demande DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur getAllDemandes:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};