"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Save, X } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { LiveSessionDTO, CreateLiveSessionPayload, UpdateLiveSessionPayload } from "@/src/services/liveSessionsService"

interface ModalVideoChamadaFormProps {
  isOpen: boolean
  onClose: () => void
  videoChamada?: LiveSessionDTO | null
  classId: string
  onSalvar: (payload: CreateLiveSessionPayload | UpdateLiveSessionPayload) => void
  modo: 'criar' | 'editar'
}

export function ModalVideoChamadaForm({
  isOpen,
  onClose,
  videoChamada = null,
  classId,
  onSalvar,
  modo
}: ModalVideoChamadaFormProps) {
  const [titulo, setTitulo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataTermino, setDataTermino] = useState('')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Função auxiliar para formatar data para input datetime-local
  const formatDateTimeLocal = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    // Formato: YYYY-MM-DDTHH:mm
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Preencher campos quando estiver editando
  useEffect(() => {
    if (modo === 'editar' && videoChamada) {
      setTitulo(videoChamada.title || '')
      setDataInicio(formatDateTimeLocal(videoChamada.startAt))
      setDataTermino(formatDateTimeLocal(videoChamada.endAt))
      setMeetingUrl(videoChamada.meetingUrl || '')
    } else {
      // Resetar campos ao criar
      setTitulo('')
      setDataInicio('')
      setDataTermino('')
      setMeetingUrl('')
    }
    setErrors({})
  }, [modo, videoChamada, isOpen])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório'
    } else if (titulo.length > 200) {
      newErrors.titulo = 'Título deve ter no máximo 200 caracteres'
    }

    if (!dataInicio) {
      newErrors.dataInicio = 'Data e hora de início são obrigatórias'
    }

    if (!dataTermino) {
      newErrors.dataTermino = 'Data e hora de término são obrigatórias'
    }

    // Validar que data de término seja posterior à data de início
    if (dataInicio && dataTermino) {
      const inicio = new Date(dataInicio)
      const termino = new Date(dataTermino)
      if (termino <= inicio) {
        newErrors.dataTermino = 'Data de término deve ser posterior à data de início'
      }
    }

    if (meetingUrl && meetingUrl.length > 500) {
      newErrors.meetingUrl = 'URL da reunião deve ter no máximo 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSalvar = () => {
    if (!validate()) {
      return
    }

    // Converter datas de datetime-local para ISO string
    const startAtISO = new Date(dataInicio).toISOString()
    const endAtISO = new Date(dataTermino).toISOString()

    if (modo === 'criar') {
      const payload: CreateLiveSessionPayload = {
        classId,
        title: titulo.trim(),
        startAt: startAtISO,
        endAt: endAtISO,
        meetingUrl: meetingUrl.trim() || undefined
      }
      onSalvar(payload)
    } else {
      const payload: UpdateLiveSessionPayload = {
        title: titulo.trim(),
        startAt: startAtISO,
        endAt: endAtISO,
        meetingUrl: meetingUrl.trim() || undefined
      }
      onSalvar(payload)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {modo === 'criar' ? 'Nova Videochamada' : 'Editar Videochamada'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Título */}
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value)
                if (errors.titulo) {
                  setErrors(prev => ({ ...prev, titulo: '' }))
                }
              }}
              placeholder="Ex: Aula de Revisão - Matemática"
              maxLength={200}
              className={errors.titulo ? 'border-destructive' : ''}
            />
            {errors.titulo && (
              <p className="text-sm text-destructive mt-1">{errors.titulo}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Máximo de 200 caracteres
            </p>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data e Hora de Início *</Label>
              <Input
                id="dataInicio"
                type="datetime-local"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value)
                  if (errors.dataInicio) {
                    setErrors(prev => ({ ...prev, dataInicio: '' }))
                  }
                }}
                className={errors.dataInicio ? 'border-destructive' : ''}
              />
              {errors.dataInicio && (
                <p className="text-sm text-destructive mt-1">{errors.dataInicio}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Quando a videochamada começará
              </p>
            </div>
            <div>
              <Label htmlFor="dataTermino">Data e Hora de Término *</Label>
              <Input
                id="dataTermino"
                type="datetime-local"
                value={dataTermino}
                onChange={(e) => {
                  setDataTermino(e.target.value)
                  if (errors.dataTermino) {
                    setErrors(prev => ({ ...prev, dataTermino: '' }))
                  }
                }}
                className={errors.dataTermino ? 'border-destructive' : ''}
              />
              {errors.dataTermino && (
                <p className="text-sm text-destructive mt-1">{errors.dataTermino}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Quando a videochamada terminará
              </p>
            </div>
          </div>

          {/* URL da Reunião */}
          <div>
            <Label htmlFor="meetingUrl">URL da Reunião (opcional)</Label>
            <Input
              id="meetingUrl"
              type="url"
              value={meetingUrl}
              onChange={(e) => {
                setMeetingUrl(e.target.value)
                if (errors.meetingUrl) {
                  setErrors(prev => ({ ...prev, meetingUrl: '' }))
                }
              }}
              placeholder="https://meet.google.com/..."
              maxLength={500}
              className={errors.meetingUrl ? 'border-destructive' : ''}
            />
            {errors.meetingUrl && (
              <p className="text-sm text-destructive mt-1">{errors.meetingUrl}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Link para a reunião (ex: Google Meet, Zoom, etc.)
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <LiquidGlassButton variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </LiquidGlassButton>
          <LiquidGlassButton onClick={handleSalvar}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </LiquidGlassButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

