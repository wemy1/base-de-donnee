const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { sendVerificationEmail } = require('../services/emailService');

// Configuration de la pool de connexions
const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'depannage',
  password: process.env.PG_PASSWORD || 'meriem2025!',
  port: process.env.PG_PORT || 5432,
});

module.exports = {
  signup: async (req, res) => {
    try {
      // 1. Validation des données
      const { nom, prenom, email, mot_de_passe, telephone, adresse } = req.body;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Email invalide' });
      }

      if (!mot_de_passe || mot_de_passe.length < 8) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
      }

      // 2. Vérification de l'email existant
      const checkEmailQuery = 'SELECT * FROM "User" WHERE email = $1';
      const emailCheck = await pool.query(checkEmailQuery, [email]);
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Email déjà utilisé' });
      }

      // 3. Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(mot_de_passe, 12);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 4. Insertion dans la base de données
      const { rows: [user] } = await pool.query(
        `INSERT INTO "User" 
         (nom, prenom, email, mot_de_passe, telephone, adresse) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, email`,
        [nom, prenom, email, hashedPassword, telephone, adresse]
      );

      // 5. Insertion dans la table client
     // await pool.query(
        //`INSERT INTO client 
        // (nom, prenom, email, telephone, adresse, user_id, verification_code) 
        // VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        //[nom, prenom, email, telephone, adresse, user.id, verificationCode]
      //);

      // 6. Envoi d'email de vérification
      //await sendVerificationEmail(email, verificationCode);

      // 7. Réponse
      res.status(201).json({
        success: true,
        message: 'Code de vérification envoyé avec succès',
         user: {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom
        }
      });

    } catch (err) {
      console.error('Erreur inscription:', err);
      
      if (err.code === '23505') { // Violation de contrainte unique
        return res.status(409).json({ error: 'Email déjà utilisé' });
      }

      if (err.code === '23502') { // Violation de NOT NULL
        return res.status(400).json({ error: 'Champ obligatoire manquant' });
      }

      res.status(500).json({ error: 'Erreur serveur, veuillez réessayer plus tard.' });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      // التأكد من أن الطلب يحتوي على محتوى JSON
      if (!req.is('application/json')) {
        return res.status(415).json({ error: 'Content-Type must be application/json' });
      }

      const { email, verificationCode } = req.body;

      // 1. Validation des données
      if (!email || !verificationCode) {
        return res.status(400).json({ 
          error: 'Email et code de vérification sont requis',
          received_data: req.body // لأغراض debugging
        });
      }

      // 2. Vérification du code
      const clientQuery = 'SELECT * FROM client WHERE email = $1';
      const clientResult = await pool.query(clientQuery, [email]);

      if (clientResult.rows.length === 0) {
        return res.status(404).json({ error: 'Email non trouvé' });
      }

      if (clientResult.rows[0].verificationCode !== verificationCode.trim()) {
        return res.status(400).json({ error: 'Code de vérification invalide' });
      }

      // 3. Mise à jour de la vérification
      const updateVerificationQuery = 'UPDATE client SET id_verified = true WHERE email = $1';
      await pool.query(updateVerificationQuery, [email]);
      
      // 4. Réponse
      res.status(200).json({ 
        success: true,
        message: 'Email vérifié avec succès!' 
      });

    } catch (error) {
      console.error('Erreur dans verifyEmail:', error);
      res.status(500).json({ 
        error: 'Erreur serveur lors de la vérification de l\'email',
        details: error.message // إضافة تفاصيل الخطأ للإصلاح
      });
    }
  },

  
  login: async (req, res) => {
    try {
      const { email, mot_de_passe } = req.body;

      if (!email || !mot_de_passe) {
        return res.status(400).json({ error: "Email et mot de passe sont requis" });
      }

      const userQuery = 'SELECT * FROM "client" WHERE email = $1';
      const userResult = await pool.query(userQuery, [email]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      const client = userResult.rows[0];

      if (mot_de_passe !== client.mot_de_passe) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      const clientCheck = await pool.query(
        'SELECT id_verified FROM client WHERE client_id = $1',
        [client.id]
      );
      if (clientCheck.rows.length > 0 && !clientCheck.rows[0].id_verified) {
        return res.status(403).json({
          error: "Veuillez vérifier votre email avant de vous connecter",
        });
      }

      res.status(200).json({
        success: true,
        message: "Connexion réussie",
        user: {
          id: client.id,
          email: client.email,
          nom: client.nom,
          prenom: client.prenom,
          role: "client"
        },
      });
    } catch (error) {
      console.error("Erreur dans login:", error);
      res.status(500).json({ error: "Erreur serveur lors de la connexion" });
    }
  },
};
