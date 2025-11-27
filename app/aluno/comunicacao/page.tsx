"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { MessageSquare, Megaphone, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, useEffect, useCallback } from "react"
import { useStudentNotices } from "@/hooks/use-comunicacao"
import { useCurrentStudent } from "@/hooks/use-dashboard"
import { ModalNovaMensagem } from "@/components/modals"
import { me } from '@/src/services/auth'

export default function AlunoComunicacaoPage() {
  const router = useRouter()
  const [isNovaMensagemOpen, setIsNovaMensagemOpen] = useState(false)
  const [defaultDestinatarioId, setDefaultDestinatarioId] = useState<string | null>(null)
  const { data: currentStudent } = useCurrentStudent()
  const [studentId, setStudentId] = useState<string | null>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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

  const fetchInbox = useCallback(async () => {
    console.log('[fetchInbox] Iniciando busca de inbox', { API_URL, studentId })
    if (!API_URL || !studentId) {
      console.log('[fetchInbox] Retornando cedo - faltando API_URL ou studentId')
      return
    }
    try {
      const url = `${API_URL}/messages/inbox`
      console.log('[fetchInbox] Fazendo requisição:', url)
      console.log('[fetchInbox] Headers:', { 'Content-Type': 'application/json', 'x-user-id': studentId })
      
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json', 'x-user-id': studentId },
      })
      
      console.log('[fetchInbox] Resposta recebida:', { status: res.status, statusText: res.statusText, ok: res.ok })
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('[fetchInbox] Erro na resposta:', errorText)
        throw new Error(`Erro ao carregar inbox: ${res.status} - ${errorText}`)
      }
      
      const data = await res.json()
      console.log('[fetchInbox] Dados recebidos:', data)
      console.log('[fetchInbox] Tipo dos dados:', Array.isArray(data) ? 'array' : typeof data)
      console.log('[fetchInbox] Quantidade de itens:', Array.isArray(data) ? data.length : 'N/A')
      
      const normalized: InboxItem[] = (Array.isArray(data) ? data : []).map((i: any) => ({
        ...i,
        lastMessage: { ...i.lastMessage, sentAt: i.lastMessage?.sentAt ?? new Date().toISOString() },
      }))
      
      console.log('[fetchInbox] Dados normalizados:', normalized)
      console.log('[fetchInbox] Quantidade de itens normalizados:', normalized.length)
      setInbox(normalized)
    } catch (error) {
      console.error('[fetchInbox] Erro ao buscar inbox:', error)
      setInbox([])
    }
  }, [API_URL, studentId])

  const fetchConversation = async (otherId: string) => {
    if (!API_URL || !studentId) return
    try {
      const res = await fetch(`${API_URL}/messages/conversation/${otherId}`, {
        headers: { 'Content-Type': 'application/json', 'x-user-id': studentId },
      })
      if (!res.ok) throw new Error('Erro ao carregar conversa')
      const list = await res.json()

      // detectar role do outro usuário a partir das mensagens retornadas
      let detectedRole: string | null = null
      if (Array.isArray(list)) {
        for (const m of list) {
          const sender = (m && m.sender) || null
          const receiver = (m && m.receiver) || null
          const other = sender?.id === otherId ? sender : (receiver?.id === otherId ? receiver : null)
          const roles = other?.roles as Array<{ name: string }> | undefined
          if (roles && roles.length > 0) {
            if (roles.some(r => r.name === 'admin')) {
              detectedRole = 'Administrador'
              break
            }
            if (roles.some(r => r.name === 'coordinator')) {
              detectedRole = 'Coordenador'
              break
            }
            if (roles.some(r => r.name === 'teacher')) {
              detectedRole = 'Professor'
              break
            }
          }
        }
      }
      setOtherUserRole(detectedRole)

      const items = (Array.isArray(list) ? list : []).map((m: any) => ({
        id: m.id as string,
        content: m.content as string,
        sentAt: m.sentAt,
        senderId: m.sender?.id as string,
        receiverId: m.receiver?.id as string | undefined,
      }))
      setConversation(items)

      const unreadReceived = (Array.isArray(list) ? list : []).filter((m: any) => m.receiver?.id === studentId && !m.isRead)
      await Promise.all(unreadReceived.map((m: any) => (
        fetch(`${API_URL}/messages/${m.id}/read`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-user-id': studentId },
          body: JSON.stringify({ read: true }),
        })
      )))
      fetchInbox()
    } catch {
      setConversation([])
    }
  }

  const handleSelectInboxItem = (otherId: string) => {
    setSelectedOtherUserId(otherId)
    fetchConversation(otherId)
  }

  const handleReply = async () => {
    if (!API_URL || !studentId || !selectedOtherUserId || !replyText.trim()) return
    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': studentId },
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

  const notices = useStudentNotices(studentId || "")

  useEffect(() => {
    console.log('[useEffect] studentId mudou:', studentId)
    if (studentId) {
      console.log('[useEffect] Chamando fetchInbox porque studentId está definido')
      fetchInbox()
    } else {
      console.log('[useEffect] Não chamando fetchInbox - studentId não está definido')
    }
  }, [studentId, fetchInbox])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Comunicação</h1>
              <p className="text-muted-foreground text-sm md:text-base">Mensagens e comunicados</p>
            </div>
          </div>

          <Tabs defaultValue="mensagens" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="mensagens" className="text-xs md:text-sm">Mensagens</TabsTrigger>
              <TabsTrigger value="comunicados" className="text-xs md:text-sm">Comunicados</TabsTrigger>
            </TabsList>

            <TabsContent value="mensagens">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-base md:text-lg font-semibold">Mensagens</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <LiquidGlassButton onClick={() => { setDefaultDestinatarioId(null); setIsNovaMensagemOpen(true) }} className="w-full sm:w-auto text-sm md:text-base">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Mensagem
                  </LiquidGlassButton>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="lg:col-span-1">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader>
                      <CardTitle className="flex items-center text-base md:text-lg">
                        <MessageSquare className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                        Caixa de Entrada
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm">{inbox.reduce((acc, i) => acc + (i.unreadCount || 0), 0)} mensagens não lidas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {inbox.map((item) => (
                          <div
                            key={item.otherUser.id}
                            onClick={() => handleSelectInboxItem(item.otherUser.id)}
                            className={`p-2 md:p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${item.unreadCount > 0 ? "bg-primary/5 border-primary/20" : ""}`}
                          >
                            <div className="flex items-start justify-between mb-1 gap-2">
                              <h5 className="font-medium text-xs md:text-sm truncate flex-1">{item.otherUser.name}</h5>
                              {item.unreadCount > 0 && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                            </div>
                            <p className="font-medium text-xs md:text-sm mb-1 line-clamp-1">{item.lastMessage?.content || ''}</p>
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
                      <CardTitle className="text-base md:text-lg">
                        {selectedOtherUserId
                          ? (
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="truncate">{inbox.find(i => i.otherUser.id === selectedOtherUserId)?.otherUser.name}</span>
                              {otherUserRole && (
                                <span className="inline-flex items-center rounded border px-1.5 py-0.5 text-xs">
                                  {otherUserRole}
                                </span>
                              )}
                            </span>
                          )
                          : 'Selecione uma conversa'}
                      </CardTitle>
                      {selectedOtherUserId && (
                        <CardDescription className="text-xs md:text-sm truncate">
                          {inbox.find(i => i.otherUser.id === selectedOtherUserId)?.otherUser.email}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {selectedOtherUserId ? (
                        <div className="space-y-3 md:space-y-4">
                          <div className="h-64 md:h-80 overflow-y-auto pr-2 space-y-3 md:space-y-4">
                            {conversation.map((m) => (
                              <div key={m.id} className={`flex ${m.senderId === studentId ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2 md:p-3 text-xs md:text-sm ${m.senderId === studentId ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                  <p className="break-words">{m.content}</p>
                                  <p className="mt-1 text-[10px] opacity-70">{new Date(m.sentAt).toLocaleString("pt-BR")}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <Input
                              placeholder="Digite sua mensagem..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault()
                                  handleReply()
                                }
                              }}
                              className="text-sm md:text-base"
                            />
                            <LiquidGlassButton onClick={handleReply} disabled={!replyText.trim()} className="flex-shrink-0 text-sm md:text-base">
                              Enviar
                            </LiquidGlassButton>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-8">Nenhuma conversa aberta.</div>
                      )}
                    </CardContent>
                  </LiquidGlassCard>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comunicados">
              <div className="space-y-3 md:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-base md:text-lg font-semibold">Mural Institucional</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">Todos</Badge>
                  </div>
                </div>

                {notices.isLoading && <div className="text-sm text-muted-foreground">Carregando comunicados...</div>}
                {notices.error && <div className="text-sm text-destructive">Erro ao carregar comunicados.</div>}
                {notices.data?.map((comunicado) => (
                  <LiquidGlassCard key={comunicado.id} intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold text-base md:text-lg truncate">{comunicado.title}</h4>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              <Megaphone className="h-3 w-3 mr-1" />
                              Aviso
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs md:text-sm text-muted-foreground">
                            <span>Por: {comunicado.authorName || "Institucional"}</span>
                            <span>{new Date(comunicado.createdAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                        <LiquidGlassButton variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm">
                          Ler Mais
                        </LiquidGlassButton>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <ModalNovaMensagem
            isOpen={isNovaMensagemOpen}
            onClose={() => setIsNovaMensagemOpen(false)}
            currentUserId={studentId || ""}
            apiBaseUrl={API_URL}
            context="student"
            defaultDestinatarioId={defaultDestinatarioId}
            onSend={({ destinatarioId }) => {
              setIsNovaMensagemOpen(false)
              fetchInbox()
              if (destinatarioId) {
                handleSelectInboxItem(destinatarioId)
              }
            }}
          />
        </div>
      </main>
    </div>
  )
}
