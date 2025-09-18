"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, BookOpen, FileText, CheckCircle, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function ProfessorTurmasPage() {
  const turmas = [
    {
      id: 1,
      nome: "9º Ano A",
      disciplina: "Matemática",
      alunos: 28,
      mediaGeral: 7.8,
      frequenciaMedia: 92,
      proximaAula: "Segunda, 08:00 - 09:40",
      sala: "A-101",
      atividades: 3,
      avaliacoes: 2,
    },
    {
      id: 2,
      nome: "8º Ano B",
      disciplina: "Matemática",
      alunos: 25,
      mediaGeral: 8.2,
      frequenciaMedia: 89,
      proximaAula: "Segunda, 10:00 - 11:40",
      sala: "A-102",
      atividades: 2,
      avaliacoes: 1,
    },
    {
      id: 3,
      nome: "7º Ano C",
      disciplina: "Matemática",
      alunos: 30,
      mediaGeral: 7.5,
      frequenciaMedia: 95,
      proximaAula: "Segunda, 14:00 - 15:40",
      sala: "A-103",
      atividades: 4,
      avaliacoes: 3,
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Minhas Turmas</h1>
              <p className="text-muted-foreground">Gerencie suas turmas e acompanhe o desempenho</p>
            </div>
            <div className="flex gap-2">
              <LiquidGlassButton>
                <FileText className="h-4 w-4 mr-2" />
                Lançar Notas
              </LiquidGlassButton>
              <LiquidGlassButton variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Registrar Frequência
              </LiquidGlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">83</div>
                <p className="text-xs text-muted-foreground">Distribuídos em 3 turmas</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">7.8</div>
                <p className="text-xs text-muted-foreground">+0.2 desde o último bimestre</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atividades Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">9</div>
                <p className="text-xs text-muted-foreground">Para correção</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {turmas.map((turma) => (
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={turma.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{turma.nome}</CardTitle>
                      <CardDescription>{turma.disciplina}</CardDescription>
                    </div>
                    <Badge variant="outline">{turma.alunos} alunos</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Média da Turma</p>
                        <p className="font-semibold text-lg">{turma.mediaGeral}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Frequência</p>
                        <p className="font-semibold text-lg">{turma.frequenciaMedia}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {turma.proximaAula}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Sala {turma.sala}
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span>Atividades: {turma.atividades}</span>
                      <span>Avaliações: {turma.avaliacoes}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/dashboard/professor/turmas/${turma.id}`} className="flex-1">
                        <LiquidGlassButton className="w-full" size="sm">
                          Gerenciar Turma
                        </LiquidGlassButton>
                      </Link>
                      <LiquidGlassButton variant="outline" size="sm">
                        <FileText className="h-4 w-4" />
                      </LiquidGlassButton>
                    </div>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
