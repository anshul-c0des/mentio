import { TrendingUp } from "lucide-react"; 

type Mention = {
  text: string;
  topic: string;
  sentiment: "positive" | "neutral" | "negative";
  source: string;
  timestamp: string | Date;
};

export default function TrendingTopics({ mentions }: { mentions: Mention[] }) {
  const topicsCount: Record<string, number> = {};

  // Calculate topic counts
  mentions.forEach((m) => {
    topicsCount[m.topic] = (topicsCount[m.topic] || 0) + 1;
  });

  // Get top 5 trending topics
  const trending = Object.entries(topicsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (trending.length === 0) {
    return (
      <div className="text-gray-500 italic py-4">
        No recent topics found to analyze.
      </div>
    );
  }

  return (
    // Removed the wrapper <div>'s margin and title since the parent Card handles it
    <div className="space-y-3">
      {/* List of Trending Topic Badges */}
      <div className="flex flex-wrap gap-2">
        {trending.map(([topic, count], i) => (
          // Apply Premium Badge Style:
          // Subtle background, text color aligned with accent, rounded-full for modern look
          <div
            key={i}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700 shadow-sm transition-all hover:bg-blue-100"
          >
            {/* Small icon to visually signify the topic is trending/important */}
            <TrendingUp className="w-4 h-4 text-blue-500" />

            {/* Topic Name */}
            <span className="text-gray-800">{topic}</span>

            {/* Count (subtle number) */}
            <span className="ml-1 text-gray-500 text-xs font-normal">
              ({count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
