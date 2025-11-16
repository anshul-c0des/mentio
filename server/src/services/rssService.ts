import Parser from "rss-parser";
import Mention from "../models/Mention.js";
import { analyzeSentiment, classifyTopic } from "./aiService.js";

const parser = new Parser();

// filtering criteria
const MINIMUM_TEXT_LENGTH = 50; // Minimum length for content (e.g., avoid one-liners)
const EXCLUDED_KEYWORDS = [
  "tl;dr",
  "clickbait",
  "help",
  "question",
  "vote",
  "survey",
]; // Filter out unnecessary content
const RELEVANT_TOPICS = [
  "marketing",
  "customer feedback",
  "product",
  "support",
]; // Relevant topics for your use case

export const fetchRedditRSSMentions = async (query: string, limit = 2) => {
  try {
    const feedUrl = `https://www.reddit.com/search.rss?q=${encodeURIComponent(
      query
    )}&sort=new`;
    const feed = await parser.parseURL(feedUrl);

    const items = feed.items.slice(0, limit); // limit results

    for (const item of items) {
      try {
        // Skip duplicates based on link
        const exists = await Mention.findOne({ url: item.link });
        if (exists) continue;

        // Clean text (title + snippet)
        const text = (
          item.title + (item.contentSnippet ? ` - ${item.contentSnippet}` : "")
        )
          .replace(/\s+/g, " ")
          .trim();

        // Skip empty or too short posts
        if (text.length < MINIMUM_TEXT_LENGTH) continue;

        // Skip posts with irrelevant keywords
        if (
          EXCLUDED_KEYWORDS.some((keyword) =>
            text.toLowerCase().includes(keyword)
          )
        )
          continue;

        // Run AI analysis for sentiment and topic classification
        const sentiment = await analyzeSentiment(text);
        const topic = await classifyTopic(text);

        // Skip posts with irrelevant topics
        if (!RELEVANT_TOPICS.includes(topic)) continue;

        const mention = new Mention({
          text,
          source: "Reddit",
          sentiment,
          topic,
          url: item.link,
          timestamp: new Date(item.pubDate || Date.now()),
        });

        await mention.save();
      } catch (innerErr) {
        console.error("Error processing Reddit item:", innerErr);
      }
    }

    console.log(`Fetched ${items.length} Reddit mentions for "${query}"`);
  } catch (err) {
    console.error("Failed to fetch Reddit RSS mentions:", err);
  }
};
