'use client'

import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Film, ListVideo, Play, Pause, Maximize2, Minimize2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import * as React from 'react'

export type AulaItem = {
  id: number
  titulo: string
  duracao: string
  visto: boolean
  url: string
}

type ModalVideoAulaProps = {
  isOpen: boolean
  onClose: (open: boolean) => void
  aulas: AulaItem[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function ModalVideoAula({ isOpen, onClose, aulas, selectedId, onSelect }: ModalVideoAulaProps) {
  const selecionada = React.useMemo(() => aulas.find(a => a.id === selectedId) || null, [aulas, selectedId])
  const [collapsed, setCollapsed] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const playerContainerRef = React.useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [showPulse, setShowPulse] = React.useState<'play' | 'pause' | null>(null)
  const [isFullscreen, setIsFullscreen] = React.useState(false)


  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onLoaded = () => setDuration(v.duration || 0)
    const onTime = () => setCurrentTime(v.currentTime || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    v.addEventListener('loadedmetadata', onLoaded)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [selecionada?.url])

  React.useEffect(() => {
    const onFsChange = () => {
      const fsElement = (document as any).fullscreenElement || (document as any).webkitFullscreenElement
      setIsFullscreen(Boolean(fsElement))
    }
    document.addEventListener('fullscreenchange', onFsChange)
    const anyDoc = document as any
    if (typeof anyDoc.addEventListener === 'function' && 'webkitFullscreenElement' in anyDoc) {
      document.addEventListener('webkitfullscreenchange', onFsChange as any)
    }
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      if (typeof anyDoc.removeEventListener === 'function' && 'webkitFullscreenElement' in anyDoc) {
        document.removeEventListener('webkitfullscreenchange', onFsChange as any)
      }
    }
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setShowPulse('play')
    } else {
      v.pause()
      setShowPulse('pause')
    }
    setTimeout(() => setShowPulse(null), 450)
  }

  const seekTo = (time: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.min(Math.max(time, 0), duration || 0)
  }

  const toggleFullscreen = async () => {
    const el: any = playerContainerRef.current
    if (!el) return
    const doc: any = document
    if (!isFullscreen) {
      if (el.requestFullscreen) await el.requestFullscreen()
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    } else {
      if (doc.exitFullscreen) await doc.exitFullscreen()
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen()
    }
  }

  const fmt = (s: number) => {
    if (!isFinite(s)) return '00:00'
    const mm = Math.floor(s / 60)
    const ss = Math.floor(s % 60)
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 left-0 top-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none p-0 border-0 overflow-hidden">
        <div className="flex h-full">
          {/* Lateral: trilha */}
          <aside className={cn("border-r border-border/50 bg-background/95 backdrop-blur transition-all duration-200", collapsed ? "w-14" : "w-80")}> 
            <div className={cn("border-b border-border/50 flex items-center", collapsed ? "justify-center p-2" : "justify-between p-4 bg-gradient-to-r from-primary/15 to-primary/5")}> 
              <div className="flex items-center gap-2 text-foreground">
                <ListVideo className="h-5 w-5" />
                {!collapsed && <h4 className="font-semibold">Trilha de vídeo-aulas</h4>}
              </div>
              {!collapsed && (
                <Button aria-label="Recolher trilha" title="Recolher trilha" variant="ghost" size="icon" onClick={() => setCollapsed(true)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {collapsed && (
                <Button aria-label="Expandir trilha" title="Expandir trilha" variant="ghost" size="icon" onClick={() => setCollapsed(false)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className={cn("overflow-y-auto", collapsed ? "p-2 h-[calc(100%-48px)]" : "p-3 space-y-2 h-[calc(100%-64px)]")}> 
              {aulas.map((aula) => (
                <button
                  key={aula.id}
                  className={cn(
                    'w-full rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 hover:bg-accent/25',
                    selectedId === aula.id ? 'bg-accent/25' : '',
                    collapsed ? 'p-2' : 'p-3 text-left'
                  )}
                  onClick={() => onSelect(aula.id)}
                >
                  {collapsed ? (
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <Film className="h-4 w-4 text-primary" />
                        <span className={cn('absolute -top-1 -right-1 h-2 w-2 rounded-full', aula.visto ? 'bg-green-500' : 'bg-amber-500')} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Film className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm text-foreground">{aula.titulo}</span>
                        </div>
                        {aula.visto ? (
                          <Badge variant="default" className="gap-1">
                            <Eye className="h-3 w-3" /> Visto
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-amber-700 dark:text-amber-300">
                            <EyeOff className="h-3 w-3" /> Pendente
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{aula.duracao}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* Player */}
          <section className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/20 to-transparent">
              <div className="flex items-center gap-2 text-foreground">
                <Play className="h-5 w-5 text-primary" />
                <div>
                  <h5 className="font-semibold leading-tight">{selecionada?.titulo ?? 'Vídeo-aula'}</h5>
                  {selecionada && (
                    <p className="text-xs text-muted-foreground">Duração: {selecionada.duracao}</p>
                  )}
                </div>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="text-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            <div ref={playerContainerRef} className="flex-1 bg-black relative overflow-hidden min-h-[320px] sm:min-h-[420px] md:min-h-[520px] grid grid-rows-[1fr_auto]">
              {selecionada ? (
                <>
                  {selecionada.url ? (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      onClick={togglePlay}
                      playsInline
                    >
                      <source src={selecionada.url} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Carregando vídeo...</p>
                      </div>
                    </div>
                  )}
                  {/* Pulse overlay */}
                  {showPulse && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-white/20 p-6 backdrop-blur-sm transform transition duration-300 scale-100 opacity-100">
                        {showPulse === 'play' ? (
                          <Play className="h-10 w-10 text-white" />
                        ) : (
                          <Pause className="h-10 w-10 text-white" />
                        )}
                      </div>
                    </div>
                  )}
                  {/* Controls */}
                  <div className="p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center gap-2 text-white">
                      <Button size="icon" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}>
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <span className="text-xs tabular-nums w-12 text-center">{fmt(currentTime)}</span>
                      <input
                        aria-label="Barra de progresso"
                        className="flex-1 accent-primary"
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={currentTime}
                        onChange={(e) => seekTo(Number(e.target.value))}
                      />
                      <span className="text-xs tabular-nums w-12 text-center">{fmt(duration)}</span>
                      <Button size="icon" variant="ghost" className="text-white hover:text-white hover:bg-white/10" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
                        {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/90">Selecione uma aula na trilha</div>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}


