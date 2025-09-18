"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThemeToggle } from "@/components/theme-toggle"
import { LiquidGlassSidebar } from "@/components/liquid-glass"
import {
  Home,
  BookOpen,
  FileText,
  GraduationCap,
  MessageSquare,
  CreditCard,
  Settings,
  Users,
  Calendar,
  BarChart3,
  Menu,
  X,
} from "lucide-react"

interface SidebarProps {
  userRole: "aluno" | "professor" | "coordenador" | "administrador"
}

const menuItems = {
  aluno: [
    { icon: Home, label: "Início", href: "/dashboard/aluno" },
    { icon: BookOpen, label: "Disciplinas", href: "/dashboard/aluno/disciplinas" },
    { icon: FileText, label: "Atividades", href: "/dashboard/aluno/atividades" },
    { icon: GraduationCap, label: "Boletim", href: "/dashboard/aluno/boletim" },
    { icon: MessageSquare, label: "Comunicação", href: "/dashboard/aluno/comunicacao" },
    { icon: CreditCard, label: "Financeiro", href: "/dashboard/aluno/financeiro" },
    { icon: Settings, label: "Configurações", href: "/dashboard/aluno/configuracoes" },
  ],
  professor: [
    { icon: Home, label: "Início", href: "/dashboard/professor" },
    { icon: BookOpen, label: "Turmas", href: "/dashboard/professor/turmas" },
    { icon: FileText, label: "Atividades", href: "/dashboard/professor/atividades" },
    { icon: GraduationCap, label: "Notas", href: "/dashboard/professor/notas" },
    { icon: Calendar, label: "Agenda", href: "/dashboard/professor/agenda" },
    { icon: MessageSquare, label: "Comunicação", href: "/dashboard/professor/comunicacao" },
    { icon: Settings, label: "Configurações", href: "/dashboard/professor/configuracoes" },
  ],
  coordenador: [
    { icon: Home, label: "Início", href: "/dashboard/coordenador" },
    { icon: BookOpen, label: "Cursos", href: "/dashboard/coordenador/cursos" },
    { icon: Users, label: "Professores", href: "/dashboard/coordenador/professores" },
    { icon: Calendar, label: "Grade Horária", href: "/dashboard/coordenador/grade" },
    { icon: BarChart3, label: "Relatórios", href: "/dashboard/coordenador/relatorios" },
    { icon: MessageSquare, label: "Comunicação", href: "/dashboard/coordenador/comunicacao" },
    { icon: Settings, label: "Configurações", href: "/dashboard/coordenador/configuracoes" },
  ],
  administrador: [
    { icon: Home, label: "Início", href: "/dashboard/administrador" },
    { icon: Users, label: "Usuários", href: "/dashboard/administrador/usuarios" },
    { icon: BookOpen, label: "Cursos", href: "/dashboard/administrador/cursos" },
    { icon: CreditCard, label: "Financeiro", href: "/dashboard/administrador/financeiro" },
    { icon: BarChart3, label: "Relatórios", href: "/dashboard/administrador/relatorios" },
    { icon: MessageSquare, label: "Comunicação", href: "/dashboard/administrador/comunicacao" },
    { icon: Settings, label: "Configurações", href: "/dashboard/administrador/configuracoes" },
  ],
}

export function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const items = menuItems[userRole]

  // Persist user role for background scoping
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("ava:userRole")
      if (stored !== userRole) {
        window.localStorage.setItem("ava:userRole", userRole)
      }
    } catch {}
  }

  return (
    <LiquidGlassSidebar
      className={cn("relative flex flex-col h-full transition-all duration-300", isCollapsed ? "w-16" : "w-64")}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-sidebar-foreground">AVA</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground",
                    isCollapsed && "px-2",
                  )}
                >
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                  {!isCollapsed && item.label}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border space-y-4">
        {!isCollapsed && (
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        )}

        <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary-foreground">
              {userRole === "aluno" ? "A" : userRole === "professor" ? "P" : userRole === "coordenador" ? "C" : "AD"}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {userRole === "aluno"
                  ? "João Silva"
                  : userRole === "professor"
                    ? "Prof. Maria Santos"
                    : userRole === "coordenador"
                      ? "Coord. Ana Costa"
                      : "Admin Sistema"}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{userRole}</p>
            </div>
          )}
        </div>
      </div>
    </LiquidGlassSidebar>
  )
}
