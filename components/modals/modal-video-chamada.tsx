
import { ReactNode } from 'react';
import { 
  Dialog, 
  DialogClose, 
  DialogContent,
  DialogHeader,      
  DialogTitle,       
  DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CalendarClock, Phone, Video } from 'lucide-react'

type ModalVideoChamadaProps = {
  isOpen: boolean
  onClose: () => void;
  titulo?: string
  dataHora?: string
  children: ReactNode;
}

export function ModalVideoChamada({ isOpen, onClose, titulo, dataHora, children }: ModalVideoChamadaProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 left-0 top-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none p-0 border-0 flex flex-col">
        <DialogHeader className="p-4 border-b border-border/50 bg-card flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5 text-primary" />
            <div>
              <DialogTitle className="font-semibold text-left">{titulo ?? 'Vídeo-chamada'}</DialogTitle>
              {dataHora && (
                <DialogDescription className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="h-3 w-3" /> {new Date(dataHora).toLocaleString('pt-BR')}
                </DialogDescription>
              )}
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="destructive" size="sm">
              <Phone className="h-4 w-4 mr-2" /> Sair da Chamada
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="flex-1 p-4 overflow-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}