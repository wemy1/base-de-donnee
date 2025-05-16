const express = require('express');
const router = express.Router();
const upload = require('./uploadProfile');
const pool = require('../db'); // اتصال بقاعدة البيانات

router.post('/upload-profile/:userType/:id', upload.single('photo'), async (req, res) => {
  const { userType, id } = req.params;
  const photoPath = req.file.filename;

  let table = userType === 'client' ? 'client' : 'technicien';

  try {
    await pool.query(`UPDATE ${table} SET photo = $1 WHERE id = $2`, [photoPath, id]);
    res.json({ message: 'Photo updated successfully', photo: photoPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;