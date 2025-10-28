"use client"

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { X, MessageCircle, Send } from "lucide-react"

interface Comentario {
  id: number
  autor: string
  texto: string
  data: string
  parentId?: number
}

export interface ForumDiscussao {
  id: number
  titulo: string
  descricao: string
  autor: string
  dataCriacao: string
  comentarios: Comentario[]
}

interface ModalDiscussaoForumProps {
  isOpen: boolean
  onClose: () => void
  forum: ForumDiscussao | null
  onResponder?: (texto: string, parentId?: number) => void
}

export function ModalDiscussaoForum({ isOpen, onClose, forum, onResponder }: ModalDiscussaoForumProps) {
  const [replyOpenId, setReplyOpenId] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [visibleTopLevel, setVisibleTopLevel] = useState(10)
  const [novoComentario, setNovoComentario] = useState('')

  useEffect(() => {
    // Poderia carregar comentários do backend quando abrir
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setReplyOpenId(null)
      setReplyText('')
      setVisibleTopLevel(10)
    }
  }, [isOpen])

  const comentarios = forum?.comentarios || []

  const childrenByParent = useMemo(() => {
    const map = new Map<number | undefined, Comentario[]>()
    comentarios.forEach(c => {
      const key = c.parentId
      const arr = map.get(key) || []
      arr.push(c)
      map.set(key, arr)
    })
    // Ordena por id para consistência
    map.forEach(arr => arr.sort((a, b) => a.id - b.id))
    return map
  }, [comentarios])

  const topLevel = useMemo(() => (childrenByParent.get(undefined) || childrenByParent.get(null as any) || []), [childrenByParent])

  const handleAbrirResposta = (comentarioId: number) => {
    setReplyOpenId(prev => (prev === comentarioId ? null : comentarioId))
    setReplyText('')
  }

  const handleEnviarResposta = (comentarioId: number) => {
    const texto = replyText.trim()
    if (!texto) return
    onResponder?.(texto, comentarioId)
    setReplyText('')
    setReplyOpenId(null)
  }

  const handleEnviarNovoComentario = () => {
    const texto = novoComentario.trim()
    if (!texto) return
    onResponder?.(texto)
    setNovoComentario('')
  }

  const renderThread = useCallback((parentId: number | undefined, depth: number): JSX.Element[] => {
    const list = childrenByParent.get(parentId) || []
    const items: JSX.Element[] = []
    list.forEach((c) => {
      items.push(
        <div key={c.id} className="p-3 border rounded-lg" style={{ marginLeft: depth * 16 }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{c.autor}</Badge>
            </div>
            <span className="text-xs text-muted-foreground">{c.data}</span>
          </div>
          <p className="text-sm mb-2">{c.texto}</p>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => handleAbrirResposta(c.id)}>
              Responder
            </Button>
          </div>
          {replyOpenId === c.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Responder para ${c.autor}...`}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setReplyOpenId(null)}>Cancelar</Button>
                <LiquidGlassButton size="sm" onClick={() => handleEnviarResposta(c.id)} disabled={!replyText.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </LiquidGlassButton>
              </div>
            </div>
          )}
          {/* Renderiza filhos */}
          {renderThread(c.id, depth + 1)}
        </div>
      )
    })
    return items
  }, [childrenByParent, replyOpenId, replyText])

  if (!forum) return null

  const canShowMore = topLevel.length > visibleTopLevel
  const topLevelToRender = topLevel.slice(0, visibleTopLevel)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold">{forum.titulo}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tópico por {forum.autor} • {forum.dataCriacao}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 pr-1">
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{forum.descricao}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Discussão ({comentarios.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {topLevelToRender.map((c) => (
                      <div key={c.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{c.autor}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{c.data}</span>
                        </div>
                        <p className="text-sm mb-2">{c.texto}</p>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleAbrirResposta(c.id)}>
                            Responder
                          </Button>
                        </div>
                        {replyOpenId === c.id && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Responder para ${c.autor}...`}
                              rows={3}
                            />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setReplyOpenId(null)}>Cancelar</Button>
                              <LiquidGlassButton size="sm" onClick={() => handleEnviarResposta(c.id)} disabled={!replyText.trim()}>
                                <Send className="h-4 w-4 mr-2" />
                                Enviar
                              </LiquidGlassButton>
                            </div>
                          </div>
                        )}
                        {renderThread(c.id, 1)}
                      </div>
                    ))}
                    {canShowMore && (
                      <div className="flex justify-center">
                        <Button variant="outline" onClick={() => setVisibleTopLevel(v => v + 10)}>
                          Mostrar mais
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Novo comentário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Escreva um novo comentário na discussão..."
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <LiquidGlassButton onClick={handleEnviarNovoComentario} disabled={!novoComentario.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Publicar comentário
                    </LiquidGlassButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
