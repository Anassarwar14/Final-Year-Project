"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Loader2 } from "lucide-react";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart, Bar, BarChart } from "recharts";

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

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json());

const PERIODS = [
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "1Y", value: 365 },
];

export default function PerformancePage() {
  const [days, setDays] = useState(365);
  const { data, isLoading } = useSWR<PerformanceResponse>(`/api/portfolio/performance?days=${days}`, fetcher);

  const snapshots = data?.snapshots || [];
  const startValue = Number(data?.startValue || 0);
  const currentValue = Number(data?.currentValue || 0);

  const totalReturn = startValue > 0 ? ((currentValue - startValue) / startValue) * 100 : 0;
  const isPositive = totalReturn >= 0;

  const chartData = snapshots.map((snap) => ({
    date: new Date(snap.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    portfolio: snap.totalValue,
  }));

  const monthlyReturns = useMemo(() => {
    const map = new Map<string, number>();
    snapshots.forEach((snap) => {
      const d = new Date(snap.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map.set(key, snap.totalValue);
    });

    const sorted = Array.from(map.entries()).sort((a, b) => (a[0] > b[0] ? 1 : -1));
    const rows: Array<{ month: string; return: number }> = [];

    for (let i = 1; i < sorted.length; i += 1) {
      const prev = sorted[i - 1][1];
      const curr = sorted[i][1];
      const month = new Date(`${sorted[i][0]}-01`).toLocaleDateString("en-US", { month: "short" });
      rows.push({ month, return: prev > 0 ? Number((((curr - prev) / prev) * 100).toFixed(2)) : 0 });
    }

    return rows;
  }, [snapshots]);

  const winRate = monthlyReturns.length
    ? (monthlyReturns.filter((m) => m.return > 0).length / monthlyReturns.length) * 100
    : 0;

  if (isLoading) {
    return (
      <SidebarInset>
        <div className="flex min-h-[500px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-chart-1/30 bg-gradient-to-r from-chart-1/10 via-transparent to-chart-3/10 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border" />
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Performance Studio</h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              size="sm"
              variant={days === p.value ? "default" : "outline"}
              className="h-8"
              onClick={() => setDays(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 bg-[radial-gradient(circle_at_90%_0%,_hsl(var(--chart-3)/0.15),_transparent_35%)] p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-chart-1/30 bg-card/90">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Return</CardTitle></CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}{totalReturn.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Period return</p>
            </CardContent>
          </Card>
          <Card className="border-chart-1/30 bg-card/90">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Start Value</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">${startValue.toLocaleString()}</div></CardContent>
          </Card>
          <Card className="border-chart-1/30 bg-card/90">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Current Value</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">${currentValue.toLocaleString()}</div></CardContent>
          </Card>
          <Card className="border-chart-1/30 bg-card/90">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Win Rate</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{winRate.toFixed(0)}%</div><p className="text-xs text-muted-foreground">Positive months</p></CardContent>
          </Card>
        </div>

        <Card className="border-chart-1/30 bg-card/90">
          <CardHeader>
            <CardTitle>Portfolio Curve</CardTitle>
            <CardDescription>Value movement across the selected range.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">No snapshots yet for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height={360}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Portfolio"]} />
                  <Area type="monotone" dataKey="portfolio" stroke="hsl(var(--primary))" fill="url(#perfGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-chart-1/30 bg-card/90">
          <CardHeader>
            <CardTitle>Monthly Return Bars</CardTitle>
            <CardDescription>Simple month-over-month return profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyReturns.length ? monthlyReturns : [{ month: "N/A", return: 0 }]}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Return"]} />
                <Bar dataKey="return" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
