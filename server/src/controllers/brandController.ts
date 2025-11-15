// server/src/controllers/brandController.ts
import { calculateBrandHealth } from "../services/brandHealth.js";
import type { Request, Response } from "express";

export const getBrandHealth = async (req:Request, res:Response) => {
  try {
    const score = await calculateBrandHealth();
    res.json({ score });
  } catch (error) {
    console.error("Error fetching brand health score:", error);
    res.status(500).json({ message: "Failed to calculate brand health" });
  }
};
