"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Download, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Filter,
  Save,
  AlertCircle
} from "lucide-react"
import { toast } from "@/components/ui/toast"
import { downloadSubmissionFile } from "@/src/services/activitiesService"

interface AlunoEntrega {
  id: number
  enrollmentId?: string
  submissionId?: string
  nome: string
  matricula: string
  entregou: boolean
  dataEntrega?: string
  arquivo?: {
    nome: string
    tamanho: string
    tipo: string
    url: string
  }
  arquivos?: { nome: string; url: string; tamanho?: string; tipo?: string }[]
  nota?: number
  observacoes?: string
}

interface Atividade {
  id: number | string
  titulo: string
  tipo: string
  prazo?: string | null
  peso?: number | null
  descricao?: string
}

interface ModalEntregasAtividadeProps {
  isOpen: boolean
  onClose: () => void
  atividade: Atividade
  alunos: AlunoEntrega[]
  onSalvarNotas: (notas: Record<number, number>) => void
}

export function ModalEntregasAtividade({ 
  isOpen, 
  onClose, 
  atividade, 
  alunos, 
  onSalvarNotas 
}: ModalEntregasAtividadeProps) {
  const [alunosFiltrados, setAlunosFiltrados] = useState<AlunoEntrega[]>(alunos)
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "entregou" | "nao-entregou">("todos")
  const [notas, setNotas] = useState<Record<number, number>>({})
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)

  const extractDisplayName = (rawName?: string) => {
    if (!rawName) return ""
    try {
      const decoded = decodeURIComponent(rawName.split('?')[0] || rawName)
      const base = decoded.split('/').pop() || decoded
      const parts = base.split('-')
      if (parts.length >= 3 && /^\d+$/.test(parts[0]) && /^[A-Za-z0-9]+$/.test(parts[1])) {
        return parts.slice(2).join('-')
      }
      return base
    } catch {
      return rawName
    }
  }

  const truncateMiddle = (text: string, max = 60) => {
    if (!text) return ""
    if (text.length <= max) return text
    const head = Math.max(10, Math.floor(max * 0.55))
    const tail = Math.max(8, max - head - 3)
    return `${text.slice(0, head)}...${text.slice(-tail)}`
  }

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

  // Filtrar alunos
  useEffect(() => {
    let filtrados = alunos

    // Filtro por busca
    if (busca) {
      filtrados = filtrados.filter(aluno =>
        aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
        aluno.matricula.includes(busca)
      )
    }

    // Filtro por status
    if (filtroStatus !== "todos") {
      filtrados = filtrados.filter(aluno =>
        filtroStatus === "entregou" ? aluno.entregou : !aluno.entregou
      )
    }

    setAlunosFiltrados(filtrados)
  }, [alunos, busca, filtroStatus])

  // Inicializar notas
  useEffect(() => {
    const notasIniciais: Record<number, number> = {}
    alunos.forEach(aluno => {
      if (aluno.nota !== undefined) {
        notasIniciais[aluno.id] = aluno.nota
      }
    })
    setNotas(notasIniciais)
  }, [alunos])

  const handleNotaChange = (alunoId: number, valor: string) => {
    const nota = parseFloat(valor) || 0
    const maxPeso = Number(atividade.peso ?? 10)
    if (nota > maxPeso) {
      toast({
        title: "Nota inválida",
        description: `A nota não pode ser maior que o peso da atividade (${maxPeso})`,
        variant: "error"
      })
      return
    }
    setNotas(prev => ({ ...prev, [alunoId]: nota }))
  }

  const handleDownload = async (aluno: AlunoEntrega, arquivo: { nome: string; url: string }) => {
    if (!arquivo || !arquivo.url) return
    try {
      let finalFileName = arquivo.nome
      
      if (aluno.submissionId) {
        const { blob, fileName } = await downloadSubmissionFile(aluno.submissionId, arquivo.url)
        finalFileName = fileName || extractDisplayName(arquivo.nome) || arquivo.nome
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = finalFileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // Fallback: link direto
        finalFileName = extractDisplayName(arquivo.nome) || arquivo.nome
        const link = document.createElement('a')
        link.href = arquivo.url
        link.download = finalFileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      toast({ title: "Download iniciado", description: `Baixando ${finalFileName}...` })
    } catch {
      toast({ title: "Erro no download", description: "Não foi possível baixar o arquivo." })
    }
  }

  const handleSalvarNotas = () => {
    const notasValidas = Object.entries(notas).filter(([_, nota]) => nota > 0)
    
    if (notasValidas.length === 0) {
      toast({
        title: "Nenhuma nota para salvar",
        description: "Adicione pelo menos uma nota antes de salvar",
        variant: "error"
      })
      return
    }

    const notasFormatadas: Record<number, number> = {}
    notasValidas.forEach(([alunoId, nota]) => {
      notasFormatadas[parseInt(alunoId)] = nota
    })

    onSalvarNotas(notasFormatadas)
  }

  const getStatusBadge = (aluno: AlunoEntrega) => {
    if (aluno.entregou) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Entregue
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="bg-red-100 text-white hover:bg-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        Não entregue
      </Badge>
    )
  }

  const getPrazoStatus = () => {
    if (!atividade.prazo) {
      return { texto: "Sem prazo", cor: "text-muted-foreground", icone: Clock }
    }
    // Aceita formatos DD/MM/YYYY ou ISO YYYY-MM-DD/ISO completo
    const parsePrazo = (p: string) => {
      if (!p) return null
      if (p.includes('/')) {
        const [dd, mm, yyyy] = p.split('/')
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
      }
      return new Date(p)
    }
    const hoje = new Date()
    const prazoDate = parsePrazo(atividade.prazo)
    if (!prazoDate || isNaN(prazoDate.getTime())) {
      return { texto: "Sem prazo", cor: "text-muted-foreground", icone: Clock }
    }
    const diasRestantes = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

    if (diasRestantes < 0) return { texto: "Prazo expirado", cor: "text-red-600", icone: XCircle }
    if (diasRestantes === 0) return { texto: "Vence hoje", cor: "text-orange-600", icone: AlertCircle }
    if (diasRestantes <= 3) return { texto: `${diasRestantes} dias restantes`, cor: "text-orange-600", icone: Clock }
    return { texto: `${diasRestantes} dias restantes`, cor: "text-green-600", icone: Clock }
  }

  const prazoStatus = getPrazoStatus()
  const PrazoIcon = prazoStatus.icone

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{atividade.titulo}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {atividade.tipo} • Peso: {atividade.peso ?? 10} • Prazo: {atividade.prazo ?? '—'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PrazoIcon className={`h-4 w-4 ${prazoStatus.cor}`} />
              <span className={`text-sm ${prazoStatus.cor}`}>
                {prazoStatus.texto}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros e Busca */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filtroStatus === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroStatus("todos")}
              >
                Todos ({alunos.length})
              </Button>
              <Button
                variant={filtroStatus === "entregou" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroStatus("entregou")}
              >
                Entregou ({alunos.filter(a => a.entregou).length})
              </Button>
              <Button
                variant={filtroStatus === "nao-entregou" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroStatus("nao-entregou")}
              >
                Não entregou ({alunos.filter(a => !a.entregou).length})
              </Button>
            </div>
          </div>

          {/* Lista de Alunos */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {alunosFiltrados.map((aluno) => (
                <Card key={aluno.id} className={`transition-all duration-200 ${
                  isLiquidGlass ? 'liquid-glass-card' : 'hover:shadow-md'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{aluno.nome}</h4>
                          <span className="text-sm text-muted-foreground">
                            Matrícula: {aluno.matricula}
                          </span>
                          {getStatusBadge(aluno)}
                        </div>
                        
                        {aluno.entregou && Array.isArray(aluno.arquivos) && aluno.arquivos.length > 0 && (
                          <div className="flex flex-col gap-2 mb-2">
                            {aluno.arquivos.map((arq, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {truncateMiddle(extractDisplayName(arq.nome))}
                                </span>
                                <LiquidGlassButton
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(aluno, { nome: arq.nome, url: arq.url })}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Baixar
                                </LiquidGlassButton>
                              </div>
                            ))}
                          </div>
                        )}

                        {aluno.entregou && !aluno.arquivos?.length && aluno.arquivo && (
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {truncateMiddle(extractDisplayName(aluno.arquivo.nome))} {aluno.arquivo.tamanho ? `(${aluno.arquivo.tamanho})` : ""}
                            </span>
                            <LiquidGlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(aluno, { nome: aluno.arquivo!.nome, url: aluno.arquivo!.url })}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Baixar
                            </LiquidGlassButton>
                          </div>
                        )}

                        {aluno.entregou && aluno.dataEntrega && (
                          <p className="text-xs text-muted-foreground">
                            Entregue em: {aluno.dataEntrega}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="0.0"
                            value={notas[aluno.id] || ''}
                            onChange={(e) => handleNotaChange(aluno.id, e.target.value)}
                            min="0"
                            max={atividade.peso}
                            step="0.1"
                            className="w-20"
                            disabled={!aluno.entregou}
                          />
                          <span className="text-sm text-muted-foreground">
                            / {atividade.peso}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Ações */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {alunosFiltrados.length} aluno(s) encontrado(s)
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <LiquidGlassButton onClick={handleSalvarNotas}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Notas
              </LiquidGlassButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
