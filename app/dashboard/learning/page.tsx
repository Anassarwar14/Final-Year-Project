// "use client"

// import { AppSidebar } from "@/components/app-sidebar"
// import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import {
//   GraduationCap,
//   BookOpen,
//   Award,
//   Clock,
//   Users,
//   Star,
//   Play,
//   CheckCircle,
//   TrendingUp,
//   Shield,
//   Target,
//   Zap,
// } from "lucide-react"

// // Learning data
// const learningStats = [
//   { label: "Courses Completed", value: "12", total: "24", icon: BookOpen },
//   { label: "Certificates Earned", value: "3", total: "8", icon: Award },
//   { label: "Learning Hours", value: "47", total: "100", icon: Clock },
//   { label: "Skill Level", value: "Intermediate", progress: 65, icon: TrendingUp },
// ]

// const featuredCourses = [
//   {
//     id: 1,
//     title: "Investment Fundamentals",
//     description: "Master the basics of investing, from stocks to bonds and everything in between.",
//     level: "Beginner",
//     duration: "4 hours",
//     lessons: 12,
//     rating: 4.8,
//     students: 2847,
//     progress: 75,
//     instructor: "Sarah Johnson",
//     category: "Basics",
//     image: "/investment-fundamentals-course.jpg",
//   },
//   {
//     id: 2,
//     title: "Portfolio Diversification Strategies",
//     description: "Learn advanced techniques for building a well-diversified investment portfolio.",
//     level: "Intermediate",
//     duration: "6 hours",
//     lessons: 18,
//     rating: 4.9,
//     students: 1923,
//     progress: 30,
//     instructor: "Michael Chen",
//     category: "Advanced",
//     image: "/portfolio-diversification-course.jpg",
//   },
//   {
//     id: 3,
//     title: "Risk Management Essentials",
//     description: "Understand and manage investment risks to protect your portfolio.",
//     level: "Intermediate",
//     duration: "5 hours",
//     lessons: 15,
//     rating: 4.7,
//     students: 3156,
//     progress: 0,
//     instructor: "Emily Rodriguez",
//     category: "Risk Management",
//     image: "/risk-management-course.png",
//   },
// ]

// const learningPaths = [
//   {
//     title: "Beginner Investor",
//     description: "Start your investment journey with fundamental concepts",
//     courses: 6,
//     duration: "20 hours",
//     icon: Target,
//     color: "bg-green-100 text-green-700",
//   },
//   {
//     title: "Portfolio Builder",
//     description: "Learn to construct and manage diversified portfolios",
//     courses: 8,
//     duration: "32 hours",
//     icon: Shield,
//     color: "bg-blue-100 text-blue-700",
//   },
//   {
//     title: "Advanced Trader",
//     description: "Master advanced trading strategies and market analysis",
//     courses: 10,
//     duration: "45 hours",
//     icon: Zap,
//     color: "bg-purple-100 text-purple-700",
//   },
// ]

// const achievements = [
//   { title: "First Course Completed", icon: BookOpen, earned: true },
//   { title: "Portfolio Master", icon: Award, earned: true },
//   { title: "Risk Analyst", icon: Shield, earned: true },
//   { title: "Market Expert", icon: TrendingUp, earned: false },
//   { title: "Trading Pro", icon: Zap, earned: false },
// ]

// export default function LearningPage() {
//   return (
//     <>
//       <SidebarInset>
//         <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
//           <div className="flex items-center gap-2 px-4">
//             <SidebarTrigger className="-ml-1" />
//             <div className="h-4 w-px bg-sidebar-border" />
//             <div className="flex items-center gap-2">
//               <GraduationCap className="h-5 w-5 text-primary" />
//               <h1 className="text-lg font-semibold">Learning Hub</h1>
//             </div>
//           </div>
//           <div className="ml-auto px-4 flex items-center gap-2">
//             <Button variant="outline" size="sm" className="gap-2 bg-transparent">
//               <Users className="h-4 w-4" />
//               Study Groups
//             </Button>
//             <Button size="sm" className="gap-2">
//               <Play className="h-4 w-4" />
//               Continue Learning
//             </Button>
//           </div>
//         </header>

