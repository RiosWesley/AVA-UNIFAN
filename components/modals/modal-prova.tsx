"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Save, X } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { ExamDTO, CreateExamPayload, UpdateExamPayload } from "@/src/services/examsService"
import { ActivityUnit } from "@/src/services/activitiesService"

interface ModalProvaProps {
  isOpen: boolean
  onClose: () => void
  prova?: ExamDTO | null
  activityId?: string
  onSalvar: (prova: CreateExamPayload | UpdateExamPayload, activityData?: { title: string; description?: string; startDate?: string; dueDate?: string; maxScore?: number; unit?: ActivityUnit }) => void
  modo: 'criar' | 'editar'
}

export function ModalProva({
  isOpen,
  onClose,
  prova = null,
  activityId,
  onSalvar,
  modo
}: ModalProvaProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [unidade, setUnidade] = useState<ActivityUnit>('1ª Unidade')
  const [dataInicio, setDataInicio] = useState('')
  const [dataTermino, setDataTermino] = useState('')
  const [tempoLimite, setTempoLimite] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [instrucoes, setInstrucoes] = useState('')
  const [shuffleQuestions, setShuffleQuestions] = useState(false)
  const [shuffleOptions, setShuffleOptions] = useState(false)
  const [autoGrade, setAutoGrade] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const UNIDADES: ActivityUnit[] = ['1ª Unidade', '2ª Unidade', 'Prova Final']

  // Função auxiliar para formatar data para input datetime-local
  const formatDateTimeLocal = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    // Formato: YYYY-MM-DDTHH:mm
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Preencher campos quando estiver editando
  useEffect(() => {
    if (modo === 'editar' && prova) {
      setTitulo(prova.activity?.title || '')
      setDescricao(prova.activity?.description || '')
      setUnidade(prova.activity?.unit || '1ª Unidade')
      setDataInicio(formatDateTimeLocal(prova.activity?.startDate))
      setDataTermino(formatDateTimeLocal(prova.activity?.dueDate))
      setTempoLimite(prova.timeLimitMinutes?.toString() || '')
      setMaxScore(prova.activity?.maxScore?.toString() || '')
      setInstrucoes(prova.instructions || '')
      setShuffleQuestions(prova.shuffleQuestions || false)
      setShuffleOptions(prova.shuffleOptions || false)
      setAutoGrade(prova.autoGrade !== undefined ? prova.autoGrade : true)
    } else {
      // Resetar campos ao criar
      setTitulo('')
      setDescricao('')
      setUnidade('1ª Unidade')
      setDataInicio('')
      setDataTermino('')
      setTempoLimite('')
      setMaxScore('')
      setInstrucoes('')
      setShuffleQuestions(false)
      setShuffleOptions(false)
      setAutoGrade(true)
    }
    setErrors({})
  }, [modo, prova, isOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório'
    }

    if (!unidade) {
      newErrors.unidade = 'Unidade é obrigatória'
    }

    if (!maxScore || isNaN(Number(maxScore)) || Number(maxScore) <= 0) {
      newErrors.maxScore = 'Pontuação máxima é obrigatória e deve ser maior que 0'
    }

    if (tempoLimite && (isNaN(Number(tempoLimite)) || Number(tempoLimite) < 1)) {
      newErrors.tempoLimite = 'Tempo limite deve ser um número maior que 0'
    }

    // Validar que data de término seja após data de início
    if (dataInicio && dataTermino) {
      const inicio = new Date(dataInicio)
      const termino = new Date(dataTermino)
      if (termino <= inicio) {
        newErrors.dataTermino = 'Data de término deve ser posterior à data de início'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSalvar = () => {
    if (!validate()) {
      return
    }

    const payload: CreateExamPayload | UpdateExamPayload = {
      timeLimitMinutes: tempoLimite ? Number(tempoLimite) : null,
      shuffleQuestions,
      shuffleOptions,
      autoGrade,
      instructions: instrucoes || null,
      settings: null,
    }

    const maxScoreValue = maxScore ? Number(maxScore) : undefined

    // Converter datas de datetime-local para ISO string
    const startDateISO = dataInicio ? new Date(dataInicio).toISOString() : undefined
    const dueDateISO = dataTermino ? new Date(dataTermino).toISOString() : undefined

    if (modo === 'criar') {
      // Passar dados da Activity para criar junto
      onSalvar(payload, {
        title: titulo.trim(),
        description: descricao || undefined,
        startDate: startDateISO,
        dueDate: dueDateISO,
        maxScore: maxScoreValue,
        unit: unidade
      })
    } else {
      // Ao editar, também atualizar dados da Activity
      onSalvar(payload, {
        title: titulo.trim(),
        description: descricao || undefined,
        startDate: startDateISO,
        dueDate: dueDateISO,
        maxScore: maxScoreValue,
        unit: unidade
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {modo === 'criar' ? 'Nova Prova Virtual' : 'Editar Prova Virtual'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Título */}
          <div>
            <Label htmlFor="titulo">Título da Prova *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Prova Bimestral - Matemática"
              className={errors.titulo ? 'border-destructive' : ''}
            />
            {errors.titulo && (
              <p className="text-sm text-destructive mt-1">{errors.titulo}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição da prova..."
              rows={3}
            />
          </div>

          {/* Unidade */}
          <div>
            <Label htmlFor="unidade">Unidade *</Label>
            <Select value={unidade} onValueChange={(value) => setUnidade(value as ActivityUnit)}>
              <SelectTrigger className={errors.unidade ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {UNIDADES.map((unidadeItem) => (
                  <SelectItem key={unidadeItem} value={unidadeItem}>
                    {unidadeItem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.unidade && (
              <p className="text-sm text-destructive mt-1">{errors.unidade}</p>
            )}
          </div>

          {/* Datas de Disponibilidade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data e Hora de Início</Label>
              <Input
                id="dataInicio"
                type="datetime-local"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className={errors.dataInicio ? 'border-destructive' : ''}
              />
              {errors.dataInicio && (
                <p className="text-sm text-destructive mt-1">{errors.dataInicio}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Quando a prova ficará disponível
              </p>
            </div>
            <div>
              <Label htmlFor="dataTermino">Data e Hora de Término</Label>
              <Input
                id="dataTermino"
                type="datetime-local"
                value={dataTermino}
                onChange={(e) => setDataTermino(e.target.value)}
                className={errors.dataTermino ? 'border-destructive' : ''}
              />
              {errors.dataTermino && (
                <p className="text-sm text-destructive mt-1">{errors.dataTermino}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Último momento para iniciar a prova
              </p>
            </div>
          </div>

          {/* Tempo Limite */}
          <div>
            <Label htmlFor="tempoLimite">Tempo Limite (minutos)</Label>
            <Input
              id="tempoLimite"
              type="number"
              min="1"
              value={tempoLimite}
              onChange={(e) => setTempoLimite(e.target.value)}
              placeholder="Ex: 60 (deixe vazio para sem limite)"
              className={errors.tempoLimite ? 'border-destructive' : ''}
            />
            {errors.tempoLimite && (
              <p className="text-sm text-destructive mt-1">{errors.tempoLimite}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Deixe vazio se não houver tempo limite
            </p>
          </div>

          {/* Pontuação Máxima */}
          <div>
            <Label htmlFor="maxScore">Pontuação Máxima *</Label>
            <Input
              id="maxScore"
              type="number"
              min="0.01"
              step="0.01"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              placeholder="Ex: 10.0"
              className={errors.maxScore ? 'border-destructive' : ''}
            />
            {errors.maxScore && (
              <p className="text-sm text-destructive mt-1">{errors.maxScore}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Pontuação total da prova (ex: 10.0, 100.0)
            </p>
          </div>

          {/* Instruções */}
          <div>
            <Label htmlFor="instrucoes">Instruções da Prova</Label>
            <Textarea
              id="instrucoes"
              value={instrucoes}
              onChange={(e) => setInstrucoes(e.target.value)}
              placeholder="Instruções específicas para os alunos..."
              rows={4}
            />
          </div>

          {/* Configurações */}
          <div className="space-y-3">
            <Label>Configurações</Label>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="shuffleQuestions"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="shuffleQuestions" className="font-normal cursor-pointer">
                Embaralhar ordem das perguntas
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="shuffleOptions"
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="shuffleOptions" className="font-normal cursor-pointer">
                Embaralhar ordem das alternativas
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoGrade"
                checked={autoGrade}
                onChange={(e) => setAutoGrade(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="autoGrade" className="font-normal cursor-pointer">
                Correção automática (para questões de múltipla escolha)
              </Label>
            </div>
          </div>

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

