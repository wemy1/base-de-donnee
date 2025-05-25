const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const pool = require('../db');
const emailService = require('../services/emailService');

module.exports.signup = async (req, res) => {
  try {
    console.log("Signup route hit");
    console.log('Request body:', req.body);
    
    // Destructuration avec les bons noms de champs
    const { nom, prenom, email, mot_de_passe, telephone, adresse } = req.body;

    // Validation des champs obligatoires
    if (!nom || !prenom || !email || !mot_de_passe || !telephone || !adresse) {
      return res.status(400).json({ 
        error: 'Tous les champs sont obligatoires',
        missing: {
          nom: !nom,
          prenom: !prenom,
          email: !email,
          mot_de_passe: !mot_de_passe,
          telephone: !telephone,
          adresse: !adresse
        }
      });
    }

    // Validation du mot de passe
    if (!mot_de_passe || mot_de_passe.trim() === "" || mot_de_passe.length < 8) {
      return res.status(400).json({ 
        error: 'Le mot de passe doit contenir au moins 8 caractères' 
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Format d\'email invalide' 
      });
    }

    // Vérification que l'email n'existe pas déjà
    const checkEmailQuery = 'SELECT * FROM "User" WHERE email = $1';
    const result = await pool.query(checkEmailQuery, [email.toLowerCase()]);
    
    if (result.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cette adresse email est déjà utilisée' 
      });
    }

    // Chiffrement du mot de passe
    const saltRounds = 12; // Augmenté pour plus de sécurité
    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    // Transaction pour insérer l'utilisateur et le client
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insertion de l'utilisateur
      const insertUserQuery = `
        INSERT INTO "User" (nom, prenom, email, mot_de_passe, telephone, adresse, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
        RETURNING *
      `;
      const newUserResult = await client.query(insertUserQuery, [
        nom.trim(), 
        prenom.trim(), 
        email.toLowerCase().trim(), 
        hashedPassword, 
        telephone.trim(), 
        adresse.trim()
      ]);

      const newUser = newUserResult.rows[0];
      console.log('User created:', { id: newUser.id, email: newUser.email });

      // Génération du code de vérification
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Verification Code generated:', verificationCode);

      // Insertion du client
      const insertClientQuery = `
        INSERT INTO client (nom, prenom, email, telephone, adresse, user_id, verification_code, created_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `;
      const clientResult = await client.query(insertClientQuery, [
        nom.trim(), 
        prenom.trim(), 
        email.toLowerCase().trim(), 
        telephone.trim(), 
        adresse.trim(), 
        newUser.id, 
        verificationCode
      ]);

      console.log('Client created:', { id: clientResult.rows[0].id, email: clientResult.rows[0].email });

      // Envoi de l'email de vérification
      try {
        await emailService.sendVerificationEmail(email.toLowerCase().trim(), verificationCode);
        console.log('Verification email sent successfully');
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // On continue même si l'email échoue, mais on le signale
        await client.query('ROLLBACK');
        return res.status(500).json({ 
          error: 'Utilisateur créé mais impossible d\'envoyer l\'email de vérification. Veuillez contacter le support.' 
        });
      }

      await client.query('COMMIT');

      res.status(201).json({ 
        message: 'Inscription réussie ! Un code de vérification a été envoyé à votre adresse email.',
        data: {
          userId: newUser.id,
          email: newUser.email,
          nom: newUser.nom,
          prenom: newUser.prenom
        }
      });

    } catch (transactionError) {
      await client.query('ROLLBACK');
      throw transactionError;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error in signup:', error.message);
    console.error('Full error:', error);
    
    // Gestion spécifique des erreurs PostgreSQL
    if (error.code === '23505') { // Violation de contrainte unique
      return res.status(400).json({ 
        error: 'Cette adresse email est déjà utilisée' 
      });
    }
    
    if (error.code === '23502') { // Violation de contrainte NOT NULL
      return res.status(400).json({ 
        error: 'Tous les champs obligatoires doivent être remplis' 
      });
    }

    res.status(500).json({ 
      error: 'Erreur interne du serveur lors de l\'inscription',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports.verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Validation des données d'entrée
    if (!email || !verificationCode) {
      return res.status(400).json({ 
        error: 'Email et code de vérification sont requis' 
      });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedCode = verificationCode.toString().trim();

    // Recherche du client avec le code de vérification
    const clientQuery = `
      SELECT * FROM client 
      WHERE email = $1 AND verification_code = $2 AND id_verified = false
    `;
    
    const clientResult = await pool.query(clientQuery, [trimmedEmail, trimmedCode]);
    
    if (clientResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Code de vérification invalide ou email déjà vérifié' 
      });
    }

    // Vérification de l'expiration du code (optionnel - ajouter une colonne expires_at)
    // const client = clientResult.rows[0];
    // if (client.expires_at && new Date() > client.expires_at) {
    //   return res.status(400).json({ error: 'Code de vérification expiré' });
    // }

    // Mise à jour du statut de vérification
    const updateVerificationQuery = `
      UPDATE client 
      SET id_verified = true, verification_code = NULL, verified_at = NOW() 
      WHERE email = $1 AND verification_code = $2
      RETURNING *
    `;
    
    const updateResult = await pool.query(updateVerificationQuery, [trimmedEmail, trimmedCode]);
    
    if (updateResult.rows.length === 0) {
      return res.status(500).json({ 
        error: 'Erreur lors de la vérification' 
      });
    }

    console.log('Email verified successfully for:', trimmedEmail);
    
    res.status(200).json({ 
      message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
      data: {
        email: updateResult.rows[0].email,
        verified: true
      }
    });

  } catch (error) {
    console.error('Error in verifyEmail:', error.message);
    console.error('Full error:', error);
    
    res.status(500).json({ 
      error: 'Erreur interne du serveur lors de la vérification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Validation des données d'entrée
    if (!email || !mot_de_passe) {
      return res.status(400).json({ 
        error: 'Email et mot de passe sont requis' 
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Recherche de l'utilisateur
    const userQuery = 'SELECT * FROM "User" WHERE email = $1';
    const userResult = await pool.query(userQuery, [trimmedEmail]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    const user = userResult.rows[0];

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Vérification que l'email est vérifié (optionnel)
    const clientQuery = 'SELECT id_verified FROM client WHERE email = $1';
    const clientResult = await pool.query(clientQuery, [trimmedEmail]);
    
    if (clientResult.rows.length > 0 && !clientResult.rows[0].id_verified) {
      return res.status(403).json({ 
        error: 'Veuillez vérifier votre adresse email avant de vous connecter' 
      });
    }

    // Mise à jour de la dernière connexion
    const updateLoginQuery = 'UPDATE "User" SET last_login = NOW() WHERE id = $1';
    await pool.query(updateLoginQuery, [user.id]);

    console.log('User logged in successfully:', trimmedEmail);

    res.status(200).json({ 
      message: 'Connexion réussie',
      data: {
        userId: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom
      }
    });

  } catch (error) {
    console.error('Error in login:', error.message);
    console.error('Full error:', error);
    
    res.status(500).json({ 
      error: 'Erreur interne du serveur lors de la connexion',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};