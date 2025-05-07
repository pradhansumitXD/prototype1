const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pradhansumit957@gmail.com',
    pass: 'zahx qzjw fghu hpgm'
  }
});

const sendVerificationEmail = async (adminEmail, verificationCode, userEmail, userData) => {
  const mailOptions = {
    from: 'pradhansumit957@gmail.com',
    to: adminEmail, 
    subject: 'New User Verification Code - Gaadi Nest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
          <h1 style="color: #333;">New User Verification</h1>
        </div>
        
        <div style="padding: 20px; background-color: white;">
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">User Details:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${userData.username}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${userData.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${userData.phone}</p>
          </div>

          <p style="font-size: 16px;">Verification code:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f5f5f5; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
              ${verificationCode}
            </div>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This verification code will expire in 10 minutes.
          </p>
        </div>
        
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Gaadi Nest. All rights reserved.</p>
        </div>
      </div>
    `
  };

  console.log('Sending verification email to admin:', adminEmail);
  return transporter.sendMail(mailOptions);
};

const sendConfirmationEmail = async (adminEmail, userData) => {
  const mailOptions = {
    from: 'pradhansumit957@gmail.com',
    to: adminEmail,
    subject: 'User Registration Confirmed - Gaadi Nest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
          <h1 style="color: #333;">Registration Confirmed</h1>
        </div>
        
        <div style="padding: 20px; background-color: white;">
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Verified User Details:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${userData.username}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${userData.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${userData.phone}</p>
            <p style="margin: 5px 0;"><strong>Verification Time:</strong> ${userData.verificationTime}</p>
          </div>
          
          <p style="font-size: 16px; color: #4CAF50;">
            ✓ User account has been successfully created and verified
          </p>
        </div>
        
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Gaadi Nest. All rights reserved.</p>
          <p>This is an automated confirmation email.</p>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (adminEmail, resetCode, userEmail) => {
  const mailOptions = {
    from: 'pradhansumit957@gmail.com',
    to: adminEmail,
    subject: 'Password Reset Code - Gaadi Nest',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
          <h1 style="color: #333;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 20px; background-color: white;">
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Reset Details:</h3>
            <p style="margin: 5px 0;"><strong>User Email:</strong> ${userEmail}</p>
          </div>

          <p style="font-size: 16px;">Reset code:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f5f5f5; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
              ${resetCode}
            </div>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This reset code will expire in 10 minutes.
          </p>
        </div>
        
        <div style="background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Gaadi Nest. All rights reserved.</p>
        </div>
      </div>
    `
  };

  console.log('Sending reset code email to admin:', adminEmail);
  return transporter.sendMail(mailOptions);
};

module.exports = { 
  sendVerificationEmail, 
  sendConfirmationEmail,
  sendPasswordResetEmail 
};