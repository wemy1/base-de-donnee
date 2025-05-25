// service/resetPassword.js
const pool = require('../db');
const bcrypt = require('bcrypt');

async function resetPassword(email, verification_code, newPassword) {
    const client = await pool.query('SELECT * FROM client WHERE email = $1 AND verification_code = $2', [email, verification_code]);
    if (client.rows.length === 0) {
        throw new Error('Invalid code or email');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE client SET password = $1, verification_code = NULL WHERE email = $2', [hashedPassword, email]);

    return { message: 'Password reset successfully' };
}

module.exports = resetPassword;