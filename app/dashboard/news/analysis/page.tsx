"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, Target, AlertTriangle, Lightbulb, Star, ThumbsUp, Bookmark } from "lucide-react"

// --- Types ---

// Matches Prisma NewsSentiment enum roughly
type SentimentType = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

interface NewsArticle {
  id: string;
  title: string;
  sourceName: string | null;
  author: string | null;
  sentiment: SentimentType;
  publishedAt: string;
  description: string;
  url: string;
}

interface AnalyticsData {
  sentiments: Record<string, number>; // e.g. { POSITIVE: 10, NEGATIVE: 5 }
  topAssets: any[];
}

// --- Mock Data (Placeholders for features not yet in DB) ---

const sectorAnalysis = [
  { sector: "Technology", rating: "Overweight", target: 15.2, current: 12.8, color: "#10b981" },
  { sector: "Healthcare", rating: "Neutral", target: 8.5, current: 7.9, color: "#3b82f6" },
  { sector: "Financial", rating: "Underweight", target: 6.2, current: 8.1, color: "#ef4444" },
  { sector: "Energy", rating: "Overweight", target: 12.3, current: 9.7, color: "#10b981" },
  { sector: "Consumer Disc.", rating: "Neutral", target: 7.8, current: 7.5, color: "#3b82f6" },
  { sector: "Industrials", rating: "Overweight", target: 9.4, current: 8.2, color: "#10b981" },
]

const riskFactors = [
  {
    factor: "Geopolitical Tensions",
    impact: "High",
    probability: "Medium",
    description: "Ongoing conflicts affecting global supply chains and energy markets",
  },
  {
    factor: "Inflation Persistence",
    impact: "Medium",
    probability: "Low",
    description: "Risk of inflation remaining above Fed targets longer than expected",
  },
  {
    factor: "Banking Sector Stress",
    impact: "High",
    probability: "Low",
    description: "Potential credit tightening affecting economic growth",
  },
  {
    factor: "China Economic Slowdown",
    impact: "Medium",
    probability: "Medium",
    description: "Slower growth in China impacting global demand",
  },
]

const technicalIndicators = [
  { indicator: "RSI", value: 58.3, signal: "Neutral", description: "Neither overbought nor oversold" },
  { indicator: "MACD", value: 12.5, signal: "Bullish", description: "Signal line above zero, upward momentum" },
  { indicator: "Moving Average", value: 4785.2, signal: "Bullish", description: "Price above 50-day MA" },
  { indicator: "Bollinger Bands", value: "Mid", signal: "Neutral", description: "Price near middle band" },
]

const priceTargets = [
  { timeframe: "1 Month", target: 4850, current: 4783, probability: 75 },
  { timeframe: "3 Months", target: 4950, current: 4783, probability: 65 },
  { timeframe: "6 Months", target: 5100, current: 4783, probability: 55 },
  { timeframe: "12 Months", target: 5300, current: 4783, probability: 45 },
]

