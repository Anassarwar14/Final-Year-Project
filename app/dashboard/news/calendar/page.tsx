"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, TrendingUp, AlertCircle, Star, Bell } from "lucide-react"

// Mock economic calendar data
const economicEvents = [
  {
    id: 1,
    date: "2024-01-16",
    time: "08:30",
    event: "Consumer Price Index (CPI)",
    country: "US",
    importance: "High",
    forecast: "3.2%",
    previous: "3.1%",
    actual: null,
    impact: "USD",
    description: "Measures the change in the price of goods and services purchased by consumers",
  },
  {
    id: 2,
    date: "2024-01-16",
    time: "10:00",
    event: "Federal Reserve Chair Speech",
    country: "US",
    importance: "High",
    forecast: null,
    previous: null,
    actual: null,
    impact: "USD",
    description: "Jerome Powell speaks at the Economic Club of New York",
  },
  {
    id: 3,
    date: "2024-01-17",
    time: "08:30",
    event: "Retail Sales",
    country: "US",
    importance: "Medium",
    forecast: "0.4%",
    previous: "0.3%",
    actual: null,
    impact: "USD",
    description: "Measures the change in the total value of sales at the retail level",
  },
  {
    id: 4,
    date: "2024-01-17",
    time: "14:00",
    event: "Industrial Production",
    country: "US",
    importance: "Medium",
    forecast: "0.2%",
    previous: "0.1%",
    actual: null,
    impact: "USD",
    description: "Measures the change in the total inflation-adjusted value of output",
  },
  {
    id: 5,
    date: "2024-01-18",
    time: "08:30",
    event: "Initial Jobless Claims",
    country: "US",
    importance: "Medium",
    forecast: "210K",
    previous: "202K",
    actual: null,
    impact: "USD",
    description: "Measures the number of people filing for unemployment benefits for the first time",
  },
  {
    id: 6,
    date: "2024-01-18",
    time: "10:00",
    event: "Existing Home Sales",
    country: "US",
    importance: "Low",
    forecast: "3.95M",
    previous: "3.82M",
    actual: null,
    impact: "USD",
    description: "Measures the change in the number of existing homes sold",
  },
  {
    id: 7,
    date: "2024-01-19",
    time: "08:30",
    event: "Philadelphia Fed Manufacturing Index",
    country: "US",
    importance: "Medium",
    forecast: "8.5",
    previous: "7.6",
    actual: null,
    impact: "USD",
    description: "Measures the relative level of general business conditions in Philadelphia",
  },
]

const earningsCalendar = [
  {
    symbol: "NFLX",
    company: "Netflix Inc.",
    date: "2024-01-18",
    time: "After Market Close",
    estimate: "$2.18",
    quarter: "Q4 2023",
    importance: "High",
  },
  {
    symbol: "TSLA",
    company: "Tesla Inc.",
    date: "2024-01-24",
    time: "After Market Close",
    estimate: "$0.74",
    quarter: "Q4 2023",
    importance: "High",
  },
  {
    symbol: "MSFT",
    company: "Microsoft Corp.",
    date: "2024-01-24",
    time: "After Market Close",
    estimate: "$2.78",
    quarter: "Q2 2024",
    importance: "High",
  },
  {
    symbol: "AAPL",
    company: "Apple Inc.",
    date: "2024-02-01",
    time: "After Market Close",
    estimate: "$2.11",
    quarter: "Q1 2024",
    importance: "High",
  },
  {
    symbol: "AMZN",
    company: "Amazon.com Inc.",
    date: "2024-02-01",
    time: "After Market Close",
    estimate: "$0.81",
    quarter: "Q4 2023",
    importance: "High",
  },
  {
    symbol: "META",
    company: "Meta Platforms Inc.",
    date: "2024-02-01",
    time: "After Market Close",
    estimate: "$4.96",
    quarter: "Q4 2023",
    importance: "High",
  },
]

