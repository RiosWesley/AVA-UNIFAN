"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, BookOpen, FileText, CheckCircle, Calendar, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { FrequencyModal } from "@/components/frequency"

interface Aula {
  id: string
  data: Date
  horario: string
  sala: string
  status: 'agendada' | 'lancada' | 'retificada'
  alunosPresentes?: string[]
  dataLancamento?: Date
}

interface Aluno {
  id: string
  nome: string
  matricula: string
}

interface Turma {
  id: number
  nome: string
  disciplina: string
  alunos: number
  mediaGeral: number
  frequenciaMedia: number
  proximaAula: string
  sala: string
  atividades: number
  avaliacoes: number
  listaAlunos: Aluno[]
  aulas: Aula[]
}

export default function ProfessorTurmasPage() {
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null)
  const [frequenciaData, setFrequenciaData] = useState<Record<string, boolean>>({})

  const turmas: Turma[] = [
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
      listaAlunos: [
        { id: "1", nome: "Ana Silva", matricula: "2024001" },
        { id: "2", nome: "Bruno Costa", matricula: "2024002" },
        { id: "3", nome: "Carla Santos", matricula: "2024003" },
        // ... outros alunos
      ],
      aulas: [
        {
          id: "1",
          data: new Date(),
          horario: "08:00 - 09:40",
          sala: "A-101",
          status: 'agendada',
        },
        {
          id: "2",
          data: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
          horario: "08:00 - 09:40",
          sala: "A-101",
          status: 'agendada',
        },
        {
          id: "3",
          data: new Date(Date.now() - 24 * 60 * 60 * 1000), // ontem
          horario: "08:00 - 09:40",
          sala: "A-101",
          status: 'lancada',
          alunosPresentes: ["1", "2", "3"],
          dataLancamento: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
      ]
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
      listaAlunos: [
        { id: "4", nome: "Daniel Oliveira", matricula: "2024004" },
        { id: "5", nome: "Elisa Pereira", matricula: "2024005" },
        // ... outros alunos
      ],
      aulas: [
        {
          id: "4",
          data: new Date(),
          horario: "10:00 - 11:40",
          sala: "A-102",
          status: 'agendada',
        },
      ]
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
      listaAlunos: [
        { id: "6", nome: "Felipe Rodrigues", matricula: "2024006" },
        { id: "7", nome: "Gabriela Lima", matricula: "2024007" },
        // ... outros alunos
      ],
      aulas: [
        {
          id: "5",
          data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // daqui 2 dias
          horario: "14:00 - 15:40",
          sala: "A-103",
          status: 'agendada',
        },
      ]
    },
  ]

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const handleLancarFrequencia = (turma: Turma, aula: Aula) => {
    setSelectedTurma(turma)
    setSelectedAula(aula)
    // Inicializar todos os alunos como ausentes
    const initialData: Record<string, boolean> = {}
    turma.listaAlunos.forEach(aluno => {
      initialData[aluno.id] = false
    })
    setFrequenciaData(initialData)
    setIsModalOpen(true)
  }

  const handleRetificarFrequencia = (turma: Turma, aula: Aula) => {
    setSelectedTurma(turma)
    setSelectedAula(aula)
    // Carregar dados existentes ou marcar todos como ausentes
    const initialData: Record<string, boolean> = {}
    turma.listaAlunos.forEach(aluno => {
      const isPresente = aula.alunosPresentes?.includes(aluno.id) || false
      initialData[aluno.id] = isPresente
    })
    setFrequenciaData(initialData)
    setIsModalOpen(true)
  }

  const handleSaveFrequencia = () => {
    // Aqui seria implementada a lógica para salvar no backend
    console.log('Salvando frequência:', frequenciaData)
    setIsModalOpen(false)
  }

  const handleMarkAll = (presente: boolean) => {
    if (selectedTurma) {
      const newData: Record<string, boolean> = {}
      selectedTurma.listaAlunos.forEach(aluno => {
        newData[aluno.id] = presente
      })
      setFrequenciaData(newData)
    }
  }

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

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="frequencia">Lançar Frequência</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
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
            </TabsContent>

            <TabsContent value="frequencia" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Lançar Frequência</h2>
                <p className="text-muted-foreground">Gerencie a presença dos alunos em cada aula</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {turmas.map((turma) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={turma.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{turma.nome}</CardTitle>
                          <CardDescription>{turma.disciplina} • {turma.sala}</CardDescription>
                        </div>
                        <Badge variant="outline">{turma.alunos} alunos</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {turma.aulas.map((aula) => (
                          <div key={aula.id} className="border border-border/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{aula.horario}</span>
                              </div>
                              <Badge
                                variant={aula.status === 'lancada' ? 'default' : 'outline'}
                                className={aula.status === 'lancada' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {aula.status === 'lancada' ? 'Lançada' : 'Agendada'}
                              </Badge>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              {aula.data.toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>

                            <div className="flex gap-2">
                              {isToday(aula.data) && aula.status === 'agendada' && (
                                <LiquidGlassButton
                                  className="flex-1"
                                  size="sm"
                                  onClick={() => handleLancarFrequencia(turma, aula)}
                                >
                                  Lançar Frequência
                                </LiquidGlassButton>
                              )}

                              {(aula.status === 'lancada' || aula.status === 'retificada') && (
                                <LiquidGlassButton
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleRetificarFrequencia(turma, aula)}
                                >
                                  Retificar
                                </LiquidGlassButton>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Modal de Frequência */}
          <FrequencyModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            turma={selectedTurma}
            aula={selectedAula}
            frequenciaData={frequenciaData}
            onFrequenciaChange={(alunoId, presente) =>
              setFrequenciaData(prev => ({
                ...prev,
                [alunoId]: presente
              }))
            }
            onMarkAll={handleMarkAll}
            onSave={handleSaveFrequencia}
          />
        </div>
      </main>
    </div>
  )
}
