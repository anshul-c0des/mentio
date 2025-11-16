"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Gauge } from "lucide-react"; // Icon for visual flair

// --- BrandHealthCard Component ---

export const BrandHealthCard: React.FC = () => {
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        // NOTE: Ensure the path matches your backend setup, e.g., /api/brand/health
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/brand/health`
        );
        // Use a slight delay to allow the Progress bar animation to be visible
        setTimeout(() => {
          setHealthScore(response.data.score);
          setLoading(false);
        }, 300);
      } catch (error) {
        console.error("Error fetching brand health:", error);
        setHealthScore(50); // Fallback to neutral
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  // Determine color classes based on score
  const getProgressColor = (
    score: number
  ): { indicator: string; text: string } => {
    if (score >= 75)
      return { indicator: "bg-green-500", text: "text-green-600" };
    if (score >= 40)
      return { indicator: "bg-yellow-500", text: "text-yellow-600" };
    return { indicator: "bg-red-500", text: "text-red-600" };
  };

  const getHealthStatus = (score: number): string => {
    if (score > 80) return "Excellent";
    if (score > 60) return "Good";
    if (score > 40) return "Neutral";
    if (score > 20) return "Warning";
    return "Critical";
  };

  // Helper to safely access score and colors
  const score = healthScore ?? 0;
  const colors = getProgressColor(score);

  return (
    // Apply Card Styling: White with subtle border and shadow-md
    <Card className="bg-white border border-gray-200 shadow-md rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* Apply Theme Typography */}
        <CardTitle className="text-xl font-bold text-blue-500">
          Brand Health Score
        </CardTitle>
        {/* Accent Icon: Use the primary Blue/Teal accent color */}
        <Gauge className="h-6 w-6 text-blue-600" />
      </CardHeader>
      <CardContent>
        {loading ? (
          // Styled Loading State
          <div className="space-y-4">
            <div className="h-10 w-20 animate-pulse bg-gray-200 rounded-md" />
            <div className="h-4 w-24 animate-pulse bg-gray-100 rounded-md" />
            <div className="h-3 w-full animate-pulse bg-gray-200 rounded-md" />
            <div className="h-3 w-40 animate-pulse bg-gray-100 rounded-md" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Health Score - Large, bold, impactful number */}
            <div className={`text-4xl font-extrabold ${colors.text}`}>
              {score}%
            </div>

            {/* Status Text - Use conditional color and medium weight */}
            <p className={`text-sm font-medium ${colors.text}`}>
              Status: {getHealthStatus(score)}
            </p>

            {/* Progress Bar - Apply conditional indicator color */}
            <Progress
              value={score}
              className="h-3 bg-gray-200" // Base track color
              indicatorClassName={colors.indicator} // Conditional color for the filled part
            />

            {/* Subtext - Subtle gray text */}
            <p className="text-xs text-gray-500 pt-1">
              Based on the last 100 mentions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
