"use client"

import { RouteGuard } from "@/components/auth/route-guard"

export default function CoordenadorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard requiredRole="coordinator">
      {children}
    </RouteGuard>
  )
}

