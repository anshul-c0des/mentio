// server/src/routes/publicRoutes.ts
import express from "express";
import { getBrandHealth } from "../controllers/brandController.js";

const router = express.Router();
router.get("/health", getBrandHealth);

export default router;