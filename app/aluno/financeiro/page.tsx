"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { CreditCard, Download, Calendar, AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react"

export default function AlunoFinanceiroPage() {
  const mensalidades = [
    {
      mes: "Março 2024",
      valor: 850.0,
      vencimento: "10/03/2024",
      status: "Pago",
      dataPagamento: "08/03/2024",
      desconto: 0,
    },
    {
      mes: "Abril 2024",
      valor: 850.0,
      vencimento: "10/04/2024",
      status: "Pendente",
      dataPagamento: null,
      desconto: 42.5, // 5% desconto por pontualidade
    },
    {
      mes: "Maio 2024",
      valor: 850.0,
      vencimento: "10/05/2024",
      status: "Agendado",
      dataPagamento: null,
      desconto: 42.5,
    },
    {
      mes: "Junho 2024",
      valor: 850.0,
      vencimento: "10/06/2024",
      status: "Agendado",
      dataPagamento: null,
      desconto: 42.5,
    },
  ]

  const historicoPagamentos = [
    {
      id: 1,
      descricao: "Mensalidade - Março 2024",
      valor: 850.0,
      data: "08/03/2024",
      metodo: "PIX",
      status: "Confirmado",
    },
    {
      id: 2,
      descricao: "Mensalidade - Fevereiro 2024",
      valor: 807.5,
      data: "09/02/2024",
      metodo: "Cartão de Crédito",
      status: "Confirmado",
    },
    {
      id: 3,
      descricao: "Taxa de Matrícula 2024",
      valor: 200.0,
      data: "15/01/2024",
      metodo: "Boleto Bancário",
      status: "Confirmado",
    },
    {
      id: 4,
      descricao: "Mensalidade - Janeiro 2024",
      valor: 807.5,
      data: "10/01/2024",
      metodo: "PIX",
      status: "Confirmado",
    },
  ]

  const resumoFinanceiro = {
    valorTotal: 3400.0,
    valorPago: 1857.5,
    valorPendente: 807.5,
    proximoVencimento: "10/04/2024",
    descontoAcumulado: 127.5,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago":
      case "Confirmado":
        return "default"
      case "Pendente":
        return "destructive"
      case "Agendado":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pago":
      case "Confirmado":
        return <CheckCircle className="h-3 w-3 mr-1" />
      case "Pendente":
        return <AlertCircle className="h-3 w-3 mr-1" />
      case "Agendado":
        return <Clock className="h-3 w-3 mr-1" />
      default:
        return null
    }
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
              <LiquidGlassButton variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Comprovantes
              </LiquidGlassButton>
              <LiquidGlassButton>
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
                  R$ {resumoFinanceiro.valorTotal.toLocaleString("pt-BR")}
                </div>
                <p className="text-xs text-muted-foreground">12 mensalidades</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Pago</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {resumoFinanceiro.valorPago.toLocaleString("pt-BR")}
                </div>
                <Progress value={(resumoFinanceiro.valorPago / resumoFinanceiro.valorTotal) * 100} className="mt-2" />
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximo Vencimento</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  R$ {resumoFinanceiro.valorPendente.toLocaleString("pt-BR")}
                </div>
                <p className="text-xs text-muted-foreground">{resumoFinanceiro.proximoVencimento}</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Desconto Acumulado</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  R$ {resumoFinanceiro.descontoAcumulado.toLocaleString("pt-BR")}
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
                  <CardTitle>Mensalidades 2024</CardTitle>
                  <CardDescription>Acompanhe o status das suas mensalidades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mensalidades.map((mensalidade, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-lg">{mensalidade.mes}</h4>
                            <Badge variant={getStatusColor(mensalidade.status)}>
                              {getStatusIcon(mensalidade.status)}
                              {mensalidade.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Valor</p>
                              <p className="font-medium">R$ {mensalidade.valor.toLocaleString("pt-BR")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Vencimento</p>
                              <p className="font-medium">{mensalidade.vencimento}</p>
                            </div>
                            {mensalidade.desconto > 0 && (
                              <div>
                                <p className="text-muted-foreground">Desconto</p>
                                <p className="font-medium text-primary">
                                  -R$ {mensalidade.desconto.toLocaleString("pt-BR")}
                                </p>
                              </div>
                            )}
                            {mensalidade.dataPagamento && (
                              <div>
                                <p className="text-muted-foreground">Pago em</p>
                                <p className="font-medium">{mensalidade.dataPagamento}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {mensalidade.status === "Pendente" && (
                            <LiquidGlassButton size="sm">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pagar
                            </LiquidGlassButton>
                          )}
                          {mensalidade.status === "Pago" && (
                            <LiquidGlassButton variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Comprovante
                            </LiquidGlassButton>
                          )}
                          {mensalidade.status === "Agendado" && (
                            <LiquidGlassButton variant="outline" size="sm" disabled>
                              Agendado
                            </LiquidGlassButton>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-3">
                    {historicoPagamentos.map((pagamento) => (
                      <div key={pagamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-medium">{pagamento.descricao}</h4>
                            <Badge variant={getStatusColor(pagamento.status)}>
                              {getStatusIcon(pagamento.status)}
                              {pagamento.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{pagamento.data}</span>
                            <span>{pagamento.metodo}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">R$ {pagamento.valor.toLocaleString("pt-BR")}</p>
                          <LiquidGlassButton variant="outline" size="sm" className="mt-1 bg-transparent">
                            <Download className="h-4 w-4 mr-1" />
                            Comprovante
                          </LiquidGlassButton>
                        </div>
                      </div>
                    ))}
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
