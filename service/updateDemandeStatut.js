
// service / updateDemandeStatut.js
const pool = require('../db'); 

module.exports = async (req, res) => {
  const { id_demande } = req.params;
  const { statut, technicien_id } = req.body;

  const validStatuts = ['acceptée', 'refusée', 'en attente'];
  if (!validStatuts.includes(statut)) {
    return res.status(400).json({ error: 'الحالة غير صالحة' });
  }

  try {
    // تحقق أن الطلب يخص هذا التقني
    const result = await pool.query(
      'SELECT * FROM demande WHERE id_demande = $1 AND technicien_id = $2',
      [id_demande, technicien_id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'الطلب غير موجود أو لا يخص هذا التقني' });
    }

    // تحديث الحالة
    await pool.query(
      'UPDATE demande SET statut = $1 WHERE id_demande = $2',
      [statut, id_demande]
    );

    res.status(200).json({ message: 'تم تحديث حالة الطلب بنجاح', statut });
  } catch (err) {
    console.error('Erreur updateDemandeStatut:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};