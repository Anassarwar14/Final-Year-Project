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
import { ProfileSetupModal } from "@/components/profile-setup-modal"
import { advisorApi } from "@/lib/advisor-api"
import { useEffect } from "react"

export default function ChatPage() {
  const [showChatSidebar, setShowChatSidebar] = useState(true)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [refreshSidebar, setRefreshSidebar] = useState(0)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [profileExists, setProfileExists] = useState(false)

  useEffect(() => {
    // Check if user has an investor profile on load
    const checkProfile = async () => {
      try {
        const res = await advisorApi.getInvestorProfile()
        if (res.success && res.data) {
          // You could consider the profile "existing" if they changed anything from the system defaults,
          // but for now let's say it exists if the API call succeeds.
          // Since our backend returns defaults instead of null if a row doesn't exist, we might check for an empty array of sectors or similar.
          const isDefault = res.data.experienceLevel === "beginner" && res.data.preferredSectors.length === 0
          if (isDefault) {
            setProfileExists(false)
            setProfileModalOpen(true) // auto-open on first visit
          } else {
            setProfileExists(true)
          }
        }
      } catch (error) {
        console.error("Failed to check profile status", error)
      }
    }
    checkProfile()
  }, [])

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
                
                {/* Profile Status Badge */}
                <Badge 
                  variant={profileExists ? "default" : "outline"} 
                  className={`text-xs cursor-pointer hover:opacity-80 transition-opacity ${!profileExists ? "border-yellow-500 text-yellow-600" : ""}`}
                  onClick={() => setProfileModalOpen(true)}
                >
                  {profileExists ? "Profile Complete" : "Profile Incomplete"}
                </Badge>
              </div>
            </div>
            <div className="ml-auto px-4 flex items-center gap-2">  
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

      <ProfileSetupModal 
        isOpen={profileModalOpen} 
        onOpenChange={setProfileModalOpen}
        onProfileSaved={() => setProfileExists(true)}
      />
    </>
  )
}


