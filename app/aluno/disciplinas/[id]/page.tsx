"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Bell, FileText, Upload, CheckCircle, AlertCircle, MessageSquare, MessageCircle, Video, Play, Eye, EyeOff, CalendarClock, FileCheck, Clock, Monitor, MonitorStop, ChevronDown, Mic, MicOff, VideoOff, GraduationCap } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState, useRef } from 'react'
import { ModalDiscussaoForum, ModalVideoChamada } from '@/components/modals'
import { ModalRealizarProva, ModalResultadoProva } from '@/components/modals'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import { useParams, useRouter } from 'next/navigation'
import { apiClient, type Forum, type VideoLesson, type MaterialItem, type Notice, type ClassActivity, type ActivitySubmissionStatus } from '@/lib/api-client'
import { listExams, listAttemptsByStudent, getExamById, ExamDTO, ExamAttemptDTO } from '@/src/services/examsService'
import { findGrades, type GradeDTO } from '@/src/services/gradesService'
import { useLiveSession } from "@/src/hooks/useLiveSession"
import { listLiveSessionsByClass } from "@/src/services/liveSessionsService"
import RemoteVideo from "@/components/layout/RemoteVideo"
import { me } from '@/src/services/auth'

export default function DisciplinaDetalhePage() {
  const params = useParams() as { id: string }
  const classId = params.id
  const router = useRouter()
  const [studentId, setStudentId] = useState<string | null>(null)

  // Obter ID do usuário autenticado
  useEffect(() => {
    const init = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
      if (!token) {
        router.push("/")
        return
      }
      const storedUserId = localStorage.getItem("ava:userId")
      if (storedUserId) {
        setStudentId(storedUserId)
        return
      }
      try {
        const current = await me()
        if (current?.id) {
          localStorage.setItem("ava:userId", current.id)
          setStudentId(current.id)
        }
      } catch {
        router.push("/")
      }
    }
    init()
  }, [router])

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

  // Obter disciplineId dos detalhes da classe
  const disciplineId = classDetailsQuery.data?.discipline?.id

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

  // Estado para rastrear downloads em andamento
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())

  // Atividades por turma
  const activitiesQuery = useQuery({
    queryKey: ['activities-class', classId],
    queryFn: () => apiClient.getActivitiesByClass(classId as string),
    enabled: !!classId,
  })

  // Enrollment do aluno na turma
  const enrollmentQuery = useQuery({
    queryKey: ['enrollment', studentId, classId],
    queryFn: async () => {
      if (!studentId || !classId) return null
      const enrollments = await apiClient.getStudentEnrollments(studentId)
      return enrollments.find(e => e.classId === classId) || null
    },
    enabled: !!studentId && !!classId,
  })

  // Notas do aluno
  const gradesQuery = useQuery({
    queryKey: ['grades', enrollmentQuery.data?.id],
    queryFn: () => findGrades({ enrollmentId: enrollmentQuery.data?.id }),
    enabled: !!enrollmentQuery.data?.id,
  })

  // Status de submissão por atividade (carregado após listar atividades)
  const [submissionStatusByActivity, setSubmissionStatusByActivity] = useState<Record<string, ActivitySubmissionStatus>>({})
  useEffect(() => {
    const loadStatuses = async () => {
      if (!activitiesQuery.data || !studentId) return
      try {
        const results = await Promise.all(
          activitiesQuery.data.map((a) => apiClient.getActivitySubmissionStatus(String(a.id), studentId!).catch(() => null))
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
      if (!studentId) throw new Error("Usuário não autenticado")
      const res = await apiClient.uploadActivitySubmission({
        studentId,
        activityId,
        file,
        comment
      })
      return res
    },
    onSuccess: (data, variables) => {
      if (!studentId) return
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
    queryKey: ['video-lessons', disciplineId],
    queryFn: () => apiClient.getVideoLessonsByDiscipline(disciplineId as string),
    enabled: !!disciplineId,
  })
  const [videoAulas, setVideoAulas] = useState<Array<{ id: number; titulo: string; duracao: string; visto: boolean; url: string; videoLessonId: string; status?: string }>>([])
  useEffect(() => {
    if (!videoLessonsQuery.data) {
      setVideoAulas([])
      return
    }
    console.log('Video lessons data:', videoLessonsQuery.data)
    
    // Ordenar por ordem antes de mapear (garantir que a ordem seja respeitada)
    const sortedData = [...(Array.isArray(videoLessonsQuery.data) ? videoLessonsQuery.data : [])].sort((a: any, b: any) => {
      const orderA = a.order ?? 9999 // Se não tiver ordem, vai para o final
      const orderB = b.order ?? 9999
      if (orderA !== orderB) {
        return orderA - orderB
      }
      // Se as ordens forem iguais ou ambas null, ordena por data de criação
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA // Mais recente primeiro (DESC)
    })
    
    const mapped = sortedData.map((v: any, idx) => {
      // Suporta tanto camelCase quanto snake_case do backend
      const id = v.id
      const title = v.title || 'Sem título'
      const durationSeconds = v.durationSeconds || v.duration_seconds || 0
      const status = v.status || 'pending'
      const rawVideoUrl = v.videoUrl || v.video_url || ''
      const attachments: string[] = (v.attachmentUrls || v.attachment_urls || []) as string[]

      // Usa URL válida ou cai para um anexo de vídeo (ex.: mp4) se existir
      const isValidHttpUrl = (s: any) => {
        if (typeof s !== 'string') return false
        try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:' } catch { return false }
      }
      const videoAttachment = attachments.find((u: string) => /\.(mp4|webm|ogg)(\?|$)/i.test(u)) || ''
      const initialUrl = isValidHttpUrl(rawVideoUrl) ? rawVideoUrl : (isValidHttpUrl(videoAttachment) ? videoAttachment : '')
      
      // Gera um ID numérico único baseado no índice para compatibilidade com o modal
      const numericId = idx + 1
      
      return {
        id: numericId,
        titulo: title,
        duracao: durationSeconds ? `${Math.floor(durationSeconds / 60)}:${String(Math.floor(durationSeconds % 60)).padStart(2, '0')}` : '00:00',
        visto: Boolean(v.watched),
        url: initialUrl, // URL será buscada dinamicamente via stream-url se vazia
        videoLessonId: String(id),
        status: status,
      }
    })
    console.log('Mapped video aulas:', mapped)
    setVideoAulas(mapped)
  }, [videoLessonsQuery.data])
  const [videoAulaSelecionadaId, setVideoAulaSelecionadaId] = useState<number | null>(null)
  const [modalVideoAulaAberto, setModalVideoAulaAberto] = useState(false)
  const [streamUrlCache, setStreamUrlCache] = useState<Record<string, { url: string; expiresAt: number }>>({})
  const videoAulaSelecionada = useMemo(() => videoAulas.find(v => v.id === videoAulaSelecionadaId) || null, [videoAulas, videoAulaSelecionadaId])

  // Mutation for marking video as watched
  const markAsWatchedMutation = useMutation({
    mutationFn: async (videoId: number) => {
      if (!studentId) throw new Error("Usuário não autenticado")
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

  // Query para buscar stream URL quando necessário
  const videoAulaSelecionadaData = videoAulas.find(v => v.id === videoAulaSelecionadaId)
  const streamUrlQuery = useQuery({
    queryKey: ['video-lesson-stream', disciplineId, videoAulaSelecionadaData?.videoLessonId],
    queryFn: () => {
      if (!videoAulaSelecionadaData?.videoLessonId || !disciplineId) throw new Error('Missing data')
      return apiClient.getVideoLessonStreamUrlByDiscipline(disciplineId as string, videoAulaSelecionadaData.videoLessonId)
    },
    // Busca stream URL somente quando o modal estiver aberto e ainda não tivermos URL
    enabled: !!modalVideoAulaAberto && !!videoAulaSelecionadaData?.videoLessonId && !!disciplineId && !videoAulaSelecionadaData?.url,
    staleTime: 9 * 60 * 1000, // 9 minutos (URL expira em 10 minutos)
  })

  // Atualizar URL quando stream URL for obtida
  useEffect(() => {
    if (streamUrlQuery.data && videoAulaSelecionadaId && videoAulaSelecionadaData) {
      const expiresAt = Date.now() + (streamUrlQuery.data.expiresInSeconds * 1000)
      setStreamUrlCache(prev => ({
        ...prev,
        [videoAulaSelecionadaData.videoLessonId]: {
          url: streamUrlQuery.data.url,
          expiresAt,
        }
      }))
      setVideoAulas(prev => prev.map(v => 
        v.id === videoAulaSelecionadaId 
          ? { ...v, url: streamUrlQuery.data.url }
          : v
      ))
    }
  }, [streamUrlQuery.data, videoAulaSelecionadaId, videoAulaSelecionadaData])

  const abrirVideoAula = (id: number) => {
    const video = videoAulas.find(v => v.id === id)
    if (video) {
      router.push(`/aluno/disciplinas/${classId}/videoaulas/${video.videoLessonId}`)
    }
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

  const [isJoining, setIsJoining] = useState(false);

  const { 
    joinSession, 
    leaveSession, 
    isConnected,
    isScreenSharing,
    isMuted,
    isVideoOff,
    startScreenSharing,
    stopScreenSharing,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteStreams
  } = useLiveSession();

  type VideoChamada = { id: string; titulo: string; dataHora: string; startAt: string; endAt: string; status: 'agendada' | 'disponivel' | 'encerrada'; link: string }
  
  const [modalVideoChamadaAberto, setModalVideoChamadaAberto] = useState(false)
  const [videoChamadaSelecionada, setVideoChamadaSelecionada] = useState<VideoChamada | null>(null)

  // Provas Online
  const examsQuery = useQuery({
    queryKey: ['exams-class', classId],
    queryFn: () => listExams(),
    enabled: !!classId,
  })

  const attemptsQuery = useQuery({
    queryKey: ['exam-attempts-student', studentId],
    queryFn: () => listAttemptsByStudent(studentId!),
    enabled: !!studentId,
  })

  const [modalRealizarProvaOpen, setModalRealizarProvaOpen] = useState(false)
  const [examSelecionado, setExamSelecionado] = useState<ExamDTO | null>(null)
  const [attemptAtual, setAttemptAtual] = useState<ExamAttemptDTO | null>(null)

  const [modalResultadoProvaOpen, setModalResultadoProvaOpen] = useState(false)
  const [attemptIdParaResultado, setAttemptIdParaResultado] = useState<string | null>(null)

  // Estado para controlar aba ativa
  const [activeTab, setActiveTab] = useState<string>('avisos')

  // Estado para menu de compartilhamento de tela
  const [screenShareMenuOpen, setScreenShareMenuOpen] = useState(false)
  const screenShareMenuRef = useRef<HTMLDivElement>(null)
  const [hasRaisedHand, setHasRaisedHand] = useState(false)

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (screenShareMenuRef.current && !screenShareMenuRef.current.contains(event.target as Node)) {
        setScreenShareMenuOpen(false)
      }
    }

    if (screenShareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [screenShareMenuOpen])

  const entrarNaVideoChamada = async (reuniao: VideoChamada) => {
    if (reuniao.status !== 'disponivel' || !studentId) return;
    setIsJoining(true);
    
    // Obter nome do usuário
    let userName: string | undefined;
    try {
      const current = await me();
      userName = current?.name;
      if (userName) {
        localStorage.setItem('ava:userName', userName);
      }
    } catch {
      userName = localStorage.getItem('ava:userName') || undefined;
    }
    
    joinSession(classId, studentId, 'student', userName);
    setVideoChamadaSelecionada(reuniao);
    setModalVideoChamadaAberto(true);
};

   const handleLeaveLiveSession = () => {
      leaveSession();
      setModalVideoChamadaAberto(false);
  };

  const liveSessionsQuery = useQuery({
    queryKey: ['liveSessions', classId],
    queryFn: () => listLiveSessionsByClass(classId),
    enabled: !!classId,
    refetchInterval: 30000,
  });

  const videoChamadas = useMemo(() => {
    if (!liveSessionsQuery.data) return [];
    return liveSessionsQuery.data.map((s: any) => {
        const now = Date.now();
        const start = new Date(s.startAt).getTime();
        const end = s.endAt ? new Date(s.endAt).getTime() : start + 2 * 60 * 60 * 1000; // Default 2h
        const status: 'agendada' | 'disponivel' | 'encerrada' = 
            now < start ? 'agendada' : 
            (now >= start && now <= end) ? 'disponivel' : 
            'encerrada';
        return { id: s.id, titulo: s.title, dataHora: s.startAt, startAt: s.startAt, endAt: s.endAt || new Date(start + 2 * 60 * 60 * 1000).toISOString(), status, link: s.meetingUrl || '#' };
    });
  }, [liveSessionsQuery.data]);

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
    if (!forumSelecionado || !studentId) return
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="avisos">Avisos</TabsTrigger>
              <TabsTrigger value="materiais">Materiais</TabsTrigger>
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
              <TabsTrigger value="forum">Fórum</TabsTrigger>
              <TabsTrigger value="videoaulas">Vídeo-aulas</TabsTrigger>
              <TabsTrigger value="videochamadas">Vídeo-chamadas</TabsTrigger>
              <TabsTrigger value="provas-online">Provas Online</TabsTrigger>
              <TabsTrigger value="notas">Notas</TabsTrigger>
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
                              {(() => {
                                const first = Array.isArray(material.fileUrl) ? material.fileUrl[0] : undefined
                                const ext = first ? first.split('.').pop()?.toUpperCase() : ''
                                return material.type ?? (ext || '')
                              })()}
                              {material.sizeBytes ? ` • ${(material.sizeBytes / (1024 * 1024)).toFixed(2)} MB` : ''}
                              {(material.uploadedAt || material.createdAt) ? ` • ${new Date((material.uploadedAt || material.createdAt) as string).toLocaleDateString('pt-BR')}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {((Array.isArray(material.fileUrl) ? material.fileUrl : (material.fileUrl ? [material.fileUrl] : [])) as string[]).map((url: string, idx: number) => {
                            const downloadKey = `${material.id}-${url}`
                            const isDownloading = downloadingFiles.has(downloadKey)
                            
                            // Função para extrair o nome original do arquivo (remove timestamp e nanoid)
                            const extractOriginalFileName = (fileName: string): string => {
                              // Formato: timestamp-nanoid-nomeOriginal
                              const parts = fileName.split('-')
                              if (parts.length >= 3) {
                                // Remove os dois primeiros elementos (timestamp e nanoid)
                                return parts.slice(2).join('-')
                              }
                              return fileName
                            }
                            
                            const name = (() => {
                              try {
                                const u = new URL(url)
                                const fileName = decodeURIComponent(u.pathname.split('/').pop() || `arquivo-${idx + 1}`)
                                return extractOriginalFileName(fileName)
                              } catch {
                                const fileName = decodeURIComponent(url.split('/').pop() || `arquivo-${idx + 1}`)
                                return extractOriginalFileName(fileName)
                              }
                            })()
                            
                            const handleDownload = async () => {
                              if (!material.id) return
                              setDownloadingFiles(prev => new Set(prev).add(downloadKey))
                              try {
                                await apiClient.downloadMaterialAttachment(material.id, url)
                                toast({
                                  title: "Download iniciado",
                                  description: `Baixando ${name}...`,
                                })
                              } catch (error) {
                                toast({
                                  title: "Erro ao fazer download",
                                  description: "Não foi possível baixar o arquivo. Tente novamente.",
                                  variant: "destructive",
                                })
                              } finally {
                                setDownloadingFiles(prev => {
                                  const next = new Set(prev)
                                  next.delete(downloadKey)
                                  return next
                                })
                              }
                            }
                            
                            return (
                              <Button 
                                key={`${material.id}-${idx}`} 
                                size="sm" 
                                onClick={handleDownload}
                                disabled={isDownloading}
                              >
                                {isDownloading ? 'Baixando...' : name}
                              </Button>
                            )
                          })}
                        </div>
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
                {(() => {
                  // Mapear tentativas por activityId
                  const attemptsByActivityId = new Map<string, ExamAttemptDTO>()
                  ;(attemptsQuery.data || []).forEach((attempt) => {
                    const activityId = attempt.exam?.activity?.id
                    if (activityId) {
                      attemptsByActivityId.set(activityId, attempt)
                    }
                  })

                  // Filtrar provas virtuais da turma
                  const virtualExams = (examsQuery.data || []).filter(
                    (exam) => exam.activity?.class?.id === classId && exam.activity?.type === 'virtual_exam'
                  )

                  // Combinar atividades normais e provas virtuais
                  const allActivities: Array<ClassActivity & { type?: string; examId?: string; exam?: ExamDTO }> = [
                    ...(activitiesQuery.data || []),
                    ...virtualExams.map((exam) => ({
                      id: exam.activity.id,
                      title: exam.activity.title || 'Prova',
                      description: exam.activity.description || exam.instructions || '',
                      dueDate: exam.activity.dueDate || '',
                      type: exam.activity.type,
                      maxScore: exam.activity.maxScore || null,
                      examId: exam.id,
                      exam: exam,
                    } as ClassActivity & { type: string; examId: string; exam: ExamDTO })),
                  ]

                  return allActivities.map((atividade: ClassActivity & { type?: string; examId?: string; exam?: ExamDTO }) => {
                    const isVirtualExam = atividade.type === 'virtual_exam'
                    const attempt = isVirtualExam ? attemptsByActivityId.get(atividade.id) : undefined
                    const isFinalized = attempt && (attempt.status === 'submitted' || attempt.status === 'graded')
                    
                    // Para atividades normais, usar lógica existente
                    if (!isVirtualExam) {
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
                                <Badge variant={badgeVariant as any}>
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
                      )
                    }

                    // Para provas virtuais
                    const startDate = atividade.exam?.activity?.startDate ? new Date(atividade.exam.activity.startDate) : null
                    const dueDate = atividade.exam?.activity?.dueDate ? new Date(atividade.exam.activity.dueDate) : null
                    const now = new Date()
                    const isNotStarted = startDate && startDate > now
                    const isPastDue = dueDate && dueDate < now

                    return (
                      <Card key={atividade.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{atividade.title}</CardTitle>
                              <CardDescription>
                                {startDate && (
                                  <>Disponível a partir de: {startDate.toLocaleString('pt-BR')} • </>
                                )}
                                {dueDate ? `Prazo final: ${dueDate.toLocaleString('pt-BR')}` : 'Sem prazo definido'}
                                {atividade.exam?.timeLimitMinutes && ` • Tempo limite: ${atividade.exam.timeLimitMinutes} minutos`}
                                {atividade.exam?.questions && ` • ${atividade.exam.questions.length} questão(ões)`}
                              </CardDescription>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isFinalized && attempt?.score !== null && attempt?.score !== undefined && (
                                <Badge variant="default">
                                  Nota: {attempt.score.toFixed(2)} / {atividade.exam?.activity?.maxScore || atividade.exam?.questions?.reduce((sum, q) => sum + q.points, 0) || 0}
                                </Badge>
                              )}
                              <Badge variant={isFinalized ? "default" : "secondary"}>
                                {isFinalized ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Feito
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Pendente
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-4">{atividade.description}</p>
                          {atividade.exam?.instructions && (
                            <div className="mb-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-1">Instruções:</p>
                              <p className="text-sm">{atividade.exam.instructions}</p>
                            </div>
                          )}
                          {isFinalized && (
                            <div className="mb-4 space-y-2">
                              <div className="p-3 bg-primary/10 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">Nota:</p>
                                  <p className="text-sm font-semibold">
                                    {attempt?.score !== null && attempt?.score !== undefined
                                      ? `${attempt.score.toFixed(2)}`
                                      : 'Aguardando correção'} / {atividade.exam?.activity?.maxScore || atividade.exam?.questions?.reduce((sum, q) => sum + q.points, 0) || 0}
                                  </p>
                                </div>
                              </div>
                              {atividade.exam?.activity?.maxScore && (
                                <div className="p-3 bg-muted rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Peso:</p>
                                    <p className="text-sm font-semibold">{atividade.exam?.activity?.maxScore} pontos</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {!isFinalized && (
                            <div className="border-t pt-4">
                              <Button
                                onClick={() => setActiveTab('provas-online')}
                                className="w-full"
                                variant="default"
                              >
                                <FileCheck className="h-4 w-4 mr-2" />
                                Fazer Prova
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                })()}
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
                {videoAulas.length > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(videoAulas.filter(v => v.visto).length / videoAulas.length) * 100}%` }}
                    ></div>
                  </div>
                )}

                {videoLessonsQuery.isLoading && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Carregando video-aulas...</p>
                    </CardContent>
                  </Card>
                )}

                {!videoLessonsQuery.isLoading && videoAulas.length === 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Nenhuma video-aula disponível ainda.</p>
                    </CardContent>
                  </Card>
                )}

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
                  const dataInicio = new Date(reuniao.startAt)
                  const dataTermino = new Date(reuniao.endAt)
                  const podeEntrar = reuniao.status === 'disponivel'
                  const statusLabel = reuniao.status === 'agendada' ? 'Agendada' : reuniao.status === 'disponivel' ? 'Disponível' : 'Encerrada'
                  const statusVariant = reuniao.status === 'disponivel' ? 'default' : reuniao.status === 'agendada' ? 'secondary' : 'destructive'
                  return (
                    <Card key={reuniao.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{reuniao.titulo}</CardTitle>
                            <CardDescription className="mt-2 space-y-1">
                              <div className="flex items-center gap-1">
                                <CalendarClock className="h-3 w-3" />
                                <span>Início: {dataInicio.toLocaleString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarClock className="h-3 w-3" />
                                <span>Término: {dataTermino.toLocaleString('pt-BR')}</span>
                              </div>
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusVariant as any}>{statusLabel}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-end">
                          <Button size="sm" variant={podeEntrar ? 'default' : 'outline'} disabled={!podeEntrar} onClick={() => entrarNaVideoChamada(reuniao)}>
                            <Video className="h-4 w-4 mr-2"/> Entrar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="provas-online">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileCheck className="h-5 w-5 mr-2" />
                  Provas Online
                </h3>
                {examsQuery.isLoading && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Carregando provas...</CardTitle>
                    </CardHeader>
                  </Card>
                )}
                {(() => {
                  // Filtrar provas da turma atual
                  const classExams = (examsQuery.data || []).filter(
                    (exam) => exam.activity?.class?.id === classId && exam.activity?.type === 'virtual_exam'
                  )

                  // Mapear tentativas por examId
                  const attemptsByExamId = new Map<string, ExamAttemptDTO>()
                  ;(attemptsQuery.data || []).forEach((attempt) => {
                    // Tentar obter examId de diferentes formas
                    const examId = attempt.examId || attempt.exam?.id
                    if (examId) {
                      // Se já existe uma tentativa para este exam, manter apenas a mais recente
                      const existing = attemptsByExamId.get(examId)
                      if (!existing || new Date(attempt.createdAt) > new Date(existing.createdAt)) {
                        attemptsByExamId.set(examId, attempt)
                      }
                    }
                  })

                  if (classExams.length === 0 && !examsQuery.isLoading) {
                    return (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-muted-foreground">Nenhuma prova online disponível no momento.</p>
                        </CardContent>
                      </Card>
                    )
                  }

                  return classExams.map((exam) => {
                    const attempt = attemptsByExamId.get(exam.id)
                    const startDate = exam.activity?.startDate ? new Date(exam.activity.startDate) : null
                    const dueDate = exam.activity?.dueDate ? new Date(exam.activity.dueDate) : null
                    const now = new Date()
                    const isNotStarted = startDate && startDate > now
                    const isPastDue = dueDate && dueDate < now
                    const isAvailable = (!startDate || startDate <= now) && (!dueDate || dueDate >= now)
                    const isFinalized = attempt && (attempt.status === 'submitted' || attempt.status === 'graded')
                    const canStart = isAvailable && (!attempt || attempt.status === 'in_progress') && !isFinalized
                    const canViewResult = isFinalized

                    let statusLabel = 'Disponível'
                    let statusVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default'
                    let actionLabel = 'Iniciar Prova'
                    let ActionIconComponent: React.ComponentType<{ className?: string }> = FileCheck

                    if (isNotStarted) {
                      statusLabel = 'Ainda Não Disponível'
                      statusVariant = 'secondary'
                      actionLabel = 'Aguardando Início'
                    } else if (attempt) {
                      if (attempt.status === 'in_progress') {
                        statusLabel = 'Em Andamento'
                        statusVariant = 'secondary'
                        actionLabel = 'Continuar Prova'
                        ActionIconComponent = Clock
                      } else if (attempt.status === 'submitted') {
                        statusLabel = 'Feito'
                        statusVariant = 'default'
                        actionLabel = exam.autoGrade ? 'Ver Resultado' : 'Aguardando Correção'
                        ActionIconComponent = CheckCircle
                      } else if (attempt.status === 'graded') {
                        statusLabel = 'Feito'
                        statusVariant = 'default'
                        actionLabel = 'Ver Resultado'
                        ActionIconComponent = CheckCircle
                      }
                    } else if (isPastDue) {
                      statusLabel = 'Prazo Expirado'
                      statusVariant = 'destructive'
                      actionLabel = 'Prazo Expirado'
                    }

                    return (
                      <Card key={exam.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{exam.activity?.title || 'Prova'}</CardTitle>
                              <CardDescription>
                                {startDate && (
                                  <>Disponível a partir de: {startDate.toLocaleString('pt-BR')} • </>
                                )}
                                {dueDate ? `Prazo final: ${dueDate.toLocaleString('pt-BR')}` : 'Sem prazo definido'}
                                {exam.timeLimitMinutes && ` • Tempo limite: ${exam.timeLimitMinutes} minutos`}
                                {exam.questions && ` • ${exam.questions.length} questão(ões)`}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={statusVariant}>{statusLabel}</Badge>
                              {exam.autoGrade ? (
                                <Badge variant="outline">Auto-Correção</Badge>
                              ) : (
                                <Badge variant="outline">Correção Manual</Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {exam.activity?.description && (
                            <p className="text-sm text-muted-foreground mb-4">{exam.activity.description}</p>
                          )}
                          {exam.instructions && (
                            <div className="mb-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-1">Instruções:</p>
                              <p className="text-sm">{exam.instructions}</p>
                            </div>
                          )}
                          {isFinalized && (
                            <div className="mb-4 space-y-2">
                              <div className="p-3 bg-primary/10 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">Nota:</p>
                                  <p className="text-sm font-semibold">
                                    {attempt?.score !== null && attempt?.score !== undefined
                                      ? `${attempt.score.toFixed(2)}`
                                      : 'Aguardando correção'} / {exam.activity?.maxScore || exam.questions?.reduce((sum, q) => sum + q.points, 0) || 0}
                                  </p>
                                </div>
                              </div>
                              {exam.activity?.maxScore && (
                                <div className="p-3 bg-muted rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Peso:</p>
                                    <p className="text-sm font-semibold">{exam.activity.maxScore} pontos</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-end gap-2">
                            {/* Botão de iniciar/continuar - só aparece se não estiver finalizada E pode iniciar */}
                            {!isFinalized && canStart && attempt?.status !== 'submitted' && attempt?.status !== 'graded' && (
                              <Button
                                onClick={async () => {
                                  if (!studentId) return
                                  try {
                                    // Verificar novamente se não há tentativa finalizada antes de abrir
                                    const currentAttempts = await listAttemptsByStudent(studentId)
                                    const currentAttempt = currentAttempts.find(a => a.examId === exam.id)
                                    
                                    if (currentAttempt && (currentAttempt.status === 'submitted' || currentAttempt.status === 'graded')) {
                                      toast({
                                        title: "Prova já finalizada",
                                        description: "Você já finalizou esta prova. Use o botão 'Ver Resultado' para visualizar.",
                                        variant: "destructive",
                                      })
                                      // Recarregar tentativas
                                      attemptsQuery.refetch()
                                      return
                                    }
                                    
                                    // Carregar exam completo com questões se necessário
                                    let examCompleto = exam
                                    if (!exam.questions || exam.questions.length === 0) {
                                      examCompleto = await getExamById(exam.id)
                                    }
                                    setExamSelecionado(examCompleto)
                                    setAttemptAtual(currentAttempt || attempt || null)
                                    setModalRealizarProvaOpen(true)
                                  } catch (error: any) {
                                    toast({
                                      title: "Erro ao carregar prova",
                                      description: error?.message || "Não foi possível carregar a prova.",
                                      variant: "destructive",
                                    })
                                  }
                                }}
                              >
                                <ActionIconComponent className="h-4 w-4 mr-2" />
                                {actionLabel}
                              </Button>
                            )}
                            {/* Botão de ver resultado - só aparece se estiver finalizada */}
                            {isFinalized && attempt && (
                              <Button
                                onClick={() => {
                                  setAttemptIdParaResultado(attempt.id)
                                  setModalResultadoProvaOpen(true)
                                }}
                              >
                                <ActionIconComponent className="h-4 w-4 mr-2" />
                                {actionLabel}
                              </Button>
                            )}
                            {/* Botão desabilitado para casos especiais */}
                            {!isFinalized && (isNotStarted || (isPastDue && !attempt)) && (
                              <Button disabled variant="outline">
                                {actionLabel}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                })()}
              </div>
            </TabsContent>

            <TabsContent value="notas">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Notas da Disciplina
                </h3>
                
                {(() => {
                  // Verificar se está carregando
                  if (enrollmentQuery.isLoading || gradesQuery.isLoading || activitiesQuery.isLoading) {
                    return (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-muted-foreground">Carregando notas...</p>
                        </CardContent>
                      </Card>
                    )
                  }

                  // Verificar se não há enrollment
                  if (!enrollmentQuery.data) {
                    return (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-muted-foreground">Você não está matriculado nesta turma.</p>
                        </CardContent>
                      </Card>
                    )
                  }

                  const enrollmentId = enrollmentQuery.data.id
                  const activities = activitiesQuery.data || []
                  const grades = gradesQuery.data || []
                  const attempts = attemptsQuery.data || []

                  // Criar mapa de notas por activityId (considerando grades e activity_submissions)
                  const gradeMap = new Map<string, { score: number; gradedAt: string | null }>()
                  grades.forEach((grade: GradeDTO) => {
                    if (grade.activity?.id) {
                      gradeMap.set(grade.activity.id, {
                        score: grade.score,
                        gradedAt: grade.gradedAt
                      })
                    }
                  })

                  // Também considerar notas de provas online (virtual_exam)
                  attempts.forEach((attempt) => {
                    const activityId = attempt.exam?.activity?.id
                    if (activityId && attempt.score !== null && attempt.score !== undefined) {
                      gradeMap.set(activityId, {
                        score: attempt.score,
                        gradedAt: attempt.createdAt || null
                      })
                    }
                  })

                  // Considerar também activity_submissions.grade
                  Object.values(submissionStatusByActivity).forEach((status) => {
                    if (status.grade !== null && status.grade !== undefined) {
                      gradeMap.set(status.activityId, {
                        score: status.grade,
                        gradedAt: status.submittedAt || null
                      })
                    }
                  })

                  // Combinar atividades com notas e incluir campo unit
                  interface ActivityWithGrade extends ClassActivity {
                    unit?: string | null
                    type?: string
                    maxScore?: number | null
                    grade?: { score: number; gradedAt: string | null } | null
                  }

                  const activitiesWithGrades: ActivityWithGrade[] = activities.map((activity: any) => {
                    const grade = gradeMap.get(activity.id)
                    // Suporta tanto camelCase quanto snake_case
                    const maxScore = activity.maxScore ?? activity.max_score ?? null
                    return {
                      ...activity,
                      unit: activity.unit || null,
                      type: activity.type || 'homework',
                      maxScore: maxScore !== null ? Number(maxScore) : null,
                      grade: grade || null
                    }
                  })

                  // Adicionar provas online que podem não estar em activities
                  const virtualExams = (examsQuery.data || []).filter(
                    (exam) => exam.activity?.class?.id === classId && exam.activity?.type === 'virtual_exam'
                  )
                  
                  virtualExams.forEach((exam) => {
                    const activityId = exam.activity?.id
                    if (activityId && !activitiesWithGrades.find(a => a.id === activityId)) {
                      const attempt = attempts.find((a: ExamAttemptDTO) => 
                        a.examId === exam.id || a.exam?.id === exam.id
                      )
                      activitiesWithGrades.push({
                        id: activityId,
                        title: exam.activity.title || 'Prova',
                        description: exam.activity.description || exam.instructions || '',
                        dueDate: exam.activity.dueDate || '',
                        unit: exam.activity.unit || null,
                        type: 'virtual_exam',
                        maxScore: exam.activity.maxScore || null,
                        grade: attempt && attempt.score !== null && attempt.score !== undefined
                          ? { score: attempt.score, gradedAt: attempt.createdAt || null }
                          : null
                      })
                    }
                  })

                  // Agrupar por unidade
                  const activitiesByUnit = new Map<string, ActivityWithGrade[]>()
                  activitiesWithGrades.forEach((activity) => {
                    const unit = activity.unit || 'Sem Unidade'
                    if (!activitiesByUnit.has(unit)) {
                      activitiesByUnit.set(unit, [])
                    }
                    activitiesByUnit.get(unit)!.push(activity)
                  })

                  // Se não houver atividades, mostrar mensagem
                  if (activitiesByUnit.size === 0) {
                    return (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <p className="text-muted-foreground">Nenhuma atividade disponível para exibir notas.</p>
                        </CardContent>
                      </Card>
                    )
                  }

                  // Ordenar unidades: 1ª Unidade, 2ª Unidade, Prova Final, depois outras
                  const unitOrder = ['1ª Unidade', '2ª Unidade', 'Prova Final']
                  const sortedUnits = Array.from(activitiesByUnit.keys()).sort((a, b) => {
                    const aIndex = unitOrder.indexOf(a)
                    const bIndex = unitOrder.indexOf(b)
                    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
                    if (aIndex !== -1) return -1
                    if (bIndex !== -1) return 1
                    return a.localeCompare(b)
                  })

                  return sortedUnits.map((unit) => {
                    const unitActivities = activitiesByUnit.get(unit) || []
                    
                    // Calcular totais
                    const totalScore = unitActivities.reduce((sum, a) => {
                      return sum + (a.grade?.score || 0)
                    }, 0)
                    
                    const totalWeight = unitActivities.reduce((sum, a) => {
                      return sum + (a.maxScore || 0)
                    }, 0)
                    
                    const missingPoints = Math.max(0, 10 - totalWeight)
                    const hasMissingPoints = missingPoints > 0

                    // Formatar nome do tipo de atividade
                    const formatActivityType = (type: string) => {
                      const typeMap: Record<string, string> = {
                        'homework': 'Tarefa',
                        'exam': 'Prova',
                        'virtual_exam': 'Prova Online',
                        'project': 'Projeto'
                      }
                      return typeMap[type] || type
                    }

                    return (
                      <Card key={unit}>
                        <CardHeader>
                          <CardTitle className="text-xl">{unit}</CardTitle>
                          {hasMissingPoints && (
                            <Alert variant="destructive" className="mt-4">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Atenção</AlertTitle>
                              <AlertDescription>
                                Faltam {missingPoints.toFixed(2)} pontos para completar os 10 pontos desta unidade. 
                                Uma atividade, prova ou prova online ainda precisa ser criada.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-3 font-semibold">Atividade</th>
                                  <th className="text-left p-3 font-semibold">Tipo</th>
                                  <th className="text-center p-3 font-semibold">Nota</th>
                                  <th className="text-center p-3 font-semibold">Peso</th>
                                </tr>
                              </thead>
                              <tbody>
                                {unitActivities.map((activity) => (
                                  <tr key={activity.id} className="border-b hover:bg-muted/50">
                                    <td className="p-3">{activity.title}</td>
                                    <td className="p-3">
                                      <Badge variant="outline">
                                        {formatActivityType(activity.type || 'homework')}
                                      </Badge>
                                    </td>
                                    <td className="p-3 text-center">
                                      {activity.grade ? (
                                        <span className="font-medium">{activity.grade.score.toFixed(2)}</span>
                                      ) : (
                                        <span className="text-muted-foreground">—</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-center">
                                      {activity.maxScore ? (
                                        <span>{activity.maxScore.toFixed(2)}</span>
                                      ) : (
                                        <span className="text-muted-foreground">—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                                <tr className="border-t-2 font-semibold bg-muted/30">
                                  <td className="p-3" colSpan={2}>Total</td>
                                  <td className="p-3 text-center">
                                    {totalScore > 0 ? totalScore.toFixed(2) : '—'}
                                  </td>
                                  <td className="p-3 text-center">
                                    {totalWeight > 0 ? totalWeight.toFixed(2) : '—'}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                })()}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      <ModalVideoChamada
        isOpen={modalVideoChamadaAberto}
        onClose={handleLeaveLiveSession}
        titulo={videoChamadaSelecionada?.titulo}
        dataHora={videoChamadaSelecionada?.dataHora}
      >
        <div className="flex flex-col h-full gap-4">
          {/* Controles */}
          <div className="flex items-center justify-between gap-2">
            {/* Controles do Aluno */}
            <div className="flex items-center gap-2">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                {isMuted ? "Microfone Desligado" : "Silenciar"}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "outline"}
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4 mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                {isVideoOff ? "Câmera Desligada" : "Desligar Câmera"}
              </Button>
            </div>

            {/* Controles de Compartilhamento */}
            <div className="flex items-center gap-2">
              {!isScreenSharing ? (
                <div className="relative" ref={screenShareMenuRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScreenShareMenuOpen(!screenShareMenuOpen)}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Compartilhar Tela
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                  {screenShareMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow-lg z-50">
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-t-md"
                        onClick={() => {
                          startScreenSharing('screen');
                          setScreenShareMenuOpen(false);
                        }}
                      >
                        Tela Inteira
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => {
                          startScreenSharing('window');
                          setScreenShareMenuOpen(false);
                        }}
                      >
                        Janela
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-b-md"
                        onClick={() => {
                          startScreenSharing('browser');
                          setScreenShareMenuOpen(false);
                        }}
                      >
                        Aba do Navegador
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    stopScreenSharing();
                    setScreenShareMenuOpen(false);
                  }}
                >
                  <MonitorStop className="h-4 w-4 mr-2" />
                  Parar Compartilhamento
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Vídeo Local */}
            <div className="relative">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-md bg-black"></video>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                {isScreenSharing ? 'Sua Tela' : 'Sua Câmera'}
              </div>
            </div>
            
            {/* Grid para Vídeos Remotos */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
              {remoteStreams.size > 0 ? (
                Array.from(remoteStreams.entries()).map(([socketId, stream]) => (
                  <div key={socketId} className="relative">
                    <RemoteVideo stream={stream} />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                      Participante
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 row-span-2 flex items-center justify-center bg-muted/50 rounded-md">
                  <p className="text-muted-foreground">Aguardando participantes...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalVideoChamada>
      <ModalDiscussaoForum
        isOpen={modalDiscussaoOpen}
        onClose={() => setModalDiscussaoOpen(false)}
        forum={forumSelecionado}
        onResponder={handleResponderDiscussao}
      />
      {examSelecionado && (
        <ModalRealizarProva
          isOpen={modalRealizarProvaOpen}
          onClose={() => {
            setModalRealizarProvaOpen(false)
            setExamSelecionado(null)
            setAttemptAtual(null)
            // Recarregar tentativas
            attemptsQuery.refetch()
          }}
          exam={examSelecionado}
          attempt={attemptAtual}
          onFinalizar={(submittedAttempt) => {
            setModalRealizarProvaOpen(false)
            setExamSelecionado(null)
            setAttemptAtual(null)
            // Recarregar tentativas e provas para atualizar a UI
            attemptsQuery.refetch()
            examsQuery.refetch()
            // Se autoGrade, mostrar resultado imediatamente
            if (examSelecionado.autoGrade) {
              setAttemptIdParaResultado(submittedAttempt.id)
              setModalResultadoProvaOpen(true)
            } else {
              toast({
                title: "Prova submetida",
                description: "Aguarde a correção manual do professor.",
              })
            }
          }}
        />
      )}
      <ModalResultadoProva
        isOpen={modalResultadoProvaOpen}
        onClose={() => {
          setModalResultadoProvaOpen(false)
          setAttemptIdParaResultado(null)
          // Recarregar tentativas para atualizar a UI
          attemptsQuery.refetch()
          examsQuery.refetch()
        }}
        attemptId={attemptIdParaResultado}
      />
    </div>
  )
}
