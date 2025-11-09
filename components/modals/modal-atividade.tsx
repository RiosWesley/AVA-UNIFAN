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

export interface Atividade {
  id?: number
  titulo: string
  tipo: string
  unidade?: string
  prazo: string
  peso: number
  descricao: string
  status?: string
  arquivos?: {
    nome: string
    tamanho: string
    tipo: string
    url?: string
    file?: File
  }[]
}

interface ModalAtividadeProps {
  isOpen: boolean
  onClose: () => void
  atividade?: Atividade | null
  onSalvar: (atividade: Atividade) => void
  modo: 'criar' | 'editar'
}

const TIPOS_ATIVIDADE = [
  'Exercício',
  'Avaliação',
  'Projeto',
  'Trabalho em Grupo',
  'Pesquisa',
  'Apresentação',
  'Outro'
]

const UNIDADES = [
  '1ª Unidade',
  '2ª Unidade',
  'Prova Final'
]

export function ModalAtividade({
  isOpen,
  onClose,
  atividade = null,
  onSalvar,
  modo
}: ModalAtividadeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState('')
  const [unidade, setUnidade] = useState('')
  const [prazo, setPrazo] = useState('')
  const [peso, setPeso] = useState('')
  const [descricao, setDescricao] = useState('')
  const [arquivosAnexados, setArquivosAnexados] = useState<File[]>([])
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
    if (modo === 'editar' && atividade) {
      setTitulo(atividade.titulo || '')
      setTipo(atividade.tipo || '')
      setUnidade(atividade.unidade || '')
      setPrazo(atividade.prazo || '')
      setPeso(atividade.peso?.toString() || '')
      setDescricao(atividade.descricao || '')
      setArquivosAnexados([]) // Não carregamos arquivos existentes para edição (por enquanto)
    } else {
      // Limpar campos para criação
      setTitulo('')
      setTipo('')
      setUnidade('')
      setPrazo('')
      setPeso('')
      setDescricao('')
      setArquivosAnexados([])
    }
    setErrors({})
  }, [atividade, modo, isOpen])

  const validarCampos = () => {
    const novosErros: Record<string, string> = {}

    if (!titulo.trim()) {
      novosErros.titulo = 'Título é obrigatório'
    }

    if (!tipo) {
      novosErros.tipo = 'Tipo é obrigatório'
    }

    if (!unidade) {
      novosErros.unidade = 'Unidade é obrigatória'
    }

    if (!prazo) {
      novosErros.prazo = 'Prazo é obrigatório'
    } else {
      const dataPrazo = new Date(prazo)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      if (dataPrazo < hoje) {
        novosErros.prazo = 'Prazo não pode ser uma data passada'
      }
    }

    if (!peso || parseFloat(peso) <= 0) {
      novosErros.peso = 'Peso deve ser maior que zero'
    } else if (parseFloat(peso) > 10) {
      novosErros.peso = 'Peso não pode ser maior que 10'
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
    const arquivoJaAnexado = arquivosAnexados.some(arquivo => arquivo.name === file.name && arquivo.size === file.size)
    if (arquivoJaAnexado) {
      toast({
        title: "Arquivo já anexado",
        description: "Este arquivo já foi adicionado à atividade",
        variant: "error"
      })
      return
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
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

    // Limite de 5 arquivos por atividade
    if (arquivosAnexados.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "Máximo de 5 arquivos por atividade",
        variant: "error"
      })
      return
    }

    setArquivosAnexados(prev => [...prev, file])

    // Limpar o input para permitir re-upload do mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    toast({
      title: "Arquivo anexado",
      description: `${file.name} foi adicionado com sucesso!`
    })
  }

  const removerArquivo = (index: number) => {
    setArquivosAnexados(prev => prev.filter((_, i) => i !== index))
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

    const atividadeData: Atividade = {
      ...(atividade?.id && { id: atividade.id }),
      titulo: titulo.trim(),
      tipo,
      unidade,
      prazo,
      peso: parseFloat(peso),
      descricao: descricao.trim(),
      status: atividade?.status || 'Ativa',
      ...(arquivosAnexados.length > 0 && {
        arquivos: arquivosAnexados.map(file => ({
          nome: file.name,
          tamanho: formatarTamanhoArquivo(file.size),
          tipo: file.type,
          file: file
        }))
      })
    }

    onSalvar(atividadeData)

    toast({
      title: modo === 'criar' ? "Atividade criada" : "Atividade atualizada",
      description: `"${titulo}" foi ${modo === 'criar' ? 'criada' : 'atualizada'} com sucesso!`
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
                {modo === 'criar' ? 'Nova Atividade' : 'Editar Atividade'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {modo === 'criar' ? 'Crie uma nova atividade para a turma' : 'Edite os dados da atividade'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 pr-1">
          {/* Título */}
          <div>
            <Label htmlFor="titulo" className="text-sm font-medium">
              Título da Atividade *
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Lista de Exercícios - Funções"
              className={errors.titulo ? 'border-destructive' : ''}
            />
            {errors.titulo && (
              <p className="text-sm text-destructive mt-1">{errors.titulo}</p>
            )}
          </div>

          {/* Tipo e Unidade */}
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
                  {TIPOS_ATIVIDADE.map((tipoAtividade) => (
                    <SelectItem key={tipoAtividade} value={tipoAtividade}>
                      {tipoAtividade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-sm text-destructive mt-1">{errors.tipo}</p>
              )}
            </div>

            <div>
              <Label htmlFor="unidade" className="text-sm font-medium">
                Unidade *
              </Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger className={errors.unidade ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES.map((unidadeItem) => (
                    <SelectItem key={unidadeItem} value={unidadeItem}>
                      {unidadeItem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unidade && (
                <p className="text-sm text-destructive mt-1">{errors.unidade}</p>
              )}
            </div>
          </div>

          {/* Peso */}
          <div>
            <Label htmlFor="peso" className="text-sm font-medium">
              Peso *
            </Label>
            <Input
              id="peso"
              type="number"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="Ex: 3.0"
              min="0.1"
              max="10"
              step="0.1"
              className={errors.peso ? 'border-destructive' : ''}
            />
            {errors.peso && (
              <p className="text-sm text-destructive mt-1">{errors.peso}</p>
            )}
          </div>

          {/* Prazo */}
          <div>
            <Label htmlFor="prazo" className="text-sm font-medium">
              Prazo de Entrega *
            </Label>
            <div className="relative">
              <Input
                id="prazo"
                type="date"
                value={modo === 'editar' && atividade ? formatarDataParaInput(atividade.prazo) : prazo}
                onChange={(e) => setPrazo(e.target.value)}
                className={`pl-10 ${errors.prazo ? 'border-destructive' : ''}`}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.prazo && (
              <p className="text-sm text-destructive mt-1">{errors.prazo}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição detalhada da atividade..."
              rows={4}
            />
          </div>

          {/* Arquivos Anexos */}
          <div>
            <Label className="text-sm font-medium">
              Materiais de Apoio (opcional)
            </Label>
            <div className="mt-2 space-y-3">
              {/* Lista de arquivos anexados */}
              {arquivosAnexados.map((arquivo, index) => (
                <div key={`${arquivo.name}-${arquivo.size}-${index}`} className="border rounded-lg p-4 bg-accent/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const IconComponent = getIconeArquivo(arquivo.type)
                        return <IconComponent className="h-8 w-8 text-primary" />
                      })()}
                      <div>
                        <p className="font-medium text-sm">{arquivo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatarTamanhoArquivo(arquivo.size)} • {arquivo.type}
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
                        onClick={() => removerArquivo(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botão para anexar mais arquivos */}
              {arquivosAnexados.length < 5 && (
                <LiquidGlassButton
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-20 border-dashed border-2 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {arquivosAnexados.length === 0 ? 'Clique para anexar arquivo' : 'Anexar outro arquivo'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, imagens, vídeos, documentos (máx. 10MB) • {arquivosAnexados.length}/5 arquivos
                      </p>
                    </div>
                  </div>
                </LiquidGlassButton>
              )}

              {/* Mensagem quando atingir o limite */}
              {arquivosAnexados.length >= 5 && (
                <div className="text-center p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    Limite máximo de 5 arquivos atingido
                  </p>
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
            {modo === 'criar' ? 'Criar Atividade' : 'Salvar Alterações'}
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
