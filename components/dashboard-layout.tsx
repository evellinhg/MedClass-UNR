import type React from "react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { PlanExpiredBanner } from "@/components/plan-expired-banner"
import { FreePlanBanner } from "@/components/free-plan-banner"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <CollapsibleSidebar />

      {/* Main column */}
      <div className="min-w-0 flex-1">
        <DashboardHeader />
        <PlanExpiredBanner />
        <FreePlanBanner />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
