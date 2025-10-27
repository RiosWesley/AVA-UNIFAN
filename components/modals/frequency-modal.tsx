'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Switch } from "@/components/ui/switch"

interface Aluno {
  id: string
  nome: string
  matricula: string
}

interface Aula {
  id: string
  data: Date
  horario: string
  sala: string
  status: 'agendada' | 'lancada' | 'retificada'
  alunosPresentes?: string[]
  dataLancamento?: Date
  aulaIndex?: number // Para ordenar temporalmente as aulas do mesmo dia
}

interface Turma {
  id: number
  nome: string
  disciplina: string
  alunos: number
  mediaGeral: number
  frequenciaMedia: number
  proximaAula: string
  sala: string
  atividades: number
  avaliacoes: number
  listaAlunos: Aluno[]
  aulas: Aula[]
}

interface FrequencyModalProps {
  isOpen: boolean
  onClose: () => void
  turma: Turma | null
  aulas: Aula[] // Mudança: array de aulas ao invés de uma aula única
  frequenciaData: Record<string, Record<string, boolean>> // Mudança: alunoId -> horarioId -> presente
  onFrequenciaChange: (alunoId: string, horarioId: string, presente: boolean) => void
  onMarkAll: (presente: boolean) => void
  onSave: () => void
}

// Função para ordenar aulas por horário
const sortAulasByTime = (aulas: Aula[]): Aula[] => {
  return [...aulas].sort((a, b) => {
    // Se não há aulaIndex, usar o horário como fallback
    const indexA = a.aulaIndex ?? 0
    const indexB = b.aulaIndex ?? 0
    return indexA - indexB
  })
}

export function FrequencyModal({
  isOpen,
  onClose,
  turma,
  aulas,
  frequenciaData,
  onFrequenciaChange,
  onMarkAll,
  onSave
}: FrequencyModalProps) {
  // Ordenar aulas por horário
  const sortedAulas = sortAulasByTime(aulas)

  // Verificar se todos os alunos estão presentes em todas as aulas
  const allPresent = turma?.listaAlunos.every(aluno =>
    sortedAulas.every(aula => frequenciaData[aluno.id]?.[aula.id])
  ) || false

  const allAbsent = turma?.listaAlunos.every(aluno =>
    sortedAulas.every(aula => !frequenciaData[aluno.id]?.[aula.id])
  ) || false

  const somePresent = turma?.listaAlunos.some(aluno =>
    sortedAulas.some(aula => frequenciaData[aluno.id]?.[aula.id])
  ) || false

  // Função para implementar lógica de cascata
  const handleFrequenciaChangeWithCascade = (alunoId: string, aulaId: string, presente: boolean) => {
    const aulaIndex = sortedAulas.findIndex(aula => aula.id === aulaId)
    if (aulaIndex === -1) return

    // Se marcando presença no primeiro horário, marcar automaticamente nos subsequentes
    if (presente && aulaIndex === 0) {
      // Marcar presença em todas as aulas para este aluno
      sortedAulas.forEach(aula => {
        onFrequenciaChange(alunoId, aula.id, true)
      })
    } else {
      // Para outros horários, apenas marcar o horário específico
      onFrequenciaChange(alunoId, aulaId, presente)
    }
  }

  // Função para marcar todos os alunos em todas as aulas
  const handleMarkAll = (presente: boolean) => {
    if (!turma) return

    turma.listaAlunos.forEach(aluno => {
      sortedAulas.forEach(aula => {
        onFrequenciaChange(aluno.id, aula.id, presente)
      })
    })
  }
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {turma?.nome} - {sortedAulas.length > 1
                  ? `${sortedAulas.length} aulas no dia`
                  : sortedAulas[0]?.horario}
              </DialogTitle>
              <DialogDescription>
                {sortedAulas[0]?.data.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • Sala {turma?.sala}
                {sortedAulas.length > 1 && (
                  <span className="ml-2">
                    • Horários: {sortedAulas.map(aula => aula.horario).join(', ')}
                  </span>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3 bg-muted/50 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium">
                {allPresent ? 'Todos Presentes' : allAbsent ? 'Todos Ausentes' : 'Marcar Todos'}
              </span>
              <Switch
                checked={allPresent}
                onCheckedChange={(checked) => {
                  handleMarkAll(checked)
                }}
                disabled={!turma?.listaAlunos.length}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {turma?.listaAlunos.map((aluno) => (
                <div
                  key={aluno.id}
                  className="border border-border/50 rounded-lg hover:bg-muted/50 transition-colors bg-card/50 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-lg">{aluno.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        Matrícula: {aluno.matricula}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sortedAulas.map((aula, index) => (
                      <div
                        key={aula.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{aula.horario}</div>
                          <div className="text-xs text-muted-foreground">Aula {index + 1}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            frequenciaData[aluno.id]?.[aula.id]
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {frequenciaData[aluno.id]?.[aula.id] ? 'P' : 'A'}
                          </span>
                          <Switch
                            checked={frequenciaData[aluno.id]?.[aula.id] || false}
                            onCheckedChange={(checked) => handleFrequenciaChangeWithCascade(aluno.id, aula.id, checked)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <LiquidGlassButton variant="outline" onClick={onClose}>
            Cancelar
          </LiquidGlassButton>
          <LiquidGlassButton onClick={onSave}>
            {sortedAulas.every(aula => aula.status === 'agendada') ? 'Lançar Frequência' : 'Salvar Alterações'}
          </LiquidGlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
