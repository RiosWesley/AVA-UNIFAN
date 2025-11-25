"use client"

import { RouteGuard } from "@/components/auth/route-guard"

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard requiredRole="teacher">
      {children}
    </RouteGuard>
  )
}

