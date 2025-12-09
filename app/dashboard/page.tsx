
// "use client"

// import { AppSidebar } from "@/components/app-sidebar"
// import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import SignOutButton from "@/components/logout";
// import Link from "next/link"
// import {
//   TrendingUp,
//   DollarSign,
//   BarChart3,
//   Users,
//   ArrowUpRight,
//   ArrowDownRight,
//   Bot,
//   GraduationCap,
//   PaintRoller as GameController2,
//   Newspaper,
// } from "lucide-react"
// import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// // Mock data for dashboard
// const portfolioData = [
//   { month: "Jan", value: 45000 },
//   { month: "Feb", value: 47500 },
//   { month: "Mar", value: 46800 },
//   { month: "Apr", value: 49200 },
//   { month: "May", value: 52100 },
//   { month: "Jun", value: 54300 },
// ]

// const quickStats = [
//   {
//     title: "Portfolio Value",
//     value: "$54,321",
//     change: "+12.5%",
//     trend: "up",
//     icon: DollarSign,
//   },
//   {
//     title: "Monthly Return",
//     value: "+4.2%",
//     change: "+0.8%",
//     trend: "up",
//     icon: TrendingUp,
//   },
//   {
//     title: "Active Positions",
//     value: "23",
//     change: "+3",
//     trend: "up",
//     icon: BarChart3,
//   },
//   {
//     title: "Risk Score",
//     value: "7.2/10",
//     change: "-0.3",
//     trend: "down",
//     icon: Users,
//   },
// ]

// const quickActions = [
//   {
//     title: "AI Financial Advisor",
//     description: "Get personalized investment advice",
//     icon: Bot,
//     href: "/chat",
//     badge: "New",
//   },
//   {
//     title: "Learning Hub",
//     description: "Expand your financial knowledge",
//     icon: GraduationCap,
//     href: "/learning",
//     badge: null,
//   },
//   {
//     title: "Trading Simulator",
//     description: "Practice trading risk-free",
//     icon: GameController2,
//     href: "/simulator",
//     badge: "Practice",
//   },
//   {
//     title: "Market News",
//     description: "Stay updated with latest trends",
//     icon: Newspaper,
//     href: "/news",
//     badge: null,
//   },
// ]

// export default function HomePage() {
//   return (
//     <>
//       <SidebarInset>
//         <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
//           <div className="flex items-center gap-2 px-4">
//             <SidebarTrigger className="-ml-1" />
//             <div className="h-4 w-px bg-sidebar-border" />
//             <h1 className="text-lg font-semibold">Dashboard</h1>
//           </div>
//           <div className="ml-auto px-4">
//             <Button size="sm" className="gap-2" asChild>
//               <Link href="/dashboard/chat">
//                 <Bot className="h-4 w-4" />
//                 Ask AI Advisor
//               </Link>
//             </Button>
//           </div>
//         </header>

