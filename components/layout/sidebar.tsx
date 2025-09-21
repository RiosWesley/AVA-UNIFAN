"use client"

import { useState, useEffect } from "react"
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
  Bell,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Activity,
  BookMarked,
  Star,
} from "lucide-react"

interface SidebarProps {
  userRole: "aluno" | "professor" | "coordenador" | "administrador"
}

const menuItems = {
  aluno: [
    { icon: Home, label: "Início", href: "/dashboard/aluno", badge: "3" },
    { icon: BookMarked, label: "Disciplinas", href: "/dashboard/aluno/disciplinas", badge: "5" },
    { icon: Target, label: "Atividades", href: "/dashboard/aluno/atividades", badge: "2" },
    { icon: Award, label: "Boletim", href: "/dashboard/aluno/boletim" },
    { icon: Trophy, label: "Desempenho", href: "/dashboard/aluno/desempenho" },
    { icon: TrendingUp, label: "Progresso", href: "/dashboard/aluno/progresso" },
    { icon: MessageSquare, label: "Comunicação", href: "/dashboard/aluno/comunicacao", badge: "1" },
    { icon: CreditCard, label: "Financeiro", href: "/dashboard/aluno/financeiro" },
    { icon: Calendar, label: "Agenda", href: "/dashboard/aluno/agenda" },
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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
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

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ava:sidebar:collapsed")
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("ava:sidebar:collapsed", JSON.stringify(newState))
  }

  return (
    <LiquidGlassSidebar
      className={cn(
        "relative flex flex-col h-full transition-all duration-500 ease-in-out backdrop-blur-xl",
        isCollapsed ? "w-16" : "w-72",
        "shadow-2xl border-r border-sidebar-border/50"
      )}
      style={{
        background: isCollapsed
          ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 100%)"
      }}
    >
      <div className="flex items-center justify-between p-6 border-b border-sidebar-border/30 backdrop-blur-sm">
        <div className={cn(
          "flex items-center space-x-3 transition-all duration-300",
          isCollapsed && "justify-center"
        )}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sidebar-foreground text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AVA-UNIFAN
              </span>
              <span className="text-xs text-sidebar-foreground/60 font-medium">
                Sistema Acadêmico
              </span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300",
            "hover:scale-110 active:scale-95",
            isCollapsed && "bg-gradient-to-r from-blue-500/10 to-purple-500/10"
          )}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {items.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground relative group transition-all duration-300",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    isActive && "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-500/20",
                    isCollapsed && "px-2 justify-center",
                    !isCollapsed && "h-12 px-4"
                  )}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div className="flex items-center justify-center w-8 h-8 relative">
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isActive && "text-blue-600 dark:text-blue-400",
                        !isCollapsed && "mr-3",
                        hoveredItem === item.href && "scale-110"
                      )}
                    />
                    {isActive && (
                      <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-sm animate-pulse"></div>
                    )}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="font-medium flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <div className={cn(
                          "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                          isActive
                            ? "bg-blue-500 text-white shadow-lg"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                          hoveredItem === item.href && "scale-110"
                        )}>
                          {item.badge}
                        </div>
                      )}
                    </>
                  )}
                  {!isCollapsed && hoveredItem === item.href && (
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border/30 space-y-4 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex justify-center">
            <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg backdrop-blur-sm">
              <ThemeToggle />
            </div>
          </div>
        )}

        <div className={cn(
          "flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/10 transition-all duration-300 hover:from-blue-500/10 hover:to-purple-500/10",
          isCollapsed && "justify-center"
        )}>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-sm font-semibold text-white">
                {userRole === "aluno" ? "A" : userRole === "professor" ? "P" : userRole === "coordenador" ? "C" : "AD"}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {userRole === "aluno"
                  ? "João Silva"
                  : userRole === "professor"
                    ? "Prof. Maria Santos"
                    : userRole === "coordenador"
                      ? "Coord. Ana Costa"
                      : "Admin Sistema"}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                Online
              </p>
            </div>
          )}
          {!isCollapsed && (
            <div className="flex flex-col items-end text-xs text-sidebar-foreground/40">
              <Bell className="h-4 w-4 mb-1" />
              <span>3</span>
            </div>
          )}
        </div>
      </div>
    </LiquidGlassSidebar>
  )
}
