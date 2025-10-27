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
  aulaIndex?: number // Para ordenar temporalmente as aulas do mesmo dia
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

interface Aluno {
  id: string
  nome: string
  matricula: string
}

export default function ProfessorTurmasPage() {
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAulas, setSelectedAulas] = useState<Aula[]>([])
  const [frequenciaData, setFrequenciaData] = useState<Record<string, Record<string, boolean>>>({})

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
        { id: "1", nome: "Ana Silva", matricula: "231550652" },
        { id: "2", nome: "Bruno Costa", matricula: "231550653" },
        { id: "3", nome: "Carla Santos", matricula: "231550654" },
        { id: "4", nome: "Daniel Oliveira", matricula: "231550655" },
        { id: "5", nome: "Elisa Pereira", matricula: "231550656" },
        { id: "6", nome: "Felipe Rodrigues", matricula: "231550657" },
        { id: "7", nome: "Gabriela Lima", matricula: "231550658" },
        { id: "8", nome: "Henrique Alves", matricula: "231550659" },
        { id: "9", nome: "Isabela Cruz", matricula: "231550660" },
        { id: "10", nome: "João Mendes", matricula: "231550661" },
        { id: "11", nome: "Karina Dias", matricula: "231550662" },
        { id: "12", nome: "Lucas Ferreira", matricula: "231550663" },
        { id: "13", nome: "Mariana Gomes", matricula: "231550664" },
        { id: "14", nome: "Nathan Cardoso", matricula: "231550665" },
        { id: "15", nome: "Olivia Barbosa", matricula: "231550666" },
        { id: "16", nome: "Pedro Castro", matricula: "231550667" },
        { id: "17", nome: "Quintino Azevedo", matricula: "231550668" },
        { id: "18", nome: "Rafaela Borges", matricula: "231550669" },
        { id: "19", nome: "Santiago Campos", matricula: "231550670" },
        { id: "20", nome: "Tatiana Diniz", matricula: "231550671" },
        { id: "21", nome: "Ulisses Evaristo", matricula: "231550672" },
        { id: "22", nome: "Vanessa Freitas", matricula: "231550673" },
        { id: "23", nome: "Wesley Garcia", matricula: "231550674" },
        { id: "24", nome: "Ximena Herrera", matricula: "231550675" },
        { id: "25", nome: "Yasmin Ignacio", matricula: "231550676" },
        { id: "26", nome: "Zeca Joaquim", matricula: "231550677" },
        { id: "27", nome: "Amanda Keli", matricula: "231550678" },
        { id: "28", nome: "Bernardo Lopes", matricula: "231550679" },
      ],
      aulas: [
        {
          id: "1",
          data: new Date(),
          horario: "08:00 - 09:40",
          sala: "A-101",
          status: 'agendada',
          aulaIndex: 0,
        },
        {
          id: "2",
          data: new Date(), // Mesmo dia
          horario: "10:00 - 11:40",
          sala: "A-101",
          status: 'agendada',
          aulaIndex: 1,
        },
        {
          id: "3",
          data: new Date(), // Mesmo dia
          horario: "14:00 - 15:40",
          sala: "A-101",
          status: 'agendada',
          aulaIndex: 2,
        },
        {
          id: "4",
          data: new Date(Date.now() + 24 * 60 * 60 * 1000), // amanhã
          horario: "08:00 - 09:40",
          sala: "A-101",
          status: 'agendada',
          aulaIndex: 0,
        },
        {
          id: "5",
          data: new Date(Date.now() - 24 * 60 * 60 * 1000), // ontem
          horario: "08:00 - 09:40",
          sala: "A-101",
          status: 'lancada',
          alunosPresentes: ["1", "2", "3"],
          dataLancamento: new Date(Date.now() - 24 * 60 * 60 * 1000),
          aulaIndex: 0,
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
        { id: "29", nome: "Daniel Oliveira", matricula: "231550680" },
        { id: "30", nome: "Elisa Pereira", matricula: "231550681" },
        { id: "31", nome: "Fernando Quintas", matricula: "231550682" },
        { id: "32", nome: "Gabriela Torres", matricula: "231550683" },
        { id: "33", nome: "Hugo Uchoa", matricula: "231550684" },
        { id: "34", nome: "Iris Vasconcelos", matricula: "231550685" },
        { id: "35", nome: "Júlio Wagner", matricula: "231550686" },
        { id: "36", nome: "Kátia Xavier", matricula: "231550687" },
        { id: "37", nome: "Leonardo Yamasaki", matricula: "231550688" },
        { id: "38", nome: "Mônica Zancanela", matricula: "231550689" },
        { id: "39", nome: "Nícolas Alves", matricula: "231550690" },
        { id: "40", nome: "Otávio Borges", matricula: "231550691" },
        { id: "41", nome: "Patrícia Castro", matricula: "231550692" },
        { id: "42", nome: "Quésia Dias", matricula: "231550693" },
        { id: "43", nome: "Roberto Elias", matricula: "231550694" },
        { id: "44", nome: "Sônia Freitas", matricula: "231550695" },
        { id: "45", nome: "Tiago Garcia", matricula: "231550696" },
        { id: "46", nome: "Ursula Herrera", matricula: "231550697" },
        { id: "47", nome: "Victor Ignacio", matricula: "231550698" },
        { id: "48", nome: "Wanda Joaquim", matricula: "231550699" },
        { id: "49", nome: "Xuxa Keli", matricula: "231550700" },
        { id: "50", nome: "Yuri Lopes", matricula: "231550701" },
        { id: "51", nome: "Zara Mendes", matricula: "231550702" },
        { id: "52", nome: "André Nogueira", matricula: "231550703" },
        { id: "53", nome: "Bruna Oliveira", matricula: "231550704" },
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
        { id: "54", nome: "Felipe Rodrigues", matricula: "231550705" },
        { id: "55", nome: "Gabriela Lima", matricula: "231550706" },
        { id: "56", nome: "Heitor Moreira", matricula: "231550707" },
        { id: "57", nome: "Ivana Nunes", matricula: "231550708" },
        { id: "58", nome: "Jorge Oliveira", matricula: "231550709" },
        { id: "59", nome: "Kelly Pinto", matricula: "231550710" },
        { id: "60", nome: "Luiz Queiroz", matricula: "231550711" },
        { id: "61", nome: "Marta Ribeiro", matricula: "231550712" },
        { id: "62", nome: "Nelson Santos", matricula: "231550713" },
        { id: "63", nome: "Ornela Tavares", matricula: "231550714" },
        { id: "64", nome: "Paulo Uchôa", matricula: "231550715" },
        { id: "65", nome: "Quezia Vargas", matricula: "231550716" },
        { id: "66", nome: "Rafael Williams", matricula: "231550717" },
        { id: "67", nome: "Sueli Xavier", matricula: "231550718" },
        { id: "68", nome: "Túlio Yamasaki", matricula: "231550719" },
        { id: "69", nome: "Umbelina Zancanela", matricula: "231550720" },
        { id: "70", nome: "Vinícius Alves", matricula: "231550721" },
        { id: "71", nome: "Wellington Borges", matricula: "231550722" },
        { id: "72", nome: "Xênia Castro", matricula: "231550723" },
        { id: "73", nome: "Yago Dias", matricula: "231550724" },
        { id: "74", nome: "Zilda Elias", matricula: "231550725" },
        { id: "75", nome: "Antônio Freitas", matricula: "231550726" },
        { id: "76", nome: "Beatriz Garcia", matricula: "231550727" },
        { id: "77", nome: "Caio Herrera", matricula: "231550728" },
        { id: "78", nome: "Débora Ignacio", matricula: "231550729" },
        { id: "79", nome: "Eduardo Joaquim", matricula: "231550730" },
        { id: "80", nome: "Fábia Keli", matricula: "231550731" },
        { id: "81", nome: "Gustavo Lopes", matricula: "231550732" },
        { id: "82", nome: "Helena Mendes", matricula: "231550733" },
        { id: "83", nome: "Ícaro Nogueira", matricula: "231550734" },
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

  // Função para agrupar aulas do mesmo dia
  const getAulasDoMesmoDia = (turma: Turma, aula: Aula): Aula[] => {
    return turma.aulas
      .filter(a => a.data.toDateString() === aula.data.toDateString())
      .sort((a, b) => (a.aulaIndex ?? 0) - (b.aulaIndex ?? 0))
  }

  // Função para agrupar aulas por data
  const groupAulasByDate = (aulas: Aula[]) => {
    const grouped = aulas.reduce((acc, aula) => {
      const dateKey = aula.data.toDateString()
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(aula)
      return acc
    }, {} as Record<string, Aula[]>)

    // Ordenar aulas dentro de cada data por aulaIndex
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => (a.aulaIndex ?? 0) - (b.aulaIndex ?? 0))
    })

    return grouped
  }

  const handleLancarFrequencia = (turma: Turma, aula: Aula) => {
    const aulasDoDia = getAulasDoMesmoDia(turma, aula)
    setSelectedTurma(turma)
    setSelectedAulas(aulasDoDia)

    // Inicializar todos os alunos como ausentes em todas as aulas
    const initialData: Record<string, Record<string, boolean>> = {}
    turma.listaAlunos.forEach(aluno => {
      initialData[aluno.id] = {}
      aulasDoDia.forEach(aula => {
        initialData[aluno.id][aula.id] = false
      })
    })
    setFrequenciaData(initialData)
    setIsModalOpen(true)
  }

  const handleRetificarFrequencia = (turma: Turma, aula: Aula) => {
    const aulasDoDia = getAulasDoMesmoDia(turma, aula)
    setSelectedTurma(turma)
    setSelectedAulas(aulasDoDia)

    // Carregar dados existentes ou marcar todos como ausentes
    const initialData: Record<string, Record<string, boolean>> = {}
    turma.listaAlunos.forEach(aluno => {
      initialData[aluno.id] = {}
      aulasDoDia.forEach(aula => {
        const isPresente = aula.alunosPresentes?.includes(aluno.id) || false
        initialData[aluno.id][aula.id] = isPresente
      })
    })
    setFrequenciaData(initialData)
    setIsModalOpen(true)
  }

  const handleSaveFrequencia = () => {
    // Aqui seria implementada a lógica para salvar no backend
    console.log('Salvando frequência:', frequenciaData)
    setIsModalOpen(false)
  }

  const handleFrequenciaChange = (alunoId: string, aulaId: string, presente: boolean) => {
    setFrequenciaData(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        [aulaId]: presente
      }
    }))
  }

  const handleMarkAll = (presente: boolean) => {
    if (selectedTurma && selectedAulas.length > 0) {
      const newData: Record<string, Record<string, boolean>> = {}
      selectedTurma.listaAlunos.forEach(aluno => {
        newData[aluno.id] = {}
        selectedAulas.forEach(aula => {
          newData[aluno.id][aula.id] = presente
        })
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
                        {Object.entries(groupAulasByDate(turma.aulas)).map(([dateKey, aulasDoDia]) => {
                          const temAulaHoje = aulasDoDia.some(aula => isToday(aula.data))
                          const todasLancadas = aulasDoDia.every(aula => aula.status === 'lancada')
                          const temLancadas = aulasDoDia.some(aula => aula.status === 'lancada' || aula.status === 'retificada')
                          
                          return (
                            <div key={dateKey} className="border border-border/50 rounded-lg p-4 space-y-3 bg-muted/20">
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-semibold text-foreground">
                                  {aulasDoDia[0].data.toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    day: '2-digit',
                                    month: 'long'
                                  })}
                                </div>
                                <Badge
                                  variant={todasLancadas ? 'default' : 'outline'}
                                  className={todasLancadas ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {todasLancadas ? 'Lançada' : 'Agendada'}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Horários:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {aulasDoDia.map((aula, index) => (
                                    <div key={aula.id} className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">{aula.horario}</span>
                                      {index < aulasDoDia.length - 1 && (
                                        <span className="text-xs text-muted-foreground">•</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {temAulaHoje && !todasLancadas && (
                                  <LiquidGlassButton
                                    className="flex-1"
                                    size="sm"
                                    onClick={() => handleLancarFrequencia(turma, aulasDoDia[0])}
                                  >
                                    Lançar Frequência
                                  </LiquidGlassButton>
                                )}

                                {temLancadas && (
                                  <LiquidGlassButton
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleRetificarFrequencia(turma, aulasDoDia[0])}
                                  >
                                    Retificar
                                  </LiquidGlassButton>
                                )}
                              </div>
                            </div>
                          )
                        })}
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
            aulas={selectedAulas}
            frequenciaData={frequenciaData}
            onFrequenciaChange={handleFrequenciaChange}
            onMarkAll={handleMarkAll}
            onSave={handleSaveFrequencia}
          />
        </div>
      </main>
    </div>
  )
}
