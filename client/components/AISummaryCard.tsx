// client/components/AISummaryCard.tsx
"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Zap, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const AISummaryCard: React.FC = () => {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorOccurred, setErrorOccurred] = useState(false);
    const NO_DATA_MESSAGE = "No recent data available to summarize.";

    // Function to handle the summary generation on button click
    const handleGenerateSummary = async () => {
        // Reset state for new attempt
        setLoading(true);
        setErrorOccurred(false);
        setSummary(null); // Clear previous summary

        try {
            // Call the backend endpoint
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/summary`);
            const fetchedSummary = response.data.summary;

            // Handle no data or successful summary
            if (fetchedSummary === NO_DATA_MESSAGE || !fetchedSummary) {
                setSummary(NO_DATA_MESSAGE);
            } else {
                setSummary(fetchedSummary);
            }
        } catch (error) {
            console.error("Failed to fetch summary:", error);
            setSummary("Could not generate summary due to a server or API error.");
            setErrorOccurred(true);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERING LOGIC ---

    // Determine the content to display inside the card
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center space-x-3 text-blue-600 font-medium h-full justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing mentions and synthesizing insights...</span>
                </div>
            );
        }

        if (errorOccurred) {
            return (
                // Styled for clear error message
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-1" />
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{summary}</p>
                </div>
            );
        }

        if (summary) {
            // Highlight the summary text for importance
            return (
                <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap font-medium">
                    {summary}
                </p>
            );
        }

        // Default state with button
        return (
            <div className="flex flex-col items-start gap-4">
                <p className="text-sm text-gray-600">
                    Click the <span className='text-blue-500 font-semibold'>'Generate AI Summary'</span> button to get a concise, AI-powered overview of the key conversations and emerging trends from your recent mentions data.
                </p>
                <Button
                    onClick={handleGenerateSummary}
                    disabled={loading} // Button is disabled if loading is true
                    // Apply Primary/Accent Button Styling: Elevated, Blue/Teal Gradient
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50 transition-all font-semibold"
                >
                    <Zap className="mr-2 h-4 w-4" /> Generate AI Summary
                </Button>
            </div>
        );
    };


    return (
        // Apply Card Styling: White with subtle border/shadow
        <Card className="bg-white border border-gray-200 shadow-md rounded-lg h-90">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {/* Apply Theme Typography */}
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-teal-500 to-teal-500">
                    AI Summary of Key Conversations
                </CardTitle>
                {/* Use primary gradient for the icon accent */}
                <Zap className="h-8 w-8 text-yellow-400" />
            </CardHeader>
            {/* Added min-h-[150px] for consistent sizing, adjusted padding */}
            <CardContent className="pt-4 min-h-[150px] md:min-h-[180px]">
                {renderContent()}
            </CardContent>
        </Card>
    );
};