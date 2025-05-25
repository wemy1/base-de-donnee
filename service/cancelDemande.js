// service/cancelDemande.js
const pool = require('../db');

module.exports = async (req, res) => {
  const { id_demande } = req.params;
  const { user_type, user_id } = req.body;

  try {
    // تحقق أن الطلب موجود
    const result = await pool.query(
     ` SELECT * FROM demande WHERE id_demande = $1`,
      [id_demande]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    const demande = result.rows[0];

    // تحقق أن المستخدم عندو الحق يلغي (يا العميل تاع الطلب، يا الفني المرتبط بالطلب)
    if (
      (user_type === 'client' && demande.client_id !== user_id) ||
      (user_type === 'technicien' && demande.technicien_id !== user_id)
    ) {
      return res.status(403).json({ message: 'لا تملك صلاحية إلغاء هذا الطلب' });
    }

    // إلغاء الطلب: نحدث الحالة إلى "ملغى"
    await pool.query(
    `  UPDATE demande SET statut = 'annulée' WHERE id_demande = $1`,
      [id_demande]
    );

    res.status(200).json({ message: 'تم إلغاء الطلب بنجاح' });
  } catch (err) {
    console.error('Erreur cancelDemande:', err);
    res.status(500).json({ message: 'خطأ في السيرفر' });
  }
};