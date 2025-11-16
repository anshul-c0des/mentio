import express from "express";
import {
  getMentionTrends,
  getTopTopics,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/trends", getMentionTrends);
router.get("/topics", getTopTopics);

export default router;
