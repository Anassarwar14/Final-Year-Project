// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { Search, TrendingUp, TrendingDown, Clock, Eye, Share2, Bookmark, Zap } from "lucide-react"

// // Mock news data
// const newsArticles = [
//   {
//     id: 1,
//     title: "Federal Reserve Signals Potential Rate Cut in Q2 2024",
//     summary:
//       "Fed officials hint at monetary policy adjustments as inflation shows signs of cooling, potentially impacting bond and equity markets.",
//     category: "Monetary Policy",
//     source: "Financial Times",
//     author: "Sarah Mitchell",
//     publishedAt: "2024-01-15T10:30:00Z",
//     readTime: "4 min read",
//     views: 12500,
//     image: "/federal-reserve-building.png",
//     trending: true,
//   },
//   {
//     id: 2,
//     title: "Tech Giants Report Strong Q4 Earnings Despite Market Volatility",
//     summary:
//       "Apple, Microsoft, and Google exceed analyst expectations, driving tech sector optimism and broader market confidence.",
//     category: "Earnings",
//     source: "Bloomberg",
//     author: "Michael Chen",
//     publishedAt: "2024-01-15T08:15:00Z",
//     readTime: "6 min read",
//     views: 8900,
//     image: "/tech-companies-earnings-chart.jpg",
//     trending: true,
//   },
//   {
//     id: 3,
//     title: "Cryptocurrency Market Sees Institutional Adoption Surge",
//     summary:
//       "Major banks and investment firms increase crypto allocations, signaling mainstream acceptance of digital assets.",
//     category: "Cryptocurrency",
//     source: "CoinDesk",
//     author: "Emma Rodriguez",
//     publishedAt: "2024-01-15T07:45:00Z",
//     readTime: "5 min read",
//     views: 15600,
//     image: "/cryptocurrency-institutional-adoption.jpg",
//     trending: false,
//   },
//   {
//     id: 4,
//     title: "Energy Sector Rallies on Geopolitical Tensions",
//     summary:
//       "Oil and gas stocks surge as supply concerns drive commodity prices higher, benefiting energy companies globally.",
//     category: "Energy",
//     source: "Reuters",
//     author: "David Park",
//     publishedAt: "2024-01-15T06:20:00Z",
//     readTime: "3 min read",
//     views: 7200,
//     image: "/oil-gas-energy-sector-rally.jpg",
//     trending: false,
//   },
//   {
//     id: 5,
//     title: "ESG Investing Reaches New Milestone with $50T in Assets",
//     summary:
//       "Sustainable investing continues rapid growth as institutional and retail investors prioritize environmental and social factors.",
//     category: "ESG",
//     source: "Wall Street Journal",
//     author: "Lisa Thompson",
//     publishedAt: "2024-01-14T16:30:00Z",
//     readTime: "7 min read",
//     views: 5400,
//     image: "/esg-sustainable-investing-growth.jpg",
//     trending: false,
//   },
//   {
//     id: 6,
//     title: "Emerging Markets Show Resilience Amid Global Uncertainty",
//     summary:
//       "Developing economies demonstrate strong fundamentals and growth potential, attracting increased foreign investment flows.",
//     category: "Global Markets",
//     source: "Financial Times",
//     author: "James Wilson",
//     publishedAt: "2024-01-14T14:15:00Z",
//     readTime: "5 min read",
//     views: 4100,
//     image: "/emerging-markets-growth-resilience.jpg",
//     trending: false,
//   },
// ]

// const marketHighlights = [
//   { symbol: "SPY", name: "S&P 500 ETF", price: 478.25, change: 2.34, changePercent: 0.49 },
//   { symbol: "QQQ", name: "NASDAQ ETF", price: 412.67, change: -1.23, changePercent: -0.3 },
//   { symbol: "DIA", name: "Dow Jones ETF", price: 367.89, change: 1.45, changePercent: 0.4 },
//   { symbol: "VTI", name: "Total Stock Market", price: 245.12, change: 0.87, changePercent: 0.36 },
// ]

// const categories = ["All", "Earnings", "Monetary Policy", "Cryptocurrency", "Energy", "ESG", "Global Markets"]

// export default function NewsPage() {
//   const [selectedCategory, setSelectedCategory] = useState("All")
//   const [searchTerm, setSearchTerm] = useState("")
//   const [savedArticles, setSavedArticles] = useState<number[]>([])

