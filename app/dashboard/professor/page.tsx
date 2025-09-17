"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard } from "@/components/liquid-glass/liquid-glass-card"
import { BookOpen, Calendar, FileText, Users, TrendingUp, CheckCircle } from "lucide-react"

export default function ProfessorDashboard() {
  const turmas = [
    { nome: "9º Ano A", disciplina: "Matemática", alunos: 28, proxima: "08:00 - 09:40" },
    { nome: "8º Ano B", disciplina: "Matemática", alunos: 25, proxima: "10:00 - 11:40" },
    { nome: "7º Ano C", disciplina: "Matemática", alunos: 30, proxima: "14:00 - 15:40" },
  ]

  const agendaSemanal = [
    { dia: "Segunda", aulas: 4, turmas: ["9º A", "8º B"] },
    { dia: "Terça", aulas: 3, turmas: ["7º C", "9º A"] },
    { dia: "Quarta", aulas: 4, turmas: ["8º B", "7º C"] },
    { dia: "Quinta", aulas: 3, turmas: ["9º A", "8º B"] },
    { dia: "Sexta", aulas: 2, turmas: ["7º C"] },
  ]

  const atividades = [
    { titulo: "Prova de Álgebra", turma: "9º Ano A", prazo: "20/03/2024", status: "Pendente" },
    { titulo: "Lista de Exercícios", turma: "8º Ano B", prazo: "18/03/2024", status: "Corrigindo" },
    { titulo: "Projeto Geometria", turma: "7º Ano C", prazo: "25/03/2024", status: "Aguardando" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Olá, Prof. Maria!</h1>
              <p className="text-muted-foreground">Gerencie suas turmas e atividades</p>
            </div>
            <div className="flex gap-2">
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Lançar Notas
              </Button>
              <Button variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Registrar Frequência
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Turmas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">3</div>
                <p className="text-xs text-muted-foreground">83 alunos no total</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aulas Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">4</div>
                <p className="text-xs text-muted-foreground">16 horas/aula semanais</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atividades Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">5</div>
                <p className="text-xs text-muted-foreground">2 para correção</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média das Turmas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">7.8</div>
                <p className="text-xs text-muted-foreground">+0.2 desde o último bimestre</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <LiquidGlassCard intensity="low">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Minhas Turmas
                  </CardTitle>
                  <CardDescription>Turmas sob sua responsabilidade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {turmas.map((turma, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{turma.nome}</h4>
                          <p className="text-sm text-muted-foreground">{turma.disciplina}</p>
                          <p className="text-sm text-muted-foreground">{turma.alunos} alunos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Próxima aula</p>
                          <p className="text-sm text-muted-foreground">{turma.proxima}</p>
                          <Button size="sm" variant="outline" className="mt-2 bg-transparent">
                            Gerenciar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>

              <LiquidGlassCard intensity="low">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Atividades Recentes
                  </CardTitle>
                  <CardDescription>Atividades e avaliações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {atividades.map((atividade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{atividade.titulo}</h4>
                          <p className="text-sm text-muted-foreground">{atividade.turma}</p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              atividade.status === "Pendente"
                                ? "destructive"
                                : atividade.status === "Corrigindo"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {atividade.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{atividade.prazo}</p>
                        </div>
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
                    <Calendar className="h-5 w-5 mr-2" />
                    Agenda Semanal
                  </CardTitle>
                  <CardDescription>Sua programação da semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agendaSemanal.map((dia, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{dia.dia}</h4>
                          <Badge variant="outline">{dia.aulas} aulas</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dia.turmas.map((turma, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {turma}
                            </Badge>
                          ))}
                        </div>
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
