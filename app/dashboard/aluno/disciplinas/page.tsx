"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/layout/sidebar"
import { BookOpen, Clock, User } from "lucide-react"
import Link from "next/link"

export default function AlunodisciplinasPage() {
  const disciplinas = [
    {
      id: 1,
      nome: "Matemática",
      codigo: "MAT001",
      professor: "Prof. Carlos Silva",
      progresso: 75,
      proximaAula: "Segunda, 08:00",
      status: "Em andamento",
    },
    {
      id: 2,
      nome: "Português",
      codigo: "POR001",
      professor: "Prof. Ana Santos",
      progresso: 82,
      proximaAula: "Terça, 10:00",
      status: "Em andamento",
    },
    {
      id: 3,
      nome: "História",
      codigo: "HIS001",
      professor: "Prof. João Costa",
      progresso: 68,
      proximaAula: "Quarta, 14:00",
      status: "Em andamento",
    },
    {
      id: 4,
      nome: "Física",
      codigo: "FIS001",
      professor: "Prof. Maria Oliveira",
      progresso: 90,
      proximaAula: "Quinta, 08:00",
      status: "Em andamento",
    },
    {
      id: 5,
      nome: "Química",
      codigo: "QUI001",
      professor: "Prof. Pedro Lima",
      progresso: 100,
      proximaAula: "Concluída",
      status: "Concluída",
    },
  ]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Minhas Disciplinas</h1>
              <p className="text-muted-foreground">Acompanhe o progresso das suas disciplinas</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {disciplinas.filter((d) => d.status === "Em andamento").length} disciplinas ativas
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disciplinas.map((disciplina) => (
              <Card key={disciplina.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{disciplina.nome}</CardTitle>
                      <CardDescription>{disciplina.codigo}</CardDescription>
                    </div>
                    <Badge variant={disciplina.status === "Concluída" ? "default" : "secondary"}>
                      {disciplina.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      {disciplina.professor}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{disciplina.progresso}%</span>
                      </div>
                      <Progress value={disciplina.progresso} />
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {disciplina.proximaAula}
                    </div>

                    <Link href={`/dashboard/aluno/disciplinas/${disciplina.id}`}>
                      <Button className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Acessar Disciplina
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