//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//           {/* Welcome Banner */}
//           <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h2 className="text-2xl font-bold text-balance">Welcome back, Alex!</h2>
//                 <p className="text-muted-foreground mt-1">
//                   You're making great progress. Keep learning to master your financial future.
//                 </p>
//               </div>
//               <div className="text-right">
//                 <div className="text-sm text-muted-foreground">Overall Progress</div>
//                 <div className="text-3xl font-bold text-primary">65%</div>
//                 <div className="text-sm text-muted-foreground">Intermediate Level</div>
//               </div>
//             </div>
//           </div>

//           {/* Learning Stats */}
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//             {learningStats.map((stat) => (
//               <Card key={stat.label} className="hover:shadow-md transition-shadow">
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
//                   <stat.icon className="h-4 w-4 text-muted-foreground" />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-2xl font-bold">
//                     {stat.value}
//                     {stat.total && <span className="text-sm text-muted-foreground">/{stat.total}</span>}
//                   </div>
//                   {stat.progress && (
//                     <div className="mt-2">
//                       <Progress value={stat.progress} className="h-2" />
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           <div className="grid gap-4 md:grid-cols-3">
//             {/* Featured Courses */}
//             <div className="md:col-span-2">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Continue Learning</CardTitle>
//                   <CardDescription>Pick up where you left off</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {featuredCourses.map((course) => (
//                       <div
//                         key={course.id}
//                         className="flex gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
//                       >
//                         <img
//                           src={course.image || "/placeholder.svg"}
//                           alt={course.title}
//                           className="w-20 h-20 rounded-lg object-cover"
//                         />
//                         <div className="flex-1">
//                           <div className="flex items-start justify-between mb-2">
//                             <div>
//                               <h4 className="font-semibold">{course.title}</h4>
//                               <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
//                             </div>
//                             <Badge variant="secondary">{course.level}</Badge>
//                           </div>
//                           <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
//                             <span className="flex items-center gap-1">
//                               <Clock className="h-3 w-3" />
//                               {course.duration}
//                             </span>
//                             <span className="flex items-center gap-1">
//                               <BookOpen className="h-3 w-3" />
//                               {course.lessons} lessons
//                             </span>
//                             <span className="flex items-center gap-1">
//                               <Star className="h-3 w-3 fill-current text-yellow-500" />
//                               {course.rating}
//                             </span>
//                             <span className="flex items-center gap-1">
//                               <Users className="h-3 w-3" />
//                               {course.students.toLocaleString()}
//                             </span>
//                           </div>
//                           {course.progress > 0 && (
//                             <div className="space-y-1">
//                               <div className="flex justify-between text-xs">
//                                 <span>Progress</span>
//                                 <span>{course.progress}%</span>
//                               </div>
//                               <Progress value={course.progress} className="h-1" />
//                             </div>
//                           )}
//                           <div className="flex items-center justify-between mt-3">
//                             <span className="text-xs text-muted-foreground">by {course.instructor}</span>
//                             <Button size="sm" variant={course.progress > 0 ? "default" : "outline"}>
//                               {course.progress > 0 ? "Continue" : "Start Course"}
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Learning Paths & Achievements */}
//             <div className="space-y-4">
//               {/* Learning Paths */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Learning Paths</CardTitle>
//                   <CardDescription>Structured learning journeys</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     {learningPaths.map((path) => (
//                       <div key={path.title} className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
//                         <div className="flex items-start gap-3">
//                           <div className={`p-2 rounded-lg ${path.color}`}>
//                             <path.icon className="h-4 w-4" />
//                           </div>
//                           <div className="flex-1">
//                             <h4 className="font-medium text-sm">{path.title}</h4>
//                             <p className="text-xs text-muted-foreground mb-2">{path.description}</p>
//                             <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                               <span>{path.courses} courses</span>
//                               <span>•</span>
//                               <span>{path.duration}</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Achievements */}
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Achievements</CardTitle>
//                   <CardDescription>Your learning milestones</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     {achievements.map((achievement) => (
//                       <div
//                         key={achievement.title}
//                         className={`flex items-center gap-3 p-2 rounded-lg ${
//                           achievement.earned ? "bg-primary/10" : "bg-muted/50"
//                         }`}
//                       >
//                         <div
//                           className={`p-2 rounded-lg ${
//                             achievement.earned ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
//                           }`}
//                         >
//                           {achievement.earned ? (
//                             <CheckCircle className="h-4 w-4" />
//                           ) : (
//                             <achievement.icon className="h-4 w-4" />
//                           )}
//                         </div>
//                         <span
//                           className={`text-sm font-medium ${
//                             achievement.earned ? "text-foreground" : "text-muted-foreground"
//                           }`}
//                         >
//                           {achievement.title}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>

