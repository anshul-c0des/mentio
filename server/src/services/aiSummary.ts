// /server/src/services/aiSummary.ts

import { GoogleGenAI } from "@google/genai";

// Initialization remains the same...
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const ai = new GoogleGenAI({ apiKey: apiKey });

// Define constants for strict input control.
const MAX_MENTIONS_TO_PROCESS = 10; // Restrict the number of mentions
const MAX_CHARS_PER_MENTION = 100; // Truncate individual mention length

export const summarizeMentions = async (mentions: string[]): Promise<string> => {

    // 👈 OPTIMAL FIX 1: Truncate and limit the number of input mentions.
    const validMentions = mentions
        .filter(m => m && m.trim().length > 0)
        .slice(0, MAX_MENTIONS_TO_PROCESS)
        .map(m => m.substring(0, MAX_CHARS_PER_MENTION));

    if (validMentions.length === 0) {
        return "No recent mentions found to generate a summary.";
    }

    const model = "gemini-2.5-flash"; 
    const text = validMentions.join("\n-"); 
    

    // 👈 OPTIMAL FIX 2: Refine the prompt for conciseness and clear instructions.
    const prompt = `Write a single, concise paragraph summarizing the main sentiment and topics discussed in these mentions.

MENTIONS:
---
${text}
---
SUMMARY:`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                // Ensure maxOutputTokens is reasonable for a "single, concise paragraph"
                maxOutputTokens: 1024, // Reduced from 500 to lower the risk of hitting the total limit
                temperature: 0.2, // Lower temperature for focused, less creative output
            },
        });

        const summary = response.text?.trim();
        console.log("Genderated: ",summary);
        

        if (summary) {
           return summary;
        }
        
        // Error handling remains the same...
        console.error("--- GEMINI EMPTY RESPONSE DEBUG START ---");
        console.error("Mentions Count:", validMentions.length);
        console.error("Full API Response:", JSON.stringify(response, null, 2)); 
        console.error("--- GEMINI EMPTY RESPONSE DEBUG END ---");
        
        throw new Error("Gemini API returned an empty response text.");
    } catch (err) {
        console.error("summarizeMentions error:", err);
        throw new Error("Failed to summarize mentions due to an API error.");
    }
};