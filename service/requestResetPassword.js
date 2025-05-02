// service/requestResetPassword.js
const pool = require('../db');
const { sendVerificationEmail } = require('../config/nodemailer');

async function requestResetPassword(email) {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const client = await pool.query('SELECT * FROM client WHERE email = $1', [email]);
    if (client.rows.length === 0) {
        throw new Error('Email not found');
    }

    await pool.query('UPDATE client SET verification_code = $1 WHERE email = $2', [verificationCode, email]);
    await sendVerificationEmail(email, verificationCode);

    return { message: 'Verification code sent to your email' };
}

module.exports = requestResetPassword;