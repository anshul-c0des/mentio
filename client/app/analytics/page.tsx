// client/app/analytics/page.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend, 
} from "recharts";
import {
    ArrowLeft,
    Activity, 
    Globe,
    BarChart3,
    Home,
    TrendingUp, 
} from "lucide-react"; 
import { fetchMentions } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import SentimentChart from "@/components/SentimentChart";
import { Button } from "@/components/ui/button";
import TrendingTopics from "@/components/TrendingTopics";
import { BrandHealthCard } from "@/components/BrandHealth";

type Mention = {
    text: string;
    source: string;
    sentiment: "positive" | "neutral" | "negative";
    topic: string;
    timestamp: string;
};
interface TopicData {
    topic: string;
    count: number;
}

const PIE_COLORS = ["#00B894", "#0984E3", "#FDCB6E", "#E84393", "#6C5CE7"];

export default function Analytics() {
    const [trends, setTrends] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [mentions, setMentions] = useState<Mention[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendsRes, topicsRes] = await Promise.all([
                    axios.get(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/trends`
                    ),
                    axios.get(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/topics`
                    ),
                ]);

                setTrends(
                    Object.entries(trendsRes.data).map(([hour, count]) => ({ hour, count }))
                );
                setTopics(
                    Object.entries(topicsRes.data).map(([topic, count]) => ({
                        topic,
                        count,
                    }))
                );
            } catch (err) {
                console.error("Failed to fetch analytics data:", err);
                setError("Failed to load analytics data.");
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const loadMentions = async () => {
            try {
                const allMentions = await fetchMentions();
                setMentions(allMentions);
            } catch (error) {
                console.error("Failed to fetch mentions:", error);
                setError("Failed to load mentions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadMentions();
    }, []);

    if (loading) {
        return (
            <div className="p-8 md:p-12 flex flex-col justify-center items-center h-screen bg-gray-50 text-gray-800">
                <Activity className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-lg font-medium">Loading **mentio** Analytics...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-lg m-8">
                <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 md:mb-0">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
                        Analytics Dashboard
                    </span>
                </h1>
                
                {/* Moved Button here and removed the extra div for better mobile flow */}
                <Button
                    onClick={() => window.history.back()}
                    className="w-full sm:w-auto text-gray-600 bg-white hover:bg-gray-100 border border-gray-300 shadow-sm"
                >
                    <Home className="h-4 w-4 mr-2 text-blue-500" />
                    Back to Dashboard
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BrandHealthCard />

                <Card className="shadow-md border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-bold text-teal-500">
                            🔥 Trending Topics
                        </CardTitle>
                        <TrendingUp className="h-7 w-7 border-2 p-1 border-teal-500 rounded-full text-teal-500" />
                    </CardHeader>
                    <CardContent className="h-full pt-4">
                        <TrendingTopics mentions={mentions} />
                    </CardContent>
                </Card>
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Adjusted layout for small screens to ensure charts aren't too small */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-md border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold text-blue-500">
                            Sentiment Distribution
                        </CardTitle>
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <SentimentChart mentions={mentions} />
                    </CardContent>
                </Card>

                <Card className="shadow-md border border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-bold text-teal-500">
                            Top Topics Distribution
                        </CardTitle>
                        <Globe className="h-6 w-6 text-teal-500" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex justify-center h-[300px] md:h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={topics}
                                        dataKey="count"
                                        nameKey="topic"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100} 
                                        fill="#8884d8"
                                        labelLine={false}
                                        label={({ payload, percent }) => {
                                            const dataPoint = payload as TopicData;
                                            const percentage = percent !== undefined ? (percent * 100).toFixed(0) : 'N/A';
                                            if (parseFloat(percentage) > 5) {
                                                return `${percentage}%`;
                                            }
                                            return '';
                                        }}
                                    >
                                        {topics.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value, name, props) => [value, props.payload.topic]}
                                    />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-md border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-bold text-blue-600">
                        Mention Volume (Last 24h Trend)
                    </CardTitle>
                    <Activity className="h-6 w-6 text-blue-600" />
                </CardHeader>
                <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trends} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="hour" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#2563eb" 
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, fill: '#14b8a6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}