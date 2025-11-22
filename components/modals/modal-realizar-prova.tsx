"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Clock, Save, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, X } from "lucide-react"
import { toast } from "@/components/ui/toast"
import {
  ExamDTO,
  ExamQuestionDTO,
  ExamAttemptDTO,
  ExamAnswerDTO,
  startExamAttempt,
  saveExamAnswer,
  submitExamAttempt,
  listAttemptsByStudent,
} from "@/src/services/examsService"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ModalRealizarProvaProps {
  isOpen: boolean
  onClose: () => void
  exam: ExamDTO
  attempt?: ExamAttemptDTO | null
  onFinalizar: (attempt: ExamAttemptDTO) => void
}

export function ModalRealizarProva({
  isOpen,
  onClose,
  exam,
  attempt: initialAttempt,
  onFinalizar,
}: ModalRealizarProvaProps) {
  const [attempt, setAttempt] = useState<ExamAttemptDTO | null>(initialAttempt || null)
  const [questions, setQuestions] = useState<ExamQuestionDTO[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { selected_option_id?: string; text?: string }>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeWarning, setTimeWarning] = useState<'none' | 'warning' | 'critical'>('none')
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Carregar questões e tentativa
  useEffect(() => {
    if (!isOpen) return

    const loadData = async () => {
      try {
        // Verificar se a tentativa inicial está finalizada
        if (initialAttempt && (initialAttempt.status === 'submitted' || initialAttempt.status === 'graded')) {
          // Tentativa já finalizada - fechar modal e mostrar erro
          toast({
            title: "Prova já finalizada",
            description: "Você já finalizou esta prova. Use o botão 'Ver Resultado' para visualizar.",
            variant: "error",
          })
          onClose()
          return
        }
        
        // Se não há tentativa inicial, criar uma nova
        if (!initialAttempt) {
          const newAttempt = await startExamAttempt(exam.id)
          setAttempt(newAttempt)
        } else {
          setAttempt(initialAttempt)
          // Carregar respostas existentes
          if (initialAttempt.answers) {
            const existingAnswers: Record<string, { selected_option_id?: string; text?: string }> = {}
            initialAttempt.answers.forEach((answer) => {
              existingAnswers[answer.questionId] = answer.answerData
            })
            setAnswers(existingAnswers)
          }
        }

        // Carregar questões
        if (exam.questions && exam.questions.length > 0) {
          let sortedQuestions = [...exam.questions]
          
          // Embaralhar se configurado
          if (exam.shuffleQuestions) {
            sortedQuestions = sortedQuestions.sort(() => Math.random() - 0.5)
          }

          // Embaralhar opções se configurado
          if (exam.shuffleOptions) {
            sortedQuestions = sortedQuestions.map((q) => {
              if (q.type === 'multiple_choice' && q.options) {
                return {
                  ...q,
                  options: [...q.options].sort(() => Math.random() - 0.5),
                }
              }
              return q
            })
          }

          setQuestions(sortedQuestions)
        }
      } catch (error: any) {
        // Se o erro for de tentativa duplicada, tentar buscar a tentativa existente
        if (error?.response?.data?.message?.includes('já possui') || error?.message?.includes('unique constraint')) {
          try {
            // Obter studentId do localStorage ou do initialAttempt
            const studentId = typeof window !== 'undefined' 
              ? localStorage.getItem('ava:userId') || localStorage.getItem('ava:studentId')
              : null
            if (studentId) {
              // Tentar buscar tentativas do aluno para esta prova
              const attempts = await listAttemptsByStudent(studentId)
              const existingAttempt = attempts.find(a => a.examId === exam.id)
              if (existingAttempt) {
                setAttempt(existingAttempt)
                if (existingAttempt.answers) {
                  const existingAnswers: Record<string, { selected_option_id?: string; text?: string }> = {}
                  existingAttempt.answers.forEach((answer) => {
                    existingAnswers[answer.questionId] = answer.answerData
                  })
                  setAnswers(existingAnswers)
                }
                // Carregar questões
                if (exam.questions && exam.questions.length > 0) {
                  let sortedQuestions = [...exam.questions]
                  if (exam.shuffleQuestions) {
                    sortedQuestions = sortedQuestions.sort(() => Math.random() - 0.5)
                  }
                  if (exam.shuffleOptions) {
                    sortedQuestions = sortedQuestions.map((q) => {
                      if (q.type === 'multiple_choice' && q.options) {
                        return {
                          ...q,
                          options: [...q.options].sort(() => Math.random() - 0.5),
                        }
                      }
                      return q
                    })
                  }
                  setQuestions(sortedQuestions)
                }
                return // Sucesso ao recuperar tentativa existente
              }
            }
          } catch (recoveryError) {
            // Se não conseguir recuperar, mostrar erro
          }
        }
        toast({
          title: "Erro ao carregar prova",
          description: error?.response?.data?.message || error?.message || "Não foi possível carregar a prova.",
          variant: "error",
        })
        onClose()
      }
    }

    loadData()
  }, [isOpen, exam, initialAttempt, onClose])

  // Timer
  useEffect(() => {
    if (!isOpen || !attempt || !exam.timeLimitMinutes) return

    const calculateTimeRemaining = () => {
      const startedAt = new Date(attempt.startedAt).getTime()
      const now = Date.now()
      const elapsedMinutes = (now - startedAt) / (1000 * 60)
      const remaining = exam.timeLimitMinutes! - elapsedMinutes
      
      return Math.max(0, Math.floor(remaining))
    }

    const updateTimer = () => {
      const remaining = calculateTimeRemaining()
      setTimeRemaining(remaining)

      if (remaining <= 0) {
        // Tempo esgotado - submeter automaticamente
        handleAutoSubmit()
        return
      }

      if (remaining <= 1) {
        setTimeWarning('critical')
      } else if (remaining <= 5) {
        setTimeWarning('warning')
      } else {
        setTimeWarning('none')
      }
    }

    updateTimer()
    timerIntervalRef.current = setInterval(updateTimer, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isOpen, attempt, exam.timeLimitMinutes])

  // Auto-submit quando tempo esgotar
  const handleAutoSubmit = useCallback(async () => {
    if (!attempt || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Salvar todas as respostas antes de submeter
      const answersArray = Object.entries(answers).map(([questionId, answerData]) => ({
        questionId,
        answerData,
      }))

      const submittedAttempt = await submitExamAttempt(attempt.id, answersArray)
      setAttempt(submittedAttempt)
      
      toast({
        title: "Tempo esgotado",
        description: "A prova foi submetida automaticamente.",
      })
      
      onFinalizar(submittedAttempt)
    } catch (error: any) {
      toast({
        title: "Erro ao submeter prova",
        description: error?.message || "Não foi possível submeter a prova automaticamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [attempt, answers, isSubmitting, onFinalizar])

  // Salvar resposta com debounce
  const saveAnswerDebounced = useCallback(async (
    questionId: string,
    answerData: { selected_option_id?: string; text?: string }
  ) => {
    if (!attempt) return

    // Limpar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setSaveStatus('saving')
    setIsSaving(true)

    // Aguardar 2 segundos antes de salvar
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveExamAnswer(attempt.id, questionId, answerData)
        setSaveStatus('saved')
        setIsSaving(false)
        
        // Resetar status após 2 segundos
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error: any) {
        toast({
          title: "Erro ao salvar resposta",
          description: error?.message || "Não foi possível salvar a resposta.",
          variant: "error",
        })
        setSaveStatus('idle')
        setIsSaving(false)
      }
    }, 2000)
  }, [attempt])

  // Atualizar resposta
  const handleAnswerChange = (questionId: string, answerData: { selected_option_id?: string; text?: string }) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerData,
    }))
    
    // Salvar automaticamente
    saveAnswerDebounced(questionId, answerData)
  }

  // Navegação
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Finalizar prova
  const handleFinalizar = async () => {
    if (!attempt) return

    // Contar questões não respondidas
    const unansweredCount = questions.filter((q) => !answers[q.id]).length

    if (unansweredCount > 0) {
      const confirm = window.confirm(
        `Você tem ${unansweredCount} questão(ões) não respondida(s). Deseja realmente finalizar a prova?`
      )
      if (!confirm) return
    }

    setIsSubmitting(true)
    try {
      // Salvar todas as respostas pendentes antes de submeter
      const savePromises = Object.entries(answers).map(([questionId, answerData]) =>
        saveExamAnswer(attempt.id, questionId, answerData).catch((error) => {
          console.error(`Erro ao salvar resposta da questão ${questionId}:`, error)
          return null
        })
      )
      await Promise.all(savePromises)

      // Preparar array de respostas para submissão
      const answersArray = Object.entries(answers).map(([questionId, answerData]) => ({
        questionId,
        answerData,
      }))

      const submittedAttempt = await submitExamAttempt(attempt.id, answersArray)
      setAttempt(submittedAttempt)
      
      toast({
        title: "Prova submetida com sucesso!",
        description: exam.autoGrade 
          ? "A correção automática foi aplicada." 
          : "Aguarde a correção manual do professor.",
      })
      
      onFinalizar(submittedAttempt)
    } catch (error: any) {
      toast({
        title: "Erro ao submeter prova",
        description: error?.message || "Não foi possível submeter a prova.",
        variant: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Salvar e sair
  const handleSalvarESair = async () => {
    if (!attempt) return

    // Salvar todas as respostas pendentes
    try {
      const promises = Object.entries(answers).map(([questionId, answerData]) =>
        saveExamAnswer(attempt.id, questionId, answerData).catch(() => null)
      )
      await Promise.all(promises)
      
      toast({
        title: "Progresso salvo",
        description: "Você pode continuar a prova mais tarde.",
      })
      
      onClose()
    } catch (error: any) {
      toast({
        title: "Erro ao salvar progresso",
        description: error?.message || "Não foi possível salvar o progresso.",
        variant: "error",
      })
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null
  const answeredCount = questions.filter((q) => answers[q.id]).length

  // Formatar tempo
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{exam.activity?.title || 'Prova'}</DialogTitle>
            <div className="flex items-center gap-4">
              {exam.timeLimitMinutes && timeRemaining !== null && (
                <Badge
                  variant={timeWarning === 'critical' ? 'destructive' : timeWarning === 'warning' ? 'default' : 'secondary'}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  {formatTime(timeRemaining)}
                </Badge>
              )}
              {saveStatus === 'saving' && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  <Save className="h-4 w-4 animate-spin" />
                  Salvando...
                </Badge>
              )}
              {saveStatus === 'saved' && (
                <Badge variant="default" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Salvo
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {timeWarning === 'critical' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Atenção! O tempo está acabando. A prova será submetida automaticamente quando o tempo esgotar.
            </AlertDescription>
          </Alert>
        )}

        {timeWarning === 'warning' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Restam menos de 5 minutos. Finalize suas respostas.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Navegação lateral */}
          <div className="w-48 border-r pr-4 overflow-y-auto">
            <div className="space-y-2">
              <div className="text-sm font-medium mb-2">
                Questões ({answeredCount}/{questions.length})
              </div>
              {questions.map((q, index) => {
                const isAnswered = !!answers[q.id]
                const isCurrent = index === currentQuestionIndex
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={`w-full p-2 text-left rounded border transition-colors ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isAnswered
                        ? 'bg-green-100 dark:bg-green-900 border-green-300'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{index + 1}</span>
                      {isAnswered && <CheckCircle className="h-4 w-4" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Área da questão */}
          <div className="flex-1 overflow-y-auto">
            {currentQuestion && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Questão {currentQuestionIndex + 1} de {questions.length}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion.points} ponto(s)
                    </p>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-base">{currentQuestion.questionText}</p>
                </div>

                {currentQuestion.type === 'multiple_choice' ? (
                  <RadioGroup
                    value={currentAnswer?.selected_option_id || ''}
                    onValueChange={(value) =>
                      handleAnswerChange(currentQuestion.id, {
                        selected_option_id: value,
                      })
                    }
                  >
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option) => (
                        <Label
                          key={option.id}
                          htmlFor={option.id}
                          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer"
                        >
                          <RadioGroupItem value={option.id} id={option.id} />
                          <span className="flex-1 cursor-pointer">
                            {option.text}
                          </span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={`answer-${currentQuestion.id}`}>
                      Sua resposta:
                    </Label>
                    <Textarea
                      id={`answer-${currentQuestion.id}`}
                      value={currentAnswer?.text || ''}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion.id, {
                          text: e.target.value,
                        })
                      }
                      placeholder="Digite sua resposta aqui..."
                      className="min-h-[200px]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com navegação e ações */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={goToNext}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSalvarESair}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar e Sair
            </Button>
            <LiquidGlassButton
              onClick={handleFinalizar}
              disabled={isSubmitting || !attempt}
            >
              {isSubmitting ? 'Submetendo...' : 'Finalizar Prova'}
            </LiquidGlassButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

