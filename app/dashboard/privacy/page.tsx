"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <h1 className="text-lg font-semibold">Privacy Policy</h1>
          </div>
          <div className="ml-auto px-4">
            <Button variant="outline" size="sm" asChild className="gap-2 bg-transparent">
              <Link href="/signup">
                <ArrowLeft className="h-4 w-4" />
                Back to Signup
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Policy
              </CardTitle>
              <p className="text-sm text-muted-foreground">Last updated: December 10, 2024</p>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <h2>1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, use our services,
                or contact us for support.
              </p>

              <h3>Personal Information</h3>
              <ul>
                <li>Name and contact information</li>
                <li>Financial information and investment preferences</li>
                <li>Account credentials and security information</li>
                <li>Communication preferences</li>
              </ul>

              <h3>Usage Information</h3>
              <ul>
                <li>How you interact with our platform</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Cookies and similar technologies</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and improve our financial advisory services</li>
                <li>Personalize your experience and recommendations</li>
                <li>Communicate with you about your account and our services</li>
                <li>Ensure the security and integrity of our platform</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your
                consent, except as described in this policy:
              </p>
              <ul>
                <li>With service providers who assist in our operations</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transaction</li>
              </ul>

              <h2>4. Data Security</h2>
              <p>We implement industry-standard security measures to protect your personal information, including:</p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
              </ul>

              <h2>5. Your Rights and Choices</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>

              <h2>6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide
                personalized content. You can control cookie settings through your browser.
              </p>

              <h2>7. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by
                posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2>8. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                Email: privacy@financeai.com
                <br />
                Phone: 1-800-FINANCE
                <br />
                Address: 123 Finance Street, New York, NY 10001
              </p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </>
  )
}
