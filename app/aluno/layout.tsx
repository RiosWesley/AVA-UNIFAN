"use client"

import { RouteGuard } from "@/components/auth/route-guard"

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard requiredRole="student">
      {children}
    </RouteGuard>
  )
}

