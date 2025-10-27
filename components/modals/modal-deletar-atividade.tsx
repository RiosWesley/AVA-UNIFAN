"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Trash2, AlertTriangle, X } from "lucide-react"
import { toast } from "@/components/ui/toast"

interface ModalDeletarAtividadeProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: number
    titulo?: string
    nome?: string
    tipo: string
  } | null
  tipo: 'atividade' | 'material'
  onConfirmarDelete: (itemId: number) => void
}

export function ModalDeletarAtividade({
  isOpen,
  onClose,
  item,
  tipo,
  onConfirmarDelete
}: ModalDeletarAtividadeProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)

  // Detectar tema liquid glass
  useEffect(() => {
    const checkTheme = () => {
      if (typeof document !== 'undefined') {
        setIsLiquidGlass(document.documentElement.classList.contains('liquid-glass'))
      }
    }
    checkTheme()

    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const handleDelete = async () => {
    if (!item) return

    setIsDeleting(true)

    try {
      // Simular delay para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 1000))

      onConfirmarDelete(item.id)

      toast({
        title: `${tipoItem.charAt(0).toUpperCase() + tipoItem.slice(1)} excluída`,
        description: `"${itemNome}" foi excluída com sucesso!`
      })

      onClose()
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao tentar excluir a atividade. Tente novamente.",
        variant: "error"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const itemNome = item?.titulo || item?.nome || ''
  const tipoItem = tipo === 'atividade' ? 'atividade' : 'material'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="text-left">
            Esta ação não pode ser desfeita. Todos os dados relacionados à {tipoItem} serão permanentemente removidos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {item && (
            <div className={`p-4 rounded-lg border ${
              isLiquidGlass ? 'liquid-glass-card' : 'bg-destructive/5 border-destructive/20'
            }`}>
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground">
                    {itemNome}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tipo: {item.tipo}
                  </p>
                  <div className="mt-3 p-2 bg-destructive/10 rounded text-xs text-destructive font-medium">
                    ⚠️ Todos os dados serão perdidos permanentemente
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
