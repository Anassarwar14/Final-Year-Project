"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Activity, Search, BarChart3, Building2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, Bar } from "recharts";
import { TradingChart } from "@/components/trading/TradingChart";
import { OrderPanel } from "@/components/trading/OrderPanel";
import { StockSearchCommand } from "@/components/trading/StockSearchCommand";
import { AnalystRecommendations } from "@/components/trading/AnalystRecommendations";
import { CompanyInfo } from "@/components/trading/CompanyInfo";
import { RealtimeQuote } from "@/components/trading/RealtimeQuote";
import { SimulatorHoldingsTable } from "@/components/trading/SimulatorHoldingsTable";
import { CompanyNews } from "@/components/trading/CompanyNews";
import { SECFilings } from "@/components/trading/SECFilings";
import { EarningsInfo } from "@/components/trading/EarningsInfo";
import { FinancialsAsReported } from "@/components/trading/FinancialsAsReported";
import { PendingOrders } from "@/components/trading/PendingOrders";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TradingSimulator() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [searchOpen, setSearchOpen] = useState(false);

  // Fetch profile data with holdings
  const { data: profileData, mutate: mutateProfile } = useSWR("/api/trading/simulator/profile", fetcher, {
    refreshInterval: 30000, // 30 seconds instead of 15
  });

  // Fetch holdings separately for real-time prices
  const { data: holdingsData } = useSWR("/api/trading/simulator/holdings", fetcher, {
    refreshInterval: 30000, // 30 seconds instead of 10
  });

  // Fetch market status
  const { data: marketStatus } = useSWR("/api/trading/market/market-status", fetcher, {
    refreshInterval: 120000, // Check every 2 minutes instead of 1
  });

  // Fetch performance data
  const { data: performanceData } = useSWR("/api/portfolio/performance?days=7", fetcher, {
    refreshInterval: 300000, // 5 minutes
  });

  // Fetch current quote with auto-refresh
  const { data: quoteData } = useSWR(
    `/api/trading/market/quote/${selectedSymbol}`,
    fetcher,
    {
      refreshInterval: 30000, // 30 seconds instead of 15
      revalidateOnFocus: false, // Don't refetch on tab focus
      revalidateOnReconnect: false, // Don't refetch on reconnect
    }
  );

  // Initialize profile if needed
  useEffect(() => {
    if (profileData?.profile === null) {
      fetch("/api/trading/simulator/initialize", { method: "POST" })
        .then(() => mutateProfile())
        .catch(console.error);
    }
  }, [profileData, mutateProfile]);

  // Keyboard shortcut for search (CMD/CTRL + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const profile = profileData?.profile;
  const holdings = holdingsData?.holdings || profile?.holdings || [];
  const isMarketOpen = marketStatus?.isOpen || false;

  const balance = profile?.virtualBalance || 0;
  const totalValue = profile?.totalValue || 0;
  const holdingsValue = profile?.holdingsValue || 0;
  const startingBalance = 100000; // Initial simulator balance
  const totalPnL = totalValue - startingBalance;
  const totalPnLPercent = ((totalValue - startingBalance) / startingBalance) * 100;

  const handleTradeExecuted = () => {
    mutateProfile();
  };

  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleResetPortfolio = async () => {
    if (!confirm("Are you sure you want to reset your portfolio? This will reset your balance to $100,000 and clear all holdings. This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await fetch("/api/trading/simulator/reset", { method: "POST" });
      if (response.ok) {
        mutateProfile();
        alert("Portfolio reset successfully!");
      } else {
        alert("Failed to reset portfolio");
      }
    } catch (error) {
      console.error("Error resetting portfolio:", error);
      alert("Failed to reset portfolio");
    }
  };

  return (
    <div className="relative flex-1">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-amber-500/10 via-yellow-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Top Navigation Bar - Investopedia Style */}
      <div className="bg-card/80 backdrop-blur-sm border-b">
        <Tabs defaultValue="portfolio" className="w-full">
          <div className="flex items-center justify-between border-b px-4">
            <TabsList className="h-14 bg-transparent border-0">
              <TabsTrigger 
                value="portfolio" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                PORTFOLIO
              </TabsTrigger>
              <TabsTrigger 
                value="trade" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6"
              >
                <Activity className="h-4 w-4 mr-2" />
                TRADE
              </TabsTrigger>
              <TabsTrigger 
                value="research" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6"
              >
                <Building2 className="h-4 w-4 mr-2" />
                RESEARCH
              </TabsTrigger>
            </TabsList>
            <Button onClick={() => setSearchOpen(true)} variant="outline" size="sm" className="gap-2">
              <Search className="h-4 w-4" />
              Search
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </Button>
          </div>

          {/* PORTFOLIO TAB */}
          <TabsContent value="portfolio" className="m-0 p-6 space-y-6">
            {/* Simulator Header Badge */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3 font-heading">
                  <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-500 dark:from-amber-400 dark:via-yellow-400 dark:to-amber-300 bg-clip-text text-transparent">
                    Trading Simulator
                  </span>
                  <span className="text-sm font-normal px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-sans">
                    Practice Mode
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground mt-2">Learn trading with virtual money - No real capital at risk</p>
              </div>
            </div>

            {/* Market Status Banner */}
            {!isMarketOpen && (
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 text-center shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Market is Closed
                    {marketStatus?.nextOpen && <span className="mx-2">•</span>}
                    {marketStatus?.nextOpen && <span className="font-semibold">Opens: {marketStatus.nextOpen}</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Account Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-amber-500/20 bg-gradient-to-br from-card via-card to-amber-50/30 dark:to-amber-950/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground font-heading">Virtual Account Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-numeric bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {balance < 100 && holdingsValue < 100 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={handleResetPortfolio}
                        className="h-auto p-0 text-xs text-primary hover:underline"
                      >
                        Reset Portfolio →
                      </Button>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20 bg-gradient-to-br from-card via-card to-green-50/20 dark:to-green-950/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground font-heading">Total Profit/Loss</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold font-numeric ${
                    totalPnL >= 0 
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400" 
                      : "bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400"
                  } bg-clip-text text-transparent`}>
                    {totalPnL >= 0 ? "+" : ""}${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <p className={`text-xs mt-1 font-numeric ${
                    totalPnL >= 0 ? "text-positive" : "text-negative"
                  }`}>
                    ({totalPnL >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%) Since Start
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-50/20 dark:to-blue-950/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground font-heading">Buying Power</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-numeric bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <p className="text-xs text-muted-foreground mt-1">Available Cash</p>
                </CardContent>
              </Card>

              <Card className="border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-50/20 dark:to-purple-950/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground font-heading">Return on Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold font-numeric ${
                    totalPnL >= 0
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400"
                      : "bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400"
                  } bg-clip-text text-transparent`}>
                    {totalPnL >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">From $100,000 start</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card className="border-amber-500/20">
              <CardHeader>
                <CardTitle>Performance History</CardTitle>
                <p className="text-sm text-muted-foreground">7 Day Simulated Performance</p>
              </CardHeader>
              <CardContent>
                {performanceData?.snapshots && performanceData.snapshots.length > 0 ? (
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={performanceData.snapshots.map((s:any, i:number, arr:any[]) => ({
                          ...s,
                          date: s.createdAt,
                          pnl: i === 0 ? 0 : (s.totalValue - arr[i-1].totalValue),
                        }))}
                      >
                        <defs>
                          <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          className="text-xs"
                        />
                        <YAxis
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          className="text-xs"
                          domain={[('dataMin'), ('dataMax')]}
                        />
                        <Tooltip
                          formatter={(value:any, name:any) => {
                            if (name === 'totalValue') return [`$${Number(value).toFixed(2)}`, 'Value'];
                            if (name === 'pnl') return [`$${Number(value).toFixed(2)}`, 'Daily PnL'];
                            return [value, name];
                          }}
                          labelFormatter={(label) => new Date(label as any).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        />
                        {/* Area for total value */}
                        <Area
                          type="monotone"
                          dataKey="totalValue"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill="url(#valueGradient)"
                        />
                        {/* Bars for daily PnL with conditional color */}
                        <Bar
                          dataKey="pnl"
                          barSize={8}
                          radius={[4, 4, 0, 0]}
                          fill="#22c55e"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground space-y-2">
                    <BarChart3 className="h-12 w-12 opacity-20" />
                    <p className="text-sm">Portfolio performance tracking</p>
                    <p className="text-xs">Data available after making trades</p>
                  </div>
                )}
              </CardContent>
            </Card>

              {/* Holdings Table */}
              <SimulatorHoldingsTable holdings={holdings} onTradeClick={handleSelectStock} />

              {/* Pending Orders */}
              <PendingOrders />
          </TabsContent>

          {/* TRADE TAB */}
          <TabsContent value="trade" className="m-0 p-6 space-y-6">
            {/* Market Status Banner - Always Visible */}
            <div className={`${
              isMarketOpen 
                ? "bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-green-950/20 border-green-200 dark:border-green-900" 
                : "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 border-amber-200 dark:border-amber-900"
            } border rounded-lg p-4 flex items-center justify-between shadow-sm`}>
              <div className="flex items-center gap-3">
                {isMarketOpen ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-positive"></span>
                  </span>
                ) : (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
                <span className={`text-sm font-bold bg-gradient-to-r ${
                  isMarketOpen 
                    ? "from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400" 
                    : "from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400"
                } bg-clip-text text-transparent`}>
                  {isMarketOpen ? "Market is LIVE" : "Market is CLOSED"}
                </span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {isMarketOpen 
                  ? marketStatus?.nextClose ? `Closes: ${marketStatus.nextClose}` : "Live trading active"
                  : marketStatus?.nextOpen && `Opens: ${marketStatus.nextOpen}`
                }
              </span>
            </div>

            {/* Stock Header with Logo and Real-time Quote */}
            <div className="flex items-center justify-between">
              <RealtimeQuote symbol={selectedSymbol} showLogo={true} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TradingChart symbol={selectedSymbol} />
              </div>

              <div>
                <OrderPanel
                  symbol={selectedSymbol}
                  currentPrice={quoteData?.quote?.c || 0}
                  balance={balance}
                  onTradeExecuted={handleTradeExecuted}
                  isMarketOpen={isMarketOpen}
                  holdings={holdings}
                />
              </div>
            </div>
          </TabsContent>

          {/* RESEARCH TAB */}
          <TabsContent value="research" className="m-0 p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{selectedSymbol}</h1>
                <p className="text-muted-foreground">Company Analysis & Research</p>
              </div>
            </div>

            {/* Company Overview */}
            <div className="grid gap-6 md:grid-cols-2">
              <CompanyInfo symbol={selectedSymbol} />
              <AnalystRecommendations symbol={selectedSymbol} />
            </div>

            {/* Earnings & Filings */}
            <div className="grid gap-6 md:grid-cols-2">
              <EarningsInfo symbol={selectedSymbol} />
              <SECFilings symbol={selectedSymbol} />
            </div>

            {/* Financials & News */}
            <div className="grid gap-6 md:grid-cols-2">
              <FinancialsAsReported symbol={selectedSymbol} />
              <CompanyNews symbol={selectedSymbol} limit={5} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <StockSearchCommand open={searchOpen} onOpenChange={setSearchOpen} onSelectStock={handleSelectStock} />
    </div>
  );
}
