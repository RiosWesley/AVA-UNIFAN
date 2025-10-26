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
  aula: Aula | null
  frequenciaData: Record<string, boolean>
  onFrequenciaChange: (alunoId: string, presente: boolean) => void
  onMarkAll: (presente: boolean) => void
  onSave: () => void
}

export function FrequencyModal({
  isOpen,
  onClose,
  turma,
  aula,
  frequenciaData,
  onFrequenciaChange,
  onMarkAll,
  onSave
}: FrequencyModalProps) {
  // Verificar se todos os alunos estão presentes
  const allPresent = turma?.listaAlunos.every(aluno => frequenciaData[aluno.id]) || false
  const allAbsent = turma?.listaAlunos.every(aluno => !frequenciaData[aluno.id]) || false
  const somePresent = turma?.listaAlunos.some(aluno => frequenciaData[aluno.id]) || false
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {turma?.nome} - {aula?.horario}
              </DialogTitle>
              <DialogDescription>
                {aula?.data.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} • Sala {turma?.sala}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3 bg-muted/50 px-3 py-2 rounded-lg">
              <span className="text-sm font-medium">
                {allPresent ? 'Todos Presentes' : allAbsent ? 'Todos Ausentes' : 'Marcar Todos'}
              </span>
              <Switch
                checked={allPresent}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onMarkAll(true)
                  } else {
                    // Se está desmarcando, marcar todos como ausentes
                    onMarkAll(false)
                  }
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
                  className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors bg-card/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-lg">{aluno.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      Matrícula: {aluno.matricula}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      frequenciaData[aluno.id]
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {frequenciaData[aluno.id] ? 'Presente' : 'Ausente'}
                    </span>
                    <Switch
                      checked={frequenciaData[aluno.id] || false}
                      onCheckedChange={(checked) => onFrequenciaChange(aluno.id, checked)}
                    />
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
            {aula?.status === 'agendada' ? 'Lançar Frequência' : 'Salvar Alterações'}
          </LiquidGlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
