import axios from "axios";
import Mention from "../models/Mention.js";
import { analyzeSentiment, classifyTopic } from "./aiService.js";

export const fetchNewsMentions = async (query = "YourBrand", limit = 2) => {
  try {
    const res = await axios.get(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${limit}&token=${process.env.GNEWSAPI_KEY}`
    );

    const articles = res.data.articles.slice(0, limit);

    for (const article of articles) {
      try {
        // Skip duplicates based on URL
        const exists = await Mention.findOne({ url: article.url });
        if (exists) continue;

        const text = (article.title + (article.description ? ` - ${article.description}` : ""))
          .replace(/\s+/g, " ")
          .trim();

        // Run AI analysis
        const sentiment = await analyzeSentiment(text);
        const topic = await classifyTopic(text);

        const mention = new Mention({
          text,
          source: "GNews",
          sentiment,
          topic,
          url: article.url,
          timestamp: new Date(article.publishedAt || Date.now()),
        });

        await mention.save();
      } catch (innerErr) {
        console.error("Error processing news article:", innerErr);
      }
    }

    console.log(`Fetched ${articles.length} news mentions for "${query}"`);
  } catch (err) {
    console.error("Failed to fetch news mentions:", err);
  }
};