//           {/* Quick Access */}
//           <div className="grid gap-4 md:grid-cols-4">
//             <Card className="hover:shadow-md transition-shadow cursor-pointer">
//               <CardContent className="p-6 text-center">
//                 <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
//                 <h3 className="font-semibold mb-1">All Courses</h3>
//                 <p className="text-sm text-muted-foreground">Browse our complete catalog</p>
//               </CardContent>
//             </Card>
//             <Card className="hover:shadow-md transition-shadow cursor-pointer">
//               <CardContent className="p-6 text-center">
//                 <Target className="h-8 w-8 text-primary mx-auto mb-2" />
//                 <h3 className="font-semibold mb-1">Market Basics</h3>
//                 <p className="text-sm text-muted-foreground">Essential investing concepts</p>
//               </CardContent>
//             </Card>
//             <Card className="hover:shadow-md transition-shadow cursor-pointer">
//               <CardContent className="p-6 text-center">
//                 <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
//                 <h3 className="font-semibold mb-1">Advanced Strategies</h3>
//                 <p className="text-sm text-muted-foreground">Professional techniques</p>
//               </CardContent>
//             </Card>
//             <Card className="hover:shadow-md transition-shadow cursor-pointer">
//               <CardContent className="p-6 text-center">
//                 <Award className="h-8 w-8 text-primary mx-auto mb-2" />
//                 <h3 className="font-semibold mb-1">Certifications</h3>
//                 <p className="text-sm text-muted-foreground">Earn recognized credentials</p>
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
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle,
  TrendingUp,
  Shield,
  Target,
  Zap,
} from "lucide-react"

// Learning data
const learningStats = [
  { label: "Courses Completed", value: "12", total: "24", icon: BookOpen },
  { label: "Certificates Earned", value: "3", total: "8", icon: Award },
  { label: "Learning Hours", value: "47", total: "100", icon: Clock },
  { label: "Skill Level", value: "Intermediate", progress: 65, icon: TrendingUp },
]

const featuredCourses = [
  {
    id: 1,
    title: "Investment Fundamentals",
    description: "Master the basics of investing, from stocks to bonds and everything in between.",
    level: "Beginner",
    duration: "4 hours",
    lessons: 12,
    rating: 4.8,
    students: 2847,
    progress: 75,
    instructor: "Sarah Johnson",
    category: "Basics",
    image: "/investment-fundamentals-course.jpg",
  },
  {
    id: 2,
    title: "Portfolio Diversification Strategies",
    description: "Learn advanced techniques for building a well-diversified investment portfolio.",
    level: "Intermediate",
    duration: "6 hours",
    lessons: 18,
    rating: 4.9,
    students: 1923,
    progress: 30,
    instructor: "Michael Chen",
    category: "Advanced",
    image: "/portfolio-diversification-course.jpg",
  },
  {
    id: 3,
    title: "Risk Management Essentials",
    description: "Understand and manage investment risks to protect your portfolio.",
    level: "Intermediate",
    duration: "5 hours",
    lessons: 15,
    rating: 4.7,
    students: 3156,
    progress: 0,
    instructor: "Emily Rodriguez",
    category: "Risk Management",
    image: "/risk-management-course.png",
  },
]

