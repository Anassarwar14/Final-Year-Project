"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Clock,
  Star,
  Trash2,
  Plus,
  TrendingUp,
  DollarSign,
  BarChart3,
  AlertTriangle,
} from "lucide-react"

interface ChatHistory {
  id: string
  title: string
  timestamp: Date
  preview: string
  type: "general" | "portfolio" | "analysis" | "recommendation"
}

const chatHistory: ChatHistory[] = [
  {
    id: "1",
    title: "Portfolio Analysis",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    preview: "How is my portfolio performing this month?",
    type: "portfolio",
  },
  {
    id: "2",
    title: "Market Trends Discussion",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    preview: "What are the current market trends?",
    type: "analysis",
  },
  {
    id: "3",
    title: "Investment Recommendations",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    preview: "Best investment opportunities right now",
    type: "recommendation",
  },
  {
    id: "4",
    title: "Risk Assessment",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    preview: "How can I reduce my investment risk?",
    type: "general",
  },
]

const quickActions = [
  {
    title: "Analyze Portfolio",
    icon: BarChart3,
    description: "Get detailed portfolio insights",
    color: "text-blue-600",
  },
  {
    title: "Market Update",
    icon: TrendingUp,
    description: "Latest market trends",
    color: "text-green-600",
  },
  {
    title: "Risk Check",
    icon: AlertTriangle,
    description: "Assess portfolio risk",
    color: "text-orange-600",
  },
  {
    title: "Investment Ideas",
    icon: DollarSign,
    description: "Discover opportunities",
    color: "text-purple-600",
  },
]

export function ChatSidebar() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "portfolio":
        return <BarChart3 className="h-3 w-3" />
      case "analysis":
        return <TrendingUp className="h-3 w-3" />
      case "recommendation":
        return <DollarSign className="h-3 w-3" />
      default:
        return <MessageSquare className="h-3 w-3" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "portfolio":
        return "bg-blue-100 text-blue-700"
      case "analysis":
        return "bg-green-100 text-green-700"
      case "recommendation":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Chat History</h2>
          <Button size="sm" variant="outline" className="gap-2 bg-transparent">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              size="sm"
              className="h-auto p-2 flex flex-col items-center gap-1 bg-transparent"
            >
              <action.icon className={`h-4 w-4 ${action.color}`} />
              <span className="text-xs">{action.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {chatHistory.map((chat) => (
            <Card
              key={chat.id}
              className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                selectedChat === chat.id ? "bg-accent" : ""
              }`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm truncate">{chat.title}</h4>
                  <Badge variant="secondary" className={`text-xs ${getTypeColor(chat.type)}`}>
                    {getTypeIcon(chat.type)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{chat.preview}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {chat.timestamp.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Star className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">AI Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>This month</span>
              <span className="font-medium">247 / 500 queries</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "49.4%" }} />
            </div>
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
