"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Target, PieChart, Activity, Zap, Shield, Loader2 } from "lucide-react"
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"
import useSWR from "swr"

// 1. Define Fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper for chart colors (UI state usually stays on client)
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function AnalyticsPage() {
  // 2. Fetch Data from API
  const { data, isLoading } = useSWR("/api/portfolio/analytics", fetcher, {
    refreshInterval: 60000, // Refresh every minute
  });

  // 3. Helper functions for UI styling
  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-600"
    if (score < 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getRiskBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "low": return "bg-green-100 text-green-700"
      case "medium": return "bg-yellow-100 text-yellow-700"
      case "high": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-100 text-red-700"
      case "medium": return "bg-yellow-100 text-yellow-700"
      case "low": return "bg-green-100 text-green-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  // 4. Loading State
  if (isLoading) {
    return (
      <SidebarInset>
        <div className="flex items-center justify-center h-full min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SidebarInset>
    );
  }

  // 5. Data Processing / Defaults
  // We sanitize the data here to ensure the UI doesn't crash if DB is empty
  const overview = data?.overview || {
    score: 0,
    riskLevel: "Unknown",
    diversification: 0,
    efficiency: 0
  };

  const sectorAllocation = (data?.sectorAllocation || []).map((item: any, index: number) => ({
    name: item.name || "Unknown",
    value: item.value || 0,
    target: item.target || 0,
    color: CHART_COLORS[index % CHART_COLORS.length] // Assign colors dynamically
  }));

  const riskAnalysis = data?.riskAnalysis || [];
  const performanceAttribution = data?.performanceAttribution || [];
  const recommendations = data?.recommendations || [];

  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Portfolio Analytics</h1>
            </div>
          </div>
          <div className="ml-auto px-4 flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Zap className="h-4 w-4" />
              Run Analysis
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Analytics Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{overview.score}/10</div>
                <p className="text-xs text-muted-foreground">Overall health score</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                    overview.riskLevel.toLowerCase() === 'high' ? 'text-red-600' : 
                    overview.riskLevel.toLowerCase() === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                    {overview.riskLevel}
                </div>
                <p className="text-xs text-muted-foreground">Current profile</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Diversification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{overview.diversification}/10</div>
                <p className="text-xs text-muted-foreground">Asset spread score</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{overview.efficiency}/10</div>
                <p className="text-xs text-muted-foreground">Allocation efficiency</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Sector Allocation vs Target */}
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation vs Target</CardTitle>
                <CardDescription>Current allocation compared to target weights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sectorAllocation.map((sector: any) => (
                    <div key={sector.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{sector.name}</span>
                        <span className="text-muted-foreground">
                          {sector.value}% / {sector.target}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Progress value={sector.value} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Current: {sector.value}%</span>
                          <span className={sector.value > sector.target ? "text-red-600" : "text-green-600"}>
                            {sector.value > sector.target ? "+" : ""}
                            {(sector.value - sector.target).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>Portfolio risk breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {riskAnalysis.map((risk: any) => (
                    <div key={risk.category} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{risk.category}</h4>
                          <Badge className={getRiskBadgeColor(risk.status)}>{risk.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{risk.description}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRiskColor(risk.score)}`}>{risk.score}</div>
                        <div className="text-xs text-muted-foreground">Risk Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Attribution */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Attribution</CardTitle>
              <CardDescription>Breakdown of portfolio performance by contributing factors</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceAttribution} layout="horizontal">
                  <XAxis type="number" />
                  <YAxis dataKey="factor" type="category" width={120} />
                  <Tooltip formatter={(value) => [`${value}%`, "Contribution"]} />
                  <Bar dataKey="contribution" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Personalized suggestions to optimize your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4">No recommendations available at this time.</div>
                ) : (
                    recommendations.map((rec: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                            {rec.type === "rebalance" && <BarChart3 className="h-4 w-4 text-primary" />}
                            {rec.type === "diversify" && <PieChart className="h-4 w-4 text-primary" />}
                            {rec.type === "risk" && <Shield className="h-4 w-4 text-primary" />}
                            {rec.type === "opportunity" && <TrendingUp className="h-4 w-4 text-primary" />}
                            {/* Fallback icon */}
                            {!["rebalance", "diversify", "risk", "opportunity"].includes(rec.type) && <Zap className="h-4 w-4 text-primary" />}
                            </div>
                            <h4 className="font-medium">{rec.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                            </Badge>
                            <Badge variant="secondary">{rec.impact} Impact</Badge>
                        </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                        <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-transparent">
                            View Details
                        </Button>
                        <Button size="sm">Apply Suggestion</Button>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  )
}