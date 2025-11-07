"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowLeft, Users, GraduationCap, Clock, Edit, Plus, Search, Trash2 } from "lucide-react"

type Disciplina = {
  id: string
  nome: string
  codigo: string
  cargaHoraria: number
  creditos: number
  semestre: number
  tipo: "obrigatoria" | "optativa"
  professor?: string
  status: "ativa" | "inativa"
}

type Turma = {
  id: string
  codigo: string
  disciplina: string
  professor: string
  periodo: string
  horario: string
  sala: string
  alunos: number
  capacidade: number
  status: "ativa" | "inativa"
}

type Curso = {
  id: string
  nome: string
  codigo: string
  departamento: string
  cargaHoraria: number
  duracao: number
  status: "ativo" | "inativo"
  alunos: number
  professores: number
  turmas: number
  descricao?: string
}

const cursosMock: Curso[] = [
  {
    id: "1",
    nome: "Sistemas de Informação",
    codigo: "SI",
    departamento: "Sistemas de Informação",
    cargaHoraria: 3200,
    duracao: 8,
    status: "ativo",
    alunos: 120,
    professores: 15,
    turmas: 8,
    descricao: "Curso de graduação em Sistemas de Informação"
  },
  {
    id: "2",
    nome: "Análise e Desenvolvimento de Sistemas",
    codigo: "ADS",
    departamento: "Sistemas de Informação",
    cargaHoraria: 2400,
    duracao: 6,
    status: "ativo",
    alunos: 95,
    professores: 12,
    turmas: 6,
    descricao: "Curso tecnológico em Análise e Desenvolvimento de Sistemas"
  },
  {
    id: "3",
    nome: "Engenharia de Software",
    codigo: "ES",
    departamento: "Sistemas de Informação",
    cargaHoraria: 3600,
    duracao: 10,
    status: "ativo",
    alunos: 80,
    professores: 10,
    turmas: 5,
    descricao: "Curso de graduação em Engenharia de Software"
  }
]

const disciplinasMock: Record<string, Disciplina[]> = {
  "1": [
    {
      id: "d1",
      nome: "Algoritmos e Estruturas de Dados",
      codigo: "SI-101",
      cargaHoraria: 80,
      creditos: 4,
      semestre: 1,
      tipo: "obrigatoria",
      professor: "Prof. João Silva",
      status: "ativa"
    },
    {
      id: "d2",
      nome: "Banco de Dados I",
      codigo: "SI-102",
      cargaHoraria: 80,
      creditos: 4,
      semestre: 2,
      tipo: "obrigatoria",
      professor: "Prof. Maria Santos",
      status: "ativa"
    },
    {
      id: "d3",
      nome: "Programação Orientada a Objetos",
      codigo: "SI-103",
      cargaHoraria: 80,
      creditos: 4,
      semestre: 2,
      tipo: "obrigatoria",
      professor: "Prof. Carlos Oliveira",
      status: "ativa"
    },
    {
      id: "d4",
      nome: "Redes de Computadores",
      codigo: "SI-201",
      cargaHoraria: 60,
      creditos: 3,
      semestre: 3,
      tipo: "obrigatoria",
      professor: "Prof. Ana Costa",
      status: "ativa"
    },
    {
      id: "d5",
      nome: "Inteligência Artificial",
      codigo: "SI-301",
      cargaHoraria: 60,
      creditos: 3,
      semestre: 5,
      tipo: "optativa",
      status: "ativa"
    }
  ],
  "2": [
    {
      id: "d6",
      nome: "Fundamentos de Programação",
      codigo: "ADS-101",
      cargaHoraria: 80,
      creditos: 4,
      semestre: 1,
      tipo: "obrigatoria",
      professor: "Prof. Pedro Alves",
      status: "ativa"
    },
    {
      id: "d7",
      nome: "Desenvolvimento Web",
      codigo: "ADS-201",
      cargaHoraria: 80,
      creditos: 4,
      semestre: 2,
      tipo: "obrigatoria",
      professor: "Prof. Juliana Lima",
      status: "ativa"
    }
  ],
  "3": [
    {
      id: "d8",
      nome: "Engenharia de Requisitos",
      codigo: "ES-101",
      cargaHoraria: 60,
      creditos: 3,
      semestre: 1,
      tipo: "obrigatoria",
      professor: "Prof. Roberto Mendes",
      status: "ativa"
    },
    {
      id: "d9",
      nome: "Arquitetura de Software",
      codigo: "ES-201",
      cargaHoraria: 80,
      creditos: 4,
      semestre: 3,
      tipo: "obrigatoria",
      professor: "Prof. Fernanda Rocha",
      status: "ativa"
    }
  ]
}

