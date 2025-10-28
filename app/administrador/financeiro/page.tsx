"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
} from "recharts"
import { DollarSign, TrendingUp, AlertTriangle, Users, Download, FileText } from "lucide-react"

export default function AdministradorFinanceiroPage() {
  const resumoFinanceiro = {
    receitaMensal: 125000,
    despesasMensais: 89000,
    lucroLiquido: 36000,
    inadimplencia: 8.5,
    totalAlunos: 870,
    alunosInadimplentes: 74,
  }

  const receitasPorMes = [
    { mes: "Jan", receita: 118000, despesas: 85000, lucro: 33000 },
    { mes: "Fev", receita: 122000, despesas: 87000, lucro: 35000 },
    { mes: "Mar", receita: 125000, despesas: 89000, lucro: 36000 },
    { mes: "Abr", receita: 128000, despesas: 91000, lucro: 37000 },
    { mes: "Mai", receita: 130000, despesas: 92000, lucro: 38000 },
    { mes: "Jun", receita: 132000, despesas: 94000, lucro: 38000 },
  ]

  const receitasPorCategoria = [
    { categoria: "Mensalidades", valor: 105000, cor: "#15803d" },
    { categoria: "Matrículas", valor: 12000, cor: "#84cc16" },
    { categoria: "Cursos Extras", valor: 5000, cor: "#f97316" },
    { categoria: "Material Didático", valor: 3000, cor: "#be123c" },
  ]

  const despesasPorCategoria = [
    { categoria: "Salários", valor: 45000, cor: "#15803d" },
    { categoria: "Infraestrutura", valor: 18000, cor: "#84cc16" },
    { categoria: "Material", valor: 12000, cor: "#f97316" },
    { categoria: "Serviços", valor: 8000, cor: "#be123c" },
    { categoria: "Outros", valor: 6000, cor: "#64748b" },
  ]

  const alunosInadimplentes = [
    {
      id: 1,
      nome: "Carlos Silva",
      turma: "9º Ano A",
      valorDevido: 1700.0,
      mesesAtraso: 2,
      ultimoContato: "15/03/2024",
    },
    {
      id: 2,
      nome: "Maria Santos",
      turma: "8º Ano B",
      valorDevido: 850.0,
      mesesAtraso: 1,
      ultimoContato: "10/03/2024",
    },
    {
      id: 3,
      nome: "João Oliveira",
      turma: "7º Ano C",
      valorDevido: 2550.0,
      mesesAtraso: 3,
      ultimoContato: "05/03/2024",
    },
  ]

  const fluxoCaixa = [
    { data: "01/03", entrada: 15000, saida: 8000, saldo: 7000 },
    { data: "08/03", entrada: 25000, saida: 12000, saldo: 20000 },
    { data: "15/03", entrada: 35000, saida: 18000, saldo: 37000 },
    { data: "22/03", entrada: 28000, saida: 22000, saldo: 43000 },
    { data: "29/03", entrada: 22000, saida: 29000, saldo: 36000 },
  ]

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
                <div className="text-2xl font-bold text-primary">
                  R$ {resumoFinanceiro.receitaMensal.toLocaleString("pt-BR")}
                </div>
                <p className="text-xs text-muted-foreground">+2.4% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {resumoFinanceiro.despesasMensais.toLocaleString("pt-BR")}
                </div>
                <p className="text-xs text-muted-foreground">+1.8% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {resumoFinanceiro.lucroLiquido.toLocaleString("pt-BR")}
                </div>
                <p className="text-xs text-muted-foreground">+3.2% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Inadimplência</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{resumoFinanceiro.inadimplencia}%</div>
                <Progress value={resumoFinanceiro.inadimplencia} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {resumoFinanceiro.alunosInadimplentes} de {resumoFinanceiro.totalAlunos} alunos
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {((resumoFinanceiro.lucroLiquido / resumoFinanceiro.receitaMensal) * 100).toFixed(1)}%
                </div>
                <Progress
                  value={(resumoFinanceiro.lucroLiquido / resumoFinanceiro.receitaMensal) * 100}
                  className="mt-2"
                />
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
                      <LineChart data={receitasPorMes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
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
                          data={receitasPorCategoria}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="valor"
                        >
                          {receitasPorCategoria.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.cor} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {receitasPorCategoria.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.cor }} />
                            <span className="text-sm">{item.categoria}</span>
                          </div>
                          <span className="text-sm font-medium">R$ {item.valor.toLocaleString("pt-BR")}</span>
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
                    <BarChart data={despesasPorCategoria}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                      <Bar dataKey="valor" fill="#15803d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inadimplencia">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Gestão de Inadimplência</h3>
                  <div className="flex items-center space-x-2">
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar por turma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas as turmas</SelectItem>
                        <SelectItem value="9a">9º Ano A</SelectItem>
                        <SelectItem value="8b">8º Ano B</SelectItem>
                        <SelectItem value="7c">7º Ano C</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      Contatar Todos
                    </Button>
                  </div>
                </div>

                {alunosInadimplentes.map((aluno) => (
                  <Card key={aluno.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-lg">{aluno.nome}</h4>
                            <Badge variant="outline">{aluno.turma}</Badge>
                            <Badge
                              variant={
                                aluno.mesesAtraso >= 3
                                  ? "destructive"
                                  : aluno.mesesAtraso >= 2
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {aluno.mesesAtraso} {aluno.mesesAtraso === 1 ? "mês" : "meses"} em atraso
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Valor devido</p>
                              <p className="font-semibold text-destructive text-lg">
                                R$ {aluno.valorDevido.toLocaleString("pt-BR")}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Último contato</p>
                              <p className="font-medium">{aluno.ultimoContato}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Status</p>
                              <p className="font-medium text-destructive">Inadimplente</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
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
            </TabsContent>

            <TabsContent value="fluxo">
              <Card>
                <CardHeader>
                  <CardTitle>Fluxo de Caixa</CardTitle>
                  <CardDescription>Entradas e saídas semanais</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={fluxoCaixa}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Tipo de Relatório</label>
                        <Select>
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
                      <div>
                        <label className="text-sm font-medium">Período</label>
                        <Select>
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

                    <div className="flex justify-end space-x-2">
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
