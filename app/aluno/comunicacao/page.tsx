"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { MessageSquare, Megaphone } from "lucide-react"
import { useMemo, useState } from "react"
import { useChatThreads, useChatMessages, useSendChatMessage, useStudentNotices } from "@/hooks/use-comunicacao"
import { useCurrentStudent } from "@/hooks/use-dashboard"

export default function AlunoComunicacaoPage() {
  type UIChatMessage = { id: string; autor: "prof" | "aluno"; texto: string; quando: string; status?: "pending" | "error" | "sent" }

  const [conversaSelecionadaId, setConversaSelecionadaId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const { data: currentStudent } = useCurrentStudent()
  const studentId = "29bc17a4-0b68-492b-adef-82718898d9eb"
  const threads = useChatThreads(studentId)
  const chatMessages = useChatMessages({ studentId, classId: conversaSelecionadaId })
  const sendMessage = useSendChatMessage()

  const mensagensDaConversa = useMemo(() => {
    if (!chatMessages.data) return [] as UIChatMessage[]
    return chatMessages.data.map((m) => {
      const anyMsg = m as any
      const status: "pending" | "error" | "sent" = anyMsg.__error ? "error" : (anyMsg.__optimistic ? "pending" : "sent")
      return {
        id: m.id,
        autor: m.author,
        texto: m.content,
        quando: new Date(m.sentAt).toLocaleString("pt-BR"),
        status,
      } as UIChatMessage
    })
  }, [chatMessages.data])

  function abrirConversa(conversaId: string) {
    setConversaSelecionadaId(conversaId)
  }

  function enviarMensagem() {
    if (!conversaSelecionadaId || !studentId) return
    const texto = messageText.trim()
    if (!texto) return
    sendMessage.mutate({ studentId, classId: conversaSelecionadaId, content: texto })
    setMessageText("")
  }

  const notices = useStudentNotices(studentId)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comunicação</h1>
              <p className="text-muted-foreground">Mensagens e comunicados</p>
            </div>
          </div>

          <Tabs defaultValue="mensagens" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
              <TabsTrigger value="comunicados">Comunicados</TabsTrigger>
            </TabsList>

            <TabsContent value="mensagens">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Professores do semestre
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {threads.isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}
                        {threads.error && <div className="text-sm text-destructive">Erro ao carregar conversas.</div>}
                        {threads.data?.map((t) => (
                          <div
                            key={t.classId}
                            onClick={() => abrirConversa(t.classId)}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${conversaSelecionadaId === t.classId ? "bg-primary/5 border-primary/20" : ""}`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="font-medium text-sm">{t.professorName}</h5>
                            </div>
                            <p className="text-xs text-muted-foreground">{t.discipline}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                </div>

                <div className="lg:col-span-2">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader>
                      {(() => {
                        const selecionada = threads.data?.find((p) => p.classId === conversaSelecionadaId)
                        return selecionada ? (
                          <>
                            <CardTitle>{selecionada.professorName}</CardTitle>
                            <CardDescription>{selecionada.discipline}</CardDescription>
                          </>
                        ) : (
                          <>
                            <CardTitle>Selecione uma conversa</CardTitle>
                            <CardDescription>Escolha um professor à esquerda para abrir o chat</CardDescription>
                          </>
                        )
                      })()}
                    </CardHeader>
                    <CardContent>
                      {conversaSelecionadaId ? (
                        <div className="space-y-4">
                          <div className="h-80 overflow-y-auto pr-2 space-y-4">
                            {chatMessages.isLoading && <div className="text-sm text-muted-foreground">Carregando...</div>}
                            {chatMessages.error && <div className="text-sm text-destructive">Erro ao carregar mensagens.</div>}
                            {mensagensDaConversa.map((m) => {
                              const bubbleBase = m.autor === "aluno" ? "bg-primary text-primary-foreground" : "bg-muted"
                              const stateClass =
                                m.status === "pending" ? "opacity-75" :
                                m.status === "error" ? "ring-1 ring-destructive" : ""
                              return (
                                <div key={m.id} className={`flex ${m.autor === "aluno" ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-[80%] rounded-lg p-3 text-sm ${bubbleBase} ${stateClass}`}>
                                    <p>{m.texto}</p>
                                    <p className="mt-1 text-[10px] opacity-70">{m.quando}</p>
                                    {m.status === "pending" && (
                                      <p className="mt-1 text-[10px] opacity-70">Enviando...</p>
                                    )}
                                    {m.status === "error" && (
                                      <p className="mt-1 text-[10px] text-destructive">Falha ao enviar</p>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <Input
                              placeholder="Digite sua mensagem..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault()
                                  enviarMensagem()
                                }
                              }}
                            />
                            <LiquidGlassButton onClick={enviarMensagem} disabled={sendMessage.isPending || !studentId}>
                              {sendMessage.isPending ? "Enviando..." : "Enviar"}
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

            <TabsContent value="comunicados">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Mural Institucional</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Todos</Badge>
                  </div>
                </div>

                {notices.isLoading && <div className="text-sm text-muted-foreground">Carregando comunicados...</div>}
                {notices.error && <div className="text-sm text-destructive">Erro ao carregar comunicados.</div>}
                {notices.data?.map((comunicado) => (
                  <LiquidGlassCard key={comunicado.id} intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg">{comunicado.title}</h4>
                            <Badge variant="secondary">
                              <Megaphone className="h-3 w-3 mr-1" />
                              Aviso
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Por: {comunicado.authorName || "Institucional"}</span>
                            <span>{new Date(comunicado.createdAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                        <LiquidGlassButton variant="outline" size="sm">
                          Ler Mais
                        </LiquidGlassButton>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
