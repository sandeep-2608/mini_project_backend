import schedule from "node-schedule";
import { finalizeSession } from "../controllers/onBoardingController.js";
import sessionModel from "../models/sessionModel.js";

// Timeout in minutes
const INACTIVITY_TIMEOUT = 10;

export const markAbandonedSessions = async () => {
  try {
    const cutoff = new Date(Date.now() - INACTIVITY_TIMEOUT * 60 * 1000);
    // Find sessions still active but not updated recently
    const abandonedSessions = await sessionModel.find({
      status: "active",
      updatedAt: { $lt: cutoff },
    });

    for (const session of abandonedSessions) {
      session.status = "abandoned";
      await finalizeSession(session); // Update analytics/dropOffs
      await session.save();
    }

    console.log(`Marked ${abandonedSessions.length} sessions as abandoned.`);
  } catch (error) {
    console.error("Error marking abandoned sessions:", error);
  }
};

// Schedule the job to run every 15 minutes using cron syntax
schedule.scheduleJob("*/15 * * * *", () => {
  console.log("Running abandoned sessions cleanup job...");
  markAbandonedSessions().catch(console.error);
});

console.log("Background job for marking abandoned sessions initialized");
