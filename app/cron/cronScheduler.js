
const cron = require("node-cron");

const {
  checkDocumentExpiriesAndNotify
} = require("../jobs/documentExpiryChecker.job");

// Runs at 12:00 AM and 12:00 PM every day (IST)
const registerCronJobs = () => {
  const expression = "0 */12 * * *";

  if (!cron.validate(expression)) {
    throw new Error(`Invalid cron expression: ${expression}`);
  }

  cron.schedule(
    expression,
    async () => {
      try {
        console.log("[CronScheduler] Document expiry job started");

        await checkDocumentExpiriesAndNotify();

        console.log("[CronScheduler] Document expiry job completed");
      } catch (err) {
        console.error(
          "[CronScheduler] Document expiry job error:",
          err.message
        );
      }
    },
    {
      timezone: "Asia/Kolkata"
    }
  );

  console.log(
    "[CronScheduler] Document Expiry Alert job registered successfully."
  );
};

module.exports = { registerCronJobs };
