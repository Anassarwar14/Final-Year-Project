"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Target,
  TrendingUp,
  Shield,
  DollarSign,
  BookOpen,
  Lightbulb,
  Rocket,
} from "lucide-react"

interface OnboardingStep {
  id: number
  title: string
  description: string
  type: "welcome" | "assessment" | "goals" | "risk" | "experience" | "interests" | "complete"
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to FinanceAI Learning",
    description: "Let's personalize your learning journey",
    type: "welcome",
  },
  {
    id: 2,
    title: "Investment Experience",
    description: "Help us understand your current knowledge level",
    type: "experience",
  },
  {
    id: 3,
    title: "Financial Goals",
    description: "What do you want to achieve with investing?",
    type: "goals",
  },
  {
    id: 4,
    title: "Risk Assessment",
    description: "Let's determine your risk tolerance",
    type: "risk",
  },
  {
    id: 5,
    title: "Learning Interests",
    description: "Which topics interest you most?",
    type: "interests",
  },
  {
    id: 6,
    title: "You're All Set!",
    description: "Your personalized learning path is ready",
    type: "complete",
  },
]

const experienceOptions = [
  { value: "beginner", label: "Complete Beginner", description: "I'm new to investing" },
  { value: "some", label: "Some Experience", description: "I've done basic investing" },
  { value: "intermediate", label: "Intermediate", description: "I have a diversified portfolio" },
  { value: "advanced", label: "Advanced", description: "I actively manage investments" },
]

const goalOptions = [
  { value: "retirement", label: "Retirement Planning", icon: Target },
  { value: "wealth", label: "Wealth Building", icon: TrendingUp },
  { value: "income", label: "Passive Income", icon: DollarSign },
  { value: "education", label: "Education Funding", icon: BookOpen },
]

const riskQuestions = [
  {
    question: "If your investment lost 20% in a month, you would:",
    options: [
      { value: "sell", label: "Sell immediately to prevent further losses", score: 1 },
      { value: "wait", label: "Wait and see what happens", score: 2 },
      { value: "hold", label: "Hold and maybe buy more", score: 3 },
      { value: "buy", label: "Definitely buy more at the lower price", score: 4 },
    ],
  },
  {
    question: "Your investment time horizon is:",
    options: [
      { value: "short", label: "Less than 2 years", score: 1 },
      { value: "medium", label: "2-5 years", score: 2 },
      { value: "long", label: "5-10 years", score: 3 },
      { value: "very-long", label: "More than 10 years", score: 4 },
    ],
  },
]

const interestOptions = [
  { value: "stocks", label: "Stock Analysis", icon: TrendingUp },
  { value: "bonds", label: "Bonds & Fixed Income", icon: Shield },
  { value: "crypto", label: "Cryptocurrency", icon: Rocket },
  { value: "real-estate", label: "Real Estate", icon: Target },
  { value: "options", label: "Options Trading", icon: Lightbulb },
  { value: "etfs", label: "ETFs & Index Funds", icon: BookOpen },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  const currentStepData = onboardingSteps.find((step) => step.id === currentStep)
  const progress = (currentStep / onboardingSteps.length) * 100

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAnswer = (key: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const renderStepContent = () => {
    switch (currentStepData?.type) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Your Financial Learning Journey!</h2>
              <p className="text-muted-foreground">
                We'll ask you a few questions to create a personalized learning experience tailored to your goals and
                experience level.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium">Personalized</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium">Progressive</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Rocket className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium">Practical</p>
              </div>
            </div>
          </div>
        )

      case "experience":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What's your investment experience?</h2>
              <p className="text-muted-foreground">This helps us recommend the right starting point for you.</p>
            </div>
            <RadioGroup
              value={answers.experience}
              onValueChange={(value) => handleAnswer("experience", value)}
              className="space-y-3"
            >
              {experienceOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-4 rounded-lg border">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case "goals":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What are your financial goals?</h2>
              <p className="text-muted-foreground">Select all that apply to personalize your learning path.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {goalOptions.map((goal) => (
                <div
                  key={goal.value}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    answers.goals?.includes(goal.value) ? "bg-primary/10 border-primary" : "hover:bg-accent/50"
                  }`}
                  onClick={() => {
                    const currentGoals = answers.goals || []
                    const newGoals = currentGoals.includes(goal.value)
                      ? currentGoals.filter((g: string) => g !== goal.value)
                      : [...currentGoals, goal.value]
                    handleAnswer("goals", newGoals)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <goal.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{goal.label}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "risk":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Let's assess your risk tolerance</h2>
              <p className="text-muted-foreground">Answer these questions to help us understand your risk profile.</p>
            </div>
            <div className="space-y-6">
              {riskQuestions.map((question, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="font-medium">{question.question}</h3>
                  <RadioGroup
                    value={answers[`risk_${index}`]}
                    onValueChange={(value) => handleAnswer(`risk_${index}`, value)}
                    className="space-y-2"
                  >
                    {question.options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg border">
                        <RadioGroupItem value={option.value} id={`${index}_${option.value}`} />
                        <Label htmlFor={`${index}_${option.value}`} className="flex-1 cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>
        )

      case "interests":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What topics interest you most?</h2>
              <p className="text-muted-foreground">We'll prioritize these areas in your learning recommendations.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {interestOptions.map((interest) => (
                <div
                  key={interest.value}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    answers.interests?.includes(interest.value) ? "bg-primary/10 border-primary" : "hover:bg-accent/50"
                  }`}
                  onClick={() => {
                    const currentInterests = answers.interests || []
                    const newInterests = currentInterests.includes(interest.value)
                      ? currentInterests.filter((i: string) => i !== interest.value)
                      : [...currentInterests, interest.value]
                    handleAnswer("interests", newInterests)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <interest.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{interest.label}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Learning Path is Ready!</h2>
              <p className="text-muted-foreground">
                Based on your answers, we've created a personalized curriculum just for you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">12 Courses</h3>
                  <p className="text-sm text-muted-foreground">Curated for your level</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Goal-Focused</h3>
                  <p className="text-sm text-muted-foreground">Aligned with your objectives</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Progressive</h3>
                  <p className="text-sm text-muted-foreground">Builds on your knowledge</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Step {currentStep} of {onboardingSteps.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Step {currentStep}</Badge>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground">{currentStepData?.type}</span>
            </div>
          </CardHeader>
          <CardContent className="pb-8">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext} disabled={currentStep === onboardingSteps.length} className="gap-2">
            {currentStep === onboardingSteps.length ? "Start Learning" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
