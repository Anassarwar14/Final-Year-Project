"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Search, Filter, Download, TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react"

// Mock trading history data
const tradingHistory = [
  {
    id: 1,
    date: "2024-01-15",
    symbol: "AAPL",
    type: "BUY",
    quantity: 50,
    price: 170.25,
    total: 8512.5,
    status: "Completed",
  },
  {
    id: 2,
    date: "2024-01-16",
    symbol: "GOOGL",
    type: "BUY",
    quantity: 10,
    price: 2800.0,
    total: 28000.0,
    status: "Completed",
  },
  {
    id: 3,
    date: "2024-01-18",
    symbol: "MSFT",
    type: "BUY",
    quantity: 25,
    price: 375.0,
    total: 9375.0,
    status: "Completed",
  },
  {
    id: 4,
    date: "2024-01-20",
    symbol: "TSLA",
    type: "BUY",
    quantity: 15,
    price: 260.0,
    total: 3900.0,
    status: "Completed",
  },
  {
    id: 5,
    date: "2024-01-22",
    symbol: "AAPL",
    type: "SELL",
    quantity: 10,
    price: 175.5,
    total: 1755.0,
    status: "Completed",
  },
  {
    id: 6,
    date: "2024-01-25",
    symbol: "JPM",
    type: "BUY",
    quantity: 30,
    price: 145.5,
    total: 4365.0,
    status: "Completed",
  },
  {
    id: 7,
    date: "2024-01-28",
    symbol: "JNJ",
    type: "BUY",
    quantity: 40,
    price: 162.0,
    total: 6480.0,
    status: "Completed",
  },
  {
    id: 8,
    date: "2024-01-30",
    symbol: "TSLA",
    type: "SELL",
    quantity: 5,
    price: 245.0,
    total: 1225.0,
    status: "Completed",
  },
]

const monthlyStats = [
  { month: "Jan", trades: 8, volume: 62612.5, pnl: 1247.3 },
  { month: "Feb", trades: 12, volume: 45230.75, pnl: -523.45 },
  { month: "Mar", trades: 15, volume: 67890.25, pnl: 2156.78 },
  { month: "Apr", trades: 10, volume: 38450.5, pnl: 892.15 },
  { month: "May", trades: 18, volume: 72340.8, pnl: 3245.6 },
  { month: "Jun", trades: 14, volume: 55670.25, pnl: 1678.9 },
]

const performanceData = [
  { date: "Jan", portfolio: 100000, benchmark: 100000 },
  { date: "Feb", portfolio: 101247, benchmark: 99850 },
  { date: "Mar", portfolio: 100724, benchmark: 101200 },
  { date: "Apr", portfolio: 103880, benchmark: 102150 },
  { date: "May", portfolio: 104772, benchmark: 103800 },
  { date: "Jun", portfolio: 108018, benchmark: 105200 },
]

export default function TradingHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredHistory = tradingHistory.filter((trade) => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || trade.type.toLowerCase() === filterType.toLowerCase()
    const matchesStatus = filterStatus === "all" || trade.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesType && matchesStatus
  })

  const totalTrades = tradingHistory.length
  const totalVolume = tradingHistory.reduce((sum, trade) => sum + trade.total, 0)
  const buyTrades = tradingHistory.filter((t) => t.type === "BUY").length
  const sellTrades = tradingHistory.filter((t) => t.type === "SELL").length

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              {buyTrades} buys, {sellTrades} sells
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">${totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all trades</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">68.5%</div>
            <p className="text-xs text-muted-foreground">Profitable trades</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trade Size</CardTitle>
            <Filter className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">${(totalVolume / totalTrades).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Trade History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trading History</CardTitle>
                  <CardDescription>Complete record of all your trades</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by symbol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredHistory.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          trade.type === "BUY" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {trade.type === "BUY" ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{trade.symbol}</div>
                        <div className="text-sm text-muted-foreground">{trade.date}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge
                        variant={trade.type === "BUY" ? "default" : "secondary"}
                        className={
                          trade.type === "BUY"
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        }
                      >
                        {trade.type}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">{trade.quantity} shares</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${trade.price}</div>
                      <div className="text-sm text-muted-foreground">per share</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${trade.total.toLocaleString()}</div>
                      <Badge variant="outline" className="text-xs">
                        {trade.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trading Volume</CardTitle>
                <CardDescription>Trading activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly P&L</CardTitle>
                <CardDescription>Profit and loss by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="pnl"
                        fill={(entry: any) => (entry.pnl >= 0 ? "#10b981" : "#ef4444")}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Trading Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <h4 className="font-semibold">Trade Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Buy Orders</span>
                      <span className="font-medium text-green-500">
                        {buyTrades} ({((buyTrades / totalTrades) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sell Orders</span>
                      <span className="font-medium text-red-500">
                        {sellTrades} ({((sellTrades / totalTrades) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Best Trade</span>
                      <span className="font-medium text-green-500">+$1,247.30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Worst Trade</span>
                      <span className="font-medium text-red-500">-$523.45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Trade P&L</span>
                      <span className="font-medium">+$156.78</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Risk Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Max Position Size</span>
                      <span className="font-medium">$28,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Hold Time</span>
                      <span className="font-medium">12.5 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk/Reward Ratio</span>
                      <span className="font-medium">1:2.3</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio vs Benchmark</CardTitle>
              <CardDescription>Your performance compared to S&P 500</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="portfolio"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      name="Your Portfolio"
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="#6b7280"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="S&P 500"
                      dot={{ fill: "#6b7280", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-sm">Your Portfolio (+8.0%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="text-sm">S&P 500 (+5.2%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
