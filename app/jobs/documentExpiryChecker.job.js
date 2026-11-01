const { Op } = require("sequelize");
const VehicleFitness = require("../models/vehicle_fitness.model");
const VehicleTax = require("../models/vehicle_tax.model");
const VehiclePermit = require("../models/vehicle_permit.model");
const VehiclePollution = require("../models/vehicle_pollution.model");
const VehicleInfo = require("../models/vehicle_info.model");
const { sendMail } = require("../utils/mailer");
const { getDocumentExpiryEmailTemplate } = require("../utils/emailTemplates/documentExpiry.template");

// Admin email address to receive all expiry alerts
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin.test@yopmail.com";

/**
 * Document type configuration map
 * Maps each Sequelize model to its human-readable label
 */
const DOCUMENT_CONFIG = [
  { model: VehicleFitness, label: "Vehicle Fitness Certificate" },
  { model: VehicleTax, label: "Vehicle Tax" },
  { model: VehiclePermit, label: "Vehicle Permit" },
  { model: VehiclePollution, label: "Pollution Under Control (PUC) Certificate" },
];

/**
 * Determines the alert type based on remaining days
 * @param {number} daysLeft
 * @returns {"7_DAYS" | "3_DAYS" | "TODAY" | null}
 */
const getAlertType = (daysLeft) => {
  if (daysLeft === 7) return "7_DAYS";
  if (daysLeft === 3) return "3_DAYS";
  if (daysLeft === 0) return "TODAY";
  return null;
};

/**
 * Formats a Date object to LOCAL "YYYY-MM-DD" string (avoids UTC shift)
 * @param {Date} date
 * @returns {string} e.g. "2026-11-02"
 */
const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formats a Date/string to a human-readable string: e.g. "02 Nov 2026"
 * @param {string|Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

/**
 * Core function: Queries all document tables for records expiring in 7 days, 3 days, or today.
 * Sends one professional email per matching record to the admin.
 */
const checkDocumentExpiriesAndNotify = async () => {
  console.log("[CronJob] ─────────────────────────────────────────────────────");

  // Use local date (not UTC) so IST date matches DB DATEONLY values
  const today = new Date();
  const todayStr = toLocalDateString(today);
  console.log(`[CronJob] Starting document expiry check... Local date: ${todayStr}`);

  // Target dates: today, today+3, today+7 — all in local timezone
  const targetDays = [0, 3, 7];
  const targetDates = targetDays.map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return toLocalDateString(d);  // ✅ local date, not UTC
  });

  console.log(`[CronJob] Checking expiry dates: ${targetDates.join(", ")}`);

  let totalEmailsSent = 0;
  let totalErrors = 0;

  for (const { model, label } of DOCUMENT_CONFIG) {
    try {
      // Fetch all records whose exp_date matches any of the 3 target dates
      const records = await model.findAll({
        where: {
          exp_date: { [Op.in]: targetDates },
          status: 1, // only active documents
        },
        include: [
          {
            model: VehicleInfo,
            as: "vehicle",
            attributes: ["id", "vehicle_no"],
          },
        ],
      });

      if (records.length === 0) {
        console.log(`[CronJob] [${label}] No expiring records found.`);
        continue;
      }

      console.log(`[CronJob] [${label}] Found ${records.length} expiring record(s).`);

      for (const record of records) {
        try {
          const expDateStr = record.exp_date; // YYYY-MM-DD string from DB

          // Compare local date strings directly (avoids UTC shift bug)
          const daysLeft = targetDates.indexOf(expDateStr);
          // targetDates[0] = today (0 days), [1] = today+3 (3 days), [2] = today+7 (7 days)
          const daysMap = { 0: 0, 1: 3, 2: 7 };
          const actualDaysLeft = daysMap[daysLeft];

          const alertType = getAlertType(actualDaysLeft);
          if (!alertType) continue; // Safety guard, shouldn't happen

          const vehicleNo = record.vehicle?.vehicle_no || `Vehicle ID: ${record.vehical_id}`;
          const formattedExpDate = formatDate(expDateStr);

          // Build email subject
          const subjectMap = {
            "7_DAYS": `⚠️ [7-Day Alert] ${label} Expiring Soon – ${vehicleNo}`,
            "3_DAYS": `🔴 [Urgent 3-Day Alert] ${label} Expiring – ${vehicleNo}`,
            TODAY: `🚨 [CRITICAL] ${label} Expires TODAY – ${vehicleNo}`,
          };

          const htmlBody = getDocumentExpiryEmailTemplate({
            documentType: label,
            vehicleNo,
            expDate: formattedExpDate,
            daysLeft: actualDaysLeft,
            alertType,
          });

          await sendMail({
            to: ADMIN_EMAIL,
            subject: subjectMap[alertType],
            html: htmlBody,
          });

          totalEmailsSent++;
          console.log(
            `[CronJob]   ✓ Email sent | Type: ${alertType} | Vehicle: ${vehicleNo} | Doc: ${label}`
          );
        } catch (recordError) {
          totalErrors++;
          console.error(
            `[CronJob]   ✗ Failed to process record ID ${record.id} for [${label}]:`,
            recordError.message
          );
        }
      }
    } catch (modelError) {
      totalErrors++;
      console.error(`[CronJob] ✗ Error querying [${label}]:`, modelError.message);
    }
  }

  console.log(`[CronJob] ─────────────────────────────────────────────────────`);
  console.log(`[CronJob] Check complete. Emails sent: ${totalEmailsSent} | Errors: ${totalErrors}`);
  console.log("[CronJob] ─────────────────────────────────────────────────────");
};

module.exports = { checkDocumentExpiriesAndNotify };

