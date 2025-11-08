import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
  Clock,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react"

interface SidebarProps {
  userRole: "aluno" | "professor" | "coordenador" | "administrador"
}

const menuItems = {
  aluno: [
    { icon: Home, label: "Início", href: "/aluno", badge: "3" },
    {
      icon: GraduationCap,
      label: "Central do Aluno",
      children: [
        { icon: BookMarked, label: "Disciplinas", href: "/aluno/disciplinas", badge: "5" },
        { icon: Target, label: "Atividades", href: "/aluno/atividades", badge: "2" },
        { icon: Award, label: "Boletim", href: "/aluno/boletim" },
        { icon: Trophy, label: "Desempenho", href: "/aluno/desempenho" },
        { icon: Activity, label: "Frequência", href: "/aluno/frequencia" },
      ]
    },
    { icon: BookOpen, label: "Grade Curricular", href: "/aluno/grade-curricular" },
    { icon: BarChart3, label: "Relatórios", href: "/aluno/relatorios" },
    { icon: FileText, label: "Requerimentos", href: "/aluno/requerimentos" },
    { icon: MessageSquare, label: "Comunicação", href: "/aluno/comunicacao", badge: "1" },
    { icon: CreditCard, label: "Financeiro", href: "/aluno/financeiro" },
    { icon: Calendar, label: "Agenda", href: "/aluno/agenda" },
    { icon: Settings, label: "Configurações", href: "/aluno/configuracoes" },
  ],
  professor: [
    { icon: Home, label: "Início", href: "/professor" },
    { icon: BookOpen, label: "Turmas", href: "/professor/turmas" },
    { icon: Calendar, label: "Agenda", href: "/professor/agenda" },
    { icon: Clock, label: "Disponibilização de Horários", href: "/professor/disponibilizacao-horarios" },
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

function getInitialOpenGroups(userRole: SidebarProps["userRole"]): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const saved = localStorage.getItem(`ava:sidebar:openGroups:${userRole}`)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

export function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => getInitialOpenGroups(userRole))
  const pathname = usePathname()
  const items = menuItems[userRole]

  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem("ava:userRole")
      if (stored !== userRole) {
        window.localStorage.setItem("ava:userRole", userRole)
      }
    } catch {}
  }

  useEffect(() => {
    const saved = localStorage.getItem("ava:sidebar:collapsed")
    if (saved !== null) {
      const savedState = JSON.parse(saved)
      if (savedState !== isCollapsed) {
        setIsCollapsed(savedState)
      }
    }
  }, []) 

  // Persistência do estado de grupos abertos por papel de usuário
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ava:sidebar:openGroups:${userRole}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') {
          setOpenGroups(parsed)
        }
      }
    } catch {}
  }, [userRole])

  useEffect(() => {
    try {
      localStorage.setItem(`ava:sidebar:openGroups:${userRole}`, JSON.stringify(openGroups))
    } catch {}
  }, [openGroups, userRole])

  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("ava:sidebar:collapsed", JSON.stringify(newState))
  }

  return (
    <TooltipProvider>
      <LiquidGlassSidebar
        className={cn(
          "relative flex flex-col h-full transition-all duration-500 ease-in-out backdrop-blur-xl overflow-hidden",
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
          <div className=" bg-green-600 p-2 rounded-lg">
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

      <div className="flex-1 overflow-y-auto">
        <nav className="px-2">
          {items.map((item, index) => {
            const Icon = item.icon
            const isGroup = 'children' in item && Array.isArray((item as any).children)
            const groupChildren = isGroup ? (item as any).children : undefined
            const isActive = isGroup
              ? groupChildren.some((c: any) => c.href === pathname)
              : pathname === (item as any).href

            const buttonContent = (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground relative group transition-all duration-300",
                  "border border-transparent hover:border-sidebar-border/50 my-0.5",
                  isActive && "bg-green-500/20 text-green-600 dark:text-green-400 shadow-lg border-green-500/20",
                  isCollapsed && "px-2 justify-center",
                  !isCollapsed && "h-12 px-6",
                  isGroup && openGroups[item.label] && "bg-green-500/10 border-green-500/20"
                )}
                onMouseEnter={() => setHoveredItem((item as any).href)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => {
                  if (isGroup && !isCollapsed) {
                    setOpenGroups(prev => ({ ...prev, [item.label]: !prev[item.label] }))
                  }
                }}
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
                      hoveredItem === (item as any).href && "text-green-500"
                    )}
                  />
                </div>
                {!isCollapsed && (
                  <>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {isGroup ? (
                      <div className="flex items-center">
                        <div className={cn(
                          "transition-all duration-300 ease-in-out",
                          openGroups[item.label] ? "rotate-90" : "rotate-0"
                        )}>
                          <ChevronRight className="h-4 w-4 opacity-70" />
                        </div>
                      </div>
                    ) : ('badge' in item && (item as any).badge && (
                      <div className={cn(
                        "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                        isActive
                          ? "bg-green-500 text-white shadow-lg"
                          : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
                        hoveredItem === (item as any).href && "text-green-500"
                      )}>
                        {(item as any).badge}
                      </div>
                    ))}
                  </>
                )}
                {!isCollapsed && hoveredItem === (item as any).href && (
                  <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Button>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <div>
                      {buttonContent}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.label}</span>
                      {'badge' in item && (item as any).badge && (
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                          {(item as any).badge}
                        </span>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            }

            if (isGroup) {
              return (
                <div key={item.label}>
                  <div>
                    {buttonContent}
                  </div>
                  <div 
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      openGroups[item.label] 
                        ? "max-h-96 opacity-100" 
                        : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="pl-10 pr-2 mt-1 space-y-1">
                      {groupChildren.map((child: any, childIndex: number) => {
                        const ChildIcon = child.icon
                        const childActive = pathname === child.href
                        return (
                          <Link key={child.href} href={child.href}>
                            <Button
                              variant={childActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-300",
                                "border border-transparent hover:border-sidebar-border/50 h-10 px-6",
                                childActive && "bg-green-500/20 text-green-600 dark:text-green-400 shadow border-green-500/20"
                              )}
                              style={{
                                animationDelay: openGroups[item.label] ? `${childIndex * 50}ms` : '0ms',
                                transform: openGroups[item.label] ? 'translateY(0)' : 'translateY(-10px)',
                                opacity: openGroups[item.label] ? 1 : 0,
                                transition: 'all 0.3s ease-in-out'
                              }}
                            >
                              <div className="flex items-center justify-center w-6 h-6 mr-3">
                                <ChildIcon className="h-4 w-4" />
                              </div>
                              <span className="text-sm flex-1 text-left">{child.label}</span>
                              {'badge' in child && child.badge && (
                                <div className="flex items-center justify-center min-w-[18px] h-5 px-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                                  {child.badge}
                                </div>
                              )}
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <Link key={(item as any).href} href={(item as any).href}>
                {buttonContent}
              </Link>
            )
          })}
        </nav>
      </div>

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
