import Mention from "../models/Mention.js";
import { analyzeSentiment, classifyTopic } from "../services/aiService.js";
import { io } from "../server.js";
import type { Request, Response } from "express";

export const addMention = async (req: Request, res: Response) => {
  const { text, source } = req.body;

  const sentiment = await analyzeSentiment(text);
  const topic = await classifyTopic(text);

  const mention = new Mention({ text, source, sentiment, topic });
  await mention.save();

  io.emit("new_mention", mention); // emit to frontend
  res.status(201).json(mention);
};

export const getMentions = async (req: Request, res: Response) => {
  const mentions = await Mention.find().sort({ timestamp: -1 }).limit(50);
  res.json(mentions);
};
