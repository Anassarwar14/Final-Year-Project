// "use client"

// import type * as React from "react"
// import {
//   Bot,
//   TrendingUp,
//   GraduationCap,
//   Newspaper,
//   BarChart3,
//   Wallet,
//   Home,
//   LucideChartCandlestick,
// } from "lucide-react"
// import { VscPieChart } from "react-icons/vsc";

// import { NavMain } from "@/components/nav-main"
// import { NavUser } from "@/components/nav-user"
// import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// // Mock user data
// const user = {
//   name: "Alex Johnson",
//   email: "alex@example.com",
//   avatar: "/professional-avatar.png",
// }

// // Navigation data for financial platform
// const navMain = [
//   {
//     title: "Dashboard",
//     url: "/",
//     icon: Home,
//     isActive: true,
//   },
//   {
//     title: "AI Financial Advisor",
//     url: "/chat",
//     icon: Bot,
//     badge: "New",
//   },
//   {
//     title: "Portfolio",
//     url: "/portfolio",
//     icon: VscPieChart,
//     items: [
//       {
//         title: "Overview",
//         url: "/portfolio",
//       },
//       {
//         title: "Holdings",
//         url: "/portfolio/holdings",
//       },
//       {
//         title: "Performance",
//         url: "/portfolio/performance",
//       },
//       {
//         title: "Analytics",
//         url: "/portfolio/analytics",
//       },
//     ],
//   },
//   {
//     title: "Learning Hub",
//     url: "/learning",
//     icon: GraduationCap,
//     items: [
//       {
//         title: "Courses",
//         url: "/learning/courses",
//       },
//       {
//         title: "Market Basics",
//         url: "/learning/basics",
//       },
//       {
//         title: "Advanced Strategies",
//         url: "/learning/advanced",
//       },
//       {
//         title: "Certifications",
//         url: "/learning/certifications",
//       },
//     ],
//   },
//   {
//     title: "Trading Simulator",
//     url: "/simulator",
//     icon: LucideChartCandlestick,
//     badge: "Practice",
//   },
//   {
//     title: "Market News",
//     url: "/news",
//     icon: Newspaper,
//   },
// ]

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader>
//         <div className="flex items-center gap-2 px-4 py-2">
//           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//             <Wallet className="h-4 w-4" />
//           </div>
//           <div className="grid flex-1 text-left text-sm leading-tight">
//             <span className="truncate font-semibold">WealthFlow</span>
//             <span className="truncate text-xs text-muted-foreground">Finance Platform</span>
//           </div>
//         </div>
//       </SidebarHeader>
//       <SidebarContent>
//         <NavMain items={navMain} />
//       </SidebarContent>
//       <SidebarFooter>
//         <NavUser user={user} />
//       </SidebarFooter>
//       <SidebarRail />
//     </Sidebar>
//   )
// }




// "use client"

// import type * as React from "react"
// import {
//   Bot,
//   TrendingUp,
//   GraduationCap,
//   Newspaper,
//   BarChart3,
//   Wallet,
//   Home,
//   LucideChartCandlestick,
// } from "lucide-react"
// import { VscPieChart } from "react-icons/vsc";

// import { NavMain } from "@/components/nav-main"
// import { NavUser } from "@/components/nav-user"
// import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// // Mock user data
// // const user = {
// //   name: "Alex Johnson",
// //   email: "alex@example.com",
// //   avatar: "/professional-avatar.png",
// // }

// // Navigation data for financial platform
// const navMain = [
//   {
//     title: "Dashboard",
//     url: "/",
//     icon: Home,
//     isActive: true,
//   },
//   {
//     title: "AI Financial Advisor",
//     url: "/chat",
//     icon: Bot,
//     badge: "New",
//   },
//   {
//     title: "Portfolio",
//     url: "/portfolio",
//     icon: VscPieChart,
//     items: [
//       {
//         title: "Overview",
//         url: "/portfolio",
//       },
//       {
//         title: "Holdings",
//         url: "/portfolio/holdings",
//       },
//       {
//         title: "Performance",
//         url: "/portfolio/performance",
//       },
//       {
//         title: "Analytics",
//         url: "/portfolio/analytics",
//       },
//     ],
//   },
//   {
//     title: "Learning Hub",
//     url: "/learning",
//     icon: GraduationCap,
//     items: [
//       {
//         title: "Courses",
//         url: "/learning/courses",
//       },
//       {
//         title: "Market Basics",
//         url: "/learning/basics",
//       },
//       {
//         title: "Advanced Strategies",
//         url: "/learning/advanced",
//       },
//       {
//         title: "Certifications",
//         url: "/learning/certifications",
//       },
//     ],
//   },
//   {
//     title: "Trading Simulator",
//     url: "/simulator",
//     icon: LucideChartCandlestick,
//     badge: "Practice",
//   },
//   {
//     title: "Market News",
//     url: "/news",
//     icon: Newspaper,
//   },
// ]

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader>
//         <div className="flex items-center gap-2 px-4 py-2">
//           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//             <Wallet className="h-4 w-4" />
//           </div>
//           <div className="grid flex-1 text-left text-sm leading-tight">
//             <span className="truncate font-semibold">WealthFlow</span>
//             <span className="truncate text-xs text-muted-foreground">Finance Platform</span>
//           </div>
//         </div>
//       </SidebarHeader>
//       <SidebarContent>
//         <NavMain items={navMain} />
//       </SidebarContent>
//       <SidebarFooter>
//         <NavUser user={user} />
//       </SidebarFooter>
//       <SidebarRail />
//     </Sidebar>
//   )
// }



