"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, DollarSign, History, X } from "lucide-react"
import { ChatSidebar } from "@/components/chat-sidebar"
import { motion, AnimatePresence } from "framer-motion"

export default function ChatPage() {
  const [showChatSidebar, setShowChatSidebar] = useState(true)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [refreshSidebar, setRefreshSidebar] = useState(0)

  const handleNewChat = () => {
    setCurrentChatId(null)
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleSessionCreated = (sessionId: string) => {
    setCurrentChatId(sessionId)
    // Trigger sidebar refresh
    setRefreshSidebar(prev => prev + 1)
  }

  const handleQuickAction = (action: string) => {
    // TODO: Trigger quick action in chat interface
    console.log("Quick action:", action)
  }

  return (
    <>
      <SidebarInset className="flex flex-row">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-px bg-sidebar-border" />
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">Financial Advisor</h1>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  RAG Powered
                </Badge>
              </div>
            </div>
            <div className="ml-auto px-4 flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent hidden md:flex">
                <TrendingUp className="h-4 w-4" />
                Portfolio Analysis
              </Button>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent hidden md:flex">
                <DollarSign className="h-4 w-4" />
                Market Insights
              </Button>
              <Button
                variant={showChatSidebar ? "secondary" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setShowChatSidebar(!showChatSidebar)}
              >
                {showChatSidebar ? (
                  <X className="h-4 w-4" />
                ) : (
                  <History className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {showChatSidebar ? "Hide" : "History"}
                </span>
              </Button>
            </div>
          </header>

          <div className="flex flex-1 flex-col">
            <ChatInterface 
              sessionId={currentChatId}
              onSessionCreated={handleSessionCreated}
            />
          </div>
        </div>

        {/* Right Side Chat History Sidebar */}
        {showChatSidebar && (
          <ChatSidebar
            key={refreshSidebar}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onQuickAction={handleQuickAction}
            isCollapsed={!showChatSidebar}
            newSessionId={currentChatId}
          />
        )}
      </SidebarInset>
    </>
  )
}
