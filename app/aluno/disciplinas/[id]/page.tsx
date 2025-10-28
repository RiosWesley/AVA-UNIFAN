"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Bell, FileText, Upload, CheckCircle, Clock, AlertCircle, MessageSquare, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useState } from 'react'
import { ModalDiscussaoForum } from '@/components/modals'

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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="avisos">Avisos</TabsTrigger>
              <TabsTrigger value="materiais">Materiais</TabsTrigger>
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
              <TabsTrigger value="forum">Fórum</TabsTrigger>
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
                            <Label htmlFor="arquivo">Enviar Arquivo</Label>
                            <Input id="arquivo" type="file" className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="comentario">Comentário (opcional)</Label>
                            <Textarea id="comentario" placeholder="Adicione um comentário..." className="mt-1" />
                          </div>
                          <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Enviar Atividade
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

          </Tabs>
        </div>
      </main>
      <ModalDiscussaoForum
        isOpen={modalDiscussaoOpen}
        onClose={() => setModalDiscussaoOpen(false)}
        forum={forumSelecionado}
        onResponder={handleResponderDiscussao}
      />
    </div>
  )
}
