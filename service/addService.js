// service/addService.js
const pool = require('../db');

module.exports = async (req, res) => {
  const { nom } = req.body;

  try {
    await pool.query('INSERT INTO service (nom) VALUES ($1)', [nom]);
    res.status(201).json({ message: 'تمت إضافة التخصص بنجاح' });
  } catch (err) {
    console.error('Erreur addService:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};