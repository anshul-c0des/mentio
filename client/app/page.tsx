// frontend/pages/index.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, Zap, BarChart, TrendingUp, Search, MessageSquare, Newspaper, Youtube, Bot } from "lucide-react"; // Added Reddit back for platform logos
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";


interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: MessageSquare,
    title: "AI Summary & Sentiment",
    description: "Instantly grasp the public mood with AI-powered sentiment analysis and concise summaries of all mentions.",
  },
  {
    icon: Search,
    title: "Multi-Platform Tracking",
    description: "Track your brand mentions across the most relevant channels: Reddit, YouTube, and key News sources.",
  },
  {
    icon: Zap,
    title: "Spike Alerts",
    description: "Get notified immediately when mention volume spikes, letting you address PR issues or capitalize on momentum.",
  },
  {
    icon: BarChart,
    title: "Deep Analytics",
    description: "Access comprehensive data and charts to understand mention frequency, source distribution, and historical trends.",
  },
];

export default function Home() {
  const [brand, setBrand] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) return setError("Please enter a brand name to track.");

    setLoading(true);
    setError("");

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/queries`, { name: brand.trim() });
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to add brand. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50">
      
      <div className="absolute top-0 left-0 w-full h-96 pointer-events-none hidden md:block">
        <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-blue-900 dark:opacity-30"></div>
        <div className="absolute top-0 right-[-100px] w-96 h-96 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-teal-900 dark:opacity-30"></div>
      </div>

      <main className="w-full max-w-7xl z-10 px-4 md:px-6">
        <section className="py-16 md:py-36 lg:py-48 text-center relative">
          
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">mentio</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto font-light text-gray-800 dark:text-gray-300">
            Real-time brand intelligence powered by AI. <span className="text-blue-600 font-semibold">Track, Analyze, & Understand</span> your presence across social media and news.
          </p>

          <Card className="max-w-md mx-auto p-4 md:p-6 shadow-2xl dark:border-gray-700 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
              <div className="w-full">
                <Label htmlFor="brand-input" className="sr-only">Brand Name</Label>
                <Input
                  id="brand-input"
                  type="text"
                  placeholder="Enter brand name (e.g., 'Tesla')"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-3 h-11 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus-visible:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full md:w-auto h-11 px-6 text-base font-semibold bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/50 cursor-pointer"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-5 w-5" />}
                {loading ? "Tracking..." : "Start Tracking"}
              </Button>
            </form>
            {error && <p className="mt-3 text-red-500 dark:text-red-400 text-sm font-medium">{error}</p>}
          </Card>
        </section>

        {/* --- Features Section (Cleaner Layout) --- */}
        {/* Adjusted section padding for mobile */}
        <section className="py-12 md:py-24">
          {/* Adjusted header size */}
          <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-10 md:mb-16 text-gray-800 dark:text-white">
            Monitor <span className="text-blue-600 dark:text-blue-400">What Matters</span>
          </h2>
          
          {/* Feature Cards Grid: Responsive grid structure */}
          {/* Default: grid-cols-1 (single column) */}
          {/* md:grid-cols-2 (two columns on tablet) */}
          {/* lg:grid-cols-4 (four columns on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-2">
            {FEATURES.map((feature) => (
              <Card 
                key={feature.title} 
                className="hover:shadow-2xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700 border-t-4 border-blue-500/50"
              >
                <CardHeader className="flex flex-row items-start space-y-0 pb-2">
                  <feature.icon className="h-6 w-6 text-blue-600 mr-4 mt-1 flex-shrink-0" />
                  <CardTitle className="text-xl font-bold leading-snug">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform Logos */}
          <div className="mt-12 md:mt-20 text-center">
            <h3 className="text-lg md:text-xl font-semibold mb-6 text-gray-700 dark:text-gray-300">
                Data Sources:
            </h3>
            {/* Adjusted icon spacing for mobile */}
            <div className="flex justify-center space-x-8 md:space-x-12 text-gray-400 dark:text-gray-600">
                {/* Assuming 'Bot' was a placeholder for Reddit/Social, using Reddit icon here for clarity */}
                <Bot className="h-7 w-7 md:h-8 md:w-8 transition-colors hover:text-orange-600"  /> 
                <Youtube className="h-7 w-7 md:h-8 md:w-8 transition-colors hover:text-red-600"  /> 
                <Newspaper className="h-7 w-7 md:h-8 md:w-8 transition-colors hover:text-blue-600"  /> 
            </div>
          </div>
        </section>
      </main>
      
      ---

      {/* --- Footer/Legal --- */}
      <footer className="w-full py-6 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} mentio. All rights reserved.
      </footer>
    </div>
  );
}