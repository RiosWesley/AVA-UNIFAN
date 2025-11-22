"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Save, X, Plus, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { ExamQuestionDTO, ExamQuestionType, ExamOption, CreateExamQuestionPayload, UpdateExamQuestionPayload } from "@/src/services/examsService"

interface ModalQuestaoProvaProps {
  isOpen: boolean
  onClose: () => void
  questao?: ExamQuestionDTO | null
  examId: string
  onSalvar: (questao: CreateExamQuestionPayload | UpdateExamQuestionPayload) => void
  modo: 'criar' | 'editar'
  ordem?: number
}

export function ModalQuestaoProva({
  isOpen,
  onClose,
  questao = null,
  examId,
  onSalvar,
  modo,
  ordem = 1
}: ModalQuestaoProvaProps) {
  const [tipo, setTipo] = useState<ExamQuestionType>('multiple_choice')
  const [textoPergunta, setTextoPergunta] = useState('')
  const [pontos, setPontos] = useState('')
  const [ordemQuestao, setOrdemQuestao] = useState(ordem.toString())
  const [alternativas, setAlternativas] = useState<ExamOption[]>([
    { id: 'opt1', text: '', is_correct: false },
    { id: 'opt2', text: '', is_correct: false }
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Preencher campos quando estiver editando
  useEffect(() => {
    if (modo === 'editar' && questao) {
      setTipo(questao.type)
      setTextoPergunta(questao.questionText || '')
      setPontos(questao.points?.toString() || '')
      setOrdemQuestao(questao.order?.toString() || '1')
      
      if (questao.type === 'multiple_choice' && questao.options) {
        setAlternativas(questao.options)
      } else {
        setAlternativas([
          { id: 'opt1', text: '', is_correct: false },
          { id: 'opt2', text: '', is_correct: false }
        ])
      }
    } else {
      // Resetar campos ao criar
      setTipo('multiple_choice')
      setTextoPergunta('')
      setPontos('')
      setOrdemQuestao(ordem.toString())
      setAlternativas([
        { id: 'opt1', text: '', is_correct: false },
        { id: 'opt2', text: '', is_correct: false }
      ])
    }
    setErrors({})
  }, [modo, questao, ordem, isOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!textoPergunta.trim()) {
      newErrors.textoPergunta = 'Texto da pergunta é obrigatório'
    }

    if (!pontos || isNaN(Number(pontos)) || Number(pontos) < 0) {
      newErrors.pontos = 'Pontos deve ser um número maior ou igual a 0'
    }

    if (tipo === 'multiple_choice') {
      if (alternativas.length < 2) {
        newErrors.alternativas = 'Múltipla escolha deve ter pelo menos 2 alternativas'
      }

      const alternativasComTexto = alternativas.filter(opt => opt.text.trim())
      if (alternativasComTexto.length < 2) {
        newErrors.alternativas = 'Pelo menos 2 alternativas devem ter texto'
      }

      const corretas = alternativas.filter(opt => opt.is_correct && opt.text.trim())
      if (corretas.length !== 1) {
        newErrors.alternativas = 'Deve haver exatamente 1 alternativa correta'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const adicionarAlternativa = () => {
    const novaId = `opt${Date.now()}`
    setAlternativas([...alternativas, { id: novaId, text: '', is_correct: false }])
  }

  const removerAlternativa = (index: number) => {
    if (alternativas.length <= 2) {
      toast({
        title: "Mínimo de alternativas",
        description: "Múltipla escolha deve ter pelo menos 2 alternativas",
        variant: "error"
      })
      return
    }
    setAlternativas(alternativas.filter((_, i) => i !== index))
  }

  const atualizarAlternativa = (index: number, campo: 'text' | 'is_correct', valor: string | boolean) => {
    const novas = [...alternativas]
    if (campo === 'is_correct' && valor === true) {
      // Desmarcar todas as outras
      novas.forEach((alt, i) => {
        alt.is_correct = i === index
      })
    } else {
      novas[index][campo] = valor as any
    }
    setAlternativas(novas)
  }

  const handleSalvar = () => {
    if (!validate()) {
      return
    }

    const payload: CreateExamQuestionPayload | UpdateExamQuestionPayload = {
      order: Number(ordemQuestao),
      type: tipo,
      questionText: textoPergunta.trim(),
      points: Number(pontos),
      ...(tipo === 'multiple_choice' ? {
        options: alternativas.filter(opt => opt.text.trim()),
        correctAnswer: null
      } : {
        options: null,
        correctAnswer: null,
        rubric: null
      })
    }

    if (modo === 'criar') {
      (payload as CreateExamQuestionPayload).examId = examId
    }

    onSalvar(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {modo === 'criar' ? 'Nova Questão' : 'Editar Questão'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Tipo de Questão */}
          <div>
            <Label htmlFor="tipo">Tipo de Questão *</Label>
            <Select value={tipo} onValueChange={(value) => setTipo(value as ExamQuestionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                <SelectItem value="essay">Dissertativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordem */}
          <div>
            <Label htmlFor="ordem">Ordem da Questão *</Label>
            <Input
              id="ordem"
              type="number"
              min="1"
              value={ordemQuestao}
              onChange={(e) => setOrdemQuestao(e.target.value)}
              className={errors.ordem ? 'border-destructive' : ''}
            />
            {errors.ordem && (
              <p className="text-sm text-destructive mt-1">{errors.ordem}</p>
            )}
          </div>

          {/* Texto da Pergunta */}
          <div>
            <Label htmlFor="textoPergunta">Texto da Pergunta *</Label>
            <Textarea
              id="textoPergunta"
              value={textoPergunta}
              onChange={(e) => setTextoPergunta(e.target.value)}
              placeholder="Digite a pergunta..."
              rows={4}
              className={errors.textoPergunta ? 'border-destructive' : ''}
            />
            {errors.textoPergunta && (
              <p className="text-sm text-destructive mt-1">{errors.textoPergunta}</p>
            )}
          </div>

          {/* Pontos */}
          <div>
            <Label htmlFor="pontos">Pontos *</Label>
            <Input
              id="pontos"
              type="number"
              min="0"
              step="0.1"
              value={pontos}
              onChange={(e) => setPontos(e.target.value)}
              placeholder="Ex: 2.5"
              className={errors.pontos ? 'border-destructive' : ''}
            />
            {errors.pontos && (
              <p className="text-sm text-destructive mt-1">{errors.pontos}</p>
            )}
          </div>

          {/* Alternativas (apenas para múltipla escolha) */}
          {tipo === 'multiple_choice' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Alternativas *</Label>
                <LiquidGlassButton
                  size="sm"
                  variant="outline"
                  onClick={adicionarAlternativa}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </LiquidGlassButton>
              </div>
              
              {errors.alternativas && (
                <p className="text-sm text-destructive mb-2">{errors.alternativas}</p>
              )}

              <div className="space-y-2">
                {alternativas.map((alt, index) => (
                  <div key={alt.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correta"
                      checked={alt.is_correct}
                      onChange={() => atualizarAlternativa(index, 'is_correct', true)}
                      className="rounded"
                    />
                    <Input
                      value={alt.text}
                      onChange={(e) => atualizarAlternativa(index, 'text', e.target.value)}
                      placeholder={`Alternativa ${index + 1}`}
                      className="flex-1"
                    />
                    {alternativas.length > 2 && (
                      <LiquidGlassButton
                        size="sm"
                        variant="outline"
                        onClick={() => removerAlternativa(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </LiquidGlassButton>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Marque a alternativa correta com o botão de seleção
              </p>
            </div>
          )}

          {/* Informação para dissertativa */}
          {tipo === 'essay' && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Questões dissertativas serão corrigidas manualmente pelo professor após a submissão da prova.
              </p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <LiquidGlassButton variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </LiquidGlassButton>
            <LiquidGlassButton onClick={handleSalvar}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </LiquidGlassButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