"use client"

import type * as React from "react"
import {
  Bot,
  GraduationCap,
  Newspaper,
  ChartPie,
  Home,
  LucideChartCandlestick,
} from "lucide-react"

import { useCurrentUser } from "@/hooks/use-current-user"   
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import Image from "next/image";


// Navigation data for financial platform (Remains the same)
const navMain = [
  // ... (Your navigation array structure)
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
    icon: ChartPie,
    items: [
      { title: "Overview", url: "/portfolio" },
      { title: "Holdings", url: "/portfolio/holdings" },
      { title: "Performance", url: "/portfolio/performance" },
      { title: "Analytics", url: "/portfolio/analytics" },
    ],
  },
  {
    title: "Learning Hub",
    url: "/learning",
    icon: GraduationCap,
    items: [
      { title: "Courses", url: "/learning/courses" },
      { title: "Market Basics", url: "/learning/basics" },
      { title: "Advanced Strategies", url: "/learning/advanced" },
      { title: "Certifications", url: "/learning/certifications" },
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

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   // 1. Fetch User Data
//   const { user, status } = useCurrentUser(); // Get the real user data
  
//   // 2. Handle Loading or Unauthenticated States
//   // You might render a skeleton or nothing if loading/unauthenticated
//   if (status === 'loading') {
//     return <div className="p-4 text-center">Loading sidebar...</div>;
//   }
  
//   // If the user is not logged in or data is missing, handle gracefully
//   const sidebarUser = user ? {
//     name: user.name || "User",
//     email: user.email || "guest@example.com",
//     avatar: user.image || "/placeholder.png", // Use 'image' from Prisma as 'avatar'
//   } : null;

//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader>
//         <div className="flex items-center gap-2 px-4 py-2">
//           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
//             <Wallet className="h-4 w-4" />
//           </div>
//           <div className="grid flex-1 text-left text-sm leading-tight">
//             <span className="truncate font-semibold">WealthFlow</span>
//             <span className="truncate text-xs text-muted-foreground">Finance Platform</span>
//           </div>
//         </div>
//       </SidebarHeader>
      
//       <SidebarContent>
//         <NavMain items={navMain} />
//       </SidebarContent>
      
//       <SidebarFooter>
//         {/* 3. Conditional Rendering of NavUser */}
//         {sidebarUser ? (
//           <NavUser user={sidebarUser} />
//         ) : (
//           // Optional: Render a login/sign-up link if not logged in
//           <div className="p-2 text-center text-sm text-muted-foreground">Please log in.</div>
//         )}
//       </SidebarFooter>
      
//       <SidebarRail />
//     </Sidebar>
//   )
// }

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isPending } = useCurrentUser();

  if (isPending) {
    return <div className="p-4 text-center">Loading sidebar...</div>;
  }

  const sidebarUser = user
    ? {
        name: user.name || "User",
        email: user.email || "guest@example.com",
        avatar: user.image || "/placeholder.png",
      }
    : null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:px-0.5">
            <div className="flex aspect-square h-12 w-12 min-h-12 min-w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:min-h-9 group-data-[collapsible=icon]:min-w-9 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:translate-x-[-6px]">
            <Image 
              src="/favicon.ico" 
              alt="WealthFlow Logo" 
              width={32} 
              height={32}
                className="h-8 w-8 object-contain group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
            <span className="truncate font-semibold">WealthFlow</span>
            <span className="truncate text-xs text-muted-foreground">Finance Platform</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        {sidebarUser ? (
          <NavUser user={sidebarUser} />
        ) : (
          <div className="p-2 text-center text-sm text-muted-foreground">Please log in.</div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}