//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//           {/* Welcome Section */}
//           <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-2xl font-bold text-balance">Welcome back, Alex!</h2>
//                 <p className="text-muted-foreground mt-1">
//                   Your portfolio is performing well. Here's your financial overview.
//                 </p>
//               </div>
//               <div className="text-right">
//                 <div className="text-sm text-muted-foreground">Total Portfolio</div>
//                 <div className="text-3xl font-bold text-primary">$54,321</div>
//                 <div className="flex items-center gap-1 text-sm text-green-600">
//                   <ArrowUpRight className="h-4 w-4" />
//                   +12.5% this month
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Stats */}
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//             {quickStats.map((stat) => (
//               <Card key={stat.title} className="hover:shadow-md transition-shadow">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
//                   <stat.icon className="h-4 w-4 text-muted-foreground" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">{stat.value}</div>
//                   <div
//                     className={`flex items-center gap-1 text-xs ${
//                       stat.trend === "up" ? "text-green-600" : "text-red-600"
//                     }`}
//                   >
//                     {stat.trend === "up" ? (
//                       <ArrowUpRight className="h-3 w-3" />
//                     ) : (
//                       <ArrowDownRight className="h-3 w-3" />
//                     )}
//                     {stat.change} from last month
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           <div className="grid gap-4 md:grid-cols-2">
//             {/* Portfolio Chart */}
//             <Card className="col-span-1">
//               <CardHeader>
//                 <CardTitle>Portfolio Performance</CardTitle>
//                 <CardDescription>Your portfolio value over the last 6 months</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={200}>
//                   <LineChart data={portfolioData}>
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Portfolio Value"]} />
//                     <Line
//                       type="monotone"
//                       dataKey="value"
//                       stroke="hsl(var(--primary))"
//                       strokeWidth={3}
//                       dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             {/* Quick Actions */}
//             <Card className="col-span-1">
//               <CardHeader>
//                 <CardTitle>Quick Actions</CardTitle>
//                 <CardDescription>Access key platform features</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {quickActions.map((action) => (
//                   <Link key={action.title} href={action.href}>
//                     <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 rounded-lg bg-primary/10">
//                           <action.icon className="h-4 w-4 text-primary" />
//                         </div>
//                         <div>
//                           <div className="font-medium text-sm">{action.title}</div>
//                           <div className="text-xs text-muted-foreground">{action.description}</div>
//                         </div>
//                       </div>
//                       {action.badge && (
//                         <Badge variant="secondary" className="text-xs">
//                           {action.badge}
//                         </Badge>
//                       )}
//                     </div>
//                   </Link>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </SidebarInset>
//     </>
//   )
// }


"use client"
import { useCurrentUser } from "@/hooks/use-current-user"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SignOutButton from "@/components/logout";
import Link from "next/link"
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  GraduationCap,
  PaintRoller as GameController2,
  Newspaper,
} from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

// Mock data for dashboard
const portfolioData = [
  { month: "Jan", value: 45000 },
  { month: "Feb", value: 47500 },
  { month: "Mar", value: 46800 },
  { month: "Apr", value: 49200 },
  { month: "May", value: 52100 },
  { month: "Jun", value: 54300 },
]

const quickStats = [
  {
    title: "Portfolio Value",
    value: "$54,321",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Monthly Return",
    value: "+4.2%",
    change: "+0.8%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Active Positions",
    value: "23",
    change: "+3",
    trend: "up",
    icon: BarChart3,
  },
  {
    title: "Risk Score",
    value: "7.2/10",
    change: "-0.3",
    trend: "down",
    icon: Users,
  },
]

const quickActions = [
  {
    title: "AI Financial Advisor",
    description: "Get personalized investment advice",
    icon: Bot,
    href: "dashboard/chat",
    badge: "New",
  },
  {
    title: "Learning Hub",
    description: "Expand your financial knowledge",
    icon: GraduationCap,
    href: "dashboard/learning",
    badge: null,
  },
  {
    title: "Trading Simulator",
    description: "Practice trading risk-free",
    icon: GameController2,
    href: "dashboard/simulator",
    badge: "Practice",
  },
  {
    title: "Market News",
    description: "Stay updated with latest trends",
    icon: Newspaper,
    href: "dashboard/news",
    badge: null,
  },
]

export default function HomePage() {
  const { user, isPending } = useCurrentUser()
  const username = user?.name || "User"
  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="ml-auto px-4">
            <Button size="sm" className="gap-2" asChild>
              <Link href="/dashboard/chat">
                <Bot className="h-4 w-4" />
                Ask AI Advisor
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Welcome Section */}
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-balance">
  Welcome back, {username}!
</h2>
                <p className="text-muted-foreground mt-1">
                  Your portfolio is performing well. Here's your financial overview.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Portfolio</div>
                <div className="text-3xl font-bold text-primary">$54,321</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  +12.5% this month
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickStats.map((stat) => (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change} from last month
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Portfolio Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>Your portfolio value over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={portfolioData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Portfolio Value"]} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Access key platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Link key={action.title} href={action.href}>
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <action.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{action.title}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </div>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}


