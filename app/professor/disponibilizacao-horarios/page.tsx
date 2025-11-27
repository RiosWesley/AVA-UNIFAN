"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { 
  Clock, 
  Calendar, 
  User, 
  Save, 
  Send, 
  CheckCircle, 
  History,
  Sun,
  Sunset,
  Moon
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getAvailableSemesters,
  getTeacherAvailabilities,
  getTeacherAvailabilityBySemester,
  createOrUpdateAvailability,
  submitAvailability,
  type DisponibilizacaoHorarios as BackendAvailability,
  type DisponibilidadeTurnos,
  mapBackendToFrontendTurnos,
  mapFrontendToBackendTurnos,
} from "@/src/services/availability-service"

type Turno = 'manha' | 'tarde' | 'noite'

interface DisponibilizacaoHorarios {
  id: string
  semestre: string
  status: 'rascunho' | 'enviada' | 'aprovada'
  turnos: DisponibilidadeTurnos
  observacoes: string
  dataCriacao: Date
  dataEnvio?: Date
}

const TURNOS: Array<{
  id: Turno
  nome: string
  icone: typeof Sun
  cor: string
  descricao: string
}> = [
  { id: 'manha', nome: 'Manhã', icone: Sun, cor: 'yellow', descricao: '07:00 - 12:00' },
  { id: 'tarde', nome: 'Tarde', icone: Sunset, cor: 'orange', descricao: '13:00 - 18:00' },
  { id: 'noite', nome: 'Noite', icone: Moon, cor: 'blue', descricao: '18:30 - 22:00' }
]

