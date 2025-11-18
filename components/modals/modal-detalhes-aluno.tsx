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
import { getStudentGradesDetailed, DetailedStudentGrades } from "@/src/services/gradesService"

interface Aluno {
  id: string
  studentId?: string
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
  classId?: string
}

export function ModalDetalhesAluno({
  isOpen,
  onClose,
  aluno,
  classId
}: ModalDetalhesAlunoProps) {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [atividadesAluno, setAtividadesAluno] = useState<Array<{ id: string; titulo: string; nota: number; peso: number; data: string }>>([])

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

  // Carregar dados reais do boletim detalhado do aluno
  useEffect(() => {
    const fetchDetailed = async () => {
      try {
        if (!isOpen || !aluno?.studentId) {
          setAtividadesAluno([])
          return
        }
        const detailed: DetailedStudentGrades = await getStudentGradesDetailed(aluno.studentId)
        // Filtra pela turma atual (se informada)
        const disciplinas = detailed?.disciplines || []
        const daTurma = classId ? disciplinas.find(d => d.class?.id === classId) : disciplinas[0]
        const atividades = (daTurma?.gradesByPeriod || []).flatMap(gp => gp.activities || [])
        const mapped = atividades.map(a => ({
          id: a.id,
          titulo: a.title,
          nota: a.grade?.score != null ? Number(a.grade.score) : 0,
          peso: a.max_score != null ? Number(a.max_score) : 10,
          data: a.due_date ? new Date(a.due_date).toLocaleDateString('pt-BR') : '-'
        }))
        setAtividadesAluno(mapped)
      } catch {
        setAtividadesAluno([])
      }
    }
    fetchDetailed()
  }, [isOpen, aluno?.studentId, classId])

  // Calcular estatísticas
  const mediaPonderada = (() => {
    if (!atividadesAluno.length) return 0
    const somaPesos = atividadesAluno.reduce((acc, a) => acc + (a.peso || 0), 0) || 0
    if (somaPesos === 0) return 0
    const soma = atividadesAluno.reduce((acc, a) => acc + (a.nota * (a.peso || 0)), 0)
    return soma / somaPesos
  })()

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
