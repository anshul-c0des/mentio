// server/src/controllers/topicTimelineController.ts
import Mention from "../models/Mention.js";
import type { Request, Response } from "express";

export const getTopicTimeline = async (req: Request, res: Response) => {
  const { hours = 24 } = req.query;
  const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);

  const mentions = await Mention.find({ timestamp: { $gte: since } });
  const timeline: { [topic: string]: { [hour: string]: number } } = {};

  mentions.forEach((m) => {
    const hour = new Date(m.timestamp).getHours();
    timeline[m.topic] = timeline[m.topic] || {};
    timeline[m.topic][hour] = (timeline[m.topic][hour] || 0) + 1;
  });

  res.json(timeline);
};
