// service/assignTechnicienToDemande.js
const pool = require('../db');

module.exports = async (req, res) => {
  const { id_demande } = req.params;
  const { technicien_id } = req.body;

  try {
    // تحقق إذا الطلب عام ومازال ماقبلوش حتى واحد
    const result = await pool.query(
    `  SELECT * FROM demande WHERE id_demande = $1 AND technicien_id IS NULL`,
      [id_demande]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'الطلب غير متاح أو تم قبوله بالفعل' });
    }

    // نحدث الطلب
    await pool.query(
      `UPDATE demande SET technicien_id = $1, statut = 'acceptée' WHERE id_demande = $2`,
      [technicien_id, id_demande]
    );

    res.status(200).json({ message: 'تم قبول الطلب بنجاح' });
  } catch (err) {
    console.error('Erreur assignTechnicienToDemande:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};