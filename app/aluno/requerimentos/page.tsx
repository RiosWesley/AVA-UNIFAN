"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  User,
  FileCheck,
  Sparkles
} from "lucide-react"

type RequerimentoStatus = "pendente" | "em_analise" | "aprovado" | "rejeitado"

type RequerimentoTipo = "justificativa_falta" | "revisao_nota" | "trancamento" | "transferencia" | "outro"

type Requerimento = {
  id: number
  tipo: RequerimentoTipo
  titulo: string
  descricao: string
  status: RequerimentoStatus
  dataCriacao: string
  dataAtualizacao?: string
  responsavel?: string
  observacoes?: string
}

const tiposRequerimento: Record<RequerimentoTipo, string> = {
  justificativa_falta: "Justificativa de Falta",
  revisao_nota: "Revisão de Nota",
  trancamento: "Trancamento",
  transferencia: "Transferência",
  outro: "Outro"
}

export default function RequerimentosPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<RequerimentoStatus | "todos">("todos")
  const [showNovoRequerimento, setShowNovoRequerimento] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })

    return () => observer.disconnect()
  }, [])

  const requerimentos: Requerimento[] = [
    {
      id: 1,
      tipo: "justificativa_falta",
      titulo: "Justificativa de Falta - Matemática",
      descricao: "Solicito justificativa para a falta do dia 15/10/2024 na disciplina de Matemática devido a consulta médica.",
      status: "aprovado",
      dataCriacao: "16/10/2024",
      dataAtualizacao: "18/10/2024",
      responsavel: "Coord. Acadêmica",
      observacoes: "Justificativa aceita. Documento médico anexado."
    },
    {
      id: 2,
      tipo: "revisao_nota",
      titulo: "Revisão de Nota - História",
      descricao: "Solicito revisão da nota da prova do dia 20/09/2024, pois acredito haver divergência na correção.",
      status: "em_analise",
      dataCriacao: "25/09/2024",
      responsavel: "Prof. João Costa"
    },
    {
      id: 3,
      tipo: "trancamento",
      titulo: "Solicitação de Trancamento",
      descricao: "Solicito trancamento da disciplina de Física para o semestre 2024.2 por motivos pessoais.",
      status: "pendente",
      dataCriacao: "01/11/2024"
    },
    {
      id: 4,
      tipo: "justificativa_falta",
      titulo: "Justificativa de Falta - Português",
      descricao: "Solicito justificativa para as faltas dos dias 10/10 e 11/10/2024 devido a problemas de transporte.",
      status: "rejeitado",
      dataCriacao: "12/10/2024",
      dataAtualizacao: "15/10/2024",
      responsavel: "Coord. Acadêmica",
      observacoes: "Justificativa não aceita. Documentação insuficiente."
    }
  ]

  const filteredRequerimentos = requerimentos.filter((req) => {
    const matchesSearch = req.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = activeFilter === "todos" || req.status === activeFilter
    return matchesSearch && matchesFilter
  })

  const getStatusConfig = (status: RequerimentoStatus) => {
    switch (status) {
      case "pendente":
        return {
          icon: Clock,
          color: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
          label: "Pendente"
        }
      case "em_analise":
        return {
          icon: AlertCircle,
          color: "text-blue-600 dark:text-blue-400",
          bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
          label: "Em Análise"
        }
      case "aprovado":
        return {
          icon: CheckCircle,
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800",
          label: "Aprovado"
        }
      case "rejeitado":
        return {
          icon: XCircle,
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800",
          label: "Rejeitado"
        }
    }
  }

  const getTipoColor = (tipo: RequerimentoTipo) => {
    switch (tipo) {
      case "justificativa_falta":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
      case "revisao_nota":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
      case "trancamento":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
      case "transferencia":
        return "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300"
    }
  }

  const stats = {
    total: requerimentos.length,
    pendente: requerimentos.filter((r) => r.status === "pendente").length,
    em_analise: requerimentos.filter((r) => r.status === "em_analise").length,
    aprovado: requerimentos.filter((r) => r.status === "aprovado").length,
    rejeitado: requerimentos.filter((r) => r.status === "rejeitado").length
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Header Hero Section */}
          <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm mb-8 p-6 ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.05]" />
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
                        Meus Requerimentos
                      </h1>
                      <p className="text-lg text-muted-foreground">
                        Gerencie suas solicitações acadêmicas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium">Pendentes</span>
                      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">
                        {stats.pendente}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">Em Análise</span>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                        {stats.em_analise}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Aprovados</span>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                        {stats.aprovado}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {stats.total}
                    </div>
                    <div className="text-sm text-muted-foreground">Total de Requerimentos</div>
                  </div>
                  <LiquidGlassButton
                    onClick={() => setShowNovoRequerimento(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Novo Requerimento
                  </LiquidGlassButton>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de busca e filtros */}
          <div className="flex flex-col lg:flex-row gap-4">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`flex-1 p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 border-border/50 hover:border-border/80 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <Input
                  placeholder="Buscar requerimentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border-none bg-transparent focus-visible:ring-0 text-lg placeholder:text-muted-foreground/60"
                />
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 border-border/50 hover:border-border/80 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'todos', label: 'Todos', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
                    { key: 'pendente', label: 'Pendentes', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' },
                    { key: 'em_analise', label: 'Em Análise', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
                    { key: 'aprovado', label: 'Aprovados', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
                    { key: 'rejeitado', label: 'Rejeitados', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={activeFilter === filter.key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveFilter(filter.key as RequerimentoStatus | "todos")}
                      className={`rounded-full transition-all duration-200 ${
                        activeFilter === filter.key
                          ? `${filter.color} shadow-lg scale-105`
                          : 'hover:scale-105'
                      }`}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Cards de Requerimentos */}
          <div className="space-y-4">
            {filteredRequerimentos.length > 0 ? (
              filteredRequerimentos.map((requerimento) => {
                const statusConfig = getStatusConfig(requerimento.status)
                const StatusIcon = statusConfig.icon

                return (
                  <LiquidGlassCard
                    key={requerimento.id}
                    intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                    className={`group transition-all duration-300 border border-border/50 hover:border-border/80 ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20'
                        : 'bg-gray-50/60 dark:bg-gray-800/40'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl text-foreground">
                              {requerimento.titulo}
                            </CardTitle>
                            <Badge className={getTipoColor(requerimento.tipo)}>
                              {tiposRequerimento[requerimento.tipo]}
                            </Badge>
                          </div>
                          <CardDescription className="text-base mt-2">
                            {requerimento.descricao}
                          </CardDescription>
                        </div>
                        <Badge className={statusConfig.bg}>
                          <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.color}`} />
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Criado em: {requerimento.dataCriacao}</span>
                            </div>
                            {requerimento.dataAtualizacao && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Atualizado em: {requerimento.dataAtualizacao}</span>
                              </div>
                            )}
                            {requerimento.responsavel && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{requerimento.responsavel}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {requerimento.observacoes && (
                          <div className={`p-4 rounded-lg border ${
                            requerimento.status === "aprovado"
                              ? "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                              : requerimento.status === "rejeitado"
                              ? "bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                              : "bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                          }`}>
                            <div className="flex items-start gap-2">
                              <FileCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-1">Observações:</p>
                                <p className="text-sm text-muted-foreground">{requerimento.observacoes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                          {requerimento.status === "pendente" && (
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                )
              })
            ) : (
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`text-center py-12 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-muted-foreground font-medium mb-2">
                  {searchTerm || activeFilter !== "todos"
                    ? "Nenhum requerimento encontrado"
                    : "Nenhum requerimento cadastrado"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || activeFilter !== "todos"
                    ? "Tente ajustar os filtros de busca"
                    : "Crie seu primeiro requerimento clicando no botão acima"}
                </p>
                {!searchTerm && activeFilter === "todos" && (
                  <LiquidGlassButton
                    onClick={() => setShowNovoRequerimento(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Novo Requerimento
                  </LiquidGlassButton>
                )}
              </LiquidGlassCard>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

