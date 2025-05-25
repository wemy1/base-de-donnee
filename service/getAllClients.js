// service/getAllClients.js
const pool = require('../db');

module.exports = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM client ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erreur getAllClients:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};