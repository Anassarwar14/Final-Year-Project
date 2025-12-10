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

  const toggleSaveArticle = (articleId: number) => {
    setSavedArticles((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
    )
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Market Highlights */}
      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Market Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {marketHighlights.map((market) => (
              <div key={market.symbol} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <div className="font-semibold">{market.symbol}</div>
                  <div className="text-sm text-muted-foreground">{market.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${market.price}</div>
                  <div
                    className={`text-sm flex items-center gap-1 ${market.change >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {market.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {market.change >= 0 ? "+" : ""}
                    {market.change} ({market.changePercent}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search financial news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

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
    </div>
  )
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


