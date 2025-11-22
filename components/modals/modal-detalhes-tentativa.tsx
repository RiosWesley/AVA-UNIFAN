"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LiquidGlassButton, LiquidGlassCard } from "@/components/liquid-glass"
import { Badge } from "@/components/ui/badge"
import { Save, X, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { ExamAttemptDTO, ExamAnswerDTO, ExamQuestionType, gradeExamAnswer, getAttemptById } from "@/src/services/examsService"

interface ModalDetalhesTentativaProps {
  isOpen: boolean
  onClose: () => void
  attemptId: string
  onCorrecaoSalva?: () => void
}

export function ModalDetalhesTentativa({
  isOpen,
  onClose,
  attemptId,
  onCorrecaoSalva
}: ModalDetalhesTentativaProps) {
  const [tentativa, setTentativa] = useState<ExamAttemptDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [correcoes, setCorrecoes] = useState<Record<string, { points: string; feedback: string }>>({})
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (isOpen && attemptId) {
      carregarTentativa()
    }
  }, [isOpen, attemptId])

  const carregarTentativa = async () => {
    setLoading(true)
    try {
      const data = await getAttemptById(attemptId)
      setTentativa(data)
      
      // Inicializar correções com valores existentes
      const correcoesIniciais: Record<string, { points: string; feedback: string }> = {}
      data.answers?.forEach(answer => {
        if (answer.question?.type === 'essay') {
          correcoesIniciais[answer.id] = {
            points: answer.pointsEarned?.toString() || '',
            feedback: answer.feedback || ''
          }
        }
      })
      setCorrecoes(correcoesIniciais)
    } catch (error: any) {
      console.error('Erro ao carregar tentativa:', error)
      toast({
        title: "Erro ao carregar tentativa",
        description: error?.message || "Não foi possível carregar os detalhes da tentativa.",
        variant: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  const atualizarCorrecao = (answerId: string, campo: 'points' | 'feedback', valor: string) => {
    setCorrecoes(prev => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        [campo]: valor
      }
    }))
  }

  const salvarCorrecoes = async () => {
    if (!tentativa) return

    setSalvando(true)
    try {
      const questoesDissertativas = tentativa.answers?.filter(
        answer => answer.question?.type === 'essay'
      ) || []

      const resultados = await Promise.allSettled(
        questoesDissertativas.map(async (answer) => {
          const correcao = correcoes[answer.id]
          if (!correcao || !correcao.points) return

          await gradeExamAnswer({
            answerId: answer.id,
            pointsEarned: parseFloat(correcao.points),
            feedback: correcao.feedback || null
          })
        })
      )

      const sucesso = resultados.filter(r => r.status === 'fulfilled').length
      const falhas = resultados.filter(r => r.status === 'rejected').length

      if (sucesso > 0) {
        toast({
          title: "Correções salvas",
          description: `${sucesso} questão(ões) corrigida(s) com sucesso${falhas > 0 ? `. ${falhas} falharam.` : '.'}`
        })
        
        // Recarregar tentativa para atualizar dados
        await carregarTentativa()
        
        if (onCorrecaoSalva) {
          onCorrecaoSalva()
        }
      } else if (falhas > 0) {
        toast({
          title: "Erro ao salvar correções",
          description: "Não foi possível salvar as correções. Tente novamente.",
          variant: "error"
        })
      }
    } catch (error: any) {
      console.error('Erro ao salvar correções:', error)
      toast({
        title: "Erro ao salvar correções",
        description: error?.message || "Não foi possível salvar as correções.",
        variant: "error"
      })
    } finally {
      setSalvando(false)
    }
  }

  const renderizarResposta = (answer: ExamAnswerDTO) => {
    const question = answer.question
    if (!question) return null

    if (question.type === 'multiple_choice') {
      const selectedOptionId = answer.answerData?.selected_option_id
      const selectedOption = question.options?.find(opt => opt.id === selectedOptionId)
      const isCorrect = answer.isCorrect

      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              Resposta: {selectedOption?.text || 'Não respondida'}
            </span>
          </div>
          {selectedOption && (
            <div className="ml-7">
              <p className="text-sm text-muted-foreground">
                {isCorrect ? 'Resposta correta!' : 'Resposta incorreta'}
              </p>
            </div>
          )}
          {answer.pointsEarned !== null && answer.pointsEarned !== undefined && (
            <div className="ml-7">
              <p className="text-sm">
                Pontos obtidos: <span className="font-medium">{answer.pointsEarned.toFixed(2)}</span> / {question.points}
              </p>
            </div>
          )}
        </div>
      )
    } else if (question.type === 'essay') {
      const respostaTexto = answer.answerData?.text || 'Sem resposta'
      const correcao = correcoes[answer.id] || { points: '', feedback: '' }

      return (
        <div className="space-y-4">
          <div>
            <Label>Resposta do Aluno:</Label>
            <div className="mt-1 p-3 bg-muted rounded-md min-h-[100px]">
              <p className="whitespace-pre-wrap">{respostaTexto}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`points-${answer.id}`}>
                Pontos (máx: {question.points})
              </Label>
              <Input
                id={`points-${answer.id}`}
                type="number"
                min="0"
                max={question.points}
                step="0.1"
                value={correcao.points}
                onChange={(e) => atualizarCorrecao(answer.id, 'points', e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label>Pontos Máximos</Label>
              <Input
                value={question.points}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`feedback-${answer.id}`}>Feedback</Label>
            <Textarea
              id={`feedback-${answer.id}`}
              value={correcao.feedback}
              onChange={(e) => atualizarCorrecao(answer.id, 'feedback', e.target.value)}
              placeholder="Comentários sobre a resposta..."
              rows={3}
            />
          </div>

          {answer.pointsEarned !== null && answer.pointsEarned !== undefined && (
            <div className="p-2 bg-muted rounded-md">
              <p className="text-sm">
                Pontos já atribuídos: <span className="font-medium">{answer.pointsEarned.toFixed(2)}</span>
              </p>
            </div>
          )}
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando detalhes da tentativa...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!tentativa) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Tentativa não encontrada</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const questoesOrdenadas = [...(tentativa.answers || [])].sort((a, b) => {
    const ordemA = a.question?.order || 0
    const ordemB = b.question?.order || 0
    return ordemA - ordemB
  })

  const temQuestoesDissertativas = questoesOrdenadas.some(
    answer => answer.question?.type === 'essay'
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Tentativa</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Informações do Aluno */}
          <LiquidGlassCard intensity={0.3}>
            <div className="p-4">
              <h3 className="font-medium mb-2">
                {tentativa.student?.name || 'Aluno desconhecido'}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant={tentativa.status === 'graded' ? 'default' : 'secondary'}>
                    {tentativa.status === 'in_progress' ? 'Em Andamento' :
                     tentativa.status === 'submitted' ? 'Submetida' : 'Corrigida'}
                  </Badge>
                </div>
                {tentativa.score !== null && tentativa.score !== undefined && (
                  <div>
                    <span className="font-medium">Nota Final:</span>{' '}
                    <span className="text-primary font-bold">{tentativa.score.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </LiquidGlassCard>

          {/* Questões e Respostas */}
          <div className="space-y-4">
            <h3 className="font-medium">Questões e Respostas</h3>
            {questoesOrdenadas.map((answer, index) => (
              <LiquidGlassCard key={answer.id} intensity={0.2}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-sm text-muted-foreground">
                          Questão {answer.question?.order || index + 1}
                        </span>
                        <Badge variant="outline">
                          {answer.question?.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Dissertativa'}
                        </Badge>
                        <Badge variant="secondary">
                          {answer.question?.points} ponto(s)
                        </Badge>
                      </div>
                      <p className="font-medium mb-3">{answer.question?.questionText}</p>
                    </div>
                  </div>

                  {renderizarResposta(answer)}
                </div>
              </LiquidGlassCard>
            ))}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <LiquidGlassButton variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Fechar
            </LiquidGlassButton>
            {temQuestoesDissertativas && tentativa.status !== 'in_progress' && (
              <LiquidGlassButton onClick={salvarCorrecoes} disabled={salvando}>
                <Save className="h-4 w-4 mr-2" />
                {salvando ? 'Salvando...' : 'Salvar Correções'}
              </LiquidGlassButton>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

