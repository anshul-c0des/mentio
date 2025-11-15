// server/src/routes/mentionRoutes.ts
import express from "express";
import { addMention, getMentions } from "../controllers/mentionController.js";

const router = express.Router();

router.get("/", getMentions);
router.post("/", addMention);

export default router;
