"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Users, Star, Search, Filter, Play, Award, TrendingUp, Shield, Target } from "lucide-react"

// Course data
const allCourses = [
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
    price: "Free",
    image: "/investment-fundamentals-course.jpg",
    tags: ["Stocks", "Bonds", "Portfolio"],
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
    price: "Pro",
    image: "/portfolio-diversification-course.jpg",
    tags: ["Diversification", "Risk Management", "Asset Allocation"],
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
    price: "Free",
    image: "/risk-management-course.png",
    tags: ["Risk Assessment", "Hedging", "Insurance"],
  },
  {
    id: 4,
    title: "Technical Analysis Mastery",
    description: "Learn to read charts and identify trading opportunities using technical analysis.",
    level: "Advanced",
    duration: "8 hours",
    lessons: 24,
    rating: 4.6,
    students: 1456,
    progress: 0,
    instructor: "David Kim",
    category: "Trading",
    price: "Pro",
    image: "/technical-analysis-course.png",
    tags: ["Charts", "Indicators", "Trading"],
  },
  {
    id: 5,
    title: "Cryptocurrency Investing",
    description: "Navigate the world of digital assets and blockchain technology.",
    level: "Intermediate",
    duration: "6 hours",
    lessons: 20,
    rating: 4.5,
    students: 2234,
    progress: 0,
    instructor: "Alex Thompson",
    category: "Crypto",
    price: "Pro",
    image: "/cryptocurrency-investing-course.jpg",
    tags: ["Bitcoin", "Ethereum", "DeFi"],
  },
  {
    id: 6,
    title: "Retirement Planning 101",
    description: "Build a solid foundation for your retirement with smart planning strategies.",
    level: "Beginner",
    duration: "4 hours",
    lessons: 14,
    rating: 4.8,
    students: 3892,
    progress: 0,
    instructor: "Jennifer Walsh",
    category: "Planning",
    price: "Free",
    image: "/retirement-planning-course.jpg",
    tags: ["401k", "IRA", "Social Security"],
  },
]

const categories = [
  { value: "all", label: "All Categories", icon: BookOpen },
  { value: "basics", label: "Basics", icon: Target },
  { value: "advanced", label: "Advanced", icon: TrendingUp },
  { value: "risk", label: "Risk Management", icon: Shield },
  { value: "trading", label: "Trading", icon: Award },
]

export default function CoursesPage() {
  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Course Catalog</h1>
            </div>
          </div>
          <div className="ml-auto px-4 flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." className="pl-8 w-64" />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.value} value={category.value} className="gap-2">
                  <category.icon className="h-4 w-4" />
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant={course.price === "Free" ? "secondary" : "default"}>{course.price}</Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-white/90">
                          {course.level}
                        </Badge>
                      </div>
                      {course.progress > 0 && (
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="bg-white/90 rounded-lg p-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-1" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          {course.rating}
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.lessons} lessons
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {course.students.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {course.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">by {course.instructor}</span>
                        <Button size="sm" className="gap-2">
                          {course.progress > 0 ? (
                            <>
                              <Play className="h-4 w-4" />
                              Continue
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-4 w-4" />
                              Start Course
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Other tab contents would filter courses by category */}
            <TabsContent value="basics">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allCourses
                  .filter((course) => course.level === "Beginner")
                  .map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow">
                      {/* Same card structure as above */}
                      <div className="relative">
                        <img
                          src={course.image || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant={course.price === "Free" ? "secondary" : "default"}>{course.price}</Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge variant="outline" className="bg-white/90">
                            {course.level}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {course.lessons} lessons
                          </span>
                        </div>
                        <Button size="sm" className="w-full gap-2">
                          <BookOpen className="h-4 w-4" />
                          Start Course
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </>
  )
}
