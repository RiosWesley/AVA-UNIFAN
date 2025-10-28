'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react'

type FaltaAula = {
  id: string
  data: string
  horario: string
  motivo?: string
  etapa: number
}

type DisciplinaFaltas = {
  id: string
  nome: string
  professor: string
  sala?: string
  totalAulas: number
  faltas: FaltaAula[]
}

interface ModalFaltasAlunoProps {
  isOpen: boolean
  onClose: () => void
  disciplina: DisciplinaFaltas | null
}

export function ModalFaltasAluno({ isOpen, onClose, disciplina }: ModalFaltasAlunoProps) {
  const totalFaltas = disciplina?.faltas.length ?? 0

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle>
                {disciplina ? `Faltas - ${disciplina.nome}` : 'Faltas'}
              </DialogTitle>
              <DialogDescription>
                {disciplina && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span>Professor: {disciplina.professor}</span>
                    {disciplina.sala && <span>• Sala {disciplina.sala}</span>}
                    <span>• Aulas no semestre: {disciplina.totalAulas}</span>
                    <span>• Faltas: {totalFaltas}</span>
                  </div>
                )}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-3">
            {disciplina?.faltas.length ? (
              disciplina.faltas.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 mr-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium truncate">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{f.data}</span>
                      <span className="text-muted-foreground">•</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{f.horario}</span>
                    </div>
                    {f.motivo && (
                      <div className="text-xs text-muted-foreground truncate">Motivo: {f.motivo}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge variant="destructive">Falta</Badge>
                    <Badge variant="outline">Etapa {f.etapa}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">Nenhuma falta registrada para esta disciplina.</div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}