//   const filteredArticles = newsArticles.filter((article) => {
//     const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
//     const matchesSearch =
//       article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       article.summary.toLowerCase().includes(searchTerm.toLowerCase())
//     return matchesCategory && matchesSearch
//   })

//   const toggleSaveArticle = (articleId: number) => {
//     setSavedArticles((prev) =>
//       prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
//     )
//   }

//   const formatTimeAgo = (dateString: string) => {
//     const date = new Date(dateString)
//     const now = new Date()
//     const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

//     if (diffInHours < 1) return "Just now"
//     if (diffInHours < 24) return `${diffInHours}h ago`
//     return `${Math.floor(diffInHours / 24)}d ago`
//   }

//   return (
//     <div className="flex-1 space-y-6 p-6">
//       {/* Market Highlights */}
//       <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <TrendingUp className="h-5 w-5 text-primary" />
//             Market Highlights
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-4 md:grid-cols-4">
//             {marketHighlights.map((market) => (
//               <div key={market.symbol} className="flex items-center justify-between p-3 bg-background rounded-lg">
//                 <div>
//                   <div className="font-semibold">{market.symbol}</div>
//                   <div className="text-sm text-muted-foreground">{market.name}</div>
//                 </div>
//                 <div className="text-right">
//                   <div className="font-semibold">${market.price}</div>
//                   <div
//                     className={`text-sm flex items-center gap-1 ${market.change >= 0 ? "text-green-500" : "text-red-500"}`}
//                   >
//                     {market.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
//                     {market.change >= 0 ? "+" : ""}
//                     {market.change} ({market.changePercent}%)
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Search and Filters */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search financial news..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <div className="flex gap-2 overflow-x-auto">
//           {categories.map((category) => (
//             <Button
//               key={category}
//               variant={selectedCategory === category ? "default" : "outline"}
//               size="sm"
//               onClick={() => setSelectedCategory(category)}
//               className="whitespace-nowrap"
//             >
//               {category}
//             </Button>
//           ))}
//         </div>
//       </div>

//       <Tabs defaultValue="latest" className="space-y-6">
//         <TabsList>
//           <TabsTrigger value="latest">Latest News</TabsTrigger>
//           <TabsTrigger value="trending">Trending</TabsTrigger>
//           <TabsTrigger value="saved">Saved Articles</TabsTrigger>
//         </TabsList>

//         <TabsContent value="latest" className="space-y-6">
//           <div className="grid gap-6">
//             {filteredArticles.map((article, index) => (
//               <Card
//                 key={article.id}
//                 className={`hover:shadow-lg transition-all duration-300 ${index === 0 ? "md:col-span-2" : ""}`}
//               >
//                 <div className="flex flex-col md:flex-row">
//                   <div className="md:w-1/3">
//                     <img
//                       src={article.image || "/placeholder.svg"}
//                       alt={article.title}
//                       className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
//                     />
//                   </div>
//                   <div className="flex-1 p-6">
//                     <div className="flex items-start justify-between mb-3">
//                       <div className="flex items-center gap-2">
//                         <Badge variant="secondary">{article.category}</Badge>
//                         {article.trending && (
//                           <Badge variant="default" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
//                             <Zap className="h-3 w-3 mr-1" />
//                             Trending
//                           </Badge>
//                         )}
//                       </div>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => toggleSaveArticle(article.id)}
//                         className={savedArticles.includes(article.id) ? "text-primary" : ""}
//                       >
//                         <Bookmark className="h-4 w-4" />
//                       </Button>
//                     </div>
//                     <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
//                     <p className="text-muted-foreground mb-4 line-clamp-2">{article.summary}</p>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-4">
//                         <div className="flex items-center gap-2">
//                           <Avatar className="h-6 w-6">
//                             <AvatarFallback className="text-xs">
//                               {article.author
//                                 .split(" ")
//                                 .map((n) => n[0])
//                                 .join("")}
//                             </AvatarFallback>
//                           </Avatar>
//                           <span className="text-sm text-muted-foreground">{article.author}</span>
//                         </div>
//                         <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                           <Clock className="h-3 w-3" />
//                           {formatTimeAgo(article.publishedAt)}
//                         </div>
//                         <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                           <Eye className="h-3 w-3" />
//                           {article.views.toLocaleString()}
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm text-muted-foreground">{article.readTime}</span>
//                         <Button variant="ghost" size="sm">
//                           <Share2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </TabsContent>

