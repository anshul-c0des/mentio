import Mention from "../models/Mention.js";
import type { Request, Response } from "express";

export const getMentionTrends = async (req: Request, res: Response) => {
  const { hours = 24 } = req.query;
  const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);

  const mentions = await Mention.find({ timestamp: { $gte: since } });

  const hourlyCounts: { [key: string]: number } = {};
  mentions.forEach((m) => {
    const hour = new Date(m.timestamp).getHours();
    hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
  });

  res.json(hourlyCounts);
};

export const getTopTopics = async (req: Request, res: Response) => {
  const { hours = 24 } = req.query;
  const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);

  const mentions = await Mention.find({ timestamp: { $gte: since } });
  const topicsCount: { [key: string]: number } = {};
  mentions.forEach((m) => {
    topicsCount[m.topic] = (topicsCount[m.topic] || 0) + 1;
  });

  res.json(topicsCount);
};
