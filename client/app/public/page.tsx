"use client";
import { LiveMentionFeed } from "@/components/LiveMention";

export default function PublicStream() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Live Brand Mentions</h1>
      <LiveMentionFeed />
    </div>
  );
}