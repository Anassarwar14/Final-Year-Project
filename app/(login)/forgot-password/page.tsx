"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ArrowLeft, Mail, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold">FinanceAI</h1>
                <p className="text-sm text-muted-foreground">Pro Platform</p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-lg text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Check your email</CardTitle>
                <CardDescription className="mt-2">
                  We've sent a password reset link to your email address. Click the link to reset your password.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/sign-in">Back to Login</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Didn't receive an email?{" "}
                <Button variant="link" className="p-0 h-auto text-primary" onClick={() => setIsSubmitted(false)}>
                  Try again
                </Button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wallet className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold">FinanceAI</h1>
              <p className="text-sm text-muted-foreground">Pro Platform</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-balance">Reset your password</h2>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Reset Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Forgot Password
            </CardTitle>
            <CardDescription>We'll send you a reset link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="alex@example.com" required className="h-11" />
              </div>
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to login */}
        <div className="text-center">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