//         <TabsContent value="trending" className="space-y-6">
//           <div className="grid gap-6">
//             {filteredArticles
//               .filter((article) => article.trending)
//               .map((article) => (
//                 <Card key={article.id} className="hover:shadow-lg transition-all duration-300">
//                   <div className="flex flex-col md:flex-row">
//                     <div className="md:w-1/3">
//                       <img
//                         src={article.image || "/placeholder.svg"}
//                         alt={article.title}
//                         className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
//                       />
//                     </div>
//                     <div className="flex-1 p-6">
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex items-center gap-2">
//                           <Badge variant="secondary">{article.category}</Badge>
//                           <Badge variant="default" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
//                             <Zap className="h-3 w-3 mr-1" />
//                             Trending
//                           </Badge>
//                         </div>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => toggleSaveArticle(article.id)}
//                           className={savedArticles.includes(article.id) ? "text-primary" : ""}
//                         >
//                           <Bookmark className="h-4 w-4" />
//                         </Button>
//                       </div>
//                       <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
//                       <p className="text-muted-foreground mb-4 line-clamp-2">{article.summary}</p>
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-4">
//                           <div className="flex items-center gap-2">
//                             <Avatar className="h-6 w-6">
//                               <AvatarFallback className="text-xs">
//                                 {article.author
//                                   .split(" ")
//                                   .map((n) => n[0])
//                                   .join("")}
//                               </AvatarFallback>
//                             </Avatar>
//                             <span className="text-sm text-muted-foreground">{article.author}</span>
//                           </div>
//                           <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                             <Clock className="h-3 w-3" />
//                             {formatTimeAgo(article.publishedAt)}
//                           </div>
//                           <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                             <Eye className="h-3 w-3" />
//                             {article.views.toLocaleString()}
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <span className="text-sm text-muted-foreground">{article.readTime}</span>
//                           <Button variant="ghost" size="sm">
//                             <Share2 className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//           </div>
//         </TabsContent>

//         <TabsContent value="saved" className="space-y-6">
//           {savedArticles.length === 0 ? (
//             <Card>
//               <CardContent className="flex flex-col items-center justify-center py-12">
//                 <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
//                 <h3 className="text-lg font-semibold mb-2">No saved articles yet</h3>
//                 <p className="text-muted-foreground text-center">
//                   Start saving articles by clicking the bookmark icon on any news story.
//                 </p>
//               </CardContent>
//             </Card>
//           ) : (
//             <div className="grid gap-6">
//               {filteredArticles
//                 .filter((article) => savedArticles.includes(article.id))
//                 .map((article) => (
//                   <Card key={article.id} className="hover:shadow-lg transition-all duration-300">
//                     <div className="flex flex-col md:flex-row">
//                       <div className="md:w-1/3">
//                         <img
//                           src={article.image || "/placeholder.svg"}
//                           alt={article.title}
//                           className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
//                         />
//                       </div>
//                       <div className="flex-1 p-6">
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex items-center gap-2">
//                             <Badge variant="secondary">{article.category}</Badge>
//                             {article.trending && (
//                               <Badge variant="default" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
//                                 <Zap className="h-3 w-3 mr-1" />
//                                 Trending
//                               </Badge>
//                             )}
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => toggleSaveArticle(article.id)}
//                             className="text-primary"
//                           >
//                             <Bookmark className="h-4 w-4" />
//                           </Button>
//                         </div>
//                         <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
//                         <p className="text-muted-foreground mb-4 line-clamp-2">{article.summary}</p>
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-4">
//                             <div className="flex items-center gap-2">
//                               <Avatar className="h-6 w-6">
//                                 <AvatarFallback className="text-xs">
//                                   {article.author
//                                     .split(" ")
//                                     .map((n) => n[0])
//                                     .join("")}
//                                 </AvatarFallback>
//                               </Avatar>
//                               <span className="text-sm text-muted-foreground">{article.author}</span>
//                             </div>
//                             <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                               <Clock className="h-3 w-3" />
//                               {formatTimeAgo(article.publishedAt)}
//                             </div>
//                             <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                               <Eye className="h-3 w-3" />
//                               {article.views.toLocaleString()}
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <span className="text-sm text-muted-foreground">{article.readTime}</span>
//                             <Button variant="ghost" size="sm">
//                               <Share2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </Card>
//                 ))}
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, TrendingUp, TrendingDown, Clock, Eye, Share2, Bookmark, Zap, Loader2 } from "lucide-react"

