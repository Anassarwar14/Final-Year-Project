"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
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
  Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { advisorApi } from "@/lib/advisor-api"

interface ChatHistory {
  id: string
  title: string
  timestamp: Date
  preview: string
  messageCount?: number
}

interface ChatSidebarProps {
  onNewChat?: () => void
  onSelectChat?: (chatId: string) => void
  onQuickAction?: (action: string) => void
  isCollapsed?: boolean
  onToggle?: () => void
  newSessionId?: string | null
}

export function ChatSidebar({ 
  onNewChat, 
  onSelectChat, 
  onQuickAction,
  isCollapsed = false,
  onToggle,
  newSessionId = null,
}: ChatSidebarProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [starredChats, setStarredChats] = useState<Set<string>>(new Set())
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load chat sessions from API
  useEffect(() => {
    loadChatSessions()
  }, [])

  const loadChatSessions = async () => {
    try {
      setIsLoading(true)
      const response = await advisorApi.getSessions()
      if (response.success) {
        const sessions = response.data.map((session: any) => ({
          id: session.id,
          title: session.title,
          timestamp: new Date(session.timestamp),
          preview: session.preview || "No preview",
          messageCount: session.messageCount || 0,
        }))
        setChatHistory(sessions)
      }
    } catch (error) {
      console.error("Failed to load chat sessions:", error)
    } finally {
      setIsLoading(false)
    }
  }


  const handleNewChat = () => {
    setSelectedChat(null)
    onNewChat?.()
    loadChatSessions() // Reload to show new chat
    toast.success("New chat started!")
  }

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId)
    onSelectChat?.(chatId)
  }



  const handleStarChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStarredChats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(chatId)) {
        newSet.delete(chatId)
        toast.info("Removed from starred")
      } else {
        newSet.add(chatId)
        toast.success("Added to starred!")
      }
      return newSet
    })
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await advisorApi.deleteSession(chatId)
      toast.success("Chat deleted successfully")
      loadChatSessions() // Reload list
      if (selectedChat === chatId) {
        setSelectedChat(null)
        onNewChat?.() // Start new chat if deleted current one
      }
    } catch (error) {
      toast.error("Failed to delete chat")
    }
  }

  if (isCollapsed) {
    return null
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-80 border-l bg-gradient-to-b from-muted/30 to-background flex flex-col shadow-lg sticky top-0 h-screen overflow-hidden self-start"
    >
      {/* Header */}
      <div className="p-4 border-b backdrop-blur-sm bg-background/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Chat History</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              className="gap-2 shadow-sm"
              onClick={handleNewChat}
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 h-0">
        <div className="p-3 pr-4 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No chat history yet.<br/>Start a new conversation!
            </div>
          ) : (
            <AnimatePresence>
              {chatHistory.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className={`cursor-pointer transition-all duration-200 border rounded-lg px-3 py-2.5 mr-3 ${
                      selectedChat === chat.id 
                        ? "bg-primary/10 border-primary/30 shadow-md" 
                        : "bg-card/50 hover:bg-card"
                    }`}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-sm truncate flex-1 pr-2">{chat.title}</h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-6 w-6 p-0 hover:bg-yellow-500/10 ${starredChats.has(chat.id) ? 'text-yellow-500' : ''}`}
                          onClick={(e) => handleStarChat(chat.id, e)}
                        >
                          <Star className={`h-3 w-3 ${starredChats.has(chat.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-[150px]">
                            <DropdownMenuItem onClick={(e) => handleSelectChat(chat.id)}>
                              Open Chat
                            </DropdownMenuItem>
                            {/* Removed Star/Unstar from menu as requested */}
                            <DropdownMenuItem className="text-red-600" onClick={(e) => handleDeleteChat(chat.id, e)}>
                              Delete Chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span className="truncate">{chat.timestamp.toLocaleDateString()}</span>
                      {chat.messageCount && chat.messageCount > 0 && (
                        <span className="ml-auto shrink-0">• {chat.messageCount}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>


    </motion.div>
  )
}
