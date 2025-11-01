"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Bell, FileText, Upload, CheckCircle, Clock, AlertCircle, MessageSquare, MessageCircle, Video, Play, Eye, EyeOff, CalendarClock } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from 'react'
import { ModalDiscussaoForum, ModalVideoAula, ModalVideoChamada } from '@/components/modals'
import { useMutation } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

export default function DisciplinaDetalhePage() {
  const disciplina = {
    nome: "Matemática",
    codigo: "MAT001",
    professor: "Prof. Carlos Silva",
    progresso: 75,
  }

  const avisos = [
    {
      titulo: "Prova de Álgebra - Próxima Semana",
      data: "15/03/2024",
      conteudo: "A prova abordará os tópicos: equações do 2º grau, sistemas lineares e funções quadráticas.",
    },
    {
      titulo: "Material Complementar Disponível",
      data: "12/03/2024",
      conteudo: "Adicionei exercícios extras sobre funções no material da disciplina.",
    },
  ]

  const materiais = [
    { nome: "Apostila - Funções Quadráticas", tipo: "PDF", tamanho: "2.5 MB", data: "10/03/2024" },
    { nome: "Lista de Exercícios 03", tipo: "PDF", tamanho: "1.2 MB", data: "08/03/2024" },
    { nome: "Vídeo Aula - Sistemas Lineares", tipo: "MP4", tamanho: "45 MB", data: "05/03/2024" },
  ]

  const atividades = [
    {
      titulo: "Lista de Exercícios - Funções",
      prazo: "20/03/2024",
      status: "Pendente",
      nota: null,
      descricao: "Resolver exercícios 1 a 15 da apostila",
    },
    {
      titulo: "Trabalho em Grupo - Aplicações",
      prazo: "25/03/2024",
      status: "Em andamento",
      nota: null,
      descricao: "Apresentar aplicações práticas de funções quadráticas",
    },
    {
      titulo: "Prova Bimestral",
      prazo: "15/03/2024",
      status: "Concluída",
      nota: 8.5,
      descricao: "Avaliação sobre todo o conteúdo do bimestre",
    },
  ]

  const [forums, setForums] = useState<any[]>([
    {
      id: 1,
      titulo: "Dúvidas sobre Funções Quadráticas",
      descricao: "Espaço para dúvidas e discussões sobre funções quadráticas.",
      autor: "Prof. Carlos Silva",
      dataCriacao: "15/03/2024",
      comentarios: [
        { id: 1, autor: "Ana Silva", texto: "Como encontro o vértice?", data: "16/03/2024 14:30" },
        { id: 2, autor: "João Pedro", texto: "x = -b/2a resolve a abscissa do vértice.", data: "16/03/2024 15:10" },
      ]
    },
    {
      id: 2,
      titulo: "Trabalho em Grupo - Aplicações",
      descricao: "Troca de ideias para o trabalho em grupo.",
      autor: "Prof. Carlos Silva",
      dataCriacao: "18/03/2024",
      comentarios: [
        { id: 1, autor: "Marina", texto: "Podemos usar um exemplo de otimização?", data: "18/03/2024 16:20" },
      ]
    }
  ])
  const [modalDiscussaoOpen, setModalDiscussaoOpen] = useState(false)
  const [forumSelecionado, setForumSelecionado] = useState<any>(null)

  // Upload activity states
  const [uploadFiles, setUploadFiles] = useState<Record<number, File | null>>({})
  const [uploadComments, setUploadComments] = useState<Record<number, string>>({})

  // Upload activity mutation
  const uploadActivityMutation = useMutation({
    mutationFn: async ({ activityId, file, comment }: { activityId: number; file: File; comment: string }) => {
      // TODO: Replace with actual API call
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Update activity status locally
      const activityIndex = atividades.findIndex(a => a.titulo === atividade.titulo)
      if (activityIndex !== -1) {
        atividades[activityIndex] = {
          ...atividades[activityIndex],
          status: 'Concluída',
          nota: null
        }
      }

      return { activityId, fileName: file.name }
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Atividade enviada com sucesso! 🎉",
        description: `${variables.fileName} foi enviada para a atividade.`,
      })
      // Clear upload state
      setUploadFiles(prev => ({ ...prev, [variables.activityId]: null }))
      setUploadComments(prev => ({ ...prev, [variables.activityId]: '' }))
    },
    onError: (error, variables) => {
      toast({
        title: "Erro ao enviar atividade",
        description: "Verifique o arquivo e tente novamente.",
        variant: "destructive",
      })
    },
  })

  const handleFileChange = (activityId: number, file: File | null) => {
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

  const handleSubmitActivity = (atividade: any) => {
    const file = uploadFiles[atividade.id]
    const comment = uploadComments[atividade.id] || ''

    if (!file) {
      toast({
        title: "Selecione um arquivo",
        description: "É necessário anexar um arquivo para enviar a atividade.",
        variant: "destructive",
      })
      return
    }

    uploadActivityMutation.mutate({
      activityId: atividade.id,
      file,
      comment
    })
  }

  // Vídeo-aulas
  const [videoAulas, setVideoAulas] = useState<Array<{ id: number; titulo: string; duracao: string; visto: boolean; url: string }>>([
    { id: 1, titulo: 'Introdução às Funções', duracao: '12:30', visto: true, url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    { id: 2, titulo: 'Funções Quadráticas - Parte 1', duracao: '18:05', visto: false, url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    { id: 3, titulo: 'Vértice e Forma Canônica', duracao: '15:42', visto: false, url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    { id: 4, titulo: 'Aplicações Práticas', duracao: '20:10', visto: false, url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  ])
  const [videoAulaSelecionadaId, setVideoAulaSelecionadaId] = useState<number | null>(null)
  const [modalVideoAulaAberto, setModalVideoAulaAberto] = useState(false)
  const videoAulaSelecionada = useMemo(() => videoAulas.find(v => v.id === videoAulaSelecionadaId) || null, [videoAulas, videoAulaSelecionadaId])

  // Mutation for marking video as watched
  const markAsWatchedMutation = useMutation({
    mutationFn: async (videoId: number) => {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 300))
      return videoId
    },
    onSuccess: (videoId) => {
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

  const handleVerDiscussao = (forum: any) => {
    setForumSelecionado(forum)
    setModalDiscussaoOpen(true)
  }

  const handleResponderDiscussao = (texto: string, parentId?: number) => {
    if (!forumSelecionado) return
    setForums(prev => prev.map(f => {
      if (f.id !== forumSelecionado.id) return f
      const novoId = Math.max(0, ...f.comentarios.map((c: any) => c.id)) + 1
      const mencionado = parentId ? (f.comentarios.find((c: any) => c.id === parentId)?.autor || '') : ''
      const novo = {
        id: novoId,
        autor: 'Você',
        texto: mencionado ? `@${mencionado} ${texto}` : texto,
        data: new Date().toLocaleString('pt-BR'),
        ...(parentId ? { parentId } : {})
      }
      return { ...f, comentarios: [...f.comentarios, novo] }
    }))
    setForumSelecionado((curr: any) => curr ? {
      ...curr,
      comentarios: [
        ...curr.comentarios,
        {
          id: Math.max(0, ...curr.comentarios.map((c: any) => c.id)) + 1,
          autor: 'Você',
          texto: parentId ? `@${curr.comentarios.find((c: any) => c.id === parentId)?.autor || ''} ${texto}` : texto,
          data: new Date().toLocaleString('pt-BR'),
          ...(parentId ? { parentId } : {})
        }
      ]
    } : curr)
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
                {avisos.map((aviso, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{aviso.titulo}</CardTitle>
                          <CardDescription>{aviso.data}</CardDescription>
                        </div>
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{aviso.conteudo}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="materiais">
              <div className="space-y-4">
                {materiais.map((material, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-medium">{material.nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              {material.tipo} • {material.tamanho} • {material.data}
                            </p>
                          </div>
                        </div>
                        <Button size="sm">Download</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="atividades">
              <div className="space-y-4">
                {atividades.map((atividade, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{atividade.titulo}</CardTitle>
                          <CardDescription>Prazo: {atividade.prazo}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {atividade.nota && <Badge variant="default">Nota: {atividade.nota}</Badge>}
                          <Badge
                            variant={
                              atividade.status === "Concluída"
                                ? "default"
                                : atividade.status === "Em andamento"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {atividade.status === "Concluída" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {atividade.status === "Em andamento" && <Clock className="h-3 w-3 mr-1" />}
                            {atividade.status === "Pendente" && <AlertCircle className="h-3 w-3 mr-1" />}
                            {atividade.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{atividade.descricao}</p>
                      {atividade.status === "Pendente" && (
                        <div className="space-y-4 border-t pt-4">
                          <div>
                            <Label htmlFor={`arquivo-${atividade.id}`}>Enviar Arquivo</Label>
                            <Input
                              id={`arquivo-${atividade.id}`}
                              type="file"
                              className="mt-1"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                              onChange={(e) => handleFileChange(atividade.id, e.target.files?.[0] || null)}
                            />
                            {uploadFiles[atividade.id] && (
                              <p className="text-sm text-green-600 mt-1 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                {uploadFiles[atividade.id]?.name} ({(uploadFiles[atividade.id]?.size! / 1024).toFixed(1)} KB)
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor={`comentario-${atividade.id}`}>Comentário (opcional)</Label>
                            <Textarea
                              id={`comentario-${atividade.id}`}
                              placeholder="Adicione um comentário..."
                              className="mt-1"
                              value={uploadComments[atividade.id] || ''}
                              onChange={(e) => setUploadComments(prev => ({ ...prev, [atividade.id]: e.target.value }))}
                            />
                          </div>
                          <Button
                            onClick={() => handleSubmitActivity(atividade)}
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
                ))}
              </div>
            </TabsContent>

            <TabsContent value="forum">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fórum da Disciplina</h3>
                {forums.map((forum) => (
                  <Card key={forum.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{forum.titulo}</CardTitle>
                          <CardDescription>
                            Criado por {forum.autor} em {forum.dataCriacao}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{forum.comentarios.length} comentários</Badge>
                          <Button size="sm" variant="outline" onClick={() => handleVerDiscussao(forum)}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{forum.descricao}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Última atualização: {forum.comentarios[forum.comentarios.length - 1]?.data || forum.dataCriacao}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => handleVerDiscussao(forum)}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Ver Discussão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
