const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pradhansumit957@gmail.com',
    pass: 'zahx qzjw fghu hpgm'
  }
});

const sendPasswordResetEmail = async (adminEmail, resetCode, userEmail) => {
  const mailOptions = {
    from: 'pradhansumit957@gmail.com',
    to: adminEmail,
    subject: 'Password Reset Code - Gaadi Nest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>A password reset has been requested for user: ${userEmail}</p>
        <p>Reset Code: <strong>${resetCode}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendPasswordResetEmail
};