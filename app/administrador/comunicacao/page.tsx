"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { MessageSquare, Users, TrendingUp, Eye, Plus, Shield, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ModalNovaMensagem } from "@/components/modals"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { useRouter } from "next/navigation"
import { PageSpinner } from "@/components/ui/page-spinner"

type OverviewData = {
  totalMessages: number
  totalNoticesActive: number
  totalUsersActive: number
  engagementRate: number
}

type RoleChartItem = { role: string; count: number }
type OverTimeItem = { bucket: string; total: number }

type InboxItem = {
  otherUser: { id: string; name: string; email: string; roles?: Array<{ name: string }> }
  lastMessage: { id: string; content: string; sentAt: string; isRead: boolean }
  unreadCount: number
}

export default function AdministradorComunicacaoPage() {
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ""
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [isNovaMensagemOpen, setIsNovaMensagemOpen] = useState(false)
  const [defaultDestinatarioId, setDefaultDestinatarioId] = useState<string | null>(null)
  const [inbox, setInbox] = useState<InboxItem[]>([])
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Array<{ id: string; content: string; sentAt: string; senderId: string; receiverId?: string; sender?: any; receiver?: any }>>([])
  const [replyText, setReplyText] = useState("")
  const [otherUserRole, setOtherUserRole] = useState<string | null>(null)
  const [periodDays, setPeriodDays] = useState<'7' | '30' | '90'>('30')
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [overviewError, setOverviewError] = useState<string | null>(null)
  const [roleChart, setRoleChart] = useState<RoleChartItem[]>([])
  const [roleChartLoading, setRoleChartLoading] = useState(false)
  const [roleChartError, setRoleChartError] = useState<string | null>(null)
  const [overTime, setOverTime] = useState<OverTimeItem[]>([])
  const [overTimeLoading, setOverTimeLoading] = useState(false)
  const [overTimeError, setOverTimeError] = useState<string | null>(null)

  const estatisticasGerais = {
    mensagensTotais: overview?.totalMessages ?? 0,
    comunicadosAtivos: overview?.totalNoticesActive ?? 0,
    usuariosAtivos: overview?.totalUsersActive ?? 0,
    taxaEngajamento: overview?.engagementRate ?? 0,
  }

  const formatNumber = (value: number) => value.toLocaleString('pt-BR')

  const fetchInbox = async (userId: string) => {
    if (!API_URL || !userId) return
    try {
      const res = await fetch(`${API_URL}/messages/inbox`, {
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
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

  const fetchConversation = async (otherId: string, userId: string) => {
    if (!API_URL || !userId) return
    try {
      const res = await fetch(`${API_URL}/messages/conversation/${otherId}`, {
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      })
      if (!res.ok) throw new Error('Erro ao carregar conversa')
      const list = await res.json()
      const items = (Array.isArray(list) ? list : []).map((m: any) => ({
        id: m.id as string,
        content: m.content as string,
        sentAt: m.sentAt,
        senderId: m.sender?.id as string,
        receiverId: m.receiver?.id as string | undefined,
        sender: m.sender,
        receiver: m.receiver,
      }))
      setConversation(items)

      let detectedRole: string | null = null
      for (const m of items) {
        const other = m.senderId === otherId ? m.sender : m.receiver
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
      setOtherUserRole(detectedRole)

      const unreadReceived = (Array.isArray(list) ? list : []).filter((m: any) => m.receiver?.id === userId && !m.isRead)
      await Promise.all(unreadReceived.map((m: any) => (
        fetch(`${API_URL}/messages/${m.id}/read`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
          body: JSON.stringify({ read: true }),
        })
      )))
      fetchInbox(userId)
    } catch {
      setConversation([])
    }
  }

  const handleSelectInboxItem = (otherId: string) => {
    if (!currentUserId) return
    setSelectedOtherUserId(otherId)
    fetchConversation(otherId, currentUserId)
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
      await fetchConversation(selectedOtherUserId, currentUserId)
    } catch {
      // ignore erro
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
        if (!user?.id || !user?.roles?.includes("admin")) {
          router.push("/")
          return
        }
        setCurrentUserId(user.id)
        const userId = user.id

        // Carregar dados após obter o userId
        try {
          if (API_URL && userId) {
            await fetchInbox(userId)
          }
        } catch (error) {
          console.error('Erro ao carregar dados:', error)
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

  const dateRange = useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    start.setDate(end.getDate() - Number(periodDays))
    return { start: start.toISOString(), end: end.toISOString() }
  }, [periodDays])

  useEffect(() => {
    if (!API_URL) return
    const controller = new AbortController()

    const loadOverview = async () => {
      setOverviewLoading(true)
      setOverviewError(null)
      try {
        const params = new URLSearchParams({ start: dateRange.start, end: dateRange.end })
        const res = await fetch(`${API_URL}/analytics/messages/overview?${params.toString()}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Falha ao carregar métricas')
        const json = await res.json()
        setOverview(json)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setOverviewError('Erro ao carregar métricas')
          setOverview(null)
        }
      } finally {
        setOverviewLoading(false)
      }
    }

    const loadByRole = async () => {
      setRoleChartLoading(true)
      setRoleChartError(null)
      try {
        const params = new URLSearchParams({ start: dateRange.start, end: dateRange.end })
        const res = await fetch(`${API_URL}/analytics/messages/by-role?${params.toString()}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Falha ao carregar mensagens por perfil')
        const json = await res.json()
        setRoleChart(json)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setRoleChartError('Erro ao carregar gráfico por perfil')
          setRoleChart([])
        }
      } finally {
        setRoleChartLoading(false)
      }
    }

    const loadOverTime = async () => {
      setOverTimeLoading(true)
      setOverTimeError(null)
      try {
        const bucket = periodDays === '90' ? 'week' : 'day'
        const params = new URLSearchParams({ start: dateRange.start, end: dateRange.end, bucket })
        const res = await fetch(`${API_URL}/analytics/messages/over-time?${params.toString()}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Falha ao carregar evolução')
        const json = await res.json()
        setOverTime(json)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setOverTimeError('Erro ao carregar gráfico temporal')
          setOverTime([])
        }
      } finally {
        setOverTimeLoading(false)
      }
    }

    loadOverview()
    loadByRole()
    loadOverTime()

    return () => controller.abort()
  }, [API_URL, dateRange.start, dateRange.end, periodDays])

  const roleChartData = useMemo(() => {
    const labels: Record<string, string> = {
      admin: 'Administradores',
      coordinator: 'Coordenadores',
      teacher: 'Professores',
      student: 'Alunos',
    }
    return roleChart.map(item => ({
      categoria: labels[item.role] ?? item.role,
      quantidade: item.count,
    }))
  }, [roleChart])

  const overTimeData = useMemo(() => {
    return overTime.map(item => ({
      bucket: new Date(item.bucket).toLocaleDateString('pt-BR'),
      mensagens: item.total,
    }))
  }, [overTime])

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="administrador" />
        <main className="flex-1 overflow-y-auto">
          <PageSpinner />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Administração de Comunicação</h1>
              <p className="text-muted-foreground">Monitore e gerencie toda a comunicação do sistema</p>
            </div>
            <div className="flex gap-2">
              <LiquidGlassButton variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Moderação
              </LiquidGlassButton>
              <LiquidGlassButton>
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </LiquidGlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Totais</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {overviewLoading ? '...' : formatNumber(estatisticasGerais.mensagensTotais)}
                </div>
                {overviewError ? (
                  <p className="text-xs text-destructive">{overviewError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Últimos {periodDays} dias</p>
                )}
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comunicados Ativos</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {overviewLoading ? '...' : formatNumber(estatisticasGerais.comunicadosAtivos)}
                </div>
                <p className="text-xs text-muted-foreground">Ativos no momento</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {overviewLoading ? '...' : formatNumber(estatisticasGerais.usuariosAtivos)}
                </div>
                <p className="text-xs text-muted-foreground">Usuários ativos no sistema</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {overviewLoading ? '...' : `${estatisticasGerais.taxaEngajamento.toFixed(1)}%`}
                </div>
                <p className="text-xs text-muted-foreground">Mensagens lidas / enviadas</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <Tabs defaultValue="mensagens" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="mensagens">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Mensagens</h3>
                <LiquidGlassButton onClick={() => { setDefaultDestinatarioId(null); setIsNovaMensagemOpen(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Mensagem
                </LiquidGlassButton>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Caixa de Entrada
                      </CardTitle>
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
                          <div className="h-80 overflow-y-auto pr-2 space-y-4">
                            {conversation.map((m) => (
                              <div key={m.id} className={`flex ${m.senderId === (currentUserId || '') ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${m.senderId === (currentUserId || '') ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                  <p>{m.content}</p>
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
                            />
                            <LiquidGlassButton onClick={handleReply} disabled={!replyText.trim()}>
                              Enviar
                            </LiquidGlassButton>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Nenhuma conversa aberta.</div>
                      )}
                    </CardContent>
                  </LiquidGlassCard>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Analytics</h3>
                <select
                  className="border rounded px-3 py-2 text-sm bg-background"
                  value={periodDays}
                  onChange={(e) => setPeriodDays(e.target.value as '7' | '30' | '90')}
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                </select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução da Comunicação</CardTitle>
                    <CardDescription>Mensagens no período selecionado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overTimeLoading ? (
                      <div className="text-sm text-muted-foreground">Carregando...</div>
                    ) : overTimeError ? (
                      <div className="text-sm text-destructive">{overTimeError}</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={overTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="bucket" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="mensagens" stroke="#15803d" strokeWidth={3} name="Mensagens" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mensagens por Perfil</CardTitle>
                    <CardDescription>Distribuição por role do remetente</CardDescription>
                  </CardHeader>
                    {roleChartLoading ? (
                      <CardContent>
                        <div className="text-sm text-muted-foreground">Carregando...</div>
                      </CardContent>
                    ) : roleChartError ? (
                      <CardContent>
                        <div className="text-sm text-destructive">{roleChartError}</div>
                      </CardContent>
                    ) : (
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={roleChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="categoria" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="quantidade" fill="#15803d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    )}
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </main>
      {currentUserId && (
        <ModalNovaMensagem
          isOpen={isNovaMensagemOpen}
          onClose={() => setIsNovaMensagemOpen(false)}
          currentUserId={currentUserId}
          context="admin"
          defaultDestinatarioId={defaultDestinatarioId}
          onSend={({ destinatarioId }) => {
            setIsNovaMensagemOpen(false)
            if (currentUserId) {
              fetchInbox(currentUserId)
              if (destinatarioId) {
                handleSelectInboxItem(destinatarioId)
              }
            }
          }}
        />
      )}
    </div>
  )
}
