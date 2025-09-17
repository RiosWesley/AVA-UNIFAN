"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sidebar } from "@/components/layout/sidebar"
import { MessageSquare, Megaphone, Search, Plus, Clock, Pin } from "lucide-react"

export default function AlunoComunicacaoPage() {
  const forumTopicos = [
    {
      id: 1,
      titulo: "Dúvidas sobre Funções Quadráticas",
      autor: "Ana Silva",
      disciplina: "Matemática",
      respostas: 12,
      ultimaResposta: "2 horas atrás",
      fixado: true,
    },
    {
      id: 2,
      titulo: "Projeto de História - Dicas de Pesquisa",
      autor: "Bruno Santos",
      disciplina: "História",
      respostas: 8,
      ultimaResposta: "5 horas atrás",
      fixado: false,
    },
    {
      id: 3,
      titulo: "Experimento de Física - Resultados",
      autor: "Carlos Oliveira",
      disciplina: "Física",
      respostas: 15,
      ultimaResposta: "1 dia atrás",
      fixado: false,
    },
  ]

  const mensagens = [
    {
      id: 1,
      remetente: "Prof. Carlos Silva",
      assunto: "Sobre a prova de amanhã",
      preview: "Lembre-se de trazer calculadora científica...",
      data: "Hoje, 14:30",
      lida: false,
    },
    {
      id: 2,
      remetente: "Ana Silva",
      assunto: "Trabalho em grupo",
      preview: "Podemos nos encontrar na biblioteca...",
      data: "Ontem, 16:45",
      lida: true,
    },
    {
      id: 3,
      remetente: "Coordenação",
      assunto: "Reunião de pais",
      preview: "Informamos que a reunião será no dia...",
      data: "2 dias atrás",
      lida: true,
    },
  ]

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
              <p className="text-muted-foreground">Fóruns, mensagens e comunicados</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Mensagem
            </Button>
          </div>

          <Tabs defaultValue="forum" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="forum">Fórum</TabsTrigger>
              <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
              <TabsTrigger value="comunicados">Comunicados</TabsTrigger>
            </TabsList>

            <TabsContent value="forum">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Discussões do Fórum</h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar tópicos..." className="pl-10 w-64" />
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Tópico
                    </Button>
                  </div>
                </div>

                {forumTopicos.map((topico) => (
                  <Card key={topico.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {topico.fixado && <Pin className="h-4 w-4 text-primary" />}
                            <h4 className="font-semibold text-lg">{topico.titulo}</h4>
                            <Badge variant="outline">{topico.disciplina}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback>
                                  {topico.autor
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {topico.autor}
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {topico.respostas} respostas
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {topico.ultimaResposta}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Discussão
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="mensagens">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Caixa de Entrada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {mensagens.map((mensagem) => (
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
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sobre a prova de amanhã</CardTitle>
                      <CardDescription>De: Prof. Carlos Silva • Hoje, 14:30</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p>Olá João,</p>
                        <p>
                          Lembre-se de trazer calculadora científica para a prova de matemática de amanhã. A avaliação
                          abordará os seguintes tópicos:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Funções quadráticas</li>
                          <li>Sistemas lineares</li>
                          <li>Equações do 2º grau</li>
                        </ul>
                        <p>Boa sorte!</p>
                        <p>Prof. Carlos Silva</p>
                        <div className="border-t pt-4">
                          <Button>Responder</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                  <Card key={comunicado.id} className="hover:shadow-md transition-shadow">
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
                        <Button variant="outline" size="sm">
                          Ler Mais
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
