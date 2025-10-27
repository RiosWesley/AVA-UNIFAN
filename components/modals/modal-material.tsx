"use client"

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Save, X, Calendar, Upload, FileText, Trash2, FileImage, FileVideo, File } from "lucide-react"
import { toast } from "@/components/ui/toast"

export interface Material {
  id?: number
  nome: string
  tipo: string
  data: string
  descricao?: string
  arquivo?: {
    nome: string
    tamanho: string
    tipo: string
    url?: string
    file?: File
  }
}

interface ModalMaterialProps {
  isOpen: boolean
  onClose: () => void
  material?: Material | null
  onSalvar: (material: Material) => void
  modo: 'criar' | 'editar'
}

const TIPOS_MATERIAL = [
  'PDF',
  'DOC',
  'DOCX',
  'XLS',
  'XLSX',
  'PPT',
  'PPTX',
  'TXT',
  'JPG',
  'PNG',
  'GIF',
  'MP4',
  'AVI',
  'MOV',
  'Outro'
]

export function ModalMaterial({
  isOpen,
  onClose,
  material = null,
  onSalvar,
  modo
}: ModalMaterialProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [data, setData] = useState('')
  const [descricao, setDescricao] = useState('')
  const [arquivoAnexado, setArquivoAnexado] = useState<File | null>(null)
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  // Preencher campos quando estiver editando
  useEffect(() => {
    if (modo === 'editar' && material) {
      setNome(material.nome || '')
      setTipo(material.tipo || '')
      setData(material.data || '')
      setDescricao(material.descricao || '')
      setArquivoAnexado(null) // Não carregamos arquivo existente para edição (por enquanto)
    } else {
      // Limpar campos para criação
      setNome('')
      setTipo('')
      setData('')
      setDescricao('')
      setArquivoAnexado(null)
    }
    setErrors({})
  }, [material, modo, isOpen])

  const validarCampos = () => {
    const novosErros: Record<string, string> = {}

    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório'
    }

    if (!tipo) {
      novosErros.tipo = 'Tipo é obrigatório'
    }

    if (!data) {
      novosErros.data = 'Data é obrigatória'
    } else {
      const dataSelecionada = new Date(data)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      if (dataSelecionada > hoje) {
        novosErros.data = 'Data não pode ser futura'
      }
    }

    setErrors(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getIconeArquivo = (tipo: string) => {
    if (tipo.startsWith('image/')) return FileImage
    if (tipo.startsWith('video/')) return FileVideo
    if (tipo === 'application/pdf' || tipo.includes('document')) return FileText
    return File
  }

  const handleArquivoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Verificar se o arquivo já foi anexado
    if (arquivoAnexado && arquivoAnexado.name === file.name && arquivoAnexado.size === file.size) {
      toast({
        title: "Arquivo já anexado",
        description: "Este arquivo já foi adicionado ao material",
        variant: "error"
      })
      return
    }

    // Validar tamanho do arquivo (máximo 50MB para materiais)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 50MB",
        variant: "error"
      })
      return
    }

    // Validar tipos de arquivo permitidos
    const tiposPermitidos = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ]

    if (!tiposPermitidos.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não permitido",
        description: "São aceitos apenas: PDF, imagens, vídeos, documentos Word/Excel/PowerPoint e texto",
        variant: "error"
      })
      return
    }

    setArquivoAnexado(file)

    // Limpar o input para permitir re-upload do mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    toast({
      title: "Arquivo anexado",
      description: `${file.name} foi adicionado com sucesso!`
    })
  }

  const removerArquivo = () => {
    setArquivoAnexado(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSalvar = () => {
    if (!validarCampos()) {
      toast({
        title: "Dados inválidos",
        description: "Verifique os campos destacados e tente novamente",
        variant: "error"
      })
      return
    }

    const materialData: Material = {
      ...(material?.id && { id: material.id }),
      nome: nome.trim(),
      tipo,
      data,
      descricao: descricao.trim(),
      ...(arquivoAnexado && {
        arquivo: {
          nome: arquivoAnexado.name,
          tamanho: formatarTamanhoArquivo(arquivoAnexado.size),
          tipo: arquivoAnexado.type,
          file: arquivoAnexado
        }
      })
    }

    onSalvar(materialData)

    toast({
      title: modo === 'criar' ? "Material criado" : "Material atualizado",
      description: `"${nome}" foi ${modo === 'criar' ? 'criado' : 'atualizado'} com sucesso!`
    })

    onClose()
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  const formatarDataParaInput = (dataString: string) => {
    if (!dataString) return ''
    // Converte de DD/MM/YYYY para YYYY-MM-DD
    const partes = dataString.split('/')
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`
    }
    return dataString
  }

  const formatarDataParaExibicao = (dataString: string) => {
    if (!dataString) return ''
    try {
      const data = new Date(dataString)
      return data.toLocaleDateString('pt-BR')
    } catch {
      return dataString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {modo === 'criar' ? 'Novo Material' : 'Editar Material'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {modo === 'criar' ? 'Adicione um novo material à turma' : 'Edite os dados do material'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 pr-1">
            {/* Nome */}
            <div>
              <Label htmlFor="nome" className="text-sm font-medium">
                Nome do Material *
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Apostila - Funções Quadráticas"
                className={errors.nome ? 'border-destructive' : ''}
              />
              {errors.nome && (
                <p className="text-sm text-destructive mt-1">{errors.nome}</p>
              )}
            </div>

            {/* Tipo e Data */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo" className="text-sm font-medium">
                  Tipo *
                </Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className={errors.tipo ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_MATERIAL.map((tipoMaterial) => (
                      <SelectItem key={tipoMaterial} value={tipoMaterial}>
                        {tipoMaterial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-sm text-destructive mt-1">{errors.tipo}</p>
                )}
              </div>

              <div>
                <Label htmlFor="data" className="text-sm font-medium">
                  Data *
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={modo === 'editar' && material ? formatarDataParaInput(material.data) : data}
                  onChange={(e) => setData(e.target.value)}
                  className={errors.data ? 'border-destructive' : ''}
                />
                {errors.data && (
                  <p className="text-sm text-destructive mt-1">{errors.data}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="descricao" className="text-sm font-medium">
                Descrição (opcional)
              </Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição do material..."
                rows={3}
              />
            </div>

            {/* Arquivo */}
            <div>
              <Label className="text-sm font-medium">
                Arquivo do Material (opcional)
              </Label>
              <div className="mt-2">
                {!arquivoAnexado ? (
                  <LiquidGlassButton
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 border-dashed border-2 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Clique para anexar arquivo</p>
                        <p className="text-xs text-muted-foreground">
                          Máx. 50MB
                        </p>
                      </div>
                    </div>
                  </LiquidGlassButton>
                ) : (
                  <div className="border rounded-lg p-4 bg-accent/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const IconComponent = getIconeArquivo(arquivoAnexado.type)
                          return <IconComponent className="h-8 w-8 text-primary" />
                        })()}
                        <div>
                          <p className="font-medium text-sm">{arquivoAnexado.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatarTamanhoArquivo(arquivoAnexado.size)} • {arquivoAnexado.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Anexado
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removerArquivo}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ações - Fixas no final */}
        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <LiquidGlassButton onClick={handleSalvar}>
            <Save className="h-4 w-4 mr-2" />
            {modo === 'criar' ? 'Criar Material' : 'Salvar Alterações'}
          </LiquidGlassButton>
        </div>
      </DialogContent>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp4,.avi,.mov"
        onChange={handleArquivoChange}
        className="hidden"
      />
    </Dialog>
  )
}
