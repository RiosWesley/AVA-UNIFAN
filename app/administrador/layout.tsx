"use client"

import { RouteGuard } from "@/components/auth/route-guard"

export default function AdministradorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard requiredRole="admin">
      {children}
    </RouteGuard>
  )
}

