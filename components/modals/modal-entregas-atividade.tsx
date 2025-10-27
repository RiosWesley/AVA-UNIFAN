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

interface AlunoEntrega {
  id: number
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
  nota?: number
  observacoes?: string
}

interface Atividade {
  id: number
  titulo: string
  tipo: string
  prazo: string
  peso: number
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
    if (nota > atividade.peso) {
      toast({
        title: "Nota inválida",
        description: `A nota não pode ser maior que o peso da atividade (${atividade.peso})`,
        variant: "error"
      })
      return
    }
    setNotas(prev => ({ ...prev, [alunoId]: nota }))
  }

  const handleDownload = (arquivo: AlunoEntrega['arquivo']) => {
    if (!arquivo) return
    
    // Simular download
    const link = document.createElement('a')
    link.href = arquivo.url
    link.download = arquivo.nome
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download iniciado",
      description: `Baixando ${arquivo.nome}...`
    })
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
    
    toast({
      title: "Notas salvas",
      description: `${notasValidas.length} nota(s) salva(s) com sucesso!`
    })
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
    const hoje = new Date()
    const prazo = new Date(atividade.prazo.split('/').reverse().join('-'))
    const diasRestantes = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diasRestantes < 0) {
      return { texto: "Prazo expirado", cor: "text-red-600", icone: XCircle }
    } else if (diasRestantes === 0) {
      return { texto: "Vence hoje", cor: "text-orange-600", icone: AlertCircle }
    } else if (diasRestantes <= 3) {
      return { texto: `${diasRestantes} dias restantes`, cor: "text-orange-600", icone: Clock }
    } else {
      return { texto: `${diasRestantes} dias restantes`, cor: "text-green-600", icone: Clock }
    }
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
                {atividade.tipo} • Peso: {atividade.peso} • Prazo: {atividade.prazo}
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
                        
                        {aluno.entregou && aluno.arquivo && (
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {aluno.arquivo.nome} ({aluno.arquivo.tamanho})
                            </span>
                            <LiquidGlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(aluno.arquivo)}
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
