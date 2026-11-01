const cron = require("node-cron");
const { checkDocumentExpiriesAndNotify } = require("../jobs/documentExpiryChecker.job");

/**
 * Registers all application cron jobs.
 *
 * Schedule: "0 *\/12 * * *"
 *   → Runs at minute 0 of every 12th hour (i.e., 00:00 and 12:00 every day)
 *
 * Timezone: Asia/Kolkata (IST) — change as needed
 */
const registerCronJobs = () => {
  // ─── Document Expiry Alert Job ─────────────────────────────────────────────
  cron.schedule(
    "*0 */12 * * *",
    async () => {
      try {
        await checkDocumentExpiriesAndNotify();
      } catch (err) {
        console.error("[CronScheduler] Unhandled error in documentExpiry job:", err.message);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  console.log("[CronScheduler] ✅ Document Expiry Alert job registered — runs every 12 hours.");
};

module.exports = { registerCronJobs };

