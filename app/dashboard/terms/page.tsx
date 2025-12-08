"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <h1 className="text-lg font-semibold">Terms of Service</h1>
          </div>
          <div className="ml-auto px-4">
            <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Terms of Service
              </CardTitle>
              <p className="text-sm text-muted-foreground">Last updated: December 10, 2024</p>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using FinanceAI Pro Platform ("the Service"), you accept and agree to be bound by the
                terms and provision of this agreement.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                FinanceAI provides AI-powered financial advisory services, portfolio management tools, educational
                resources, and trading simulation capabilities. The Service is designed to assist users in making
                informed financial decisions.
              </p>

              <h2>3. User Responsibilities</h2>
              <ul>
                <li>You must be at least 18 years old to use this Service</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree to provide accurate and complete information</li>
                <li>You will not use the Service for any unlawful purposes</li>
              </ul>

              <h2>4. Financial Disclaimer</h2>
              <p>
                <strong>Important:</strong> The information provided by FinanceAI is for educational and informational
                purposes only and should not be considered as financial advice. All investment decisions should be made
                based on your own research and consultation with qualified financial professionals.
              </p>

              <h2>5. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
                protect your information.
              </p>

              <h2>6. Limitation of Liability</h2>
              <p>
                FinanceAI shall not be liable for any direct, indirect, incidental, special, or consequential damages
                resulting from the use or inability to use the Service.
              </p>

              <h2>7. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of significant changes
                via email or through the platform.
              </p>

              <h2>8. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
                <br />
                Email: legal@financeai.com
                <br />
                Phone: 1-800-FINANCE
              </p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  )
}
