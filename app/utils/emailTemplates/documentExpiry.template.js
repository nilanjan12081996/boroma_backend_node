/**
 * Generates a professional HTML email template for vehicle document expiry alerts.
 *
 * @param {Object} params
 * @param {string} params.documentType    - e.g. "Fitness", "Tax", "Permit", "Pollution"
 * @param {string} params.vehicleNo       - Vehicle registration number
 * @param {string} params.expDate         - Expiry date (formatted string)
 * @param {number} params.daysLeft        - Days remaining until expiry (0 = expires today)
 * @param {string} params.alertType       - "7_DAYS" | "3_DAYS" | "TODAY"
 * @returns {string} HTML string
 */
const getDocumentExpiryEmailTemplate = ({ documentType, vehicleNo, expDate, daysLeft, alertType }) => {
  const alertConfig = {
    "7_DAYS": {
      badgeColor: "#F59E0B",
      badgeText: "⚠️ Expiring in 7 Days",
      bannerBg: "#FEF3C7",
      bannerBorder: "#F59E0B",
      urgencyText: "Please initiate the renewal process at the earliest.",
      urgencyColor: "#92400E",
    },
    "3_DAYS": {
      badgeColor: "#EF4444",
      badgeText: "🔴 Expiring in 3 Days — Urgent",
      bannerBg: "#FEE2E2",
      bannerBorder: "#EF4444",
      urgencyText: "Immediate action required. Renewal must be completed before the expiry date.",
      urgencyColor: "#991B1B",
    },
    TODAY: {
      badgeColor: "#7F1D1D",
      badgeText: "🚨 Expires TODAY",
      bannerBg: "#FCA5A5",
      bannerBorder: "#7F1D1D",
      urgencyText: "This document expires today! Renew immediately to avoid compliance issues.",
      urgencyColor: "#7F1D1D",
    },
  };

  const cfg = alertConfig[alertType] || alertConfig["7_DAYS"];
  const daysText = daysLeft === 0 ? "Today" : `${daysLeft} Day${daysLeft > 1 ? "s" : ""}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vehicle Document Expiry Alert – Boroma Fleet</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:'Segoe UI',Roboto,Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F3F4F6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="background:linear-gradient(135deg,#1E3A5F 0%,#2563EB 100%);padding:36px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <span style="font-size:36px;">🚌</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                      Boroma Fleet Management
                    </h1>
                    <p style="margin:6px 0 0;color:#BFDBFE;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
                      Document Expiry Alert System
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== ALERT BADGE ===== -->
          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:24px 0 0;">
                    <span style="display:inline-block;background-color:${cfg.badgeColor};color:#FFFFFF;
                                 font-size:13px;font-weight:700;padding:8px 20px;border-radius:50px;
                                 letter-spacing:0.5px;">
                      ${cfg.badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== GREETING ===== -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">
                Dear <strong>Administrator</strong>,
              </p>
              <p style="margin:10px 0 0;color:#374151;font-size:15px;line-height:1.7;">
                This is an automated alert from the <strong>Boroma Fleet Management System</strong>.
                The following vehicle document is approaching its expiry date and requires your immediate attention.
              </p>
            </td>
          </tr>

          <!-- ===== DOCUMENT DETAILS CARD ===== -->
          <tr>
            <td style="padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;">
                <!-- Card Header -->
                <tr>
                  <td colspan="2" style="background:#1E3A5F;padding:14px 20px;">
                    <p style="margin:0;color:#FFFFFF;font-size:13px;font-weight:700;
                               letter-spacing:1px;text-transform:uppercase;">
                      📋 Document Details
                    </p>
                  </td>
                </tr>
                <!-- Row 1 -->
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #E2E8F0;
                             color:#6B7280;font-size:13px;font-weight:600;width:45%;
                             text-transform:uppercase;letter-spacing:0.5px;">
                    Vehicle Number
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid #E2E8F0;
                             color:#1E293B;font-size:14px;font-weight:700;">
                    ${vehicleNo}
                  </td>
                </tr>
                <!-- Row 2 -->
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #E2E8F0;
                             color:#6B7280;font-size:13px;font-weight:600;
                             text-transform:uppercase;letter-spacing:0.5px;">
                    Document Type
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid #E2E8F0;
                             color:#1E293B;font-size:14px;font-weight:700;">
                    ${documentType}
                  </td>
                </tr>
                <!-- Row 3 -->
                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid #E2E8F0;
                             color:#6B7280;font-size:13px;font-weight:600;
                             text-transform:uppercase;letter-spacing:0.5px;">
                    Expiry Date
                  </td>
                  <td style="padding:14px 20px;border-bottom:1px solid #E2E8F0;
                             color:#DC2626;font-size:14px;font-weight:700;">
                    📅 ${expDate}
                  </td>
                </tr>
                <!-- Row 4 -->
                <tr>
                  <td style="padding:14px 20px;color:#6B7280;font-size:13px;
                             font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                    Time Remaining
                  </td>
                  <td style="padding:14px 20px;color:#DC2626;font-size:14px;font-weight:700;">
                    ⏳ ${daysText}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== URGENCY BANNER ===== -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:${cfg.bannerBg};border-left:4px solid ${cfg.bannerBorder};
                            border-radius:6px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:${cfg.urgencyColor};font-size:14px;
                               font-weight:600;line-height:1.6;">
                      ${cfg.urgencyText}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== ACTION STEPS ===== -->
          <tr>
            <td style="padding:0 40px 24px;">
              <p style="margin:0 0 12px;color:#1E293B;font-size:14px;font-weight:700;">
                Recommended Actions:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:10px;vertical-align:top;">
                          <span style="display:inline-block;width:22px;height:22px;border-radius:50%;
                                       background:#2563EB;color:#fff;text-align:center;line-height:22px;
                                       font-size:11px;font-weight:700;">1</span>
                        </td>
                        <td style="color:#374151;font-size:13px;line-height:1.7;">
                          Log in to the fleet management portal and locate the vehicle.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:10px;vertical-align:top;">
                          <span style="display:inline-block;width:22px;height:22px;border-radius:50%;
                                       background:#2563EB;color:#fff;text-align:center;line-height:22px;
                                       font-size:11px;font-weight:700;">2</span>
                        </td>
                        <td style="color:#374151;font-size:13px;line-height:1.7;">
                          Navigate to the <strong>${documentType}</strong> section and initiate renewal.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:10px;vertical-align:top;">
                          <span style="display:inline-block;width:22px;height:22px;border-radius:50%;
                                       background:#2563EB;color:#fff;text-align:center;line-height:22px;
                                       font-size:11px;font-weight:700;">3</span>
                        </td>
                        <td style="color:#374151;font-size:13px;line-height:1.7;">
                          Upload the renewed document and update the expiry date in the system.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== DIVIDER ===== -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #E5E7EB;margin:0;" />
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.8;">
                This is an automated notification from the <strong>Boroma Fleet Management System</strong>.<br/>
                Please do not reply to this email. For support, contact your system administrator.
              </p>
              <p style="margin:12px 0 0;color:#9CA3AF;font-size:11px;">
                © ${new Date().getFullYear()} Boroma Fleet Management. All rights reserved.
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

module.exports = { getDocumentExpiryEmailTemplate };

