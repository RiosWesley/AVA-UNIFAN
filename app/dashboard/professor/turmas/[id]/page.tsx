"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Users, FileText, CheckCircle, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default function TurmaDetalhePage() {
  const turma = {
    nome: "9º Ano A",
    disciplina: "Matemática",
    alunos: 28,
    mediaGeral: 7.8,
    frequenciaMedia: 92,
  }

  const alunos = [
    { id: 1, nome: "Ana Silva", media: 8.5, frequencia: 95, situacao: "Aprovado" },
    { id: 2, nome: "Bruno Santos", media: 7.2, frequencia: 88, situacao: "Aprovado" },
    { id: 3, nome: "Carlos Oliveira", media: 6.8, frequencia: 92, situacao: "Recuperação" },
    { id: 4, nome: "Diana Costa", media: 9.1, frequencia: 98, situacao: "Aprovado" },
    { id: 5, nome: "Eduardo Lima", media: 5.5, frequencia: 75, situacao: "Reprovado" },
  ]

  const atividades = [
    {
      id: 1,
      titulo: "Lista de Exercícios - Funções",
      tipo: "Exercício",
      prazo: "20/03/2024",
      entregues: 25,
      total: 28,
      status: "Ativa",
    },
    {
      id: 2,
      titulo: "Prova Bimestral",
      tipo: "Avaliação",
      prazo: "15/03/2024",
      entregues: 28,
      total: 28,
      status: "Concluída",
    },
    {
      id: 3,
      titulo: "Trabalho em Grupo",
      tipo: "Projeto",
      prazo: "25/03/2024",
      entregues: 12,
      total: 28,
      status: "Ativa",
    },
  ]

  const materiais = [
    { id: 1, nome: "Apostila - Funções Quadráticas", tipo: "PDF", data: "10/03/2024" },
    { id: 2, nome: "Lista de Exercícios 03", tipo: "PDF", data: "08/03/2024" },
    { id: 3, nome: "Vídeo Aula - Sistemas Lineares", tipo: "MP4", data: "05/03/2024" },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Link href="/dashboard/professor/turmas">
              <LiquidGlassButton variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </LiquidGlassButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{turma.nome}</h1>
              <p className="text-muted-foreground">
                {turma.disciplina} • {turma.alunos} alunos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <LiquidGlassCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média da Turma</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{turma.mediaGeral}</div>
                <p className="text-xs text-muted-foreground">+0.3 desde o último bimestre</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{turma.frequenciaMedia}%</div>
                <p className="text-xs text-muted-foreground">Acima da média escolar</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atividades Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">2</div>
                <p className="text-xs text-muted-foreground">Para correção</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <Tabs defaultValue="alunos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="alunos">Alunos</TabsTrigger>
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
              <TabsTrigger value="materiais">Materiais</TabsTrigger>
              <TabsTrigger value="notas">Lançar Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="alunos">
              <LiquidGlassCard>
                <CardHeader>
                  <CardTitle>Lista de Alunos</CardTitle>
                  <CardDescription>Desempenho individual dos alunos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alunos.map((aluno) => (
                      <div key={aluno.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{aluno.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            Média: {aluno.media} • Frequência: {aluno.frequencia}%
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              aluno.situacao === "Aprovado"
                                ? "default"
                                : aluno.situacao === "Recuperação"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {aluno.situacao}
                          </Badge>
                          <LiquidGlassButton size="sm" variant="outline">
                            Ver Detalhes
                          </LiquidGlassButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>

            <TabsContent value="atividades">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Atividades da Turma</h3>
                  <LiquidGlassButton>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Atividade
                  </LiquidGlassButton>
                </div>

                {atividades.map((atividade) => (
                  <LiquidGlassCard key={atividade.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{atividade.titulo}</CardTitle>
                          <CardDescription>
                            {atividade.tipo} • Prazo: {atividade.prazo}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={atividade.status === "Concluída" ? "default" : "secondary"}>
                            {atividade.status}
                          </Badge>
                          <LiquidGlassButton size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Entregues: {atividade.entregues}/{atividade.total}
                        </p>
                        <LiquidGlassButton size="sm">Ver Entregas</LiquidGlassButton>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="materiais">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Materiais da Disciplina</h3>
                  <LiquidGlassButton>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Material
                  </LiquidGlassButton>
                </div>

                {materiais.map((material) => (
                  <LiquidGlassCard key={material.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-medium">{material.nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              {material.tipo} • {material.data}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <LiquidGlassButton size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notas">
              <LiquidGlassCard>
                <CardHeader>
                  <CardTitle>Lançamento de Notas</CardTitle>
                  <CardDescription>Registre as notas dos alunos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="avaliacao">Tipo de Avaliação</Label>
                        <Input id="avaliacao" placeholder="Ex: Prova Bimestral" />
                      </div>
                      <div>
                        <Label htmlFor="peso">Peso</Label>
                        <Input id="peso" type="number" placeholder="Ex: 4.0" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea id="descricao" placeholder="Descrição da avaliação..." />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Notas dos Alunos</h4>
                      {alunos.slice(0, 5).map((aluno) => (
                        <div key={aluno.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="font-medium">{aluno.nome}</span>
                          <Input type="number" placeholder="0.0" className="w-20" min="0" max="10" step="0.1" />
                        </div>
                      ))}
                    </div>

                    <LiquidGlassButton className="w-full">Salvar Notas</LiquidGlassButton>
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
