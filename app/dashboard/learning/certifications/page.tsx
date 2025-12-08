"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, CheckCircle, Clock, BookOpen, Target, Star } from "lucide-react"

// Certification data
const certifications = [
  {
    id: 1,
    title: "Certified Investment Fundamentals",
    description: "Demonstrate your knowledge of basic investment principles and portfolio management.",
    level: "Beginner",
    duration: "2 hours",
    questions: 50,
    passingScore: 80,
    earned: true,
    earnedDate: "2024-01-15",
    badge: "/investment-fundamentals-certificate-badge.jpg",
    prerequisites: ["Investment Fundamentals Course"],
    skills: ["Portfolio Basics", "Risk Assessment", "Asset Classes"],
  },
  {
    id: 2,
    title: "Advanced Portfolio Manager",
    description: "Prove your expertise in advanced portfolio construction and risk management strategies.",
    level: "Advanced",
    duration: "3 hours",
    questions: 75,
    passingScore: 85,
    earned: true,
    earnedDate: "2024-02-20",
    badge: "/portfolio-manager-certificate-badge.jpg",
    prerequisites: ["Portfolio Diversification Course", "Risk Management Course"],
    skills: ["Advanced Diversification", "Risk Modeling", "Performance Attribution"],
  },
  {
    id: 3,
    title: "Financial Risk Analyst",
    description: "Validate your ability to identify, measure, and manage various types of financial risks.",
    level: "Intermediate",
    duration: "2.5 hours",
    questions: 60,
    passingScore: 82,
    earned: false,
    progress: 65,
    badge: "/risk-analyst-certificate-badge.jpg",
    prerequisites: ["Risk Management Essentials", "Portfolio Analytics"],
    skills: ["Risk Metrics", "Stress Testing", "Regulatory Compliance"],
  },
  {
    id: 4,
    title: "Technical Analysis Expert",
    description: "Showcase your mastery of chart patterns, indicators, and technical trading strategies.",
    level: "Advanced",
    duration: "4 hours",
    questions: 100,
    passingScore: 85,
    earned: false,
    progress: 20,
    badge: "/technical-analysis-certificate-badge.jpg",
    prerequisites: ["Technical Analysis Mastery", "Trading Psychology"],
    skills: ["Chart Patterns", "Technical Indicators", "Market Timing"],
  },
  {
    id: 5,
    title: "Cryptocurrency Specialist",
    description: "Demonstrate comprehensive knowledge of digital assets and blockchain technology.",
    level: "Intermediate",
    duration: "3 hours",
    questions: 80,
    passingScore: 80,
    earned: false,
    progress: 0,
    badge: "/cryptocurrency-specialist-certificate-badge.jpg",
    prerequisites: ["Cryptocurrency Investing", "Blockchain Fundamentals"],
    skills: ["Digital Assets", "DeFi Protocols", "Crypto Security"],
  },
  {
    id: 6,
    title: "Retirement Planning Advisor",
    description: "Validate your expertise in retirement planning strategies and wealth preservation.",
    level: "Intermediate",
    duration: "2.5 hours",
    questions: 65,
    passingScore: 83,
    earned: false,
    progress: 0,
    badge: "/retirement-planning-certificate-badge.jpg",
    prerequisites: ["Retirement Planning 101", "Tax-Advantaged Accounts"],
    skills: ["Retirement Strategies", "Tax Planning", "Estate Planning"],
  },
]

const stats = [
  { label: "Certificates Earned", value: "2", total: "6", icon: Award },
  { label: "In Progress", value: "2", icon: Clock },
  { label: "Success Rate", value: "100%", icon: Target },
  { label: "Industry Recognition", value: "Verified", icon: CheckCircle },
]

export default function CertificationsPage() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-700"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "Advanced":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Certifications</h1>
            </div>
          </div>
          <div className="ml-auto px-4 flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Star className="h-4 w-4" />
              View Credentials
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Earned Certificates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Earned Certificates
              </CardTitle>
              <CardDescription>Your professional achievements and credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {certifications
                  .filter((cert) => cert.earned)
                  .map((cert) => (
                    <div key={cert.id} className="p-4 rounded-lg border bg-green-50 border-green-200">
                      <div className="flex items-start gap-4">
                        <img src={cert.badge || "/placeholder.svg"} alt={cert.title} className="w-16 h-16 rounded-lg" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{cert.title}</h3>
                            <Badge className={getLevelColor(cert.level)}>{cert.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span>Earned: {cert.earnedDate}</span>
                            <span>Score: {cert.passingScore}%+</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {cert.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Available Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Available Certifications</CardTitle>
              <CardDescription>Professional credentials you can earn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certifications
                  .filter((cert) => !cert.earned)
                  .map((cert) => (
                    <div key={cert.id} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <img
                          src={cert.badge || "/placeholder.svg"}
                          alt={cert.title}
                          className="w-16 h-16 rounded-lg opacity-60"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{cert.title}</h3>
                            <Badge className={getLevelColor(cert.level)}>{cert.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {cert.duration}
                            </span>
                            <span>{cert.questions} questions</span>
                            <span>Pass: {cert.passingScore}%</span>
                          </div>
                          {cert.progress > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Preparation Progress</span>
                                <span>{cert.progress}%</span>
                              </div>
                              <Progress value={cert.progress} className="h-2" />
                            </div>
                          )}
                          <div className="space-y-2">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Prerequisites:</h4>
                              <div className="flex flex-wrap gap-1">
                                {cert.prerequisites.map((prereq) => (
                                  <Badge key={prereq} variant="outline" className="text-xs">
                                    {prereq}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Skills Validated:</h4>
                              <div className="flex flex-wrap gap-1">
                                {cert.skills.map((skill) => (
                                  <Badge key={skill} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-muted-foreground">
                              {cert.progress > 0 ? "Continue preparation" : "Start preparation"}
                            </span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Study Guide
                              </Button>
                              <Button size="sm" disabled={cert.progress < 80}>
                                <Award className="h-4 w-4 mr-2" />
                                Take Exam
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  )
}