// --- Types ---

// The shape your UI expects (matches your previous mock data)
interface UIArticle {
  id: number
  title: string
  summary: string
  category: string
  source: string
  author: string
  publishedAt: string
  readTime: string
  views: number
  image: string
  trending: boolean
  url: string // Added this so clicking opens the news
}

// The shape coming from your API (Finnhub)
interface FinnhubArticle {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

// --- Adapters ---

// Finnhub doesn't provide author, views, or read time, so we generate them 
// to maintain the UI design integrity.
const adaptFinnhubArticle = (article: FinnhubArticle): UIArticle => {
  return {
    id: article.id,
    title: article.headline,
    summary: article.summary,
    category: article.category.charAt(0).toUpperCase() + article.category.slice(1),
    source: article.source,
    author: article.source || "Editorial Team", // Fallback for author
    publishedAt: new Date(article.datetime * 1000).toISOString(), // Convert Unix timestamp
    readTime: `${Math.ceil(article.summary.length / 200)} min read`, // Estimate read time
    views: Math.floor(Math.random() * (15000 - 1000) + 1000), // Mock views for UI
    image: article.image || "/placeholder.svg", // Fallback image
    trending: Math.random() < 0.2, // Randomly mark 20% as trending
    url: article.url,
  }
}

// --- Constants ---
const marketHighlights = [
  { symbol: "SPY", name: "S&P 500 ETF", price: 478.25, change: 2.34, changePercent: 0.49 },
  { symbol: "QQQ", name: "NASDAQ ETF", price: 412.67, change: -1.23, changePercent: -0.3 },
  { symbol: "DIA", name: "Dow Jones ETF", price: 367.89, change: 1.45, changePercent: 0.4 },
  { symbol: "VTI", name: "Total Stock Market", price: 245.12, change: 0.87, changePercent: 0.36 },
]

// Finnhub supports specific categories. "General" is the default.
const categories = ["All", "General", "Crypto", "Merger"]

export default function NewsPage() {
  const [articles, setArticles] = useState<UIArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [savedArticles, setSavedArticles] = useState<number[]>([])

  // Fetch News from API
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        // Construct URL based on category
        const endpoint = selectedCategory === "All" 
          ? "/api/news" // Your getAllNews route
          : `/api/news/${selectedCategory.toLowerCase()}` // Your getNewsByCategory route

        // Note: Replace with your actual API base URL if not on same origin
        const response = await fetch(endpoint)
        
        if (!response.ok) throw new Error("Failed to fetch news")
        
        const data: FinnhubArticle[] = await response.json()
        
        // Filter out articles without images or headlines to keep UI clean
        const validData = data.filter(item => item.image && item.headline && item.summary)
        
        const adaptedData = validData.map(adaptFinnhubArticle)
        setArticles(adaptedData)
      } catch (error) {
        console.error("Error fetching news:", error)
        // Optionally set an error state here
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [selectedCategory])

  // Filter Logic (Client side search on top of API category fetch)
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })
=======
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, ExternalLink, TrendingUp, Newspaper, Search, SortAsc } from "lucide-react";
import { MarketTicker } from "@/components/news/MarketTicker";
import useSWR from "swr";
import { useState, useMemo } from "react";
import Image from "next/image";

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json());

interface NewsArticle {
  title: string;
  url: string;
  time_published: string;
  authors?: string[];
  summary: string;
  source: string;
  banner_image?: string;
  category_within_source?: string;
  overall_sentiment_score?: number;
  overall_sentiment_label?: string;
  topics?: Array<{
    topic: string;
    relevance_score: string;
  }>;
  ticker_sentiment?: Array<{
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }>;
  inHoldings?: boolean;
  inWatchlist?: boolean;
}