const learningPaths = [
  {
    title: "Beginner Investor",
    description: "Start your investment journey with fundamental concepts",
    courses: 6,
    duration: "20 hours",
    icon: Target,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Portfolio Builder",
    description: "Learn to construct and manage diversified portfolios",
    courses: 8,
    duration: "32 hours",
    icon: Shield,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Advanced Trader",
    description: "Master advanced trading strategies and market analysis",
    courses: 10,
    duration: "45 hours",
    icon: Zap,
    color: "bg-purple-100 text-purple-700",
  },
]

const achievements = [
  { title: "First Course Completed", icon: BookOpen, earned: true },
  { title: "Portfolio Master", icon: Award, earned: true },
  { title: "Risk Analyst", icon: Shield, earned: true },
  { title: "Market Expert", icon: TrendingUp, earned: false },
  { title: "Trading Pro", icon: Zap, earned: false },
]

export default function LearningPage() {
   const { user, isPending } = useCurrentUser()
   const username = user?.name || "User"
  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Learning Hub</h1>
            </div>
          </div>
          <div className="ml-auto px-4 flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Users className="h-4 w-4" />
              Study Groups
            </Button>
            <Button size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Continue Learning
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Welcome Banner */}
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-balance">
  Welcome back, {username}!
</h2>
                <p className="text-muted-foreground mt-1">
                  You're making great progress. Keep learning to master your financial future.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Overall Progress</div>
                <div className="text-3xl font-bold text-primary">65%</div>
                <div className="text-sm text-muted-foreground">Intermediate Level</div>
              </div>
            </div>
          </div>

          {/* Learning Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {learningStats.map((stat) => (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.value}
                    {stat.total && <span className="text-sm text-muted-foreground">/{stat.total}</span>}
                  </div>
                  {stat.progress && (
                    <div className="mt-2">
                      <Progress value={stat.progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Featured Courses */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Continue Learning</CardTitle>
                  <CardDescription>Pick up where you left off</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featuredCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <img
                          src={course.image || "/placeholder.svg"}
                          alt={course.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{course.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                            </div>
                            <Badge variant="secondary">{course.level}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {course.lessons} lessons
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              {course.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {course.students.toLocaleString()}
                            </span>
                          </div>
                          {course.progress > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="h-1" />
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">by {course.instructor}</span>
                            <Button size="sm" variant={course.progress > 0 ? "default" : "outline"}>
                              {course.progress > 0 ? "Continue" : "Start Course"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Paths & Achievements */}
            <div className="space-y-4">
              {/* Learning Paths */}
              <Card>
                <CardHeader>
                  <CardTitle>Learning Paths</CardTitle>
                  <CardDescription>Structured learning journeys</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningPaths.map((path) => (
                      <div key={path.title} className="p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${path.color}`}>
                            <path.icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{path.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{path.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{path.courses} courses</span>
                              <span>•</span>
                              <span>{path.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Your learning milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.title}
                        className={`flex items-center gap-3 p-2 rounded-lg ${
                          achievement.earned ? "bg-primary/10" : "bg-muted/50"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            achievement.earned ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {achievement.earned ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <achievement.icon className="h-4 w-4" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            achievement.earned ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {achievement.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">All Courses</h3>
                <p className="text-sm text-muted-foreground">Browse our complete catalog</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Market Basics</h3>
                <p className="text-sm text-muted-foreground">Essential investing concepts</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Advanced Strategies</h3>
                <p className="text-sm text-muted-foreground">Professional techniques</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Certifications</h3>
                <p className="text-sm text-muted-foreground">Earn recognized credentials</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}

