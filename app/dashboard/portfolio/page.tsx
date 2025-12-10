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



