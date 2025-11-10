"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/sidebar'
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Search, Activity, CheckCircle, Clock, Target, AlertCircle, FileText, Calendar as CalIcon, Flame, Zap, Star, Plus, Filter, TrendingUp, BookOpen, Users, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { ModalEnviarAtividade } from '@/components/modals'

export default function AtividadesPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('todas')
  const [modalEnviarAtividadeOpen, setModalEnviarAtividadeOpen] = useState(false)
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<any>(null)

  // Query client for mutations
  const queryClient = useQueryClient()

  // Mutation to complete activity
  const completeActivityMutation = useMutation({
    mutationFn: async (activityId: number) => {
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update local state
      setAtividadesPendentes(prev => {
        const atividade = prev.find(a => a.id === activityId)
        if (atividade) {
          const atividadeConcluida = {
            ...atividade,
            status: 'concluido',
            dataConclusao: new Date().toLocaleDateString('pt-BR')
          }
          setAtividadesConcluidas(prevConcluidas => [...prevConcluidas, atividadeConcluida])
          return prev.filter(a => a.id !== activityId)
        }
        return prev
      })

      return activityId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast({
        title: "Atividade concluída! 🎉",
        description: "Parabéns! Você marcou a atividade como concluída.",
      })
    },
    onError: () => {
      toast({
        title: "Erro ao concluir atividade",
        description: "Tente novamente em alguns momentos.",
        variant: "destructive",
      })
    },
  })

  const handleCompleteActivity = (activityId: number) => {
    completeActivityMutation.mutate(activityId)
  }

  // Mutation to upload activity
  const uploadActivityMutation = useMutation({
    mutationFn: async ({ activityId, file, comment }: { activityId: number; file: File; comment: string }) => {
      // TODO: Replace with actual API call
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Update local state - move activity from pending to completed
      setAtividadesPendentes(prev => {
        const atividade = prev.find(a => a.id === activityId)
        if (atividade) {
          const atividadeConcluida = {
            ...atividade,
            status: 'concluido',
            dataConclusao: new Date().toLocaleDateString('pt-BR')
          }
          setAtividadesConcluidas(prevConcluidas => [...prevConcluidas, atividadeConcluida])
          return prev.filter(a => a.id !== activityId)
        }
        return prev
      })

      return { activityId, fileName: file.name }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast({
        title: "Atividade enviada com sucesso! 🎉",
        description: `${variables.file.name} foi enviada para a atividade.`,
      })
      setModalEnviarAtividadeOpen(false)
      setAtividadeSelecionada(null)
    },
    onError: () => {
      toast({
        title: "Erro ao enviar atividade",
        description: "Verifique o arquivo e tente novamente.",
        variant: "destructive",
      })
    },
  })

  const handleAbrirModalEnviar = (atividade: any) => {
    setAtividadeSelecionada(atividade)
    setModalEnviarAtividadeOpen(true)
  }

  const handleEnviarAtividade = async (activityId: number, file: File, comment: string) => {
    await uploadActivityMutation.mutateAsync({ activityId, file, comment })
  }

  const [atividadesPendentes, setAtividadesPendentes] = useState([
    { id: 1, titulo: 'Trabalho de Matemática', descricao: 'Análise de funções quadráticas e resolução de problemas aplicados', prioridade: 'Alta', dataVencimento: '15/10/2024', disciplina: 'Matemática', status: 'urgente', participantes: 3, dificuldade: 'Médio' },
    { id: 2, titulo: 'Resumo de História', descricao: 'Revolução Industrial no Brasil e suas consequências sociais', prioridade: 'Média', dataVencimento: '20/10/2024', disciplina: 'História', status: 'normal', participantes: 1, dificuldade: 'Fácil' },
    { id: 3, titulo: 'Exercícios de Física', descricao: 'Leis de Newton aplicadas a sistemas mecânicos', prioridade: 'Baixa', dataVencimento: '25/10/2024', disciplina: 'Física', status: 'planejado', participantes: 2, dificuldade: 'Difícil' },
  ])

  const [atividadesConcluidas, setAtividadesConcluidas] = useState([
    { id: 4, titulo: 'Prova de História', descricao: 'Período Colonial brasileiro', prioridade: 'Alta', dataConclusao: '10/10/2024', disciplina: 'História', status: 'concluido', participantes: 1, dificuldade: 'Médio' },
    { id: 5, titulo: 'Apresentação de Biologia', descricao: 'Ecossistemas terrestres e aquáticos', prioridade: 'Média', dataConclusao: '05/10/2024', disciplina: 'Biologia', status: 'concluido', participantes: 4, dificuldade: 'Fácil' },
    { id: 6, titulo: 'Quiz de Português', descricao: 'Análise sintática e gramática aplicada', prioridade: 'Baixa', dataConclusao: '01/10/2024', disciplina: 'Português', status: 'concluido', participantes: 1, dificuldade: 'Fácil' },
  ])

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


  const filteredPendentes = atividadesPendentes.filter(a =>
    (activeFilter === 'todas' || a.status === activeFilter) &&
    a.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredConcluidas = atividadesConcluidas.filter(a =>
    (activeFilter === 'todas' || a.status === activeFilter) &&
    a.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPrioridadeConfig = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-pink-500',
          icon: Flame,
          color: 'text-white',
          badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800'
        }
      case 'Média':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          icon: Zap,
          color: 'text-white',
          badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
        }
      case 'Baixa':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          icon: Star,
          color: 'text-white',
          badge: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-slate-500',
          icon: Target,
          color: 'text-white',
          badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-800'
        }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgente': return 'border-l-red-500'
      case 'normal': return 'border-l-blue-500'
      case 'planejado': return 'border-l-purple-500'
      case 'concluido': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'Fácil': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'Médio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'Difícil': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
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
                  <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
                    Minhas Atividades
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Gerencie suas tarefas e atividades acadêmicas com estilo
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium">Pendentes</span>
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                        {atividadesPendentes.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Concluídas</span>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                        {atividadesConcluidas.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {atividadesPendentes.length + atividadesConcluidas.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Total de Atividades</div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
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
                  placeholder="Buscar atividades..."
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
                <div className="flex gap-2">
                  {[
                    { key: 'todas', label: 'Todas', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
                    { key: 'urgente', label: 'Urgentes', color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
                    { key: 'normal', label: 'Normais', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
                    { key: 'planejado', label: 'Planejadas', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
                    { key: 'concluido', label: 'Concluídas', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={activeFilter === filter.key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`rounded-full transition-all duration-200 ${
                        activeFilter === filter.key
                          ? `${filter.color} scale-105`
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
          
          {/* Cards de Atividades */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Atividades Pendentes */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300 border-border/50 hover:border-border/80 group ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <div className="relative py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 transition-colors flex items-center justify-center">
                      <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Pendentes</h2>
                      <p className="text-sm text-muted-foreground">{filteredPendentes.length} atividades</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800 px-3 py-1">
                    Urgentes
                  </Badge>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredPendentes.map((atividade) => {
                    const prioridadeConfig = getPrioridadeConfig(atividade.prioridade)
                    const PriorityIcon = prioridadeConfig.icon
                    return (
                      <div key={atividade.id} className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                        isLiquidGlass
                          ? 'bg-transparent hover:bg-white/15 dark:hover:bg-gray-800/15 border-green-200/40 dark:border-green-800/40 '
                          : 'bg-white/70 dark:bg-gray-800/70 border-green-200/60 dark:border-green-800/60 hover:bg-white/90 dark:hover:bg-gray-800/90'
                      }`}>
                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-foreground transition-colors">
                              {atividade.titulo}
                            </h3>
                            <div className={`w-8 h-8 rounded-lg ${prioridadeConfig.bg} flex items-center justify-center`}>
                              <PriorityIcon className={`h-4 w-4 ${prioridadeConfig.color}`} />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            {atividade.descricao}
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-xs">
                                  <BookOpen className="h-3 w-3" />
                                  <span className="font-medium">{atividade.disciplina}</span>
                                </div>
                                <Badge className={getDificuldadeColor(atividade.dificuldade)}>
                                  {atividade.dificuldade}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                  <CalIcon className="h-3 w-3" />
                                  <span className="font-bold">Vence: {atividade.dataVencimento}</span>
                                </div>
                                {atividade.participantes > 1 && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>{atividade.participantes} participantes</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAbrirModalEnviar(atividade)}
                                disabled={uploadActivityMutation.isPending}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                <span>Enviar Atividade</span>
                              </Button>
                              <Button
                                onClick={() => handleCompleteActivity(atividade.id)}
                                disabled={completeActivityMutation.isPending}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                {completeActivityMutation.isPending ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Concluindo...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Marcar como Concluída</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {filteredPendentes.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="text-muted-foreground font-medium">Todas as atividades concluídas!</p>
                      <p className="text-sm text-muted-foreground">Excelente trabalho! 🎉</p>
                    </div>
                  )}
                </div>
              </div>
            </LiquidGlassCard>

            {/* Atividades Concluídas */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300 border-border/50 hover:border-border/80 group ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <div className="relative py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20  transition-colors flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Concluídas</h2>
                      <p className="text-sm text-muted-foreground">{filteredConcluidas.length} atividades</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800 px-3 py-1">
                    Sucesso
                  </Badge>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredConcluidas.map((atividade) => {
                    const prioridadeConfig = getPrioridadeConfig(atividade.prioridade)
                    const PriorityIcon = prioridadeConfig.icon
                    return (
                      <div key={atividade.id} className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                        isLiquidGlass
                          ? 'bg-transparent hover:bg-white/15 dark:hover:bg-gray-800/15 border-green-200/40 dark:border-green-800/40'
                          : 'bg-white/70 dark:bg-gray-800/70 border-green-200/60 dark:border-green-800/60 hover:bg-white/90 dark:hover:bg-gray-800/90'
                      }`}>
                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-foreground transition-colors">
                              {atividade.titulo}
                            </h3>
                            <div className={`w-8 h-8 rounded-lg ${prioridadeConfig.bg} flex items-center justify-center`}>
                              <PriorityIcon className={`h-4 w-4 ${prioridadeConfig.color}`} />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            {atividade.descricao}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs">
                                <BookOpen className="h-3 w-3" />
                                <span className="font-medium">{atividade.disciplina}</span>
                              </div>
                              <Badge className={getDificuldadeColor(atividade.dificuldade)}>
                                {atividade.dificuldade}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <CheckCircle className="h-3 w-3" />
                                <span className="font-bold">Concluída: {atividade.dataConclusao}</span>
                              </div>
                              {atividade.participantes > 1 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>{atividade.participantes} participantes</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {filteredConcluidas.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="text-muted-foreground font-medium">Complete suas primeiras atividades!</p>
                      <p className="text-sm text-muted-foreground">Elas aparecerão aqui quando concluídas</p>
                    </div>
                  )}
                </div>
              </div>
            </LiquidGlassCard>

          </div>

        </div>
      </main>

      {/* Modal de Enviar Atividade */}
      <ModalEnviarAtividade
        isOpen={modalEnviarAtividadeOpen}
        onClose={() => {
          setModalEnviarAtividadeOpen(false)
          setAtividadeSelecionada(null)
        }}
        atividade={atividadeSelecionada}
        onEnviar={handleEnviarAtividade}
        isPending={uploadActivityMutation.isPending}
      />
    </div>
  )
}
