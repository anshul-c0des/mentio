import Mention from "../models/Mention.js";
import { analyzeSentiment, classifyTopic } from "./aiService.js";
import { io } from "../server.js";
import TrackedQuery from "../models/TrackedQuery.js";
import axios from "axios";
import { trackMention, checkForSpike } from "./spikeDetector.js";

let activeQueries: string[] = [];
const POLL_INTERVAL = 5 * 60 * 1000; // 30 minutes
let redditInterval: NodeJS.Timer | null = null;
let gnewsInterval: NodeJS.Timer | null = null;
const limit = 4;

// Initialize queries from DB
export const initializeQueries = async () => {
  const queries = await TrackedQuery.find();
  activeQueries = queries.map(q => q.name);
  console.log("Initial queries loaded:", activeQueries);
};

// Add a query dynamically
export const addQuery = (query: string) => {
  if (!activeQueries.includes(query)) {
    activeQueries = [query];
    fetchAllForQuery(query);
  }
};
export const resetQueries = () => {
    activeQueries = [];
    console.log("Active queries cleared");

      // Stop polling intervals
  if (redditInterval) {
    redditInterval = null;
  }
  if (gnewsInterval) {
    gnewsInterval = null;
  }

  console.log("Polling stopped");
};

// Get active queries
export const getActiveQueries = () => activeQueries;

// Helper to process a mention
const processMention = async (mention: { text: string; source: string; url?: string; timestamp?: Date }) => {
  if (activeQueries.length === 0) return;
  if (mention.url) {
    const exists = await Mention.findOne({ url: mention.url });
    if (exists) return;
  }

  const sentiment = await analyzeSentiment(mention.text);
  const topic = await classifyTopic(mention.text);

  const newMention = new Mention({
    text: mention.text,
    source: mention.source,
    sentiment,
    topic,
    url: mention.url,
    timestamp: mention.timestamp || new Date(),
  });

  await newMention.save();
  io.emit("new_mention", newMention);

  trackMention();

  if (checkForSpike()) {
    const spikeMessage = {
        type: 'volumeSpike',
        timestamp: Date.now(),
        message: `Brand mention volume has spiked! High activity detected.`,
        // You can add data like the current rate/baseline here if needed.
    };
    
    // 5. Send real-time spike alert to the frontend
    io.emit('alert', spikeMessage); 
    console.log("🔥 Real-Time Spike Alert Sent!");
}
};

// Individual fetch functions
// Individual fetch functions
const fetchReddit = async (baseQuery: string) => {
  try {
    const parser = await import("rss-parser").then(mod => new mod.default());
    const advancedQuery = `"${baseQuery}" OR title:"${baseQuery}" (review OR help OR feedback) self:true`;
    
    const encodedQuery = encodeURIComponent(advancedQuery);

    const feedUrl = `https://www.reddit.com/search.rss?q=${encodedQuery}&sort=new`;
    const res = await parser.parseURL(feedUrl);
    const feed = res.items.slice(0, limit);

    for (const item of feed) {
      await processMention({
        text: (item.contentSnippet ?? item.title ?? "") as string,
        source: "Reddit",
        url: item.link,
        timestamp: new Date(item.pubDate || Date.now()),
      });
    }
  } catch (err) {
    console.error("Reddit fetch error for query", baseQuery, err);
  }
};

const fetchGNews = async (baseQuery: string) => {
  try {
    const advancedQuery = `"${baseQuery}" OR ("${baseQuery}" AND (review OR launch OR acquisition OR controversy OR statement))`;
    
    const params = new URLSearchParams({
      q: advancedQuery,
      lang: 'en',
      max: '10',
      token: process.env.GNEWSAPI_KEY!,
      sortby: 'publishedAt', 
    });

    const url = `https://gnews.io/api/v4/search?${params.toString()}`;

    const res = await axios.get(url);

    const articles = res.data.articles.slice(0, limit); 
    
    for (const article of articles) {
      const textContent = article.title + (article.description ? ` - ${article.description}` : "");

      await processMention({
        text: textContent || article.title || "No Title Provided",
        source: "GNews",
        url: article.url,
        timestamp: new Date(article.publishedAt || Date.now()),
      });
    }
  } catch (err) {
    console.error("GNews fetch error for query", baseQuery, err);
  }
};

// Individual fetch function for YouTube
const fetchYouTube = async (query: string) => {
  try {
    // Ensure the API key is set in the environment variables
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error("YouTube API key is not set in environment variables.");
    }

    const language = "en";  // Change to your desired language code (e.g., 'es', 'fr')
    const region = "US";    // Change to your desired region code (e.g., 'IN', 'GB')

    // Send request to YouTube Data API to search for videos
    const res = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        part: "snippet",
        q: query,
        type: "video",  // Ensure it's a video type
        order: "date",  // Get the latest videos
        maxResults: 5,
        key: apiKey,
        hl: language,      // Set the language of the API response
        regionCode: region, // Set the region for the search
      },
    });

    // Process each video result
    const rawVideos = res.data.items;
    const videos = rawVideos.slice(0, limit);
    for (const video of videos) {
      // Check if videoId exists before trying to access it
      if (!video.id || !video.id.videoId) {
        console.warn('Skipping item without videoId:', video);
        continue;  // Skip this item if it doesn't have a videoId
      }

      const { title, description, publishedAt } = video.snippet;
      const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;

      // Process the mention for YouTube
      await processMention({
        text: title + (description ? ` - ${description}` : ""),
        source: "YouTube",
        url: videoUrl,
        timestamp: new Date(publishedAt),
      });
    }
  } catch (err) {
    console.error("YouTube fetch error for query", query, err);
  }
};

// Fetch both sources for a single query
const fetchAllForQuery = async (query: string) => {
  try {
    // Run both fetch functions in parallel
    await Promise.all([
      fetchReddit(query), // Fetch from Reddit
      fetchGNews(query),   // Fetch from GNews
      fetchYouTube(query),  // Fetch from YouTube
    ]);
  } catch (err) {
    console.error(`Error fetching mentions for query: ${query}`, err);
  }
};

// **NEW:** Manual refresh option
export const manualRefresh = async () => {
  console.log("Manual refresh triggered.");
  if (activeQueries.length === 0) {
    console.log("No active queries to refresh.");
    return;
  }
  // Fetch concurrently for all active queries
  await Promise.all(activeQueries.map(query => fetchAllForQuery(query)));
  console.log("Manual refresh complete.");
};

// Start polling intervals if queries exist
const startPollingIntervals = () => {
  if (activeQueries.length === 0) return;

  setInterval(async () => {
    // Fetch concurrently for all active queries
    await Promise.all(activeQueries.map(query => fetchAllForQuery(query)));
    console.log(`Auto-polling complete (next in ${POLL_INTERVAL / 60000} min).`);
  }, POLL_INTERVAL);

  console.log("Polling interval started for all queries.");
};

// Public startPolling
export const startPolling = async () => {
  await initializeQueries();

  // 🛑 REMOVED initial fetch loop on server start/refresh
  // for (const query of activeQueries) {
  //   await fetchAllForQuery(query);
  // }
  console.log("Initial fetch on start/refresh skipped. Use manualRefresh() or wait for auto-poll.");


  // Start intervals only if there are queries
  startPollingIntervals();
};