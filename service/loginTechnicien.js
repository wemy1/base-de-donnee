// services/loginTechnicien.js
const pool = require('../db');

module.exports = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: 'يرجى ملء جميع الحقول' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM technicien WHERE email = $1 AND mot_de_passe = $2',
      [email, mot_de_passe]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // تسجيل الدخول ناجح
    const technicien = result.rows[0];
    res.status(200).json({ message: 'تم تسجيل الدخول بنجاح', technicien });
  } catch (err) {
    console.error('Erreur loginTechnicien:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};