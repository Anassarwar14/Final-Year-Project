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
  BarChart3,
  Target,
  Zap,
  Lock,
} from "lucide-react"

const advancedCourses = [
  {
    id: 1,
    title: "Technical Analysis Mastery",
    description: "Learn to read charts, identify patterns, and make data-driven investment decisions",
    duration: "45 min",
    difficulty: "Advanced",
    progress: 0,
    completed: false,
    locked: false,
    icon: BarChart3,
  },
  {
    id: 2,
    title: "Options Trading Strategies",
    description: "Master complex options strategies for income generation and risk management",
    duration: "60 min",
    difficulty: "Advanced",
    progress: 0,
    completed: false,
    locked: false,
    icon: Target,
  },
  {
    id: 3,
    title: "Algorithmic Trading Basics",
    description: "Introduction to automated trading systems and quantitative strategies",
    duration: "50 min",
    difficulty: "Expert",
    progress: 0,
    completed: false,
    locked: true,
    icon: Zap,
  },
  {
    id: 4,
    title: "Alternative Investments",
    description: "Explore REITs, commodities, cryptocurrencies, and other alternative assets",
    duration: "40 min",
    difficulty: "Advanced",
    progress: 0,
    completed: false,
    locked: true,
    icon: TrendingUp,
  },
]

export default function AdvancedStrategiesPage() {
  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <h1 className="text-lg font-semibold">Advanced Strategies</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Header Section */}
          <div className="rounded-xl bg-gradient-to-r from-accent/10 via-accent/5 to-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-balance">Advanced Strategies</h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Master sophisticated investment techniques and strategies
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Prerequisites</div>
                <div className="text-lg font-semibold text-primary">Market Basics Complete</div>
                <div className="text-sm text-green-600">✓ Requirements met</div>
              </div>
            </div>
          </div>

          {/* Prerequisites Warning */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <Star className="h-5 w-5" />
                Advanced Content
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                These courses require solid understanding of market basics and intermediate concepts. Some content may
                be locked until prerequisites are completed.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Course Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">4 Advanced Courses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Professional-level investment strategies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">195 Minutes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">In-depth coverage of complex topics</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">3,200+ Students</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Elite community of advanced learners</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Lessons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Advanced Courses</h3>
            <div className="grid gap-4">
              {advancedCourses.map((course) => (
                <Card
                  key={course.id}
                  className={`hover:shadow-md transition-shadow ${course.locked ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${course.locked ? "bg-muted" : "bg-primary/10"}`}>
                        {course.locked ? (
                          <Lock className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <course.icon className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{course.title}</h4>
                          {course.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {course.locked && (
                            <Badge variant="outline" className="text-xs">
                              Locked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {course.duration}
                          </div>
                          <Badge variant={course.difficulty === "Expert" ? "destructive" : "secondary"}>
                            {course.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={course.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground">{course.progress}%</span>
                        </div>
                      </div>
                      <Button disabled={course.locked} className="gap-2">
                        {course.locked ? (
                          <>
                            <Lock className="h-4 w-4" />
                            Locked
                          </>
                        ) : course.completed ? (
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

          {/* Unlock More Content */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Unlock Expert Content
              </CardTitle>
              <CardDescription>
                Complete prerequisite courses to unlock advanced algorithmic trading and alternative investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button asChild className="gap-2">
                  <Link href="/learning/basics">
                    Complete Prerequisites
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/learning/certifications">View Certifications</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  )
}