const centralBankEvents = [
  {
    date: "2024-01-31",
    event: "Federal Reserve FOMC Meeting",
    country: "US",
    decision: "Rate Decision",
    currentRate: "5.25-5.50%",
    expectedRate: "5.25-5.50%",
    probability: "85%",
    description: "Federal Open Market Committee announces interest rate decision",
  },
  {
    date: "2024-02-01",
    event: "Bank of England MPC Meeting",
    country: "UK",
    decision: "Rate Decision",
    currentRate: "5.25%",
    expectedRate: "5.25%",
    probability: "70%",
    description: "Monetary Policy Committee announces interest rate decision",
  },
  {
    date: "2024-02-08",
    event: "European Central Bank Meeting",
    country: "EU",
    decision: "Rate Decision",
    currentRate: "4.50%",
    expectedRate: "4.50%",
    probability: "90%",
    description: "ECB Governing Council announces interest rate decision",
  },
]

export default function EconomicCalendar() {
  const [selectedDate, setSelectedDate] = useState("2024-01-16")
  const [notifications, setNotifications] = useState<number[]>([])

  const getImportanceColor = (importance: string) => {
    switch (importance.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-600 hover:bg-red-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
      case "low":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20"
      default:
        return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
    }
  }

  const toggleNotification = (eventId: number) => {
    setNotifications((prev) => (prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  }

  const groupEventsByDate = (events: any[]) => {
    return events.reduce((groups, event) => {
      const date = event.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
      return groups
    }, {})
  }

  const groupedEvents = groupEventsByDate(economicEvents)

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Calendar Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground">2 high impact</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Impact</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">7</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings Reports</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">6</div>
            <p className="text-xs text-muted-foreground">Major companies</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Central Bank Events</CardTitle>
            <Star className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">3</div>
            <p className="text-xs text-muted-foreground">Rate decisions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="economic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="economic">Economic Events</TabsTrigger>
          <TabsTrigger value="earnings">Earnings Calendar</TabsTrigger>
          <TabsTrigger value="central-banks">Central Banks</TabsTrigger>
        </TabsList>

        <TabsContent value="economic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Economic Calendar</CardTitle>
              <CardDescription>Upcoming economic events and data releases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedEvents).map(([date, events]: [string, any]) => (
                  <div key={date}>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      {formatDate(date)}
                    </h3>
                    <div className="space-y-3">
                      {events.map((event: any) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm">{event.time}</span>
                            </div>
                            <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-semibold">
                              {event.country}
                            </div>
                            <div>
                              <div className="font-semibold">{event.event}</div>
                              <div className="text-sm text-muted-foreground">{event.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {event.forecast && (
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Forecast</div>
                                <div className="font-semibold">{event.forecast}</div>
                              </div>
                            )}
                            {event.previous && (
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Previous</div>
                                <div className="font-semibold">{event.previous}</div>
                              </div>
                            )}
                            <Badge variant="secondary" className={getImportanceColor(event.importance)}>
                              {event.importance}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleNotification(event.id)}
                              className={notifications.includes(event.id) ? "text-primary" : ""}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Calendar</CardTitle>
              <CardDescription>Upcoming earnings reports from major companies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earningsCalendar.map((earnings) => (
                  <div
                    key={earnings.symbol}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-primary">{earnings.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{earnings.symbol}</div>
                        <div className="text-sm text-muted-foreground">{earnings.company}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{formatDate(earnings.date)}</div>
                      <div className="text-sm text-muted-foreground">{earnings.time}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">EPS Estimate</div>
                      <div className="font-semibold">{earnings.estimate}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Quarter</div>
                      <div className="font-semibold">{earnings.quarter}</div>
                    </div>
                    <Badge variant="secondary" className={getImportanceColor(earnings.importance)}>
                      {earnings.importance}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="central-banks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Central Bank Events</CardTitle>
              <CardDescription>Upcoming central bank meetings and rate decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {centralBankEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-semibold">
                        {event.country}
                      </div>
                      <div>
                        <div className="font-semibold">{event.event}</div>
                        <div className="text-sm text-muted-foreground">{event.description}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{formatDate(event.date)}</div>
                      <div className="text-sm text-muted-foreground">{event.decision}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Current</div>
                      <div className="font-semibold">{event.currentRate}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Expected</div>
                      <div className="font-semibold">{event.expectedRate}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Probability</div>
                      <div className="font-semibold text-green-500">{event.probability}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
