import cron from "node-cron";
import Link from "../models/link.js";

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    console.log(`Current time (UTC): ${now.toISOString()}`);

    await Link.deleteMany({ endDate: { $lt: now } });
    console.log("Expired links deleted successfully");
  } catch (error) {
    console.error("Error deleting expired links:", error);
  }
});
