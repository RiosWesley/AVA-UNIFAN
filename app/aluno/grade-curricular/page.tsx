"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModalGradeSemestre } from "@/components/modals"
import { BookOpen, Calendar, GraduationCap, Layers, ListChecks, Sparkles, Table as TableIcon, Filter } from "lucide-react"

type Disciplina = {
  semestre: string
  periodoLetivo: string
  codigo: string
  nome: string
  situacao: "Aprovado" | "Reprovado" | "Cursando" | "Pendente"
  nota?: number
  faltas?: number
  creditos: number
  cargaHoraria: number
  tipo: "obrigatoria" | "optativa"
}

type Semestre = {
  id: string
  nome: string
  disciplinas: Disciplina[]
}

export default function AlunoGradeCurricularPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [semestreSelecionado, setSemestreSelecionado] = useState<Semestre | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filtroTodas, setFiltroTodas] = useState("todas")
  const [filtroObrigatorias, setFiltroObrigatorias] = useState("todas")
  const [filtroOptativas, setFiltroOptativas] = useState("todas")

  useEffect(() => {
    const checkTheme = () => {
      setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const semestres: Semestre[] = useMemo(() => {
    const base: Disciplina[] = [
      { semestre: "1°", periodoLetivo: "2024.1", codigo: "MAT101", nome: "Cálculo I", situacao: "Cursando", nota: 8.2, faltas: 2, creditos: 4, cargaHoraria: 80, tipo: "obrigatoria" },
      { semestre: "1°", periodoLetivo: "2024.1", codigo: "PROG100", nome: "Introdução à Programação", situacao: "Cursando", nota: 8.9, faltas: 1, creditos: 4, cargaHoraria: 80, tipo: "obrigatoria" },
      { semestre: "1°", periodoLetivo: "2024.1", codigo: "ING001", nome: "Inglês Instrumental", situacao: "Cursando", nota: 9.1, faltas: 0, creditos: 2, cargaHoraria: 40, tipo: "optativa" },

      { semestre: "2°", periodoLetivo: "2024.2", codigo: "MAT102", nome: "Cálculo II", situacao: "Pendente", creditos: 4, cargaHoraria: 80, tipo: "obrigatoria" },
      { semestre: "2°", periodoLetivo: "2024.2", codigo: "ALG200", nome: "Estruturas de Dados", situacao: "Pendente", creditos: 4, cargaHoraria: 80, tipo: "obrigatoria" },
      { semestre: "2°", periodoLetivo: "2024.2", codigo: "HUM110", nome: "Ética e Cidadania", situacao: "Pendente", creditos: 2, cargaHoraria: 40, tipo: "optativa" },

      { semestre: "3°", periodoLetivo: "2023.2", codigo: "EST300", nome: "Probabilidade e Estatística", situacao: "Aprovado", nota: 8.0, faltas: 3, creditos: 4, cargaHoraria: 80, tipo: "obrigatoria" },
      { semestre: "3°", periodoLetivo: "2023.2", codigo: "BD300", nome: "Banco de Dados", situacao: "Aprovado", nota: 8.5, faltas: 1, creditos: 4, cargaHoraria: 80, tipo: "obrigatoria" },
      { semestre: "3°", periodoLetivo: "2023.2", codigo: "ART050", nome: "História da Arte", situacao: "Aprovado", nota: 9.0, faltas: 0, creditos: 2, cargaHoraria: 40, tipo: "optativa" },
    ]

    const bySem: Record<string, Disciplina[]> = {}
    for (const d of base) {
      bySem[d.semestre] = bySem[d.semestre] || []
      bySem[d.semestre].push(d)
    }
    return Object.entries(bySem).map(([sem, disciplinas]) => ({ id: sem, nome: sem, disciplinas }))
  }, [])

  const todasDisciplinas = useMemo(() => semestres.flatMap(s => s.disciplinas), [semestres])
  const obrigatorias = useMemo(() => todasDisciplinas.filter(d => d.tipo === "obrigatoria"), [todasDisciplinas])
  const optativas = useMemo(() => todasDisciplinas.filter(d => d.tipo === "optativa"), [todasDisciplinas])

  const filtrarDisciplinas = (disciplinas: Disciplina[], filtro: string) => {
    switch (filtro) {
      case "concluidas":
        return disciplinas.filter(d => d.situacao === "Aprovado")
      case "em-curso":
        return disciplinas.filter(d => d.situacao === "Cursando")
      case "pendentes":
        return disciplinas.filter(d => d.situacao === "Pendente")
      default:
        return disciplinas
    }
  }

  const disciplinasFiltradasTodas = useMemo(() => filtrarDisciplinas(todasDisciplinas, filtroTodas), [todasDisciplinas, filtroTodas])
  const disciplinasFiltradasObrigatorias = useMemo(() => filtrarDisciplinas(obrigatorias, filtroObrigatorias), [obrigatorias, filtroObrigatorias])
  const disciplinasFiltradasOptativas = useMemo(() => filtrarDisciplinas(optativas, filtroOptativas), [optativas, filtroOptativas])

  const chCurso = useMemo(() => todasDisciplinas.reduce((acc, d) => acc + d.cargaHoraria, 0), [todasDisciplinas])
  const chCumprida = useMemo(() => todasDisciplinas
    .filter(d => d.situacao === "Aprovado")
    .reduce((acc, d) => acc + d.cargaHoraria, 0), [todasDisciplinas])
  const totalObrigatorias = obrigatorias.length
  const totalObrigatoriasConcluidas = obrigatorias.filter(d => d.situacao === "Aprovado").length
  const totalOptativas = optativas.length
  const totalOptativasConcluidas = optativas.filter(d => d.situacao === "Aprovado").length

  const openModalSemestre = (sem: Semestre) => {
    setSemestreSelecionado(sem)
    setIsModalOpen(true)
  }

  const Table = ({ data, showSemestre = false }: { data: Disciplina[], showSemestre?: boolean }) => {
    const totalCH = data.reduce((acc, d) => acc + d.cargaHoraria, 0)
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-b border-green-200 dark:border-green-800">
            <tr className="text-center">
              {showSemestre && <th className="py-3 pr-4 font-semibold text-center">Semestre</th>}
              <th className="py-3 px-2 font-semibold text-center">Período Letivo</th>
              <th className="py-3 px-2 font-semibold text-center">Código</th>
              <th className="py-3 px-2 font-semibold text-center">Disciplina</th>
              <th className="py-3 px-2 font-semibold text-center">Situação</th>
              <th className="py-3 px-2 font-semibold text-center">Nota</th>
              <th className="py-3 px-2 font-semibold text-center">Faltas</th>
              <th className="py-3 px-2 font-semibold text-center">Créditos</th>
              <th className="py-3 pl-2 font-semibold text-center">CH</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={`${d.codigo}-${i}`} className="border-t text-center">
                {showSemestre && (
                  <td className="py-3 pr-4 text-center">
                    <div className="font-medium">{d.semestre}</div>
                  </td>
                )}
                <td className="py-3 px-2 text-center">
                  <div className="font-medium">{d.periodoLetivo}</div>
                </td>
                <td className="py-3 px-2 text-center font-mono">{d.codigo}</td>
                <td className="py-3 px-2 text-center">
                  <div className="font-medium">{d.nome}</div>
                </td>
                <td className="py-3 px-2 text-center">
                  <Badge variant={d.situacao === "Aprovado" ? "default" : "secondary"}>
                    {d.situacao}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-center">{d.nota ?? "-"}</td>
                <td className="py-3 px-2 text-center">{d.faltas ?? "-"}</td>
                <td className="py-3 px-2 text-center">{d.creditos}</td>
                <td className="py-3 pl-2 text-center">{d.cargaHoraria}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-green-50 dark:bg-green-900/20 border-t-2 border-green-200 dark:border-green-800">
              <td className="py-3 pr-4 font-semibold text-center text-green-700 dark:text-green-300" colSpan={showSemestre ? 8 : 7}>Carga Horária Total</td>
              <td className="py-3 pl-2 font-bold text-center text-green-800 dark:text-green-200">{totalCH}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className={`flex items-center justify-between mb-8 p-6 rounded-xl border backdrop-blur-sm ${
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
                <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">Grade Curricular</h1>
                <p className="text-muted-foreground text-lg mt-1">Componentes curriculares por semestre</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="resumo" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="obrigatorias">Disciplinas Obrigatórias</TabsTrigger>
              <TabsTrigger value="optativas">Disciplinas Optativas</TabsTrigger>
            </TabsList>

            <TabsContent value="resumo">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm">CH do Curso</CardTitle>
                    <Calendar className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{chCurso}h</div>
                    <CardDescription>Total planejado</CardDescription>
                  </CardContent>
                </LiquidGlassCard>

                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm">CH Cumprida</CardTitle>
                    <GraduationCap className="h-5 w-5 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{chCumprida}h</div>
                    <Progress value={Math.min(100, Math.round((chCumprida / Math.max(1, chCurso)) * 100))} className="h-2 mt-2" />
                  </CardContent>
                </LiquidGlassCard>

                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm">Obrigatórias</CardTitle>
                    <ListChecks className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalObrigatoriasConcluidas}/{totalObrigatorias}</div>
                    <CardDescription>Concluídas / Total</CardDescription>
                  </CardContent>
                </LiquidGlassCard>

                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-sm">Optativas</CardTitle>
                    <Layers className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalOptativasConcluidas}/{totalOptativas}</div>
                    <CardDescription>Concluídas / Total</CardDescription>
                  </CardContent>
                </LiquidGlassCard>
              </div>
            </TabsContent>

            <TabsContent value="todas">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Todas as Disciplinas</h3>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={filtroTodas} onValueChange={setFiltroTodas}>
                      <SelectTrigger className={`w-40 backdrop-blur-sm ${
                        isLiquidGlass
                          ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                          : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                      }`}>
                        <SelectValue placeholder="Filtrar" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/50">
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="concluidas">Concluídas</SelectItem>
                        <SelectItem value="em-curso">Em Curso</SelectItem>
                        <SelectItem value="pendentes">Pendentes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {semestres.map((sem) => {
                    const disciplinasFiltradas = filtrarDisciplinas(sem.disciplinas, filtroTodas)
                    if (disciplinasFiltradas.length === 0) return null
                    
                    const totalCH = disciplinasFiltradas.reduce((acc, d) => acc + d.cargaHoraria, 0)
                    const concluidas = disciplinasFiltradas.filter(d => d.situacao === "Aprovado").length
                    return (
                      <LiquidGlassCard key={sem.id} intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                        <CardHeader>
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span>{sem.nome} Semestre</span>
                          <Badge variant="secondary">{disciplinasFiltradas.length} disciplinas</Badge>
                        </CardTitle>
                          <CardDescription>CH: {totalCH}h • {concluidas} concluídas</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-4">
                          <LiquidGlassButton className="w-full" onClick={() => openModalSemestre(sem)}>
                            <TableIcon className="h-4 w-4 mr-2" /> Ver detalhes
                          </LiquidGlassButton>
                        </CardContent>
                      </LiquidGlassCard>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="obrigatorias">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Disciplinas Obrigatórias</h3>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={filtroObrigatorias} onValueChange={setFiltroObrigatorias}>
                      <SelectTrigger className={`w-40 backdrop-blur-sm ${
                        isLiquidGlass
                          ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                          : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                      }`}>
                        <SelectValue placeholder="Filtrar" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/50">
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="concluidas">Concluídas</SelectItem>
                        <SelectItem value="em-curso">Em Curso</SelectItem>
                        <SelectItem value="pendentes">Pendentes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                  <CardContent>
                    <Table data={disciplinasFiltradasObrigatorias} showSemestre={true} />
                  </CardContent>
                </LiquidGlassCard>
              </div>
            </TabsContent>

            <TabsContent value="optativas">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Disciplinas Optativas</h3>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={filtroOptativas} onValueChange={setFiltroOptativas}>
                      <SelectTrigger className={`w-40 backdrop-blur-sm ${
                        isLiquidGlass
                          ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                          : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                      }`}>
                        <SelectValue placeholder="Filtrar" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/50">
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="concluidas">Concluídas</SelectItem>
                        <SelectItem value="em-curso">Em Curso</SelectItem>
                        <SelectItem value="pendentes">Pendentes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
                  <CardContent>
                    <Table data={disciplinasFiltradasOptativas} showSemestre={true} />
                  </CardContent>
                </LiquidGlassCard>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {semestreSelecionado && (
        <ModalGradeSemestre
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          semestre={semestreSelecionado.nome}
          disciplinas={semestreSelecionado.disciplinas}
        />
      )}
    </div>
  )
}


