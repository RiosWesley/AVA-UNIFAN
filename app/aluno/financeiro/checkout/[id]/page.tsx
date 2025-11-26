"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { PageSpinner } from "@/components/ui/page-spinner"
import { me } from "@/src/services/auth"
import { useStudentInstallments, useUpdatePaymentStatus } from "@/hooks/use-financeiro"
import type { PaymentMethod } from "@/src/types/Financeiro"
import { toast } from "sonner"
import { ArrowLeft, ShieldCheck, Wallet } from "lucide-react"

interface CheckoutPageProps {
  params: {
    id: string
  }
}

const PAYMENT_METHODS: PaymentMethod[] = ["pix", "credit_card", "bank_slip", "bank_transfer"]

const paymentLabels: Record<PaymentMethod, string> = {
  pix: "PIX",
  credit_card: "Cartão de Crédito",
  bank_slip: "Boleto Bancário",
  bank_transfer: "Transferência Bancária",
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter()
  const [studentId, setStudentId] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("pix")
  const [isInitializing, setIsInitializing] = useState(true)

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
        setIsInitializing(false)
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
      } finally {
        setIsInitializing(false)
      }
    }
    init()
  }, [router])

  const { data: installments = [], isLoading: isLoadingInstallments } = useStudentInstallments(studentId ?? "")

  const installment = useMemo(() => installments.find((item) => item.id === params.id), [installments, params.id])

  const updateStatusMutation = useUpdatePaymentStatus()

  const handleConfirmPayment = async () => {
    if (!installment) return
    try {
      await updateStatusMutation.mutateAsync({
        paymentId: installment.id,
        status: "paid",
        studentId: studentId ?? undefined,
      })
      toast.success("Pagamento confirmado com sucesso")
      router.push("/aluno/financeiro")
    } catch (error) {
      console.error(error)
      toast.error("Não foi possível confirmar o pagamento")
    }
  }

  if (isInitializing || isLoadingInstallments) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="aluno" />
        <main className="flex-1 overflow-y-auto">
          <PageSpinner />
        </main>
      </div>
    )
  }

  if (!installment) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="aluno" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <Button variant="outline" onClick={() => router.push("/aluno/financeiro")} className="w-fit">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Financeiro
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>Pagamento não encontrado</CardTitle>
                <CardDescription>
                  Não foi possível localizar esta cobrança. Ela pode ter sido paga ou removida.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const formattedValue = installment.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  const formattedDueDate = new Date(installment.dueDate).toLocaleDateString("pt-BR")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="aluno" />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Button variant="ghost" className="w-fit" onClick={() => router.push("/aluno/financeiro")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Financeiro
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Checkout de Pagamento</CardTitle>
              <CardDescription>Revise os dados antes de confirmar o pagamento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="text-3xl font-bold text-primary">{formattedValue}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Parcela {installment.installmentNumber} de {installment.totalInstallments}
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">Vencimento</p>
                  <p className="text-2xl font-semibold text-destructive">{formattedDueDate}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Status atual: {installment.status === "overdue" ? "Em atraso" : "Pendente"}
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Método de pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map((method) => (
                        <Label
                          key={method}
                          htmlFor={method}
                          className={`border rounded-xl p-3 flex items-center gap-3 cursor-pointer ${
                            selectedMethod === method ? "border-primary bg-primary/5" : ""
                          }`}
                        >
                          <RadioGroupItem id={method} value={method} />
                          <div>
                            <p className="font-medium">{paymentLabels[method]}</p>
                            <p className="text-xs text-muted-foreground">
                              {method === "pix" && "Pagamento instantâneo sem custos adicionais."}
                              {method === "credit_card" && "Simulação de pagamento com cartão de crédito."}
                              {method === "bank_slip" && "Gera um comprovante simulado para pagamento."}
                              {method === "bank_transfer" && "Confirmação através de transferência bancária."}
                            </p>
                          </div>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Este é um checkout simulado. Ao confirmar, a cobrança será marcada como paga no sistema.
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => router.push("/aluno/financeiro")}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmPayment} disabled={updateStatusMutation.isPending}>
                  {updateStatusMutation.isPending ? "Processando..." : "Confirmar Pagamento"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}



