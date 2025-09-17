"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard } from "@/components/liquid-glass/liquid-glass-card"
import { Bell, Calendar, Clock, DollarSign, FileText, GraduationCap, TrendingUp } from "lucide-react"

export default function AlunoDashboard() {
  const proximasAulas = [
    { disciplina: "Matemática", horario: "08:00 - 09:40", sala: "A-101", professor: "Prof. Carlos Silva" },
    { disciplina: "Português", horario: "10:00 - 11:40", sala: "B-205", professor: "Prof. Ana Santos" },
    { disciplina: "História", horario: "14:00 - 15:40", sala: "C-301", professor: "Prof. João Costa" },
  ]

  const ultimasNotas = [
    { disciplina: "Matemática", nota: 8.5, data: "15/03/2024" },
    { disciplina: "Português", nota: 9.2, data: "12/03/2024" },
    { disciplina: "Física", nota: 7.8, data: "10/03/2024" },
    { disciplina: "Química", nota: 8.9, data: "08/03/2024" },
  ]

  const comunicados = [
    { titulo: "Prova de Matemática", data: "20/03/2024", tipo: "Avaliação" },
    { titulo: "Entrega do Projeto de História", data: "25/03/2024", tipo: "Atividade" },
    { titulo: "Reunião de Pais", data: "30/03/2024", tipo: "Evento" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Bem-vindo, João!</h1>
              <p className="text-muted-foreground">Aqui está um resumo das suas atividades acadêmicas</p>
            </div>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />3 Notificações
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Frequência Geral</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">92%</div>
                <Progress value={92} className="mt-2" />
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">8.6</div>
                <p className="text-xs text-muted-foreground">+0.3 desde o último mês</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atividades Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">3</div>
                <p className="text-xs text-muted-foreground">2 com prazo próximo</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensalidade</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">Em dia</div>
                <p className="text-xs text-muted-foreground">Vence em 15 dias</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LiquidGlassCard intensity="low">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Próximas Aulas
                  </CardTitle>
                  <CardDescription>Suas aulas de hoje</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {proximasAulas.map((aula, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{aula.disciplina}</h4>
                          <p className="text-sm text-muted-foreground">{aula.professor}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{aula.horario}</p>
                          <p className="text-sm text-muted-foreground">{aula.sala}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              <LiquidGlassCard intensity="low">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Últimas Notas
                  </CardTitle>
                  <CardDescription>Suas avaliações recentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ultimasNotas.map((nota, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{nota.disciplina}</p>
                          <p className="text-sm text-muted-foreground">{nota.data}</p>
                        </div>
                        <Badge variant={nota.nota >= 8 ? "default" : nota.nota >= 6 ? "secondary" : "destructive"}>
                          {nota.nota}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </div>

            <div>
              <LiquidGlassCard intensity="low">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Comunicados
                  </CardTitle>
                  <CardDescription>Avisos importantes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {comunicados.map((comunicado, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{comunicado.titulo}</h4>
                          <Badge variant="outline" className="text-xs">
                            {comunicado.tipo}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {comunicado.data}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
