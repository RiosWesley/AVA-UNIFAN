"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { Edit, Trash2, Send, Plus, Bell, Loader2 } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { ModalNovaMensagem, ModalAviso, ModalConfirmacao } from "@/components/modals"
import type { AvisoData } from "@/components/modals"
import type { ComboboxOption } from "@/components/ui/combobox"

export default function CoordenadorComunicacaoPage() {
  const [isNovaMensagemOpen, setIsNovaMensagemOpen] = useState(false)
  const [isAvisoOpen, setIsAvisoOpen] = useState(false)
  const [editingAviso, setEditingAviso] = useState<AvisoData | undefined>(undefined)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [avisoParaExcluir, setAvisoParaExcluir] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const turmaOptions: ComboboxOption[] = [
    { id: 'all', label: 'Todos os usuários' },
    { id: 'student', label: 'Todos os alunos' },
    { id: 'teacher', label: 'Professores' },
  ]

  const [comunicadosPublicados, setComunicadosPublicados] = useState<Array<{
    id: string
    titulo: string
    data: string
    visualizacoes: number
    publico: string
    status?: string
    conteudo?: string
  }>>([])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || ""
  const currentUserId = "5f634e5c-d028-434d-af46-cc9ea23eb77b"

  // Inbox e conversas (mensagens diretas)
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

      // marcar como lidas mensagens recebidas não lidas
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
        publico: mapAudienceToLabel(n.audience),
        status: 'Ativo',
        conteudo: n.content as string,
      }))
      setComunicadosPublicados(items)
    } catch {
      // mantém vazio em caso de erro
    }
  }

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        setLoading(true)
        await Promise.all([
          refreshAvisos(),
          fetchInbox()
        ])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

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
      // no-op
    }
  }

  const openCreateAviso = () => {
    setEditingAviso(undefined)
    setIsAvisoOpen(true)
  }

  const openEditAviso = (comunicadoId: string) => {
    const found = comunicadosPublicados.find(c => c.id === comunicadoId)
    if (found) {
      setEditingAviso({
        id: found.id,
        titulo: found.titulo,
        turma: found.publico,
        data: found.data,
        conteudo: found.conteudo,
      })
      setIsAvisoOpen(true)
    }
  }

  const confirmDelete = (comunicadoId: string) => {
    setAvisoParaExcluir(comunicadoId)
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
      setComunicadosPublicados(prev => prev.filter(c => c.id !== avisoParaExcluir))
      setAvisoParaExcluir(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="coordenador" />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-muted-foreground">Carregando comunicação...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="coordenador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comunicação Institucional</h1>
              <p className="text-muted-foreground">Gerencie comunicados e mensagens institucionais</p>
            </div>
            <div className="flex gap-2">
              <LiquidGlassButton variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </LiquidGlassButton>
            </div>
          </div>

          {/* Cards de métricas removidos conforme solicitado */}

          <Tabs defaultValue="mensagens" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
              <TabsTrigger value="avisos">Avisos</TabsTrigger>
            </TabsList>

            <TabsContent value="mensagens">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Mensagens</h3>
                <Dialog open={isNovaMensagemOpen}>
                  <DialogTrigger asChild onClick={() => setIsNovaMensagemOpen(true)}>
                    <LiquidGlassButton>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Mensagem
                    </LiquidGlassButton>
                  </DialogTrigger>
                  <ModalNovaMensagem
                    isOpen={isNovaMensagemOpen}
                    onClose={() => setIsNovaMensagemOpen(false)}
                    currentUserId={currentUserId}
                    onSend={({ destinatarioId }) => {
                      setIsNovaMensagemOpen(false)
                      fetchInbox()
                      if (destinatarioId) {
                        handleSelectInboxItem(destinatarioId)
                      }
                    }}
                  />
                </Dialog>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${item.unreadCount > 0 ? "bg-primary/5 border-primary/20" : ""}`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="font-medium text-sm">{item.otherUser.name}</h5>
                              {item.unreadCount > 0 && <div className="w-2 h-2 bg-primary rounded-full" />}
                            </div>
                            <p className="font-medium text-sm mb-1 line-clamp-1">{item.lastMessage?.content || ''}</p>
                            <p className="text-xs text-muted-foreground">
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
                      <CardTitle>
                        {selectedOtherUserId
                          ? (
                            <span>
                              {inbox.find(i => i.otherUser.id === selectedOtherUserId)?.otherUser.name}
                              {otherUserRole && (
                                <span className="ml-2 inline-flex items-center rounded border px-1.5 py-0.5 text-xs">
                                  {otherUserRole}
                                </span>
                              )}
                            </span>
                          )
                          : 'Selecione uma conversa'}
                      </CardTitle>
                      {selectedOtherUserId && (
                        <CardDescription>
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
                              className="mb-4"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <LiquidGlassButton onClick={handleReply} disabled={!replyText.trim()}>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Meus Avisos</h3>
                  <LiquidGlassButton onClick={openCreateAviso}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Aviso
                  </LiquidGlassButton>
                </div>

                {comunicadosPublicados.map((aviso) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={aviso.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{aviso.titulo}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Badge variant="outline">{aviso.publico}</Badge>
                            <span>{aviso.data}</span>
                            <span>{aviso.visualizacoes} visualizações</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <LiquidGlassButton variant="outline" size="sm" onClick={() => openEditAviso(aviso.id)}>
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton variant="outline" size="sm" onClick={() => confirmDelete(aviso.id)}>
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
