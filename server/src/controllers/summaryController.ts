import Mention from "../models/Mention.js";
import { summarizeMentions } from "../services/aiSummary.js";
import type { Request, Response } from "express";

export const getSummary = async (req: Request, res: Response) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // 💡 NEW: Log the count and time frame
    console.log(`Fetching mentions since: ${since.toISOString()}`);

    const mentions = await Mention.find({ timestamp: { $gte: since } });
    
    // 💡 NEW: Log how many mentions were found
    console.log(`Found ${mentions.length} mentions.`);

    // If you are finding 0 mentions, the DB query is the problem.
    if (mentions.length === 0) {
        return res.json({ summary: "No recent data available to summarize." });
    }

    const summary = await summarizeMentions(mentions.map(m => m.text));
    res.json({ summary });
};