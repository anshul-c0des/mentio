// server/src/routes/publicRoutes.ts
import express from "express";
import { getRecentMentions } from "../controllers/publicController.js";

const router = express.Router();
router.get("/recent", getRecentMentions);

export default router;
