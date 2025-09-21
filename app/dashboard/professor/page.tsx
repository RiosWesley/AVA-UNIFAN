"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { BookOpen, Calendar, FileText, Users, TrendingUp, CheckCircle, Star, Award, Clock, GraduationCap, Activity, Target, Sparkles, Bell, ChevronRight, Play } from "lucide-react"

export default function ProfessorDashboard() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)

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

  const turmas = [
    {
      nome: "9º Ano A",
      disciplina: "Matemática",
      alunos: 28,
      proxima: "08:00 - 09:40",
      sala: "A-101",
      status: "Em andamento",
      media: 8.2,
      destaque: "Melhor turma"
    },
    {
      nome: "8º Ano B",
      disciplina: "Matemática",
      alunos: 25,
      proxima: "10:00 - 11:40",
      sala: "B-205",
      status: "Em andamento",
      media: 7.8,
      destaque: "Progresso constante"
    },
    {
      nome: "7º Ano C",
      disciplina: "Matemática",
      alunos: 30,
      proxima: "14:00 - 15:40",
      sala: "C-301",
      status: "Em andamento",
      media: 8.5,
      destaque: "Excelente participação"
    },
  ]

  const agendaSemanal = [
    { dia: "Segunda", aulas: 4, turmas: ["9º A", "8º B"], totalHoras: 8 },
    { dia: "Terça", aulas: 3, turmas: ["7º C", "9º A"], totalHoras: 6 },
    { dia: "Quarta", aulas: 4, turmas: ["8º B", "7º C"], totalHoras: 8 },
    { dia: "Quinta", aulas: 3, turmas: ["9º A", "8º B"], totalHoras: 6 },
    { dia: "Sexta", aulas: 2, turmas: ["7º C"], totalHoras: 4 },
  ]

  const atividades = [
    {
      titulo: "Prova de Álgebra",
      turma: "9º Ano A",
      prazo: "20/03/2024",
      status: "Pendente",
      prioridade: "Alta",
      tipo: "Prova"
    },
    {
      titulo: "Lista de Exercícios",
      turma: "8º Ano B",
      prazo: "18/03/2024",
      status: "Corrigindo",
      prioridade: "Média",
      tipo: "Exercício"
    },
    {
      titulo: "Projeto Geometria",
      turma: "7º Ano C",
      prazo: "25/03/2024",
      status: "Aguardando",
      prioridade: "Baixa",
      tipo: "Projeto"
    },
  ]

  const proximasAulas = [
    {
      turma: "9º Ano A - Matemática",
      horario: "08:00 - 09:40",
      sala: "A-101",
      tipo: "Teórica",
      status: "Próxima"
    },
    {
      turma: "8º Ano B - Matemática",
      horario: "10:00 - 11:40",
      sala: "B-205",
      tipo: "Prática",
      status: "Em breve"
    }
  ]

  const comunicados = [
    {
      titulo: "Reunião Pedagógica",
      descricao: "Reunião com coordenação",
      data: "Hoje, 16:00",
      prioridade: "Alta"
    },
    {
      titulo: "Nova diretriz escolar",
      descricao: "Atualização nas normas de avaliação",
      data: "Amanhã, 14:00",
      prioridade: "Média"
    }
  ]

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header aprimorado */}
          <div className={`flex items-center justify-between mb-8 p-6 rounded-2xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  Olá, Prof. Maria!
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Gerencie suas turmas e atividades
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    <Star className="h-3 w-3 mr-1" />
                    {turmas.length} turmas ativas
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                    <Award className="h-3 w-3 mr-1" />
                    Média geral: 8.2
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
              }`}>
                <FileText className="h-5 w-5 mr-2" />
                Lançar Notas
              </LiquidGlassButton>
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
              }`}>
                <CheckCircle className="h-5 w-5 mr-2" />
                Registrar Frequência
              </LiquidGlassButton>
            </div>
          </div>

          {/* Cards de estatísticas aprimorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total de Turmas</CardTitle>
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">3</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Activity className="h-3 w-3 mr-1" />
                  83 alunos no total
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Aulas Hoje</CardTitle>
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">4</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  16 horas/aula semanais
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Atividades Pendentes</CardTitle>
                <div className="p-2 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                  <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">5</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Target className="h-3 w-3 mr-1" />
                  2 para correção
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Média das Turmas</CardTitle>
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">8.2</div>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <Award className="h-3 w-3 mr-1" />
                  +0.2 desde o último bimestre
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>

          {/* Layout principal aprimorado */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
            {/* Conteúdo principal - ocupa 8 colunas no xl */}
            <div className="xl:col-span-8 space-y-6">
              {/* Próximas Aulas */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Próximas Aulas
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Suas aulas de hoje e próximas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {proximasAulas.map((aula, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{aula.turma}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{aula.sala}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs mr-2">
                                {aula.tipo}
                              </Badge>
                              <span className={`text-xs ${
                                aula.status === "Próxima" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                              }`}>
                                {aula.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{aula.horario}</p>
                          <LiquidGlassButton size="sm" variant="outline" className="mt-2">
                            <ChevronRight className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Minhas Turmas */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <BookOpen className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Minhas Turmas
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Turmas sob sua responsabilidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {turmas.map((turma, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{turma.nome}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{turma.disciplina}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{turma.alunos} alunos</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs mr-2">
                                {turma.status}
                              </Badge>
                              <span className="text-xs text-green-600 dark:text-green-400">
                                Média: {turma.media}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{turma.proxima}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{turma.sala}</p>
                          <LiquidGlassButton size="sm" variant="outline" className="mt-2">
                            Gerenciar
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Atividades Recentes */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <FileText className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                    Atividades Recentes
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Atividades e avaliações pendentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {atividades.map((atividade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                            atividade.tipo === "Prova" ? "bg-red-500/20" :
                            atividade.tipo === "Exercício" ? "bg-blue-500/20" : "bg-green-500/20"
                          }`}>
                            <FileText className={`h-5 w-5 ${
                              atividade.tipo === "Prova" ? "text-red-600 dark:text-red-400" :
                              atividade.tipo === "Exercício" ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-400"
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{atividade.titulo}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{atividade.turma}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs mr-2">
                                {atividade.tipo}
                              </Badge>
                              <Badge
                                variant={
                                  atividade.prioridade === "Alta"
                                    ? "destructive"
                                    : atividade.prioridade === "Média"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs"
                              >
                                {atividade.prioridade}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              atividade.status === "Pendente"
                                ? "destructive"
                                : atividade.status === "Corrigindo"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {atividade.status}
                          </Badge>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{atividade.prazo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </div>

            {/* Conteúdo lateral - ocupa 4 colunas no xl */}
            <div className="xl:col-span-4 space-y-6">
              {/* Agenda Semanal */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <Calendar className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                    Agenda Semanal
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Sua programação da semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agendaSemanal.map((dia, index) => (
                      <div key={index} className="p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{dia.dia}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">{dia.aulas} aulas</Badge>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{dia.totalHoras}h</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dia.turmas.map((turma, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {turma}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Comunicados */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <Bell className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Comunicados
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Avisos importantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {comunicados.map((comunicado, index) => (
                      <div key={index} className="p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex-1">
                            {comunicado.titulo}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={comunicado.prioridade === "Alta" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {comunicado.prioridade}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {comunicado.descricao}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {comunicado.data}
                          </p>
                          <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors">
                            Ver mais
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              {/* Ações Rápidas */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <Target className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Ferramentas de uso frequente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Nova Avaliação
                    </LiquidGlassButton>
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Horário
                    </LiquidGlassButton>
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <Users className="h-4 w-4 mr-2" />
                      Lista de Presença
                    </LiquidGlassButton>
                    <LiquidGlassButton variant="outline" className={`justify-start ${
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
                    }`}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Relatório
                    </LiquidGlassButton>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
