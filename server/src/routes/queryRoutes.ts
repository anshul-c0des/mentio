import express from "express";
import TrackedQuery from "../models/TrackedQuery.js";
import { addQuery, resetQueries } from "../services/mentionPoller.js";
import Mention from "../models/Mention.js";

const router = express.Router();

// Get the currently tracked brand (only one)
router.get("/", async (req, res) => {
  const query = await TrackedQuery.findOne(); // only one brand
  res.json(query || null);
});

// Set a new brand to track (replaces any existing)
router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  // Remove any existing brand
  await TrackedQuery.deleteMany({});
  await Mention.deleteMany({});

  // Save the new brand
  const query = new TrackedQuery({ name });
  await query.save();

  // Track it dynamically
  addQuery(name);

  res.status(201).json(query);
});

// Clear the tracked brand
router.delete("/", async (req, res) => {
  await TrackedQuery.deleteMany({});
  await Mention.deleteMany({});
  resetQueries();
  res.sendStatus(204);
});

export default router;
