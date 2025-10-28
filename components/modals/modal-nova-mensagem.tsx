'use client'

import { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Combobox } from "@/components/ui/combobox"

export interface DestinatarioOption {
  id: string
  label: string
}

interface ModalNovaMensagemProps {
  isOpen: boolean
  onClose: () => void
  onSend?: (payload: { destinatarioId: string | null; prioridade: string; assunto: string; mensagem: string }) => void
  destinatarios: DestinatarioOption[]
}

export function ModalNovaMensagem({ isOpen, onClose, onSend, destinatarios }: ModalNovaMensagemProps) {
  const [selectedDestinatarioId, setSelectedDestinatarioId] = useState<string | null>(null)
  const [prioridade, setPrioridade] = useState<string>("normal")
  const [assunto, setAssunto] = useState("")
  const [mensagem, setMensagem] = useState("")

  const handleSend = () => {
    onSend?.({ destinatarioId: selectedDestinatarioId, prioridade, assunto, mensagem })
    onClose()
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Mensagem</DialogTitle>
          <DialogDescription>Envie uma nova mensagem para alunos ou colegas</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="destinatario">Destinatário</Label>
              <Combobox
                placeholder="Pesquise pelo nome do aluno ou turma"
                options={destinatarios}
                value={selectedDestinatarioId}
                onChange={setSelectedDestinatarioId}
              />
            </div>
            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger>
                  <SelectValue placeholder="Normal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assunto">Assunto</Label>
            <Input id="assunto" placeholder="Digite o assunto da mensagem" value={assunto} onChange={e => setAssunto(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea id="mensagem" placeholder="Digite sua mensagem..." rows={6} value={mensagem} onChange={e => setMensagem(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <LiquidGlassButton variant="outline" onClick={onClose}>Cancelar</LiquidGlassButton>
          <LiquidGlassButton onClick={handleSend} disabled={!selectedDestinatarioId || !assunto || !mensagem}>Enviar Mensagem</LiquidGlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


