"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw, Loader2 } from "lucide-react";
import { PortfolioChart } from "@/components/portfolio/PortfolioChart";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { SectorAllocation } from "@/components/portfolio/SectorAllocation";
import useSWR from "swr";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PortfolioPage() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch portfolio overview
  const { data: portfolioData, mutate, isLoading } = useSWR("/api/portfolio/overview", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch performance data
  const { data: performanceData } = useSWR("/api/portfolio/performance?days=30", fetcher);

  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleTradeClick = (symbol: string) => {
    router.push(`/dashboard/simulator?symbol=${symbol}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const portfolio = portfolioData?.profile;
  const holdings = portfolioData?.holdings || [];
  const analytics = portfolioData?.analytics;
  const snapshots = performanceData?.snapshots || [];
  
  const totalValue = portfolio?.totalValue || 0;
  const cashBalance = portfolio?.cashBalance || 0;
  const investedValue = portfolio?.investedValue || 0;
  const totalPnL = analytics?.totalUnrealizedPnL || 0;
  const totalPnLPercent = analytics?.totalUnrealizedPnLPercent || 0;

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">Track your investments and performance</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cash + Holdings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((cashBalance / totalValue) * 100).toFixed(1)}% of portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invested</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${investedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {holdings.length} positions
            </p>
          </CardContent>
        </Card>

        <Card className={totalPnL >= 0 ? "border-positive/30" : "border-negative/30"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-positive" />
            ) : (
              <TrendingDown className="h-4 w-4 text-negative" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-positive" : "text-negative"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className={`text-xs mt-1 ${totalPnL >= 0 ? "text-positive" : "text-negative"}`}>
              {totalPnL >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        <PortfolioChart
          snapshots={snapshots}
          startValue={performanceData?.startValue || totalValue}
          currentValue={performanceData?.currentValue || totalValue}
        />
        <SectorAllocation allocation={analytics?.sectorAllocation || {}} />
      </div>

      {/* Holdings Table */}
      <HoldingsTable holdings={holdings} onTradeClick={handleTradeClick} />
    </div>
  );
}
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
