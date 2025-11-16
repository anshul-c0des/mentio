import React from "react";
import { ExternalLink, Clock, ThumbsUp, Meh, ThumbsDown } from "lucide-react";

interface MentionCardProps {
  text: string;
  source: string;
  sentiment: "positive" | "neutral" | "negative";
  timestamp: string;
}

// Map sentiment to premium light theme classes for badges/text
const sentimentClasses = {
  positive: {
    badge: "bg-green-100 text-green-700 border border-green-200",
    icon: ThumbsUp,
  },
  neutral: {
    badge: "bg-gray-100 text-gray-700 border border-gray-200",
    icon: Meh,
  },
  negative: {
    badge: "bg-red-100 text-red-700 border border-red-200",
    icon: ThumbsDown,
  },
};

export const MentionCard: React.FC<MentionCardProps> = ({
  text,
  source,
  sentiment,
  timestamp,
}) => {
  const SentimentIcon = sentimentClasses[sentiment].icon;

  return (
    // Apply Card Styling: White background, subtle border, subtle shadow, and hover effect
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex flex-col space-y-3">
      {/* 1. Mention Text (Body) - Use dark, readable text */}
      <p className="text-sm line-clamp-3 text-gray-900 leading-relaxed font-md">
        {text}
      </p>

      {/* 2. Footer Section (Metadata) */}
      <div className="flex justify-between items-end pt-2 border-t border-gray-100 mt-auto">
        {/* Source and Timestamp */}
        <div className="flex items-center text-xs text-gray-600 space-x-4">
          {/* Source */}
          <span className="flex items-center space-x-1 font-medium text-blue-600">
            <span>{source}</span>
          </span>

          {/* Timestamp */}
          <span className="flex items-center space-x-1 text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{new Date(timestamp).toLocaleTimeString()}</span>
          </span>
        </div>

        {/* Sentiment Badge (Right Aligned) */}
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${sentimentClasses[sentiment].badge} flex items-center space-x-1`}
        >
          <SentimentIcon className="w-3 h-3" />
          <span>{sentiment}</span>
        </span>
      </div>
    </div>
  );
};
