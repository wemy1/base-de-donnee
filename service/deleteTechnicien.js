// service/deleteTechnicien.js
const pool = require('../db');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM technicien WHERE id = $1', [id]);
    res.status(200).json({ message: 'تم حذف الفني بنجاح' });
  } catch (err) {
    console.error('Erreur deleteTechnicien:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};