const turmasMock: Record<string, Turma[]> = {
  "1": [
    {
      id: "t1",
      codigo: "SI-101-A",
      disciplina: "Algoritmos e Estruturas de Dados",
      professor: "Prof. João Silva",
      periodo: "2024.1",
      horario: "08:00 - 10:00",
      sala: "Lab 1",
      alunos: 30,
      capacidade: 35,
      status: "ativa"
    },
    {
      id: "t2",
      codigo: "SI-102-A",
      disciplina: "Banco de Dados I",
      professor: "Prof. Maria Santos",
      periodo: "2024.1",
      horario: "10:00 - 12:00",
      sala: "Sala 201",
      alunos: 28,
      capacidade: 35,
      status: "ativa"
    },
    {
      id: "t3",
      codigo: "SI-103-A",
      disciplina: "Programação Orientada a Objetos",
      professor: "Prof. Carlos Oliveira",
      periodo: "2024.1",
      horario: "14:00 - 16:00",
      sala: "Lab 2",
      alunos: 32,
      capacidade: 35,
      status: "ativa"
    }
  ],
  "2": [
    {
      id: "t4",
      codigo: "ADS-101-A",
      disciplina: "Fundamentos de Programação",
      professor: "Prof. Pedro Alves",
      periodo: "2024.1",
      horario: "19:00 - 21:00",
      sala: "Lab 3",
      alunos: 25,
      capacidade: 30,
      status: "ativa"
    }
  ],
  "3": [
    {
      id: "t5",
      codigo: "ES-101-A",
      disciplina: "Engenharia de Requisitos",
      professor: "Prof. Roberto Mendes",
      periodo: "2024.1",
      horario: "08:00 - 10:00",
      sala: "Sala 301",
      alunos: 20,
      capacidade: 25,
      status: "ativa"
    }
  ]
}

