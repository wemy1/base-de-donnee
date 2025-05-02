// service/deleteService.js
const pool = require('../db');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM service WHERE id = $1', [id]);
    res.status(200).json({ message: 'تم حذف التخصص بنجاح' });
  } catch (err) {
    console.error('Erreur deleteService:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};