"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, BarChart3, Lightbulb, Copy, ThumbsUp, ThumbsDown } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "analysis" | "recommendation"
  data?: any
}

const suggestedQuestions = [
  "How is my portfolio performing this month?",
  "What are the best investment opportunities right now?",
  "Should I diversify my holdings?",
  "Explain the current market trends",
  "How can I reduce my investment risk?",
  "What's the outlook for tech stocks?",
]

const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Hello! I'm your AI Financial Advisor. I'm here to help you make smarter investment decisions, analyze your portfolio, and provide personalized financial insights. How can I assist you today?",
    sender: "ai",
    timestamp: new Date(),
    type: "text",
  },
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input)
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): Message => {
    const responses = [
      {
        content:
          "Based on current market conditions, I recommend diversifying your portfolio with a mix of growth and value stocks. The tech sector shows strong potential, but consider balancing with defensive sectors like utilities and consumer staples.",
        type: "recommendation" as const,
        data: {
          recommendation: "Portfolio Diversification",
          confidence: 85,
          sectors: ["Technology", "Healthcare", "Utilities"],
        },
      },
      {
        content:
          "Your portfolio has shown a 12.5% growth this month, outperforming the S&P 500 by 3.2%. Your top performers are AAPL (+15.3%) and MSFT (+18.7%). However, I notice some concentration risk in tech stocks.",
        type: "analysis" as const,
        data: {
          performance: "+12.5%",
          benchmark: "S&P 500",
          outperformance: "+3.2%",
          topStocks: [
            { symbol: "AAPL", change: "+15.3%" },
            { symbol: "MSFT", change: "+18.7%" },
          ],
        },
      },
      {
        content:
          "The current market shows mixed signals. While inflation concerns persist, corporate earnings remain strong. I suggest maintaining a cautious but optimistic approach, focusing on quality companies with strong fundamentals.",
        type: "text" as const,
      },
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    return {
      id: Date.now().toString(),
      content: randomResponse.content,
      sender: "ai",
      timestamp: new Date(),
      type: randomResponse.type,
      data: randomResponse.data,
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : ""}`}>
              {message.sender === "ai" && (
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col gap-2 max-w-[80%] ${message.sender === "user" ? "items-end" : ""}`}>
                <Card className={`${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                  <CardContent className="p-4">
                    <p className="text-sm leading-relaxed">{message.content}</p>

                    {/* Enhanced AI Response Types */}
                    {message.type === "analysis" && message.data && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <BarChart3 className="h-3 w-3" />
                          Portfolio Analysis
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded bg-primary/10">
                            <div className="font-medium text-green-600">{message.data.performance}</div>
                            <div className="text-muted-foreground">Monthly Return</div>
                          </div>
                          <div className="p-2 rounded bg-primary/10">
                            <div className="font-medium text-primary">{message.data.outperformance}</div>
                            <div className="text-muted-foreground">vs {message.data.benchmark}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.type === "recommendation" && message.data && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <Lightbulb className="h-3 w-3" />
                          AI Recommendation
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {message.data.confidence}% Confidence
                          </Badge>
                          <div className="flex gap-1">
                            {message.data.sectors?.map((sector: string) => (
                              <Badge key={sector} variant="outline" className="text-xs">
                                {sector}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Message Actions */}
                {message.sender === "ai" && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-muted-foreground ml-2">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>

              {message.sender === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">AI is analyzing...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="p-4 border-t bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">Suggested questions:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto p-3 text-xs bg-transparent"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your finances, investments, or market trends..."
                className="pr-12 h-12"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="absolute right-1 top-1 h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses are for informational purposes only and should not be considered as financial advice.
          </p>
        </div>
      </div>
    </div>
  )
}
