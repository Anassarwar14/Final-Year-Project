"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, Target, AlertTriangle, Lightbulb, Star, ThumbsUp } from "lucide-react"

// Mock analysis data
const marketAnalysis = [
  {
    id: 1,
    title: "Q1 2024 Market Outlook: Navigating Uncertainty",
    analyst: "Sarah Chen",
    firm: "Goldman Sachs",
    rating: "Bullish",
    summary:
      "Despite ongoing geopolitical tensions, we maintain a positive outlook for equities in Q1 2024, driven by strong corporate earnings and potential Fed policy shifts.",
    keyPoints: [
      "S&P 500 target: 4,950 by end of Q1",
      "Technology sector remains overweight",
      "Emerging markets showing resilience",
      "Bond yields expected to stabilize",
    ],
    publishedAt: "2024-01-15",
    likes: 234,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    title: "Tech Earnings Season: AI Revolution Continues",
    analyst: "Michael Rodriguez",
    firm: "Morgan Stanley",
    rating: "Overweight",
    summary:
      "AI-focused companies are expected to deliver exceptional results this earnings season, with cloud computing and semiconductor stocks leading the charge.",
    keyPoints: [
      "NVIDIA expected to beat estimates by 15%",
      "Cloud revenue growth accelerating",
      "AI infrastructure spending increasing",
      "Semiconductor demand remains strong",
    ],
    publishedAt: "2024-01-14",
    likes: 189,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    title: "Federal Reserve Policy: Rate Cut Probability Analysis",
    analyst: "Emma Thompson",
    firm: "JPMorgan",
    rating: "Neutral",
    summary:
      "Our analysis suggests a 65% probability of a 25bp rate cut in Q2 2024, contingent on inflation data and employment trends.",
    keyPoints: [
      "Core PCE trending toward 2% target",
      "Labor market showing signs of cooling",
      "Housing market stabilization expected",
      "Dollar strength may moderate",
    ],
    publishedAt: "2024-01-13",
    likes: 156,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

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
  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case "bullish":
      case "overweight":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20"
      case "bearish":
      case "underweight":
        return "bg-red-500/10 text-red-600 hover:bg-red-500/20"
      default:
        return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal.toLowerCase()) {
      case "bullish":
        return "text-green-500"
      case "bearish":
        return "text-red-500"
      default:
        return "text-blue-500"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Market Sentiment Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Bullish</div>
            <p className="text-xs text-muted-foreground">68% of analysts positive</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fear & Greed Index</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">62</div>
            <p className="text-xs text-muted-foreground">Greed territory</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIX Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">18.4</div>
            <p className="text-xs text-muted-foreground">Low volatility</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyst Consensus</CardTitle>
            <Star className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">4.2/5</div>
            <p className="text-xs text-muted-foreground">Strong buy rating</p>
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

        <TabsContent value="reports" className="space-y-6">
          <div className="space-y-6">
            {marketAnalysis.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={report.avatar || "/placeholder.svg"} alt={report.analyst} />
                        <AvatarFallback>
                          {report.analyst
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription>
                          {report.analyst} • {report.firm} • {report.publishedAt}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className={getRatingColor(report.rating)}>
                      {report.rating}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{report.summary}</p>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      Key Points
                    </h4>
                    <ul className="space-y-1">
                      {report.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {report.likes}
                      </Button>
                    </div>
                    <Button variant="outline" size="sm">
                      Read Full Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

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
