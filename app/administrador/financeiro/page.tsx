"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/layout/sidebar"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { DollarSign, TrendingUp, AlertTriangle, Users, Download, FileText, Search, Mail, Phone } from "lucide-react"

type ReceitaCategoria = {
  categoria: string
  valor: number
  cor: string
}

type DespesaCategoria = {
  categoria: string
  valor: number
  cor: string
}

type AlunoInadimplente = {
  id: number
  nome: string
  email: string
  telefone: string
  turma: string
  valorDevido: number
  mesesAtraso: number
  ultimoContato: string
}

type FluxoCaixaItem = {
  data: string
  entrada: number
  saida: number
  saldo: number
}

type ReceitaMes = {
  mes: string
  receita: number
  despesas: number
  lucro: number
}

type ResumoFinanceiro = {
  receitaMensal: number
  despesasMensais: number
  lucroLiquido: number
  inadimplencia: number
  totalAlunos: number
  alunosInadimplentes: number
}

type RelatorioTipo = "receitas" | "despesas" | "inadimplencia" | "fluxo" | "completo"
type PeriodoRelatorio = "mes" | "trimestre" | "semestre" | "ano"

const MOCK_RESUMO: ResumoFinanceiro = {
  receitaMensal: 125000,
  despesasMensais: 89000,
  lucroLiquido: 36000,
  inadimplencia: 8.5,
  totalAlunos: 870,
  alunosInadimplentes: 74,
}

const MOCK_RECEITAS_MES: ReceitaMes[] = [
  { mes: "Jan", receita: 118000, despesas: 85000, lucro: 33000 },
  { mes: "Fev", receita: 122000, despesas: 87000, lucro: 35000 },
  { mes: "Mar", receita: 125000, despesas: 89000, lucro: 36000 },
  { mes: "Abr", receita: 128000, despesas: 91000, lucro: 37000 },
  { mes: "Mai", receita: 130000, despesas: 92000, lucro: 38000 },
  { mes: "Jun", receita: 132000, despesas: 94000, lucro: 38000 },
]

const MOCK_RECEITAS_CATEGORIA: ReceitaCategoria[] = [
  { categoria: "Mensalidades", valor: 105000, cor: "#15803d" },
  { categoria: "Matrículas", valor: 12000, cor: "#84cc16" },
  { categoria: "Cursos Extras", valor: 5000, cor: "#f97316" },
  { categoria: "Material Didático", valor: 3000, cor: "#be123c" },
]

const MOCK_DESPESAS_CATEGORIA: DespesaCategoria[] = [
  { categoria: "Salários", valor: 45000, cor: "#15803d" },
  { categoria: "Infraestrutura", valor: 18000, cor: "#84cc16" },
  { categoria: "Material", valor: 12000, cor: "#f97316" },
  { categoria: "Serviços", valor: 8000, cor: "#be123c" },
  { categoria: "Outros", valor: 6000, cor: "#64748b" },
]

const MOCK_ALUNOS_INADIMPLENTES: AlunoInadimplente[] = [
  {
    id: 1,
    nome: "Carlos Silva",
    email: "carlos.silva@email.com",
    telefone: "(62) 99999-9999",
    turma: "9º Ano A",
    valorDevido: 1700.0,
    mesesAtraso: 2,
    ultimoContato: "15/03/2024",
  },
  {
    id: 2,
    nome: "Maria Santos",
    email: "maria.santos@email.com",
    telefone: "(62) 98888-8888",
    turma: "8º Ano B",
    valorDevido: 850.0,
    mesesAtraso: 1,
    ultimoContato: "10/03/2024",
  },
  {
    id: 3,
    nome: "João Oliveira",
    email: "joao.oliveira@email.com",
    telefone: "(62) 97777-7777",
    turma: "7º Ano C",
    valorDevido: 2550.0,
    mesesAtraso: 3,
    ultimoContato: "05/03/2024",
  },
  {
    id: 4,
    nome: "Ana Costa",
    email: "ana.costa@email.com",
    telefone: "(62) 96666-6666",
    turma: "6º Ano A",
    valorDevido: 1275.0,
    mesesAtraso: 1,
    ultimoContato: "12/03/2024",
  },
  {
    id: 5,
    nome: "Pedro Alves",
    email: "pedro.alves@email.com",
    telefone: "(62) 95555-5555",
    turma: "9º Ano B",
    valorDevido: 3400.0,
    mesesAtraso: 4,
    ultimoContato: "01/03/2024",
  },
]

const MOCK_FLUXO_CAIXA: FluxoCaixaItem[] = [
  { data: "01/03", entrada: 15000, saida: 8000, saldo: 7000 },
  { data: "08/03", entrada: 25000, saida: 12000, saldo: 20000 },
  { data: "15/03", entrada: 35000, saida: 18000, saldo: 37000 },
  { data: "22/03", entrada: 28000, saida: 22000, saldo: 43000 },
  { data: "29/03", entrada: 22000, saida: 29000, saldo: 36000 },
]

