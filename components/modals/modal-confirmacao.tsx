'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LiquidGlassButton } from "@/components/liquid-glass"

interface ModalConfirmacaoProps {
  isOpen: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export function ModalConfirmacao({ isOpen, title = 'Confirmar ação', description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', onConfirm, onClose }: ModalConfirmacaoProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <LiquidGlassButton variant="outline" onClick={onClose}>{cancelLabel}</LiquidGlassButton>
          <LiquidGlassButton onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</LiquidGlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