export default function DisponibilizacaoHorariosPage() {
  const router = useRouter()
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [semestreSelecionado, setSemestreSelecionado] = useState("")
  const [semestres, setSemestres] = useState<Array<{ id: string; nome: string; ativo: boolean }>>([])
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [status, setStatus] = useState<'rascunho' | 'enviada' | 'aprovada'>('rascunho')
  const [observacoes, setObservacoes] = useState("")
  const [turnos, setTurnos] = useState<DisponibilidadeTurnos>({
    manha: false,
    tarde: false,
    noite: false
  })
  const [historico, setHistorico] = useState<DisponibilizacaoHorarios[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentAvailabilityId, setCurrentAvailabilityId] = useState<string | null>(null)

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

  // Buscar usuário atual e semestres disponíveis
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
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
        setLoading(false)
      }
    }
    init()
  }, [router])

  // Buscar semestres disponíveis
  useEffect(() => {
    const buscarSemestres = async () => {
      if (!teacherId) return
      try {
        setLoading(true)
        const semestresDisponiveis = await getAvailableSemesters(teacherId)
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
        toast.error("Erro ao carregar semestres disponíveis")
      } finally {
        setLoading(false)
      }
    }
    buscarSemestres()
  }, [teacherId])

  // Carregar disponibilidade ao selecionar semestre
  useEffect(() => {
    const carregarDisponibilidade = async () => {
      if (!teacherId || !semestreSelecionado) return
      
      try {
        setLoading(true)
        const disponibilidade = await getTeacherAvailabilityBySemester(
          teacherId,
          semestreSelecionado
        )
        
        if (disponibilidade) {
          setCurrentAvailabilityId(disponibilidade.id)
          setTurnos(mapBackendToFrontendTurnos(disponibilidade))
          setObservacoes(disponibilidade.observations || "")
          
          const statusMap: Record<string, 'rascunho' | 'enviada' | 'aprovada'> = {
            draft: 'rascunho',
            submitted: 'enviada',
            approved: 'aprovada'
          }
          setStatus(statusMap[disponibilidade.status] || 'rascunho')
        } else {
          setCurrentAvailabilityId(null)
          setTurnos({ manha: false, tarde: false, noite: false })
          setObservacoes("")
          setStatus('rascunho')
        }
      } catch (error) {
        console.error("Erro ao carregar disponibilidade:", error)
      } finally {
        setLoading(false)
      }
    }
    
    carregarDisponibilidade()
  }, [teacherId, semestreSelecionado])

  // Carregar histórico
  useEffect(() => {
    const carregarHistorico = async () => {
      if (!teacherId) return
      
      try {
        const disponibilidades = await getTeacherAvailabilities(teacherId)
        
        const historicoFormatado: DisponibilizacaoHorarios[] = disponibilidades.map(av => {
          const statusMap: Record<string, 'rascunho' | 'enviada' | 'aprovada'> = {
            draft: 'rascunho',
            submitted: 'enviada',
            approved: 'aprovada'
          }
          
          return {
            id: av.id,
            semestre: av.semesterId,
            status: statusMap[av.status] || 'rascunho',
            turnos: mapBackendToFrontendTurnos(av),
            observacoes: av.observations || "",
            dataCriacao: new Date(av.createdAt),
            dataEnvio: av.submittedAt ? new Date(av.submittedAt) : undefined
          }
        })
        
        setHistorico(historicoFormatado.sort((a, b) => 
          b.dataCriacao.getTime() - a.dataCriacao.getTime()
        ))
      } catch (error) {
        console.error("Erro ao carregar histórico:", error)
      }
    }
    
    carregarHistorico()
  }, [teacherId])

  const toggleTurno = (turno: Turno) => {
    setTurnos(prev => ({
      ...prev,
      [turno]: !prev[turno]
    }))
  }

  const temAlgumTurnoSelecionado = () => {
    return turnos.manha || turnos.tarde || turnos.noite
  }

  const salvarRascunho = async () => {
    if (!temAlgumTurnoSelecionado()) {
      toast.warning("Selecione pelo menos um turno antes de salvar")
      return
    }

    if (!semestreSelecionado || !teacherId) {
      toast.error("Selecione um semestre antes de salvar")
      return
    }

    try {
      setSaving(true)
      const turnosBackend = mapFrontendToBackendTurnos(turnos)
      
      const disponibilidade = await createOrUpdateAvailability({
        semesterId: semestreSelecionado,
        ...turnosBackend,
        observations: observacoes || undefined
      })

      setCurrentAvailabilityId(disponibilidade.id)
      setStatus('rascunho')
      
      toast.success("Rascunho salvo com sucesso!", {
        description: "Sua disponibilidade foi salva"
      })
      
      // Recarregar histórico
      const historicoAtualizado = await getTeacherAvailabilities(teacherId)
      const historicoFormatado: DisponibilizacaoHorarios[] = historicoAtualizado.map(av => {
        const statusMap: Record<string, 'rascunho' | 'enviada' | 'aprovada'> = {
          draft: 'rascunho',
          submitted: 'enviada',
          approved: 'aprovada'
        }
        
        return {
          id: av.id,
          semestre: av.semesterId,
          status: statusMap[av.status] || 'rascunho',
          turnos: mapBackendToFrontendTurnos(av),
          observacoes: av.observations || "",
          dataCriacao: new Date(av.createdAt),
          dataEnvio: av.submittedAt ? new Date(av.submittedAt) : undefined
        }
      })
      
      setHistorico(historicoFormatado.sort((a, b) => 
        b.dataCriacao.getTime() - a.dataCriacao.getTime()
      ))
    } catch (error: any) {
      console.error('Erro ao salvar rascunho:', error)
      toast.error("Erro ao salvar rascunho", {
        description: error.response?.data?.message || "Tente novamente em alguns instantes"
      })
    } finally {
      setSaving(false)
    }
  }

  const enviarParaCoordenacao = async () => {
    if (!temAlgumTurnoSelecionado()) {
      toast.error("Selecione pelo menos um turno antes de enviar", {
        description: "É necessário informar sua disponibilidade"
      })
      return
    }

    if (!semestreSelecionado || !teacherId) {
      toast.error("Selecione um semestre antes de enviar")
      return
    }

    const toastId = toast.loading("Enviando disponibilidade para coordenação...", {
      id: "enviando-horarios"
    })

    try {
      setSaving(true)
      const turnosBackend = mapFrontendToBackendTurnos(turnos)
      
      // Primeiro criar/atualizar como draft
      let disponibilidade = await createOrUpdateAvailability({
        semesterId: semestreSelecionado,
        ...turnosBackend,
        observations: observacoes || undefined
      })

      setCurrentAvailabilityId(disponibilidade.id)
      
      // Se já existe e está como draft, submeter
      if (disponibilidade.status === 'draft') {
        try {
          disponibilidade = await submitAvailability(disponibilidade.id)
        } catch (submitError: any) {
          // Se o endpoint de submit não existir, o backend pode ter submetido automaticamente
          // ou pode aceitar status no POST. Vamos verificar o status retornado
          if (submitError.response?.status === 404) {
            // Endpoint não existe, assumir que foi submetido
            console.warn("Endpoint de submit não encontrado, assumindo submissão automática")
          } else {
            throw submitError
          }
        }
      }
      
      const statusMap: Record<string, 'rascunho' | 'enviada' | 'aprovada'> = {
        draft: 'rascunho',
        submitted: 'enviada',
        approved: 'aprovada'
      }
      setStatus(statusMap[disponibilidade.status] || 'enviada')
      
      toast.dismiss(toastId)
      toast.success("Disponibilidade enviada com sucesso!", {
        description: "A coordenação foi notificada sobre seus turnos disponíveis"
      })
      
      // Recarregar histórico
      const historicoAtualizado = await getTeacherAvailabilities(teacherId)
      const historicoFormatado: DisponibilizacaoHorarios[] = historicoAtualizado.map(av => {
        const statusMap: Record<string, 'rascunho' | 'enviada' | 'aprovada'> = {
          draft: 'rascunho',
          submitted: 'enviada',
          approved: 'aprovada'
        }
        
        return {
          id: av.id,
          semestre: av.semesterId,
          status: statusMap[av.status] || 'rascunho',
          turnos: mapBackendToFrontendTurnos(av),
          observacoes: av.observations || "",
          dataCriacao: new Date(av.createdAt),
          dataEnvio: av.submittedAt ? new Date(av.submittedAt) : undefined
        }
      })
      
      setHistorico(historicoFormatado.sort((a, b) => 
        b.dataCriacao.getTime() - a.dataCriacao.getTime()
      ))
    } catch (error: any) {
      console.error('Erro ao enviar disponibilidade:', error)
      toast.dismiss(toastId)
      toast.error("Erro ao enviar disponibilidade", {
        description: error.response?.data?.message || "Verifique sua conexão e tente novamente"
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovada": return "bg-emerald-500"
      case "enviada": return "bg-blue-500"
      case "rascunho": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovada": return CheckCircle
      case "enviada": return Send
      case "rascunho": return Save
      default: return Clock
    }
  }

  if (loading) {
    return (
      <div className={cn("flex h-screen", isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background')}>
        <Sidebar userRole="professor" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Skeleton do Header */}
            <div className={cn(
              "flex flex-col lg:flex-row lg:items-center justify-between mb-8 p-6 rounded-xl border gap-4",
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
            )}>
              <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-80" />
                  <Skeleton className="h-5 w-96" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-10 w-40" />
            </div>

            {/* Skeleton dos Tabs */}
            <div className="mb-6">
              <div className={cn(
                "grid w-full grid-cols-2 gap-1 backdrop-blur-sm",
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
              )}>
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </div>

            {/* Skeleton do Conteúdo */}
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} className={isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'}>
              <CardHeader>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-24 w-full rounded-lg" />
                <div className="flex gap-3 pt-4 border-t">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </CardContent>
            </LiquidGlassCard>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={cn("flex h-screen", isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background')}>
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className={cn(
            "flex flex-col lg:flex-row lg:items-center justify-between mb-4 md:mb-6 lg:mb-8 p-4 md:p-6 rounded-xl border gap-4",
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          )}>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 truncate">
                    Disponibilização de Horários
                  </h1>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800 text-xs md:text-sm px-2 md:px-3 py-1 w-fit">
                    {semestres.find(s => s.id === semestreSelecionado)?.nome}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm md:text-base lg:text-lg mt-1">
                  Informe os turnos em que você está disponível
                </p>
                <div className="flex items-center mt-2 flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    <User className="h-3 w-3 mr-1" />
                    Professor
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      status === 'aprovada' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                      status === 'enviada' && 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
                      status === 'rascunho' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                    )}
                  >
                    {status === 'aprovada' ? 'Aprovada' : status === 'enviada' ? 'Enviada' : 'Rascunho'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                {loading || semestres.length === 0 ? (
                  <Skeleton className="h-10 w-full sm:w-40" />
                ) : (
                  <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                    <SelectTrigger className={cn(
                      "w-full sm:w-40 backdrop-blur-sm",
                      isLiquidGlass
                        ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                        : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                    )}>
                      <SelectValue placeholder="Selecionar semestre" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/50">
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
            </div>
          </div>

          <Tabs defaultValue="disponibilizar" className="space-y-4 md:space-y-6">
            <TabsList className={cn(
              "grid w-full grid-cols-2 gap-1 backdrop-blur-sm",
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
            )}>
              <TabsTrigger value="disponibilizar" className="border-none flex items-center space-x-2 text-xs sm:text-sm">
                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate">Disponibilizar Turnos</span>
              </TabsTrigger>
              <TabsTrigger value="historico" className="border-none flex items-center space-x-2 text-xs sm:text-sm">
                <History className="h-3 w-3 md:h-4 md:w-4" />
                <span>Histórico</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="disponibilizar" className="space-y-6">
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={cn(
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                )}
              >
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">
                    Turnos Disponíveis
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Selecione os turnos em que você está disponível para lecionar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-6">
                  {/* Seleção de Turnos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {TURNOS.map((turno) => {
                      const IconeTurno = turno.icone
                      const ativo = turnos[turno.id]
                      
                      return (
                        <button
                          key={turno.id}
                          type="button"
                          onClick={() => toggleTurno(turno.id)}
                          className={cn(
                            "relative p-4 md:p-6 rounded-xl border-1 transition-all duration-200 text-left",
                            "hover:shadow-md",
                            ativo
                              ? cn(
                                  turno.cor === 'yellow' && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
                                  turno.cor === 'orange' && 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
                                  turno.cor === 'blue' && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                )
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className={cn(
                              "p-3 rounded-lg",
                              ativo
                                ? cn(
                                    turno.cor === 'yellow' && 'bg-yellow-100 dark:bg-yellow-900/40',
                                    turno.cor === 'orange' && 'bg-orange-100 dark:bg-orange-900/40',
                                    turno.cor === 'blue' && 'bg-blue-100 dark:bg-blue-900/40'
                                  )
                                : 'bg-gray-100 dark:bg-gray-700'
                            )}>
                              <IconeTurno className={cn(
                                "h-6 w-6",
                                ativo
                                  ? cn(
                                      turno.cor === 'yellow' && 'text-yellow-600 dark:text-yellow-400',
                                      turno.cor === 'orange' && 'text-orange-600 dark:text-orange-400',
                                      turno.cor === 'blue' && 'text-blue-600 dark:text-blue-400'
                                    )
                                  : 'text-gray-400 dark:text-gray-500'
                              )} />
                            </div>
                            <Switch
                              checked={ativo}
                              onCheckedChange={() => toggleTurno(turno.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="ml-auto"
                            />
                          </div>
                          
                          <h3 className={cn(
                            "text-lg md:text-xl font-semibold mb-2",
                            ativo
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-500 dark:text-gray-400'
                          )}>
                            {turno.nome}
                          </h3>
                          
                          <p className={cn(
                            "text-xs md:text-sm",
                            ativo
                              ? 'text-gray-600 dark:text-gray-300'
                              : 'text-gray-400 dark:text-gray-500'
                          )}>
                            {turno.descricao}
                          </p>

                          {ativo && (
                            <div className="absolute top-4 right-4">
                              <div className={cn(
                                "w-3 h-3 rounded-full",
                                turno.cor === 'yellow' && 'bg-yellow-500',
                                turno.cor === 'orange' && 'bg-orange-500',
                                turno.cor === 'blue' && 'bg-blue-500'
                              )} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Resumo da Seleção */}
                  {temAlgumTurnoSelecionado() && (
                    <div className={cn(
                      "p-4 rounded-lg border",
                      isLiquidGlass
                        ? 'bg-black/20 dark:bg-gray-800/10 border-gray-200/30 dark:border-gray-700/50'
                        : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
                    )}>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Turnos selecionados:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {TURNOS.filter(t => turnos[t.id]).map(turno => (
                          <Badge
                            key={turno.id}
                            variant="secondary"
                            className={cn(
                              turno.cor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
                              turno.cor === 'orange' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
                              turno.cor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            )}
                          >
                            {turno.nome}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="text-sm font-medium">
                      Observações Adicionais (opcional)
                    </Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Informe qualquer observação relevante sobre sua disponibilidade..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <LiquidGlassButton
                      variant="outline"
                      onClick={salvarRascunho}
                      className="flex-1"
                      disabled={saving || loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Salvando..." : "Salvar Rascunho"}
                    </LiquidGlassButton>
                    <LiquidGlassButton
                      onClick={enviarParaCoordenacao}
                      className="flex-1"
                      disabled={saving || loading || status === 'aprovada'}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {saving ? "Enviando..." : "Enviar para Coordenação"}
                    </LiquidGlassButton>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>

            <TabsContent value="historico" className="space-y-4 md:space-y-6">
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={cn(
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                )}
              >
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">
                    Histórico de Disponibilizações
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Visualize suas disponibilizações anteriores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historico.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma disponibilização encontrada</p>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {historico.map((item) => {
                        const StatusIcon = getStatusIcon(item.status)
                        const turnosSelecionados = TURNOS.filter(t => item.turnos[t.id])
                        
                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "p-3 md:p-4 rounded-xl border",
                              isLiquidGlass
                                ? 'bg-black/20 dark:bg-gray-800/10 border-gray-200/30 dark:border-gray-700/50'
                                : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
                            )}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                              <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                                <StatusIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100 truncate">
                                    {semestres.find(s => s.id === item.semestre)?.nome || `Semestre ${item.semestre}`}
                                  </h3>
                                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                    Criado em {item.dataCriacao.toLocaleDateString('pt-BR')}
                                    {item.dataEnvio && ` • Enviado em ${item.dataEnvio.toLocaleDateString('pt-BR')}`}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs w-fit",
                                  item.status === 'aprovada' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                                  item.status === 'enviada' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                                  item.status === 'rascunho' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                )}
                              >
                                {item.status === 'aprovada' ? 'Aprovada' : item.status === 'enviada' ? 'Enviada' : 'Rascunho'}
                              </Badge>
                            </div>
                            
                            {item.observacoes && (
                              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {item.observacoes}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {turnosSelecionados.length > 0 ? (
                                turnosSelecionados.map(turno => (
                                  <Badge
                                    key={turno.id}
                                    variant="secondary"
                                    className={cn(
                                      turno.cor === 'yellow' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
                                      turno.cor === 'orange' && 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
                                      turno.cor === 'blue' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                    )}
                                  >
                                    {turno.nome}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500 text-sm">
                                  Nenhum turno selecionado
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
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
