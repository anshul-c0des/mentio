// server/src/services/youtubeFetcher.ts

import Mention from '../models/Mention.js'; // Assuming you imported your model
import { analyzeSentiment, classifyTopic } from './aiService.js';

// Get API key from environment variable
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";
const MAX_VIDEOS_PER_SEARCH = 5; // Balance between coverage and quota cost (100 units/search)

// Define your filtering criteria (reusing from previous code)
const MINIMUM_TEXT_LENGTH = 50; 
const EXCLUDED_KEYWORDS = ["tl;dr", "clickbait", "help", "question", "vote", "survey"];
const RELEVANT_TOPICS = ["marketing", "customer feedback", "product", "support"];

/**
 * Executes a dynamic search against the YouTube API for videos and processes results.
 * @param query The brand name entered by the user.
 */
export const fetchYoutubeMentions = async (query: string) => {
    if (!YOUTUBE_API_KEY) {
        console.error("YOUTUBE_API_KEY is not set.");
        return;
    }

    try {
        // 1. SEARCH FOR VIDEOS (Title/Description Mentions)
        const videoResponse = await fetch(
            `${YOUTUBE_BASE_URL}/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(query)}&part=snippet&type=video&maxResults=${MAX_VIDEOS_PER_SEARCH}&order=date`
        );
        const videoData = await videoResponse.json();
        
        if (videoData.error) {
            console.error("YouTube API Error (search.list):", videoData.error);
            return;
        }

        const videoIds: string[] = [];

        for (const item of videoData.items) {
            const videoId = item.id.videoId;
            videoIds.push(videoId);

            // Create a text snippet from the video title and description
            const text = `${item.snippet.title} - ${item.snippet.description}`
                .replace(/\s+/g, " ").trim();

            if (text.length < MINIMUM_TEXT_LENGTH || EXCLUDED_KEYWORDS.some(k => text.toLowerCase().includes(k))) {
                continue;
            }

            // Perform AI analysis
            const sentiment = await analyzeSentiment(text);
            const topic = await classifyTopic(text);

            if (!RELEVANT_TOPICS.includes(topic)) continue;

            // Save the mention (for title/description hit)
            await new Mention({
                text,
                source: "YouTube Video",
                sentiment,
                topic,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                timestamp: new Date(item.snippet.publishedAt),
            }).save();
        }

        console.log(`Fetched and processed ${videoData.items.length} YouTube videos for "${query}"`);
        
        // 2. SEARCH COMMENTS FOR THE BRAND MENTION
        // This is costly in code complexity and quota, but necessary for comment coverage.
        // We'll iterate through the fetched videos to search their comments.
        for (const videoId of videoIds) {
            await fetchCommentsByVideoId(videoId, query);
        }

    } catch (err) {
        console.error("Failed to fetch YouTube mentions:", err);
    }
};

/**
 * Fetches and processes comments for a single video, searching locally for the brand query.
 * @param videoId The ID of the video whose comments to fetch.
 * @param query The brand name to search for within the comment text.
 */
const fetchCommentsByVideoId = async (videoId: string, query: string) => {
    try {
        const commentResponse = await fetch(
            `${YOUTUBE_BASE_URL}/commentThreads?key=${YOUTUBE_API_KEY}&videoId=${videoId}&part=snippet&maxResults=50&order=time`
        );
        const commentData = await commentResponse.json();

        if (commentData.error) {
             // Often, comments are disabled, which results in an error. We can silently skip.
             return; 
        }

        for (const thread of commentData.items) {
            const topComment = thread.snippet.topLevelComment.snippet;
            const text = topComment.textOriginal.trim();

            // LOCAL BRAND SEARCH: Check if the comment text contains the brand query
            if (text.toLowerCase().includes(query.toLowerCase())) {
                
                // Run AI analysis
                const sentiment = await analyzeSentiment(text);
                const topic = await classifyTopic(text);

                if (!RELEVANT_TOPICS.includes(topic)) continue;

                // Save the comment mention
                await new Mention({
                    text,
                    source: "YouTube Comment",
                    sentiment,
                    topic,
                    url: `https://www.youtube.com/watch?v=${videoId}&lc=${thread.id}`, // link to the comment
                    timestamp: new Date(topComment.publishedAt),
                }).save();
            }
        }
    } catch (err) {
        console.error(`Error fetching comments for video ${videoId}:`, err);
    }
};