function NewsCard({ article }: { article: NewsArticle }) {
  // Parse Alpha Vantage time format: "20251209T083000"
  // Alpha Vantage NEWS_SENTIMENT returns times in US Eastern Time (ET = UTC-5 for EST)
  const timeStr = article.time_published;
  
  // Parse components
  const year = parseInt(timeStr.slice(0, 4));
  const month = parseInt(timeStr.slice(4, 6)) - 1; // JS months are 0-indexed
  const day = parseInt(timeStr.slice(6, 8));
  const hour = parseInt(timeStr.slice(9, 11));
  const minute = parseInt(timeStr.slice(11, 13));
  const second = parseInt(timeStr.slice(13, 15) || "0");

  // Robust parsing: If string ends with 'Z', treat as UTC; otherwise assume UTC.
  // Alpha Vantage often returns UTC in the NEWS API. Using UTC avoids DST ambiguity.
  const publishedDate = new Date(Date.UTC(year, month, day, hour, minute, second));
  
  const timeAgo = getTimeAgo(publishedDate);
  
  // Debug logging - log first article to verify parsing
  if (typeof window !== 'undefined' && !(window as any)._newsDebugLogged) {
    const now = new Date();
    const diff = now.getTime() - publishedDate.getTime();
    console.log("🔍 NEWS TIME DEBUG (First Article):", {
      title: article.title.substring(0, 50),
      timeStr,
      parsedAsUTC: `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')} ${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')} UTC`,
      publishedDate: publishedDate.toISOString(),
      publishedPKT: publishedDate.toLocaleString('en-US', { timeZone: 'Asia/Karachi', hour12: true }),
      now: now.toISOString(),
      nowPKT: now.toLocaleString('en-US', { timeZone: 'Asia/Karachi', hour12: true }),
      diffMs: diff,
      diffSeconds: Math.floor(diff / 1000),
      diffMinutes: Math.floor(diff / (1000 * 60)),
      diffHours: (diff / (1000 * 60 * 60)).toFixed(2),
      timeAgo,
      note: diff < 0 ? "⚠️ Published date is in the FUTURE!" : "✅ Time difference is correct"
    });
    (window as any)._newsDebugLogged = true;
  }
  
  const sentimentScore = article.overall_sentiment_score || 0;
  const sentimentLabel = article.overall_sentiment_label || "Neutral";
  
  // Validate banner image URL
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url || url.trim() === "" || url === "NULL" || url === "null") return false;
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  };
  
  const validBannerImage = isValidImageUrl(article.banner_image) ? article.banner_image : null;
  
  // Use a placeholder if no valid image
  const placeholderImage = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop"; // Financial news placeholder

  return (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative w-full h-48 bg-muted">
        <Image
          src={validBannerImage || placeholderImage}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          unoptimized={true}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />
                </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {article.inHoldings && (
                <Badge variant="default" className="text-xs">
                  Your Holdings
                </Badge>
              )}
              {article.inWatchlist && !article.inHoldings && (
                <Badge variant="secondary" className="text-xs">
                  Watchlist
                </Badge>
              )}
            </div>
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {article.title}
              </h3>
            </a>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <span className="font-medium">{article.source}</span>
              <span>•</span>
              <span className="flex items-center gap-1" title={publishedDate.toLocaleString()}>
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
                  </div>
                </div>
          <Badge 
            variant={
              sentimentScore > 0.15 
                ? "default" 
                : sentimentScore < -0.15 
                ? "destructive" 
                : "secondary"
            } 
            className="shrink-0"
          >
            {sentimentLabel}
          </Badge>
              </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {article.summary}
        </p>
        
        {article.topics && article.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.topics.slice(0, 3).map((topic, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="text-xs"
              >
                {topic.topic.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Badge>
            ))}
          </div>
        )}
        
        {article.ticker_sentiment && article.ticker_sentiment.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.ticker_sentiment.slice(0, 5).map((ticker, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className={`text-xs ${
                  parseFloat(ticker.ticker_sentiment_score) > 0.15 
                    ? "border-positive/50 text-positive" 
                    : parseFloat(ticker.ticker_sentiment_score) < -0.15 
                    ? "border-negative/50 text-negative" 
                    : ""
                }`}
              >
                {ticker.ticker}
              </Badge>
            ))}
          </div>
        )}
        
        <Button variant="ghost" size="sm" asChild className="w-full">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read Full Article
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
            </Button>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const diffMs = new Date().getTime() - date.getTime();
  const seconds = Math.floor(Math.abs(diffMs) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
  if (days < 7) return `${days}d ${hours % 24}h ago`;

  return date.toLocaleDateString();
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(9)].map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-48 w-full" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
          ))}
        </div>
  );
}

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "relevance" | "oldest">("latest");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  
  const { data: personalizedData, isLoading, error } = useSWR(
    "/api/news/personalized?days=7", 
    fetcher, 
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
    }
  );

  // Combine all news with priority: holdings first, then watchlist, then market
  const allNews: NewsArticle[] = useMemo(() => {
    if (!personalizedData || isLoading) return [];
    
    const holdingsNews = personalizedData.holdingsNews || [];
    const watchlistNews = personalizedData.watchlistNews || [];
    const marketNews = personalizedData.marketNews || [];
    
    return [...holdingsNews, ...watchlistNews, ...marketNews];
  }, [personalizedData, isLoading]);
