"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts"
import { TrendingUp, TrendingDown, Search } from "lucide-react"

// Mock market data
const majorIndices = [
  {
    symbol: "^GSPC",
    name: "S&P 500",
    price: 4783.45,
    change: 23.67,
    changePercent: 0.5,
    data: Array.from({ length: 30 }, (_, i) => ({
      time: `${i + 1}d`,
      price: 4783.45 + (Math.random() - 0.5) * 100,
    })),
  },
  {
    symbol: "^IXIC",
    name: "NASDAQ",
    price: 15045.23,
    change: -45.12,
    changePercent: -0.3,
    data: Array.from({ length: 30 }, (_, i) => ({
      time: `${i + 1}d`,
      price: 15045.23 + (Math.random() - 0.5) * 200,
    })),
  },
  {
    symbol: "^DJI",
    name: "Dow Jones",
    price: 37689.54,
    change: 156.78,
    changePercent: 0.42,
    data: Array.from({ length: 30 }, (_, i) => ({
      time: `${i + 1}d`,
      price: 37689.54 + (Math.random() - 0.5) * 300,
    })),
  },
]

const topStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 175.43, change: 2.34, changePercent: 1.35, volume: "52.3M" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 378.85, change: 4.12, changePercent: 1.1, volume: "28.7M" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 2847.63, change: -15.23, changePercent: -0.53, volume: "18.9M" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 3247.15, change: 12.45, changePercent: 0.38, volume: "31.2M" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.5, change: -8.75, changePercent: -3.4, volume: "89.4M" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.28, change: 23.67, changePercent: 2.78, volume: "45.6M" },
  { symbol: "META", name: "Meta Platforms", price: 487.32, change: 7.89, changePercent: 1.64, volume: "22.1M" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", price: 432.67, change: 1.23, changePercent: 0.28, volume: "3.8M" },
]

const sectorPerformance = [
  { sector: "Technology", performance: 2.45, color: "#10b981" },
  { sector: "Healthcare", performance: 1.23, color: "#3b82f6" },
  { sector: "Financial", performance: 0.87, color: "#8b5cf6" },
  { sector: "Consumer Disc.", performance: 0.45, color: "#f59e0b" },
  { sector: "Communication", performance: -0.23, color: "#ef4444" },
  { sector: "Industrials", performance: -0.67, color: "#ef4444" },
  { sector: "Energy", performance: -1.12, color: "#ef4444" },
  { sector: "Utilities", performance: -1.45, color: "#ef4444" },
]

const commodities = [
  { name: "Gold", symbol: "GC=F", price: 2034.5, change: 12.3, changePercent: 0.61 },
  { name: "Silver", symbol: "SI=F", price: 24.67, change: -0.23, changePercent: -0.92 },
  { name: "Crude Oil", symbol: "CL=F", price: 73.45, change: 1.89, changePercent: 2.64 },
  { name: "Natural Gas", symbol: "NG=F", price: 2.87, change: -0.12, changePercent: -4.01 },
]

const currencies = [
  { pair: "EUR/USD", price: 1.0876, change: 0.0023, changePercent: 0.21 },
  { pair: "GBP/USD", price: 1.2734, change: -0.0045, changePercent: -0.35 },
  { pair: "USD/JPY", price: 148.67, change: 0.89, changePercent: 0.6 },
  { pair: "USD/CHF", price: 0.8756, change: 0.0012, changePercent: 0.14 },
]

export default function MarketData() {
  const [selectedIndex, setSelectedIndex] = useState(majorIndices[0])
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStocks = topStocks.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Major Indices */}
      <div className="grid gap-4 md:grid-cols-3">
        {majorIndices.map((index) => (
          <Card
            key={index.symbol}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedIndex.symbol === index.symbol ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedIndex(index)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{index.name}</CardTitle>
              {index.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{index.price.toLocaleString()}</div>
              <div className={`text-sm ${index.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {index.change >= 0 ? "+" : ""}
                {index.change} ({index.changePercent}%)
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Index Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{selectedIndex.name} - 30 Day Trend</CardTitle>
          <CardDescription>Price movement over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedIndex.data}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedIndex.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={selectedIndex.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={selectedIndex.change >= 0 ? "#10b981" : "#ef4444"}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stocks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stocks">Top Stocks</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="commodities">Commodities</TabsTrigger>
          <TabsTrigger value="currencies">Currencies</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Stocks</CardTitle>
                  <CardDescription>Most active stocks by volume</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stocks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredStocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-primary">{stock.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{stock.symbol}</div>
                        <div className="text-sm text-muted-foreground">{stock.name}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">${stock.price}</div>
                      <div className={`text-sm ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change} ({stock.changePercent}%)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Volume</div>
                      <div className="font-medium">{stock.volume}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sector Performance</CardTitle>
              <CardDescription>Today's sector performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorPerformance} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis dataKey="sector" type="category" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="performance" fill={(entry: any) => entry.color} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commodities" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {commodities.map((commodity) => (
              <Card key={commodity.symbol}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{commodity.name}</CardTitle>
                  {commodity.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${commodity.price}</div>
                  <div className={`text-sm ${commodity.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {commodity.change >= 0 ? "+" : ""}
                    {commodity.change} ({commodity.changePercent}%)
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{commodity.symbol}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="currencies" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {currencies.map((currency) => (
              <Card key={currency.pair}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{currency.pair}</CardTitle>
                  {currency.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currency.price}</div>
                  <div className={`text-sm ${currency.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {currency.change >= 0 ? "+" : ""}
                    {currency.change.toFixed(4)} ({currency.changePercent}%)
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
