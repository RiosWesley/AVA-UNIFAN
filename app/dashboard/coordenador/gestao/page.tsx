"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, BookOpen, MapPin, Plus, Edit, Trash2, Search } from "lucide-react"

export default function GestaoPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const cursos = [
    { id: 1, nome: "Engenharia de Software", coordenador: "Prof. Ana Silva", alunos: 120, status: "Ativo" },
    { id: 2, nome: "Ciência da Computação", coordenador: "Prof. Carlos Santos", alunos: 95, status: "Ativo" },
    { id: 3, nome: "Sistemas de Informação", coordenador: "Prof. Maria Oliveira", alunos: 80, status: "Ativo" },
  ]

  const horarios = [
    {
      id: 1,
      disciplina: "Algoritmos",
      professor: "Prof. João",
      turma: "CC-2023A",
      horario: "08:00-10:00",
      sala: "Lab 1",
      dia: "Segunda",
    },
    {
      id: 2,
      disciplina: "Banco de Dados",
      professor: "Prof. Ana",
      turma: "SI-2023B",
      horario: "14:00-16:00",
      sala: "Sala 201",
      dia: "Terça",
    },
    {
      id: 3,
      disciplina: "Engenharia de Software",
      professor: "Prof. Carlos",
      turma: "ES-2023A",
      horario: "19:00-21:00",
      sala: "Sala 301",
      dia: "Quarta",
    },
  ]

  const recursos = [
    { id: 1, nome: "Laboratório de Informática 1", tipo: "Laboratório", capacidade: 30, status: "Disponível" },
    { id: 2, nome: "Sala de Aula 201", tipo: "Sala", capacidade: 50, status: "Ocupada" },
    { id: 3, nome: "Auditório Principal", tipo: "Auditório", capacidade: 200, status: "Disponível" },
    { id: 4, nome: "Projetor Portátil 1", tipo: "Equipamento", capacidade: 1, status: "Em Manutenção" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão e Planejamento</h1>
          <p className="text-gray-600">Gerencie cursos, horários e recursos acadêmicos</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <Tabs defaultValue="cursos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cursos">Cursos</TabsTrigger>
          <TabsTrigger value="horarios">Horários</TabsTrigger>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
        </TabsList>

        <TabsContent value="cursos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Gestão de Cursos
              </CardTitle>
              <CardDescription>Gerencie os cursos oferecidos pela instituição</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar cursos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>

              <div className="space-y-4">
                {cursos.map((curso) => (
                  <Card key={curso.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{curso.nome}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {curso.alunos} alunos
                            </span>
                            <span>Coordenador: {curso.coordenador}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={curso.status === "Ativo" ? "default" : "secondary"}>{curso.status}</Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Gestão de Horários
              </CardTitle>
              <CardDescription>Organize os horários das disciplinas e turmas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {horarios.map((horario) => (
                  <Card key={horario.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{horario.disciplina}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {horario.dia}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {horario.horario}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {horario.sala}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Professor:</span> {horario.professor} |
                            <span className="font-medium"> Turma:</span> {horario.turma}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recursos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Gestão de Recursos
              </CardTitle>
              <CardDescription>Gerencie salas, laboratórios e equipamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {recursos.map((recurso) => (
                  <Card key={recurso.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold">{recurso.nome}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Tipo: {recurso.tipo}</span>
                            <span>Capacidade: {recurso.capacidade}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              recurso.status === "Disponível"
                                ? "default"
                                : recurso.status === "Ocupada"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {recurso.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planejamento" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Planejamento Acadêmico</CardTitle>
                <CardDescription>Configure períodos e calendário acadêmico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período Letivo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-1">2024.1</SelectItem>
                      <SelectItem value="2024-2">2024.2</SelectItem>
                      <SelectItem value="2025-1">2025.1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inicio">Data de Início</Label>
                  <Input type="date" id="inicio" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fim">Data de Término</Label>
                  <Input type="date" id="fim" />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">Salvar Planejamento</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eventos Importantes</CardTitle>
                <CardDescription>Datas importantes do calendário acadêmico</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Início das Aulas</p>
                      <p className="text-sm text-gray-600">15 de Março, 2024</p>
                    </div>
                    <Badge>Próximo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Período de Provas</p>
                      <p className="text-sm text-gray-600">20-30 de Junho, 2024</p>
                    </div>
                    <Badge variant="secondary">Planejado</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Férias de Meio de Ano</p>
                      <p className="text-sm text-gray-600">1-31 de Julho, 2024</p>
                    </div>
                    <Badge variant="secondary">Planejado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
