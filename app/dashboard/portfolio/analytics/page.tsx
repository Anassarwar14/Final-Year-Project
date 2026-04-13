"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BarChart3,
  Loader2,
  PieChart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

type Recommendation = {
  type: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low" | string;
  impact: string;
};

type AnalyticsPayload = {
  overview?: {
    score: number;
    riskLevel: string;
    diversification: number;
    efficiency: number;
  };
  sectorAllocation?: Array<{ name: string; value: number; target: number }>;
  riskAnalysis?: Array<{ category: string; score: number; status: string; description: string }>;
  performanceAttribution?: Array<{ factor: string; contribution: number }>;
  recommendations?: Recommendation[];
};

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json());

function priorityClass(priority: string) {
  const p = priority.toLowerCase();
  if (p === "high") return "bg-red-100 text-red-700";
  if (p === "medium") return "bg-yellow-100 text-yellow-700";
  if (p === "low") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-700";
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { data, isLoading, mutate } = useSWR<AnalyticsPayload>("/api/portfolio/analytics", fetcher, {
    refreshInterval: 60000,
  });

  const overview = data?.overview || {
    score: 0,
    riskLevel: "Unknown",
    diversification: 0,
    efficiency: 0,
  };

  const sectorAllocation = data?.sectorAllocation || [];
  const riskAnalysis = data?.riskAnalysis || [];
  const performanceAttribution = data?.performanceAttribution || [];
  const recommendations = data?.recommendations || [];

  const riskColor = useMemo(() => {
    const r = overview.riskLevel.toLowerCase();
    if (r === "high") return "text-red-600";
    if (r === "medium") return "text-yellow-600";
    return "text-green-600";
  }, [overview.riskLevel]);

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
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-chart-2/30 bg-gradient-to-r from-chart-2/10 via-transparent to-primary/10 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border" />
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Analytics Lab</h1>
          </div>
        </div>
        <div className="ml-auto px-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            onClick={async () => {
              await mutate();
              toast.success("Analytics refreshed");
            }}
          >
            <Zap className="h-4 w-4" />
            Recalculate
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 bg-[radial-gradient(circle_at_20%_20%,_hsl(var(--chart-2)/0.12),_transparent_35%),radial-gradient(circle_at_80%_0%,_hsl(var(--primary)/0.10),_transparent_30%)] p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-chart-2/30 bg-card/90">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Portfolio Score</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{overview.score}/10</div><p className="text-xs text-muted-foreground">Overall health</p></CardContent>
          </Card>
          <Card className="border-chart-2/30 bg-card/90">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Level</CardTitle></CardHeader>
            <CardContent><div className={`text-2xl font-bold ${riskColor}`}>{overview.riskLevel}</div><p className="text-xs text-muted-foreground">Current posture</p></CardContent>
          </Card>
          <Card className="border-chart-2/30 bg-card/90">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Diversification</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{overview.diversification}/10</div><p className="text-xs text-muted-foreground">Spread quality</p></CardContent>
          </Card>
          <Card className="border-chart-2/30 bg-card/90">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Efficiency</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{overview.efficiency}/10</div><p className="text-xs text-muted-foreground">Capital efficiency</p></CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-chart-2/30 bg-card/90">
            <CardHeader>
              <CardTitle>Sector Allocation vs Target</CardTitle>
              <CardDescription>Current weight compared to heuristic targets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectorAllocation.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sector data yet.</p>
              ) : (
                sectorAllocation.map((sector) => (
                  <div key={sector.name} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{sector.name}</span>
                      <span className="text-muted-foreground">{sector.value.toFixed(1)}% / {sector.target.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, sector.value)}%` }} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-chart-2/30 bg-card/90">
            <CardHeader>
              <CardTitle>Risk Diagnostics</CardTitle>
              <CardDescription>Concentration, diversification, and return volatility checks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskAnalysis.length === 0 ? (
                <p className="text-sm text-muted-foreground">No risk diagnostics yet.</p>
              ) : (
                riskAnalysis.map((risk) => (
                  <div key={risk.category} className="rounded-lg border p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">{risk.category}</span>
                      </div>
                      <Badge variant="outline">{risk.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{risk.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-chart-2/30 bg-card/90">
          <CardHeader>
            <CardTitle>Performance Attribution</CardTitle>
            <CardDescription>Approximate factor contributions to portfolio return.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={performanceAttribution}>
                <XAxis dataKey="factor" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, "Contribution"]} />
                <Bar dataKey="contribution" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-chart-2/30 bg-card/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Actionable suggestions generated from portfolio structure and risk profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <Sparkles className="mx-auto mb-2 h-5 w-5" />
                No recommendations available right now.
              </div>
            ) : (
              recommendations.map((rec, idx) => (
                <div key={`${rec.title}-${idx}`} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {rec.type === "rebalance" && <BarChart3 className="h-4 w-4 text-primary" />}
                      {rec.type === "diversify" && <PieChart className="h-4 w-4 text-primary" />}
                      {rec.type === "opportunity" && <TrendingUp className="h-4 w-4 text-primary" />}
                      {! ["rebalance", "diversify", "opportunity"].includes(rec.type) && (
                        <Zap className="h-4 w-4 text-primary" />
                      )}
                      <h4 className="font-medium">{rec.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={priorityClass(rec.priority)}>{rec.priority}</Badge>
                      <Badge variant="secondary">{rec.impact}</Badge>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">{rec.description}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (rec.type === "rebalance") router.push("/dashboard/portfolio/holdings");
                        else if (rec.type === "diversify") router.push("/dashboard/portfolio");
                        else router.push("/dashboard/portfolio/performance");
                      }}
                    >
                      View Context
                    </Button>
                    <Button
                      size="sm"
                      onClick={async () => {
                        const prompt = `${rec.title}: ${rec.description}. Give me a concrete action plan with allocations.`;
                        await navigator.clipboard.writeText(prompt);
                        toast.success("Recommendation prompt copied. Opening advisor chat.");
                        router.push("/dashboard/chat");
                      }}
                    >
                      Send To Advisor
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
