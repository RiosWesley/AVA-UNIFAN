"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Bell, FileText, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="avisos">Avisos</TabsTrigger>
              <TabsTrigger value="materiais">Materiais</TabsTrigger>
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
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

          </Tabs>
        </div>
      </main>
    </div>
  )
}
