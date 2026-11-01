const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Create a reusable transporter object using SMTP transport
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send an email using the configured transporter
 * @param {Object} options - Mail options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body of the email
 * @returns {Promise}
 */
const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Boroma Fleet Management" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Email sent successfully to ${to} | MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Mailer] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { sendMail };

