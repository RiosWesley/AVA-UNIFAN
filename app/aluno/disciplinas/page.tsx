"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, User, ChevronRight, Sparkles, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Semestre } from "@/src/types/Classe"
import { getDisciplinasPorAluno, transformarDadosParaComponente } from "@/src/services/ClassesService"
import { me } from '@/src/services/auth'

export default function AlunodisciplinasPage() {
  const router = useRouter()
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [semestreSelecionado, setSemestreSelecionado] = useState("2025.1")
  const [semestres, setSemestres] = useState<Semestre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<string | null>(null)
  
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

  // Obter ID do usuário autenticado
  useEffect(() => {
    const init = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
      if (!token) {
        router.push("/")
        return
      }
      const storedUserId = localStorage.getItem("ava:userId")
      if (storedUserId) {
        setStudentId(storedUserId)
        return
      }
      try {
        const current = await me()
        if (current?.id) {
          localStorage.setItem("ava:userId", current.id)
          setStudentId(current.id)
        }
      } catch {
        router.push("/")
      }
    }
    init()
  }, [router])

  useEffect(() => {
    const buscarDados = async () => {
      if (!studentId) return
      try {
        const dadosDaApi = await getDisciplinasPorAluno(studentId);
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
  }, [studentId]);

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

          <div className="space-y-3">
            {disciplinasAtuais.map((disciplina, index) => (
              <Link 
                key={disciplina.id} 
                href={`/aluno/disciplinas/${disciplina.id}`}
                className="block group"
              >
                <div
                  className={`transition-all duration-300 rounded-xl border border-border/50 px-6 py-5 hover:shadow-lg ${
                    isLiquidGlass
                      ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/40 dark:hover:bg-gray-800/30'
                      : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-gray-50/80 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-6">
                    {/* Ícone */}
                    <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-700 transition-colors flex-shrink-0">
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>

                    {/* Informações da Disciplina */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mb-1">
                        {disciplina.nome}
                      </h3>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {disciplina.codigo}
                      </p>
                    </div>

                    {/* Professor */}
                    <div className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300 min-w-0 flex-shrink-0">
                      <User className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="font-medium truncate max-w-[200px]">{disciplina.professor}</span>
                    </div>

                    {/* Indicador de ação */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
