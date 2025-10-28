"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

type Disciplina = {
  semestre: string
  periodoLetivo: string
  codigo: string
  nome: string
  situacao: "Aprovado" | "Reprovado" | "Cursando" | "Pendente"
  nota?: number
  faltas?: number
  creditos: number
  cargaHoraria: number
  tipo: "obrigatoria" | "optativa"
}

interface ModalGradeSemestreProps {
  isOpen: boolean
  onClose: () => void
  semestre: string
  disciplinas: Disciplina[]
}

export function ModalGradeSemestre({ isOpen, onClose, semestre, disciplinas }: ModalGradeSemestreProps) {
  const totalCH = disciplinas.reduce((acc, d) => acc + d.cargaHoraria, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Detalhes do Período Letivo</h2>
              <p className="text-sm text-muted-foreground mt-1">Período: {semestre}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 pr-1">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-b border-green-200 dark:border-green-800">
                  <tr className="text-center">
                    <th className="py-3 pr-4 font-semibold text-center">Semestre</th>
                    <th className="py-3 px-2 font-semibold text-center">Período Letivo</th>
                    <th className="py-3 px-2 font-semibold text-center">Código</th>
                    <th className="py-3 px-2 font-semibold text-center">Disciplina</th>
                    <th className="py-3 px-2 font-semibold text-center">Situação</th>
                    <th className="py-3 px-2 font-semibold text-center">Nota</th>
                    <th className="py-3 px-2 font-semibold text-center">Faltas</th>
                    <th className="py-3 px-2 font-semibold text-center">Créditos</th>
                    <th className="py-3 pl-2 font-semibold text-center">CH</th>
                  </tr>
                </thead>
                <tbody>
                  {disciplinas.map((d, i) => (
                    <tr key={`${d.codigo}-${i}`} className="border-t text-center">
                      <td className="py-3 pr-4 text-center">
                        <div className="font-medium">{d.semestre}</div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="font-medium">{d.periodoLetivo}</div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono">{d.codigo}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="font-medium">{d.nome}</div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant={d.situacao === "Aprovado" ? "default" : "secondary"}>{d.situacao}</Badge>
                      </td>
                      <td className="py-3 px-2 text-center">{d.nota ?? "-"}</td>
                      <td className="py-3 px-2 text-center">{d.faltas ?? "-"}</td>
                      <td className="py-3 px-2 text-center">{d.creditos}</td>
                      <td className="py-3 pl-2 text-center">{d.cargaHoraria}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-green-50 dark:bg-green-900/20 border-t-2 border-green-200 dark:border-green-800">
                    <td className="py-3 pr-4 font-semibold text-center text-green-700 dark:text-green-300" colSpan={8}>Carga Horária Total</td>
                    <td className="py-3 pl-2 font-bold text-center text-green-800 dark:text-green-200">{totalCH}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


