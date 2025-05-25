// service/updateService.js
const pool = require('../db');

module.exports = async (req, res) => {
  const { id } = req.params;
  const { nom } = req.body;

  try {
    await pool.query('UPDATE service SET nom = $1 WHERE id = $2', [nom, id]);
    res.status(200).json({ message: 'تم تعديل التخصص بنجاح' });
  } catch (err) {
    console.error('Erreur updateService:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};