export default function AdministradorFinanceiroPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [turmaFilter, setTurmaFilter] = useState<string>("todos")
  const [relatorioTipo, setRelatorioTipo] = useState<RelatorioTipo>("completo")
  const [periodoRelatorio, setPeriodoRelatorio] = useState<PeriodoRelatorio>("mes")

  const alunosFiltrados = useMemo(() => {
    return MOCK_ALUNOS_INADIMPLENTES.filter((aluno) => {
      const matchesSearch =
        searchTerm === "" ||
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.turma.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTurma = turmaFilter === "todos" || aluno.turma === turmaFilter
      return matchesSearch && matchesTurma
    })
  }, [searchTerm, turmaFilter])

  const turmasUnicas = useMemo(() => {
    return Array.from(new Set(MOCK_ALUNOS_INADIMPLENTES.map((a) => a.turma)))
  }, [])

  const margemLucro = useMemo(() => {
    return (MOCK_RESUMO.lucroLiquido / MOCK_RESUMO.receitaMensal) * 100
  }, [])

  function formatCurrency(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function getInadimplenciaBadgeVariant(mesesAtraso: number): "destructive" | "secondary" | "outline" {
    if (mesesAtraso >= 3) return "destructive"
    if (mesesAtraso >= 2) return "secondary"
    return "outline"
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestão Financeira</h1>
              <p className="text-muted-foreground">Dashboard financeiro completo da instituição</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(MOCK_RESUMO.receitaMensal)}</div>
                <p className="text-xs text-muted-foreground">+2.4% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(MOCK_RESUMO.despesasMensais)}</div>
                <p className="text-xs text-muted-foreground">+1.8% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(MOCK_RESUMO.lucroLiquido)}</div>
                <p className="text-xs text-muted-foreground">+3.2% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Inadimplência</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{MOCK_RESUMO.inadimplencia}%</div>
                <Progress value={MOCK_RESUMO.inadimplencia} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {MOCK_RESUMO.alunosInadimplentes} de {MOCK_RESUMO.totalAlunos} alunos
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{margemLucro.toFixed(1)}%</div>
                <Progress value={margemLucro} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Meta: 30%</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="inadimplencia">Inadimplência</TabsTrigger>
              <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução Financeira</CardTitle>
                    <CardDescription>Receitas, despesas e lucro por mês</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={MOCK_RECEITAS_MES}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Line type="monotone" dataKey="receita" stroke="#15803d" strokeWidth={3} name="Receita" />
                        <Line type="monotone" dataKey="despesas" stroke="#be123c" strokeWidth={3} name="Despesas" />
                        <Line type="monotone" dataKey="lucro" stroke="#84cc16" strokeWidth={3} name="Lucro" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Receitas por Categoria</CardTitle>
                    <CardDescription>Distribuição das fontes de receita</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={MOCK_RECEITAS_CATEGORIA}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="valor"
                        >
                          {MOCK_RECEITAS_CATEGORIA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {MOCK_RECEITAS_CATEGORIA.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.cor }} />
                            <span className="text-sm">{item.categoria}</span>
                          </div>
                          <span className="text-sm font-medium">{formatCurrency(item.valor)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                  <CardDescription>Distribuição dos gastos mensais</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={MOCK_DESPESAS_CATEGORIA}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="valor" fill="#15803d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inadimplencia">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestão de Inadimplência</CardTitle>
                    <CardDescription>Gerencie alunos com pagamentos em atraso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por nome, email ou turma..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={turmaFilter} onValueChange={setTurmaFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filtrar por turma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todas as turmas</SelectItem>
                          {turmasUnicas.map((turma) => (
                            <SelectItem key={turma} value={turma}>
                              {turma}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button>
                        <Users className="h-4 w-4 mr-2" />
                        Contatar Todos
                      </Button>
                    </div>

                    {alunosFiltrados.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum aluno encontrado com os filtros aplicados.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {alunosFiltrados.map((aluno) => (
                          <Card key={aluno.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-semibold text-lg">{aluno.nome}</h4>
                                    <Badge variant="outline">{aluno.turma}</Badge>
                                    <Badge variant={getInadimplenciaBadgeVariant(aluno.mesesAtraso)}>
                                      {aluno.mesesAtraso} {aluno.mesesAtraso === 1 ? "mês" : "meses"} em atraso
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Valor devido</p>
                                      <p className="font-semibold text-destructive text-lg">
                                        {formatCurrency(aluno.valorDevido)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Último contato</p>
                                      <p className="font-medium">{aluno.ultimoContato}</p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Email</p>
                                      <p className="font-medium flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {aluno.email}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Telefone</p>
                                      <p className="font-medium flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {aluno.telefone}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button variant="outline" size="sm">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Contatar
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Negociar
                                  </Button>
                                  <Button size="sm">Ver Detalhes</Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fluxo">
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de Caixa</CardTitle>
                  <CardDescription>Entradas e saídas semanais</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={MOCK_FLUXO_CAIXA}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="entrada" fill="#15803d" name="Entradas" />
                      <Bar dataKey="saida" fill="#be123c" name="Saídas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="relatorios">
              <Card>
                <CardHeader>
                  <CardTitle>Gerar Relatórios Financeiros</CardTitle>
                  <CardDescription>Relatórios detalhados para análise financeira</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo de Relatório</label>
                        <Select value={relatorioTipo} onValueChange={(v) => setRelatorioTipo(v as RelatorioTipo)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="receitas">Relatório de Receitas</SelectItem>
                            <SelectItem value="despesas">Relatório de Despesas</SelectItem>
                            <SelectItem value="inadimplencia">Relatório de Inadimplência</SelectItem>
                            <SelectItem value="fluxo">Relatório de Fluxo de Caixa</SelectItem>
                            <SelectItem value="completo">Relatório Completo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Período</label>
                        <Select
                          value={periodoRelatorio}
                          onValueChange={(v) => setPeriodoRelatorio(v as PeriodoRelatorio)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mes">Último mês</SelectItem>
                            <SelectItem value="trimestre">Último trimestre</SelectItem>
                            <SelectItem value="semestre">Último semestre</SelectItem>
                            <SelectItem value="ano">Último ano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Visualizar</Button>
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Gerar Relatório
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
