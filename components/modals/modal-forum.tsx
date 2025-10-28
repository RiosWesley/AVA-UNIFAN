"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Save, X } from "lucide-react"
import { toast } from "@/components/ui/toast"

export interface ForumData {
  id?: number
  titulo: string
  descricao: string
}

interface ModalForumProps {
  isOpen: boolean
  onClose: () => void
  forum?: ForumData | null
  onSalvar: (forum: ForumData) => void
  modo: 'criar' | 'editar'
}

export function ModalForum({ isOpen, onClose, forum = null, onSalvar, modo }: ModalForumProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (modo === 'editar' && forum) {
      setTitulo(forum.titulo || '')
      setDescricao(forum.descricao || '')
    } else {
      setTitulo('')
      setDescricao('')
    }
    setErrors({})
  }, [forum, modo, isOpen])

  const validar = () => {
    const e: Record<string, string> = {}
    if (!titulo.trim()) e.titulo = 'Título é obrigatório'
    if (!descricao.trim()) e.descricao = 'Descrição é obrigatória'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSalvar = () => {
    if (!validar()) {
      toast({ title: 'Dados inválidos', description: 'Verifique os campos destacados e tente novamente', variant: 'error' })
      return
    }

    const data: ForumData = {
      ...(forum?.id && { id: forum.id }),
      titulo: titulo.trim(),
      descricao: descricao.trim(),
    }

    onSalvar(data)
    toast({ title: modo === 'criar' ? 'Fórum criado' : 'Fórum atualizado', description: `"${titulo}" salvo com sucesso!` })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            <h2 className="text-xl font-bold">{modo === 'criar' ? 'Novo Fórum' : 'Editar Fórum'}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {modo === 'criar' ? 'Crie um novo tópico de discussão para a turma' : 'Atualize as informações do fórum'}
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 pr-1">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Dúvidas sobre a prova" className={errors.titulo ? 'border-destructive' : ''} />
              {errors.titulo && <p className="text-sm text-destructive mt-1">{errors.titulo}</p>}
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descreva o tema do fórum..." rows={5} className={errors.descricao ? 'border-destructive' : ''} />
              {errors.descricao && <p className="text-sm text-destructive mt-1">{errors.descricao}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <LiquidGlassButton onClick={handleSalvar}>
            <Save className="h-4 w-4 mr-2" />
            {modo === 'criar' ? 'Criar Fórum' : 'Salvar Alterações'}
          </LiquidGlassButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
