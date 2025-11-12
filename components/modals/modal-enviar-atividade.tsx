"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, CheckCircle, X } from "lucide-react"
import { toast } from '@/hooks/use-toast'
import { StudentActivity } from '@/src/Atividade'

interface ModalEnviarAtividadeProps {
  isOpen: boolean
  onClose: () => void
  atividade: StudentActivity | null;
  onEnviar: (activityId: string, file: File, comment: string) => Promise<void>;
  isPending?: boolean;
}

export function ModalEnviarAtividade({ 
  isOpen, 
  onClose, 
  atividade, 
  onEnviar,
  isPending = false 
}: ModalEnviarAtividadeProps) {
  const [file, setFile] = useState<File | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setFile(null)
      setComment('')
    }
  }, [isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'image/jpeg', 
        'image/png', 
        'text/plain'
      ]
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Use PDF, DOC, DOCX, JPG, PNG ou TXT",
          variant: "destructive",
        })
        return
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: "Máximo de 10MB permitido",
          variant: "destructive",
        })
        return
      }
    }
    setFile(selectedFile)
  }

  const handleSubmit = async () => {
    if (!atividade || !file) {
      toast({
        title: "Selecione um arquivo",
        description: "É necessário anexar um arquivo para enviar a atividade.",
        variant: "destructive",
      })
      return
    }

    try {
      await onEnviar(atividade.id, file, comment);
      onClose()
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  if (!atividade) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Enviar Atividade: {atividade.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informações da atividade */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Disciplina:</span>
              <p className="text-sm font-semibold">{atividade.disciplina}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Descrição:</span>
              <p className="text-sm">{atividade.descricao}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Prazo:</span>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                Vence em: {atividade.dataVencimento}
              </p>
            </div>
          </div>

          {/* Upload de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="arquivo-atividade">Enviar Arquivo *</Label>
            <Input
              id="arquivo-atividade"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              onChange={handleFileChange}
              disabled={isPending}
            />
            {file && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, TXT (máximo 10MB)
            </p>
          </div>

          {/* Comentário opcional */}
          <div className="space-y-2">
            <Label htmlFor="comentario-atividade">Comentário (opcional)</Label>
            <Textarea
              id="comentario-atividade"
              placeholder="Adicione um comentário sobre sua entrega..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isPending}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !file}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Atividade
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

