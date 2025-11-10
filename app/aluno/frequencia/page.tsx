"use client"

import { useEffect, useMemo, useState } from "react"
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

export default function FrequenciaPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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
  
  useEffect(() => {
    const fetchInitialData = async () => {
       setIsLoading(true)
       try {
           const studentId = '29bc17a4-0b68-492b-adef-82718898d9eb';
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
 }, []);

  useEffect(() => {
    if (!semestreSelecionado) return;

    const loadFrequenciaData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        //MOCKADO POR ENQUANTO
        const studentId = '29bc17a4-0b68-492b-adef-82718898d9eb';
        const data = await getStudentFrequencia(studentId, semestreSelecionado);
        setAttendanceData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFrequenciaData();
  }, [semestreSelecionado]);

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
        <div className="p-8 space-y-6">
          <div className={`flex items-center justify-between p-6 rounded-xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-600/90 flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">Frequência por Disciplina</h1>
                <p className="text-muted-foreground">Acompanhe suas faltas por etapa do semestre</p>
              </div>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-b border-green-200 dark:border-green-800">
                    <tr className="text-center">
                      <th className="py-3 pr-4 font-semibold text-center">Disciplina</th>
                      <th className="py-3 px-2 font-semibold text-center">1ª Unidade</th>
                      <th className="py-3 px-2 font-semibold text-center">2ª Unidade</th>
                      <th className="py-3 px-2 font-semibold text-center">% Faltas</th>
                      <th className="py-3 pl-2 font-semibold text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinas.map((d) => {
                      const perc = calcularPercentualFaltas(d)
                      const percBadgeVariant = perc >= 25 ? 'destructive' : perc >= 15 ? 'outline' : 'secondary'
                      return (
                        <tr key={d.id} className="border-t text-center">
                          <td className="py-3 pr-4 text-center">
                            <div className="font-medium inline-flex items-center gap-2 justify-center">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              {d.name}
                            </div>
                            <div className="text-xs text-muted-foreground">{d.teacher}</div>
                          </td>
                          <td className="py-3 px-2 text-center">{d.absencesByUnit.unit1}</td>
                          <td className="py-3 px-2 text-center">{d.absencesByUnit.unit2}</td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant={percBadgeVariant as any}>{perc}%</Badge>
                          </td>
                          <td className="py-3 pl-2 text-center">
                            <Button size="sm" variant="outline" onClick={() => abrirModal(d)}>Ver Faltas</Button>
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


