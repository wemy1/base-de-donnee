const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const pool = require('../db');
const emailService = require('../services/emailService');
module.exports.signup = async (req, res) => {
  try {
    console.log("Signup route hit");
    console.log('ENV VARIABLES in userController:');
console.log('PG_USER:', typeof process.env.PG_USER, process.env.PG_USER);
console.log('PG_PASSWORD:', typeof process.env.PG_PASSWORD, process.env.PG_PASSWORD);
console.log('PG_DATABASE:', typeof process.env.PG_DATABASE, process.env.PG_DATABASE);
    const { nom, prenom, email, mot_de_passe, telephone, adresse } = req.body;

    // تأكد من أن كلمة المرور ليست فارغة
    if (!mot_de_passe || mot_de_passe.trim() === "") {
      return res.status(400).json({ error: 'Password is required' });
    }

    // تحقق من أن البريد الإلكتروني غير موجود في قاعدة البيانات
    const checkEmailQuery = 'SELECT * FROM "User" WHERE email = $1';
    const result = await pool.query(checkEmailQuery, [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // إدخال المستخدم الجديد في قاعدة البيانات
    const insertUserQuery = 'INSERT INTO "User" (nom, prenom, email, mot_de_passe, telephone, adresse) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const newUser = await pool.query(insertUserQuery, [nom, prenom, email, hashedPassword, telephone, adresse]);

    // إرسال كود التحقق عبر البريد الإلكتروني
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Verification Code:', verificationCode);
    await emailService.sendVerificationEmail(email, verificationCode);


    // إضافة العميل إلى جدول "clients"
    const insertClientQuery = 'INSERT INTO client (nom, prenom, email, telephone, adresse, user_id, verification_code) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    await pool.query(insertClientQuery, [nom, prenom, email, telephone, adresse, newUser.rows[0].id, verificationCode]);
    console.log('Inserted into client:', {
      nom, prenom, email, telephone, adresse, user_id: newUser.rows[0].id, verificationCode
    });

    res.status(201).json({ message: 'User created successfully. Verification code sent to email.' });
  } catch (error) {
    console.error('Error in signup:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
};

module.exports.verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;

  // تحقق من وجود العميل في قاعدة البيانات
  const clientQuery = 'SELECT * FROM client WHERE email = $1';
  
  try {
    const clientResult = await pool.query(clientQuery, [email]);
    console.log('Found client in DB:', clientResult.rows[0]);
    if (clientResult.rows.length === 0 || clientResult.rows[0].verification_code !== verificationCode.trim()) {
      return res.status(400).json({ error: 'Invalid verification code or email.' });
    }

    // تحديث حالة التحقق في قاعدة البيانات
    const updateVerificationQuery = 'UPDATE client SET id_verified = true WHERE email = $1';
    await pool.query(updateVerificationQuery, [email]);
    
    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Error in verifyEmail:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
};

module.exports.login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  // تحقق من وجود المستخدم في قاعدة البيانات
  const userQuery = 'SELECT * FROM "User" WHERE email = $1';
  
  try {
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(mot_de_passe, userResult.rows[0].mot_de_passe);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error('Error in login:', error.message);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
};