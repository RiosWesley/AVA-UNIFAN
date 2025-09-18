"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { GraduationCap, TrendingUp, Download, Calendar } from "lucide-react"

export default function AlunoBoletimPage() {
  const boletim = [
    {
      disciplina: "Matemática",
      codigo: "MAT001",
      media: 8.6,
      frequencia: 92,
      situacao: "Aprovado",
      notas: [8.5, 9.2, 7.8, 8.9],
    },
    {
      disciplina: "Português",
      codigo: "POR001",
      media: 9.1,
      frequencia: 95,
      situacao: "Aprovado",
      notas: [9.0, 9.5, 8.8, 9.1],
    },
    {
      disciplina: "História",
      codigo: "HIS001",
      media: 7.8,
      frequencia: 88,
      situacao: "Aprovado",
      notas: [7.5, 8.2, 7.6, 7.9],
    },
    {
      disciplina: "Física",
      codigo: "FIS001",
      media: 8.2,
      frequencia: 90,
      situacao: "Aprovado",
      notas: [8.0, 8.8, 7.9, 8.1],
    },
    {
      disciplina: "Química",
      codigo: "QUI001",
      media: 7.5,
      frequencia: 85,
      situacao: "Recuperação",
      notas: [7.0, 8.2, 7.1, 7.8],
    },
    {
      disciplina: "Biologia",
      codigo: "BIO001",
      media: 8.9,
      frequencia: 93,
      situacao: "Aprovado",
      notas: [8.8, 9.2, 8.7, 8.9],
    },
  ]

  const mediaGeral = boletim.reduce((acc, curr) => acc + curr.media, 0) / boletim.length
  const frequenciaGeral = boletim.reduce((acc, curr) => acc + curr.frequencia, 0) / boletim.length

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Boletim Digital</h1>
              <p className="text-muted-foreground">Suas notas e desempenho acadêmico</p>
            </div>
            <div className="flex gap-2">
              <LiquidGlassButton variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </LiquidGlassButton>
              <LiquidGlassButton variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Histórico
              </LiquidGlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{mediaGeral.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">+0.3 desde o último bimestre</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Frequência Geral</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{frequenciaGeral.toFixed(0)}%</div>
                <Progress value={frequenciaGeral} className="mt-2" />
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Situação</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">Aprovado</div>
                <p className="text-xs text-muted-foreground">1 disciplina em recuperação</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
            <CardHeader>
              <CardTitle>Desempenho por Disciplina</CardTitle>
              <CardDescription>Detalhamento das suas notas e frequência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {boletim.map((disciplina, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{disciplina.disciplina}</h3>
                        <p className="text-sm text-muted-foreground">{disciplina.codigo}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Média</p>
                          <Badge
                            variant={
                              disciplina.media >= 8 ? "default" : disciplina.media >= 6 ? "secondary" : "destructive"
                            }
                            className="text-lg px-3 py-1"
                          >
                            {disciplina.media}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Frequência</p>
                          <Badge variant={disciplina.frequencia >= 75 ? "default" : "destructive"}>
                            {disciplina.frequencia}%
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Situação</p>
                          <Badge
                            variant={
                              disciplina.situacao === "Aprovado"
                                ? "default"
                                : disciplina.situacao === "Recuperação"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {disciplina.situacao}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {disciplina.notas.map((nota, noteIndex) => (
                        <div key={noteIndex} className="text-center p-2 border rounded">
                          <p className="text-xs text-muted-foreground">{noteIndex + 1}º Bimestre</p>
                          <p className="font-semibold">{nota}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progresso da Frequência</span>
                        <span>{disciplina.frequencia}%</span>
                      </div>
                      <Progress value={disciplina.frequencia} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </LiquidGlassCard>
        </div>
      </main>
    </div>
  )
}
