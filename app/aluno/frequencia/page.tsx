"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ModalFaltasAluno } from "@/components/modals"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Users, AlertTriangle, BookOpen, Percent, BarChart3, GraduationCap } from 'lucide-react'
import { AttendanceData, DisciplineAttendance } from "@/src/types/Frequencia"
import { getStudentFrequencia } from "@/src/services/FrequenciaService"
import { PageSpinner } from "@/components/ui/page-spinner"
import { me } from '@/src/services/auth'

export default function FrequenciaPage() {
  const router = useRouter()
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [studentId, setStudentId] = useState<string | null>(null)
  
  const [semestreSelecionado, setSemestreSelecionado] = useState<string>("2025-2")
  const [modalOpen, setModalOpen] = useState(false)
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<DisciplineAttendance | null>(null)

  useEffect(() => {
    const checkTheme = () => setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
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
    const fetchInitialData = async () => {
       if (!studentId) return
       setIsLoading(true)
       try {
           const data = await getStudentFrequencia(studentId, semestreSelecionado); 
           if (data.availableSemesters.length > 0) {
             setSemestreSelecionado(data.availableSemesters[0]);
           }
       } catch (err: any) {
           setError(err.message);
           setIsLoading(false);
       }
   };
   fetchInitialData();
 }, [studentId]);

  useEffect(() => {
    if (!semestreSelecionado || !studentId) return;

    const loadFrequenciaData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStudentFrequencia(studentId, semestreSelecionado);
        setAttendanceData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFrequenciaData();
  }, [semestreSelecionado, studentId]);

    const calcularPercentualFaltas = (d: DisciplineAttendance): number => {
      const faltas = d.absencesByUnit.unit1 + d.absencesByUnit.unit2;
      return d.totalWorkload > 0 ? Math.round((faltas / d.totalWorkload) * 100) : 0;
    }

    const abrirModal = (disc: DisciplineAttendance) => {
      setDisciplinaSelecionada(disc)
      setModalOpen(true)
    }

    if (error) return <div className="flex h-screen items-center justify-center text-red-500"><p>Erro: {error}</p></div>;

    const disciplinas = attendanceData?.disciplines || [];
    const semestres = attendanceData?.availableSemesters.map(s => ({ id: s, nome: s.replace('-', '.'), ativo: s === semestreSelecionado })) || [];

    if (isLoading) {
        return (
          <div className="flex h-screen bg-background">
            <Sidebar userRole="aluno" />
            <main className="flex-1 overflow-y-auto">
              <PageSpinner />
            </main>
          </div>
        );
      }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:p-6 rounded-xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-green-600/90 flex items-center justify-center shadow-lg flex-shrink-0">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">Frequência por Disciplina</h1>
                <p className="text-muted-foreground text-sm md:text-base">Acompanhe suas faltas por etapa do semestre</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto">
                <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                 <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                  <SelectTrigger className={`w-full md:w-40 backdrop-blur-sm ${
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`${isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">Disciplinas</CardTitle>
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{disciplinas.length}</div>
                <p className="text-xs text-muted-foreground">Registradas neste semestre</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`${isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">Faltas Totais</CardTitle>
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {disciplinas.reduce((acc, d) => acc + d.absencesByUnit.unit1 + d.absencesByUnit.unit2, 0)}
                </div>
                <p className="text-xs text-muted-foreground">No semestre selecionado</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`${isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">Percentual Médio</CardTitle>
                <Percent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(
                    disciplinas.reduce((acc, d) => acc + calcularPercentualFaltas(d), 0) / (disciplinas.length || 1)
                  )}%
                </div>
                <p className="text-xs text-muted-foreground">Entre as disciplinas</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <LiquidGlassCard
            intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
            className={`${
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20'
                : 'bg-gray-50/60 dark:bg-gray-800/40'
            }`}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                Resumo de Faltas
              </CardTitle>
              <CardDescription>Uma linha por disciplina e colunas por unidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="min-w-full text-xs md:text-sm">
                  <thead className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-b border-green-200 dark:border-green-800">
                    <tr className="text-center">
                      <th className="py-2 md:py-3 pr-2 md:pr-4 font-semibold text-center text-xs md:text-sm">Disciplina</th>
                      <th className="py-2 md:py-3 px-1 md:px-2 font-semibold text-center text-xs md:text-sm">1ª Unidade</th>
                      <th className="py-2 md:py-3 px-1 md:px-2 font-semibold text-center text-xs md:text-sm">2ª Unidade</th>
                      <th className="py-2 md:py-3 px-1 md:px-2 font-semibold text-center text-xs md:text-sm">% Faltas</th>
                      <th className="py-2 md:py-3 pl-1 md:pl-2 font-semibold text-center text-xs md:text-sm">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinas.map((d) => {
                      const perc = calcularPercentualFaltas(d)
                      const percBadgeVariant = perc >= 25 ? 'destructive' : perc >= 15 ? 'outline' : 'secondary'
                      return (
                        <tr key={d.id} className="border-t text-center">
                          <td className="py-2 md:py-3 pr-2 md:pr-4 text-center">
                            <div className="font-medium inline-flex items-center gap-1 md:gap-2 justify-center">
                              <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate max-w-[120px] md:max-w-none">{d.name}</span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{d.teacher}</div>
                          </td>
                          <td className="py-2 md:py-3 px-1 md:px-2 text-center">{d.absencesByUnit.unit1}</td>
                          <td className="py-2 md:py-3 px-1 md:px-2 text-center">{d.absencesByUnit.unit2}</td>
                          <td className="py-2 md:py-3 px-1 md:px-2 text-center">
                            <Badge variant={percBadgeVariant as any} className="text-xs">{perc}%</Badge>
                          </td>
                          <td className="py-2 md:py-3 pl-1 md:pl-2 text-center">
                            <Button size="sm" variant="outline" onClick={() => abrirModal(d)} className="text-xs">Ver Faltas</Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </div>
      </main>

      <ModalFaltasAluno
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        disciplina={disciplinaSelecionada}
      />
    </div>
  )

}


