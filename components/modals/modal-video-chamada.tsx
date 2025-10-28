'use client'

import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, Phone, Video } from 'lucide-react'

type ModalVideoChamadaProps = {
  isOpen: boolean
  onClose: (open: boolean) => void
  titulo?: string
  dataHora?: string
}

export function ModalVideoChamada({ isOpen, onClose, titulo, dataHora }: ModalVideoChamadaProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 left-0 top-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none p-0 border-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/20 to-transparent">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-semibold">{titulo ?? 'Vídeo-chamada'}</h4>
                {dataHora && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarClock className="h-3 w-3" /> {new Date(dataHora).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="destructive" size="sm">
                <Phone className="h-4 w-4 mr-2" /> Sair
              </Button>
            </DialogClose>
          </div>
          <div className="flex-1 bg-muted/50 flex items-center justify-center">
            <div className="bg-black rounded-lg w-[85%] h-[80%] flex items-center justify-center text-white">
              Em chamada...
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


