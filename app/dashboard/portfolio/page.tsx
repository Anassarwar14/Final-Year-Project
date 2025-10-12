"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  PiIcon as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  RefreshCw,
} from "lucide-react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts"

// Mock portfolio data
const portfolioData = [
  { month: "Jan", value: 45000, benchmark: 44200 },
  { month: "Feb", value: 47500, benchmark: 45800 },
  { month: "Mar", value: 46800, benchmark: 46200 },
  { month: "Apr", value: 49200, benchmark: 47500 },
  { month: "May", value: 52100, benchmark: 49800 },
  { month: "Jun", value: 54300, benchmark: 51200 },
  { month: "Jul", value: 56800, benchmark: 52900 },
  { month: "Aug", value: 58200, benchmark: 54100 },
]

const assetAllocation = [
  { name: "Stocks", value: 65, amount: 37440, color: "hsl(var(--chart-1))" },
  { name: "Bonds", value: 20, amount: 11520, color: "hsl(var(--chart-2))" },
  { name: "ETFs", value: 10, amount: 5760, color: "hsl(var(--chart-3))" },
  { name: "Cash", value: 5, amount: 2880, color: "hsl(var(--chart-4))" },
]

const topHoldings = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 50, price: 185.92, value: 9296, change: 2.34, changePercent: 1.27 },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    shares: 40,
    price: 378.85,
    value: 15154,
    change: 5.67,
    changePercent: 1.52,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 25,
    price: 142.56,
    value: 3564,
    change: -1.23,
    changePercent: -0.86,
  },
  { symbol: "TSLA", name: "Tesla Inc.", shares: 30, price: 248.5, value: 7455, change: 8.92, changePercent: 3.72 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 15, price: 875.28, value: 13129, change: 12.45, changePercent: 1.44 },
]

const recentTransactions = [
  { type: "buy", symbol: "AAPL", shares: 10, price: 185.92, date: "2024-01-15", total: 1859.2 },
  { type: "sell", symbol: "META", shares: 5, price: 352.48, date: "2024-01-14", total: 1762.4 },
  { type: "buy", symbol: "NVDA", shares: 3, price: 875.28, date: "2024-01-12", total: 2625.84 },
  { type: "dividend", symbol: "MSFT", shares: 40, price: 0.75, date: "2024-01-10", total: 30.0 },
]

const performanceMetrics = [
  { label: "Total Return", value: "28.4%", change: "+2.1%", trend: "up" },
  { label: "Annual Return", value: "15.2%", change: "+0.8%", trend: "up" },
  { label: "Sharpe Ratio", value: "1.34", change: "+0.05", trend: "up" },
  { label: "Max Drawdown", value: "-8.2%", change: "-1.1%", trend: "down" },
  { label: "Beta", value: "1.12", change: "+0.02", trend: "up" },
  { label: "Alpha", value: "3.8%", change: "+0.4%", trend: "up" },
]


// https://jch.app/u/paverbrick
// https://github.com/MuhammadAmir5670/psx-data-reader/
export default function PortfolioPage() {
  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Portfolio Overview</h1>
            </div>
          </div>
          <div className="ml-auto px-4 flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Sync Data
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Position
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Portfolio Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$58,200</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +$3,900 (+7.2%) this month
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Change</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+$1,240</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +2.18% today
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+$13,200</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +29.3% total return
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
                <PieIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Across 4 asset classes</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Portfolio Performance Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>Your portfolio vs S&P 500 benchmark</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={portfolioData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `$${value.toLocaleString()}`,
                        name === "value" ? "Portfolio" : "S&P 500",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="benchmark"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Distribution of your investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={assetAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {assetAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Allocation"]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {assetAllocation.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.value}% • ${item.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Top Holdings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Holdings</CardTitle>
                <CardDescription>Your largest positions by value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topHoldings.map((holding) => (
                    <div
                      key={holding.symbol}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{holding.symbol}</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{holding.symbol}</div>
                          <div className="text-xs text-muted-foreground">{holding.shares} shares</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${holding.value.toLocaleString()}</div>
                        <div
                          className={`text-xs flex items-center gap-1 ${
                            holding.changePercent > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {holding.changePercent > 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {holding.changePercent > 0 ? "+" : ""}
                          {holding.changePercent}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            transaction.type === "buy"
                              ? "bg-green-100 text-green-700"
                              : transaction.type === "sell"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {transaction.type === "buy" ? "B" : transaction.type === "sell" ? "S" : "D"}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {transaction.type === "dividend"
                              ? "Dividend"
                              : transaction.type === "buy"
                                ? "Bought"
                                : "Sold"}{" "}
                            {transaction.symbol}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.shares} shares • {transaction.date}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-medium text-sm ${
                            transaction.type === "buy" ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {transaction.type === "buy" ? "-" : "+"}${transaction.total.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">${transaction.price.toFixed(2)}/share</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key portfolio performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.label} className="text-center p-4 rounded-lg border">
                    <div className="text-2xl font-bold mb-1">{metric.value}</div>
                    <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
                    <div
                      className={`text-xs flex items-center justify-center gap-1 ${
                        metric.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {metric.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {metric.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  )
}
