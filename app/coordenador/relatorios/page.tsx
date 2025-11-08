"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toastSuccess, toastError } from "@/components/ui/toast"
import { BarChart3, FileText, Download, GraduationCap, Users, Calendar, Filter } from "lucide-react"

type TipoRelatorio = "PDF" | "CSV" | "XLSX"

type Relatorio = {
  id: string
  nome: string
  tipo: TipoRelatorio
  codigo: string
  categoria: "academico" | "gestao" | "planejamento"
  descricao: string
}

export default function RelatoriosCoordenadorPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [carregandoId, setCarregandoId] = useState<string | null>(null)
  const [cursoFiltro, setCursoFiltro] = useState<string>("todos")
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("2024-1")
  const [categoriaAtiva, setCategoriaAtiva] = useState<"academico" | "gestao" | "planejamento">("academico")

  useEffect(() => {
    const checkTheme = () => setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const cursos = [
    { id: "todos", nome: "Todos os cursos" },
    { id: "fund1", nome: "Ensino Fundamental I" },
    { id: "fund2", nome: "Ensino Fundamental II" },
    { id: "medio", nome: "Ensino Médio" },
  ]

  const periodos = [
    { id: "2024-1", nome: "2024 - 1º Semestre" },
    { id: "2023-2", nome: "2023 - 2º Semestre" },
    { id: "2023-1", nome: "2023 - 1º Semestre" },
  ]

  const relatorios: Relatorio[] = useMemo(() => ([
    {
      id: "R001",
      nome: "Desempenho por Curso",
      tipo: "PDF",
      codigo: "CRD-DES-CURSO",
      categoria: "academico",
      descricao: "Análise de desempenho acadêmico por curso, incluindo médias, aprovação e reprovação"
    },
    {
      id: "R002",
      nome: "Frequência Consolidada",
      tipo: "PDF",
      codigo: "CRD-FRQ-CONS",
      categoria: "academico",
      descricao: "Relatório consolidado de frequência de todos os cursos e turmas"
    },
    {
      id: "R003",
      nome: "Notas por Disciplina",
      tipo: "XLSX",
      codigo: "CRD-NOT-DISC",
      categoria: "academico",
      descricao: "Planilha detalhada com notas de todas as disciplinas por turma"
    },
    {
      id: "R004",
      nome: "Aprovação e Reprovação",
      tipo: "PDF",
      codigo: "CRD-APR-REP",
      categoria: "academico",
      descricao: "Estatísticas de aprovação e reprovação por curso e turma"
    },
    {
      id: "R005",
      nome: "Alunos em Situação Especial",
      tipo: "PDF",
      codigo: "CRD-ALU-ESP",
      categoria: "academico",
      descricao: "Lista de alunos com baixo desempenho ou frequência insuficiente"
    },
    {
      id: "R006",
      nome: "Carga Horária de Professores",
      tipo: "PDF",
      codigo: "CRD-CAR-PROF",
      categoria: "gestao",
      descricao: "Distribuição de carga horária e alocação de professores por curso"
    },
    {
      id: "R007",
      nome: "Lista de Professores",
      tipo: "CSV",
      codigo: "CRD-LST-PROF",
      categoria: "gestao",
      descricao: "Lista completa de professores com contatos e disciplinas lecionadas"
    },
    {
      id: "R008",
      nome: "Distribuição de Turmas",
      tipo: "PDF",
      codigo: "CRD-DIS-TUR",
      categoria: "gestao",
      descricao: "Distribuição de turmas por curso, professor e período"
    },
    {
      id: "R009",
      nome: "Recursos Utilizados",
      tipo: "XLSX",
      codigo: "CRD-REC-UTI",
      categoria: "gestao",
      descricao: "Utilização de salas, laboratórios e outros recursos físicos"
    },
    {
      id: "R010",
      nome: "Grade Horária Completa",
      tipo: "PDF",
      codigo: "CRD-GRD-COMP",
      categoria: "planejamento",
      descricao: "Grade horária completa de todos os cursos e turmas"
    },
    {
      id: "R011",
      nome: "Ocupação de Salas",
      tipo: "PDF",
      codigo: "CRD-OCP-SAL",
      categoria: "planejamento",
      descricao: "Análise de ocupação e disponibilidade de salas de aula"
    },
    {
      id: "R012",
      nome: "Planejamento Semestral",
      tipo: "PDF",
      codigo: "CRD-PLN-SEM",
      categoria: "planejamento",
      descricao: "Planejamento acadêmico e calendário do semestre"
    },
  ]), [])

  const relatoriosFiltrados = useMemo(() => {
    return relatorios.filter((r) => r.categoria === categoriaAtiva)
  }, [relatorios, categoriaAtiva])

  const emitirRelatorio = async (r: Relatorio) => {
    setCarregandoId(r.id)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))
      const deuCerto = Math.random() > 0.2
      if (!deuCerto) {
        throw new Error("Falha ao gerar o relatório. Tente novamente.")
      }
      toastSuccess(
        "Relatório emitido com sucesso!",
        `${r.nome} (${r.tipo}) • Código: ${r.codigo} • Curso: ${cursos.find(c => c.id === cursoFiltro)?.nome || "Todos"}`
      )
    } catch (err: any) {
      toastError("Erro ao emitir relatório", err?.message || "Erro inesperado")
    } finally {
      setCarregandoId(null)
    }
  }

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "academico":
        return GraduationCap
      case "gestao":
        return Users
      case "planejamento":
        return Calendar
      default:
        return FileText
    }
  }

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case "academico":
        return "Acadêmicos"
      case "gestao":
        return "Gestão"
      case "planejamento":
        return "Planejamento"
      default:
        return categoria
    }
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="coordenador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6">
          <div className={`flex items-center justify-between p-6 rounded-2xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  Relatórios
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Emita relatórios acadêmicos, de gestão e planejamento
                </p>
                <Badge variant="secondary" className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                  {relatoriosFiltrados.length} relatório{relatoriosFiltrados.length !== 1 ? 's' : ''} disponível{relatoriosFiltrados.length !== 1 ? 'eis' : ''}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                Coordenador
              </Badge>
            </div>
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
                <Filter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Filtros
              </CardTitle>
              <CardDescription>Selecione os filtros para personalizar os relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="curso">Curso</Label>
                  <Select value={cursoFiltro} onValueChange={setCursoFiltro}>
                    <SelectTrigger id="curso">
                      <SelectValue placeholder="Selecione o curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map((curso) => (
                        <SelectItem key={curso.id} value={curso.id}>
                          {curso.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período</Label>
                  <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                    <SelectTrigger id="periodo">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodos.map((periodo) => (
                        <SelectItem key={periodo.id} value={periodo.id}>
                          {periodo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <Tabs value={categoriaAtiva} onValueChange={(v) => setCategoriaAtiva(v as typeof categoriaAtiva)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="academico" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Acadêmicos
              </TabsTrigger>
              <TabsTrigger value="gestao" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Gestão
              </TabsTrigger>
              <TabsTrigger value="planejamento" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Planejamento
              </TabsTrigger>
            </TabsList>

            <TabsContent value={categoriaAtiva} className="space-y-6">
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
                    {(() => {
                      const Icon = getCategoriaIcon(categoriaAtiva)
                      return <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    })()}
                    Relatórios de {getCategoriaLabel(categoriaAtiva)}
                  </CardTitle>
                  <CardDescription>
                    Selecione o relatório desejado e clique em emitir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800">
                        <tr>
                          <th className="py-3 px-4 font-semibold text-left">Nome</th>
                          <th className="py-3 px-4 font-semibold text-center">Tipo</th>
                          <th className="py-3 px-4 font-semibold text-center">Código</th>
                          <th className="py-3 px-4 font-semibold text-left">Descrição</th>
                          <th className="py-3 px-4 font-semibold text-center">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatoriosFiltrados.map((r) => (
                          <tr key={r.id} className="border-t hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-medium inline-flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                {r.nome}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Badge variant="outline" className="text-xs">{r.tipo}</Badge>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <code className="px-2 py-1 rounded bg-muted text-xs font-mono">{r.codigo}</code>
                            </td>
                            <td className="py-4 px-4 text-muted-foreground text-sm">
                              {r.descricao}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={carregandoId === r.id}
                                onClick={() => emitirRelatorio(r)}
                                className="inline-flex items-center gap-2"
                              >
                                {carregandoId === r.id ? (
                                  <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                                    Emitindo...
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-4 w-4" />
                                    Emitir
                                  </>
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {relatoriosFiltrados.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                              Nenhum relatório disponível nesta categoria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

