"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { BookOpen, Users, Calendar, TrendingUp, GraduationCap } from "lucide-react"

export default function CoordenadorDashboard() {
  const cursos = [
    { nome: "Ensino Fundamental I", turmas: 8, alunos: 240, professores: 12 },
    { nome: "Ensino Fundamental II", turmas: 12, alunos: 360, professores: 18 },
    { nome: "Ensino Médio", turmas: 9, alunos: 270, professores: 15 },
  ]

  const desempenhoData = [
    { curso: "Fund. I", media: 8.2, frequencia: 95 },
    { curso: "Fund. II", media: 7.8, frequencia: 92 },
    { curso: "Médio", media: 7.5, frequencia: 89 },
  ]

  const professoresDisponibilidade = [
    { nome: "Prof. Ana Santos", disciplina: "Português", disponivel: true, carga: "20h/sem" },
    { nome: "Prof. Carlos Silva", disciplina: "Matemática", disponivel: false, carga: "24h/sem" },
    { nome: "Prof. Maria Costa", disciplina: "História", disponivel: true, carga: "18h/sem" },
    { nome: "Prof. João Oliveira", disciplina: "Física", disponivel: true, carga: "22h/sem" },
  ]

  const pieData = [
    { name: "Fund. I", value: 240, color: "#15803d" },
    { name: "Fund. II", value: 360, color: "#84cc16" },
    { name: "Médio", value: 270, color: "#f97316" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="coordenador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel de Coordenação</h1>
              <p className="text-muted-foreground">Visão geral dos cursos e desempenho acadêmico</p>
            </div>
            <LiquidGlassButton>
              <Calendar className="h-4 w-4 mr-2" />
              Montagem de Grade
            </LiquidGlassButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <LiquidGlassCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">3</div>
                <p className="text-xs text-muted-foreground">29 turmas ativas</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">870</div>
                <p className="text-xs text-muted-foreground">+15 novos este mês</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Professores Ativos</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">45</div>
                <p className="text-xs text-muted-foreground">3 disponíveis para novas turmas</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">7.8</div>
                <p className="text-xs text-muted-foreground">+0.1 desde o último bimestre</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <LiquidGlassCard className="lg:col-span-2" intensity="low">
              <CardHeader>
                <CardTitle>Desempenho por Curso</CardTitle>
                <CardDescription>Média e frequência dos cursos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={desempenhoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="curso" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="media" fill="#15803d" name="Média" />
                    <Bar dataKey="frequencia" fill="#84cc16" name="Frequência %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="low">
              <CardHeader>
                <CardTitle>Distribuição de Alunos</CardTitle>
                <CardDescription>Por nível de ensino</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiquidGlassCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Resumo dos Cursos
                </CardTitle>
                <CardDescription>Informações gerais por curso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cursos.map((curso, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{curso.nome}</h4>
                        <LiquidGlassButton size="sm" variant="outline">
                          Gerenciar
                        </LiquidGlassButton>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Turmas</p>
                          <p className="font-medium">{curso.turmas}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Alunos</p>
                          <p className="font-medium">{curso.alunos}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Professores</p>
                          <p className="font-medium">{curso.professores}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Disponibilidade dos Professores
                </CardTitle>
                <CardDescription>Status atual da equipe docente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {professoresDisponibilidade.map((professor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{professor.nome}</h4>
                        <p className="text-sm text-muted-foreground">{professor.disciplina}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={professor.disponivel ? "default" : "secondary"} className="mb-1">
                          {professor.disponivel ? "Disponível" : "Ocupado"}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{professor.carga}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
