"use client"

import type * as React from "react"
import {
  Bot,
  TrendingUp,
  GraduationCap,
  Newspaper,
  BarChart3,
  Wallet,
  Home,
  LucideChartCandlestick,
} from "lucide-react"
import { VscPieChart } from "react-icons/vsc";

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// Mock user data
const user = {
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: "/professional-avatar.png",
}

// Navigation data for financial platform
const navMain = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    isActive: true,
  },
  {
    title: "AI Financial Advisor",
    url: "/chat",
    icon: Bot,
    badge: "New",
  },
  {
    title: "Portfolio",
    url: "/portfolio",
    icon: VscPieChart,
    items: [
      {
        title: "Overview",
        url: "/portfolio",
      },
      {
        title: "Holdings",
        url: "/portfolio/holdings",
      },
      {
        title: "Performance",
        url: "/portfolio/performance",
      },
      {
        title: "Analytics",
        url: "/portfolio/analytics",
      },
    ],
  },
  {
    title: "Learning Hub",
    url: "/learning",
    icon: GraduationCap,
    items: [
      {
        title: "Courses",
        url: "/learning/courses",
      },
      {
        title: "Market Basics",
        url: "/learning/basics",
      },
      {
        title: "Advanced Strategies",
        url: "/learning/advanced",
      },
      {
        title: "Certifications",
        url: "/learning/certifications",
      },
    ],
  },
  {
    title: "Trading Simulator",
    url: "/simulator",
    icon: LucideChartCandlestick,
    badge: "Practice",
  },
  {
    title: "Market News",
    url: "/news",
    icon: Newspaper,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">FinanceAI</span>
            <span className="truncate text-xs text-muted-foreground">Pro Platform</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
