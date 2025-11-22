"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import {
  ExamAttemptDTO,
  ExamQuestionDTO,
  ExamAnswerDTO,
  getAttemptById,
} from "@/src/services/examsService"

interface ModalResultadoProvaProps {
  isOpen: boolean
  onClose: () => void
  attemptId: string | null
}

export function ModalResultadoProva({
  isOpen,
  onClose,
  attemptId,
}: ModalResultadoProvaProps) {
  const [attempt, setAttempt] = useState<ExamAttemptDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !attemptId) {
      setAttempt(null)
      setLoading(false)
      return
    }

    const loadAttempt = async () => {
      setLoading(true)
      try {
        const loadedAttempt = await getAttemptById(attemptId)
        
        // Normalizar answerData se vier como string JSON
        if (loadedAttempt?.answers) {
          loadedAttempt.answers = loadedAttempt.answers.map((answer: any) => {
            // Se answerData está como string, fazer parse
            if (answer.answerData && typeof answer.answerData === 'string') {
              try {
                answer.answerData = JSON.parse(answer.answerData)
              } catch (e) {
                console.error('Erro ao fazer parse do answerData:', e, answer.answerData)
              }
            }
            return answer
          })
        }
        
        setAttempt(loadedAttempt)
      } catch (error: any) {
        console.error('Erro ao carregar tentativa:', error)
        setAttempt(null)
      } finally {
        setLoading(false)
      }
    }

    loadAttempt()
  }, [isOpen, attemptId])

  if (!isOpen) return null

  const formatTime = (minutes: number | null | undefined) => {
    if (!minutes) return 'N/A'
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getQuestionAnswer = (questionId: string): ExamAnswerDTO | undefined => {
    return attempt?.answers?.find((a) => {
      // Verificar se questionId corresponde (pode estar em questionId ou question.id)
      return a.questionId === questionId || a.question?.id === questionId
    })
  }

  const getQuestionStatus = (question: ExamQuestionDTO, answer: ExamAnswerDTO | undefined) => {
    if (!answer) return 'unanswered'
    if (question.type === 'multiple_choice') {
      return answer.isCorrect ? 'correct' : 'incorrect'
    } else {
      // Essay question
      if (answer.pointsEarned !== null && answer.pointsEarned !== undefined) {
        return 'graded'
      }
      return 'pending'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'correct':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Correta
          </Badge>
        )
      case 'incorrect':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Incorreta
          </Badge>
        )
      case 'graded':
        return (
          <Badge variant="default" className="bg-blue-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Corrigida
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Aguardando Correção
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Não Respondida
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando resultados...</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Aguarde...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!attempt) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Não foi possível carregar os resultados da prova.</p>
            <Button onClick={onClose} className="mt-4">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const exam = attempt.exam
  const questions = exam?.questions || []
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  const earnedPoints = attempt.score || 0
  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Resultado da Prova: {exam?.activity?.title || 'Prova'}
          </DialogTitle>
        </DialogHeader>

        {/* Informações Gerais */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informações da Tentativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">
                  {attempt.status === 'in_progress' && 'Em Andamento'}
                  {attempt.status === 'submitted' && 'Submetida'}
                  {attempt.status === 'graded' && 'Corrigida'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Início</p>
                <p className="font-medium">{formatDate(attempt.startedAt)}</p>
              </div>
              {attempt.submittedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Submissão</p>
                  <p className="font-medium">{formatDate(attempt.submittedAt)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Tempo Gasto</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatTime(attempt.timeSpentMinutes)}
                </p>
              </div>
            </div>

            {/* Nota */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nota Final</p>
                  <p className="text-3xl font-bold">
                    {earnedPoints.toFixed(2)} / {totalPoints.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {percentage}% de aproveitamento
                  </p>
                </div>
                <div className="text-right">
                  {attempt.autoGradeScore !== null && attempt.autoGradeScore !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      Auto-correção: {attempt.autoGradeScore.toFixed(2)}
                    </p>
                  )}
                  {attempt.manualGradeScore !== null && attempt.manualGradeScore !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      Correção manual: {attempt.manualGradeScore.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questões e Respostas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Questões e Respostas</h3>
          {questions.map((question, index) => {
            const answer = getQuestionAnswer(question.id)
            const status = getQuestionStatus(question, answer)

            return (
              <Card key={question.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        Questão {index + 1} ({question.points} ponto(s))
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        {question.questionText}
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Resposta do Aluno */}
                  <div>
                    <p className="text-sm font-medium mb-2">Sua Resposta:</p>
                    {question.type === 'multiple_choice' ? (
                      <div className="p-3 bg-muted rounded-lg">
                        {answer?.answerData?.selected_option_id ? (
                          <p>
                            {question.options?.find(
                              (opt) => opt.id === answer.answerData.selected_option_id
                            )?.text || 'Opção selecionada não encontrada'}
                          </p>
                        ) : (
                          <p className="text-muted-foreground italic">Não respondida</p>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-muted rounded-lg">
                        {answer?.answerData?.text ? (
                          <p className="whitespace-pre-wrap">{answer.answerData.text}</p>
                        ) : (
                          <p className="text-muted-foreground italic">Não respondida</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Resposta Correta (apenas para múltipla escolha) */}
                  {question.type === 'multiple_choice' && question.correctAnswer && (
                    <div>
                      <p className="text-sm font-medium mb-2">Resposta Correta:</p>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        {(() => {
                          const correctOptionId = question.correctAnswer?.option_id
                          const correctOption = question.options?.find(
                            (opt) => opt.id === correctOptionId
                          )
                          return (
                            <p className="text-green-700 dark:text-green-300">
                              {correctOption?.text || 'Resposta correta não encontrada'}
                            </p>
                          )
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Pontos e Feedback */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Pontos Obtidos:</p>
                      <p className="font-semibold">
                        {answer?.pointsEarned !== null && answer?.pointsEarned !== undefined
                          ? `${answer.pointsEarned.toFixed(2)} / ${question.points.toFixed(2)}`
                          : 'Aguardando correção'}
                      </p>
                    </div>
                    {answer?.feedback && (
                      <div className="flex-1 ml-4">
                        <p className="text-sm text-muted-foreground">Feedback:</p>
                        <p className="text-sm">{answer.feedback}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

