// client/components/SentimentChart.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Define the expected data type for the chart
interface SentimentData {
  name: "Positive" | "Neutral" | "Negative";
  value: number;
}

// Define the Mention type (based on the Analytics page definition)
type Mention = {
  text: string;
  source: string;
  sentiment: "positive" | "neutral" | "negative";
  topic: string;
  timestamp: string;
};

// Define Theme-Aligned Sentiment Colors (More professional and light)
const SENTIMENT_COLORS = {
  Positive: "#10B981", // Emerald Green
  Neutral: "#6B7280", // Slate Gray
  Negative: "#EF4444", // Red
};

export default function SentimentChart({ mentions }: { mentions: Mention[] }) {
  const data: SentimentData[] = [
    { name: "Positive", value: mentions.filter((m) => m.sentiment === "positive").length },
    { name: "Neutral", value: mentions.filter((m) => m.sentiment === "neutral").length },
    { name: "Negative", value: mentions.filter((m) => m.sentiment === "negative").length },
  ];

  // Filter out data points with 0 value for a cleaner chart/legend
  const chartData = data.filter(d => d.value > 0);
  
  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-[350px] text-gray-500 italic">
            No mention data available for sentiment analysis.
        </div>
    );
  }

  return (
    // Set a consistent height, utilizing the parent Card's space
    <div className="w-full h-[350px]"> 
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            // FIX: Use type assertion (as any) on the data prop to satisfy recharts' wide type definition
            data={chartData as any} 
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120} // Larger radius for visual impact
            fill="#8884d8"
            labelLine={false}
            // Style the label text
            label={({ name, percent, payload }) => {
              const dataPoint = payload as SentimentData;
              const percentage = percent !== undefined ? (percent * 100).toFixed(1) : '0';

              // Only show labels for slices that are large enough (e.g., > 5%)
              if (dataPoint.value > 0 && parseFloat(percentage) > 5) {
                // Use default chart fill color for text to ensure contrast on white background
                return `${name} (${percentage}%)`;
              }
              return '';
            }}
          >
            {chartData.map((d, index) => (
              // Map colors using the SENTIMENT_COLORS object based on the name
              <Cell 
                key={index} 
                fill={SENTIMENT_COLORS[d.name]} 
                // Slight shadow or emphasis on active slice for premium feel (optional)
                stroke="#ffffff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          {/* Tooltip styled with theme-consistent border/shadow */}
          <Tooltip 
            contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                padding: '10px',
            }}
            // Format to show count and percentage
            formatter={(value, name, props) => {
                const total = chartData.reduce((sum, d) => sum + d.value, 0);
                const percentage = total > 0 ? ((value as number / total) * 100).toFixed(1) : '0';
                return [`${value} (${percentage}%)`, props.payload.name];
            }}
          />
          {/* Legend styled to use dark text for premium look */}
          <Legend 
            layout="horizontal" 
            align="center" 
            verticalAlign="bottom" 
            wrapperStyle={{ paddingTop: '10px', color: '#1F2937' /* text-gray-800 */ }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}