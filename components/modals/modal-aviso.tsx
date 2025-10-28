'use client'

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Combobox } from "@/components/ui/combobox"
import type { ComboboxOption } from "@/components/ui/combobox"

export interface AvisoData {
  id?: number
  titulo: string
  turma: string
  data: string
  conteudo?: string
}

interface ModalAvisoProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: AvisoData) => void
  initialData?: AvisoData
  turmaOptions: ComboboxOption[]
}

export function ModalAviso({ isOpen, onClose, onSave, initialData, turmaOptions }: ModalAvisoProps) {
  const [titulo, setTitulo] = useState("")
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null)
  const [data, setData] = useState("")
  const [conteudo, setConteudo] = useState("")

  useEffect(() => {
    if (initialData) {
      setTitulo(initialData.titulo || "")
      const found = turmaOptions.find(o => o.label === initialData.turma)
      setSelectedTurmaId(found?.id ?? null)
      setData(initialData.data || "")
      setConteudo(initialData.conteudo || "")
    } else {
      setTitulo("")
      setSelectedTurmaId(null)
      setData("")
      setConteudo("")
    }
  }, [initialData, isOpen, turmaOptions])

  const handleSave = () => {
    const turmaLabel = turmaOptions.find(o => o.id === selectedTurmaId)?.label || ""
    onSave({ id: initialData?.id, titulo, turma: turmaLabel, data, conteudo })
    onClose()
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Aviso' : 'Criar Aviso'}</DialogTitle>
          <DialogDescription>Preencha os campos para {initialData ? 'editar' : 'criar'} um aviso</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do aviso" />
            </div>
            <div>
              <Label htmlFor="turma">Turma</Label>
              <Combobox
                placeholder="Selecione ou pesquise a turma"
                options={turmaOptions}
                value={selectedTurmaId}
                onChange={setSelectedTurmaId}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="conteudo">Conteúdo</Label>
            <Textarea id="conteudo" rows={5} value={conteudo} onChange={(e) => setConteudo(e.target.value)} placeholder="Detalhes do aviso" />
          </div>
        </div>
        <DialogFooter>
          <LiquidGlassButton variant="outline" onClick={onClose}>Cancelar</LiquidGlassButton>
          <LiquidGlassButton onClick={handleSave} disabled={!titulo || !selectedTurmaId || !data}>Salvar</LiquidGlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


