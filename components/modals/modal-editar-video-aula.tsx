"use client"

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Save, X, Upload, FileVideo, AlertCircle, Clock } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { VideoLesson } from "@/lib/api-client"
import { cn } from "@/lib/utils"

interface ModalEditarVideoAulaProps {
  isOpen: boolean
  onClose: () => void
  videoAula: VideoLesson | null
  disciplineId: string
  onSalvar: () => void
}

export function ModalEditarVideoAula({
  isOpen,
  onClose,
  videoAula,
  disciplineId,
  onSalvar
}: ModalEditarVideoAulaProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)

  useEffect(() => {
    const checkTheme = () => {
      setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (videoAula && isOpen) {
      setTitulo(videoAula.title || '')
      setDescricao(videoAula.description || '')
      setArquivo(null)
      setErrors({})
    }
  }, [videoAula, isOpen])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setArquivo(file)
    if (errors.arquivo) {
      setErrors(prev => ({ ...prev, arquivo: '' }))
    }
  }

  const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validarCampos = () => {
    const novosErros: Record<string, string> = {}

    if (!titulo.trim()) {
      novosErros.titulo = 'Título é obrigatório'
    }

    if (arquivo) {
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (arquivo.size > maxSize) {
        novosErros.arquivo = 'Arquivo muito grande (máximo 500MB)'
      }
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
      if (!allowedTypes.includes(arquivo.type)) {
        novosErros.arquivo = 'Formato de vídeo não suportado (use MP4, WebM, OGG ou MOV)'
      }
    }

    setErrors(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleSalvar = async () => {
    if (!videoAula || !validarCampos()) {
      toast({
        title: "Dados inválidos",
        description: "Verifique os campos destacados e tente novamente.",
        variant: "error",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Importar apiClient dinamicamente para evitar problemas de importação circular
      const { apiClient } = await import('@/lib/api-client')

      // Primeiro, atualizar os metadados se houve mudanças
      if (titulo !== videoAula.title || descricao !== (videoAula.description || '')) {
        await apiClient.updateVideoLesson({
          disciplineId,
          videoLessonId: videoAula.id,
          title: titulo,
          description: descricao || undefined,
        })
      }

      // Depois, fazer upload do novo arquivo se foi selecionado
      if (arquivo) {
        await apiClient.uploadVideoLessonFile({
          videoLessonId: videoAula.id,
          file: arquivo,
        })
      }

      toast({
        title: "Vídeo-aula atualizada com sucesso! 🎉",
        description: `"${titulo}" foi atualizada.`,
      })

      onSalvar()
      onClose()
    } catch (error: any) {
      let errorMessage = "Verifique os dados e tente novamente."
      
      if (error?.response?.status === 403) {
        errorMessage = "Você não tem permissão para editar esta vídeo-aula."
      } else if (error?.response?.status === 400) {
        errorMessage = error?.response?.data?.message || "Dados inválidos. Verifique os campos e tente novamente."
      } else if (error?.response?.status === 404) {
        errorMessage = "Vídeo-aula não encontrada."
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: "Erro ao atualizar vídeo-aula",
        description: errorMessage,
        variant: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setTitulo('')
    setDescricao('')
    setArquivo(null)
    setErrors({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!videoAula) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-w-2xl max-h-[90vh] overflow-y-auto",
        isLiquidGlass
          ? 'bg-black/30 dark:bg-gray-900/20'
          : 'bg-background'
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <FileVideo className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Editar Vídeo-aula
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título */}
          <div>
            <Label htmlFor="titulo-edit" className="text-sm font-medium">
              Título da Vídeo-aula *
            </Label>
            <Input
              id="titulo-edit"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value)
                if (errors.titulo) {
                  setErrors(prev => ({ ...prev, titulo: '' }))
                }
              }}
              placeholder="Ex: Introdução às Funções Quadráticas"
              className={errors.titulo ? 'border-destructive mt-2' : 'mt-2'}
            />
            {errors.titulo && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.titulo}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao-edit" className="text-sm font-medium">
              Descrição (opcional)
            </Label>
            <Textarea
              id="descricao-edit"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o conteúdo da vídeo-aula..."
              rows={4}
              className="mt-2"
            />
          </div>

          {/* Substituir Arquivo */}
          <div>
            <Label className="text-sm font-medium block mb-2">
              Substituir Arquivo de Vídeo (opcional)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={handleFileChange}
              className="hidden"
              id="arquivo-edit"
            />
            <LiquidGlassButton
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {arquivo ? 'Alterar Arquivo' : 'Selecionar Novo Arquivo'}
            </LiquidGlassButton>
            {arquivo && (
              <div className="mt-3 p-3 border rounded-lg bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileVideo className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{arquivo.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatarTamanhoArquivo(arquivo.size)}
                    </p>
                  </div>
                </div>
                <LiquidGlassButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setArquivo(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </LiquidGlassButton>
              </div>
            )}
            {errors.arquivo && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.arquivo}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Formatos aceitos: MP4, WebM, OGG, MOV. Tamanho máximo: 500MB
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <LiquidGlassButton
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </LiquidGlassButton>
          <LiquidGlassButton
            onClick={handleSalvar}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </LiquidGlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

