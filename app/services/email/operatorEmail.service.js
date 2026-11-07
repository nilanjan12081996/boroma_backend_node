const { sendMail } = require("../../utils/mailer");
const {
  getOperatorWelcomeEmailTemplate,
  getOperatorPasswordEmailTemplate,
} = require("../../utils/emailTemplates/operatorEmails.template");

/**
 * Send Welcome Email to Company Operator
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.full_name
 */
const sendWelcomeEmail = async ({ email, full_name }) => {
  return await sendMail({
    to: email,
    subject: "Welcome to Boroma Fleet Management",
    html: getOperatorWelcomeEmailTemplate({ full_name }),
  });
};

/**
 * Send Random Password Credentials Email to Company Operator
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.full_name
 * @param {string} params.password
 */
const sendPasswordEmail = async ({ email, full_name, password }) => {
  return await sendMail({
    to: email,
    subject: "Your Boroma Fleet Login Credentials",
    html: getOperatorPasswordEmailTemplate({ full_name, email, password }),
  });
};

/**
 * Send Both Onboarding Emails (Welcome + Password) to Company Operator
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.full_name
 * @param {string} params.password
 */
const sendOperatorOnboardingEmails = async ({ email, full_name, password }) => {
  try {
    // 1. Send Welcome Email
    await sendWelcomeEmail({ email, full_name });

    // 2. Send Random Password Email
    await sendPasswordEmail({ email, full_name, password });

    console.log(`[OperatorEmailService] Successfully sent onboarding emails to ${email}`);
  } catch (error) {
    console.error(`[OperatorEmailService] Failed to send onboarding emails to ${email}:`, error.message);
    // Suppress error so registration itself does not fail if SMTP service is temporarily unavailable
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordEmail,
  sendOperatorOnboardingEmails,
};

