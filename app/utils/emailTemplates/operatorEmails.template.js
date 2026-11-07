/**
 * Generates HTML email template for Operator Welcome Email
 * @param {Object} params
 * @param {string} params.full_name
 * @returns {string} HTML string
 */
const getOperatorWelcomeEmailTemplate = ({ full_name }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Boroma Fleet Management</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f8; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a8a; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">BOROMA FLEET</h1>
              <p style="margin: 8px 0 0 0; color: #93c5fd; font-size: 14px;">Fleet Management & Operations Portal</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 35px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">Welcome aboard, ${full_name}!</h2>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Your Company Operator account has been successfully created in the Boroma Fleet Management system.
              </p>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                As an operator, you have access to streamline fleet activities, supervise operations, and track vehicles in real time.
              </p>
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 500;">
                  Your login credentials have been sent separately in another email. Please check your inbox.
                </p>
              </div>
              <p style="margin: 25px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                If you have any questions or require assistance, please contact the support team.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Boroma Fleet Management. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Generates HTML email template for Operator Password Email
 * @param {Object} params
 * @param {string} params.full_name
 * @param {string} params.email
 * @param {string} params.password
 * @returns {string} HTML string
 */
const getOperatorPasswordEmailTemplate = ({ full_name, email, password }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Boroma Fleet Login Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f8; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0f172a; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">BOROMA FLEET</h1>
              <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 14px;">Account Security & Credentials</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 35px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 20px;">Hello ${full_name},</h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Your operator account has been created. Use the following credentials to sign in to your dashboard:
              </p>
              
              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
                    <span style="display: block; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Registered Email</span>
                    <span style="font-size: 15px; color: #0f172a; font-weight: 600;">${email}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px;">
                    <span style="display: block; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Temporary Password</span>
                    <code style="display: inline-block; background-color: #f1f5f9; color: #dc2626; font-size: 18px; font-weight: 700; padding: 6px 14px; border-radius: 4px; letter-spacing: 1.5px; border: 1px dashed #cbd5e1;">${password}</code>
                  </td>
                </tr>
              </table>

              <div style="background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 4px; padding: 14px 16px; margin: 20px 0;">
                <p style="margin: 0; color: #9a3412; font-size: 13px; line-height: 1.5;">
                  <strong>Important Security Note:</strong> For account safety, please change this temporary password immediately after your first successful login.
                </p>
              </div>

              <p style="margin: 25px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                If you did not request this account, please notify our administrator right away.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Boroma Fleet Management. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = {
  getOperatorWelcomeEmailTemplate,
  getOperatorPasswordEmailTemplate,
};

