import express from "express";
// Assuming your queryService.js with manualRefresh is located here
import { manualRefresh } from "../services/mentionPoller.js";

const router = express.Router();

// Define the POST route for manual refresh
router.post("/", async (req, res) => {
  try {
    console.log("Manual refresh request received.");
    // Call the core function to fetch new mentions
    await manualRefresh();

    // Respond immediately. The new data is pushed via Socket.IO
    res.status(200).json({
      message:
        "Feed refresh triggered successfully. Check socket connection for updates.",
    });
  } catch (error) {
    console.error("Error during manual feed refresh:", error);
    res.status(500).json({
      message: "Failed to trigger feed refresh.",
      error,
    });
  }
});

export default router;
