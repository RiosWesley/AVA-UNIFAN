'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { DisciplineAttendance } from "@/src/types/Frequencia"


interface ModalFaltasAlunoProps {
  isOpen: boolean
  onClose: () => void
  disciplina: DisciplineAttendance | null
}

export function ModalFaltasAluno({ isOpen, onClose, disciplina }: ModalFaltasAlunoProps) {
  const totalFaltas = disciplina?.absences.length ?? 0

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle>
                {disciplina ? `Faltas - ${disciplina.name}` : 'Faltas'}
              </DialogTitle>
              <DialogDescription>
                {disciplina && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span>Professor: {disciplina.teacher}</span>
                    <span>• Aulas no semestre: {disciplina.totalWorkload}</span>
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
            {disciplina?.absences.length ? (
              disciplina.absences.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 mr-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 font-medium truncate">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{a.date}</span>
                      <span className="text-muted-foreground">•</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{a.reason}</span>
                    </div>
                    {a.reason && (
                      <div className="text-xs text-muted-foreground truncate">Motivo: {a.reason}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge variant="destructive">Falta</Badge>
                    <Badge variant="outline">Unidade {a.unit}</Badge>
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


