import Sentiment from "sentiment"

const sentiment = new Sentiment();

export const analyzeSentiment = (text: string) => {
  if (!text || text.trim() === "") return "neutral";

  // Truncate text to an approximation of max tokens (505 characters)
  const MAX_CHARS = 505; // approximation
  const truncatedText = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;

  const result = sentiment.analyze(truncatedText);

  // Sentiment analysis result
  if (result.score > 0) return "positive";
  if (result.score < 0) return "negative";
  return "neutral";
};


import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client
// Assumes GEMINI_API_KEY is set in your environment variables

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define the available labels
const CANDIDATE_LABELS = ["product features",
    "usability/UX",
    "pricing/billing",
    "performance",
    "customer support",
    "marketing/campaigns",
    "competitors",
    "brand perception"];

export const classifyTopic = async (text: string): Promise<string> => {
  const model = "gemini-2.5-flash"; // A fast and capable model for this task

  // Create a structured prompt
  const prompt = `Classify the following text into one of these categories: ${CANDIDATE_LABELS.join(", ")}.
  Respond with only the single, most appropriate category name, exactly as provided in the list, with no other text, explanation, or punctuation.
  
  TEXT: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.1,
      },
    });

    // Ensure 'response.text' is defined before using it
    const result = response.text?.trim();

    if (result) {
      // Validate the result against the allowed labels
      if (CANDIDATE_LABELS.includes(result.toLowerCase())) {
        return result.toLowerCase();
      } else {
        // If the model returns something unexpected, classify it as "unknown"
        console.warn(`Gemini returned an unlisted label: "${result}" for text: "${text}"`);
        return "unknown";
      }
    } else {
      // If result is undefined or empty, return "unknown"
      console.warn("No response text received from Gemini API.");
      return "unknown";
    }
  } catch (err) {
    console.error("classifyTopic error:", err);
    return "unknown";
  }
};

