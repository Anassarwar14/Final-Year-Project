"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight, ArrowDownRight, Calendar, BarChart3 } from "lucide-react"
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart, Bar, BarChart } from "recharts"

// Performance data for different time periods
const performanceData = {
  "1M": [
    { date: "Dec 1", portfolio: 52100, benchmark: 49800, drawdown: 0 },
    { date: "Dec 8", portfolio: 53200, benchmark: 50200, drawdown: -1.2 },
    { date: "Dec 15", portfolio: 52800, benchmark: 50800, drawdown: -2.1 },
    { date: "Dec 22", portfolio: 54100, benchmark: 51100, drawdown: -0.8 },
    { date: "Dec 29", portfolio: 58200, benchmark: 52900, drawdown: 0 },
  ],
  "3M": [
    { date: "Oct", portfolio: 48500, benchmark: 47200, drawdown: -3.2 },
    { date: "Nov", portfolio: 52100, benchmark: 49800, drawdown: -1.8 },
    { date: "Dec", portfolio: 58200, benchmark: 52900, drawdown: 0 },
  ],
  "1Y": [
    { date: "Jan", portfolio: 45000, benchmark: 44200, drawdown: -8.2 },
    { date: "Mar", portfolio: 46800, benchmark: 46200, drawdown: -6.1 },
    { date: "Jun", portfolio: 54300, benchmark: 51200, drawdown: -2.3 },
    { date: "Sep", portfolio: 56800, benchmark: 52900, drawdown: -1.1 },
    { date: "Dec", portfolio: 58200, benchmark: 52900, drawdown: 0 },
  ],
}

const monthlyReturns = [
  { month: "Jan", return: 2.1 },
  { month: "Feb", return: 5.6 },
  { month: "Mar", return: -1.5 },
  { month: "Apr", return: 5.1 },
  { month: "May", return: 5.9 },
  { month: "Jun", return: 4.2 },
  { month: "Jul", return: 4.6 },
  { month: "Aug", return: 2.5 },
  { month: "Sep", return: -2.1 },
  { month: "Oct", return: 3.8 },
  { month: "Nov", return: 7.4 },
  { month: "Dec", return: 11.7 },
]

const riskMetrics = [
  { metric: "Volatility", value: "18.4%", benchmark: "16.2%", status: "higher" },
  { metric: "Sharpe Ratio", value: "1.34", benchmark: "1.12", status: "higher" },
  { metric: "Beta", value: "1.12", benchmark: "1.00", status: "higher" },
  { metric: "Alpha", value: "3.8%", benchmark: "0.0%", status: "higher" },
  { metric: "Max Drawdown", value: "-8.2%", benchmark: "-12.1%", status: "lower" },
  { metric: "Calmar Ratio", value: "1.85", benchmark: "1.26", status: "higher" },
]

export default function PerformancePage() {
  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
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
                <SelectItem value="3Y">3 Years</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Calendar className="h-4 w-4" />
              Custom Range
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Performance Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+29.3%</div>
                <p className="text-xs text-muted-foreground">vs S&P 500: +20.1%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Annualized Return</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+15.2%</div>
                <p className="text-xs text-muted-foreground">vs S&P 500: +11.8%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Best Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+11.7%</div>
                <p className="text-xs text-muted-foreground">December 2024</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">83%</div>
                <p className="text-xs text-muted-foreground">10 of 12 months positive</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="performance" className="space-y-4">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="returns">Monthly Returns</TabsTrigger>
              <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio vs Benchmark Performance</CardTitle>
                  <CardDescription>Your portfolio compared to S&P 500 over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={performanceData["1Y"]}>
                      <defs>
                        <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          `$${value.toLocaleString()}`,
                          name === "portfolio" ? "Portfolio" : "S&P 500",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="portfolio"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#portfolioGradient)"
                        strokeWidth={3}
                      />
                      <Area
                        type="monotone"
                        dataKey="benchmark"
                        stroke="hsl(var(--muted-foreground))"
                        fillOpacity={1}
                        fill="url(#benchmarkGradient)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
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
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={monthlyReturns}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, "Return"]} />
                      <Bar dataKey="return" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Metrics</CardTitle>
                  <CardDescription>Portfolio risk analysis compared to benchmark</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {riskMetrics.map((metric) => (
                      <div key={metric.metric} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{metric.metric}</h4>
                          <Badge
                            variant={metric.status === "higher" ? "default" : "secondary"}
                            className={
                              metric.status === "higher" && metric.metric !== "Volatility" && metric.metric !== "Beta"
                                ? "bg-green-100 text-green-700"
                                : metric.status === "lower" && metric.metric === "Max Drawdown"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                            }
                          >
                            {metric.status === "higher" ? (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            )}
                            {metric.status}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">{metric.value}</div>
                        <div className="text-xs text-muted-foreground">Benchmark: {metric.benchmark}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drawdown" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Drawdown Analysis</CardTitle>
                  <CardDescription>Portfolio drawdown periods over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={performanceData["1Y"]}>
                      <defs>
                        <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, "Drawdown"]} />
                      <Area
                        type="monotone"
                        dataKey="drawdown"
                        stroke="hsl(var(--destructive))"
                        fillOpacity={1}
                        fill="url(#drawdownGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </>
  )
}
