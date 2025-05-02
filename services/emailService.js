const nodemailer = require('nodemailer');

async function sendVerificationEmail(toEmail, code) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // ما تستعمليش كلمة السر الحقيقية، استعملي app password من Gmail
    }
  });

  const mailOptions = {
    from: 'meriemhamza560@gmail.com',
    to: toEmail,
    subject: 'Vérification de votre compte',
    text: `Voici votre code de vérification : ${code}`
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail};