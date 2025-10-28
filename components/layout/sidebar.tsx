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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Home,
  BookOpen,
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
    { icon: Home, label: "Início", href: "/aluno", badge: "3" },
    { icon: BookMarked, label: "Disciplinas", href: "/aluno/disciplinas", badge: "5" },
    { icon: Target, label: "Atividades", href: "/aluno/atividades", badge: "2" },
    { icon: Award, label: "Boletim", href: "/aluno/boletim" },
    { icon: Trophy, label: "Desempenho", href: "/aluno/desempenho" },
    { icon: Activity, label: "Frequência", href: "/aluno/frequencia" },
    { icon: MessageSquare, label: "Comunicação", href: "/aluno/comunicacao", badge: "1" },
    { icon: CreditCard, label: "Financeiro", href: "/aluno/financeiro" },
    { icon: Calendar, label: "Agenda", href: "/aluno/agenda" },
    { icon: Settings, label: "Configurações", href: "/aluno/configuracoes" },
  ],
  professor: [
    { icon: Home, label: "Início", href: "/professor" },
    { icon: BookOpen, label: "Turmas", href: "/professor/turmas" },
    { icon: Calendar, label: "Agenda", href: "/professor/agenda" },
    { icon: MessageSquare, label: "Comunicação", href: "/professor/comunicacao" },
    { icon: Settings, label: "Configurações", href: "/professor/configuracoes" },
  ],
  coordenador: [
    { icon: Home, label: "Início", href: "/coordenador" },
    { icon: BookOpen, label: "Cursos", href: "/coordenador/cursos" },
    { icon: Users, label: "Professores", href: "/coordenador/professores" },
    { icon: Calendar, label: "Grade Horária", href: "/coordenador/grade" },
    { icon: BarChart3, label: "Relatórios", href: "/coordenador/relatorios" },
    { icon: MessageSquare, label: "Comunicação", href: "/coordenador/comunicacao" },
    { icon: Settings, label: "Configurações", href: "/coordenador/configuracoes" },
  ],
  administrador: [
    { icon: Home, label: "Início", href: "/administrador" },
    { icon: Users, label: "Usuários", href: "/administrador/usuarios" },
    { icon: BookOpen, label: "Cursos", href: "/administrador/cursos" },
    { icon: CreditCard, label: "Financeiro", href: "/administrador/financeiro" },
    { icon: BarChart3, label: "Relatórios", href: "/administrador/relatorios" },
    { icon: MessageSquare, label: "Comunicação", href: "/administrador/comunicacao" },
    { icon: Settings, label: "Configurações", href: "/administrador/configuracoes" },
  ],
}

// Helper function to get initial state from localStorage
function getInitialCollapsedState(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const saved = localStorage.getItem("ava:sidebar:collapsed")
    return saved ? JSON.parse(saved) : false
  } catch {
    return false
  }
}

export function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState)
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

  // Ensure localStorage is in sync (for cases where it might be modified externally)
  useEffect(() => {
    const saved = localStorage.getItem("ava:sidebar:collapsed")
    if (saved !== null) {
      const savedState = JSON.parse(saved)
      if (savedState !== isCollapsed) {
        setIsCollapsed(savedState)
      }
    }
  }, []) // Only run once on mount

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("ava:sidebar:collapsed", JSON.stringify(newState))
  }

  return (
    <TooltipProvider>
      <LiquidGlassSidebar
        className={cn(
          "relative flex flex-col h-full transition-all duration-500 ease-in-out backdrop-blur-xl",
          isCollapsed ? "w-16" : "w-72",
          "shadow-2xl border-r border-sidebar-border/50"
        )}
      >
      <div className={cn(
        "border-b border-sidebar-border/30 backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "flex flex-col items-center p-3 space-y-3" : "flex items-center justify-between p-6"
      )}>
        <div className={cn(
          "relative transition-all duration-300",
          isCollapsed && "mx-auto"
        )}>
          <div className="absolute inset-0 bg-green-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          <div className="relative bg-green-600 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-green-600 dark:text-green-400 text-lg">
              AVA-UNIFAN
            </span>
            <span className="text-xs text-sidebar-foreground/60 font-medium">
              Sistema Acadêmico
            </span>
          </div>
        )}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapsed}
                className={cn(
                  "text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300",
                  "active:scale-95 bg-green-500/10"
                )}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <span className="font-medium">Expandir menu</span>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapsed}
                className="text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-300 active:scale-95"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <span className="font-medium">Recolher menu</span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <ScrollArea className="flex-1 py-6" showScrollbars={false}>
        <nav className="space-y-1">
          {items.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            const buttonContent = (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground relative group transition-all duration-300",
                  "border border-transparent hover:border-sidebar-border/50",
                  isActive && "bg-green-500/20 text-green-600 dark:text-green-400 shadow-lg border-green-500/20",
                  isCollapsed && "px-2 justify-center",
                  !isCollapsed && "h-12 px-6"
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
                      isActive && "text-green-600 dark:text-green-400",
                      !isCollapsed && "mr-3",
                      hoveredItem === item.href && "text-green-500"
                    )}
                  />
                  {isActive && (
                    <div className="absolute -inset-1 bg-green-500/20 rounded-full blur-sm animate-pulse"></div>
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {'badge' in item && item.badge && (
                      <div className={cn(
                        "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                        isActive
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
                        hoveredItem === item.href && "text-green-500"
                      )}>
                        {item.badge}
                      </div>
                    )}
                  </>
                )}
                {!isCollapsed && hoveredItem === item.href && (
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Button>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      {buttonContent}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.label}</span>
                      {'badge' in item && item.badge && (
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return (
              <Link key={item.href} href={item.href}>
                {buttonContent}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border/30 space-y-4 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex justify-center">
            <div className="p-2 bg-green-500/10 rounded-lg backdrop-blur-sm">
              <ThemeToggle />
            </div>
          </div>
        )}

        <div className={cn(
          "flex items-center space-x-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10 transition-all duration-300 hover:bg-green-500/10",
          isCollapsed && "justify-center"
        )}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative cursor-pointer">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-semibold text-white">
                      {userRole === "aluno" ? "A" : userRole === "professor" ? "P" : userRole === "coordenador" ? "C" : "AD"}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">
                    {userRole === "aluno"
                      ? "João Silva"
                      : userRole === "professor"
                        ? "Prof. Maria Santos"
                        : userRole === "coordenador"
                          ? "Coord. Ana Costa"
                          : "Admin Sistema"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    Online
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="relative">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm font-semibold text-white">
                  {userRole === "aluno" ? "A" : userRole === "professor" ? "P" : userRole === "coordenador" ? "C" : "AD"}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            </div>
          )}
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
    </TooltipProvider>
  )
}