export default function MarketAnalysis() {
  // --- State ---
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [reports, setReports] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Analytics (for top cards)
        // Adjust API path if your routing setup is different
        const analyticsRes = await fetch('/api/news/analytics?dateRange=7d');
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);

        // 2. Fetch Latest News (mapped to "Analyst Reports")
        const newsRes = await fetch('/api/news?limit=10&sortBy=publishedAt');
        const newsData = await newsRes.json();
        setReports(newsData.data || []); 
      } catch (error) {
        console.error("Failed to fetch market analysis", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Logic: Handle Save ---
  const handleSave = async (articleId: string) => {
    try {
        const newSaved = new Set(savedArticles);
        if (newSaved.has(articleId)) {
            newSaved.delete(articleId);
            // Optional: Call API to unsave
            // await fetch('/api/user/saved-articles', { method: 'DELETE', body: JSON.stringify({ id: articleId }) });
        } else {
            newSaved.add(articleId);
            // Optional: Call API to save
            // await fetch('/api/user/saved-articles', { method: 'POST', body: JSON.stringify({ id: articleId }) });
        }
        setSavedArticles(newSaved);
    } catch (error) {
        console.error("Failed to toggle save", error);
    }
  };

  // --- Logic: Derived Metrics ---

  // Calculate total sentiment volume
  const positive = analytics?.sentiments?.POSITIVE || 0;
  const negative = analytics?.sentiments?.NEGATIVE || 0;
  const neutral = analytics?.sentiments?.NEUTRAL || 0;
  const totalSentiment = positive + negative + neutral;

  // Calculate % of news that is positive
  const bullishPct = totalSentiment > 0 
    ? Math.round((positive / totalSentiment) * 100) 
    : 0;

  // Determine Label & Color based on percentage
  let sentimentLabel = "Neutral";
  let sentimentColor = "text-blue-500";
  let sentimentBg = "bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20";
  let sentimentIconColor = "text-blue-500";

  if (bullishPct >= 60) {
    sentimentLabel = "Bullish";
    sentimentColor = "text-green-500";
    sentimentBg = "bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20";
    sentimentIconColor = "text-green-500";
  } else if (bullishPct <= 40 && totalSentiment > 0) {
    sentimentLabel = "Bearish";
    sentimentColor = "text-red-500";
    sentimentBg = "bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20";
    sentimentIconColor = "text-red-500";
  }

  // Simulate "Fear & Greed" index based on news sentiment
  const fearGreedValue = totalSentiment > 0 
    ? Math.round(((positive - negative + totalSentiment) / (2 * totalSentiment)) * 100)
    : 50;
    
  let fearGreedLabel = "Neutral";
  if (fearGreedValue > 75) fearGreedLabel = "Extreme Greed";
  else if (fearGreedValue > 55) fearGreedLabel = "Greed";
  else if (fearGreedValue < 25) fearGreedLabel = "Extreme Fear";
  else if (fearGreedValue < 45) fearGreedLabel = "Fear";

  // --- Helpers ---

  const getRatingColor = (rating: string) => {
    const r = rating.toUpperCase();
    if (r === 'POSITIVE' || r === 'BULLISH' || r === 'OVERWEIGHT') {
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20";
    }
    if (r === 'NEGATIVE' || r === 'BEARISH' || r === 'UNDERWEIGHT') {
        return "bg-red-500/10 text-red-600 hover:bg-red-500/20";
    }
    return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20";
  }

  const getSignalColor = (signal: string) => {
    switch (signal.toLowerCase()) {
      case "bullish": return "text-green-500";
      case "bearish": return "text-red-500";
      default: return "text-blue-500";
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      
      {/* --- Top Cards: Dynamic Sentiment Overview --- */}
      <div className="grid gap-4 md:grid-cols-4">
        
        {/* 1. Market Sentiment */}
        <Card className={sentimentBg}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
            <TrendingUp className={`h-4 w-4 ${sentimentIconColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${sentimentColor}`}>
              {loading ? "..." : sentimentLabel}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Analyzing..." : `${bullishPct}% positive news volume`}
            </p>
          </CardContent>
        </Card>

        {/* 2. Fear & Greed (Simulated) */}
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News Index</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {loading ? "..." : fearGreedValue}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Calculating..." : fearGreedLabel}
            </p>
          </CardContent>
        </Card>

        {/* 3. VIX (Static - needs external API) */}
        <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIX Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">18.4</div>
            <p className="text-xs text-muted-foreground">Low volatility (Est)</p>
          </CardContent>
        </Card>

        {/* 4. Analyst Consensus (Based on report count) */}
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyst Consensus</CardTitle>
            <Star className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {loading ? "..." : reports.length > 0 ? "Active" : "Quiet"}
            </div>
            <p className="text-xs text-muted-foreground">
               {reports.length} Recent reports
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Analyst Reports</TabsTrigger>
          <TabsTrigger value="sectors">Sector Analysis</TabsTrigger>
          <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
        </TabsList>

        {/* --- Tab 1: Analyst Reports (Dynamic from API) --- */}
        <TabsContent value="reports" className="space-y-6">
          <div className="space-y-6">
            {loading ? (
                <div className="text-center p-10 text-muted-foreground">Loading market reports...</div>
            ) : reports.length === 0 ? (
                <div className="text-center p-10 text-muted-foreground">No recent reports found.</div>
            ) : (
                reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            {/* Use Source Name for avatar initials fallback */}
                            <AvatarFallback>
                                {report.sourceName?.slice(0, 2).toUpperCase() || "AN"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg line-clamp-1">{report.title}</CardTitle>
                            <CardDescription>
                            {report.author || "Market Analyst"} • {report.sourceName || "Source"} • {new Date(report.publishedAt).toLocaleDateString()}
                            </CardDescription>
                        </div>
                        </div>
                        <Badge variant="secondary" className={getRatingColor(report.sentiment)}>
                        {report.sentiment}
                        </Badge>
                    </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-3">{report.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {/* Randomize likes or use DB field if added later */}
                            {Math.floor(Math.random() * 50) + 10} 
                        </Button>
                        {/* Save Button Added Here */}
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSave(report.id)}
                            className={savedArticles.has(report.id) ? "text-primary" : "text-muted-foreground"}
                        >
                            <Bookmark className={`h-4 w-4 mr-1 ${savedArticles.has(report.id) ? "fill-current" : ""}`} />
                            {savedArticles.has(report.id) ? "Saved" : "Save"}
                        </Button>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(report.url, '_blank')}
                        >
                        Read Full Report
                        </Button>
                    </div>
                    </CardContent>
                </Card>
                ))
            )}
          </div>
        </TabsContent>

        {/* --- Tab 2: Sector Analysis (Static Mock) --- */}
        <TabsContent value="sectors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sector Recommendations</CardTitle>
              <CardDescription>Current analyst ratings and price targets by sector</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectorAnalysis.map((sector) => (
                  <div key={sector.sector} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                      <div>
                        <div className="font-semibold">{sector.sector}</div>
                        <Badge variant="secondary" className={getRatingColor(sector.rating)}>
                          {sector.rating}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">Target: {sector.target}%</div>
                      <div className="text-sm text-muted-foreground">Current: {sector.current}%</div>
                      <div className={`text-sm ${sector.target > sector.current ? "text-green-500" : "text-red-500"}`}>
                        {sector.target > sector.current ? "+" : ""}
                        {(sector.target - sector.current).toFixed(1)}% upside
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab 3: Technical Analysis (Static Mock) --- */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
                <CardDescription>Key technical signals for S&P 500</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {technicalIndicators.map((indicator) => (
                    <div key={indicator.indicator} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-semibold">{indicator.indicator}</div>
                        <div className="text-sm text-muted-foreground">{indicator.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{indicator.value}</div>
                        <div className={`text-sm font-medium ${getSignalColor(indicator.signal)}`}>
                          {indicator.signal}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Targets</CardTitle>
                <CardDescription>Analyst price targets with probability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priceTargets.map((target) => (
                    <div key={target.timeframe} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{target.timeframe}</span>
                        <span className="font-semibold">
                          {target.target} ({((target.target / target.current - 1) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${target.probability}%` }} />
                      </div>
                      <div className="text-sm text-muted-foreground">{target.probability}% probability</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- Tab 4: Risks (Static Mock) --- */}
        <TabsContent value="risks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>Key risks to monitor in current market environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskFactors.map((risk, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{risk.factor}</h4>
                      <div className="flex gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            risk.impact === "High"
                              ? "bg-red-500/10 text-red-600"
                              : risk.impact === "Medium"
                                ? "bg-yellow-500/10 text-yellow-600"
                                : "bg-green-500/10 text-green-600"
                          }
                        >
                          {risk.impact} Impact
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={
                            risk.probability === "High"
                              ? "bg-red-500/10 text-red-600"
                              : risk.probability === "Medium"
                                ? "bg-yellow-500/10 text-yellow-600"
                                : "bg-green-500/10 text-green-600"
                          }
                        >
                          {risk.probability} Probability
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{risk.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}