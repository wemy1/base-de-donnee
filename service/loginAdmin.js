// service/loginAdmin.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'secret_key';

router.post('/login/admin', async (req, res) => {
  console.log('🟢 Requête reçue: /api/login/admin');

  const { email, mot_de_passe } = req.body;

  try {
    const result = await pool.query('SELECT * FROM admin WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email incorrect' });
    }

    const admin = result.rows[0];

    if (mot_de_passe !== admin.mot_de_passe) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: admin.id, role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });

    res.status(200).json({ message: 'Connexion réussie', token });
  } catch (err) {
    console.error('Erreur login admin:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;