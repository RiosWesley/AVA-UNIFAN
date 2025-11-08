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
import { BarChart3, FileText, Download, Shield, DollarSign, Users, Database, Filter } from "lucide-react"

type TipoRelatorio = "PDF" | "CSV" | "XLSX"

type Relatorio = {
  id: string
  nome: string
  tipo: TipoRelatorio
  codigo: string
  categoria: "sistema" | "financeiro" | "usuarios" | "academico"
  descricao: string
}

export default function RelatoriosAdministradorPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [carregandoId, setCarregandoId] = useState<string | null>(null)
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("2024-1")
  const [dataInicio, setDataInicio] = useState<string>("")
  const [dataFim, setDataFim] = useState<string>("")
  const [categoriaAtiva, setCategoriaAtiva] = useState<"sistema" | "financeiro" | "usuarios" | "academico">("sistema")

  useEffect(() => {
    const checkTheme = () => setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const periodos = [
    { id: "2024-1", nome: "2024 - 1º Semestre" },
    { id: "2023-2", nome: "2023 - 2º Semestre" },
    { id: "2023-1", nome: "2023 - 1º Semestre" },
    { id: "todos", nome: "Todos os períodos" },
  ]

  const relatorios: Relatorio[] = useMemo(() => ([
    {
      id: "R001",
      nome: "Logs do Sistema",
      tipo: "CSV",
      codigo: "ADM-LOG-SIST",
      categoria: "sistema",
      descricao: "Registro completo de todas as ações realizadas no sistema com timestamps e IPs"
    },
    {
      id: "R002",
      nome: "Backups Realizados",
      tipo: "PDF",
      codigo: "ADM-BKP-REAL",
      categoria: "sistema",
      descricao: "Histórico de backups realizados com status, tamanho e duração"
    },
    {
      id: "R003",
      nome: "Performance do Sistema",
      tipo: "PDF",
      codigo: "ADM-PERF-SIST",
      categoria: "sistema",
      descricao: "Métricas de performance, uso de recursos e tempo de resposta"
    },
    {
      id: "R004",
      nome: "Auditoria de Segurança",
      tipo: "PDF",
      codigo: "ADM-AUD-SEG",
      categoria: "sistema",
      descricao: "Tentativas de acesso, falhas de autenticação e eventos de segurança"
    },
    {
      id: "R005",
      nome: "Uso de Recursos",
      tipo: "XLSX",
      codigo: "ADM-REC-UTI",
      categoria: "sistema",
      descricao: "Utilização de CPU, memória, armazenamento e rede por período"
    },
    {
      id: "R006",
      nome: "Receitas e Despesas",
      tipo: "PDF",
      codigo: "ADM-REC-DESP",
      categoria: "financeiro",
      descricao: "Relatório consolidado de receitas e despesas com análise de lucro"
    },
    {
      id: "R007",
      nome: "Inadimplência Detalhada",
      tipo: "XLSX",
      codigo: "ADM-INAD-DET",
      categoria: "financeiro",
      descricao: "Lista completa de alunos inadimplentes com valores e dias em atraso"
    },
    {
      id: "R008",
      nome: "Fluxo de Caixa",
      tipo: "PDF",
      codigo: "ADM-FLX-CAIX",
      categoria: "financeiro",
      descricao: "Fluxo de caixa mensal com entradas, saídas e saldo"
    },
    {
      id: "R009",
      nome: "Pagamentos Recebidos",
      tipo: "CSV",
      codigo: "ADM-PAG-REC",
      categoria: "financeiro",
      descricao: "Lista de todos os pagamentos recebidos com métodos e status"
    },
    {
      id: "R010",
      nome: "Projeção Financeira",
      tipo: "PDF",
      codigo: "ADM-PROJ-FIN",
      categoria: "financeiro",
      descricao: "Projeção de receitas e despesas para os próximos meses"
    },
    {
      id: "R011",
      nome: "Cadastro de Usuários",
      tipo: "CSV",
      codigo: "ADM-CAD-USR",
      categoria: "usuarios",
      descricao: "Lista completa de todos os usuários cadastrados no sistema"
    },
    {
      id: "R012",
      nome: "Atividade de Usuários",
      tipo: "PDF",
      codigo: "ADM-ATV-USR",
      categoria: "usuarios",
      descricao: "Análise de atividade dos usuários com frequência de acesso"
    },
    {
      id: "R013",
      nome: "Novos Cadastros",
      tipo: "XLSX",
      codigo: "ADM-NOV-CAD",
      categoria: "usuarios",
      descricao: "Relatório de novos cadastros por período e tipo de usuário"
    },
    {
      id: "R014",
      nome: "Usuários Inativos",
      tipo: "PDF",
      codigo: "ADM-USR-INAT",
      categoria: "usuarios",
      descricao: "Lista de usuários sem acesso há mais de 30 dias"
    },
    {
      id: "R015",
      nome: "Distribuição por Perfil",
      tipo: "PDF",
      codigo: "ADM-DIST-PERF",
      categoria: "usuarios",
      descricao: "Estatísticas de distribuição de usuários por perfil e status"
    },
    {
      id: "R016",
      nome: "Visão Geral Acadêmica",
      tipo: "PDF",
      codigo: "ADM-VIS-ACAD",
      categoria: "academico",
      descricao: "Visão consolidada de todos os cursos, turmas e alunos"
    },
    {
      id: "R017",
      nome: "Desempenho Geral",
      tipo: "XLSX",
      codigo: "ADM-DES-GER",
      categoria: "academico",
      descricao: "Médias gerais, aprovação e reprovação de todos os cursos"
    },
    {
      id: "R018",
      nome: "Frequência Consolidada",
      tipo: "PDF",
      codigo: "ADM-FRQ-CONS",
      categoria: "academico",
      descricao: "Relatório de frequência de todos os alunos do sistema"
    },
    {
      id: "R019",
      nome: "Estatísticas por Curso",
      tipo: "PDF",
      codigo: "ADM-EST-CUR",
      categoria: "academico",
      descricao: "Estatísticas detalhadas de desempenho e frequência por curso"
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
        `${r.nome} (${r.tipo}) • Código: ${r.codigo} • Período: ${periodos.find(p => p.id === periodoFiltro)?.nome || "Todos"}`
      )
    } catch (err: any) {
      toastError("Erro ao emitir relatório", err?.message || "Erro inesperado")
    } finally {
      setCarregandoId(null)
    }
  }

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case "sistema":
        return Database
      case "financeiro":
        return DollarSign
      case "usuarios":
        return Users
      case "academico":
        return BarChart3
      default:
        return FileText
    }
  }

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case "sistema":
        return "Sistema"
      case "financeiro":
        return "Financeiro"
      case "usuarios":
        return "Usuários"
      case "academico":
        return "Acadêmico"
      default:
        return categoria
    }
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6">
          <div className={`flex items-center justify-between p-6 rounded-2xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                  Relatórios
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Emita relatórios completos do sistema, financeiro, usuários e acadêmico
                </p>
                <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  {relatoriosFiltrados.length} relatório{relatoriosFiltrados.length !== 1 ? 's' : ''} disponível{relatoriosFiltrados.length !== 1 ? 'eis' : ''}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                Administrador
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
                <Filter className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Filtros
              </CardTitle>
              <CardDescription>Selecione os filtros para personalizar os relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </CardContent>
          </LiquidGlassCard>

          <Tabs value={categoriaAtiva} onValueChange={(v) => setCategoriaAtiva(v as typeof categoriaAtiva)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sistema" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Sistema
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
              <TabsTrigger value="academico" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Acadêmico
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
                      return <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
                      <thead className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-b border-purple-200 dark:border-purple-800">
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
                          <tr key={r.id} className="border-t hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-colors">
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
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
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