>>>>>>> 20b6a0f1a97f04aa7bf571c5090861ff7177ce74

  // Extract unique topics from all news
  const availableTopics = useMemo(() => {
    const topicsSet = new Set<string>();
    allNews.forEach(article => {
      article.topics?.forEach(t => topicsSet.add(t.topic));
    });
    return Array.from(topicsSet).sort();
  }, [allNews]);

  // Filter and sort news
  const filteredAndSortedNews = useMemo(() => {
    let filtered = allNews;

    // Apply topic filter
    if (topicFilter !== "all") {
      filtered = filtered.filter((article) => 
        article.topics?.some(t => t.topic === topicFilter)
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((article) => 
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query) ||
        article.ticker_sentiment?.some(t => t.ticker.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      // Parse ET timestamps
      const parseETTime = (timeStr: string) => {
        const year = parseInt(timeStr.slice(0, 4));
        const month = parseInt(timeStr.slice(4, 6)) - 1;
        const day = parseInt(timeStr.slice(6, 8));
        const hour = parseInt(timeStr.slice(9, 11));
        const minute = parseInt(timeStr.slice(11, 13));
        const second = parseInt(timeStr.slice(13, 15) || "0");
        
        // Parse as UTC directly
        return new Date(Date.UTC(year, month, day, hour, minute, second));
      };
      
      const dateA = parseETTime(a.time_published);
      const dateB = parseETTime(b.time_published);

      if (sortBy === "latest") {
        return dateB.getTime() - dateA.getTime();
      } else if (sortBy === "oldest") {
        return dateA.getTime() - dateB.getTime();
      } else {
        // Relevance: prioritize holdings, then watchlist, then by date
        if (a.inHoldings && !b.inHoldings) return -1;
        if (!a.inHoldings && b.inHoldings) return 1;
        if (a.inWatchlist && !b.inWatchlist) return -1;
        if (!a.inWatchlist && b.inWatchlist) return 1;
        return dateB.getTime() - dateA.getTime();
      }
    });

    return sorted;
  }, [allNews, searchQuery, sortBy, topicFilter]);

  // Debug: log distribution of article ages once
  if (typeof window !== 'undefined' && !(window as any)._newsAgesLogged && filteredAndSortedNews.length) {
    const now = Date.now();
    const ages = filteredAndSortedNews.slice(0, 50).map((a: any) => {
      const ts = a.time_published as string;
      const y = parseInt(ts.slice(0,4));
      const m = parseInt(ts.slice(4,6)) - 1;
      const d = parseInt(ts.slice(6,8));
      const hh = parseInt(ts.slice(9,11));
      const mm = parseInt(ts.slice(11,13));
      const ss = parseInt(ts.slice(13,15) || '0');
      const dt = new Date(Date.UTC(y,m,d,hh,mm,ss));
      const diffMin = Math.round((now - dt.getTime())/60000);
      return { title: a.title?.slice(0,40), timeStr: ts, utc: dt.toISOString(), minutesAgo: diffMin };
    });
    const buckets = {
      lt30: ages.filter(a=>a.minutesAgo<30).length,
      lt60: ages.filter(a=>a.minutesAgo>=30 && a.minutesAgo<60).length,
      lt120: ages.filter(a=>a.minutesAgo>=60 && a.minutesAgo<120).length,
      lt360: ages.filter(a=>a.minutesAgo>=120 && a.minutesAgo<360).length,
      gte360: ages.filter(a=>a.minutesAgo>=360).length,
    };
    console.log('🧪 NEWS AGE DISTRIBUTION', buckets, ages.slice(0,10));
    (window as any)._newsAgesLogged = true;
  }

  return (
    <div className="relative flex-1 w-full max-w-full overflow-x-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Market Ticker */}
      <MarketTicker />

<<<<<<< HEAD
      <Tabs defaultValue="latest" className="space-y-6">
        <TabsList>
          <TabsTrigger value="latest">Latest News</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="saved">Saved Articles</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="latest" className="space-y-6">
              <div className="grid gap-6">
                {filteredArticles.map((article, index) => (
                  <NewsCard 
                    key={article.id} 
                    article={article} 
                    index={index} 
                    toggleSaveArticle={toggleSaveArticle} 
                    savedArticles={savedArticles}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-6">
              <div className="grid gap-6">
                {filteredArticles
                  .filter((article) => article.trending)
                  .map((article) => (
                    <NewsCard 
                      key={article.id} 
                      article={article} 
                      toggleSaveArticle={toggleSaveArticle} 
                      savedArticles={savedArticles}
                      formatTimeAgo={formatTimeAgo}
                    />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-6">
              {savedArticles.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No saved articles yet</h3>
                    <p className="text-muted-foreground text-center">
                      Start saving articles by clicking the bookmark icon on any news story.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredArticles
                    .filter((article) => savedArticles.includes(article.id))
                    .map((article) => (
                      <NewsCard 
                        key={article.id} 
                        article={article} 
                        toggleSaveArticle={toggleSaveArticle} 
                        savedArticles={savedArticles}
                        formatTimeAgo={formatTimeAgo}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
=======
      <div className="container mx-auto p-6 space-y-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3 font-heading">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-blue-400/10">
                  <Newspaper className="h-8 w-8 text-blue-800 dark:text-blue-400" />
    </div>
                <span className="bg-gradient-to-r from-blue-800 via-cyan-500 to-blue-500 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-300 bg-clip-text text-transparent">
                  Market News & Insights
                </span>
              </h1>
              <p className="text-muted-foreground mt-2 ml-14">
                Personalized news from your holdings and latest market trends
              </p>
            </div>
            {personalizedData?.summary && (
              <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold font-numeric">
                  {filteredAndSortedNews.length} {searchQuery ? "matching" : ""} articles
                </span>
              </div>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search news by title, source, or ticker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {availableTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="relevance">Most Relevant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSkeleton />}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-12 text-center">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Failed to Load News</h3>
              <p className="text-muted-foreground">
                Please try again later or check your connection
              </p>
            </CardContent>
          </Card>
        )}

        {/* News Grid */}
        {!isLoading && !error && filteredAndSortedNews.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedNews.map((article: NewsArticle, idx: number) => (
              <NewsCard key={`${article.url}-${idx}`} article={article} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAndSortedNews.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {searchQuery || topicFilter !== "all" ? "No Matching News" : "No News Available"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No articles match "${searchQuery}". Try a different search.`
                  : topicFilter !== "all"
                  ? `No articles found for topic "${topicFilter.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}". Try selecting a different topic.`
                  : "Unable to fetch market news at the moment. Please try again later."
                }
              </p>
              {(searchQuery || topicFilter !== "all") && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setTopicFilter("all");
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
>>>>>>> 20b6a0f1a97f04aa7bf571c5090861ff7177ce74
    </div>
  );
}

// Extracted Component to avoid code duplication across Tabs
function NewsCard({ article, index = 1, toggleSaveArticle, savedArticles, formatTimeAgo }: any) {
  return (
    <Card
      className={`hover:shadow-lg transition-all duration-300 ${index === 0 ? "md:col-span-2" : ""}`}
    >
      <div className="flex flex-col md:flex-row h-full">
        <div className="md:w-1/3">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg"
            }}
          />
        </div>
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{article.category}</Badge>
              {article.trending && (
                <Badge variant="default" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                  <Zap className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                  e.preventDefault()
                  toggleSaveArticle(article.id)
              }}
              className={savedArticles.includes(article.id) ? "text-primary" : ""}
            >
              <Bookmark className={`h-4 w-4 ${savedArticles.includes(article.id) ? "fill-current" : ""}`} />
            </Button>
          </div>
          
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="block group">
            <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
          </a>
          
          <p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">{article.summary}</p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {article.author
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground truncate max-w-[100px]">{article.author}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground hidden sm:flex">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(article.publishedAt)}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground hidden sm:flex">
                <Eye className="h-3 w-3" />
                {article.views.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{article.readTime}</span>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}


