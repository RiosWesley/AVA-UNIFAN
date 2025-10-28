"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { BookOpen, Clock, User, TrendingUp, Award, Star, Calendar, FileText, Play, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function AlunodisciplinasPage() {
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

  const disciplinas = [
    {
      id: 1,
      nome: "Matemática",
      codigo: "MAT001",
      professor: "Prof. Carlos Silva",
      progresso: 75,
      proximaAula: "Segunda, 08:00",
      status: "Em andamento",
      cor: "green",
      dificuldade: "Média",
      aulasAssistidas: 18,
      totalAulas: 24,
      media: 8.6,
      atividadesPendentes: 2,
      destaque: "Melhor desempenho"
    },
    {
      id: 2,
      nome: "Português",
      codigo: "POR001",
      professor: "Prof. Ana Santos",
      progresso: 82,
      proximaAula: "Terça, 10:00",
      status: "Em andamento",
      cor: "green",
      dificuldade: "Fácil",
      aulasAssistidas: 20,
      totalAulas: 24,
      media: 9.2,
      atividadesPendentes: 0,
      destaque: "Excelente participação"
    },
    {
      id: 3,
      nome: "História",
      codigo: "HIS001",
      professor: "Prof. João Costa",
      progresso: 68,
      proximaAula: "Quarta, 14:00",
      status: "Em andamento",
      cor: "purple",
      dificuldade: "Difícil",
      aulasAssistidas: 16,
      totalAulas: 24,
      media: 7.8,
      atividadesPendentes: 1,
      destaque: "Melhoria necessária"
    },
    {
      id: 4,
      nome: "Física",
      codigo: "FIS001",
      professor: "Prof. Maria Oliveira",
      progresso: 90,
      proximaAula: "Quinta, 08:00",
      status: "Em andamento",
      cor: "orange",
      dificuldade: "Difícil",
      aulasAssistidas: 22,
      totalAulas: 24,
      media: 8.2,
      atividadesPendentes: 3,
      destaque: "Quase concluída"
    },
    {
      id: 5,
      nome: "Química",
      codigo: "QUI001",
      professor: "Prof. Pedro Lima",
      progresso: 100,
      proximaAula: "Concluída",
      status: "Concluída",
      cor: "emerald",
      dificuldade: "Média",
      aulasAssistidas: 24,
      totalAulas: 24,
      media: 8.9,
      atividadesPendentes: 0,
      destaque: "Concluída com sucesso"
    },
    {
      id: 6,
      nome: "Biologia",
      codigo: "BIO001",
      professor: "Prof. Carla Mendes",
      progresso: 45,
      proximaAula: "Sexta, 14:00",
      status: "Em andamento",
      cor: "teal",
      dificuldade: "Fácil",
      aulasAssistidas: 11,
      totalAulas: 24,
      media: 8.4,
      atividadesPendentes: 1,
      destaque: "Em progresso"
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída": return "bg-emerald-500"
      case "Em andamento": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case "Fácil": return "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
      case "Média": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"
      case "Difícil": return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300"
    }
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />

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
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
                  Minhas Disciplinas
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Acompanhe o progresso das suas disciplinas
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    <Star className="h-3 w-3 mr-1" />
                    {disciplinas.filter((d) => d.status === "Em andamento").length} disciplinas ativas
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                    <Award className="h-3 w-3 mr-1" />
                    {disciplinas.filter((d) => d.progresso === 100).length} concluídas
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
                Relatório
              </LiquidGlassButton>
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
              }`}>
                <Calendar className="h-5 w-5 mr-2" />
                Horário
              </LiquidGlassButton>
            </div>
          </div>

          {/* Cards de disciplinas aprimorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disciplinas.map((disciplina, index) => (
              <LiquidGlassCard
                key={disciplina.id}
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group transition-all duration-300 hover:shadow-2xl border border-border/50 hover:border-border/80 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        disciplina.cor === "green" ? "bg-green-600" :
                        disciplina.cor === "green" ? "bg-green-600" :
                        disciplina.cor === "purple" ? "bg-purple-600" :
                        disciplina.cor === "orange" ? "bg-orange-600" :
                        disciplina.cor === "emerald" ? "bg-emerald-600" :
                        "bg-teal-600"
                      }`}>
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{disciplina.nome}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">{disciplina.codigo}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        variant={disciplina.status === "Concluída" ? "default" : "secondary"}
                        className={`${
                          disciplina.status === "Concluída"
                            ? "bg-emerald-500 text-white"
                            : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                        }`}
                      >
                        {disciplina.status}
                      </Badge>
                      {disciplina.atividadesPendentes > 0 && (
                        <div className="flex items-center bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {disciplina.atividadesPendentes}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4 mr-2" />
                    {disciplina.professor}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-700 dark:text-gray-300">Progresso</span>
                      <span className="text-gray-900 dark:text-gray-100">{disciplina.progresso}%</span>
                    </div>
                    <Progress value={disciplina.progresso} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{disciplina.aulasAssistidas}/{disciplina.totalAulas} aulas</span>
                      <span>Média: {disciplina.media}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      {disciplina.proximaAula}
                    </div>
                    <Badge variant="outline" className={getDificuldadeColor(disciplina.dificuldade)}>
                      {disciplina.dificuldade}
                    </Badge>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Award className="h-3 w-3 mr-1" />
                      {disciplina.destaque}
                    </div>
                    <Link href={`/aluno/disciplinas/${disciplina.id}`}>
                      <LiquidGlassButton className="w-full group-hover:bg-opacity-90 transition-all duration-300">
                        <Play className="h-4 w-4 mr-2" />
                        Acessar Disciplina
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </LiquidGlassButton>
                    </Link>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
