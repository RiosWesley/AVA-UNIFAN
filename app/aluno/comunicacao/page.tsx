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

export default function AlunoComunicacaoPage() {
  type ChatMessage = { id: number; autor: "prof" | "aluno"; texto: string; quando: string }
  const professoresSemestre = [
    { id: "mat-101", professor: "Prof. Carlos Silva", disciplina: "Matemática I" },
    { id: "his-102", professor: "Profª. Mariana Souza", disciplina: "História Contemporânea" },
    { id: "fis-103", professor: "Prof. João Oliveira", disciplina: "Física Geral" },
    { id: "por-104", professor: "Profª. Ana Lima", disciplina: "Língua Portuguesa" },
  ]

  const [conversaSelecionadaId, setConversaSelecionadaId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [conversas, setConversas] = useState<Record<string, ChatMessage[]>>({})

  const conversaSelecionada = useMemo(
    () => professoresSemestre.find((p) => p.id === conversaSelecionadaId) || null,
    [conversaSelecionadaId]
  )

  const mensagensDaConversa = useMemo(() => {
    if (!conversaSelecionadaId) return [] as ChatMessage[]
    return (conversas[conversaSelecionadaId] ?? []) as ChatMessage[]
  }, [conversaSelecionadaId, conversas])

  function ensureConversaInicial(conversaId: string) {
    setConversas((prev) => {
      if (prev[conversaId]) return prev
      const professor = professoresSemestre.find((p) => p.id === conversaId)
      const inicial: ChatMessage[] = professor
        ? [
            { id: 1, autor: "prof", texto: `Olá! Sou ${professor.professor}. Precisando de algo?`, quando: "Agora" },
            { id: 2, autor: "aluno", texto: "Olá professor(a), tenho uma dúvida sobre a matéria.", quando: "Agora" },
            { id: 3, autor: "prof", texto: "Claro! Pode me explicar qual parte?", quando: "Agora" },
          ]
        : ([] as ChatMessage[])
      const updated: Record<string, ChatMessage[]> = { ...prev, [conversaId as string]: inicial }
      return updated
    })
  }

  function abrirConversa(conversaId: string) {
    setConversaSelecionadaId(conversaId)
    ensureConversaInicial(conversaId)
  }

  function enviarMensagem() {
    if (!conversaSelecionadaId) return
    const texto = messageText.trim()
    if (!texto) return
    setConversas((prev) => {
      const atual: ChatMessage[] = prev[conversaSelecionadaId] || []
      const proximoId = (atual[atual.length - 1]?.id || 0) + 1
      const nova = [...atual, { id: proximoId, autor: "aluno", texto, quando: "Agora" }]
      const updated: Record<string, ChatMessage[]> = { ...prev, [conversaSelecionadaId as string]: nova as ChatMessage[] }
      return updated
    })
    setMessageText("")
  }

  const comunicados = [
    {
      id: 1,
      titulo: "Calendário de Provas - 2º Bimestre",
      categoria: "Acadêmico",
      data: "18/03/2024",
      autor: "Coordenação Pedagógica",
      urgente: true,
    },
    {
      id: 2,
      titulo: "Feira de Ciências 2024",
      categoria: "Evento",
      data: "15/03/2024",
      autor: "Direção",
      urgente: false,
    },
    {
      id: 3,
      titulo: "Alteração no Horário das Aulas",
      categoria: "Informativo",
      data: "12/03/2024",
      autor: "Secretaria",
      urgente: false,
    },
  ]

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
                        {professoresSemestre.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => abrirConversa(item.id)}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                              conversaSelecionadaId === item.id ? "bg-primary/5 border-primary/20" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="font-medium text-sm">{item.professor}</h5>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.disciplina}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                </div>

                <div className="lg:col-span-2">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader>
                      {conversaSelecionada ? (
                        <>
                          <CardTitle>{conversaSelecionada.professor}</CardTitle>
                          <CardDescription>{conversaSelecionada.disciplina}</CardDescription>
                        </>
                      ) : (
                        <>
                          <CardTitle>Selecione uma conversa</CardTitle>
                          <CardDescription>Escolha um professor à esquerda para abrir o chat</CardDescription>
                        </>
                      )}
                    </CardHeader>
                    <CardContent>
                      {conversaSelecionada ? (
                        <div className="space-y-4">
                          <div className="h-80 overflow-y-auto pr-2 space-y-4">
                            {mensagensDaConversa.map((m) => (
                              <div key={m.id} className={`flex ${m.autor === "aluno" ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                    m.autor === "aluno" ? "bg-primary text-primary-foreground" : "bg-muted"
                                  }`}
                                >
                                  <p>{m.texto}</p>
                                  <p className="mt-1 text-[10px] opacity-70">{m.quando}</p>
                                </div>
                              </div>
                            ))}
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
                            <LiquidGlassButton onClick={enviarMensagem}>Enviar</LiquidGlassButton>
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
                    <Badge variant="outline">Acadêmico</Badge>
                    <Badge variant="outline">Evento</Badge>
                    <Badge variant="outline">Informativo</Badge>
                  </div>
                </div>

                {comunicados.map((comunicado) => (
                  <LiquidGlassCard key={comunicado.id} intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg">{comunicado.titulo}</h4>
                            <Badge variant={comunicado.urgente ? "destructive" : "secondary"}>
                              {comunicado.categoria}
                            </Badge>
                            {comunicado.urgente && (
                              <Badge variant="destructive">
                                <Megaphone className="h-3 w-3 mr-1" />
                                Urgente
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Por: {comunicado.autor}</span>
                            <span>{comunicado.data}</span>
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
