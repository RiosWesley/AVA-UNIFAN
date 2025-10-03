"use client"

import { useState, useEffect } from "react"
import { Sidebar } from '@/components/layout/sidebar'
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Progress } from '@/components/ui/progress'
import { TrendingUp, CheckCircle, Clock, Target, BookOpen, Milestone, Calendar, Check, Sparkles, Zap, Trophy, Star, ChevronDown, ChevronUp, Play, Pause, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ProgressoPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [openDisciplina, setOpenDisciplina] = useState<number | null>(null)
  const [metaCheckboxes, setMetaCheckboxes] = useState({1: false, 2: true, 3: false, 4: false})
  const [animatingProgress, setAnimatingProgress] = useState<{[key: string]: number}>({})

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

  // Animação inicial dos progressos
  useEffect(() => {
    const animateProgress = () => {
      disciplinas.forEach((disc, index) => {
        setTimeout(() => {
          setAnimatingProgress(prev => ({ ...prev, [`disc-${disc.index}`]: disc.progresso }))
        }, index * 200)
      })

      metas.forEach((meta, index) => {
        setTimeout(() => {
          setAnimatingProgress(prev => ({ ...prev, [`meta-${meta.id}`]: meta.progresso }))
        }, (disciplinas.length + index) * 200)
      })
    }

    animateProgress()

    // Cleanup function
    return () => {
      // Clear any pending timeouts if component unmounts
      setAnimatingProgress({})
    }
  }, [disciplinas.length, metas.length]) // Added proper dependencies

  const disciplinas = [
    {
      nome: 'Matemática',
      progresso: 80,
      modulos: '8/10',
      cor: 'from-blue-500 to-cyan-500',
      icone: BookOpen,
      index: 0,
      descricao: 'Cálculo diferencial e integral',
      atividades: 25,
      tempoEstudo: '12h/semana'
    },
    {
      nome: 'Português',
      progresso: 65,
      modulos: '6/9',
      cor: 'from-green-500 to-emerald-500',
      icone: BookOpen,
      index: 1,
      descricao: 'Gramática e literatura brasileira',
      atividades: 18,
      tempoEstudo: '8h/semana'
    },
    {
      nome: 'Física',
      progresso: 90,
      modulos: '9/10',
      cor: 'from-purple-500 to-pink-500',
      icone: BookOpen,
      index: 2,
      descricao: 'Mecânica e termodinâmica',
      atividades: 22,
      tempoEstudo: '10h/semana'
    },
    {
      nome: 'História',
      progresso: 45,
      modulos: '4/8',
      cor: 'from-orange-500 to-red-500',
      icone: BookOpen,
      index: 3,
      descricao: 'História do Brasil e mundial',
      atividades: 15,
      tempoEstudo: '6h/semana'
    },
    {
      nome: 'Biologia',
      progresso: 75,
      modulos: '7/9',
      cor: 'from-teal-500 to-green-500',
      icone: BookOpen,
      index: 4,
      descricao: 'Genética e ecologia',
      atividades: 20,
      tempoEstudo: '9h/semana'
    },
  ]

  const metas = [
    {
      id: 1,
      titulo: 'Concluir módulo de Física',
      progresso: 60,
      concluida: false,
      prazo: '20/10/2024',
      categoria: 'estudo',
      prioridade: 'alta',
      descricao: 'Finalizar todos os exercícios de termodinâmica'
    },
    {
      id: 2,
      titulo: 'Ler capítulos de História',
      progresso: 100,
      concluida: true,
      prazo: '15/10/2024',
      categoria: 'leitura',
      prioridade: 'média',
      descricao: 'Completar leitura obrigatória do período colonial'
    },
    {
      id: 3,
      titulo: 'Estudar equações de Matemática',
      progresso: 30,
      concluida: false,
      prazo: '25/10/2024',
      categoria: 'exercicios',
      prioridade: 'alta',
      descricao: 'Resolver 50 exercícios de equações diferenciais'
    },
    {
      id: 4,
      titulo: 'Preparar apresentação de Biologia',
      progresso: 80,
      concluida: false,
      prazo: '30/10/2024',
      categoria: 'projeto',
      prioridade: 'média',
      descricao: 'Criar slides sobre ecossistemas aquáticos'
    },
  ]

  const marcos = [
    {
      data: '01/09/2024',
      evento: 'Início do Semestre',
      status: 'Concluído',
      icone: Milestone,
      tipo: 'academico',
      descricao: 'Começo das aulas e atividades'
    },
    {
      data: '15/10/2024',
      evento: 'Primeira Avaliação',
      status: 'Pendente',
      icone: Target,
      tipo: 'avaliacao',
      descricao: 'Provas de meio de semestre'
    },
    {
      data: '30/11/2024',
      evento: 'Meio do Semestre',
      status: 'Futuro',
      icone: Calendar,
      tipo: 'marco',
      descricao: 'Metade do período letivo'
    },
    {
      data: '15/12/2024',
      evento: 'Fim do Semestre',
      status: 'Futuro',
      icone: CheckCircle,
      tipo: 'conclusao',
      descricao: 'Encerramento do período acadêmico'
    },
  ]

  const toggleDisciplina = (index: number) => {
    setOpenDisciplina(openDisciplina === index ? null : index)
  }

  const handleCheckboxChange = (id: number) => {
    setMetaCheckboxes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getCategoriaConfig = (categoria: string) => {
    switch (categoria) {
      case 'estudo': return { icon: BookOpen, color: 'bg-blue-500', text: 'Estudo' }
      case 'leitura': return { icon: BookOpen, color: 'bg-green-500', text: 'Leitura' }
      case 'exercicios': return { icon: Target, color: 'bg-purple-500', text: 'Exercícios' }
      case 'projeto': return { icon: Sparkles, color: 'bg-orange-500', text: 'Projeto' }
      default: return { icon: BookOpen, color: 'bg-gray-500', text: 'Geral' }
    }
  }

  const getTipoMarcoConfig = (tipo: string) => {
    switch (tipo) {
      case 'academico': return { color: 'bg-green-500', border: 'border-green-500' }
      case 'avaliacao': return { color: 'bg-yellow-500', border: 'border-yellow-500' }
      case 'marco': return { color: 'bg-blue-500', border: 'border-blue-500' }
      case 'conclusao': return { color: 'bg-purple-500', border: 'border-purple-500' }
      default: return { color: 'bg-gray-500', border: 'border-gray-500' }
    }
  }

  const getPrioridadeConfig = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return { color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', icon: Zap }
      case 'média': return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', icon: Clock }
      case 'baixa': return { color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', icon: Star }
      default: return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300', icon: Target }
    }
  }

  const AnimatedProgress = ({ value, delay = 0, className = '' }: { value: number, delay?: number, className?: string }) => {
    const [animatedValue, setAnimatedValue] = useState(0)

    useEffect(() => {
      const timer = setTimeout(() => {
        const increment = value / 60
        const counter = setInterval(() => {
          setAnimatedValue(prev => {
            if (prev >= value) {
              clearInterval(counter)
              return value
            }
            return prev + increment
          })
        }, 20)
        return () => clearInterval(counter)
      }, delay)

      return () => clearTimeout(timer)
    }, [value, delay])

    return (
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden ${className}`}>
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${animatedValue}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gradient-to-br from-green-50/30 via-blue-50/20 to-purple-50/30 dark:from-gray-900/20 dark:via-green-900/10 dark:to-purple-900/10' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Header Hero Section */}
          <div className={`relative overflow-hidden rounded-3xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 dark:from-green-900/30 dark:via-blue-900/30 dark:to-purple-900/30 border-green-200/30 dark:border-green-700/50'
              : 'bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800/40 dark:to-gray-900/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.05]" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-500/20 to-transparent rounded-full -translate-y-20 translate-x-20" />
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Meu Progresso
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Acompanhe seu avanço nos estudos e metas com visualizações detalhadas
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <TrendingUp className="h-2 w-2 text-white" />
                      </div>
                      <span className="text-sm font-medium">Progresso Excelente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Target className="h-2 w-2 text-white" />
                      </div>
                      <span className="text-sm font-medium">3 Metas Ativas</span>
            </div>
                    <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 dark:from-green-900/50 dark:to-blue-900/50 dark:text-green-300 border-green-200 dark:border-green-800 px-3 py-1">
                      <Trophy className="h-3 w-3 mr-1" />
              72% Geral
            </Badge>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      72%
                    </div>
                    <div className="text-sm text-muted-foreground">Progresso Total</div>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Progresso Geral */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-blue-500/10 via-green-500/5 to-purple-500/10 dark:from-blue-900/20 dark:via-green-900/10 dark:to-purple-900/20 border-blue-200/30 dark:border-blue-700/50'
                  : 'bg-gradient-to-br from-blue-50/60 via-green-50/30 to-purple-50/60 dark:from-gray-800/40 dark:to-gray-900/40 border-blue-200 dark:border-blue-700'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Progresso Geral</h2>
                      <p className="text-sm text-muted-foreground">Evolução do semestre</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">72%</div>
                      <div className="text-xs text-muted-foreground">+5% desde o último mês</div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Play className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <AnimatedProgress value={72} delay={0} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Início do Semestre
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      Fim do Semestre
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">28%</div>
                    <div className="text-xs text-muted-foreground">Restante</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">5</div>
                    <div className="text-xs text-muted-foreground">Disciplinas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">45h</div>
                    <div className="text-xs text-muted-foreground">Estudo Total</div>
                  </div>
              </div>
              </div>
            </LiquidGlassCard>

            {/* Progresso por Disciplina */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-green-500/10 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-green-900/20 border-purple-200/30 dark:border-purple-700/50'
                  : 'bg-gradient-to-br from-purple-50/60 via-blue-50/30 to-green-50/60 dark:from-gray-800/40 dark:to-gray-900/40 border-purple-200 dark:border-purple-700'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Disciplinas</h2>
                      <p className="text-sm text-muted-foreground">Progresso individual por matéria</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Target className="h-4 w-4 mr-2" />
                    Ver Todas
                  </Button>
                </div>

                <div className="space-y-6">
                {disciplinas.map((disc) => {
                  const Icon = disc.icone
                  return (
                      <div key={disc.index} className="group">
                        <div
                          className="p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg cursor-pointer"
                          onClick={() => toggleDisciplina(disc.index)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${disc.cor} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                              <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                  {disc.nome}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-muted-foreground">{disc.modulos}</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    {openDisciplina === disc.index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                              </div>
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Progresso</span>
                                  <span className="font-bold text-foreground">
                                    {animatingProgress[`disc-${disc.index}`] || 0}%
                                  </span>
                                </div>
                                <AnimatedProgress
                                  value={animatingProgress[`disc-${disc.index}`] || 0}
                                  delay={disc.index * 200}
                                  className="h-2"
                                />
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {disc.tempoEstudo}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {disc.atividades} atividades
                                  </span>
                                </div>
                                <Badge className={`${disc.cor} text-white text-xs`}>
                                  {disc.progresso >= 80 ? 'Excelente' : disc.progresso >= 60 ? 'Bom' : 'Atenção'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                      {openDisciplina === disc.index && (
                          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-200/50 dark:border-purple-800/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">{disc.nome}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{disc.descricao}</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span>Progresso Atual:</span>
                                    <span className="font-bold">{disc.progresso}%</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Módulos Concluídos:</span>
                                    <span className="font-bold">{disc.modulos}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span>Atividades Realizadas:</span>
                                    <span className="font-bold">{disc.atividades}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground mb-2">Ações</h4>
                                <div className="space-y-2">
                                  <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Play className="h-4 w-4 mr-2" />
                                    Continuar Estudando
                                  </Button>
                                  <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Target className="h-4 w-4 mr-2" />
                                    Ver Atividades
                                  </Button>
                                  <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Ver Conquistas
                                  </Button>
                                </div>
                              </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                </div>
              </div>
            </LiquidGlassCard>

            {/* Metas Interativas */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10 dark:from-orange-900/20 dark:via-red-900/10 dark:to-pink-900/20 border-orange-200/30 dark:border-orange-700/50'
                  : 'bg-gradient-to-br from-orange-50/60 via-red-50/30 to-pink-50/60 dark:from-gray-800/40 dark:to-gray-900/40 border-orange-200 dark:border-orange-700'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Minhas Metas</h2>
                      <p className="text-sm text-muted-foreground">Objetivos e desafios pessoais</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Nova Meta
                    </Button>
                    <Button variant="default" size="sm" className="rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                      <Trophy className="h-4 w-4 mr-2" />
                      Progresso
                    </Button>
                  </div>
                </div>

              <div className="space-y-4">
                  {metas.map((meta) => {
                    const categoriaConfig = getCategoriaConfig(meta.categoria)
                    const prioridadeConfig = getPrioridadeConfig(meta.prioridade)
                    const PriorityIcon = prioridadeConfig.icon
                    const CategoriaIcon = categoriaConfig.icon
                    return (
                      <div key={meta.id} className={`group relative p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg ${
                        meta.concluida ? 'border-l-green-500' : 'border-l-orange-500'
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl ${categoriaConfig.color} flex items-center justify-center shadow-lg`}>
                              <CategoriaIcon className="h-6 w-6 text-white" />
                            </div>
                      <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                  {meta.titulo}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge className={prioridadeConfig.color}>
                                    <PriorityIcon className="h-3 w-3 mr-1" />
                                    {meta.prioridade}
                                  </Badge>
                                  <Badge className={meta.concluida ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}>
                                    {meta.concluida ? 'Concluída' : 'Ativa'}
                          </Badge>
                        </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                {meta.descricao}
                              </p>
                              <div className="mb-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-muted-foreground">Progresso</span>
                                  <span className="font-bold text-foreground">
                                    {animatingProgress[`meta-${meta.id}`] || 0}%
                                  </span>
                                </div>
                                <AnimatedProgress
                                  value={animatingProgress[`meta-${meta.id}`] || 0}
                                  delay={(disciplinas.length + meta.id) * 200}
                                  className="h-2"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Prazo: {meta.prazo}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {meta.categoria}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant={metaCheckboxes[meta.id] ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleCheckboxChange(meta.id)}
                                    className={`rounded-full ${metaCheckboxes[meta.id] ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                  >
                                    {metaCheckboxes[meta.id] ? <Check className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                                  </Button>
                                  <Button variant="outline" size="sm" className="rounded-full">
                                    <Play className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  </div>
              </div>
            </LiquidGlassCard>

            {/* Linha do Tempo Visualmente Rica */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-pink-900/20 border-indigo-200/30 dark:border-indigo-700/50'
                  : 'bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-pink-50/60 dark:from-gray-800/40 dark:to-gray-900/40 border-indigo-200 dark:border-indigo-700'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Cronograma do Semestre</h2>
                      <p className="text-sm text-muted-foreground">Linha do tempo com marcos importantes</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Milestone className="h-4 w-4 mr-2" />
                    Ver Todos
                  </Button>
                </div>

              <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
                  <div className="absolute left-5 top-0 bottom-0 w-3 bg-gradient-to-b from-indigo-200/50 via-purple-200/50 to-pink-200/50 rounded-full"></div>

                  <div className="space-y-8">
                  {marcos.map((marco, index) => {
                    const Icon = marco.icone
                      const tipoConfig = getTipoMarcoConfig(marco.tipo)
                      const isCompleted = marco.status === 'Concluído'
                      const isPending = marco.status === 'Pendente'
                      const isFuture = marco.status === 'Futuro'

                    return (
                        <div key={index} className="flex items-start gap-6 relative group">
                          <div className={`relative z-10`}>
                            <div className={`w-14 h-14 rounded-2xl ${tipoConfig.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300 ${
                              isCompleted ? 'ring-4 ring-green-200 dark:ring-green-800' :
                              isPending ? 'ring-4 ring-yellow-200 dark:ring-yellow-800' :
                              'ring-4 ring-gray-200 dark:ring-gray-800'
                            }`}>
                              <Icon className={`h-7 w-7 ${isCompleted ? 'text-white' : isPending ? 'text-white' : 'text-gray-400'}`} />
                            </div>
                            {isCompleted && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                            {isPending && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                                <Clock className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 pb-8">
                            <div className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg group-hover:translate-x-2">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                    {marco.data}
                                  </span>
                                  <Badge className={`${
                                    isCompleted ? 'bg-green-500 text-white' :
                                    isPending ? 'bg-yellow-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}>
                                    {marco.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {marco.tipo}
                                  </Badge>
                                </div>
                                <div className="flex gap-2">
                                  {isPending && (
                                    <Button size="sm" variant="outline" className="rounded-full">
                                      <Play className="h-3 w-3 mr-1" />
                                      Iniciar
                                    </Button>
                                  )}
                                  {isCompleted && (
                                    <Button size="sm" variant="outline" className="rounded-full bg-green-50 dark:bg-green-900/20">
                                      <Check className="h-3 w-3 mr-1" />
                                      Concluído
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {marco.evento}
                              </h3>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {marco.descricao}
                              </p>

                              {isPending && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Preparação necessária</span>
                                    <span className="font-medium text-indigo-600 dark:text-indigo-400">75% Pronto</span>
                                  </div>
                                  <AnimatedProgress value={75} delay={index * 300} className="mt-2 h-1" />
                                </div>
                              )}
                        </div>
                        </div>
                      </div>
                    )
                  })}
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
