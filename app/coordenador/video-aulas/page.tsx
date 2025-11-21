"use client"

import { useState, useEffect, useRef } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { ArrowLeft, Video, Upload, Save, X, Clock, FileVideo, AlertCircle, List, Plus, Edit, ArrowUp, ArrowDown, GripVertical } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient, VideoLesson, Discipline, VideoLessonOrderUpdate } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { ModalEditarVideoAula } from "@/components/modals/modal-editar-video-aula"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type VideoAulaFormData = {
  titulo: string
  disciplina: string // UUID da disciplina
  descricao: string
  arquivo: File | null
  duracao?: string // Opcional, apenas para exibição
  ordem?: number // Opcional, ordem da vídeo-aula
}

// Componente para item arrastável
function SortableVideoLessonItem({
  videoAula,
  index,
  total,
  isLiquidGlass,
  onEdit,
  onMoveUp,
  onMoveDown,
  getStatusBadge,
  formatarDuracao,
}: {
  videoAula: VideoLesson
  index: number
  total: number
  isLiquidGlass: boolean
  onEdit: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  getStatusBadge: (status?: string) => React.ReactNode
  formatarDuracao: (segundos?: number) => string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: videoAula.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-4 rounded-lg border transition-all hover:shadow-md cursor-grab active:cursor-grabbing",
        isDragging && "ring-2 ring-emerald-500 shadow-lg z-50",
        isLiquidGlass
          ? 'bg-black/20 dark:bg-gray-800/10 border-gray-200/30 dark:border-gray-700/50'
          : 'bg-gray-50/40 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Handle visual e número de ordem */}
          <div className="flex flex-col items-center gap-2 pt-1">
            <div className="text-muted-foreground transition-colors">
              <GripVertical className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded transition-all duration-150">
              {index + 1}
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Video className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {videoAula.title || 'Sem título'}
              </h3>
              {getStatusBadge(videoAula.status)}
            </div>
            {videoAula.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {videoAula.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {videoAula.durationSeconds && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatarDuracao(videoAula.durationSeconds)}</span>
                </div>
              )}
              {videoAula.createdAt && (
                <span>
                  Criada em: {new Date(videoAula.createdAt).toLocaleDateString('pt-BR')}
                </span>
              )}
              {videoAula.teacher?.name && (
                <span>Professor: {videoAula.teacher.name}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Botões de seta */}
          <div className="flex flex-col gap-1">
            <LiquidGlassButton
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onMoveUp()
              }}
              onPointerDown={(e) => {
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
              }}
              disabled={index === 0}
              className="h-8 w-8 p-0"
              title="Mover para cima"
            >
              <ArrowUp className="h-4 w-4" />
            </LiquidGlassButton>
            <LiquidGlassButton
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onMoveDown()
              }}
              onPointerDown={(e) => {
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
              }}
              disabled={index === total - 1}
              className="h-8 w-8 p-0"
              title="Mover para baixo"
            >
              <ArrowDown className="h-4 w-4" />
            </LiquidGlassButton>
          </div>

          {/* Botão de editar */}
          <LiquidGlassButton
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            onPointerDown={(e) => {
              e.stopPropagation()
            }}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </LiquidGlassButton>
        </div>
      </div>
    </div>
  )
}

export default function CoordenadorVideoAulasPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<VideoAulaFormData>({
    titulo: '',
    disciplina: '',
    descricao: '',
    arquivo: null,
    duracao: '',
    ordem: undefined
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [disciplinaFiltro, setDisciplinaFiltro] = useState<string>('')
  const [videoAulaParaEditar, setVideoAulaParaEditar] = useState<VideoLesson | null>(null)
  const [isModalEditarOpen, setIsModalEditarOpen] = useState(false)
  const [localVideoAulas, setLocalVideoAulas] = useState<VideoLesson[]>([])
  const [saveOrderTimeout, setSaveOrderTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // ID mockado do coordenador
  const coordinatorId = '5f634e5c-d028-434d-af46-cc9ea23eb77b'
  const queryClient = useQueryClient()

  // Query para buscar disciplinas do departamento do coordenador
  const disciplinesQuery = useQuery({
    queryKey: ['disciplines', 'coordinator', coordinatorId],
    queryFn: () => apiClient.getDisciplinesByCoordinatorDepartment(coordinatorId),
  })

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

  const validarCampos = () => {
    const novosErros: Record<string, string> = {}

    if (!formData.titulo.trim()) {
      novosErros.titulo = 'Título é obrigatório'
    }

    if (!formData.arquivo) {
      novosErros.arquivo = 'Arquivo é obrigatório'
    } else {
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (formData.arquivo.size > maxSize) {
        novosErros.arquivo = 'Arquivo muito grande (máximo 500MB)'
      }
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
      if (!allowedTypes.includes(formData.arquivo.type)) {
        novosErros.arquivo = 'Formato de vídeo não suportado (use MP4, WebM, OGG ou MOV)'
      }
    }

    if (!formData.disciplina) {
      novosErros.disciplina = 'Disciplina é obrigatória'
    }

    if (formData.duracao && !isValidDuration(formData.duracao)) {
      novosErros.duracao = 'Formato inválido (use MM:SS ou HH:MM:SS)'
    }

    setErrors(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const isValidDuration = (duration: string): boolean => {
    const pattern = /^(\d{1,2}:)?[0-5]?\d:[0-5]\d$/
    return pattern.test(duration)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setFormData(prev => ({ ...prev, arquivo: file }))
    if (errors.arquivo) {
      setErrors(prev => ({ ...prev, arquivo: '' }))
    }
  }

  const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const salvarVideoAulaMutation = useMutation({
    mutationFn: async (data: VideoAulaFormData) => {
      if (!data.arquivo) {
        throw new Error('Arquivo é obrigatório')
      }
      return apiClient.createVideoLessonWithFile({
        disciplineId: data.disciplina,
        title: data.titulo,
        description: data.descricao || undefined,
        file: data.arquivo,
        order: data.ordem,
      })
    },
    onSuccess: () => {
      toast({
        title: "Vídeo-aula criada com sucesso! 🎉",
        description: `"${formData.titulo}" foi adicionada ao sistema.`,
      })
      // Atualizar lista de vídeo-aulas se necessário
      if (disciplinaFiltro === formData.disciplina) {
        videoAulasQuery.refetch()
      }
      // Reset form
      setFormData({
        titulo: '',
        disciplina: '',
        descricao: '',
        arquivo: null,
        duracao: '',
        ordem: undefined
      })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    onError: (error: any) => {
      let errorMessage = "Verifique os dados e tente novamente."
      
      if (error?.response?.status === 403) {
        errorMessage = "Você não tem permissão para criar vídeo-aulas nesta disciplina. É necessário ser professor de uma turma desta disciplina."
      } else if (error?.response?.status === 400) {
        errorMessage = error?.response?.data?.message || "Dados inválidos. Verifique os campos e tente novamente."
      } else if (error?.response?.status === 404) {
        errorMessage = "Disciplina não encontrada."
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: "Erro ao criar vídeo-aula",
        description: errorMessage,
        variant: "error",
      })
    },
  })

  const handleSubmit = () => {
    if (!validarCampos()) {
      toast({
        title: "Dados inválidos",
        description: "Verifique os campos destacados e tente novamente.",
        variant: "error",
      })
      return
    }

    salvarVideoAulaMutation.mutate(formData)
  }

  // Query para buscar vídeo-aulas por disciplina
  const videoAulasQuery = useQuery({
    queryKey: ['video-lessons', disciplinaFiltro],
    queryFn: () => apiClient.getVideoLessonsByDiscipline(disciplinaFiltro),
    enabled: !!disciplinaFiltro,
  })

  // Sincronizar estado local com dados da query
  useEffect(() => {
    if (videoAulasQuery.data) {
      setLocalVideoAulas([...videoAulasQuery.data])
    }
  }, [videoAulasQuery.data])

  // Mutation para atualizar ordem
  const updateOrderMutation = useMutation({
    mutationFn: async (updates: VideoLessonOrderUpdate[]) => {
      if (!disciplinaFiltro) throw new Error('Disciplina não selecionada')
      return apiClient.updateVideoLessonsOrder(disciplinaFiltro, updates)
    },
    onSuccess: (data) => {
      setLocalVideoAulas(data)
      queryClient.setQueryData(['video-lessons', disciplinaFiltro], data)
      toast({
        title: "Ordem atualizada! ✓",
        description: "A ordem das vídeo-aulas foi salva com sucesso.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar ordem",
        description: error?.response?.data?.message || "Não foi possível salvar a nova ordem.",
        variant: "error",
      })
      // Reverter para estado anterior
      if (videoAulasQuery.data) {
        setLocalVideoAulas([...videoAulasQuery.data])
      }
    },
  })

  // Atualizar ordem localmente de forma instantânea e salvar no backend com debounce
  const updateOrder = (newOrder: VideoLesson[]) => {
    // Atualizar estado local IMEDIATAMENTE (sem debounce) para feedback visual instantâneo
    setLocalVideoAulas(newOrder)
    
    // Cancelar timeout anterior se existir
    if (saveOrderTimeout) {
      clearTimeout(saveOrderTimeout)
    }

    // Salvar no backend após 800ms de debounce (muito rápido para feedback visual)
    const timeout = setTimeout(() => {
      const updates: VideoLessonOrderUpdate[] = newOrder.map((vl, index) => ({
        id: vl.id,
        order: index + 1,
      }))
      updateOrderMutation.mutate(updates)
    }, 800) // 800ms de debounce para salvar no backend

    setSaveOrderTimeout(timeout)
  }

  // Cleanup timeout ao desmontar
  useEffect(() => {
    return () => {
      if (saveOrderTimeout) {
        clearTimeout(saveOrderTimeout)
      }
    }
  }, [saveOrderTimeout])

  // Sensores para drag-and-drop com restrição para permitir cliques nos botões
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Só inicia drag se mover pelo menos 10px (permite cliques normais)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handler para quando o drag termina
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localVideoAulas.findIndex((vl) => vl.id === active.id)
      const newIndex = localVideoAulas.findIndex((vl) => vl.id === over.id)
      const newOrder = arrayMove(localVideoAulas, oldIndex, newIndex)
      updateOrder(newOrder)
    }
  }

  // Função para mover vídeo-aula para cima
  const moveUp = (index: number) => {
    if (index === 0) return
    const newOrder = arrayMove(localVideoAulas, index, index - 1)
    updateOrder(newOrder)
  }

  // Função para mover vídeo-aula para baixo
  const moveDown = (index: number) => {
    if (index === localVideoAulas.length - 1) return
    const newOrder = arrayMove(localVideoAulas, index, index + 1)
    updateOrder(newOrder)
  }

  const formatarDuracao = (segundos?: number): string => {
    if (!segundos) return '00:00'
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60
    
    if (horas > 0) {
      return `${horas}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`
    }
    return `${minutos}:${String(segs).padStart(2, '0')}`
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-emerald-500">Pronto</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Pendente</Badge>
      case 'blocked':
        return <Badge className="bg-red-500">Bloqueado</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="coordenador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <Link href="/coordenador">
              <LiquidGlassButton variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </LiquidGlassButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Video className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                Vídeo-aulas
              </h1>
              <p className="text-muted-foreground">
                Gerencie as vídeo-aulas do sistema
              </p>
            </div>
          </div>

          <Tabs defaultValue="listar" className="space-y-6">
            <TabsList className={cn(
              "grid w-full grid-cols-2 gap-1 backdrop-blur-sm",
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
            )}>
              <TabsTrigger value="listar" className="border-none flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span>Listar</span>
              </TabsTrigger>
              <TabsTrigger value="inserir" className="border-none flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Inserir</span>
              </TabsTrigger>
            </TabsList>

            {/* Aba Listar */}
            <TabsContent value="listar" className="space-y-6">
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={cn(
                  "group transition-all duration-300 hover:shadow-xl border border-border/50 hover:border-border/80",
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                    <List className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                    Lista de Vídeo-aulas
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Visualize as vídeo-aulas filtradas por disciplina
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Filtro por Disciplina */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="disciplina-filtro" className="text-sm font-medium">
                          Filtrar por Disciplina
                        </Label>
                        {disciplinaFiltro && (
                          <LiquidGlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setDisciplinaFiltro('')}
                            className="h-7 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Limpar filtro
                          </LiquidGlassButton>
                        )}
                      </div>
                      <Select
                        value={disciplinaFiltro || undefined}
                        onValueChange={setDisciplinaFiltro}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione uma disciplina para filtrar" />
                        </SelectTrigger>
                        <SelectContent>
                          {disciplinesQuery.isLoading ? (
                            <div className="p-2 text-sm text-muted-foreground">Carregando disciplinas...</div>
                          ) : disciplinesQuery.isError ? (
                            <div className="p-2 text-sm text-destructive">Erro ao carregar disciplinas</div>
                          ) : disciplinesQuery.data && disciplinesQuery.data.length > 0 ? (
                            disciplinesQuery.data.map((disciplina: Discipline) => (
                              <SelectItem key={disciplina.id} value={disciplina.id}>
                                {disciplina.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">Nenhuma disciplina encontrada</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Lista de Vídeo-aulas */}
                    {!disciplinaFiltro ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Selecione uma disciplina para visualizar as vídeo-aulas</p>
                      </div>
                    ) : videoAulasQuery.isLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Carregando vídeo-aulas...</p>
                      </div>
                    ) : videoAulasQuery.isError ? (
                      <div className="text-center py-12 text-destructive">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                        <p>Erro ao carregar vídeo-aulas. Tente novamente.</p>
                      </div>
                    ) : !videoAulasQuery.data || videoAulasQuery.data.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma vídeo-aula encontrada para esta disciplina</p>
                      </div>
                    ) : localVideoAulas.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Carregando vídeo-aulas...</p>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={localVideoAulas.map(vl => vl.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {localVideoAulas.map((videoAula: VideoLesson, index: number) => (
                              <SortableVideoLessonItem
                                key={videoAula.id}
                                videoAula={videoAula}
                                index={index}
                                total={localVideoAulas.length}
                                isLiquidGlass={isLiquidGlass}
                                onEdit={() => {
                                  setVideoAulaParaEditar(videoAula)
                                  setIsModalEditarOpen(true)
                                }}
                                onMoveUp={() => moveUp(index)}
                                onMoveDown={() => moveDown(index)}
                                getStatusBadge={getStatusBadge}
                                formatarDuracao={formatarDuracao}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>

            {/* Aba Inserir */}
            <TabsContent value="inserir" className="space-y-6">
              <LiquidGlassCard
            intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
            className={`group transition-all duration-300 hover:shadow-xl border border-border/50 hover:border-border/80 ${
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20'
                : 'bg-gray-50/60 dark:bg-gray-800/40'
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Video className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                Informações da Vídeo-aula
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Preencha os dados da vídeo-aula que deseja adicionar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Título */}
                <div>
                  <Label htmlFor="titulo" className="text-sm font-medium">
                    Título da Vídeo-aula *
                  </Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, titulo: e.target.value }))
                      if (errors.titulo) {
                        setErrors(prev => ({ ...prev, titulo: '' }))
                      }
                    }}
                    placeholder="Ex: Introdução às Funções Quadráticas"
                    className={errors.titulo ? 'border-destructive mt-2' : 'mt-2'}
                  />
                  {errors.titulo && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.titulo}
                    </p>
                  )}
                </div>

                {/* Arquivo de Vídeo */}
                <div>
                  <Label htmlFor="arquivo" className="text-sm font-medium">
                    Arquivo de Vídeo *
                  </Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleFileChange}
                      className="hidden"
                      id="arquivo"
                    />
                    <LiquidGlassButton
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {formData.arquivo ? 'Alterar Arquivo' : 'Selecionar Arquivo'}
                    </LiquidGlassButton>
                    {formData.arquivo && (
                      <div className="mt-3 p-3 border rounded-lg bg-muted/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileVideo className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{formData.arquivo.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatarTamanhoArquivo(formData.arquivo.size)}
                            </p>
                          </div>
                        </div>
                        <LiquidGlassButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, arquivo: null }))
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </LiquidGlassButton>
                      </div>
                    )}
                    {errors.arquivo && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.arquivo}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Formatos aceitos: MP4, WebM, OGG, MOV. Tamanho máximo: 500MB
                    </p>
                  </div>
                </div>

                {/* Disciplina e Duração */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disciplina" className="text-sm font-medium">
                      Disciplina *
                    </Label>
                    <Select
                      value={formData.disciplina}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, disciplina: value }))
                        if (errors.disciplina) {
                          setErrors(prev => ({ ...prev, disciplina: '' }))
                        }
                      }}
                    >
                      <SelectTrigger className={errors.disciplina ? 'border-destructive mt-2' : 'mt-2'}>
                        <SelectValue placeholder="Selecione a disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        {disciplinesQuery.isLoading ? (
                          <div className="p-2 text-sm text-muted-foreground">Carregando disciplinas...</div>
                        ) : disciplinesQuery.isError ? (
                          <div className="p-2 text-sm text-destructive">Erro ao carregar disciplinas</div>
                        ) : disciplinesQuery.data && disciplinesQuery.data.length > 0 ? (
                          disciplinesQuery.data.map((disciplina: Discipline) => (
                            <SelectItem key={disciplina.id} value={disciplina.id}>
                              {disciplina.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">Nenhuma disciplina encontrada</div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.disciplina && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.disciplina}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="duracao" className="text-sm font-medium">
                      Duração (opcional)
                    </Label>
                    <div className="relative mt-2">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="duracao"
                        value={formData.duracao}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, duracao: e.target.value }))
                          if (errors.duracao) {
                            setErrors(prev => ({ ...prev, duracao: '' }))
                          }
                        }}
                        placeholder="MM:SS ou HH:MM:SS"
                        className={errors.duracao ? 'border-destructive pl-10' : 'pl-10'}
                      />
                    </div>
                    {errors.duracao && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.duracao}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Exemplo: 15:30 ou 1:15:30
                    </p>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <Label htmlFor="descricao" className="text-sm font-medium">
                    Descrição (opcional)
                  </Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o conteúdo da vídeo-aula..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                {/* Ordem */}
                <div>
                  <Label htmlFor="ordem" className="text-sm font-medium">
                    Ordem (opcional)
                  </Label>
                  <Input
                    id="ordem"
                    type="number"
                    min="1"
                    value={formData.ordem || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value, 10) : undefined
                      setFormData(prev => ({ ...prev, ordem: value }))
                      if (errors.ordem) {
                        setErrors(prev => ({ ...prev, ordem: '' }))
                      }
                    }}
                    placeholder="Deixe em branco para adicionar ao final"
                    className={cn("mt-2", errors.ordem ? 'border-destructive' : '')}
                  />
                  {errors.ordem && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.ordem}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Número da posição na ordem de visualização. Se não preenchido, será adicionado ao final.
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link href="/coordenador">
                    <LiquidGlassButton variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </LiquidGlassButton>
                  </Link>
                  <LiquidGlassButton
                    onClick={handleSubmit}
                    disabled={salvarVideoAulaMutation.isPending}
                  >
                    {salvarVideoAulaMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Vídeo-aula
                      </>
                    )}
                  </LiquidGlassButton>
                </div>
              </div>
            </CardContent>
          </LiquidGlassCard>
            </TabsContent>
          </Tabs>

          {/* Modal de Edição */}
          {videoAulaParaEditar && disciplinaFiltro && (
            <ModalEditarVideoAula
              isOpen={isModalEditarOpen}
              onClose={() => {
                setIsModalEditarOpen(false)
                setVideoAulaParaEditar(null)
              }}
              videoAula={videoAulaParaEditar}
              disciplineId={disciplinaFiltro}
              onSalvar={() => {
                videoAulasQuery.refetch()
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}


