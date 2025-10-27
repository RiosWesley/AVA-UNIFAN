"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  TrendingUp,
  Award,
  AlertTriangle,
  X,
  GraduationCap,
  Clock
} from "lucide-react"

interface Aluno {
  id: number
  nome: string
  matricula: string
  media: number
  frequencia: number
  situacao: string
  email?: string
  telefone?: string
  dataNascimento?: string
  endereco?: string
}

interface ModalDetalhesAlunoProps {
  isOpen: boolean
  onClose: () => void
  aluno: Aluno | null
}

export function ModalDetalhesAluno({
  isOpen,
  onClose,
  aluno
}: ModalDetalhesAlunoProps) {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)

  // Detectar tema liquid glass
  useEffect(() => {
    const checkTheme = () => {
      if (typeof document !== 'undefined') {
        setIsLiquidGlass(document.documentElement.classList.contains('liquid-glass'))
      }
    }
    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // Dados mock para atividades do aluno (seria obtido do backend)
  const atividadesAluno = [
    { id: 1, titulo: "Lista de Exercícios - Funções", nota: 8.5, peso: 3.0, data: "15/03/2024" },
    { id: 2, titulo: "Prova Bimestral", nota: 7.2, peso: 4.0, data: "20/03/2024" },
    { id: 3, titulo: "Trabalho em Grupo", nota: 9.0, peso: 2.0, data: "25/03/2024" },
    { id: 4, titulo: "Atividade Avaliativa 1", nota: 6.8, peso: 2.5, data: "10/04/2024" },
  ]

  // Calcular estatísticas
  const mediaPonderada = atividadesAluno.reduce((acc, atividade) =>
    acc + (atividade.nota * atividade.peso), 0
  ) / atividadesAluno.reduce((acc, atividade) => acc + atividade.peso, 0)

  const getSituacaoBadge = (situacao: string) => {
    switch (situacao) {
      case 'Aprovado':
        return <Badge variant="default" className="bg-green-100 text-green-800"><Award className="h-3 w-3 mr-1" />Aprovado</Badge>
      case 'Recuperação':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Recuperação</Badge>
      case 'Reprovado':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Reprovado</Badge>
      default:
        return <Badge variant="outline">{situacao}</Badge>
    }
  }

  const getFrequenciaColor = (frequencia: number) => {
    if (frequencia >= 90) return 'text-green-600'
    if (frequencia >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFrequenciaStatus = (frequencia: number) => {
    if (frequencia >= 90) return 'Excelente'
    if (frequencia >= 75) return 'Regular'
    return 'Baixa'
  }

  if (!aluno) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{aluno.nome}</h2>
              <p className="text-sm text-muted-foreground">
                Matrícula: {aluno.matricula}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 pr-1">
            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{aluno.email || "Não informado"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{aluno.telefone || "Não informado"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{aluno.dataNascimento || "Não informado"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Desempenho */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Desempenho
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Média Geral</span>
                      <span className="text-lg font-bold text-primary">
                        {aluno.media.toFixed(1)}
                      </span>
                    </div>
                    <Progress value={aluno.media * 10} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Frequência</span>
                      <span className={`text-lg font-bold ${getFrequenciaColor(aluno.frequencia)}`}>
                        {aluno.frequencia}%
                      </span>
                    </div>
                    <Progress value={aluno.frequencia} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: {getFrequenciaStatus(aluno.frequencia)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Situação</span>
                    {getSituacaoBadge(aluno.situacao)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Histórico de Notas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Histórico de Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {atividadesAluno.map((atividade, index) => (
                      <div key={atividade.id}>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{atividade.titulo}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Peso: {atividade.peso}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {atividade.data}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {atividade.nota.toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              / {atividade.peso}
                            </div>
                          </div>
                        </div>
                        {index < atividadesAluno.length - 1 && <div className="border-t border-border my-2" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="border-t border-border my-4" />

                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                  <span className="font-medium">Média Ponderada Calculada</span>
                  <span className="text-lg font-bold text-primary">
                    {mediaPonderada.toFixed(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ações - Fixas no final */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
