"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { PageSpinner } from "@/components/ui/page-spinner"
import { CreditCard, Download, Calendar, AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react"
import { me } from "@/src/services/auth"
import {
  useStudentFinancialSummary,
  useStudentInstallments,
  useStudentPayments,
  useDownloadReceipt,
} from "@/hooks/use-financeiro"
import type { InstallmentStatus, PaymentStatus } from "@/src/types/Financeiro"
import { toast } from "sonner"

export default function AlunoFinanceiroPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState<string | null>(null)
  const downloadReceiptMutation = useDownloadReceipt()

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

  const {
    data: summary,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useStudentFinancialSummary(studentId ?? "")

  const {
    data: installments = [],
    isLoading: isLoadingInstallments,
    error: installmentsError,
  } = useStudentInstallments(studentId ?? "")

  const {
    data: payments = [],
    isLoading: isLoadingPayments,
    error: paymentsError,
  } = useStudentPayments(studentId ?? "")

  const isLoading = isLoadingSummary || isLoadingInstallments || isLoadingPayments
  const error = summaryError || installmentsError || paymentsError

  const handleDownloadReceipt = async (paymentId: string) => {
    if (!studentId) return

    try {
      const blob = await downloadReceiptMutation.mutateAsync({ studentId, paymentId })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `comprovante-${paymentId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Comprovante baixado com sucesso")
    } catch (err) {
      console.error("Erro ao baixar comprovante:", err)
      toast.error("Não foi possível baixar o comprovante")
    }
  }

  const pendingInstallments = useMemo(
    () => installments.filter((installment) => installment.status === "pending" || installment.status === "overdue"),
    [installments]
  )
  const nextPendingInstallment = pendingInstallments[0]

  const handlePayInstallment = (installmentId: string) => {
    router.push(`/aluno/financeiro/checkout/${installmentId}`)
  }

  const handleOpenReceipts = () => {
    toast.info("Baixe os comprovantes diretamente em cada pagamento realizado.")
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const formatMonthYear = (month: string, year: number) => {
    try {
      const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ]
      if (month && month.length > 0) {
        const monthIndex = parseInt(month) - 1
        if (monthIndex >= 0 && monthIndex < 12) {
          return `${monthNames[monthIndex]} ${year}`
        }
      }
      return month || `${year}`
    } catch {
      return month || `${year}`
    }
  }

  const getStatusLabel = (status: InstallmentStatus | PaymentStatus): string => {
    const statusMap: Record<string, string> = {
      paid: "Pago",
      pending: "Pendente",
      scheduled: "Agendado",
      overdue: "Vencido",
      canceled: "Cancelado",
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: InstallmentStatus | PaymentStatus) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
      case "overdue":
        return "destructive"
      case "scheduled":
        return "secondary"
      case "canceled":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: InstallmentStatus | PaymentStatus) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-3 w-3 mr-1" />
      case "pending":
      case "overdue":
        return <AlertCircle className="h-3 w-3 mr-1" />
      case "scheduled":
        return <Clock className="h-3 w-3 mr-1" />
      case "canceled":
        return null
      default:
        return null
    }
  }

  const getPaymentMethodLabel = (method: string | null): string => {
    if (!method) return "Não informado"
    const methodMap: Record<string, string> = {
      pix: "PIX",
      credit_card: "Cartão de Crédito",
      bank_slip: "Boleto Bancário",
      bank_transfer: "Transferência Bancária",
    }
    return methodMap[method] || method
  }

  if (isLoading || !studentId) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="aluno" />
        <main className="flex-1 overflow-y-auto">
          <PageSpinner />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="aluno" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 text-destructive" />
              <p className="text-destructive">Erro ao carregar dados financeiros</p>
            </div>
          </div>
        </main>
      </div>
    )
  }


  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
              <p className="text-muted-foreground">Acompanhe suas mensalidades e pagamentos</p>
            </div>
            <div className="flex gap-2">
              <LiquidGlassButton variant="outline" onClick={handleOpenReceipts}>
                <Download className="h-4 w-4 mr-2" />
                Comprovantes
              </LiquidGlassButton>
              <LiquidGlassButton
                disabled={!nextPendingInstallment}
                onClick={() => {
                  if (nextPendingInstallment) {
                    handlePayInstallment(nextPendingInstallment.id)
                  } else {
                    toast.info("Nenhuma cobrança pendente para pagamento.")
                  }
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar Agora
              </LiquidGlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total Anual</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {summary?.totalAnnual.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.totalInstallments || 0} mensalidades
                </p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Pago</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {summary?.totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
                </div>
                <Progress
                  value={
                    summary && summary.totalAnnual > 0
                      ? (summary.totalPaid / summary.totalAnnual) * 100
                      : 0
                  }
                  className="mt-2"
                />
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximo Vencimento</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  R$ {summary?.totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.nextDueDate ? formatDate(summary.nextDueDate) : "Sem vencimentos"}
                </p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Desconto Acumulado</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {summary?.accumulatedDiscount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
                </div>
                <p className="text-xs text-muted-foreground">Pontualidade nos pagamentos</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <Tabs defaultValue="mensalidades" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mensalidades">Mensalidades</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="mensalidades">
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                <CardHeader>
                  <CardTitle>Mensalidades</CardTitle>
                  <CardDescription>Acompanhe o status das suas mensalidades</CardDescription>
                </CardHeader>
                <CardContent>
                  {installments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhuma mensalidade encontrada</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {installments.map((installment) => (
                        <div
                          key={installment.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-lg">
                                {formatMonthYear(installment.month, installment.year)}
                              </h4>
                              <Badge variant={getStatusColor(installment.status)}>
                                {getStatusIcon(installment.status)}
                                {getStatusLabel(installment.status)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Valor</p>
                                <p className="font-medium">
                                  R$ {installment.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Vencimento</p>
                                <p className="font-medium">{formatDate(installment.dueDate)}</p>
                              </div>
                              {installment.discount > 0 && (
                                <div>
                                  <p className="text-muted-foreground">Desconto</p>
                                  <p className="font-medium text-primary">
                                    -R$ {installment.discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              )}
                              {installment.paymentDate && (
                                <div>
                                  <p className="text-muted-foreground">Pago em</p>
                                  <p className="font-medium">{formatDate(installment.paymentDate)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            {(installment.status === "pending" || installment.status === "overdue") && (
                              <LiquidGlassButton size="sm" onClick={() => handlePayInstallment(installment.id)}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pagar
                              </LiquidGlassButton>
                            )}
                            {installment.status === "paid" && installment.paymentDate && (
                              <LiquidGlassButton
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const payment = payments.find((p) => p.installmentId === installment.id)
                                  if (payment) {
                                    handleDownloadReceipt(payment.id)
                                  }
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Comprovante
                              </LiquidGlassButton>
                            )}
                            {installment.status === "scheduled" && (
                              <LiquidGlassButton variant="outline" size="sm" disabled>
                                Agendado
                              </LiquidGlassButton>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>

            <TabsContent value="historico">
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                  <CardDescription>Todos os seus pagamentos realizados</CardDescription>
                </CardHeader>
                <CardContent>
                  {payments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhum pagamento encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="font-medium">{payment.description}</h4>
                              <Badge variant={getStatusColor(payment.status)}>
                                {getStatusIcon(payment.status)}
                                {getStatusLabel(payment.status)}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{formatDate(payment.paymentDate)}</span>
                              <span>{getPaymentMethodLabel(payment.method)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              R$ {payment.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                            {payment.receiptUrl && (
                              <LiquidGlassButton
                                variant="outline"
                                size="sm"
                                className="mt-1 bg-transparent"
                                onClick={() => handleDownloadReceipt(payment.id)}
                                disabled={downloadReceiptMutation.isPending}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                {downloadReceiptMutation.isPending ? "Baixando..." : "Comprovante"}
                              </LiquidGlassButton>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