export default function CursoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const cursoId = params.id as string

  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [searchDisciplinas, setSearchDisciplinas] = useState("")
  const [searchTurmas, setSearchTurmas] = useState("")
  const [filtroTipoDisciplina, setFiltroTipoDisciplina] = useState<"todas" | "obrigatoria" | "optativa">("todas")
  const [filtroStatusTurma, setFiltroStatusTurma] = useState<"todas" | "ativa" | "inativa">("todas")

  useEffect(() => {
    const checkTheme = () => {
      setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })

    return () => observer.disconnect()
  }, [])

  const curso = cursosMock.find(c => c.id === cursoId)
  const disciplinas = disciplinasMock[cursoId] || []
  const turmas = turmasMock[cursoId] || []

  if (!curso) {
    return (
      <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
        <Sidebar userRole="coordenador" />
        <main className="flex-1 overflow-y-auto p-8">
          <LiquidGlassCard
            intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
            className={`text-center py-12 ${
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20'
                : 'bg-gray-50/60 dark:bg-gray-800/40'
            }`}
          >
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">Curso não encontrado</p>
            <LiquidGlassButton variant="outline" onClick={() => router.push("/coordenador/cursos")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Cursos
            </LiquidGlassButton>
          </LiquidGlassCard>
        </main>
      </div>
    )
  }

  const disciplinasFiltradas = disciplinas.filter(d => {
    const matchesSearch = d.nome.toLowerCase().includes(searchDisciplinas.toLowerCase()) ||
      d.codigo.toLowerCase().includes(searchDisciplinas.toLowerCase())
    const matchesTipo = filtroTipoDisciplina === "todas" || d.tipo === filtroTipoDisciplina
    return matchesSearch && matchesTipo
  })

  const turmasFiltradas = turmas.filter(t => {
    const matchesSearch = t.disciplina.toLowerCase().includes(searchTurmas.toLowerCase()) ||
      t.codigo.toLowerCase().includes(searchTurmas.toLowerCase()) ||
      t.professor.toLowerCase().includes(searchTurmas.toLowerCase())
    const matchesStatus = filtroStatusTurma === "todas" || t.status === filtroStatusTurma
    return matchesSearch && matchesStatus
  })

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="coordenador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className={`flex items-center justify-between mb-8 p-6 rounded-2xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-4">
              <LiquidGlassButton
                variant="outline"
                size="sm"
                onClick={() => router.push("/coordenador/cursos")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </LiquidGlassButton>
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  {curso.nome}
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  {curso.codigo} • {curso.departamento}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={curso.status === "ativo" ? "default" : "secondary"}>
                    {curso.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline">{curso.cargaHoraria}h</Badge>
                  <Badge variant="outline">{curso.duracao} semestres</Badge>
                </div>
              </div>
            </div>
            <LiquidGlassButton variant="outline" size="lg">
              <Edit className="h-5 w-5 mr-2" />
              Editar Curso
            </LiquidGlassButton>
          </div>

          {curso.descricao && (
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`mb-6 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardContent className="pt-6">
                <p className="text-muted-foreground">{curso.descricao}</p>
              </CardContent>
            </LiquidGlassCard>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold">Alunos</CardTitle>
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {curso.alunos}
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold">Professores</CardTitle>
                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {curso.professores}
                </div>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold">Turmas</CardTitle>
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {curso.turmas}
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <Tabs defaultValue="disciplinas" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="disciplinas">Disciplinas</TabsTrigger>
              <TabsTrigger value="turmas">Turmas</TabsTrigger>
            </TabsList>

            <TabsContent value="disciplinas" className="space-y-6">
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Disciplinas</CardTitle>
                      <CardDescription>
                        {disciplinasFiltradas.length} disciplina{disciplinasFiltradas.length !== 1 ? 's' : ''} encontrada{disciplinasFiltradas.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <LiquidGlassButton size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Disciplina
                    </LiquidGlassButton>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Buscar disciplinas..."
                        value={searchDisciplinas}
                        onChange={(e) => setSearchDisciplinas(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={filtroTipoDisciplina}
                      onChange={(e) => setFiltroTipoDisciplina(e.target.value as typeof filtroTipoDisciplina)}
                      className="px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="todas">Todas</option>
                      <option value="obrigatoria">Obrigatórias</option>
                      <option value="optativa">Optativas</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    {disciplinasFiltradas.map((disciplina) => (
                      <div
                        key={disciplina.id}
                        className={`p-4 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${
                          isLiquidGlass
                            ? 'border-gray-200/30 dark:border-gray-700/50'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{disciplina.nome}</h4>
                              <Badge variant="outline" className="font-mono text-xs">
                                {disciplina.codigo}
                              </Badge>
                              <Badge variant={disciplina.tipo === "obrigatoria" ? "default" : "secondary"}>
                                {disciplina.tipo === "obrigatoria" ? "Obrigatória" : "Optativa"}
                              </Badge>
                              <Badge variant={disciplina.status === "ativa" ? "default" : "secondary"}>
                                {disciplina.status === "ativa" ? "Ativa" : "Inativa"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-semibold">Semestre:</span> {disciplina.semestre}°
                              </div>
                              <div>
                                <span className="font-semibold">CH:</span> {disciplina.cargaHoraria}h
                              </div>
                              <div>
                                <span className="font-semibold">Créditos:</span> {disciplina.creditos}
                              </div>
                              {disciplina.professor && (
                                <div>
                                  <span className="font-semibold">Professor:</span> {disciplina.professor}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {disciplinasFiltradas.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma disciplina encontrada
                    </div>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>

            <TabsContent value="turmas" className="space-y-6">
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Turmas</CardTitle>
                      <CardDescription>
                        {turmasFiltradas.length} turma{turmasFiltradas.length !== 1 ? 's' : ''} encontrada{turmasFiltradas.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <LiquidGlassButton size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Turma
                    </LiquidGlassButton>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Buscar turmas..."
                        value={searchTurmas}
                        onChange={(e) => setSearchTurmas(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <select
                      value={filtroStatusTurma}
                      onChange={(e) => setFiltroStatusTurma(e.target.value as typeof filtroStatusTurma)}
                      className="px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="todas">Todas</option>
                      <option value="ativa">Ativas</option>
                      <option value="inativa">Inativas</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    {turmasFiltradas.map((turma) => (
                      <div
                        key={turma.id}
                        className={`p-4 border rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${
                          isLiquidGlass
                            ? 'border-gray-200/30 dark:border-gray-700/50'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{turma.disciplina}</h4>
                              <Badge variant="outline" className="font-mono text-xs">
                                {turma.codigo}
                              </Badge>
                              <Badge variant={turma.status === "ativa" ? "default" : "secondary"}>
                                {turma.status === "ativa" ? "Ativa" : "Inativa"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span className="font-semibold">Professor:</span> {turma.professor}
                              </div>
                              <div>
                                <span className="font-semibold">Período:</span> {turma.periodo}
                              </div>
                              <div>
                                <span className="font-semibold">Horário:</span> {turma.horario}
                              </div>
                              <div>
                                <span className="font-semibold">Sala:</span> {turma.sala}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {turma.alunos} / {turma.capacidade} alunos
                              </span>
                              <div className="flex-1 max-w-xs">
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-600"
                                    style={{ width: `${(turma.alunos / turma.capacidade) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {turmasFiltradas.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma turma encontrada
                    </div>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

