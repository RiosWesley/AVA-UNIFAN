"use client"

import { useMemo, useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/layout/sidebar"
import { PageSpinner } from "@/components/ui/page-spinner"
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
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Download,
  FileText,
  Search,
  Mail,
  Phone,
} from "lucide-react"
import {
  useAdminFinancialSummary,
  useRevenueEvolution,
  useRevenueByCategory,
  useExpensesByCategory,
  useDefaultingStudents,
  useCashFlow,
  useGenerateReport,
  useRegisterContact,
  useStudentInstallments,
  useCreatePayment,
} from "@/hooks/use-financeiro"
import type {
  PeriodFilter,
  ReportType,
  ReportPeriod,
  ReportFormat,
  CashFlowGroupBy,
  PaymentMethod,
} from "@/src/types/Financeiro"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CreditCard } from "lucide-react"

const COLORS = ["#15803d", "#84cc16", "#f97316", "#be123c", "#64748b", "#3b82f6", "#8b5cf6"]

export default function AdministradorFinanceiroPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState<string>("")
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month")
  const [reportType, setReportType] = useState<ReportType>("complete")
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("month")
  const [reportFormat, setReportFormat] = useState<ReportFormat>("pdf")
  const [cashFlowGroupBy, setCashFlowGroupBy] = useState<CashFlowGroupBy>("week")
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedStudentName, setSelectedStudentName] = useState<string>("")
  const [contactMethod, setContactMethod] = useState<"email" | "phone" | "in_person">("email")
  const [contactNotes, setContactNotes] = useState("")
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix")
  const [paymentValue, setPaymentValue] = useState<string>("")

  const summaryParams = useMemo(
    () => ({
      period: periodFilter,
    }),
    [periodFilter]
  )

  const {
    data: summary,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useAdminFinancialSummary(summaryParams)

  const {
    data: revenueEvolution = [],
    isLoading: isLoadingEvolution,
  } = useRevenueEvolution(summaryParams)

  const {
    data: revenueByCategory = [],
    isLoading: isLoadingRevenueCategory,
  } = useRevenueByCategory(summaryParams)

  const {
    data: expensesByCategory = [],
    isLoading: isLoadingExpensesCategory,
  } = useExpensesByCategory(summaryParams)

  const defaultingParams = useMemo(
    () => ({
      search: searchTerm || undefined,
      classId: classFilter || undefined,
    }),
    [searchTerm, classFilter]
  )

  const {
    data: defaultingStudents = [],
    isLoading: isLoadingDefaulting,
  } = useDefaultingStudents(defaultingParams)

  const cashFlowParams = useMemo(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      groupBy: cashFlowGroupBy,
    }
  }, [cashFlowGroupBy])

  const {
    data: cashFlow = [],
    isLoading: isLoadingCashFlow,
  } = useCashFlow(cashFlowParams)

  const generateReportMutation = useGenerateReport()
  const registerContactMutation = useRegisterContact()
  const createPaymentMutation = useCreatePayment()

  const {
    data: studentInstallments = [],
    isLoading: isLoadingInstallments,
  } = useStudentInstallments(selectedStudentId ?? "")

  const pendingInstallments = useMemo(() => {
    return studentInstallments.filter(
      (inst) => inst.status === "pending" || inst.status === "overdue"
    )
  }, [studentInstallments])

  const isLoading =
    isLoadingSummary ||
    isLoadingEvolution ||
    isLoadingRevenueCategory ||
    isLoadingExpensesCategory ||
    isLoadingDefaulting ||
    isLoadingCashFlow

  const uniqueClasses = useMemo(() => {
    return Array.from(new Set(defaultingStudents.map((s) => s.className).filter((c): c is string => c !== null))).sort()
  }, [defaultingStudents])

  const filteredDefaultingStudents = useMemo(() => {
    return defaultingStudents.filter((student) => {
      const matchesSearch =
        searchTerm === "" ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.className && student.className.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesClass = classFilter === "" || student.className === classFilter
      return matchesSearch && matchesClass
    })
  }, [defaultingStudents, searchTerm, classFilter])

  const profitMargin = useMemo(() => {
    if (!summary || summary.monthlyRevenue === 0) return 0
    return (summary.netProfit / summary.monthlyRevenue) * 100
  }, [summary])

  const chartRevenueEvolution = useMemo(() => {
    return revenueEvolution.map((item) => ({
      mes: item.period,
      receita: item.revenue,
      despesas: item.expenses,
      lucro: item.profit,
    }))
  }, [revenueEvolution])

  const chartRevenueCategory = useMemo(() => {
    return revenueByCategory.map((item, index) => ({
      categoria: item.category,
      valor: item.value,
      cor: COLORS[index % COLORS.length],
    }))
  }, [revenueByCategory])

  const chartExpensesCategory = useMemo(() => {
    return expensesByCategory.map((item, index) => ({
      categoria: item.category,
      valor: item.value,
      cor: COLORS[index % COLORS.length],
    }))
  }, [expensesByCategory])

  const chartCashFlow = useMemo(() => {
    return cashFlow.map((item) => ({
      data: format(new Date(item.date), "dd/MM"),
      entrada: item.income,
      saida: item.outcome,
      saldo: item.balance,
    }))
  }, [cashFlow])

  function formatCurrency(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function getInadimplenciaBadgeVariant(mesesAtraso: number): "destructive" | "secondary" | "outline" {
    if (mesesAtraso >= 3) return "destructive"
    if (mesesAtraso >= 2) return "secondary"
    return "outline"
  }

  const handleGenerateReport = async () => {
    try {
      const response = await generateReportMutation.mutateAsync({
        type: reportType,
        period: reportPeriod,
        format: reportFormat,
      })
      window.open(response.downloadUrl, "_blank")
      toast.success("Relatório gerado com sucesso")
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      toast.error("Não foi possível gerar o relatório")
    }
  }

  const handleRegisterContact = async () => {
    if (!selectedStudentId) return

    try {
      await registerContactMutation.mutateAsync({
        studentId: selectedStudentId,
        data: {
          contactDate: new Date().toISOString(),
          contactMethod: contactMethod,
          notes: contactNotes || undefined,
        },
      })
      toast.success("Contato registrado com sucesso")
      setContactDialogOpen(false)
      setSelectedStudentId(null)
      setContactNotes("")
    } catch (error) {
      console.error("Erro ao registrar contato:", error)
      toast.error("Não foi possível registrar o contato")
    }
  }

  const openContactDialog = (studentId: string) => {
    setSelectedStudentId(studentId)
    setContactDialogOpen(true)
  }

  const openPaymentDialog = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId)
    setSelectedStudentName(studentName)
    setSelectedInstallmentId("")
    setPaymentValue("")
    setPaymentMethod("pix")
    setTimeout(() => {
      setPaymentDialogOpen(true)
    }, 0)
  }

  const handleCreatePayment = async () => {
    if (!selectedStudentId || !selectedInstallmentId || !paymentValue) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    const value = parseFloat(paymentValue.replace(",", "."))
    if (isNaN(value) || value <= 0) {
      toast.error("Valor inválido")
      return
    }

    try {
      await createPaymentMutation.mutateAsync({
        studentId: selectedStudentId,
        data: {
          installmentId: selectedInstallmentId,
          method: paymentMethod,
          value: value,
        },
      })
      toast.success("Pagamento lançado com sucesso")
      setPaymentDialogOpen(false)
      setSelectedStudentId(null)
      setSelectedStudentName("")
      setSelectedInstallmentId("")
      setPaymentValue("")
    } catch (error) {
      console.error("Erro ao lançar pagamento:", error)
      toast.error("Não foi possível lançar o pagamento")
    }
  }

  const selectedInstallment = useMemo(() => {
    return pendingInstallments.find((inst) => inst.id === selectedInstallmentId)
  }, [pendingInstallments, selectedInstallmentId])

  useEffect(() => {
    if (selectedInstallment && paymentDialogOpen) {
      const calculatedValue = (selectedInstallment.value - selectedInstallment.discount).toFixed(2).replace(".", ",")
      setPaymentValue(calculatedValue)
    }
  }, [selectedInstallment, paymentDialogOpen])

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="administrador" />
        <main className="flex-1 overflow-y-auto">
          <PageSpinner />
        </main>
      </div>
    )
  }

  if (summaryError) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="administrador" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-destructive" />
              <p className="text-destructive">Erro ao carregar dados financeiros</p>
            </div>
          </div>
        </main>
      </div>
    )
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
              <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="semester">Semestre</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleGenerateReport} disabled={generateReportMutation.isPending}>
                <Download className="h-4 w-4 mr-2" />
                {generateReportMutation.isPending ? "Gerando..." : "Exportar Relatório"}
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
                  {summary ? formatCurrency(summary.monthlyRevenue) : "R$ 0,00"}
                </div>
                <p className="text-xs text-muted-foreground">Período selecionado</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {summary ? formatCurrency(summary.monthlyExpenses) : "R$ 0,00"}
                </div>
                <p className="text-xs text-muted-foreground">Período selecionado</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {summary ? formatCurrency(summary.netProfit) : "R$ 0,00"}
                </div>
                <p className="text-xs text-muted-foreground">Período selecionado</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Inadimplência</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {summary ? `${summary.defaultRate.toFixed(1)}%` : "0%"}
                </div>
                <Progress value={summary?.defaultRate || 0} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {summary?.defaultingStudents || 0} de {summary?.totalStudents || 0} alunos
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{profitMargin.toFixed(1)}%</div>
                <Progress value={profitMargin} className="mt-2" />
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
                    <CardDescription>Receitas, despesas e lucro por período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartRevenueEvolution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartRevenueEvolution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="mes" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="receita"
                            stroke="#15803d"
                            strokeWidth={3}
                            name="Receita"
                          />
                          <Line
                            type="monotone"
                            dataKey="despesas"
                            stroke="#be123c"
                            strokeWidth={3}
                            name="Despesas"
                          />
                          <Line type="monotone" dataKey="lucro" stroke="#84cc16" strokeWidth={3} name="Lucro" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <p>Nenhum dado disponível</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Receitas por Categoria</CardTitle>
                    <CardDescription>Distribuição das fontes de receita</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {chartRevenueCategory.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={chartRevenueCategory}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="valor"
                            >
                              {chartRevenueCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.cor} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                          {chartRevenueCategory.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.cor }} />
                                <span className="text-sm">{item.categoria}</span>
                              </div>
                              <span className="text-sm font-medium">{formatCurrency(item.valor)}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <p>Nenhum dado disponível</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                  <CardDescription>Distribuição dos gastos mensais</CardDescription>
                </CardHeader>
                <CardContent>
                  {chartExpensesCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartExpensesCategory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="categoria" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="valor" fill="#15803d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      <p>Nenhum dado disponível</p>
                    </div>
                  )}
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
                      <Select value={classFilter || "all"} onValueChange={(v) => setClassFilter(v === "all" ? "" : v)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filtrar por turma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as turmas</SelectItem>
                          {uniqueClasses.map((className) => (
                            <SelectItem key={className} value={className}>
                              {className}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {filteredDefaultingStudents.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum aluno encontrado com os filtros aplicados.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredDefaultingStudents.map((student) => (
                          <Card key={student.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="font-semibold text-lg">{student.name}</h4>
                                    {student.className && <Badge variant="outline">{student.className}</Badge>}
                                    <Badge variant={getInadimplenciaBadgeVariant(student.monthsOverdue)}>
                                      {student.monthsOverdue} {student.monthsOverdue === 1 ? "mês" : "meses"} em atraso
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-muted-foreground">Valor devido</p>
                                      <p className="font-semibold text-destructive text-lg">
                                        {formatCurrency(student.totalDue)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Último contato</p>
                                      <p className="font-medium">
                                        {student.lastContactDate
                                          ? format(new Date(student.lastContactDate), "dd/MM/yyyy")
                                          : "Nunca"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Email</p>
                                      <p className="font-medium flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {student.email}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-muted-foreground">Telefone</p>
                                      <p className="font-medium flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {student.phone || "Não informado"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openContactDialog(student.studentId)}
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Contatar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openPaymentDialog(student.studentId, student.name)}
                                  >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Lançar Pagamento
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Fluxo de Caixa</CardTitle>
                      <CardDescription>Entradas e saídas</CardDescription>
                    </div>
                    <Select value={cashFlowGroupBy} onValueChange={(v) => setCashFlowGroupBy(v as CashFlowGroupBy)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Dia</SelectItem>
                        <SelectItem value="week">Semana</SelectItem>
                        <SelectItem value="month">Mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {chartCashFlow.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartCashFlow}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Bar dataKey="entrada" fill="#15803d" name="Entradas" />
                        <Bar dataKey="saida" fill="#be123c" name="Saídas" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      <p>Nenhum dado disponível</p>
                    </div>
                  )}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Relatório</Label>
                        <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="revenue">Relatório de Receitas</SelectItem>
                            <SelectItem value="expenses">Relatório de Despesas</SelectItem>
                            <SelectItem value="defaulting">Relatório de Inadimplência</SelectItem>
                            <SelectItem value="cash_flow">Relatório de Fluxo de Caixa</SelectItem>
                            <SelectItem value="complete">Relatório Completo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Período</Label>
                        <Select value={reportPeriod} onValueChange={(v) => setReportPeriod(v as ReportPeriod)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o período" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="month">Último mês</SelectItem>
                            <SelectItem value="quarter">Último trimestre</SelectItem>
                            <SelectItem value="semester">Último semestre</SelectItem>
                            <SelectItem value="year">Último ano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Formato</Label>
                        <Select value={reportFormat} onValueChange={(v) => setReportFormat(v as ReportFormat)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o formato" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={handleGenerateReport}
                        disabled={generateReportMutation.isPending}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {generateReportMutation.isPending ? "Gerando..." : "Gerar Relatório"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Contato</DialogTitle>
            <DialogDescription>Registre o contato realizado com o aluno inadimplente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Método de Contato</Label>
              <Select value={contactMethod} onValueChange={(v) => setContactMethod(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="in_person">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                placeholder="Adicione observações sobre o contato..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleRegisterContact} disabled={registerContactMutation.isPending}>
                {registerContactMutation.isPending ? "Registrando..." : "Registrar Contato"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={(open) => {
        setPaymentDialogOpen(open)
        if (!open) {
          setTimeout(() => {
            setSelectedStudentId(null)
            setSelectedStudentName("")
            setSelectedInstallmentId("")
            setPaymentValue("")
            setPaymentMethod("pix")
          }, 200)
        }
      }}>
        <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Lançar Pagamento</DialogTitle>
            <DialogDescription>
              Lançar pagamento para {selectedStudentName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Parcela/Mensalidade</Label>
              <Select
                value={selectedInstallmentId}
                onValueChange={setSelectedInstallmentId}
                disabled={isLoadingInstallments || !paymentDialogOpen}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a parcela" />
                </SelectTrigger>
                <SelectContent>
                  {pendingInstallments.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {isLoadingInstallments ? "Carregando..." : "Nenhuma parcela pendente"}
                    </div>
                  ) : (
                    pendingInstallments.map((installment) => (
                      <SelectItem key={installment.id} value={installment.id}>
                        {installment.month} {installment.year} - R$ {installment.value.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })} - Vencimento: {format(new Date(installment.dueDate), "dd/MM/yyyy")}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedInstallment && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Valor Original:</span>
                  <span className="font-medium">
                    R$ {selectedInstallment.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {selectedInstallment.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Desconto:</span>
                    <span className="font-medium">
                      -R$ {selectedInstallment.discount.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Valor a Pagar:</span>
                  <span className="font-bold text-lg">
                    R$ {(selectedInstallment.value - selectedInstallment.discount).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Valor do Pagamento</Label>
              <Input
                type="text"
                value={paymentValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d,]/g, "")
                  setPaymentValue(value)
                }}
                placeholder="0,00"
                disabled={!selectedInstallmentId}
              />
              <p className="text-xs text-muted-foreground">
                Digite o valor a ser pago (use vírgula para decimais)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Método de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="bank_slip">Boleto Bancário</SelectItem>
                  <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreatePayment}
                disabled={
                  createPaymentMutation.isPending ||
                  !selectedInstallmentId ||
                  !paymentValue ||
                  isLoadingInstallments
                }
              >
                {createPaymentMutation.isPending ? "Lançando..." : "Lançar Pagamento"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
