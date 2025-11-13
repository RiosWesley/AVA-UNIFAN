"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Bell, FileText, Upload, CheckCircle, AlertCircle, MessageSquare, MessageCircle, Video, Play, Eye, EyeOff, CalendarClock } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from 'react'
import { ModalDiscussaoForum, ModalVideoAula, ModalVideoChamada } from '@/components/modals'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { useParams } from 'next/navigation'
import { apiClient, type Forum, type VideoLesson, type MaterialItem, type Notice, type ClassActivity, type ActivitySubmissionStatus } from '@/lib/api-client'

export default function DisciplinaDetalhePage() {
  const params = useParams() as { id: string }
  const classId = params.id

  // Fallback: obter studentId do localStorage se existir ou usar um mock UUID consistente com outras telas
  const getStudentId = () => {
    if (typeof window !== 'undefined') {
      const ls = localStorage.getItem('ava:studentId')
      if (ls) return ls
    }
    return '29bc17a4-0b68-492b-adef-82718898d9eb'
  }
  const studentId = getStudentId()

  // Detalhes da turma para preencher cabeçalho
  const classDetailsQuery = useQuery({
    queryKey: ['class-details', classId],
    queryFn: () => apiClient.getClassDetails(classId),
    enabled: !!classId,
  })

  // Cabeçalho da disciplina (placeholder básico; pode ser enriquecido se houver endpoint)
  const disciplina = {
    nome: classDetailsQuery.data?.discipline?.name || "Disciplina",
    codigo: classDetailsQuery.data?.code || classId,
    professor: classDetailsQuery.data?.teacher?.name || "",
    progresso: 0,
  }

  // Avisos por turma
  const noticesQuery = useQuery({
    queryKey: ['notice-board', classId],
    queryFn: () => apiClient.getNoticesByClass(classId as string),
    enabled: !!classId,
  })

  // Materiais por turma
  const materialsQuery = useQuery({
    queryKey: ['materials', classId],
    queryFn: () => apiClient.getMaterialsByClass(classId as string),
    enabled: !!classId,
  })

  // Atividades por turma
  const activitiesQuery = useQuery({
    queryKey: ['activities-class', classId],
    queryFn: () => apiClient.getActivitiesByClass(classId as string),
    enabled: !!classId,
  })

  // Status de submissão por atividade (carregado após listar atividades)
  const [submissionStatusByActivity, setSubmissionStatusByActivity] = useState<Record<string, ActivitySubmissionStatus>>({})
  useEffect(() => {
    const loadStatuses = async () => {
      if (!activitiesQuery.data || !studentId) return
      try {
        const results = await Promise.all(
          activitiesQuery.data.map((a) => apiClient.getActivitySubmissionStatus(String(a.id), studentId).catch(() => null))
        )
        const map: Record<string, ActivitySubmissionStatus> = {}
        results.forEach((status) => {
          if (status) map[status.activityId] = status
        })
        setSubmissionStatusByActivity(map)
      } catch {
        // silenciosamente ignora falhas parciais
      }
    }
    loadStatuses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activitiesQuery.data, studentId])

  // Fóruns por turma
  const forumsQuery = useQuery({
    queryKey: ['forums', classId],
    queryFn: () => apiClient.getForumsByClass(classId as string),
    enabled: !!classId,
  })

  // Posts do fórum carregados ao abrir discussão
  const [modalDiscussaoOpen, setModalDiscussaoOpen] = useState(false)
  const [forumSelecionado, setForumSelecionado] = useState<any>(null)
  // Mapeia IDs numéricos usados pelo modal -> UUIDs reais do backend
  const [postIdMap, setPostIdMap] = useState<Record<number, string>>({})

  // Upload activity states
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({})
  const [uploadComments, setUploadComments] = useState<Record<string, string>>({})

  // Upload activity mutation
  const uploadActivityMutation = useMutation({
    mutationFn: async ({ activityId, file, comment }: { activityId: string; file: File; comment: string }) => {
      const res = await apiClient.uploadActivitySubmission({
        studentId,
        activityId,
        file,
        comment
      })
      return res
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Atividade enviada com sucesso! 🎉",
        description: `${data.fileName} foi enviada para a atividade.`,
      })
      // Clear upload state
      setUploadFiles(prev => ({ ...prev, [variables.activityId]: null }))
      setUploadComments(prev => ({ ...prev, [variables.activityId]: '' }))
      // Atualiza status local para refletir imediatamente no UI
      setSubmissionStatusByActivity(prev => ({
        ...prev,
        [variables.activityId]: {
          activityId: String(variables.activityId),
          studentId,
          status: 'completed',
          submittedAt: new Date().toISOString(),
          grade: null
        }
      }))
    },
    onError: (error, variables) => {
      toast({
        title: "Erro ao enviar atividade",
        description: "Verifique o arquivo e tente novamente.",
        variant: "destructive",
      })
    },
  })

  const handleFileChange = (activityId: string, file: File | null) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Use PDF, DOC, DOCX, JPG, PNG ou TXT",
          variant: "destructive",
        })
        return
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "Máximo de 10MB permitido",
          variant: "destructive",
        })
        return
      }
    }
    setUploadFiles(prev => ({ ...prev, [activityId]: file }))
  }

  const handleSubmitActivity = (atividade: { id: string }) => {
    const file = uploadFiles[String(atividade.id)]
    const comment = uploadComments[String(atividade.id)] || ''

    if (!file) {
      toast({
        title: "Selecione um arquivo",
        description: "É necessário anexar um arquivo para enviar a atividade.",
        variant: "destructive",
      })
      return
    }

    uploadActivityMutation.mutate({
      activityId: String(atividade.id),
      file,
      comment
    })
  }

  // Vídeo-aulas
  const videoLessonsQuery = useQuery({
    queryKey: ['video-lessons', classId],
    queryFn: () => apiClient.getVideoLessonsByClass(classId as string),
    enabled: !!classId,
  })
  const [videoAulas, setVideoAulas] = useState<Array<{ id: number; titulo: string; duracao: string; visto: boolean; url: string }>>([])
  useEffect(() => {
    if (!videoLessonsQuery.data) return
    const mapped = videoLessonsQuery.data.map((v: VideoLesson, idx) => ({
      id: Number.isFinite(Number(v.id)) ? Number(v.id) : idx + 1,
      titulo: v.title,
      duracao: v.durationSeconds ? `${Math.floor(v.durationSeconds / 60)}:${String(Math.floor(v.durationSeconds % 60)).padStart(2, '0')}` : '00:00',
      visto: Boolean(v.watched),
      url: v.videoUrl,
    }))
    setVideoAulas(mapped)
  }, [videoLessonsQuery.data])
  const [videoAulaSelecionadaId, setVideoAulaSelecionadaId] = useState<number | null>(null)
  const [modalVideoAulaAberto, setModalVideoAulaAberto] = useState(false)
  const videoAulaSelecionada = useMemo(() => videoAulas.find(v => v.id === videoAulaSelecionadaId) || null, [videoAulas, videoAulaSelecionadaId])

  // Mutation for marking video as watched
  const markAsWatchedMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const original = videoLessonsQuery.data?.find(v => Number(v.id) === videoId || v.id === String(videoId))
      const idStr = original?.id ? String(original.id) : String(videoId)
      await apiClient.markVideoLessonWatched(idStr, studentId)
      return idStr
    },
    onSuccess: () => {
      toast({
        title: "Vídeo marcado como assistido! ✓",
        description: "Seu progresso foi atualizado.",
      })
    },
  })

  const abrirVideoAula = (id: number) => {
    setVideoAulaSelecionadaId(id)
    setModalVideoAulaAberto(true)

    // Mark as watched with mutation
    const video = videoAulas.find(v => v.id === id)
    if (video && !video.visto) {
      markAsWatchedMutation.mutate(id)
    }

    // Update local state
    setVideoAulas(prev => prev.map(v => v.id === id ? { ...v, visto: true } : v))
  }

  const selecionarDaTrilha = (id: number) => {
    setVideoAulaSelecionadaId(id)

    // Mark as watched with mutation
    const video = videoAulas.find(v => v.id === id)
    if (video && !video.visto) {
      markAsWatchedMutation.mutate(id)
    }

    setVideoAulas(prev => prev.map(v => v.id === id ? { ...v, visto: true } : v))
  }

  // Vídeo-chamadas
  type VideoChamada = { id: number; titulo: string; dataHora: string; status: 'agendada' | 'disponivel' | 'encerrada'; link: string }
  const [videoChamadas, setVideoChamadas] = useState<VideoChamada[]>([
    { id: 1, titulo: 'Plantão de Dúvidas - Funções', dataHora: '2025-10-30T19:00:00', status: 'agendada', link: '#' },
    { id: 2, titulo: 'Revisão para Prova', dataHora: '2025-10-25T19:00:00', status: 'encerrada', link: '#' },
    { id: 3, titulo: 'Aula ao vivo - Sistemas Lineares', dataHora: '2025-10-28T20:00:00', status: 'disponivel', link: '#' },
  ])
  const [modalVideoChamadaAberto, setModalVideoChamadaAberto] = useState(false)
  const [videoChamadaSelecionada, setVideoChamadaSelecionada] = useState<VideoChamada | null>(null)

  const entrarNaVideoChamada = (reuniao: VideoChamada) => {
    if (reuniao.status !== 'disponivel') return
    setVideoChamadaSelecionada(reuniao)
    setModalVideoChamadaAberto(true)
  }

  const handleVerDiscussao = async (forum: any) => {
    const toPtBrDate = (value: any): string => {
      if (!value) return ''
      // Converte 'YYYY-MM-DD HH:mm:ss.sss+TZ' -> ISO
      const str = String(value)
      const iso = str.includes('T') ? str : str.replace(' ', 'T')
      const d = new Date(iso)
      return isNaN(d.getTime()) ? '' : d.toLocaleString('pt-BR')
    }
    const flattenPosts = (
      posts: any[],
      acc: any[] = [],
      parentNumericId?: number,
      idMap: Record<number, string> = {}
    ) => {
      posts.forEach((p) => {
        const numericId = acc.length + 1
        idMap[numericId] = String(p.id ?? numericId)
        acc.push({
          id: numericId,
          autor: p.user?.name ?? p.authorName ?? '—',
          texto: p.content ?? '',
          data: toPtBrDate(p.postedAt ?? p.createdAt),
          ...(parentNumericId ? { parentId: parentNumericId } : {}),
        })
        if (Array.isArray(p.replies) && p.replies.length > 0) {
          flattenPosts(p.replies, acc, numericId, idMap)
        }
      })
      return { comments: acc, idMap }
    }

    try {
      const posts = await apiClient.getForumPostsByForumId(String(forum.id))
      const { comments: comentarios, idMap } = flattenPosts(Array.isArray(posts) ? posts : [])
      setPostIdMap(idMap)

      setForumSelecionado({
        id: forum.id,
        titulo: forum.titulo,
        descricao: forum.descricao,
        autor: forum.autor,
        dataCriacao: forum.dataCriacao,
        comentarios,
      })
      setModalDiscussaoOpen(true)
    } catch (e) {
      // Abre mesmo com falha (ex.: fórum sem posts ainda)
      setForumSelecionado({
        id: forum.id,
        titulo: forum.titulo,
        descricao: forum.descricao,
        autor: forum.autor,
        dataCriacao: forum.dataCriacao,
        comentarios: [],
      })
      setPostIdMap({})
      setModalDiscussaoOpen(true)
      toast({
        title: "Não foi possível carregar a discussão",
        description: "Mostrando a discussão sem comentários. Tente recarregar em instantes.",
        variant: "destructive",
      })
    }
  }

  const handleResponderDiscussao = (texto: string, parentId?: number) => {
    if (!forumSelecionado) return
    ;(async () => {
      try {
        const realParentId = parentId ? postIdMap[parentId] : undefined
        await apiClient.createForumPost({
          userId: studentId,
          forumId: String(forumSelecionado.id),
          content: texto,
          parentPostId: realParentId ? String(realParentId) : undefined
        })
        // Refetch posts to reflect thread
        const posts = await apiClient.getForumPostsByForumId(String(forumSelecionado.id))
        const { comments: comentarios, idMap } = ((): { comments: any[]; idMap: Record<number, string> } => {
          const toPtBrDate = (val: any) => {
            if (!val) return ''
            const iso = String(val).includes('T') ? String(val) : String(val).replace(' ', 'T')
            const d = new Date(iso)
            return isNaN(d.getTime()) ? '' : d.toLocaleString('pt-BR')
          }
          const acc: any[] = []
          const map: Record<number, string> = {}
          const walk = (arr: any[], parentNumericId?: number) => {
            arr.forEach((p) => {
              const numericId = acc.length + 1
              map[numericId] = String(p.id ?? numericId)
              acc.push({
                id: numericId,
                autor: p.user?.name ?? p.authorName ?? '—',
                texto: p.content ?? '',
                data: toPtBrDate(p.postedAt ?? p.createdAt),
                ...(parentNumericId ? { parentId: parentNumericId } : {}),
              })
              if (Array.isArray(p.replies) && p.replies.length > 0) walk(p.replies, numericId)
            })
          }
          walk(Array.isArray(posts) ? posts : [])
          return { comments: acc, idMap: map }
        })()
        setPostIdMap(idMap)
        setForumSelecionado((curr: any) => curr ? {
          ...curr,
          comentarios
        } : curr)
      } catch {
        toast({
          title: "Não foi possível publicar a resposta",
          description: "Tente novamente mais tarde.",
          variant: "destructive",
        })
      }
    })()
  }


  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Link href="/aluno/disciplinas">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{disciplina.nome}</h1>
              <p className="text-muted-foreground">
                {disciplina.codigo} • {disciplina.professor}
              </p>
            </div>
          </div>

          <Tabs defaultValue="avisos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="avisos">Avisos</TabsTrigger>
              <TabsTrigger value="materiais">Materiais</TabsTrigger>
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
              <TabsTrigger value="forum">Fórum</TabsTrigger>
              <TabsTrigger value="videoaulas">Vídeo-aulas</TabsTrigger>
              <TabsTrigger value="videochamadas">Vídeo-chamadas</TabsTrigger>
            </TabsList>

            <TabsContent value="avisos">
              <div className="space-y-4">
                {noticesQuery.isLoading && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Carregando avisos...</CardTitle>
                          <CardDescription>Aguarde</CardDescription>
                        </div>
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                    </CardHeader>
                  </Card>
                )}
                {(noticesQuery.data || []).map((aviso: Notice) => (
                  <Card key={aviso.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{aviso.title}</CardTitle>
                          <CardDescription>{new Date(aviso.createdAt).toLocaleDateString('pt-BR')}</CardDescription>
                        </div>
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{aviso.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="materiais">
              <div className="space-y-4">
                {materialsQuery.isLoading && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-medium">Carregando materiais...</h4>
                            <p className="text-sm text-muted-foreground">Aguarde</p>
                          </div>
                        </div>
                        <Button size="sm" disabled>Download</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {(materialsQuery.data || []).map((material: MaterialItem) => (
                  <Card key={material.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-medium">{material.title ?? material.name ?? 'Material'}</h4>
                            <p className="text-sm text-muted-foreground">
                              {material.type ?? (material.fileUrl ? material.fileUrl.split('.').pop()?.toUpperCase() : '')}
                              {material.sizeBytes ? ` • ${(material.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : ''}
                              {(material.uploadedAt || material.createdAt) ? ` • ${new Date((material.uploadedAt || material.createdAt) as string).toLocaleDateString('pt-BR')}` : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            const base = process.env.NEXT_PUBLIC_API_URL || ''
                            const isAbsolute = /^https?:\/\//i.test(material.fileUrl || '')
                            const url = isAbsolute ? material.fileUrl : `${base}${material.fileUrl || ''}`
                            window.open(url, '_blank')
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="atividades">
              <div className="space-y-4">
                {activitiesQuery.isLoading && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Carregando atividades...</CardTitle>
                    </CardHeader>
                  </Card>
                )}
                {(activitiesQuery.data || []).map((atividade: ClassActivity) => {
                  const status = submissionStatusByActivity[String(atividade.id)]
                  const normalized = (status?.status || '').toString().toLowerCase()
                  const isCompleted = normalized === 'submitted' || normalized === 'graded' || normalized === 'completed'
                  const badgeLabel = isCompleted ? "Concluída" : "Pendente"
                  const badgeVariant = isCompleted ? "default" : "destructive"
                  return (
                  <Card key={atividade.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{atividade.title}</CardTitle>
                          <CardDescription>Prazo: {new Date(atividade.dueDate).toLocaleDateString('pt-BR')}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {typeof status?.grade === 'number' && <Badge variant="default">Nota: {status.grade}</Badge>}
                          <Badge
                            variant={badgeVariant as any}
                          >
                            {isCompleted ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                            {badgeLabel}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{atividade.description}</p>
                      {!isCompleted && (
                        <div className="space-y-4 border-t pt-4">
                          <div>
                            <Label htmlFor={`arquivo-${atividade.id}`}>Enviar Arquivo</Label>
                            <Input
                              id={`arquivo-${atividade.id}`}
                              type="file"
                              className="mt-1"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                              onChange={(e) => handleFileChange(String(atividade.id), e.target.files?.[0] || null)}
                            />
                            {uploadFiles[String(atividade.id)] && (
                              <p className="text-sm text-green-600 mt-1 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                {uploadFiles[String(atividade.id)]?.name} ({(uploadFiles[String(atividade.id)]?.size! / 1024).toFixed(1)} KB)
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor={`comentario-${atividade.id}`}>Comentário (opcional)</Label>
                            <Textarea
                              id={`comentario-${atividade.id}`}
                              placeholder="Adicione um comentário..."
                              className="mt-1"
                              value={uploadComments[String(atividade.id)] || ''}
                              onChange={(e) => setUploadComments(prev => ({ ...prev, [String(atividade.id)]: e.target.value }))}
                            />
                          </div>
                          <Button
                            onClick={() => handleSubmitActivity({ id: String(atividade.id) })}
                            disabled={uploadActivityMutation.isPending}
                            className="w-full"
                          >
                            {uploadActivityMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Enviar Atividade
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )})}
              </div>
            </TabsContent>

            <TabsContent value="forum">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fórum da Disciplina</h3>
                {forumsQuery.isLoading && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Carregando fóruns...</CardTitle>
                    </CardHeader>
                  </Card>
                )}
                {(forumsQuery.data || []).map((forum: Forum) => {
                  const titulo = forum.title
                  const autor = forum.authorName || (forum as any)?.createdBy?.name || '—'
                  const rawCreated: any = (forum as any)?.createdAt ?? (forum as any)?.created_at ?? null
                  const dataCriacao = rawCreated
                    ? (() => {
                        const s = String(rawCreated)
                        const iso = s.includes('T') ? s : s.replace(' ', 'T')
                        const d = new Date(iso)
                        return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR')
                      })()
                    : ''
                  const descricao = forum.description
                  const comentariosCount = forum.postsCount ?? 0
                  const forumView = { id: forum.id, titulo, descricao, autor, dataCriacao, comentarios: [] as any[] }
                  return (
                  <Card key={forum.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{titulo}</CardTitle>
                          <CardDescription>
                            {`Criado por ${autor}${dataCriacao ? ` em ${dataCriacao}` : ''}`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{comentariosCount} comentários</Badge>
                          <Button size="sm" variant="outline" onClick={() => handleVerDiscussao(forumView)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{descricao}</p>
                      <div className="flex items-center justify-between">
                        {dataCriacao ? (
                          <span className="text-xs text-muted-foreground">
                            Criado em: {dataCriacao}
                          </span>
                        ) : <span />}
                        <Button size="sm" variant="outline" onClick={() => handleVerDiscussao(forumView)}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Ver Discussão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )})}
              </div>
            </TabsContent>

            <TabsContent value="videoaulas">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center"><Video className="h-5 w-5 mr-2"/>Vídeo-aulas</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    {videoAulas.filter(v => v.visto).length} de {videoAulas.length} assistidos
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(videoAulas.filter(v => v.visto).length / videoAulas.length) * 100}%` }}
                  ></div>
                </div>

                {videoAulas.map((aula) => (
                  <Card key={aula.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center text-muted-foreground text-sm">
                            {aula.visto ? (
                              <>
                                <Eye className="h-4 w-4 mr-1 text-green-500" />
                                <span className="text-green-600">Visto</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-1 text-amber-500" />
                                <span className="text-amber-600">Pendente</span>
                              </>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{aula.titulo}</h4>
                            <p className="text-xs text-muted-foreground">Duração: {aula.duracao}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => abrirVideoAula(aula.id)}>
                          <Play className="h-4 w-4 mr-2" /> Assistir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="videochamadas">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center"><CalendarClock className="h-5 w-5 mr-2"/>Vídeo-chamadas</h3>
                {videoChamadas.map((reuniao) => {
                  const data = new Date(reuniao.dataHora)
                  const agora = new Date()
                  const podeEntrar = reuniao.status === 'disponivel'
                  const statusLabel = reuniao.status === 'agendada' ? 'Agendada' : reuniao.status === 'disponivel' ? 'Disponível' : 'Encerrada'
                  const statusVariant = reuniao.status === 'disponivel' ? 'default' : reuniao.status === 'agendada' ? 'secondary' : 'destructive'
                  return (
                    <Card key={reuniao.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{reuniao.titulo}</h4>
                            <p className="text-xs text-muted-foreground">{data.toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusVariant as any}>{statusLabel}</Badge>
                            <Button size="sm" variant={podeEntrar ? 'default' : 'outline'} disabled={!podeEntrar} onClick={() => entrarNaVideoChamada(reuniao)}>
                              <Video className="h-4 w-4 mr-2"/> Entrar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>
      <ModalVideoAula
        isOpen={modalVideoAulaAberto}
        onClose={setModalVideoAulaAberto}
        aulas={videoAulas}
        selectedId={videoAulaSelecionadaId}
        onSelect={(id) => {
          setVideoAulaSelecionadaId(id)
          setVideoAulas(prev => prev.map(v => v.id === id ? { ...v, visto: true } : v))
        }}
      />

      <ModalVideoChamada
        isOpen={modalVideoChamadaAberto}
        onClose={setModalVideoChamadaAberto}
        titulo={videoChamadaSelecionada?.titulo}
        dataHora={videoChamadaSelecionada?.dataHora}
      />
      <ModalDiscussaoForum
        isOpen={modalDiscussaoOpen}
        onClose={() => setModalDiscussaoOpen(false)}
        forum={forumSelecionado}
        onResponder={handleResponderDiscussao}
      />
    </div>
  )
}
