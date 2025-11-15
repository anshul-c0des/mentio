// client/app/dashboard/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchMentions } from "@/utils/api";
import socket from "@/utils/socket";
import { MentionCard } from "@/components/MentionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import axios from "axios";
import { AISummaryCard } from "@/components/AISummaryCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Flame, XCircle, Smile, Meh, Frown, RotateCcw, Bell, BarChart } from "lucide-react";

type Sentiment = "positive" | "neutral" | "negative";
type FilterType = Sentiment | "all";

type Mention = {
  text: string;
  source: string;
  sentiment: Sentiment;
  topic: string;
  timestamp: string;
};

type SpikeAlert = {
  type: 'volumeSpike';
  timestamp: number;
  message: string;
  id: number;
};

// --- COMPONENT: High-Level Sentiment Counts (Themed) ---
const SentimentSummaryCard: React.FC<{ mentions: Mention[] }> = ({ mentions }) => {
    const counts = useMemo(() => {
        return mentions.reduce((acc, m) => {
            acc[m.sentiment] = (acc[m.sentiment] || 0) + 1;
            return acc;
        }, {} as Record<Sentiment, number>);
    }, [mentions]);

    const total = mentions.length;

    const sentimentItems = [
        { name: "Positive", count: counts.positive || 0, icon: <Smile className="h-5 w-5 text-green-500" />, color: "text-green-600" },
        { name: "Neutral", count: counts.neutral || 0, icon: <Meh className="h-5 w-5 text-gray-500" />, color: "text-gray-600" },
        { name: "Negative", count: counts.negative || 0, icon: <Frown className="h-5 w-5 text-red-500" />, color: "text-red-600" },
    ];

    return (
        <Card className="shadow-lg h-90 dark:bg-gray-900/50 border-t-4 border-teal-500/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total Sentiment Summary</CardTitle>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">{total}</span>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    {sentimentItems.map(item => (
                        <div key={item.name} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                            <div className="flex items-center space-x-3">
                                {item.icon}
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                            </div>
                            <div className="text-lg font-extrabold flex items-center">
                                {item.count}
                                <span className="text-xs ml-2 font-normal text-muted-foreground w-12 text-right">
                                    ({total > 0 ? ((item.count / total) * 100).toFixed(1) : 0}%)
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


export default function Dashboard() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [redditMentions, setRedditMentions] = useState<Mention[]>([]);
  const [newsMentions, setNewsMentions] = useState<Mention[]>([]);
  const [youtubeMentions, setYoutubeMentions] = useState<Mention[]>([]);

  const [activeAlerts, setActiveAlerts] = useState<SpikeAlert[]>([]);
  // NEW STATE: Tracks if the initial data fetch is pending
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [liveFeedFilter, setLiveFeedFilter] = useState<FilterType>("all");
  const [redditFilter, setRedditFilter] = useState<FilterType>("all");
  const [newsFilter, setNewsFilter] = useState<FilterType>("all");
  const [youtubeFilter, setYoutubeFilter] = useState<FilterType>("all");

  const router = useRouter();

  const filterMentions = (mentions: Mention[], filter: FilterType) => {
    return filter === "all"
      ? mentions
      : mentions.filter((m) => m.sentiment === filter);
  };
  
  const filteredLiveMentions = useMemo(() => filterMentions(mentions, liveFeedFilter), [mentions, liveFeedFilter]);
  const filteredRedditMentions = useMemo(() => filterMentions(redditMentions, redditFilter), [redditMentions, redditFilter]);
  const filteredNewsMentions = useMemo(() => filterMentions(newsMentions, newsFilter), [newsMentions, newsFilter]);
  const filteredYoutubeMentions = useMemo(() => filterMentions(youtubeMentions, youtubeFilter), [youtubeMentions, youtubeFilter]);

  const dismissAlert = (id: number) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== id));
  };
  
  useEffect(() => {
    const loadMentions = async () => {
      try {
        const allMentions = await fetchMentions();
        setMentions(allMentions);
  
        const normalizeSource = (source: string) => source.toLowerCase();
        
        setRedditMentions(
          allMentions.filter((m: Mention) => normalizeSource(m.source).includes("reddit"))
        );
        setNewsMentions(
          allMentions.filter((m: Mention) => normalizeSource(m.source).includes("gnews") || normalizeSource(m.source).includes("news"))
        );
        setYoutubeMentions(
          allMentions.filter((m: Mention) => normalizeSource(m.source).includes("youtube"))
        );
      } catch (error) {
        console.error("Failed to fetch mentions:", error);
      } finally {
        // SET LOADING TO FALSE AFTER ATTEMPTING TO FETCH
        setIsLoadingInitialData(false); 
      }
    };

    loadMentions();

    // ... (Socket.IO setup remains the same)
    socket.on("alert", (alert: Omit<SpikeAlert, 'id'>) => {
      const newAlert = { ...alert, id: Date.now() + Math.random() }; 
      setActiveAlerts(prev => [newAlert, ...prev]);
    });
    
    socket.on("new_mention", (mention: Mention) => {
      setMentions((prev) => [mention, ...prev]);
      
      const source = mention.source.toLowerCase();

      if (source.includes("reddit")) {
        setRedditMentions((prev) => [mention, ...prev]);
      } else if (source.includes("gnews") || source.includes("news")) {
        setNewsMentions((prev) => [mention, ...prev]);
      } else if (source.includes("youtube")) {
        setYoutubeMentions((prev) => [mention, ...prev]);
      }
    });

    return () => {
      socket.off("new_mention");
      socket.off("alert");
    };
  }, []); 

  const handleResetBrand = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/queries`);
    } catch (err) {
      console.error("Failed to reset brand", err);
    } finally {
      setMentions([]);
      setRedditMentions([]);
      setNewsMentions([]);
      setYoutubeMentions([]);
      router.push("/");
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true); // Start loading state
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/refresh-feed`);
    } catch (err) {
      console.error("Failed to trigger manual refresh:", err);
    } finally {
      // Small delay to show the refresh animation
      setTimeout(() => setIsRefreshing(false), 1000); 
    }
  };

  const AlertBanner = ({ alert }: { alert: SpikeAlert }) => (
    <Alert 
        className="bg-red-50 dark:bg-red-950 border-l-4 border-red-500 text-red-800 dark:text-red-300 relative shadow-md" 
        variant="default"
    >
        <Flame className="h-5 w-5 text-red-600 dark:text-red-400" />
        <AlertTitle className="text-red-700 dark:text-red-400 font-bold flex items-center">
            CONVERSATION SPIKE ALERT!
        </AlertTitle>
        <AlertDescription className="text-red-600 dark:text-red-400 pr-10 text-sm">
            {alert.message} ({new Date(alert.timestamp).toLocaleTimeString()})
        </AlertDescription>
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 h-6 w-6 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
            onClick={() => dismissAlert(alert.id)}
        >
            <XCircle className="h-4 w-4" />
        </Button>
    </Alert>
  );
  
  const NotificationModal: React.FC<{ activeAlerts: SpikeAlert[], dismissAlert: (id: number) => void }> = ({ activeAlerts, dismissAlert }) => (
<Dialog>
    <DialogTrigger asChild>
        <Button 
            variant="outline" 
            size="icon" 
            className={`relative w-10 bg-blue-50 border-blue-400 h-10 ${activeAlerts.length > 0 ? 'border-red-500 hover:bg-red-50/50' : ''}`}
        >
            <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            {activeAlerts.length > 0 && (
                <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 animate-pulse border-2 border-white dark:border-gray-950" />
            )}
        </Button>
    </DialogTrigger>
    <DialogContent className="max-w-4xl p-0 h-[80vh] flex flex-col">
        <DialogHeader className="p-6 pb-2 border-b dark:border-gray-800">
            <DialogTitle className="text-2xl font-bold">Spike Alerts & Notifications</DialogTitle> 
        </DialogHeader>
        
        <div className="p-6 pt-4 flex-grow overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Active Alerts ({activeAlerts.length})
            </h3>
            
            {activeAlerts.length > 0 ? (
                <div className="space-y-4">
                    {activeAlerts.map(alert => (
                        <AlertBanner key={alert.id} alert={alert} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 pt-10">No active spike alerts. All clear!</p>
            )}
        </div>

    </DialogContent>
</Dialog>
  );


  // Helper component for Source Cards (Themed and Responsive)
  const SourceFeedCard: React.FC<{
    title: string;
    mentions: Mention[];
    currentFilter: FilterType;
    setFilter: (newFilter: FilterType) => void;
  }> = ({ title, mentions, currentFilter, setFilter }) => {
    // Adjust height for better responsiveness across the three feeds
    const FEED_HEIGHT_CLASS = "h-[300px] md:h-[350px]"; 

    return (
      <Card className="shadow-lg dark:bg-gray-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-blue-600 dark:text-blue-400">{`${title} (${mentions.length})`}</CardTitle>
          <div className="w-full mt-2">
            <Select onValueChange={(value) => setFilter(value as FilterType)} defaultValue={currentFilter}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Filter Sentiment" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="all">All Mentions</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className={`${FEED_HEIGHT_CLASS} overflow-y-auto space-y-4 pt-2`}>
          {mentions.map((m, i) => (
            <MentionCard
              key={i}
              text={m.text}
              source={m.source}
              sentiment={m.sentiment}
              timestamp={m.timestamp}
            />
          ))}
          {mentions.length === 0 && (
            <p className="text-sm text-center text-muted-foreground pt-10">No recent {title.toLowerCase()} found.</p>
          )}
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="p-4 md:p-4 -pt-3 lg:p-8 mx-auto container space-y-8 bg-white dark:bg-gray-950 min-h-screen">
      {/* Header Section (Fixed alignment) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 dark:border-gray-800">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4 md:mb-0">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">mentio</span> Dashboard
        </h1>
        <div className="flex flex-wrap gap-3 md:space-x-2 items-center"> {/* Added items-center here */}
            {/* Notification Modal */}
            <NotificationModal activeAlerts={activeAlerts} dismissAlert={dismissAlert} />
            
            <Button 
            variant="outline" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="hover:bg-blue-50/50 dark:hover:bg-blue-900/50 bg-blue-50 border-blue-400 cursor-pointer"
          >
            <RotateCcw className={`mr-1 h-4 w-4 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Now"}<span className="text-xs text-gray-400">{" (Default: 5min)"}</span>
          </Button>
            <Button 
                variant="secondary" 
                onClick={() => router.push("/analytics")}
                className="bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 dark:bg-teal-500/20 dark:text-teal-400 dark:hover:bg-teal-500/30 cursor-pointer"
            >
            <BarChart className="mr-2 h-4 w-4" /> View Analytics
            </Button>
            <Button variant="destructive" onClick={handleResetBrand} className="cursor-pointer hover:bg-red-700">
              Reset Brand
            </Button>
        </div>
      </div>

      {activeAlerts.length > 0 && (
          <div className="space-y-3 block md:hidden">
              {activeAlerts.map(alert => (
                  <AlertBanner key={alert.id} alert={alert} />
              ))}
          </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        
        <div className="space-y-8 lg:col-span-1 h-full">
          <AISummaryCard /> 
          <SentimentSummaryCard mentions={mentions} /> 
        </div>
        <Card className="lg:col-span-1 xl:col-span-2 shadow-lg dark:bg-gray-900/50"> 
          <CardHeader className="pb-4 flex flex-row justify-between items-center">
            <CardTitle className="text-2xl font-semibold text-blue-600 dark:text-blue-400">Live Feed</CardTitle>
            <div className="w-full max-w-[200px]">
              <Select
                onValueChange={(value) => setLiveFeedFilter(value as FilterType)}
                defaultValue={liveFeedFilter}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Filter Sentiment" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Mentions</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="h-[550px] lg:h-[600px] overflow-y-auto space-y-4 pt-3"> 
            
            {/* START: Live Feed Conditional Rendering */}
            {isLoadingInitialData ? (
              // Show Loading Spinner
              <div className="flex flex-col items-center justify-center h-full pt-10 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-center text-muted-foreground">Loading initial mentions...</p>
              </div>
            ) : (
              // Show Mentions or Empty State
              <>
                {filteredLiveMentions.map((m, i) => (
                  <MentionCard
                    key={i}
                    text={m.text}
                    source={m.source}
                    sentiment={m.sentiment}
                    timestamp={m.timestamp}
                  />
                ))}
                {filteredLiveMentions.length === 0 && (
                  <p className="text-sm text-center text-muted-foreground pt-10">
                    {/* Improved Empty State Message based on filter */}
                    {liveFeedFilter === 'all' 
                      ? "No mentions have been collected yet." 
                      : `No mentions match the '${liveFeedFilter}' filter.`}
                  </p>
                )}
              </>
            )}
            {/* END: Live Feed Conditional Rendering */}

          </CardContent>
        </Card>
      </div>

      {/* --- BOTTOM ROW: Source Feeds (3 Columns) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-4"> 
        <SourceFeedCard
            title="Reddit Mentions"
            mentions={filteredRedditMentions}
            currentFilter={redditFilter}
            setFilter={setRedditFilter}
        />
        <SourceFeedCard
            title="GNews Mentions"
            mentions={filteredNewsMentions}
            currentFilter={newsFilter}
            setFilter={setNewsFilter}
        />
        <SourceFeedCard
            title="YouTube Mentions"
            mentions={filteredYoutubeMentions}
            currentFilter={youtubeFilter}
            setFilter={setYoutubeFilter}
        />
      </div>
    </div>
  );
}