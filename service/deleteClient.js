// service/adeleteClient.js
const pool = require('../db');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM client WHERE id = $1', [id]);
    res.status(200).json({ message: 'تم حذف العميل بنجاح' });
  } catch (err) {
    console.error('Erreur deleteClient:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};