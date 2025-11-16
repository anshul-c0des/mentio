// /server/src/services/aiSummary.ts

import axios from 'axios'; // 💡 NEW: Import axios and AxiosResponse

// 💡 NEW SETUP: Use the Hugging Face API Token and Model ID
const HF_API_KEY = process.env.HF_API_KEY;
if (!HF_API_KEY) {
    throw new Error("HF_API_KEY environment variable is not set.");
}

// Recommended abstractive summarization model
const HF_MODEL_ID = "facebook/bart-large-cnn"; 

// Define constants for strict input control.
const MAX_MENTIONS_TO_PROCESS = 15; 
const MAX_CHARS_PER_MENTION = 100; 

// Define the expected structure of the Hugging Face response
interface HuggingFaceSummaryResult {
    summary_text: string;
}

export const summarizeMentions = async (mentions: string[]): Promise<string> => {

    // 👈 OPTIMAL FIX 1: Truncate and limit the number of input mentions.
    const validMentions = mentions
        .filter(m => m && m.trim().length > 0)
        .slice(0, MAX_MENTIONS_TO_PROCESS)
        .map(m => m.substring(0, MAX_CHARS_PER_MENTION));

    if (validMentions.length === 0) {
        return "No recent mentions found to generate a summary.";
    }

    // Combine all mentions into a single string for the prompt
    const text = validMentions.join(". "); 
    
    try {
        // --- NEW: CALL HUGGING FACE INFERENCE API USING AXIOS ---
        const apiUrl = `https://router.huggingface.co/hf-inference/models/${HF_MODEL_ID}`;
        
        const response = await axios.post(
            apiUrl, 
            // Request Body (data)
            {
                inputs: text,
                parameters: {
                    max_length: 150, 
                    min_length: 40,
                    do_sample: false, // For more deterministic/focused output
                }
            },
            // Request Configuration (headers, etc.)
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${HF_API_KEY}`
                }
            }
        );

        // Axios automatically throws an error for non-2xx status codes,
        // so explicit response.ok check isn't needed here.

        const result = response.data;
        const summary = result[0]?.summary_text?.trim();
        console.log("Generated:", summary);

        if (summary) {
            return summary;
        }

        // Error handling for empty summary text
        console.error("--- HF EMPTY RESPONSE DEBUG START ---");
        console.error("Mentions Count:", validMentions.length);
        console.error("Full API Response Data:", JSON.stringify(result, null, 2));
        console.error("--- HF EMPTY RESPONSE DEBUG END ---");

        throw new Error("Hugging Face API returned an empty summary text.");
    } catch (err) {
        // Axios errors have a structured response object
        if (axios.isAxiosError(err) && err.response) {
            const status = err.response.status;
            const errorBody = JSON.stringify(err.response.data);
            
            console.error(`Hugging Face API Error (Status ${status}):`, errorBody);
            
            if (status === 429 || status === 503) {
                 // 429 is Rate Limit, 503 is Service Unavailable (common for Inference API)
                 throw new Error("Hugging Face API Quota Exceeded or Service Unavailable. Please retry later.");
            }
            throw new Error(`Hugging Face API failed with status ${status}.`);
        }
        
        // Catch network errors or custom errors thrown above
        const error = err instanceof Error ? err.message : "Unknown error";
        console.error("summarizeMentions error:", error);
        throw new Error(`Failed to summarize mentions: ${error}`);
    }
};