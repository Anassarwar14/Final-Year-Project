"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User, BarChart3, Lightbulb, Copy, ThumbsUp, ThumbsDown, Bot, TrendingUp, Check, AlertCircle, Aperture } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import { advisorApi } from "@/lib/advisor-api"

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

// Enhanced markdown parser
const parseMarkdown = (text: string): string => {
  let html = text
    // Headers (scaled for consistent compact sizing)
    .replace(/^#### (.*$)/gim, '<h4 class="text-xs md:text-sm font-semibold mt-2 mb-1">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-sm md:text-base font-semibold mt-3 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-base md:text-lg font-bold mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-lg md:text-xl font-bold mt-5 mb-3">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Numbered lists
    .replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-6 my-1 text-[13px] md:text-sm">$1</li>')
    // Bullet lists  
    .replace(/^[\*\-]\s+(.*$)/gim, '<li class="ml-6 my-1 text-[13px] md:text-sm">$1</li>')
    // Paragraphs
    .split('\n\n')
    .map(block => {
      if (block.includes('<h') || block.includes('<li')) return block
      if (block.trim() === '') return '<br/>'
      return `<p class="my-2 text-[13.5px] md:text-[15px]">${block.replace(/\n/g, '<br/>')}</p>`
    })
    .join('\n')
  
  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li class="ml-6 my-1">.*?<\/li>\s*)+/g, match => `<ul class="list-disc my-2">${match}</ul>`)

  // Simple pipe-table support: convert Markdown tables to HTML
  // Detect header separator like | --- | --- |
  if (/^\s*\|\s*[-:]+\s*\|/m.test(html)) {
    html = html.replace(/((?:^\|.*\|\s*$\n?)+)/gm, (block) => {
      const rows = block.trim().split(/\n/).filter(r => r.trim())
      if (rows.length < 2) return block
      const header = rows[0]
      const bodyRows = rows.slice(2) // skip separator row
      const toCells = (row: string) => row
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split(/\|/)
        .map(c => c.trim())
      const ths = toCells(header).map(c => `<th class="px-3 py-2 text-xs font-semibold text-muted-foreground">${c}</th>`).join('')
      const trs = bodyRows.map((r, i) => {
        const tds = toCells(r).map(c => `<td class="px-3 py-2 text-xs">${c}</td>`).join('')
        const zebra = i % 2 === 0 ? 'bg-muted/20' : ''
        return `<tr class="${zebra} hover:bg-muted/40 transition-colors border-b last:border-b-0">${tds}</tr>`
      }).join('')
      return `
        <div class="my-3 overflow-x-auto">
          <table class="w-full text-left border rounded-md bg-card/60">
            <thead class="bg-muted/40">
              <tr>${ths}</tr>
            </thead>
            <tbody>${trs}</tbody>
          </table>
        </div>
      `
    })
  }

  // Blockquotes styling
  html = html.replace(/^>\s?(.*$)/gim, '<blockquote class="my-3 pl-3 border-l-2 border-muted text-muted-foreground">$1</blockquote>')

  // Links styling
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1<\/a>')
  
  return html
}

interface ChatInterfaceProps {
  sessionId?: string | null
  onSessionCreated?: (sessionId: string) => void
}

