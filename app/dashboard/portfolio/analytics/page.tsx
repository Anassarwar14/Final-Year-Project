"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Target, PieChart, Activity, Zap, Shield } from "lucide-react"
import { ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"

// Analytics data
const sectorAllocation = [
  { name: "Technology", value: 45.2, target: 40, color: "hsl(var(--chart-1))" },
  { name: "Financial Services", value: 15.8, target: 20, color: "hsl(var(--chart-2))" },
  { name: "Healthcare", value: 12.3, target: 15, color: "hsl(var(--chart-3))" },
  { name: "Consumer Discretionary", value: 18.7, target: 15, color: "hsl(var(--chart-4))" },
  { name: "Energy", value: 8.0, target: 10, color: "hsl(var(--chart-5))" },
]

const riskAnalysis = [
  { category: "Concentration Risk", score: 75, status: "medium", description: "High concentration in tech sector" },
  { category: "Volatility Risk", score: 68, status: "medium", description: "Moderate portfolio volatility" },
  { category: "Correlation Risk", score: 82, status: "high", description: "High correlation between holdings" },
  { category: "Liquidity Risk", score: 25, status: "low", description: "All holdings are highly liquid" },
  { category: "Currency Risk", score: 15, status: "low", description: "Minimal foreign exposure" },
]

const recommendations = [
  {
    type: "rebalance",
    title: "Rebalance Technology Allocation",
    description: "Your tech allocation is 5.2% above target. Consider reducing exposure.",
    impact: "Medium",
    priority: "High",
  },
  {
    type: "diversify",
    title: "Increase Healthcare Exposure",
    description: "Healthcare sector is underweight by 2.7%. Consider adding positions.",
    impact: "Low",
    priority: "Medium",
  },
  {
    type: "risk",
    title: "Reduce Correlation Risk",
    description: "Consider adding uncorrelated assets to reduce portfolio correlation.",
    impact: "High",
    priority: "High",
  },
  {
    type: "opportunity",
    title: "Energy Sector Opportunity",
    description: "Energy sector showing strong fundamentals. Consider increasing allocation.",
    impact: "Medium",
    priority: "Low",
  },
]

const performanceAttribution = [
  { factor: "Stock Selection", contribution: 3.2 },
  { factor: "Sector Allocation", contribution: 1.8 },
  { factor: "Market Timing", contribution: -0.5 },
  { factor: "Currency Effect", contribution: 0.1 },
  { factor: "Other", contribution: 0.4 },
]

export default function AnalyticsPage() {
  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-600"
    if (score < 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getRiskBadgeColor = (status: string) => {
    switch (status) {
      case "low":
        return "bg-green-100 text-green-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "high":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700"
      case "Medium":
        return "bg-yellow-100 text-yellow-700"
      case "Low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

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
                <div className="text-2xl font-bold text-green-600">8.2/10</div>
                <p className="text-xs text-muted-foreground">Above average performance</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">Medium</div>
                <p className="text-xs text-muted-foreground">Balanced risk profile</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Diversification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">6.5/10</div>
                <p className="text-xs text-muted-foreground">Room for improvement</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">9.1/10</div>
                <p className="text-xs text-muted-foreground">Highly efficient allocation</p>
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
                  {sectorAllocation.map((sector) => (
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
                  {riskAnalysis.map((risk) => (
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
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {rec.type === "rebalance" && <BarChart3 className="h-4 w-4 text-primary" />}
                          {rec.type === "diversify" && <PieChart className="h-4 w-4 text-primary" />}
                          {rec.type === "risk" && <Shield className="h-4 w-4 text-primary" />}
                          {rec.type === "opportunity" && <TrendingUp className="h-4 w-4 text-primary" />}
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  )
}
