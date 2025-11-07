"use client"

import { useState, useEffect, useRef } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { ArrowLeft, Video, Upload, Save, X, Clock, FileVideo, Link as LinkIcon, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/toast"
import { useMutation } from "@tanstack/react-query"

type VideoAulaFormData = {
  titulo: string
  url: string
  duracao: string
  disciplina: string
  descricao: string
  arquivo?: File | null
}

export default function AdministradorVideoAulasPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tipoEntrada, setTipoEntrada] = useState<'url' | 'arquivo'>('url')
  const [formData, setFormData] = useState<VideoAulaFormData>({
    titulo: '',
    url: '',
    duracao: '',
    disciplina: '',
    descricao: '',
    arquivo: null
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const disciplinas = [
    { id: '1', nome: 'Matemática' },
    { id: '2', nome: 'Português' },
    { id: '3', nome: 'História' },
    { id: '4', nome: 'Geografia' },
    { id: '5', nome: 'Física' },
    { id: '6', nome: 'Química' },
    { id: '7', nome: 'Biologia' },
  ]

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

  const validarCampos = () => {
    const novosErros: Record<string, string> = {}

    if (!formData.titulo.trim()) {
      novosErros.titulo = 'Título é obrigatório'
    }

    if (tipoEntrada === 'url') {
      if (!formData.url.trim()) {
        novosErros.url = 'URL é obrigatória'
      } else if (!isValidUrl(formData.url)) {
        novosErros.url = 'URL inválida'
      }
    } else {
      if (!formData.arquivo) {
        novosErros.arquivo = 'Arquivo é obrigatório'
      } else {
        const maxSize = 500 * 1024 * 1024 // 500MB
        if (formData.arquivo.size > maxSize) {
          novosErros.arquivo = 'Arquivo muito grande (máximo 500MB)'
        }
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
        if (!allowedTypes.includes(formData.arquivo.type)) {
          novosErros.arquivo = 'Formato de vídeo não suportado (use MP4, WebM, OGG ou MOV)'
        }
      }
    }

    if (!formData.disciplina) {
      novosErros.disciplina = 'Disciplina é obrigatória'
    }

    if (formData.duracao && !isValidDuration(formData.duracao)) {
      novosErros.duracao = 'Formato inválido (use MM:SS ou HH:MM:SS)'
    }

    setErrors(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isValidDuration = (duration: string): boolean => {
    const pattern = /^(\d{1,2}:)?[0-5]?\d:[0-5]\d$/
    return pattern.test(duration)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setFormData(prev => ({ ...prev, arquivo: file }))
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

  const salvarVideoAulaMutation = useMutation({
    mutationFn: async (data: VideoAulaFormData) => {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      return data
    },
    onSuccess: () => {
      toast({
        title: "Vídeo-aula criada com sucesso! 🎉",
        description: `"${formData.titulo}" foi adicionada ao sistema.`,
      })
      // Reset form
      setFormData({
        titulo: '',
        url: '',
        duracao: '',
        disciplina: '',
        descricao: '',
        arquivo: null
      })
      setTipoEntrada('url')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    onError: () => {
      toast({
        title: "Erro ao criar vídeo-aula",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = () => {
    if (!validarCampos()) {
      toast({
        title: "Dados inválidos",
        description: "Verifique os campos destacados e tente novamente.",
        variant: "destructive",
      })
      return
    }

    salvarVideoAulaMutation.mutate(formData)
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-black/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <Link href="/administrador">
              <LiquidGlassButton variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </LiquidGlassButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                Inserir Vídeo-aula
              </h1>
              <p className="text-muted-foreground">
                Adicione uma nova vídeo-aula ao sistema
              </p>
            </div>
          </div>

          <LiquidGlassCard
            intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
            className={`group transition-all duration-300 hover:shadow-xl border border-border/50 hover:border-border/80 ${
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20'
                : 'bg-gray-50/60 dark:bg-gray-800/40'
            }`}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                <Video className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                Informações da Vídeo-aula
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Preencha os dados da vídeo-aula que deseja adicionar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Título */}
                <div>
                  <Label htmlFor="titulo" className="text-sm font-medium">
                    Título da Vídeo-aula *
                  </Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, titulo: e.target.value }))
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

                {/* Tipo de Entrada */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Tipo de Entrada *
                  </Label>
                  <div className="flex gap-4">
                    <LiquidGlassButton
                      type="button"
                      variant={tipoEntrada === 'url' ? 'default' : 'outline'}
                      onClick={() => {
                        setTipoEntrada('url')
                        setFormData(prev => ({ ...prev, arquivo: null }))
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className="flex-1"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      URL do Vídeo
                    </LiquidGlassButton>
                    <LiquidGlassButton
                      type="button"
                      variant={tipoEntrada === 'arquivo' ? 'default' : 'outline'}
                      onClick={() => {
                        setTipoEntrada('arquivo')
                        setFormData(prev => ({ ...prev, url: '' }))
                      }}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload de Arquivo
                    </LiquidGlassButton>
                  </div>
                </div>

                {/* URL ou Arquivo */}
                {tipoEntrada === 'url' ? (
                  <div>
                    <Label htmlFor="url" className="text-sm font-medium">
                      URL do Vídeo *
                    </Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, url: e.target.value }))
                        if (errors.url) {
                          setErrors(prev => ({ ...prev, url: '' }))
                        }
                      }}
                      placeholder="https://exemplo.com/video.mp4 ou link do YouTube/Vimeo"
                      className={errors.url ? 'border-destructive mt-2' : 'mt-2'}
                    />
                    {errors.url && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.url}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="arquivo" className="text-sm font-medium">
                      Arquivo de Vídeo *
                    </Label>
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        onChange={handleFileChange}
                        className="hidden"
                        id="arquivo"
                      />
                      <LiquidGlassButton
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {formData.arquivo ? 'Alterar Arquivo' : 'Selecionar Arquivo'}
                      </LiquidGlassButton>
                      {formData.arquivo && (
                        <div className="mt-3 p-3 border rounded-lg bg-muted/50 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileVideo className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{formData.arquivo.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatarTamanhoArquivo(formData.arquivo.size)}
                              </p>
                            </div>
                          </div>
                          <LiquidGlassButton
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, arquivo: null }))
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
                )}

                {/* Disciplina e Duração */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disciplina" className="text-sm font-medium">
                      Disciplina *
                    </Label>
                    <Select
                      value={formData.disciplina}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, disciplina: value }))
                        if (errors.disciplina) {
                          setErrors(prev => ({ ...prev, disciplina: '' }))
                        }
                      }}
                    >
                      <SelectTrigger className={errors.disciplina ? 'border-destructive mt-2' : 'mt-2'}>
                        <SelectValue placeholder="Selecione a disciplina" />
                      </SelectTrigger>
                      <SelectContent>
                        {disciplinas.map((disciplina) => (
                          <SelectItem key={disciplina.id} value={disciplina.id}>
                            {disciplina.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.disciplina && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.disciplina}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="duracao" className="text-sm font-medium">
                      Duração (opcional)
                    </Label>
                    <div className="relative mt-2">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="duracao"
                        value={formData.duracao}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, duracao: e.target.value }))
                          if (errors.duracao) {
                            setErrors(prev => ({ ...prev, duracao: '' }))
                          }
                        }}
                        placeholder="MM:SS ou HH:MM:SS"
                        className={errors.duracao ? 'border-destructive pl-10' : 'pl-10'}
                      />
                    </div>
                    {errors.duracao && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.duracao}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Exemplo: 15:30 ou 1:15:30
                    </p>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <Label htmlFor="descricao" className="text-sm font-medium">
                    Descrição (opcional)
                  </Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o conteúdo da vídeo-aula..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                {/* Botões de Ação */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link href="/administrador">
                    <LiquidGlassButton variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </LiquidGlassButton>
                  </Link>
                  <LiquidGlassButton
                    onClick={handleSubmit}
                    disabled={salvarVideoAulaMutation.isPending}
                  >
                    {salvarVideoAulaMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Vídeo-aula
                      </>
                    )}
                  </LiquidGlassButton>
                </div>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </div>
      </main>
    </div>
  )
}