export function ChatInterface({ sessionId, onSessionCreated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null)
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom using an anchor element for reliability
  useEffect(() => {
    const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior, block: 'end' })
      } else if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null
        if (viewport) viewport.scrollTop = viewport.scrollHeight
      }
    }

    // Immediate position, then smooth follow if streaming
    scrollToBottom('auto')

    if (isLoading && streamingMessage) {
      const interval = setInterval(() => scrollToBottom('smooth'), 120)
      return () => clearInterval(interval)
    }

    const timer = setTimeout(() => scrollToBottom('smooth'), 60)
    return () => clearTimeout(timer)
  }, [messages, streamingMessage, isLoading])

  // Load session when sessionId changes
  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      loadSession(sessionId)
    } else if (sessionId === null && currentSessionId !== null) {
      // Reset to new chat
      setMessages(initialMessages)
      setCurrentSessionId(null)
      setInput("")
    }
  }, [sessionId])

  const loadSession = async (sid: string) => {
    try {
      const response = await advisorApi.getSession(sid)
      if (response.success) {
        const loadedMessages: Message[] = response.data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.role?.toUpperCase() === "USER" ? "user" : "ai",
          timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
          type: "text",
        }))
        // Only show loaded messages, no initial welcome message
        setMessages(loadedMessages.length > 0 ? loadedMessages : initialMessages)
        setCurrentSessionId(sid)
      }
    } catch (error) {
      console.error("Failed to load session:", error)
      toast.error("Failed to load chat session")
    }
  }

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
    const userInput = input
    setInput("")
    setIsLoading(true)
    setStreamingMessage("")

    try {
      // Use streaming API for better UX
      let fullMessage = ""
      
      const newSessionId = await advisorApi.sendMessageStream(
        {
          sessionId: currentSessionId || undefined,
          message: userInput,
          includePortfolio: true,
        },
        // onChunk
        (chunk: string) => {
          fullMessage += chunk
          setStreamingMessage(fullMessage)
        },
        // onComplete
        () => {
          // Clear streaming first
          setStreamingMessage("")
          setIsLoading(false)

          // Add final message only if not duplicate
          setTimeout(() => {
            setMessages(prev => {
              const last = prev[prev.length - 1]
              if (last && last.sender === 'ai' && last.content === fullMessage) return prev
              const aiMessage: Message = {
                id: Date.now().toString(),
                content: fullMessage,
                sender: 'ai',
                timestamp: new Date(),
                type: 'text',
              }
              return [...prev, aiMessage]
            })
          }, 10)
        },
        // onError
        (error: Error) => {
          console.error("Stream error:", error)
          toast.error("Failed to get AI response. Please try again.")
          setIsLoading(false)
          setStreamingMessage("")
        }
      )

      // Update session ID if this was a new chat
      if (newSessionId && !currentSessionId) {
        setCurrentSessionId(newSessionId)
        onSessionCreated?.(newSessionId)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message. Please try again.")
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = async (question: string) => {
    // Auto-send suggested questions immediately
    if (isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setStreamingMessage("")

    try {
      let fullMessage = ""
      
      const newSessionId = await advisorApi.sendMessageStream(
        {
          sessionId: currentSessionId || undefined,
          message: question,
          includePortfolio: true,
        },
        (chunk: string) => {
          fullMessage += chunk
          setStreamingMessage(fullMessage)
        },
        () => {
          // Clear streaming message first to prevent double display
          setStreamingMessage("")
          setIsLoading(false)
          
          // Add the complete message after a small delay to ensure streaming UI is cleared
          setTimeout(() => {
            setMessages((prev) => {
              const last = prev[prev.length - 1]
              if (last && last.sender === 'ai' && last.content === fullMessage) return prev
              const aiMessage: Message = {
                id: Date.now().toString(),
                content: fullMessage,
                sender: 'ai',
                timestamp: new Date(),
                type: 'text',
              }
              return [...prev, aiMessage]
            })
          }, 10)
        },
        (error: Error) => {
          console.error("Stream error:", error)
          toast.error("Failed to get AI response.")
          setIsLoading(false)
          setStreamingMessage("")
        }
      )

      if (newSessionId && !currentSessionId) {
        setCurrentSessionId(newSessionId)
        onSessionCreated?.(newSessionId)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  const handleCopy = (content: string, messageId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    // Capture button geometry synchronously
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const originX = (rect.left + rect.width / 2) / window.innerWidth
    const originY = (rect.top + rect.height / 2) / window.innerHeight
    
    // Try modern clipboard API first, fallback to textarea method
    const copyToClipboard = () => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(content)
      } else {
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement("textarea")
        textArea.value = content
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        return new Promise<void>((resolve, reject) => {
          document.execCommand('copy') ? resolve() : reject()
          textArea.remove()
        })
      }
    }
    
    copyToClipboard()
      .then(() => {
        setCopiedId(messageId)
        // Confetti at captured button position
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { x: originX, y: originY },
          colors: ['#10b981', '#3b82f6', '#8b5cf6'],
          ticks: 80,
          gravity: 1.5,
          scalar: 0.7,
          startVelocity: 20,
        })
        
        toast.success("Copied to clipboard!")
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopiedId(null), 2000)
      })
      .catch((error) => {
        console.error("Copy failed:", error)
        toast.error("Failed to copy message")
      })
  }

  const handleFeedback = (messageId: string, type: 'up' | 'down') => {
    // TODO: Send feedback to backend
    toast.success(`Thanks for your feedback!`, {
      duration: 2000,
    })
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
      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 mb-3 ${message.sender === "user" ? "justify-end" : ""}`}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-10 w-10 bg-gradient-to-br shadow-md from-gray-300/20 to-primary/5">
                    <AvatarFallback className="bg-transparent">
                      <Aperture className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`flex flex-col gap-2 max-w-[85%] ${message.sender === "user" ? "items-end" : ""}}`}>
                  <div>
                    <div className={`${
                      message.sender === "user" 
                        ? "rounded-2xl bg-primary/90 text-primary-foreground shadow-sm px-4 py-0.5" 
                        : "rounded-xl bg-card/60 shadow-sm hover:shadow-md transition-shadow px-4 py-3 border"
                    }`}>
                        <div 
                          className="prose prose-sm md:prose-base leading-[1.7] dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                        />
                      {/* Enhanced AI Response Types */}
                      {message.sender === "ai" && message.type === "analysis" && message.data && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 space-y-3"
                          >
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                              <BarChart3 className="h-4 w-4" />
                              Portfolio Analysis
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                                <div className="font-bold text-green-600 text-lg">{message.data.performance}</div>
                                <div className="text-muted-foreground text-xs">Monthly Return</div>
                              </div>
                              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                <div className="font-bold text-primary text-lg">{message.data.outperformance}</div>
                                <div className="text-muted-foreground text-xs">vs {message.data.benchmark}</div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {message.type === "recommendation" && message.data && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 space-y-3"
                          >
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                              <Lightbulb className="h-4 w-4" />
                              AI Recommendation
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="default" className="text-xs font-semibold px-3 py-1">
                                {message.data.confidence}% Confidence
                              </Badge>
                              <div className="flex gap-2 flex-wrap">
                                {message.data.sectors?.map((sector: string) => (
                                  <Badge key={sector} variant="outline" className="text-xs px-2 py-1">
                                    {sector}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                    </div>
                  </div>

                  {/* Message Actions */}
                  {message.sender === "ai" && (
                    <div className="flex items-center gap-1.5 px-1">

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 hover:bg-primary/10 transition-colors"
                        onClick={(e) => handleCopy(message.content, message.id, e)}
                      >
                        {copiedId === message.id ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 hover:bg-green-500/10 hover:text-green-600 transition-colors"
                        onClick={() => handleFeedback(message.id, 'up')}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                        onClick={() => handleFeedback(message.id, 'down')}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-xs text-muted-foreground ml-2 font-medium">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}
                </div>

                {message.sender === "user" && (
                  <Avatar className="h-10 w-10 shadow-md bg-gradient-to-br from-muted to-muted/50">
                    <AvatarFallback className="bg-transparent">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </AnimatePresence>

          {/* Streaming Message or Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/30 shadow-md bg-gradient-to-br from-primary/20 to-primary/5">
                <AvatarFallback className="bg-transparent">
                  <Aperture className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col gap-2 max-w-[85%]">
                <div className="rounded-lg bg-gradient-to-br from-card to-card/50 shadow-sm px-4 py-3">
                    {streamingMessage ? (
                      <div className="prose prose-sm md:prose-base leading-[1.7] dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: parseMarkdown(streamingMessage) }} />
                        <span className="inline-block w-0.5 h-4 bg-primary ml-1 animate-pulse" />
                      </div>
                    ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <motion.div 
                              className="w-1 h-1 bg-primary rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.div
                              className="w-1 h-1 bg-primary rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                            />
                            <motion.div
                              className="w-1 h-1 bg-primary rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              Thinking
                            </motion.span>
                          </span>
                        </div>
                      )}
                </div>
              </div>
            </div>
          )}
          {/* Anchor for auto-scroll */}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Suggested Questions */}
      {messages.length <= 1 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 border-t bg-gradient-to-b from-muted/30 to-transparent"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-semibold text-foreground">Try asking about:</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestedQuestions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start text-left h-auto p-4 text-xs bg-card/50 hover:bg-card hover:shadow-md transition-all duration-200 w-full"
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={isLoading}
                  >
                    <span className="line-clamp-2">{question}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Input Area (sticky) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="sticky bottom-0 z-10 p-6 pb-2 border-t bg-background"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your finances, investments, or market trends..."
                className="pr-14 h-14 rounded-xl text-[15px] shadow-lg border-2 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all bg-card"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="absolute right-2 top-2 h-10 w-10 p-0 shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-3 text-center ">
            AI responses are for informational purposes only and should not be considered as financial advice.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
