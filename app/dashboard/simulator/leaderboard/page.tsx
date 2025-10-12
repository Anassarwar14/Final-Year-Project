"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, TrendingUp, Users, Calendar, Target } from "lucide-react"

// Mock leaderboard data
const leaderboardData = [
  {
    rank: 1,
    name: "Alex Chen",
    username: "@alexc",
    avatar: "/placeholder.svg?height=40&width=40",
    return: 24.5,
    trades: 156,
    winRate: 72.3,
    badge: "gold",
  },
  {
    rank: 2,
    name: "Sarah Johnson",
    username: "@sarahj",
    avatar: "/placeholder.svg?height=40&width=40",
    return: 21.8,
    trades: 134,
    winRate: 68.9,
    badge: "silver",
  },
  {
    rank: 3,
    name: "Mike Rodriguez",
    username: "@miker",
    avatar: "/placeholder.svg?height=40&width=40",
    return: 19.2,
    trades: 189,
    winRate: 65.4,
    badge: "bronze",
  },
  {
    rank: 4,
    name: "Emma Wilson",
    username: "@emmaw",
    avatar: "/placeholder.svg?height=40&width=40",
    return: 17.6,
    trades: 98,
    winRate: 71.2,
    badge: null,
  },
  {
    rank: 5,
    name: "David Kim",
    username: "@davidk",
    avatar: "/placeholder.svg?height=40&width=40",
    return: 16.3,
    trades: 167,
    winRate: 63.8,
    badge: null,
  },
  {
    rank: 6,
    name: "Lisa Thompson",
    username: "@lisat",
    avatar: "/placeholder.svg?height=40&width=40",
    return: 15.9,
    trades: 142,
    winRate: 66.7,
    badge: null,
  },
  {
    rank: 7,
    name: "James Park",
    username: "@jamesp",
    avatar: "/placeholder.svg?height=40&width=40",
    return: 14.7,
    trades: 123,
    winRate: 64.2,
    badge: null,
  },
  {
    rank: 8,
    name: "You",
    username: "@you",
    avatar: "/professional-avatar.png",
    return: 12.8,
    trades: 87,
    winRate: 68.5,
    badge: null,
    isCurrentUser: true,
  },
]

const competitions = [
  {
    id: 1,
    name: "Monthly Challenge",
    description: "Best monthly return competition",
    participants: 1247,
    prize: "$5,000",
    endDate: "2024-01-31",
    status: "active",
    yourRank: 23,
  },
  {
    id: 2,
    name: "Tech Stock Masters",
    description: "Technology sector focused trading",
    participants: 856,
    prize: "$3,000",
    endDate: "2024-02-15",
    status: "active",
    yourRank: 45,
  },
  {
    id: 3,
    name: "Risk Management Pro",
    description: "Best risk-adjusted returns",
    participants: 634,
    prize: "$2,500",
    endDate: "2024-02-28",
    status: "upcoming",
    yourRank: null,
  },
]

const achievements = [
  { name: "First Trade", description: "Complete your first trade", earned: true, date: "2024-01-15" },
  { name: "Profitable Week", description: "Achieve positive returns for a week", earned: true, date: "2024-01-22" },
  { name: "Diversification Master", description: "Hold positions in 5+ sectors", earned: true, date: "2024-01-28" },
  { name: "High Roller", description: "Execute a trade worth $10,000+", earned: true, date: "2024-01-16" },
  { name: "Consistent Trader", description: "Trade for 30 consecutive days", earned: false, date: null },
  { name: "Risk Manager", description: "Maintain portfolio volatility under 15%", earned: false, date: null },
  { name: "Top 10%", description: "Rank in top 10% of monthly leaderboard", earned: false, date: null },
  { name: "Perfect Month", description: "Achieve 100% win rate in a month", earned: false, date: null },
]

export default function Leaderboard() {
  const [selectedTab, setSelectedTab] = useState("leaderboard")

  const getBadgeIcon = (badge: string | null) => {
    switch (badge) {
      case "gold":
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case "silver":
        return <Medal className="h-5 w-5 text-gray-400" />
      case "bronze":
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">#8</div>
            <p className="text-xs text-muted-foreground">Out of 1,247 traders</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+12.8%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">2</div>
            <p className="text-xs text-muted-foreground">Participating in</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">4/8</div>
            <p className="text-xs text-muted-foreground">Unlocked</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Leaderboard</CardTitle>
              <CardDescription>Top performers this month based on portfolio returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboardData.map((trader) => (
                  <div
                    key={trader.rank}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      trader.isCurrentUser ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            trader.rank === 1
                              ? "bg-yellow-500/20 text-yellow-600"
                              : trader.rank === 2
                                ? "bg-gray-400/20 text-gray-600"
                                : trader.rank === 3
                                  ? "bg-amber-600/20 text-amber-700"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {trader.rank}
                        </div>
                        {getBadgeIcon(trader.badge)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={trader.avatar || "/placeholder.svg"} alt={trader.name} />
                        <AvatarFallback>
                          {trader.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {trader.name}
                          {trader.isCurrentUser && <Badge variant="secondary">You</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">{trader.username}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-500 text-lg">+{trader.return}%</div>
                      <div className="text-sm text-muted-foreground">
                        {trader.trades} trades • {trader.winRate}% win rate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition) => (
              <Card key={competition.id} className={`${competition.status === "active" ? "border-primary/20" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{competition.name}</CardTitle>
                    <Badge variant={competition.status === "active" ? "default" : "secondary"}>
                      {competition.status}
                    </Badge>
                  </div>
                  <CardDescription>{competition.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{competition.participants.toLocaleString()} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold">{competition.prize}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Ends {competition.endDate}</span>
                  </div>
                  {competition.yourRank && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm">Your rank: #{competition.yourRank}</span>
                    </div>
                  )}
                  <Button
                    className="w-full"
                    variant={competition.status === "active" ? "default" : "outline"}
                    disabled={competition.status === "upcoming"}
                  >
                    {competition.status === "active"
                      ? "View Details"
                      : competition.status === "upcoming"
                        ? "Coming Soon"
                        : "Join Competition"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Unlock badges by completing trading milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      achievement.earned ? "bg-green-500/5 border-green-500/20" : "bg-muted/30 border-muted"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.earned ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Award className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-semibold ${achievement.earned ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {achievement.name}
                      </div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      {achievement.earned && achievement.date && (
                        <div className="text-xs text-green-600 mt-1">Earned on {achievement.date}</div>
                      )}
                    </div>
                    {achievement.earned && (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                        Unlocked
                      </Badge>
                    )}
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
