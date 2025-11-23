"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LiquidGlassButton, LiquidGlassCard } from "@/components/liquid-glass"
import { Badge } from "@/components/ui/badge"
import { X, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { ExamAttemptDTO, ExamAttemptStatus, listAttemptsByExam } from "@/src/services/examsService"
import { toast } from "@/components/ui/toast"

interface ModalTentativasProvaProps {
  isOpen: boolean
  onClose: () => void
  examId: string
  onVerDetalhes: (attempt: ExamAttemptDTO) => void
}

const getStatusLabel = (status: ExamAttemptStatus): string => {
  switch (status) {
    case 'in_progress':
      return 'Em Andamento'
    case 'submitted':
      return 'Submetida'
    case 'graded':
      return 'Corrigida'
    default:
      return status
  }
}

const getStatusVariant = (status: ExamAttemptStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case 'in_progress':
      return 'secondary'
    case 'submitted':
      return 'default'
    case 'graded':
      return 'default'
    default:
      return 'secondary'
  }
}

export function ModalTentativasProva({
  isOpen,
  onClose,
  examId,
  onVerDetalhes
}: ModalTentativasProvaProps) {
  const [tentativas, setTentativas] = useState<ExamAttemptDTO[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && examId) {
      carregarTentativas()
    }
  }, [isOpen, examId])

  const carregarTentativas = async () => {
    setLoading(true)
    try {
      const data = await listAttemptsByExam(examId)
      setTentativas(data)
    } catch (error: any) {
      console.error('Erro ao carregar tentativas:', error)
      toast({
        title: "Erro ao carregar tentativas",
        description: error?.message || "Não foi possível carregar as tentativas da prova.",
        variant: "error"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatarTempo = (minutos?: number | null): string => {
    if (!minutos) return '-'
    if (minutos < 60) return `${minutos} min`
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
  }

  const formatarData = (data?: string | null): string => {
    if (!data) return '-'
    return new Date(data).toLocaleString('pt-BR')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tentativas da Prova</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando tentativas...</p>
            </div>
          ) : tentativas.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma tentativa encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tentativas.map((tentativa) => (
                <LiquidGlassCard key={tentativa.id} intensity="medium">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">
                            {tentativa.student?.name || 'Aluno desconhecido'}
                          </h4>
                          <Badge variant={getStatusVariant(tentativa.status)}>
                            {getStatusLabel(tentativa.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Tempo: {formatarTempo(tentativa.timeSpentMinutes)}</span>
                          </div>
                          <div>
                            Iniciada: {formatarData(tentativa.startedAt)}
                          </div>
                          {tentativa.submittedAt && (
                            <div>
                              Submetida: {formatarData(tentativa.submittedAt)}
                            </div>
                          )}
                        </div>

                        {tentativa.score !== null && tentativa.score !== undefined && (
                          <div className="mt-2">
                            <span className="text-sm font-medium">
                              Nota: <span className="text-primary">{tentativa.score.toFixed(2)}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <LiquidGlassButton
                          size="sm"
                          variant="outline"
                          onClick={() => onVerDetalhes(tentativa)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </LiquidGlassButton>
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <LiquidGlassButton variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </LiquidGlassButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}


