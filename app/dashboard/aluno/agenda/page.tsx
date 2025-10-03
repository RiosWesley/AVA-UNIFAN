"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from '@/components/layout/sidebar'
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Calendar, Clock, MapPin, Users, Edit3, Trash2, Plus, Filter, Bell, BookOpen, Zap, Trophy, Sparkles, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Info, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AgendaPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [selectedDay, setSelectedDay] = useState('Ter')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

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

  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  const eventosPorDia = {
    Seg: [
      {
        hora: '08:00 - 09:40',
        titulo: 'Matemática',
        tipo: 'Aula',
        sala: 'A-101',
        professor: 'Prof. Silva',
        participantes: 25,
        descricao: 'Cálculo diferencial e integral aplicado a problemas reais',
        prioridade: 'alta',
        cor: 'blue'
      },
      {
        hora: '10:00 - 11:40',
        titulo: 'Física',
        tipo: 'Laboratório',
        sala: 'Lab-201',
        professor: 'Prof. Costa',
        participantes: 20,
        descricao: 'Experimentos práticos sobre leis de Newton',
        prioridade: 'média',
        cor: 'green'
      },
    ],
    Ter: [
      {
        hora: '14:00 - 15:40',
        titulo: 'Português',
        tipo: 'Aula',
        sala: 'B-205',
        professor: 'Prof. Santos',
        participantes: 28,
        descricao: 'Análise de textos literários brasileiros',
        prioridade: 'alta',
        cor: 'purple'
      },
      {
        hora: '16:00 - 17:40',
        titulo: 'Reunião de Projeto',
        tipo: 'Evento',
        sala: 'Sala 301',
        professor: 'Coord. Maria',
        participantes: 8,
        descricao: 'Planejamento do projeto final de semestre',
        prioridade: 'alta',
        cor: 'orange'
      },
    ],
    Qua: [
      {
        hora: '08:00 - 09:40',
        titulo: 'História',
        tipo: 'Aula',
        sala: 'C-301',
        professor: 'Prof. Oliveira',
        participantes: 22,
        descricao: 'Período colonial brasileiro e suas características',
        prioridade: 'média',
        cor: 'yellow'
      },
      {
        hora: '16:00 - 17:30',
        titulo: 'Reunião de Turma',
        tipo: 'Evento',
        sala: 'Auditório',
        professor: '',
        participantes: 30,
        descricao: 'Discussão sobre melhorias na instituição',
        prioridade: 'baixa',
        cor: 'red'
      },
    ],
    Qui: [
      {
        hora: '10:00 - 11:40',
        titulo: 'Biologia',
        tipo: 'Aula',
        sala: 'D-102',
        professor: 'Prof. Lima',
        participantes: 24,
        descricao: 'Ecossistemas e biodiversidade brasileira',
        prioridade: 'alta',
        cor: 'teal'
      },
    ],
    Sex: [
      {
        hora: '08:00 - 09:40',
        titulo: 'Química',
        tipo: 'Laboratório',
        sala: 'Lab-105',
        professor: 'Prof. Ferreira',
        participantes: 18,
        descricao: 'Reações químicas e análise de compostos',
        prioridade: 'média',
        cor: 'cyan'
      },
      {
        hora: '14:00 - 15:40',
        titulo: 'Educação Física',
        tipo: 'Prática',
        sala: 'Quadra',
        professor: 'Prof. Mendes',
        participantes: 26,
        descricao: 'Treinamento funcional e jogos coletivos',
        prioridade: 'baixa',
        cor: 'pink'
      },
    ],
    Sáb: [
      {
        hora: '09:00 - 11:00',
        titulo: 'Estudo Dirigido - Matemática',
        tipo: 'Atividade',
        sala: 'Sala de Estudo',
        professor: 'Monitor',
        participantes: 15,
        descricao: 'Reforço de conteúdo e resolução de exercícios',
        prioridade: 'média',
        cor: 'indigo'
      },
    ],
    Dom: [],
  }

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'Aula':
        return {
          icon: BookOpen,
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          textColor: 'text-blue-700 dark:text-blue-300',
          bgColor: 'bg-blue-100 dark:bg-blue-900/50',
          borderColor: 'border-blue-200 dark:border-blue-800'
        }
      case 'Laboratório':
        return {
          icon: Zap,
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          textColor: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-100 dark:bg-green-900/50',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      case 'Evento':
        return {
          icon: Trophy,
          color: 'bg-gradient-to-r from-purple-500 to-pink-500',
          textColor: 'text-purple-700 dark:text-purple-300',
          bgColor: 'bg-purple-100 dark:bg-purple-900/50',
          borderColor: 'border-purple-200 dark:border-purple-800'
        }
      case 'Prática':
        return {
          icon: Sparkles,
          color: 'bg-gradient-to-r from-orange-500 to-red-500',
          textColor: 'text-orange-700 dark:text-orange-300',
          bgColor: 'bg-orange-100 dark:bg-orange-900/50',
          borderColor: 'border-orange-200 dark:border-orange-800'
        }
      case 'Atividade':
        return {
          icon: CheckCircle,
          color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
          textColor: 'text-yellow-700 dark:text-yellow-300',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
          borderColor: 'border-yellow-200 dark:border-yellow-800'
        }
      default:
        return {
          icon: Info,
          color: 'bg-gradient-to-r from-gray-500 to-slate-500',
          textColor: 'text-gray-700 dark:text-gray-300',
          bgColor: 'bg-gray-100 dark:bg-gray-900/50',
          borderColor: 'border-gray-200 dark:border-gray-800'
        }
    }
  }

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return <AlertCircle className="h-3 w-3 text-red-500" />
      case 'média': return <Clock className="h-3 w-3 text-yellow-500" />
      case 'baixa': return <CheckCircle className="h-3 w-3 text-green-500" />
      default: return <Info className="h-3 w-3 text-gray-500" />
    }
  }

  // Memoized calendar days to avoid recalculation on every render
  const calendarDays = useMemo(() => {
    const days = []
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Empty cells for days before month starts
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null)
    }

    // Days of the month
    for (let day = 1; day <= lastDay; day++) {
      const dayOfWeek = new Date(currentYear, currentMonth, day).getDay()
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayOfWeek]
      const hasEvents = Object.keys(eventosPorDia).includes(dayName) && eventosPorDia[dayName].length > 0
      days.push({ day, hasEvents, dayName })
    }

    return days
  }, [currentYear, currentMonth])

  const eventosHoje = eventosPorDia[selectedDay] || []

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gradient-to-br from-cyan-50/30 via-blue-50/20 to-purple-50/30 dark:from-gray-900/20 dark:via-cyan-900/10 dark:to-purple-900/10' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Header Hero Section */}
          <div className={`relative overflow-hidden rounded-3xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 dark:from-cyan-900/30 dark:via-blue-900/30 dark:to-purple-900/30 border-cyan-200/30 dark:border-cyan-700/50'
              : 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800/40 dark:to-gray-900/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.05]" />
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full -translate-y-20 translate-x-20" />
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Minha Agenda
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Organize suas aulas, eventos e compromissos acadêmicos
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                        <Calendar className="h-2 w-2 text-white" />
                      </div>
                      <span className="text-sm font-medium">Agenda Inteligente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <Bell className="h-2 w-2 text-white" />
                      </div>
                      <span className="text-sm font-medium">Lembretes Ativos</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 dark:from-cyan-900/50 dark:to-blue-900/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 px-3 py-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Atualizado
                    </Badge>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      {eventosHoje.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Eventos Hoje</div>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                </div>
            </div>
            </div>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Calendário Interativo */}
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
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Calendário</h2>
                      <p className="text-sm text-muted-foreground">Visualização mensal interativa</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        if (currentMonth === 0) {
                          setCurrentMonth(11)
                          setCurrentYear(currentYear - 1)
                        } else {
                          setCurrentMonth(currentMonth - 1)
                        }
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center px-4">
                      <div className="font-bold text-lg">{monthNames[currentMonth]}</div>
                      <div className="text-sm text-muted-foreground">{currentYear}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        if (currentMonth === 11) {
                          setCurrentMonth(0)
                          setCurrentYear(currentYear + 1)
                        } else {
                          setCurrentMonth(currentMonth + 1)
                        }
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Header dos dias da semana */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {diasSemana.map((dia) => (
                    <div key={dia} className="p-3 text-center">
                      <div className="font-bold text-sm text-foreground">{dia}</div>
                    </div>
                  ))}
                </div>

                {/* Grid do calendário */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((dayInfo, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                        dayInfo
                          ? dayInfo.hasEvents
                            ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700 hover:shadow-lg'
                            : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-800/80'
                          : 'bg-transparent'
                      } ${
                        selectedDay === dayInfo?.dayName ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                      onClick={() => dayInfo?.dayName && setSelectedDay(dayInfo.dayName)}
                    >
                      {dayInfo ? (
                        <>
                          <div className="font-semibold text-sm mb-2">{dayInfo.day}</div>
                          {dayInfo.hasEvents && (
                            <div className="space-y-1">
                              {(eventosPorDia[dayInfo.dayName] || []).slice(0, 2).map((evento, idx) => (
                                <div
                                  key={idx}
                                  className={`text-xs rounded-lg px-2 py-1 ${getTipoConfig(evento.tipo).bgColor} ${getTipoConfig(evento.tipo).borderColor} border`}
                                >
                                  <div className="font-medium truncate">{evento.titulo}</div>
                                  <div className="text-xs opacity-75">{evento.hora.slice(0, 5)}</div>
                                </div>
                              ))}
                              {(eventosPorDia[dayInfo.dayName] || []).length > 2 && (
                                <div className="text-xs text-center text-muted-foreground font-medium">
                                  +{(eventosPorDia[dayInfo.dayName] || []).length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Com eventos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <span>Sem eventos</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Evento
                    </Button>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            {/* Eventos do Dia Selecionado */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10 dark:from-green-900/20 dark:via-emerald-900/10 dark:to-teal-900/20 border-green-200/30 dark:border-green-700/50'
                  : 'bg-gradient-to-br from-green-50/60 via-emerald-50/30 to-teal-50/60 dark:from-gray-800/40 dark:to-gray-900/40 border-green-200 dark:border-green-700'
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Eventos - {selectedDay}</h2>
                      <p className="text-sm text-muted-foreground">{eventosHoje.length} eventos programados</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                    <Button variant="default" size="sm" className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {eventosHoje.length > 0 ? eventosHoje.map((evento, index) => {
                    const tipoConfig = getTipoConfig(evento.tipo)
                    const TipoIcon = tipoConfig.icon
                    return (
                      <div key={index} className="group relative p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${tipoConfig.color} flex items-center justify-center shadow-lg`}>
                                <TipoIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                  {evento.titulo}
                                </h3>
                                <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={`${tipoConfig.bgColor} ${tipoConfig.borderColor} ${tipoConfig.textColor} border px-2 py-1`}>
                                {evento.tipo}
                              </Badge>
                              {getPrioridadeIcon(evento.prioridade)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="font-medium">{evento.hora}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>{evento.sala}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {evento.professor && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  <span>{evento.professor}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span>{evento.participantes} participantes</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                {evento.prioridade === 'alta' ? 'Prioridade Alta' :
                                 evento.prioridade === 'média' ? 'Prioridade Média' : 'Prioridade Baixa'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8 px-2 rounded-full">
                                <Bell className="h-3 w-3 mr-1" />
                                Lembrete
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2 rounded-full">
                                <Edit3 className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 px-2 rounded-full text-red-500 hover:text-red-700">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remover
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Dia Livre!</h3>
                      <p className="text-muted-foreground mb-4">Nenhum evento programado para {selectedDay}</p>
                      <Button variant="outline" className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Agendar Evento
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Estatísticas Mensais */}
          <LiquidGlassCard
            intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
            className={`relative overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
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
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Estatísticas Mensais</h2>
                    <p className="text-sm text-muted-foreground">Resumo de {monthNames[currentMonth]} {currentYear}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Trophy className="h-4 w-4 mr-2" />
                  Ver Relatório
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="group p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">24</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">Aulas</div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-1">
                    <div className="w-4/5 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Este mês</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">5</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">Eventos</div>
                  <div className="w-full bg-green-200 dark:bg-green-900/50 rounded-full h-1">
                    <div className="w-3/5 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Pendentes</div>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">12</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">Atividades</div>
                  <div className="w-full bg-orange-200 dark:bg-orange-900/50 rounded-full h-1">
                    <div className="w-2/3 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                  </div>
                </div>

                <div className="group p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Concluídas</div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">8</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">Avaliações</div>
                  <div className="w-full bg-purple-200 dark:bg-purple-900/50 rounded-full h-1">
                    <div className="w-4/5 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Participação</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">89%</span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-900/50 rounded-full h-2 mt-2">
                  <div className="w-4/5 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      </main>
    </div>
  )
}
