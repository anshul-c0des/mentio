import Mention from "../models/Mention.js";
import type { Request, Response } from "express";

export const getRecentMentions = async (req: Request, res: Response) => {
  const mentions = await Mention.find().sort({ timestamp: -1 }).limit(50);
  res.json(mentions);
};
