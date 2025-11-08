"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, User, Play, ChevronRight, Sparkles, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Semestre } from "@/src/types/Classe"
import { getDisciplinasPorAluno, transformarDadosParaComponente } from "@/src/services/ClassesService"

export default function AlunodisciplinasPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [semestreSelecionado, setSemestreSelecionado] = useState("2025.1")
  const [semestres, setSemestres] = useState<Semestre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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

  useEffect(() => {
    const buscarDados = async () => {
      try {
        // MOCKADO POR ENQUANTO, TEM QUE PASSAR O ID DO ALUNO LOGADO DEPOIS
        const alunoId = "29bc17a4-0b68-492b-adef-82718898d9eb";
        
        const dadosDaApi = await getDisciplinasPorAluno(alunoId);
        const dadosTransformados = transformarDadosParaComponente(dadosDaApi);
        
        setSemestres(dadosTransformados);
        
        const semestreAtivo = dadosTransformados.find(s => s.ativo);
        if (semestreAtivo) {
          setSemestreSelecionado(semestreAtivo.id);
        } else if (dadosTransformados.length > 0) {
          setSemestreSelecionado(dadosTransformados[0].id);
        }

      } catch (err) {
        setError("Falha ao carregar as disciplinas. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, []);

  const disciplinasAtuais = semestres.find(s => s.id === semestreSelecionado)?.disciplinas || []

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header aprimorado */}
          <div className={`flex flex-col lg:flex-row lg:items-center justify-between mb-8 p-6 rounded-xl border backdrop-blur-sm gap-4 ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center hover:shadow-md">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
                    Minhas Disciplinas
                  </h1>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800 text-sm px-3 py-1">
                    {semestres.find(s => s.id === semestreSelecionado)?.nome}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg mt-1">
                  Acompanhe o progresso das suas disciplinas
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                  <SelectTrigger className={`w-40 backdrop-blur-sm ${
                    isLiquidGlass
                      ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                      : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                  }`}>
                    <SelectValue placeholder="Selecionar semestre" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/50">
                    {semestres.map((semestre) => (
                      <SelectItem key={semestre.id} value={semestre.id}>
                        <div className="flex items-center space-x-2">
                          <span>{semestre.nome}</span>
                          {semestre.ativo && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs">
                              Atual
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disciplinasAtuais.map((disciplina, index) => (
              <LiquidGlassCard
                key={disciplina.id}
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group transition-all rounded-xl duration-300 border border-border/50  ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{disciplina.nome}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">{disciplina.codigo}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4 mr-2" />
                    {disciplina.professor}
                  </div>

                  <div className="space-y-2">
                  </div>
                  <div className="pt-2">
                    <Link href={`/aluno/disciplinas/${disciplina.id}`}>
                      <LiquidGlassButton className="w-full cursor-pointer group-hover:bg-opacity-90 transition-all duration-300">
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
