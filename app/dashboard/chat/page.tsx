"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Sparkles, TrendingUp, DollarSign } from "lucide-react"
import { ChatSidebar } from "@/components/chat-sidebar"

export default function ChatPage() {
  return (
    <>
      {/* <ChatSidebar/> */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">AI Financial Advisor</h1>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                RAG Powered
              </Badge>
            </div>
          </div>
          <div className="ml-auto px-4 flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <TrendingUp className="h-4 w-4" />
              Portfolio Analysis
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <DollarSign className="h-4 w-4" />
              Market Insights
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col">
          <ChatInterface />
        </div>
      </SidebarInset>
    </>
  )
}
