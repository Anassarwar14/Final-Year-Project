"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Calendar } from "lucide-react";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart, Bar, BarChart } from "recharts";

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json());

type Snapshot = {
  createdAt: string;
  totalValue: number;
  holdings: number;
  cash: number;
};

type PerformanceResponse = {
  snapshots: Snapshot[];
  startValue: number;
  currentValue: number;
  period: number;
};

export default function PerformancePage() {
  const { data } = useSWR<PerformanceResponse>("/api/portfolio/performance?days=365", fetcher);

  const snapshots = data?.snapshots || [];
  const startValue = data?.startValue || 0;
  const currentValue = data?.currentValue || 0;

  const totalReturn = startValue > 0 ? ((currentValue - startValue) / startValue) * 100 : 0;
  const annualizedReturn = totalReturn;

  const chartData = snapshots.map((snap) => ({
    date: new Date(snap.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    portfolio: snap.totalValue,
  }));

  const monthlyReturns = useMemo(() => {
    const map = new Map<string, number>();
    snapshots.forEach((snap) => {
      const date = new Date(snap.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      map.set(key, snap.totalValue);
    });

    const ordered = Array.from(map.entries())
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => (a.key > b.key ? 1 : -1));

    const returns: { month: string; return: number }[] = [];
    for (let i = 1; i < ordered.length; i += 1) {
      const prev = ordered[i - 1];
      const curr = ordered[i];
      const label = new Date(`${curr.key}-01`).toLocaleDateString("en-US", { month: "short" });
      const pct = prev.value > 0 ? ((curr.value - prev.value) / prev.value) * 100 : 0;
      returns.push({ month: label, return: Number(pct.toFixed(2)) });
    }
    return returns;
  }, [snapshots]);

  const hasMonthlyReturns = monthlyReturns.length > 0;
  const monthlyReturnsData = hasMonthlyReturns
    ? monthlyReturns
    : [{ month: new Date().toLocaleDateString("en-US", { month: "short" }), return: 0 }];

  const winRate = monthlyReturns.length
    ? (monthlyReturns.filter((m) => m.return > 0).length / monthlyReturns.length) * 100
    : 0;

  const bestMonth = monthlyReturns.reduce(
    (best, item) => (item.return > best.return ? item : best),
    { month: "N/A", return: 0 }
  );

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border" />
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Performance Analysis</h1>
          </div>
        </div>
        <div className="ml-auto px-4 flex items-center gap-2">
          <Select defaultValue="1Y">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Period return</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Annualized Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${annualizedReturn >= 0 ? "text-green-600" : "text-red-600"}`}>
                {annualizedReturn >= 0 ? "+" : ""}{annualizedReturn.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Annualized</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Best Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{bestMonth.return.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">{bestMonth.month}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{winRate.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">Positive months</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="returns">Monthly Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>Portfolio value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Portfolio"]} />
                    <Area
                      type="monotone"
                      dataKey="portfolio"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#portfolioGradient)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Returns</CardTitle>
                <CardDescription>Month-by-month performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {!hasMonthlyReturns && (
                  <div className="text-xs text-muted-foreground mb-4">
                    Monthly returns will appear after multiple snapshots are recorded.
                  </div>
                )}
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthlyReturnsData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, "Return"]} />
                    <Bar dataKey="return" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  );
}
