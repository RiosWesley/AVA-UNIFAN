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

export default function ProfessorComunicacaoPage() {
  const mensagensRecebidas = [
    {
      id: 1,
      remetente: "Ana Silva (9º A)",
      assunto: "Dúvida sobre exercício",
      preview: "Professor, não consegui resolver o exercício 15...",
      data: "Hoje, 15:20",
      lida: false,
    },
    {
      id: 2,
      remetente: "Bruno Santos (8º B)",
      assunto: "Falta na prova",
      preview: "Professor, faltei na prova por motivo médico...",
      data: "Ontem, 10:30",
      lida: true,
    },
    {
      id: 3,
      remetente: "Coordenação",
      assunto: "Reunião pedagógica",
      preview: "Reunião marcada para sexta-feira...",
      data: "2 dias atrás",
      lida: true,
    },
  ]

  const forumTopicos = [
    {
      id: 1,
      titulo: "Dúvidas sobre Funções Quadráticas",
      turma: "9º Ano A",
      respostas: 12,
      ultimaAtividade: "2 horas atrás",
      moderador: true,
    },
    {
      id: 2,
      titulo: "Preparação para a Prova",
      turma: "8º Ano B",
      respostas: 8,
      ultimaAtividade: "1 dia atrás",
      moderador: true,
    },
  ]

  const avisos = [
    {
      id: 1,
      titulo: "Prova de Matemática - 9º Ano A",
      turma: "9º Ano A",
      data: "15/03/2024",
      visualizacoes: 28,
    },
    {
      id: 2,
      titulo: "Material Complementar Disponível",
      turma: "8º Ano B",
      data: "12/03/2024",
      visualizacoes: 23,
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comunicação</h1>
              <p className="text-muted-foreground">Gerencie mensagens, fóruns e avisos</p>
            </div>
            <div className="flex gap-2">
              <LiquidGlassButton variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </LiquidGlassButton>
              <LiquidGlassButton>
                <Plus className="h-4 w-4 mr-2" />
                Novo Aviso
              </LiquidGlassButton>
            </div>
          </div>

          <Tabs defaultValue="mensagens" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
              <TabsTrigger value="forum">Fórum</TabsTrigger>
              <TabsTrigger value="avisos">Avisos</TabsTrigger>
              <TabsTrigger value="enviar">Enviar Mensagem</TabsTrigger>
            </TabsList>

            <TabsContent value="mensagens">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader>
                      <CardTitle>Caixa de Entrada</CardTitle>
                      <CardDescription>3 mensagens não lidas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {mensagensRecebidas.map((mensagem) => (
                          <div
                            key={mensagem.id}
                            className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                              !mensagem.lida ? "bg-primary/5 border-primary/20" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="font-medium text-sm">{mensagem.remetente}</h5>
                              {!mensagem.lida && <div className="w-2 h-2 bg-primary rounded-full" />}
                            </div>
                            <p className="font-medium text-sm mb-1">{mensagem.assunto}</p>
                            <p className="text-xs text-muted-foreground mb-2">{mensagem.preview}</p>
                            <p className="text-xs text-muted-foreground">{mensagem.data}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                </div>

                <div className="lg:col-span-2">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader>
                      <CardTitle>Dúvida sobre exercício</CardTitle>
                      <CardDescription>De: Ana Silva (9º A) • Hoje, 15:20</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p>Professor Carlos,</p>
                        <p>
                          Não consegui resolver o exercício 15 da lista. Poderia me ajudar com os passos para encontrar
                          as raízes da função quadrática?
                        </p>
                        <p>Obrigada!</p>
                        <p>Ana Silva</p>
                        <div className="border-t pt-4">
                          <Textarea placeholder="Digite sua resposta..." className="mb-4" />
                          <LiquidGlassButton>
                            <Send className="h-4 w-4 mr-2" />
                            Responder
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forum">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Fóruns das Turmas</h3>
                  <LiquidGlassButton>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Tópico
                  </LiquidGlassButton>
                </div>

                {forumTopicos.map((topico) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={topico.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg">{topico.titulo}</h4>
                            <Badge variant="outline">{topico.turma}</Badge>
                            {topico.moderador && <Badge variant="default">Moderador</Badge>}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{topico.respostas} respostas</span>
                            <span>Última atividade: {topico.ultimaAtividade}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <LiquidGlassButton variant="outline" size="sm">
                            Moderar
                          </LiquidGlassButton>
                          <LiquidGlassButton variant="outline" size="sm">
                            Ver Discussão
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="avisos">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Meus Avisos</h3>
                  <LiquidGlassButton>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Aviso
                  </LiquidGlassButton>
                </div>

                {avisos.map((aviso) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={aviso.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{aviso.titulo}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Badge variant="outline">{aviso.turma}</Badge>
                            <span>{aviso.data}</span>
                            <span>{aviso.visualizacoes} visualizações</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <LiquidGlassButton variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="enviar">
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                <CardHeader>
                  <CardTitle>Enviar Mensagem</CardTitle>
                  <CardDescription>Envie mensagens para alunos ou colegas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="destinatario">Destinatário</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o destinatário" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="turma-9a">9º Ano A (Toda a turma)</SelectItem>
                            <SelectItem value="turma-8b">8º Ano B (Toda a turma)</SelectItem>
                            <SelectItem value="ana-silva">Ana Silva (9º A)</SelectItem>
                            <SelectItem value="bruno-santos">Bruno Santos (8º B)</SelectItem>
                            <SelectItem value="coordenacao">Coordenação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="prioridade">Prioridade</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Normal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="urgente">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="assunto">Assunto</Label>
                      <Input id="assunto" placeholder="Digite o assunto da mensagem" />
                    </div>

                    <div>
                      <Label htmlFor="mensagem">Mensagem</Label>
                      <Textarea id="mensagem" placeholder="Digite sua mensagem..." rows={6} />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <LiquidGlassButton variant="outline">Salvar Rascunho</LiquidGlassButton>
                      <LiquidGlassButton>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </LiquidGlassButton>
                    </div>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
