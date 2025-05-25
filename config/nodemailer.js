const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // تأكد من أنك قمت بإعداد متغيرات البيئة
    pass: process.env.EMAIL_PASS, // تأكد من أنك قمت بإعداد كلمة السر الخاصة بـ app password
  },
});

module.exports.sendVerificationEmail = (to, verificationCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Verification Code',
    text: `Your verification code is: ${verificationCode}`, // استخدام backticks هنا
  };

  return transporter.sendMail(mailOptions);
};