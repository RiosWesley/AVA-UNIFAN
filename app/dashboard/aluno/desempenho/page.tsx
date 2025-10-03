"use client"

import { useState, useEffect } from "react"
import { Sidebar } from '@/components/layout/sidebar'
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { BarChart3, LineChart, Award, TrendingUp, GraduationCap, Star, AlertTriangle, Clock, Trophy, Target, Zap, BookOpen, Calendar, ChevronUp, ChevronDown, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export default function DesempenhoPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [animatedValues, setAnimatedValues] = useState<{[key: string]: number}>({})

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

  // Animação de contadores
  useEffect(() => {
    const animateCounters = () => {
      const counters = ['mediaGeral', 'melhorNota', 'disciplinasAprovadas', 'frequencia']
      const timeouts: NodeJS.Timeout[] = []

      counters.forEach(counter => {
        const timer = setTimeout(() => {
          setAnimatedValues(prev => ({ ...prev, [counter]: 1 }))
        }, Math.random() * 1000)
        timeouts.push(timer)
      })

      // Cleanup function
      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout))
      }
    }

    animateCounters()
  }, []) // Empty dependency array is correct here since we only want to run once on mount

  const metricas = [
    {
      titulo: 'Média Geral',
      valor: 8.5,
      valorDisplay: '8.5',
      tendencia: '+0.3',
      icone: GraduationCap,
      cor: 'text-green-600',
      bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      descricao: 'Média de todas as disciplinas'
    },
    {
      titulo: 'Melhor Nota',
      valor: 9.8,
      valorDisplay: '9.8',
      tendencia: '',
      icone: Star,
      cor: 'text-yellow-600',
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      descricao: 'Sua nota mais alta este semestre'
    },
    {
      titulo: 'Disciplinas Aprovadas',
      valor: 7,
      valorDisplay: '7/8',
      tendencia: '',
      icone: TrendingUp,
      cor: 'text-blue-600',
      bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      descricao: 'Aprovado em 7 de 8 disciplinas'
    },
    {
      titulo: 'Frequência',
      valor: 95,
      valorDisplay: '95%',
      tendencia: '+2%',
      icone: Clock,
      cor: 'text-purple-600',
      bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
      descricao: 'Presença nas aulas'
    },
  ]

  const notasRecentes = [
    {
      disciplina: 'Matemática',
      nota: 9.2,
      data: '15/10/2024',
      conceito: 'Excelente',
      professor: 'Prof. Silva',
      tendencia: 'up',
      cor: 'green'
    },
    {
      disciplina: 'Português',
      nota: 8.7,
      data: '12/10/2024',
      conceito: 'Ótimo',
      professor: 'Prof. Santos',
      tendencia: 'up',
      cor: 'blue'
    },
    {
      disciplina: 'Física',
      nota: 7.5,
      data: '10/10/2024',
      conceito: 'Bom',
      professor: 'Prof. Costa',
      tendencia: 'down',
      cor: 'yellow'
    },
    {
      disciplina: 'História',
      nota: 9.0,
      data: '08/10/2024',
      conceito: 'Excelente',
      professor: 'Prof. Oliveira',
      tendencia: 'stable',
      cor: 'green'
    },
  ]

  const conquistas = [
    {
      titulo: 'Excelência em Matemática',
      descricao: 'Nota máxima na turma com média 9.8',
      data: '15/10/2024',
      icone: Star,
      tipo: 'academico',
      pontos: 150,
      raridade: 'raro'
    },
    {
      titulo: 'Frequência Perfeita',
      descricao: '100% de presença durante o mês de outubro',
      data: '01/10/2024',
      icone: Award,
      tipo: 'disciplina',
      pontos: 100,
      raridade: 'comum'
    },
    {
      titulo: 'Líder de Grupo',
      descricao: 'Melhor desempenho no projeto de Física',
      data: '25/09/2024',
      icone: Trophy,
      tipo: 'lideranca',
      pontos: 200,
      raridade: 'epico'
    },
    {
      titulo: 'Primeiro Lugar',
      descricao: 'Melhor nota da turma em Matemática',
      data: '20/09/2024',
      icone: Target,
      tipo: 'competicao',
      pontos: 250,
      raridade: 'lendario'
    },
  ]

  const getConceitoColor = (conceito: string) => {
    switch (conceito) {
      case 'Excelente': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/50 dark:to-emerald-900/50 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'Ótimo': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/50 dark:to-cyan-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'Bom': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 dark:from-yellow-900/50 dark:to-orange-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'Regular': return 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 dark:from-orange-900/50 dark:to-red-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      case 'Insuficiente': return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 dark:from-red-900/50 dark:to-pink-900/50 dark:text-red-300 border-red-200 dark:border-red-800'
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 dark:from-gray-900/50 dark:to-slate-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    }
  }

  const getRaridadeConfig = (raridade: string) => {
    switch (raridade) {
      case 'comum': return { color: 'bg-gray-500', text: 'Comum', icon: Award }
      case 'raro': return { color: 'bg-blue-500', text: 'Raro', icon: Star }
      case 'epico': return { color: 'bg-purple-500', text: 'Épico', icon: Trophy }
      case 'lendario': return { color: 'bg-yellow-500', text: 'Lendário', icon: Sparkles }
      default: return { color: 'bg-gray-500', text: 'Comum', icon: Award }
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up': return <ChevronUp className="h-3 w-3 text-green-500" />
      case 'down': return <ChevronDown className="h-3 w-3 text-red-500" />
      default: return <div className="h-3 w-3 rounded-full bg-gray-400" />
    }
  }

  const AnimatedCounter = ({ value, suffix = '', delay = 0 }: { value: number, suffix?: string, delay?: number }) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
      const timer = setTimeout(() => {
        const increment = value / 50
        const counter = setInterval(() => {
          setDisplayValue(prev => {
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

    return <span>{displayValue.toFixed(1)}{suffix}</span>
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-blue-50/30 dark:from-gray-900/20 dark:via-purple-900/10 dark:to-blue-900/10' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Header Hero Section */}
          <div className={`relative overflow-hidden rounded-3xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30 border-purple-200/30 dark:border-purple-700/50'
              : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800/40 dark:to-gray-900/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.05]" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full -translate-y-20 translate-x-20" />
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    Meu Desempenho
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Acompanhe seu progresso acadêmico e conquistas com métricas detalhadas
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <TrendingUp className="h-2 w-2 text-white" />
                      </div>
                      <span className="text-sm font-medium">Tendência Positiva</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                        <Sparkles className="h-2 w-2 text-white" />
                      </div>
                      <span className="text-sm font-medium">Excelente Progresso</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/50 dark:to-emerald-900/50 dark:text-green-300 border-green-200 dark:border-green-800 px-3 py-1">
                      <Trophy className="h-3 w-3 mr-1" />
                      Top Performer
                    </Badge>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      8.5
                    </div>
                    <div className="text-sm text-muted-foreground">Média Geral</div>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <GraduationCap className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Métricas Animadas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metricas.map((metrica, index) => {
              const Icon = metrica.icone
              const counterKey = metrica.titulo.toLowerCase().replace(' ', '').replace('ç', 'c').replace('á', 'a')
              return (
                <LiquidGlassCard
                  key={index}
                  intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                  className={`group relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                    isLiquidGlass
                      ? 'bg-white/20 dark:bg-gray-800/30 border-gray-200/30 dark:border-gray-700/50'
                      : 'bg-white/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full -translate-y-12 translate-x-12" />
                  <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${metrica.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {metrica.tendencia && (
                        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full">
                          <ChevronUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-bold text-green-600 dark:text-green-400">{metrica.tendencia}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">{metrica.titulo}</h3>
                    <div className={`text-4xl font-bold mb-2 ${metrica.cor} group-hover:scale-110 transition-transform duration-300`}>
                      {animatedValues[counterKey] ? (
                        <AnimatedCounter value={metrica.valor} suffix={metrica.titulo === 'Disciplinas Aprovadas' ? '/8' : metrica.titulo === 'Frequência' ? '%' : ''} delay={index * 200} />
                      ) : (
                        '0'
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{metrica.descricao}</p>
                  </div>
                </LiquidGlassCard>
              )
            })}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Notas Recentes */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] lg:col-span-2 ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-purple-500/10 dark:from-blue-900/20 dark:via-cyan-900/10 dark:to-purple-900/20 border-blue-200/30 dark:border-blue-700/50'
                  : 'bg-gradient-to-br from-blue-50/60 via-cyan-50/30 to-purple-50/60 dark:from-gray-800/40 dark:to-gray-900/40 border-blue-200 dark:border-blue-700'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Notas Recentes</h2>
                      <p className="text-sm text-muted-foreground">Últimas avaliações e conceitos</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Todas
                  </Button>
                </div>

                <div className="space-y-4">
                  {notasRecentes.map((nota, index) => (
                    <div key={index} className={`group relative p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg ${
                      nota.tendencia === 'up' ? 'border-l-green-500' :
                      nota.tendencia === 'down' ? 'border-l-red-500' : 'border-l-blue-500'
                    }`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground">{nota.disciplina}</h3>
                              <p className="text-sm text-muted-foreground">{nota.professor}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">{nota.nota}</div>
                            <div className="flex items-center gap-1">
                              {getTendenciaIcon(nota.tendencia)}
                        <Badge className={getConceitoColor(nota.conceito)}>{nota.conceito}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{nota.data}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(nota.nota / 10) * 100} className="w-16 h-1" />
                            <span className="text-xs text-muted-foreground">
                              {((nota.nota / 10) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>

            {/* Conquistas com Gamificação */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10 dark:from-yellow-900/20 dark:via-orange-900/10 dark:to-red-900/20 border-yellow-200/30 dark:border-yellow-700/50'
                  : 'bg-gradient-to-br from-yellow-50/60 via-orange-50/30 to-red-50/60 dark:from-gray-800/40 dark:to-gray-900/40 border-yellow-200 dark:border-yellow-700'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Conquistas</h2>
                      <p className="text-sm text-muted-foreground">Seus troféus e realizações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {conquistas.reduce((acc, c) => acc + c.pontos, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Pontos Totais</div>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {conquistas.map((conquista, index) => {
                    const raridadeConfig = getRaridadeConfig(conquista.raridade)
                    const RaridadeIcon = raridadeConfig.icon
                    return (
                      <div key={index} className="group relative p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/30 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl ${raridadeConfig.color} flex items-center justify-center shadow-lg`}>
                              <conquista.icone className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-foreground group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                                  {conquista.titulo}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${raridadeConfig.color} text-white text-xs`}>
                                    <RaridadeIcon className="h-3 w-3 mr-1" />
                                    {raridadeConfig.text}
                                  </Badge>
                                  <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                                    +{conquista.pontos} XP
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                                {conquista.descricao}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{conquista.data}</span>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Desbloqueado</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                    </div>

                <div className="mt-6 pt-4 border-t border-yellow-200/50 dark:border-yellow-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progresso para próxima conquista</span>
                    <span className="text-sm font-medium">750 / 1000 XP</span>
                  </div>
                  <Progress value={75} className="mt-2" />
                </div>
              </div>
            </LiquidGlassCard>

            {/* Gráfico de Barras Interativo */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] col-span-2 ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-green-500/10 via-blue-500/5 to-purple-500/10 dark:from-green-900/20 dark:via-blue-900/10 dark:to-purple-900/20 border-green-200/30 dark:border-green-700/50'
                  : 'bg-gradient-to-br from-green-50/60 via-blue-50/30 to-purple-50/60 dark:from-gray-800/40 dark:to-gray-900/40 border-green-200 dark:border-green-700'
              }`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-green-500/20 to-transparent rounded-full -translate-y-20 translate-x-20" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Performance por Disciplina</h2>
                      <p className="text-sm text-muted-foreground">Comparativo detalhado de notas</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </div>

                <div className="h-64 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 dark:to-gray-900/5" />
                  <div className="flex items-end justify-around h-full space-x-3 px-4">
                    {[
                      { disc: 'Matemática', nota: 9.2, cor: 'from-blue-500 to-cyan-500', altura: 'h-36' },
                      { disc: 'Português', nota: 8.7, cor: 'from-green-500 to-emerald-500', altura: 'h-32' },
                      { disc: 'Física', nota: 7.5, cor: 'from-yellow-500 to-orange-500', altura: 'h-28' },
                      { disc: 'História', nota: 9.0, cor: 'from-purple-500 to-pink-500', altura: 'h-34' },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center group">
                        <div className="relative">
                          <div className={`w-16 ${item.altura} bg-gradient-to-t ${item.cor} rounded-t-2xl shadow-lg group-hover:scale-105 transition-all duration-300 flex items-end justify-center pb-2`}>
                            <span className="text-white font-bold text-sm">{item.nota}</span>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Star className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <span className="text-sm font-medium mt-3 text-center max-w-16 break-words">{item.disc}</span>
                    </div>
                  ))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-200/50 to-transparent dark:from-gray-700/50" />
                </div>
              </div>
            </LiquidGlassCard>

            {/* Gráfico de Linha Avançado */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] col-span-3 ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 dark:from-purple-900/20 dark:via-pink-900/10 dark:to-blue-900/20 border-purple-200/30 dark:border-purple-700/50'
                  : 'bg-gradient-to-br from-purple-50/60 via-pink-50/30 to-blue-50/60 dark:from-gray-800/40 dark:to-gray-900/40 border-purple-200 dark:border-purple-700'
              }`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full -translate-y-20 translate-x-20" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <LineChart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Evolução Semestral</h2>
                      <p className="text-sm text-muted-foreground">Progresso das notas ao longo do tempo</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full">
                      2024
                    </Button>
                    <Button variant="default" size="sm" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      +15%
                    </Button>
                  </div>
                </div>

                <div className="h-64 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 dark:to-gray-900/5" />
                  <svg width="100%" height="100%" viewBox="0 0 400 200" className="absolute inset-0">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20 160 Q60 140 100 120 Q140 100 180 80 Q220 60 260 40 Q300 20 340 10"
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="4"
                      className="drop-shadow-sm"
                    />
                    <path
                      d="M20 160 Q60 140 100 120 Q140 100 180 80 Q220 60 260 40 Q300 20 340 10"
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                    {[
                      { cx: 20, cy: 160, nota: '7.2' },
                      { cx: 100, cy: 120, nota: '8.1' },
                      { cx: 180, cy: 80, nota: '8.8' },
                      { cx: 260, cy: 40, nota: '9.2' },
                      { cx: 340, cy: 10, nota: '8.5' },
                    ].map((point, i) => (
                      <g key={i}>
                        <circle cx={point.cx} cy={point.cy} r="6" fill="url(#lineGradient)" className="hover:r-8 transition-all duration-300" />
                        <circle cx={point.cx} cy={point.cy} r="3" fill="white" />
                        <text x={point.cx} y={point.cy - 15} textAnchor="middle" className="text-xs font-bold fill-current text-gray-700 dark:text-gray-300">
                          {point.nota}
                        </text>
                      </g>
                    ))}
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-200/50 to-transparent dark:from-gray-700/50" />
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
