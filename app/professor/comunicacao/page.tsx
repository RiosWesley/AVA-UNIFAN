"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/layout/sidebar"
import { Send, Plus, Bell, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { ModalNovaMensagem, ModalAviso, ModalConfirmacao } from "@/components/modals"
import type { AvisoData } from "@/components/modals"
import type { ComboboxOption } from "@/components/ui/combobox"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { useRouter } from "next/navigation"
import { PageSpinner } from "@/components/ui/page-spinner"

export default function ProfessorComunicacaoPage() {
  const router = useRouter()
  const [isNovaMensagemOpen, setIsNovaMensagemOpen] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  type InboxItem = {
    otherUser: { id: string; name: string; email: string }
    lastMessage: { id: string; content: string; sentAt: string; isRead: boolean }
    unreadCount: number
  }
  const [inbox, setInbox] = useState<InboxItem[]>([])
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Array<{ id: string; content: string; sentAt: string; senderId: string; receiverId?: string }>>([])
  const [replyText, setReplyText] = useState<string>("")
  const [otherUserRole, setOtherUserRole] = useState<string | null>(null)

  const fetchInbox = async () => {
    if (!API_URL || !currentUserId) return
    try {
      const res = await fetch(`${API_URL}/messages/inbox`, {
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUserId },
      })
      if (!res.ok) throw new Error('Erro ao carregar inbox')
      const data = await res.json()
      const normalized: InboxItem[] = (Array.isArray(data) ? data : []).map((i: any) => ({
        ...i,
        lastMessage: { ...i.lastMessage, sentAt: i.lastMessage?.sentAt ?? new Date().toISOString() },
      }))
      setInbox(normalized)
    } catch {
      setInbox([])
    }
  }

  const fetchConversation = async (otherId: string) => {
    if (!API_URL || !currentUserId) return
    try {
      const res = await fetch(`${API_URL}/messages/conversation/${otherId}`, {
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUserId },
      })
      if (!res.ok) throw new Error('Erro ao carregar conversa')
      const list = await res.json()
      const items = (Array.isArray(list) ? list : []).map((m: any) => ({
        id: m.id as string,
        content: m.content as string,
        sentAt: m.sentAt,
        senderId: m.sender?.id as string,
        receiverId: m.receiver?.id as string | undefined,
      }))
      setConversation(items)

      let detectedRole: string | null = null
      if (Array.isArray(list)) {
        for (const m of list) {
          const sender = (m && m.sender) || null
          const receiver = (m && m.receiver) || null
          const other = sender?.id === otherId ? sender : (receiver?.id === otherId ? receiver : null)
          const roles = other?.roles as Array<{ name: string }> | undefined
          if (roles?.some(r => r.name === 'admin')) {
            detectedRole = 'Administrador'
            break
          }
          if (roles?.some(r => r.name === 'coordinator')) {
            detectedRole = 'Coordenador'
            break
          }
          if (roles?.some(r => r.name === 'teacher')) {
            detectedRole = 'Professor'
            break
          }
          if (roles?.some(r => r.name === 'student')) {
            detectedRole = 'Aluno'
          }
        }
      }
      setOtherUserRole(detectedRole)

      // marcar como lidas as recebidas não lidas
      const unreadReceived = (Array.isArray(list) ? list : []).filter((m: any) => m.receiver?.id === currentUserId && !m.isRead)
      await Promise.all(unreadReceived.map((m: any) => (
        fetch(`${API_URL}/messages/${m.id}/read`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-user-id': currentUserId },
          body: JSON.stringify({ read: true }),
        })
      )))
      // atualizar inbox
      fetchInbox()
    } catch {
      setConversation([])
    }
  }

  const handleSelectInboxItem = (otherId: string) => {
    setSelectedOtherUserId(otherId)
    setOtherUserRole(null)
    fetchConversation(otherId)
  }

  const handleReply = async () => {
    if (!API_URL || !currentUserId || !selectedOtherUserId || !replyText.trim()) return
    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': currentUserId },
        body: JSON.stringify({
          content: replyText,
          receiverId: selectedOtherUserId,
        }),
      })
      setReplyText("")
      await fetchConversation(selectedOtherUserId)
    } catch {
      // ignore
    }
  }

  const [isAvisoOpen, setIsAvisoOpen] = useState(false)
  const [editingAviso, setEditingAviso] = useState<AvisoData | undefined>(undefined)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [avisos, setAvisos] = useState<Array<{ id: string; titulo: string; turma: string; data: string; visualizacoes: number; conteudo?: string }>>([])
  const [avisoParaExcluir, setAvisoParaExcluir] = useState<string | null>(null)
  const turmaOptions: ComboboxOption[] = [
    { id: 'all', label: 'Todos os usuários' },
    { id: 'student', label: 'Todos os alunos' },
    { id: 'teacher', label: 'Professores' },
  ]

  const mapAudienceToLabel = (audience?: string | null) => {
    if (audience === 'student') return 'Todos os alunos'
    if (audience === 'teacher') return 'Professores'
    return 'Todos os usuários'
  }

  const refreshAvisos = async () => {
    if (!API_URL) return
    try {
      const res = await fetch(`${API_URL}/notice-board?includeExpired=true`, { headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error('Erro ao listar avisos')
      const list = await res.json()
      const items = (Array.isArray(list) ? list : list?.data ?? []).map((n: any) => ({
        id: n.id as string,
        titulo: n.title as string,
        data: new Date(n.createdAt ?? n.publishedAt ?? Date.now()).toLocaleDateString('pt-BR'),
        visualizacoes: 0,
        turma: mapAudienceToLabel(n.audience),
        conteudo: n.content as string,
      }))
      setAvisos(items)
    } catch {
      setAvisos([])
    }
  }

  const handleSaveAviso = async (data: AvisoData) => {
    const audience = turmaOptions.find(o => o.label === data.turma)?.id as 'all' | 'student' | 'teacher' | undefined
    const payload: any = {
      title: data.titulo,
      content: data.conteudo ?? '',
      audience: (audience ?? 'all'),
    }
    if (data.data) {
      payload.expiresAt = data.data
    }

    try {
      if (data.id) {
        await fetch(`${API_URL}/notice-board/${data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch(`${API_URL}/notice-board`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      await refreshAvisos()
    } catch {
      // ignore
    }
  }

  const openCreateAviso = () => {
    setEditingAviso(undefined)
    setIsAvisoOpen(true)
  }

  const openEditAviso = (avisoId: string) => {
    const found = avisos.find(a => a.id === avisoId)
    if (found) {
      setEditingAviso({ id: found.id, titulo: found.titulo, turma: found.turma, data: found.data, conteudo: found.conteudo })
      setIsAvisoOpen(true)
    }
  }

  const confirmDelete = (avisoId: string) => {
    setAvisoParaExcluir(avisoId)
    setConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (avisoParaExcluir != null) {
      try {
        await fetch(`${API_URL}/notice-board/${avisoParaExcluir}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })
      } catch {
        // ignore
      }
      setAvisos(prev => prev.filter(a => a.id !== avisoParaExcluir))
      setAvisoParaExcluir(null)
    }
  }

  // Buscar usuário atual e dados
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
          setCurrentUserId(user.id)
          // Carregar dados após obter o userId
          const userId = user.id
          try {
            // Carregar inbox
            if (API_URL && userId) {
              const inboxRes = await fetch(`${API_URL}/messages/inbox`, {
                headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
              })
              if (inboxRes.ok) {
                const inboxData = await inboxRes.json()
                const normalized: InboxItem[] = (Array.isArray(inboxData) ? inboxData : []).map((i: any) => ({
                  ...i,
                  lastMessage: { ...i.lastMessage, sentAt: i.lastMessage?.sentAt ?? new Date().toISOString() },
                }))
                setInbox(normalized)
              }
            }
            // Carregar avisos
            if (API_URL) {
              const avisosRes = await fetch(`${API_URL}/notice-board?includeExpired=true`, { 
                headers: { 'Content-Type': 'application/json' } 
              })
              if (avisosRes.ok) {
                const avisosList = await avisosRes.json()
                const avisosItems = (Array.isArray(avisosList) ? avisosList : avisosList?.data ?? []).map((n: any) => ({
                  id: n.id as string,
                  titulo: n.title as string,
                  data: new Date(n.createdAt ?? n.publishedAt ?? Date.now()).toLocaleDateString('pt-BR'),
                  visualizacoes: 0,
                  turma: mapAudienceToLabel(n.audience),
                  conteudo: n.content as string,
                }))
                setAvisos(avisosItems)
              }
            }
          } catch (error) {
            console.error("Erro ao carregar dados:", error)
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="professor" />
        <main className="flex-1 overflow-y-auto">
          <PageSpinner />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 md:mb-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Comunicação</h1>
              <p className="text-sm md:text-base text-muted-foreground">Gerencie mensagens e avisos</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <LiquidGlassButton variant="outline" className="w-full sm:w-auto">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </LiquidGlassButton>
            </div>
          </div>

          <Tabs defaultValue="mensagens" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mensagens" className="text-sm md:text-base">Mensagens</TabsTrigger>
              <TabsTrigger value="avisos" className="text-sm md:text-base">Avisos</TabsTrigger>
            </TabsList>

            <TabsContent value="mensagens">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                <h3 className="text-lg font-semibold">Mensagens</h3>
                <Dialog open={isNovaMensagemOpen}>
                  <DialogTrigger asChild onClick={() => setIsNovaMensagemOpen(true)}>
                    <LiquidGlassButton disabled={!currentUserId} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Mensagem
                    </LiquidGlassButton>
                  </DialogTrigger>
                  {currentUserId && (
                    <ModalNovaMensagem
                      isOpen={isNovaMensagemOpen}
                      onClose={() => setIsNovaMensagemOpen(false)}
                      currentUserId={currentUserId || ""}
                      apiBaseUrl={API_URL}
                      context="teacher"
                      onSend={({ destinatarioId }) => {
                        setIsNovaMensagemOpen(false)
                        fetchInbox()
                        if (destinatarioId) {
                          handleSelectInboxItem(destinatarioId)
                        }
                      }}
                    />
                  )}
                </Dialog>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-1">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader>
                      <CardTitle>Caixa de Entrada</CardTitle>
                      <CardDescription>{inbox.reduce((acc, i) => acc + (i.unreadCount || 0), 0)} mensagens não lidas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {inbox.map((item) => (
                          <div
                            key={item.otherUser.id}
                            onClick={() => handleSelectInboxItem(item.otherUser.id)}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${item.unreadCount > 0 ? "bg-primary/5 border-primary/20" : ""}`}
                          >
                            <div className="flex items-start justify-between mb-1 gap-2">
                              <h5 className="font-medium text-sm truncate flex-1 min-w-0">{item.otherUser.name}</h5>
                              {item.unreadCount > 0 && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                            </div>
                            <p className="font-medium text-sm mb-1 line-clamp-1 break-words">{item.lastMessage?.content || ''}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {new Date(item.lastMessage?.sentAt || Date.now()).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                </div>

                <div className="lg:col-span-2">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                      <CardHeader>
                      <CardTitle className="flex flex-wrap items-center gap-2">
                        {selectedOtherUserId
                          ? (
                            <>
                              <span className="truncate">{inbox.find(i => i.otherUser.id === selectedOtherUserId)?.otherUser.name}</span>
                              {otherUserRole && (
                                <span className="inline-flex items-center rounded border px-1.5 py-0.5 text-xs flex-shrink-0">
                                  {otherUserRole}
                                </span>
                              )}
                            </>
                          )
                          : 'Selecione uma conversa'}
                      </CardTitle>
                      {selectedOtherUserId && (
                        <CardDescription className="truncate">
                          {inbox.find(i => i.otherUser.id === selectedOtherUserId)?.otherUser.email}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {selectedOtherUserId ? (
                        <div className="space-y-4">
                          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                            {conversation.map((msg) => (
                              <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-lg px-3 py-2 text-sm ${msg.senderId === currentUserId ? 'bg-primary/10' : 'bg-muted/50'}`}>
                                  <div className="whitespace-pre-wrap">{msg.content}</div>
                                  <div className="text-[10px] text-muted-foreground mt-1">
                                    {new Date(msg.sentAt).toLocaleString('pt-BR')}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="border-t pt-4">
                            <Textarea
                              placeholder="Digite sua resposta..."
                              className="mb-4 min-h-[100px]"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <LiquidGlassButton onClick={handleReply} disabled={!replyText.trim()} className="w-full sm:w-auto">
                              <Send className="h-4 w-4 mr-2" />
                              Responder
                            </LiquidGlassButton>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Selecione uma conversa na lista ao lado.</div>
                      )}
                    </CardContent>
                  </LiquidGlassCard>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="avisos">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <h3 className="text-lg font-semibold">Meus Avisos</h3>
                  <LiquidGlassButton onClick={openCreateAviso} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Aviso
                  </LiquidGlassButton>
                </div>

                {avisos.map((aviso) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={aviso.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base md:text-lg mb-2 truncate">{aviso.titulo}</h4>
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{aviso.turma}</Badge>
                            <span className="truncate">{aviso.data}</span>
                            <span className="truncate">{aviso.visualizacoes} visualizações</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                          <LiquidGlassButton variant="outline" size="sm" onClick={() => openEditAviso(aviso.id)} className="flex-1 sm:flex-none">
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton variant="outline" size="sm" onClick={() => confirmDelete(aviso.id)} className="flex-1 sm:flex-none">
                            <Trash2 className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>

          </Tabs>
          <ModalAviso
            isOpen={isAvisoOpen}
            onClose={() => setIsAvisoOpen(false)}
            onSave={handleSaveAviso}
            initialData={editingAviso}
            turmaOptions={turmaOptions}
          />
          <ModalConfirmacao
            isOpen={confirmOpen}
            title="Excluir aviso"
            description="Tem certeza que deseja excluir este aviso? Essa ação não pode ser desfeita."
            confirmLabel="Excluir"
            onConfirm={handleDelete}
            onClose={() => setConfirmOpen(false)}
          />
        </div>
      </main>
    </div>
  )
}
