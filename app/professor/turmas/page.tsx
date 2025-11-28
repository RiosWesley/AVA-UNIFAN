"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Sidebar } from "@/components/layout/sidebar"
import { Users, BookOpen, FileText, CheckCircle, Calendar, TrendingUp, Clock, ChevronRight, ChevronLeft, Loader2, Search, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Input } from "@/components/ui/input"

export default function ProfessorTurmasPage() {
  const router = useRouter()
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
  const [turmaPaginas, setTurmaPaginas] = useState<Record<string, number>>({})
  const [turmaSearchText, setTurmaSearchText] = useState<Record<string, string>>({})
  const [turmaSearchDate, setTurmaSearchDate] = useState<Record<string, string>>({})
  const [turmaStatusFilter, setTurmaStatusFilter] = useState<Record<string, string>>({})

  // Buscar usuário atual
  useEffect(() => {
    const init = async () => {
      try {
        setLoadingUser(true)
        const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
        if (!token) {
          router.push("/")
          return
        }
        const user = await getCurrentUser()
        if (user?.id) {
          setTeacherId(user.id)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        router.push("/")
      } finally {
        setLoadingUser(false)
      }
    }
    init()
  }, [router])

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

  // Inicializar página prioritária para cada turma
  useEffect(() => {
    if (turmasFiltradas.length > 0) {
      const updates: Record<string, number> = {}
      
      turmasFiltradas.forEach((turma) => {
        if (!turmaPaginas[turma.id]) {
          const aulasAgrupadas = groupAulasByDate(turma.aulas)
          const datesEntries = Object.entries(aulasAgrupadas)
          const datasPriorizadas = priorizarDiasParaLancar(datesEntries)
          
          if (datasPriorizadas.length > 0) {
            // Verificar se há dia prioritário (hoje ou próximo)
            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)
            const temDiaPrioritario = datasPriorizadas.some(([dateKey, aulasDoDia]) => {
              const date = new Date(dateKey)
              date.setHours(0, 0, 0, 0)
              const isToday = date.getTime() === hoje.getTime()
              const todasLancadas = aulasDoDia.every(aula => aula.status === 'lancada')
              return (isToday && !todasLancadas) || (!todasLancadas && date >= hoje)
            })
            
            if (temDiaPrioritario) {
              updates[turma.id] = 1
            }
          }
        }
      })
      
      if (Object.keys(updates).length > 0) {
        setTurmaPaginas(prev => ({ ...prev, ...updates }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turmasFiltradas.length])

  const isToday = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateNormalized = new Date(date)
    dateNormalized.setHours(0, 0, 0, 0)
    return dateNormalized.getTime() === today.getTime()
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

  // Função para priorizar dias para lançar frequência
  // Primeiro ordena por status (Não Registrada > Agendada > Concluída)
  // Depois ordena cronologicamente dentro de cada grupo (da atual para frente)
  const priorizarDiasParaLancar = (datesEntries: Array<[string, Aula[]]>): Array<[string, Aula[]]> => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalizar para comparar apenas datas
    
    // Separar por status primeiro
    const naoRegistrada: Array<[string, Aula[]]> = []
    const agendada: Array<[string, Aula[]]> = []
    const concluida: Array<[string, Aula[]]> = []
    
    datesEntries.forEach(([dateKey, aulasDoDia]) => {
      const status = getStatusDaData(dateKey, aulasDoDia)
      
      if (status === 'nao-registrada') {
        naoRegistrada.push([dateKey, aulasDoDia])
      } else if (status === 'agendada') {
        agendada.push([dateKey, aulasDoDia])
      } else if (status === 'concluida') {
        concluida.push([dateKey, aulasDoDia])
      }
    })
    
    // Função para ordenar cronologicamente (da atual para frente)
    const ordenarPorData = (a: [string, Aula[]], b: [string, Aula[]]) => {
      const dateA = new Date(a[0])
      dateA.setHours(0, 0, 0, 0)
      const dateB = new Date(b[0])
      dateB.setHours(0, 0, 0, 0)
      
      // Se uma data é hoje e a outra não, priorizar hoje
      const isAToday = dateA.getTime() === today.getTime()
      const isBToday = dateB.getTime() === today.getTime()
      
      if (isAToday && !isBToday) return -1
      if (!isAToday && isBToday) return 1
      
      // Ordenar cronologicamente (da atual para frente)
      return dateA.getTime() - dateB.getTime()
    }
    
    // Ordenar cada grupo cronologicamente
    naoRegistrada.sort(ordenarPorData)
    agendada.sort(ordenarPorData)
    concluida.sort(ordenarPorData)
    
    // Retornar na ordem de prioridade: Não Registrada > Agendada > Concluída
    return [...naoRegistrada, ...agendada, ...concluida]
  }

  // Função para determinar status de uma data
  const getStatusDaData = (dateKey: string, aulasDoDia: Aula[]): string => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataAula = new Date(dateKey)
    dataAula.setHours(0, 0, 0, 0)
    
    const isDataAnterior = dataAula < hoje
    const todasLancadas = aulasDoDia.every(aula => aula.status === 'lancada' || aula.status === 'retificada')
    
    if (todasLancadas) {
      return 'concluida'
    } else if (isDataAnterior && !todasLancadas) {
      return 'nao-registrada'
    } else {
      return 'agendada'
    }
  }

  // Função para filtrar dias por pesquisa e status
  const filtrarDiasPorPesquisa = (
    datesEntries: Array<[string, Aula[]]>, 
    searchText: string, 
    searchDate: string,
    statusFilter: string = ''
  ): Array<[string, Aula[]]> => {
    let filtered = datesEntries

    // Filtrar por data específica se fornecida
    if (searchDate) {
      const searchDateObj = new Date(searchDate)
      const searchDateStr = searchDateObj.toDateString()
      filtered = filtered.filter(([dateKey]) => dateKey === searchDateStr)
    }

    // Filtrar por texto de pesquisa se fornecido
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim()
      filtered = filtered.filter(([dateKey, aulasDoDia]) => {
        const date = new Date(dateKey)
        const dateFormatted = date.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
        const dateFormattedLower = dateFormatted.toLowerCase()
        
        // Buscar em nome do dia, mês, dia do mês
        return dateFormattedLower.includes(searchLower) || 
               dateKey.includes(searchLower) ||
               dateFormatted.includes(searchLower)
      })
    }

    // Filtrar por status se fornecido (ignorar "all")
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(([dateKey, aulasDoDia]) => {
        const status = getStatusDaData(dateKey, aulasDoDia)
        return status === statusFilter
      })
    }

    return filtered
  }

  // Função para paginar dias
  const paginarDias = (
    datesEntries: Array<[string, Aula[]]>, 
    paginaAtual: number, 
    diasPorPagina: number = 5
  ): { diasPagina: Array<[string, Aula[]]>, totalPaginas: number } => {
    const totalPaginas = Math.ceil(datesEntries.length / diasPorPagina)
    const inicio = (paginaAtual - 1) * diasPorPagina
    const fim = inicio + diasPorPagina
    const diasPagina = datesEntries.slice(inicio, fim)
    
    return { diasPagina, totalPaginas }
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
          if (aulaComDados && aulaComDados.alunosPresentes) {
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
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Minhas Turmas</h1>
              <p className="text-sm md:text-base text-muted-foreground">Gerencie suas turmas e acompanhe o desempenho</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                {loadingSemestres || semestres.length === 0 ? (
                  <Skeleton className="h-10 w-full sm:w-40" />
                ) : (
                  <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                    <SelectTrigger className="w-full sm:w-40">
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
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <LiquidGlassButton className="w-full sm:w-auto">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm md:text-base">Lançar Notas</span>
                </LiquidGlassButton>
                <LiquidGlassButton variant="outline" className="w-full sm:w-auto">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm md:text-base">Registrar Frequência</span>
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


                <div className="space-y-3">
                  {turmasFiltradas.map((turma) => (
                    <Link 
                      key={turma.id} 
                      href={`/professor/turmas/${turma.id}`}
                      className="block group"
                    >
                      <div className="transition-all duration-300 rounded-xl border border-border/50 px-4 md:px-6 py-4 md:py-5 hover:shadow-lg bg-gray-50/60 dark:bg-gray-800/40 hover:bg-gray-50/80 dark:hover:bg-gray-800/60">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                          <div className="flex items-center gap-3 md:gap-6 min-w-0 flex-1">
                            {/* Ícone */}
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-xl flex items-center justify-center group-hover:bg-primary/90 transition-colors flex-shrink-0">
                              <BookOpen className="h-6 w-6 md:h-7 md:w-7 text-white" />
                            </div>

                            {/* Informações da Turma */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors truncate">
                                  {turma.nome}
                                </h3>
                                <Badge variant="outline" className="text-xs w-fit">
                                  {turma.alunos} alunos
                                </Badge>
                              </div>
                              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 truncate">
                                {turma.disciplina}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                                  <span className="truncate">{turma.proximaAula}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                                  <span>Sala {turma.sala}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>Média: <strong>{turma.mediaGeral}</strong></span>
                                  <span>•</span>
                                  <span>Freq: <strong>{turma.frequenciaMedia}%</strong></span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
                            {/* Estatísticas */}
                            <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
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
                            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="frequencia" className="space-y-4 md:space-y-6">
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground">Lançar Frequência</h2>
                  <p className="text-sm md:text-base text-muted-foreground">Gerencie a presença dos alunos em cada aula</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {turmasFiltradas.map((turma) => {
                    // Processar datas: agrupar, priorizar, filtrar e paginar
                    const aulasAgrupadas = groupAulasByDate(turma.aulas)
                    const datesEntries = Object.entries(aulasAgrupadas)
                    
                    const searchText = turmaSearchText[turma.id] || ""
                    const searchDate = turmaSearchDate[turma.id] || ""
                    const statusFilter = turmaStatusFilter[turma.id] || "all"
                    const paginaAtual = turmaPaginas[turma.id] || 1

                    // Priorizar datas
                    const datasPriorizadas = priorizarDiasParaLancar(datesEntries)

                    // Filtrar por pesquisa e status
                    const datasFiltradas = filtrarDiasPorPesquisa(datasPriorizadas, searchText, searchDate, statusFilter)

                    // Paginar
                    const { diasPagina, totalPaginas } = paginarDias(datasFiltradas, paginaAtual, 5)

                    const handleSearchTextChange = (value: string) => {
                      setTurmaSearchText(prev => ({ ...prev, [turma.id]: value }))
                      setTurmaPaginas(prev => ({ ...prev, [turma.id]: 1 })) // Resetar para primeira página
                    }

                    const handleSearchDateChange = (value: string) => {
                      setTurmaSearchDate(prev => ({ ...prev, [turma.id]: value }))
                      setTurmaPaginas(prev => ({ ...prev, [turma.id]: 1 })) // Resetar para primeira página
                    }

                    const handleClearSearchText = () => {
                      setTurmaSearchText(prev => {
                        const updated = { ...prev }
                        delete updated[turma.id]
                        return updated
                      })
                      setTurmaPaginas(prev => ({ ...prev, [turma.id]: 1 }))
                    }

                    const handleClearSearchDate = () => {
                      setTurmaSearchDate(prev => {
                        const updated = { ...prev }
                        delete updated[turma.id]
                        return updated
                      })
                      setTurmaPaginas(prev => ({ ...prev, [turma.id]: 1 }))
                    }

                    const handleStatusFilterChange = (value: string) => {
                      setTurmaStatusFilter(prev => ({ ...prev, [turma.id]: value }))
                      setTurmaPaginas(prev => ({ ...prev, [turma.id]: 1 })) // Resetar para primeira página
                    }

                    const handlePageChange = (newPage: number) => {
                      if (newPage >= 1 && newPage <= totalPaginas) {
                        setTurmaPaginas(prev => ({ ...prev, [turma.id]: newPage }))
                      }
                    }

                    return (
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
                          {/* Barra de Pesquisa e Filtros */}
                          <div className="space-y-3 mb-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Buscar por data..."
                                value={searchText}
                                onChange={(e) => handleSearchTextChange(e.target.value)}
                                className="pl-9 pr-9"
                              />
                              {searchText && (
                                <button
                                  onClick={handleClearSearchText}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  type="button"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="date"
                                value={searchDate}
                                onChange={(e) => handleSearchDateChange(e.target.value)}
                                className="pl-9 pr-9"
                              />
                              {searchDate && (
                                <button
                                  onClick={handleClearSearchDate}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  type="button"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Filtrar por status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos os status</SelectItem>
                                <SelectItem value="concluida">Concluída</SelectItem>
                                <SelectItem value="agendada">Agendada</SelectItem>
                                <SelectItem value="nao-registrada">Não Registrada Frequência</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-4">
                            {diasPagina.length > 0 ? (
                              diasPagina.map(([dateKey, aulasDoDia]) => {
                                const hoje = new Date()
                                hoje.setHours(0, 0, 0, 0)
                                const dataAula = new Date(dateKey)
                                dataAula.setHours(0, 0, 0, 0)
                                
                                const isDataAnterior = dataAula < hoje
                                const isDataAtual = dataAula.getTime() === hoje.getTime()
                                const isDataFutura = dataAula > hoje
                                
                                const todasLancadas = aulasDoDia.every(aula => aula.status === 'lancada' || aula.status === 'retificada')
                                const temLancadas = aulasDoDia.some(aula => aula.status === 'lancada' || aula.status === 'retificada')
                                
                                // Determinar badge
                                let badgeText = 'Agendada'
                                let badgeVariant: 'default' | 'outline' = 'outline'
                                let badgeClassName = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                
                                if (todasLancadas) {
                                  badgeText = 'Concluída'
                                  badgeVariant = 'default'
                                  badgeClassName = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                } else if (isDataAnterior && !todasLancadas) {
                                  badgeText = 'Não Registrada Frequência'
                                  badgeVariant = 'outline'
                                  badgeClassName = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                }
                                
                                // Determinar botões
                                const mostrarBotaoLancar = isDataAtual && !todasLancadas
                                const mostrarBotaoRetroativo = isDataAnterior && !todasLancadas
                                const mostrarBotaoRetificar = temLancadas
                                
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
                                        variant={badgeVariant}
                                        className={badgeClassName}
                                      >
                                        {badgeText}
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
                                      {mostrarBotaoLancar && (
                                        <LiquidGlassButton
                                          className="flex-1"
                                          size="sm"
                                          onClick={() => handleLancarFrequencia(turma, aulasDoDia[0])}
                                        >
                                          Lançar Frequência
                                        </LiquidGlassButton>
                                      )}

                                      {mostrarBotaoRetroativo && (
                                        <LiquidGlassButton
                                          className="flex-1 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70 border-blue-300 dark:border-blue-700"
                                          size="sm"
                                          onClick={() => handleLancarFrequencia(turma, aulasDoDia[0])}
                                        >
                                          Lançar Frequência Retroativa
                                        </LiquidGlassButton>
                                      )}

                                      {mostrarBotaoRetificar && (
                                        <LiquidGlassButton
                                          variant="outline"
                                          size="sm"
                                          className="flex-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-900/70 border-yellow-300 dark:border-yellow-700"
                                          onClick={() => handleRetificarFrequencia(turma, aulasDoDia[0])}
                                        >
                                          Retificar
                                        </LiquidGlassButton>
                                      )}
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                {searchText || searchDate ? 'Nenhuma data encontrada' : 'Nenhuma aula agendada'}
                              </div>
                            )}
                          </div>

                          {/* Controles de Paginação */}
                          {totalPaginas > 1 && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                                <div className="text-xs md:text-sm text-muted-foreground">
                                  Página {paginaAtual} de {totalPaginas}
                                </div>
                                <div className="flex items-center gap-1 md:gap-2">
                                  <LiquidGlassButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(paginaAtual - 1)}
                                    disabled={paginaAtual === 1}
                                    className="text-xs md:text-sm"
                                  >
                                    <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                    <span className="hidden sm:inline">Anterior</span>
                                  </LiquidGlassButton>
                                  
                                  <div className="flex items-center gap-1 overflow-x-auto">
                                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pageNum) => (
                                      <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-2 py-1 text-xs md:text-sm rounded ${
                                          paginaAtual === pageNum
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    ))}
                                  </div>

                                  <LiquidGlassButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(paginaAtual + 1)}
                                    disabled={paginaAtual === totalPaginas}
                                    className="text-xs md:text-sm"
                                  >
                                    <span className="hidden sm:inline">Próximo</span>
                                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4 sm:ml-1" />
                                  </LiquidGlassButton>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Informação sobre total de dias */}
                          {(searchText || searchDate) && datasFiltradas.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground text-center">
                              Mostrando {diasPagina.length} de {datasFiltradas.length} dia(s) encontrado(s)
                            </div>
                          )}
                        </CardContent>
                      </LiquidGlassCard>
                    )
                  })}
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
            saving={saving}
          />
        </div>
      </main>
    </div>
  )
}
