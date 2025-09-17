"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/layout/sidebar"
import { MessageSquare, Megaphone, Eye, Edit, Trash2, TrendingUp } from "lucide-react"

export default function CoordenadorComunicacaoPage() {
  const comunicadosPublicados = [
    {
      id: 1,
      titulo: "Calendário de Provas - 2º Bimestre",
      categoria: "Acadêmico",
      data: "18/03/2024",
      visualizacoes: 245,
      publico: "Todos os alunos",
      status: "Ativo",
    },
    {
      id: 2,
      titulo: "Feira de Ciências 2024",
      categoria: "Evento",
      data: "15/03/2024",
      visualizacoes: 189,
      publico: "Ensino Médio",
      status: "Ativo",
    },
    {
      id: 3,
      titulo: "Reunião de Pais - Março",
      categoria: "Evento",
      data: "10/03/2024",
      visualizacoes: 156,
      publico: "Pais e responsáveis",
      status: "Arquivado",
    },
  ]

  const mensagensInstitucionais = [
    {
      id: 1,
      remetente: "Direção",
      assunto: "Planejamento do próximo semestre",
      data: "Hoje, 09:30",
      lida: false,
    },
    {
      id: 2,
      remetente: "Prof. Maria Santos",
      assunto: "Solicitação de material didático",
      data: "Ontem, 14:20",
      lida: true,
    },
    {
      id: 3,
      remetente: "Secretaria",
      assunto: "Relatório de frequência",
      data: "2 dias atrás",
      lida: true,
    },
  ]

  const estatisticasComunicacao = {
    comunicadosAtivos: 12,
    visualizacoesTotais: 1250,
    engajamentoMedio: 78,
    mensagensEnviadas: 45,
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
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Mensagens
              </Button>
              <Button>
                <Megaphone className="h-4 w-4 mr-2" />
                Novo Comunicado
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comunicados Ativos</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasComunicacao.comunicadosAtivos}</div>
                <p className="text-xs text-muted-foreground">+3 este mês</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasComunicacao.visualizacoesTotais}</div>
                <p className="text-xs text-muted-foreground">+15% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasComunicacao.engajamentoMedio}%</div>
                <p className="text-xs text-muted-foreground">Taxa média de leitura</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasComunicacao.mensagensEnviadas}</div>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="comunicados" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comunicados">Comunicados</TabsTrigger>
              <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
              <TabsTrigger value="criar">Criar Comunicado</TabsTrigger>
            </TabsList>

            <TabsContent value="comunicados">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Comunicados Publicados</h3>
                  <div className="flex items-center space-x-2">
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar por categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="academico">Acadêmico</SelectItem>
                        <SelectItem value="evento">Evento</SelectItem>
                        <SelectItem value="informativo">Informativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {comunicadosPublicados.map((comunicado) => (
                  <Card key={comunicado.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg">{comunicado.titulo}</h4>
                            <Badge variant="outline">{comunicado.categoria}</Badge>
                            <Badge variant={comunicado.status === "Ativo" ? "default" : "secondary"}>
                              {comunicado.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Público: {comunicado.publico}</span>
                            <span>{comunicado.data}</span>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {comunicado.visualizacoes} visualizações
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                      <CardTitle>Mensagens Institucionais</CardTitle>
                      <CardDescription>Comunicação interna</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {mensagensInstitucionais.map((mensagem) => (
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
                      <CardTitle>Planejamento do próximo semestre</CardTitle>
                      <CardDescription>De: Direção • Hoje, 09:30</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p>Cara Coordenação,</p>
                        <p>
                          Gostaria de agendar uma reunião para discutirmos o planejamento acadêmico do próximo semestre.
                          Precisamos revisar:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Grade curricular</li>
                          <li>Distribuição de professores</li>
                          <li>Calendário de avaliações</li>
                          <li>Projetos especiais</li>
                        </ul>
                        <p>Aguardo retorno para agendarmos.</p>
                        <p>
                          Atenciosamente,
                          <br />
                          Direção
                        </p>
                        <div className="border-t pt-4">
                          <Button>Responder</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="criar">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Comunicado</CardTitle>
                  <CardDescription>Publique comunicados para a comunidade escolar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="titulo">Título do Comunicado</Label>
                        <Input id="titulo" placeholder="Digite o título" />
                      </div>
                      <div>
                        <Label htmlFor="categoria">Categoria</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="academico">Acadêmico</SelectItem>
                            <SelectItem value="evento">Evento</SelectItem>
                            <SelectItem value="informativo">Informativo</SelectItem>
                            <SelectItem value="urgente">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="publico">Público-alvo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o público" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos os usuários</SelectItem>
                            <SelectItem value="alunos">Todos os alunos</SelectItem>
                            <SelectItem value="professores">Professores</SelectItem>
                            <SelectItem value="pais">Pais e responsáveis</SelectItem>
                            <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                            <SelectItem value="medio">Ensino Médio</SelectItem>
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
                      <Label htmlFor="conteudo">Conteúdo do Comunicado</Label>
                      <Textarea id="conteudo" placeholder="Digite o conteúdo do comunicado..." rows={8} />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Salvar Rascunho</Button>
                      <Button variant="outline">Visualizar</Button>
                      <Button>
                        <Megaphone className="h-4 w-4 mr-2" />
                        Publicar Comunicado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
