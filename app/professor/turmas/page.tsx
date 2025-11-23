"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, BookOpen, FileText, CheckCircle, Calendar, TrendingUp, Clock, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { FrequencyModal } from "@/components/modals"
import { getTurmasProfessor, Turma, Aluno, Aula } from "@/src/services/ProfessorTurmasService"
import { lancarFrequencia } from "@/src/services/ProfessorFrequenciaService"
import { toastSuccess, toastError } from "@/components/ui/toast"
import { getCurrentUser, getSemestresDisponiveisProfessor } from "@/src/services/professor-dashboard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap } from "lucide-react"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfessorTurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAulas, setSelectedAulas] = useState<Aula[]>([])
  const [frequenciaData, setFrequenciaData] = useState<Record<string, Record<string, boolean>>>({})
  const [saving, setSaving] = useState(false)
  const [isRetificacao, setIsRetificacao] = useState(false)
  const [semestreSelecionado, setSemestreSelecionado] = useState<string>("")
  const [semestres, setSemestres] = useState<Array<{ id: string; nome: string; ativo: boolean }>>([])
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingSemestres, setLoadingSemestres] = useState(false)
  const [loadingTurmas, setLoadingTurmas] = useState(false)

  // Buscar usuário atual
  useEffect(() => {
    const init = async () => {
      try {
        setLoadingUser(true)
        const user = await getCurrentUser()
        if (user?.id) {
          setTeacherId(user.id)
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
      } finally {
        setLoadingUser(false)
      }
    }
    init()
  }, [])

  // Buscar semestres disponíveis
  useEffect(() => {
    const buscarSemestres = async () => {
      if (!teacherId) return
      try {
        setLoadingSemestres(true)
        const semestresDisponiveis = await getSemestresDisponiveisProfessor(teacherId)
        setSemestres(semestresDisponiveis)
        
        // Selecionar semestre ativo ou o primeiro disponível
        const semestreAtivo = semestresDisponiveis.find(s => s.ativo)
        if (semestreAtivo) {
          setSemestreSelecionado(semestreAtivo.id)
        } else if (semestresDisponiveis.length > 0) {
          setSemestreSelecionado(semestresDisponiveis[0].id)
        }
      } catch (error) {
        console.error("Erro ao buscar semestres:", error)
      } finally {
        setLoadingSemestres(false)
      }
    }
    buscarSemestres()
  }, [teacherId])

  // Buscar turmas do professor ao carregar
  useEffect(() => {
    const loadTurmas = async () => {
      if (!teacherId) return
      try {
        setLoadingTurmas(true)
        const turmasData = await getTurmasProfessor(teacherId)
        setTurmas(turmasData)
      } catch (error) {
        console.error('Erro ao carregar turmas:', error)
      } finally {
        setLoadingTurmas(false)
      }
    }

    loadTurmas()
  }, [teacherId])

  // Controlar loading geral - só desativa quando tudo estiver carregado
  useEffect(() => {
    // Só desativa loading quando:
    // 1. Usuário foi carregado (ou falhou)
    // 2. Semestres foram carregados (ou não há teacherId ainda)
    // 3. Turmas foram carregadas (ou não há teacherId ainda)
    // 4. Se há teacherId, espera que semestres e turmas estejam prontos
    const tudoCarregado = !loadingUser && 
      (!teacherId || (!loadingSemestres && !loadingTurmas))
    
    if (tudoCarregado) {
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [loadingUser, loadingSemestres, loadingTurmas, teacherId])

  // Filtrar turmas por semestre
  const turmasFiltradas = useMemo(() => {
    if (!semestreSelecionado) return turmas
    return turmas.filter(turma => {
      const periodo = turma.semestre
      // Normalizar formato de semestre (2025.1 ou 2025-1)
      const periodoNormalizado = periodo?.replace('-', '.')
      const semestreNormalizado = semestreSelecionado.replace('-', '.')
      return periodoNormalizado === semestreNormalizado
    })
  }, [turmas, semestreSelecionado])

  // Recalcular estatísticas baseadas nas turmas filtradas
  const estatisticas = useMemo(() => {
    const totalAlunos = turmasFiltradas.reduce((acc, turma) => acc + turma.alunos, 0)
    const mediaGeral = turmasFiltradas.length > 0
      ? turmasFiltradas.reduce((acc, turma) => acc + turma.mediaGeral, 0) / turmasFiltradas.length
      : 0
    const atividadesPendentes = turmasFiltradas.reduce((acc, turma) => acc + turma.atividades, 0)
    return { totalAlunos, mediaGeral, atividadesPendentes }
  }, [turmasFiltradas])

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
    setIsRetificacao(false) // É um lançamento novo

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
    setIsRetificacao(true) // É uma retificação

    // Carregar dados existentes do banco
    // Como a frequência é armazenada por data, todas as aulas do mesmo dia compartilham os mesmos dados
    const initialData: Record<string, Record<string, boolean>> = {}
    
    turma.listaAlunos.forEach(aluno => {
      initialData[aluno.id] = {}
      aulasDoDia.forEach(aula => {
        // Verificar se o aluno está na lista de presentes desta aula
        // Se não tiver alunosPresentes na aula específica, verificar em qualquer aula do dia
        let isPresente = false
        if (aula.alunosPresentes && aula.alunosPresentes.length > 0) {
          isPresente = aula.alunosPresentes.includes(aluno.id)
        } else {
          // Fallback: verificar em todas as aulas do dia
          const aulaComDados = aulasDoDia.find(a => a.alunosPresentes && a.alunosPresentes.length > 0)
          if (aulaComDados) {
            isPresente = aulaComDados.alunosPresentes.includes(aluno.id)
          }
        }
        initialData[aluno.id][aula.id] = isPresente
      })
    })
    
    console.log('Dados de frequência carregados:', initialData)
    console.log('Aulas do dia:', aulasDoDia.map(a => ({ id: a.id, alunosPresentes: a.alunosPresentes })))
    
    setFrequenciaData(initialData)
    setIsModalOpen(true)
  }

  const handleSaveFrequencia = async () => {
    if (!selectedTurma || selectedAulas.length === 0) return

    try {
      setSaving(true)
      
      // Buscar enrollments dos alunos
      const enrollmentsMap = new Map<string, string>() // studentId -> enrollmentId
      
      // Preparar dados para envio
      const frequencias: Array<{
        enrollment_id: string
        student_id: string
        date: string
        present: boolean
      }> = []

      // Para cada aluno e cada aula, criar registro de frequência
      selectedTurma.listaAlunos.forEach(aluno => {
        selectedAulas.forEach(aula => {
          const presente = frequenciaData[aluno.id]?.[aula.id] || false
          const dateStr = aula.data.toISOString().split('T')[0] // YYYY-MM-DD
          
          frequencias.push({
            enrollment_id: aluno.enrollmentId,
            student_id: aluno.id,
            date: dateStr,
            present: presente,
          })
        })
      })

      await lancarFrequencia(frequencias)
      
      // Recarregar turmas para atualizar dados
      if (teacherId) {
        const turmasData = await getTurmasProfessor(teacherId)
        setTurmas(turmasData)
      }
      
      // Mostrar toast de sucesso
      const totalAlunos = selectedTurma.listaAlunos.length
      const totalAulas = selectedAulas.length
      const dataFormatada = selectedAulas[0]?.data.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
      })
      
      if (isRetificacao) {
        toastSuccess(
          'Frequência retificada com sucesso!',
          `A frequência de ${totalAlunos} aluno(s) para ${totalAulas} aula(s) do dia ${dataFormatada} foi atualizada.`
        )
      } else {
        toastSuccess(
          'Frequência lançada com sucesso!',
          `A frequência de ${totalAlunos} aluno(s) para ${totalAulas} aula(s) do dia ${dataFormatada} foi registrada.`
        )
      }
      
      setIsModalOpen(false)
    } catch (error: any) {
      console.error('Erro ao salvar frequência:', error)
      
      // Mostrar toast de erro
      const mensagemErro = error?.response?.data?.message || error?.message || 'Erro desconhecido'
      toastError(
        'Erro ao salvar frequência',
        isRetificacao 
          ? `Não foi possível retificar a frequência. ${mensagemErro}`
          : `Não foi possível lançar a frequência. ${mensagemErro}`
      )
    } finally {
      setSaving(false)
    }
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
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                {loadingSemestres || semestres.length === 0 ? (
                  <Skeleton className="h-10 w-40" />
                ) : (
                  <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Selecionar semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      {semestres.map((semestre) => (
                        <SelectItem key={semestre.id} value={semestre.id}>
                          <div className="flex items-center space-x-2">
                            <span>{semestre.nome}</span>
                            {semestre.ativo && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs">
                                Atual
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
          </div>

          {loading ? (
            <div className="space-y-6">
              {/* Skeleton do Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                  <Skeleton className="h-9 w-64" />
                  <Skeleton className="h-5 w-96" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-10 w-40" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-40" />
                  </div>
                </div>
              </div>

              {/* Skeleton das Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[1, 2, 3].map((i) => (
                  <LiquidGlassCard key={i} intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>

              {/* Skeleton das Turmas */}
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-border/50 px-6 py-5 bg-gray-50/60 dark:bg-gray-800/40">
                    <div className="flex items-center justify-between gap-6">
                      <Skeleton className="w-14 h-14 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-center space-y-1">
                          <Skeleton className="h-5 w-8" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="text-center space-y-1">
                          <Skeleton className="h-5 w-8" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
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
                    <div className="text-2xl font-bold text-primary">
                      {estatisticas.totalAlunos}
                    </div>
                    <p className="text-xs text-muted-foreground">Distribuídos em {turmasFiltradas.length} turmas</p>
                  </CardContent>
                </LiquidGlassCard>

                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {estatisticas.mediaGeral.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">Média de todas as turmas</p>
                  </CardContent>
                </LiquidGlassCard>

                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Atividades Pendentes</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      {estatisticas.atividadesPendentes}
                    </div>
                    <p className="text-xs text-muted-foreground">Para correção</p>
                  </CardContent>
                </LiquidGlassCard>
              </div>

              <div className="space-y-3">
                {turmasFiltradas.map((turma) => (
                  <Link 
                    key={turma.id} 
                    href={`/professor/turmas/${turma.id}`}
                    className="block group"
                  >
                    <div className="transition-all duration-300 rounded-xl border border-border/50 px-6 py-5 hover:shadow-lg bg-gray-50/60 dark:bg-gray-800/40 hover:bg-gray-50/80 dark:hover:bg-gray-800/60">
                      <div className="flex items-center justify-between gap-6">
                        {/* Ícone */}
                        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center group-hover:bg-primary/90 transition-colors flex-shrink-0">
                          <BookOpen className="h-7 w-7 text-white" />
                        </div>

                        {/* Informações da Turma */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                              {turma.nome}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {turma.alunos} alunos
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            {turma.disciplina}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{turma.proximaAula}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>Sala {turma.sala}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Média: <strong>{turma.mediaGeral}</strong></span>
                              <span>•</span>
                              <span>Freq: <strong>{turma.frequenciaMedia}%</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground min-w-0 flex-shrink-0">
                          <div className="text-center">
                            <div className="font-semibold text-foreground">{turma.atividades}</div>
                            <div className="text-xs">Atividades</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-foreground">{turma.avaliacoes}</div>
                            <div className="text-xs">Avaliações</div>
                          </div>
                        </div>

                        {/* Indicador de ação */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                          <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="frequencia" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Lançar Frequência</h2>
                <p className="text-muted-foreground">Gerencie a presença dos alunos em cada aula</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {turmasFiltradas.map((turma) => (
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
          )}

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
