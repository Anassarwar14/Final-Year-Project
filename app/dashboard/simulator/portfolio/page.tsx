"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Target, Activity } from "lucide-react"

// Mock portfolio data
const portfolioData = [
  { symbol: "AAPL", name: "Apple Inc.", quantity: 50, avgPrice: 170.25, currentPrice: 175.43, sector: "Technology" },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    quantity: 10,
    avgPrice: 2800.0,
    currentPrice: 2847.63,
    sector: "Technology",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    quantity: 25,
    avgPrice: 375.0,
    currentPrice: 378.85,
    sector: "Technology",
  },
  { symbol: "TSLA", name: "Tesla Inc.", quantity: 15, avgPrice: 260.0, currentPrice: 248.5, sector: "Automotive" },
  { symbol: "JPM", name: "JPMorgan Chase", quantity: 30, avgPrice: 145.5, currentPrice: 148.75, sector: "Financial" },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    quantity: 40,
    avgPrice: 162.0,
    currentPrice: 165.25,
    sector: "Healthcare",
  },
]

const sectorAllocation = [
  { name: "Technology", value: 65, color: "#10b981" },
  { name: "Financial", value: 15, color: "#3b82f6" },
  { name: "Healthcare", value: 12, color: "#8b5cf6" },
  { name: "Automotive", value: 8, color: "#f59e0b" },
]

const performanceData = [
  { date: "1M", value: 98500 },
  { date: "2M", value: 101200 },
  { date: "3M", value: 99800 },
  { date: "4M", value: 103500 },
  { date: "5M", value: 107200 },
  { date: "6M", value: 112800 },
]

export default function SimulatorPortfolio() {
  const [selectedTab, setSelectedTab] = useState("overview")

  const totalValue = portfolioData.reduce((sum, stock) => sum + stock.quantity * stock.currentPrice, 0)
  const totalCost = portfolioData.reduce((sum, stock) => sum + stock.quantity * stock.avgPrice, 0)
  const totalPnL = totalValue - totalCost
  const totalPnLPercent = (totalPnL / totalCost) * 100

  const virtualCash = 25000
  const totalPortfolioValue = totalValue + virtualCash

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalPortfolioValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Including ${virtualCash.toLocaleString()} cash</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invested Value</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {portfolioData.length} positions</p>
          </CardContent>
        </Card>
        <Card
          className={`bg-gradient-to-br ${totalPnL >= 0 ? "from-green-500/5 to-green-500/10 border-green-500/20" : "from-red-500/5 to-red-500/10 border-red-500/20"}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString()}
            </div>
            <p className={`text-xs ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totalPnLPercent >= 0 ? "+" : ""}
              {totalPnLPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Day Change</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+$1,247</div>
            <p className="text-xs text-green-500">+1.12%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
                <CardDescription>Portfolio distribution by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sectorAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {sectorAllocation.map((sector) => (
                    <div key={sector.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                      <span className="text-sm">
                        {sector.name} ({sector.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>6-month performance trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
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
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Positions</CardTitle>
              <CardDescription>Detailed view of all holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioData.map((stock) => {
                  const currentValue = stock.quantity * stock.currentPrice
                  const costBasis = stock.quantity * stock.avgPrice
                  const pnl = currentValue - costBasis
                  const pnlPercent = (pnl / costBasis) * 100

                  return (
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
                          <Badge variant="secondary" className="text-xs mt-1">
                            {stock.sector}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${currentValue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {stock.quantity} shares @ ${stock.currentPrice}
                        </div>
                        <div className={`text-sm font-medium ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ({pnlPercent.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Return</span>
                  <span className="font-semibold text-green-500">+12.8%</span>
                </div>
                <div className="flex justify-between">
                  <span>Annualized Return</span>
                  <span className="font-semibold">+25.6%</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Performing Stock</span>
                  <span className="font-semibold text-green-500">GOOGL (+1.7%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Worst Performing Stock</span>
                  <span className="font-semibold text-red-500">TSLA (-4.4%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Portfolio Beta</span>
                  <span className="font-semibold">1.15</span>
                </div>
                <div className="flex justify-between">
                  <span>Sharpe Ratio</span>
                  <span className="font-semibold">1.42</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Portfolio Volatility</span>
                  <span className="font-semibold">18.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Drawdown</span>
                  <span className="font-semibold text-red-500">-8.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>Value at Risk (95%)</span>
                  <span className="font-semibold">-$2,150</span>
                </div>
                <div className="flex justify-between">
                  <span>Correlation to S&P 500</span>
                  <span className="font-semibold">0.85</span>
                </div>
                <div className="flex justify-between">
                  <span>Diversification Score</span>
                  <span className="font-semibold text-yellow-500">6.2/10</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Current vs Target allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Stocks</span>
                      <span>82% (Target: 80%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "82%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Cash</span>
                      <span>18% (Target: 20%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "18%" }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rebalancing Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="font-medium text-yellow-700 dark:text-yellow-400">Technology Overweight</div>
                  <div className="text-sm text-muted-foreground">Consider reducing tech exposure by 5%</div>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="font-medium text-blue-700 dark:text-blue-400">Add International Exposure</div>
                  <div className="text-sm text-muted-foreground">Consider adding 10% international stocks</div>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="font-medium text-green-700 dark:text-green-400">Well Diversified</div>
                  <div className="text-sm text-muted-foreground">Good sector distribution overall</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
