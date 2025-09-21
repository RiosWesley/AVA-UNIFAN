"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton, LiquidGlassInnerCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { GraduationCap, TrendingUp, Download, Calendar, Award, Star, Target, Activity, ChevronRight, Sparkles, Trophy, Medal } from "lucide-react"

export default function AlunoBoletimPage() {
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

  const boletim = [
    {
      disciplina: "Matemática",
      codigo: "MAT001",
      media: 8.6,
      frequencia: 92,
      situacao: "Aprovado",
      notas: [8.5, 9.2, 7.8, 8.9],
      conceito: "Ótimo",
      tendencia: "Estável",
      destaque: "Melhor média",
      cor: "blue"
    },
    {
      disciplina: "Português",
      codigo: "POR001",
      media: 9.1,
      frequencia: 95,
      situacao: "Aprovado",
      notas: [9.0, 9.5, 8.8, 9.1],
      conceito: "Excelente",
      tendencia: "Melhorando",
      destaque: "Excelência",
      cor: "green"
    },
    {
      disciplina: "História",
      codigo: "HIS001",
      media: 7.8,
      frequencia: 88,
      situacao: "Aprovado",
      notas: [7.5, 8.2, 7.6, 7.9],
      conceito: "Bom",
      tendencia: "Melhorando",
      destaque: "Progresso",
      cor: "purple"
    },
    {
      disciplina: "Física",
      codigo: "FIS001",
      media: 8.2,
      frequencia: 90,
      situacao: "Aprovado",
      notas: [8.0, 8.8, 7.9, 8.1],
      conceito: "Bom",
      tendencia: "Estável",
      destaque: "Regular",
      cor: "orange"
    },
    {
      disciplina: "Química",
      codigo: "QUI001",
      media: 7.5,
      frequencia: 85,
      situacao: "Recuperação",
      notas: [7.0, 8.2, 7.1, 7.8],
      conceito: "Regular",
      tendencia: "Melhorando",
      destaque: "Atenção necessária",
      cor: "red"
    },
    {
      disciplina: "Biologia",
      codigo: "BIO001",
      media: 8.9,
      frequencia: 93,
      situacao: "Aprovado",
      notas: [8.8, 9.2, 8.7, 8.9],
      conceito: "Ótimo",
      tendencia: "Melhorando",
      destaque: "Excelente",
      cor: "emerald"
    },
  ]

  const mediaGeral = boletim.reduce((acc, curr) => acc + curr.media, 0) / boletim.length
  const frequenciaGeral = boletim.reduce((acc, curr) => acc + curr.frequencia, 0) / boletim.length

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case "Aprovado": return "text-green-600 dark:text-green-400"
      case "Recuperação": return "text-orange-600 dark:text-orange-400"
      default: return "text-gray-600 dark:text-gray-400"
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case "Melhorando": return <TrendingUp className="h-4 w-4 text-green-500" />
      case "Estável": return <Activity className="h-4 w-4 text-blue-500" />
      default: return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gradient-to-br from-emerald-50/30 via-green-50/20 to-blue-50/30 dark:from-emerald-950/20 dark:via-green-950/10 dark:to-blue-950/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header aprimorado */}
          <div className="flex items-center justify-between mb-8 p-6 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-blue-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Award className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Boletim Digital
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Suas notas e desempenho acadêmico
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    <Trophy className="h-3 w-3 mr-1" />
                    Média: {mediaGeral.toFixed(1)}
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                    <Medal className="h-3 w-3 mr-1" />
                    {boletim.filter((d) => d.situacao === "Aprovado").length}/{boletim.length} aprovadas
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm ${
                isLiquidGlass
                  ? 'bg-white/10 dark:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-gray-800/20'
                  : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70'
              }`}>
                <Download className="h-5 w-5 mr-2 text-emerald-600" />
                <span className="font-semibold">Exportar PDF</span>
              </LiquidGlassButton>
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm ${
                isLiquidGlass
                  ? 'bg-white/10 dark:bg-gray-800/10 hover:bg-white/20 dark:hover:bg-gray-800/20'
                  : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70'
              }`}>
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                <span className="font-semibold">Histórico</span>
              </LiquidGlassButton>
            </div>
          </div>

          {/* Cards de estatísticas aprimorados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 dark:from-emerald-950/30 dark:to-emerald-900/20'
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Média Geral</CardTitle>
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{mediaGeral.toFixed(1)}</div>
                <div className="flex items-center text-xs text-emerald-600/70 dark:text-emerald-400/70">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3 desde o último bimestre
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-blue-500/5 to-blue-600/10 dark:from-blue-950/30 dark:to-blue-900/20'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Frequência Geral</CardTitle>
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{frequenciaGeral.toFixed(0)}%</div>
                <Progress value={frequenciaGeral} className="h-2 mb-2" />
                <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Excelente participação!</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`group hover:scale-105 transition-all duration-300 hover:shadow-2xl border-0 ${
                isLiquidGlass
                  ? 'bg-gradient-to-br from-green-500/5 to-green-600/10 dark:from-green-950/30 dark:to-green-900/20'
                  : 'bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Situação Geral</CardTitle>
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">Aprovado</div>
                <div className="flex items-center text-xs text-green-600/70 dark:text-green-400/70">
                  <Medal className="h-3 w-3 mr-1" />
                  1 disciplina em recuperação
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>

          {/* Visualização detalhada por disciplina */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Desempenho por Disciplina</h2>
            {boletim.map((disciplina, index) => (
              <LiquidGlassCard
                key={index}
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group hover:scale-[1.02] transition-all duration-300 hover:shadow-xl border-0 ${
                  isLiquidGlass
                    ? `bg-gradient-to-br ${
                        disciplina.cor === "blue" ? "from-blue-500/5 to-blue-600/10 dark:from-blue-950/30 dark:to-blue-900/20" :
                        disciplina.cor === "green" ? "from-green-500/5 to-green-600/10 dark:from-green-950/30 dark:to-green-900/20" :
                        disciplina.cor === "purple" ? "from-purple-500/5 to-purple-600/10 dark:from-purple-950/30 dark:to-purple-900/20" :
                        disciplina.cor === "orange" ? "from-orange-500/5 to-orange-600/10 dark:from-orange-950/30 dark:to-orange-900/20" :
                        disciplina.cor === "red" ? "from-red-500/5 to-red-600/10 dark:from-red-950/30 dark:to-red-900/20" :
                        "from-emerald-500/5 to-emerald-600/10 dark:from-emerald-950/30 dark:to-emerald-900/20"
                      }`
                    : `bg-gradient-to-br ${
                        disciplina.cor === "blue" ? "from-blue-50/50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20" :
                        disciplina.cor === "green" ? "from-green-50/50 to-green-100/30 dark:from-green-950/30 dark:to-green-900/20" :
                        disciplina.cor === "purple" ? "from-purple-50/50 to-purple-100/30 dark:from-purple-950/30 dark:to-purple-900/20" :
                        disciplina.cor === "orange" ? "from-orange-50/50 to-orange-100/30 dark:from-orange-950/30 dark:to-orange-900/20" :
                        disciplina.cor === "red" ? "from-red-50/50 to-red-100/30 dark:from-red-950/30 dark:to-red-900/20" :
                        "from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20"
                      }`
                }`}
              >
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r ${
                        disciplina.cor === "blue" ? "from-blue-500 to-blue-600" :
                        disciplina.cor === "green" ? "from-green-500 to-green-600" :
                        disciplina.cor === "purple" ? "from-purple-500 to-purple-600" :
                        disciplina.cor === "orange" ? "from-orange-500 to-orange-600" :
                        disciplina.cor === "red" ? "from-red-500 to-red-600" :
                        "from-emerald-500 to-emerald-600"
                      } shadow-lg`}>
                        <GraduationCap className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">{disciplina.disciplina}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-base">{disciplina.codigo}</CardDescription>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="outline" className="bg-white/60 dark:bg-gray-800/60">
                            <Star className="h-3 w-3 mr-1" />
                            {disciplina.conceito}
                          </Badge>
                          <Badge
                            variant={disciplina.situacao === "Aprovado" ? "default" : "destructive"}
                            className={disciplina.situacao === "Aprovado" ? "bg-green-500 text-white" : "bg-orange-500 text-white"}
                          >
                            {disciplina.situacao}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {disciplina.media}
                      </div>
                      <div className="flex items-center justify-end space-x-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600 dark:text-gray-400">Frequência</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{disciplina.frequencia}%</p>
                        </div>
                        <div className="flex items-center">
                          {getTendenciaIcon(disciplina.tendencia)}
                          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                            {disciplina.tendencia}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notas por bimestre */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                      Notas por Bimestre
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {disciplina.notas.map((nota, noteIndex) => (
                        <div
                          key={noteIndex}
                          className={`rounded-xl p-3 text-center border transition-all duration-300 ${
                            isLiquidGlass
                              ? 'bg-transparent hover:bg-white/10 dark:hover:bg-gray-800/10 border-gray-200/30 dark:border-gray-700/30'
                              : 'bg-white/60 dark:bg-gray-800/60 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80'
                          }`}
                        >
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {noteIndex + 1}º Bimestre
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{nota}</p>
                          <div className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                            nota >= 8 ? "bg-green-500" :
                            nota >= 6 ? "bg-yellow-500" : "bg-red-500"
                          }`}></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Barra de progresso da frequência */}
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-gray-700 dark:text-gray-300">Frequência</span>
                      <span className="text-gray-900 dark:text-gray-100">{disciplina.frequencia}%</span>
                    </div>
                    <Progress value={disciplina.frequencia} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Progresso de presença</span>
                      <span>{disciplina.frequencia >= 75 ? "Aprovado" : "Atenção"}</span>
                    </div>
                  </div>

                  {/* Destaque e informações adicionais */}
                  <div className={`rounded-xl p-4 border ${
                    isLiquidGlass
                      ? 'bg-yellow-500/5 dark:bg-yellow-950/20 border-yellow-200/30 dark:border-yellow-800/30'
                      : 'bg-yellow-50/60 dark:bg-yellow-950/30 border-yellow-200/50 dark:border-yellow-800/50'
                  }`}>
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <span className="font-semibold text-yellow-800 dark:text-yellow-200">Destaque:</span>
                      <span className="text-yellow-700 dark:text-yellow-300 ml-2">{disciplina.destaque}</span>
                    </div>
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
