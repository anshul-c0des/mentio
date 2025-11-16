// server/src/services/brandHealth.ts
import Mention from "../models/Mention.js";

export const calculateBrandHealth = async () => {
  const mentions = await Mention.find().sort({ timestamp: -1 }).limit(100); // last 100 mentions
  if (!mentions.length) return 50; // neutral score

  const score =
    mentions.reduce((acc, m) => {
      if (m.sentiment === "positive") return acc + 1;
      if (m.sentiment === "negative") return acc - 1;
      return acc;
    }, 0) / mentions.length;

  // normalize to 0-100
  return Math.round((score + 1) * 50);
};
