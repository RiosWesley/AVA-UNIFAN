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

type EtapasResumo = {
  etapa1: number
  etapa2: number
  etapa3: number
  etapa4: number
}

type Disciplina = {
  id: string
  nome: string
  professor: string
  totalAulas: number
  faltasPorEtapa: EtapasResumo
}

type FaltaAula = {
  id: string
  data: string
  horario: string
  motivo?: string
  etapa: number
}

type DisciplinaDetalhe = Disciplina & { faltas: FaltaAula[] }

const SEMESTRES = ["2025.2", "2025.1", "2024.2", "2024.1"]

type SemestreOption = { id: string; nome: string; ativo?: boolean }

export default function FrequenciaPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [semestre, setSemestre] = useState<string>(SEMESTRES[0])
  // Estado compatível com o seletor customizado do header
  const [semestreSelecionado, setSemestreSelecionado] = useState<string>(SEMESTRES[0])
  const [modalOpen, setModalOpen] = useState(false)
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<DisciplinaDetalhe | null>(null)

  useEffect(() => {
    const checkTheme = () => setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const disciplinas: DisciplinaDetalhe[] = useMemo(() => {
    // Mock: dados por semestre (poderia vir de API)
    const base: DisciplinaDetalhe[] = [
      {
        id: "MAT001",
        nome: "Matemática",
        professor: "Prof. Carlos Silva",
        totalAulas: 64,
        faltasPorEtapa: { etapa1: 2, etapa2: 1, etapa3: 0, etapa4: 1 },
        faltas: [
          { id: "1", data: "05/08/2025", horario: "08:00 - 09:40", etapa: 1 },
          { id: "2", data: "20/08/2025", horario: "08:00 - 09:40", etapa: 1, motivo: "Consulta médica" },
          { id: "3", data: "12/10/2025", horario: "08:00 - 09:40", etapa: 4 },
        ]
      },
      {
        id: "POR002",
        nome: "Português",
        professor: "Prof. Ana Santos",
        totalAulas: 64,
        faltasPorEtapa: { etapa1: 0, etapa2: 2, etapa3: 1, etapa4: 0 },
        faltas: [
          { id: "1", data: "18/09/2025", horario: "10:00 - 11:40", etapa: 2 },
          { id: "2", data: "25/09/2025", horario: "10:00 - 11:40", etapa: 2 },
          { id: "3", data: "03/11/2025", horario: "10:00 - 11:40", etapa: 3, motivo: "Transporte" },
        ]
      },
      {
        id: "HIS003",
        nome: "História",
        professor: "Prof. João Costa",
        totalAulas: 64,
        faltasPorEtapa: { etapa1: 1, etapa2: 0, etapa3: 0, etapa4: 0 },
        faltas: [
          { id: "1", data: "10/08/2025", horario: "14:00 - 15:40", etapa: 1 },
        ]
      },
    ]
    // Em um caso real, poderíamos ajustar dados conforme semestre
    return base.map(d => ({ ...d }))
  }, [semestre, semestreSelecionado])

  // Lista de semestres rica para o seletor customizado
  const semestres: SemestreOption[] = useMemo(() => (
    SEMESTRES.map((s, idx) => ({ id: s, nome: s, ativo: idx === 0 }))
  ), [])

  const calcularPercentualFaltas = (d: Disciplina): number => {
    const faltas = d.faltasPorEtapa.etapa1 + d.faltasPorEtapa.etapa2 + d.faltasPorEtapa.etapa3 + d.faltasPorEtapa.etapa4
    return Math.round((faltas / d.totalAulas) * 100)
  }

  const abrirModal = (disc: DisciplinaDetalhe) => {
    setDisciplinaSelecionada(disc)
    setModalOpen(true)
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6">
          <div className={`flex items-center justify-between p-6 rounded-2xl border backdrop-blur-sm ${
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
                 <Select value={semestreSelecionado} onValueChange={(value: string) => { setSemestreSelecionado(value); setSemestre(value) }}>
                  <SelectTrigger className={`w-40 backdrop-blur-sm ${
                    isLiquidGlass
                      ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                      : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                  }`}>
                    <SelectValue placeholder="Selecionar semestre" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/50">
                     {semestres.map((semestre: SemestreOption) => (
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
                  {disciplinas.reduce((acc, d) => acc + d.faltasPorEtapa.etapa1 + d.faltasPorEtapa.etapa2 + d.faltasPorEtapa.etapa3 + d.faltasPorEtapa.etapa4, 0)}
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
              <CardDescription>Uma linha por disciplina e colunas por etapa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-b border-green-200 dark:border-green-800">
                    <tr className="text-center">
                      <th className="py-3 pr-4 font-semibold text-center">Disciplina</th>
                      <th className="py-3 px-2 font-semibold text-center">Etapa 1</th>
                      <th className="py-3 px-2 font-semibold text-center">Etapa 2</th>
                      <th className="py-3 px-2 font-semibold text-center">Etapa 3</th>
                      <th className="py-3 px-2 font-semibold text-center">Etapa 4</th>
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
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {d.nome}
                            </div>
                            <div className="text-xs text-muted-foreground">{d.professor}</div>
                          </td>
                          <td className="py-3 px-2 text-center">{d.faltasPorEtapa.etapa1}</td>
                          <td className="py-3 px-2 text-center">{d.faltasPorEtapa.etapa2}</td>
                          <td className="py-3 px-2 text-center">{d.faltasPorEtapa.etapa3}</td>
                          <td className="py-3 px-2 text-center">{d.faltasPorEtapa.etapa4}</td>
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


