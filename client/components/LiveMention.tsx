"use client";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { MentionCard } from "@/components/MentionCard"; // Assuming MentionCard is correct

// Define the Mention interface here or import it from a shared types file
interface Mention {
  _id: string;
  text: string;
  source: string;
  sentiment: "positive" | "neutral" | "negative";
  timestamp: string;
  topic?: string;
}

// Ensure you use NEXT_PUBLIC_BACKEND_URL for client-side environment variables
const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "");

export function LiveMentionFeed() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch last 50 mentions on mount
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        // Use the correct client-side environment variable
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/recent`
        );
        setMentions(res.data);
      } catch (error) {
        console.error("Failed to fetch recent mentions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  // Listen for real-time mentions
  useEffect(() => {
    socket.on("new_mention", (mention: Mention) => {
      setMentions((prev) => [mention, ...prev].slice(0, 50)); // keep last 50
    });

    return () => {
      socket.off("new_mention");
    };
  }, []);

  if (loading) {
    return (
      <p className="text-center text-gray-500 pt-10">Loading live feed...</p>
    );
  }

  return (
    <div className="p-0">
      {" "}
      {/* Adjusted padding for integration into the dialog */}
      {mentions.length === 0 && (
        <p className="text-center text-gray-500 pt-10">No mentions yet...</p>
      )}
      <div className="flex flex-col space-y-4">
        {" "}
        {/* Added space-y-4 for separation */}
        {mentions.map((m) => (
          <MentionCard
            key={m._id}
            text={m.text}
            source={m.source}
            sentiment={m.sentiment}
            timestamp={m.timestamp}
          />
        ))}
      </div>
    </div>
  );
}
