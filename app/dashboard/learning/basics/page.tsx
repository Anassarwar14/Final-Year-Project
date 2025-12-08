"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  PieChart,
  Shield,
} from "lucide-react"

const basicCourses = [
  {
    id: 1,
    title: "What is Investing?",
    description: "Learn the fundamentals of investing and why it's important for your financial future",
    duration: "15 min",
    difficulty: "Beginner",
    progress: 100,
    completed: true,
    icon: TrendingUp,
  },
  {
    id: 2,
    title: "Understanding Risk and Return",
    description: "Explore the relationship between risk and potential returns in investments",
    duration: "20 min",
    difficulty: "Beginner",
    progress: 75,
    completed: false,
    icon: Shield,
  },
  {
    id: 3,
    title: "Types of Investments",
    description: "Discover different investment vehicles: stocks, bonds, ETFs, and mutual funds",
    duration: "25 min",
    difficulty: "Beginner",
    progress: 0,
    completed: false,
    icon: PieChart,
  },
  {
    id: 4,
    title: "Building Your First Portfolio",
    description: "Step-by-step guide to creating a diversified investment portfolio",
    duration: "30 min",
    difficulty: "Beginner",
    progress: 0,
    completed: false,
    icon: DollarSign,
  },
]

export default function MarketBasicsPage() {
  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <h1 className="text-lg font-semibold">Market Basics</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header Section */}
          <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-balance">Market Basics</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Master the fundamentals of investing and financial markets
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Course Progress</div>
                <div className="text-2xl font-bold text-primary">44%</div>
                <div className="text-sm text-muted-foreground">2 of 4 lessons completed</div>
              </div>
            </div>
          </div>

          {/* Course Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">4 Lessons</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Comprehensive introduction to investing fundamentals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">90 Minutes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Self-paced learning at your convenience</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">12,500+ Students</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Join thousands learning market basics</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Lessons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Course Lessons</h3>
            <div className="grid gap-4">
              {basicCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <course.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{course.title}</h4>
                          {course.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {course.duration}
                          </div>
                          <Badge variant="secondary">{course.difficulty}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={course.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground">{course.progress}%</span>
                        </div>
                      </div>
                      <Button className="gap-2">
                        {course.completed ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Review
                          </>
                        ) : course.progress > 0 ? (
                          <>
                            <Play className="h-4 w-4" />
                            Continue
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Ready for More?
              </CardTitle>
              <CardDescription>Continue your learning journey with advanced strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gap-2">
                <Link href="/learning/advanced">
                  Explore Advanced Strategies
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  )
}
