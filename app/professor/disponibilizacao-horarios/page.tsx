"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { 
  Clock, 
  Calendar, 
  User, 
  Save, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  History,
  Sun,
  Sunset,
  Moon,
  Plus,
  Trash2,
  Edit3
} from "lucide-react"
import { toast } from "sonner"

interface HorarioDisponivel {
  inicio: string
  fim: string
}

interface DiaSemana {
  nome: string
  manha?: HorarioDisponivel
  tarde?: HorarioDisponivel
  noite?: HorarioDisponivel
}

interface DisponibilizacaoHorarios {
  id: string
  semestre: string
  status: 'rascunho' | 'enviada' | 'aprovada'
  horarios: DiaSemana[]
  observacoes: string
  dataCriacao: Date
  dataEnvio?: Date
}

export default function DisponibilizacaoHorariosPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [semestreSelecionado, setSemestreSelecionado] = useState("2024.1")
  const [status, setStatus] = useState<'rascunho' | 'enviada' | 'aprovada'>('rascunho')
  const [observacoes, setObservacoes] = useState("")
  const [horarios, setHorarios] = useState<DiaSemana[]>([
    { nome: "Segunda-feira" },
    { nome: "Terça-feira" },
    { nome: "Quarta-feira" },
    { nome: "Quinta-feira" },
    { nome: "Sexta-feira" },
    { nome: "Sábado" }
  ])
  const [historico, setHistorico] = useState<DisponibilizacaoHorarios[]>([])

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

  const semestres = [
    { id: "2024.1", nome: "2024.1", ativo: true },
    { id: "2023.2", nome: "2023.2", ativo: false },
    { id: "2023.1", nome: "2023.1", ativo: false }
  ]

  const turnos = [
    { id: "manha", nome: "Manhã", icone: Sun, cor: "yellow", horario: "07:00 - 12:00" },
    { id: "tarde", nome: "Tarde", icone: Sunset, cor: "orange", horario: "13:00 - 18:00" },
    { id: "noite", nome: "Noite", icone: Moon, cor: "blue", horario: "18:30 - 22:00" }
  ]

  const validarHorario = (horario: string): boolean => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return regex.test(horario)
  }

  const validarConflitoHorarios = (dia: DiaSemana, turno: string, novoHorario: HorarioDisponivel): boolean => {
    const outrosTurnos = Object.entries(dia)
      .filter(([key]) => key !== turno && key !== 'nome')
      .map(([, value]) => value)
      .filter(Boolean) as HorarioDisponivel[]

    for (const horario of outrosTurnos) {
      if (
        (novoHorario.inicio >= horario.inicio && novoHorario.inicio < horario.fim) ||
        (novoHorario.fim > horario.inicio && novoHorario.fim <= horario.fim) ||
        (novoHorario.inicio <= horario.inicio && novoHorario.fim >= horario.fim)
      ) {
        return false
      }
    }
    return true
  }

  const atualizarHorario = (diaIndex: number, turno: string, campo: 'inicio' | 'fim', valor: string) => {
    if (!validarHorario(valor)) {
      toast.error("Formato de horário inválido", {
        description: "Use o formato HH:MM (ex: 08:30, 14:00)"
      })
      return
    }

    setHorarios(prev => {
      const novosHorarios = [...prev]
      const dia = novosHorarios[diaIndex]
      
      if (!dia[turno as keyof DiaSemana]) {
        (dia as any)[turno] = { inicio: '', fim: '' }
      }

      const novoHorario = {
        ...(dia[turno as keyof DiaSemana] as HorarioDisponivel || { inicio: '', fim: '' }),
        [campo]: valor
      }

      if (novoHorario.inicio && novoHorario.fim) {
        if (novoHorario.inicio >= novoHorario.fim) {
          toast.error("Horário inválido", {
            description: "O horário de início deve ser anterior ao horário de fim"
          })
          return prev
        }

        if (!validarConflitoHorarios(dia, turno, novoHorario)) {
          toast.error("Conflito de horários", {
            description: "Este horário conflita com outro turno no mesmo dia"
          })
          return prev
        }

        // Toast de sucesso para horário válido
        toast.success("Horário adicionado", {
          description: `${dia.nome} - ${turno}: ${novoHorario.inicio} às ${novoHorario.fim}`
        })
      }

      (dia as any)[turno] = novoHorario
      return novosHorarios
    })
  }

  const removerHorario = (diaIndex: number, turno: string) => {
    setHorarios(prev => {
      const novosHorarios = [...prev]
      const dia = novosHorarios[diaIndex]
      delete (dia as any)[turno]
      
      toast.info("Horário removido", {
        description: `${dia.nome} - ${turno} removido com sucesso`
      })
      
      return novosHorarios
    })
  }

  const salvarRascunho = () => {
    try {
      // Validação básica antes de salvar
      const temHorarios = horarios.some(dia => 
        Object.values(dia).some(horario => 
          typeof horario === 'object' && horario && horario.inicio && horario.fim
        )
      )

      if (!temHorarios) {
        toast.warning("Adicione pelo menos um horário antes de salvar")
        return
      }

      const disponibilizacao: DisponibilizacaoHorarios = {
        id: Date.now().toString(),
        semestre: semestreSelecionado,
        status: 'rascunho',
        horarios,
        observacoes,
        dataCriacao: new Date()
      }

      setHistorico(prev => [disponibilizacao, ...prev])
      setStatus('rascunho')
      toast.success("Rascunho salvo com sucesso!", {
        description: "Seus horários foram salvos localmente"
      })
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error)
      toast.error("Erro ao salvar rascunho", {
        description: "Tente novamente em alguns instantes"
      })
    }
  }

  const enviarParaCoordenacao = () => {
    try {
      // Validações antes de enviar
      const temHorarios = horarios.some(dia => 
        Object.values(dia).some(horario => 
          typeof horario === 'object' && horario && horario.inicio && horario.fim
        )
      )

      if (!temHorarios) {
        toast.error("Adicione pelo menos um horário antes de enviar", {
          description: "É necessário informar sua disponibilidade"
        })
        return
      }

      // Validação de horários completos
      const horariosIncompletos = horarios.some(dia => 
        Object.values(dia).some(horario => 
          typeof horario === 'object' && horario && 
          (horario.inicio && !horario.fim || !horario.inicio && horario.fim)
        )
      )

      if (horariosIncompletos) {
        toast.error("Complete todos os horários antes de enviar", {
          description: "Todos os horários devem ter início e fim definidos"
        })
        return
      }

      // Simular envio para coordenação
      const disponibilizacao: DisponibilizacaoHorarios = {
        id: Date.now().toString(),
        semestre: semestreSelecionado,
        status: 'enviada',
        horarios,
        observacoes,
        dataCriacao: new Date(),
        dataEnvio: new Date()
      }

      // Simular delay de envio
      toast.loading("Enviando horários para coordenação...", {
        id: "enviando-horarios"
      })

      setTimeout(() => {
        setHistorico(prev => [disponibilizacao, ...prev])
        setStatus('enviada')
        toast.dismiss("enviando-horarios")
        toast.success("Horários enviados com sucesso!", {
          description: "A coordenação foi notificada sobre sua disponibilidade"
        })
      }, 2000)

    } catch (error) {
      console.error('Erro ao enviar horários:', error)
      toast.dismiss("enviando-horarios")
      toast.error("Erro ao enviar horários", {
        description: "Verifique sua conexão e tente novamente"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovada": return "bg-emerald-500"
      case "enviada": return "bg-blue-500"
      case "rascunho": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovada": return CheckCircle
      case "enviada": return Send
      case "rascunho": return Save
      default: return AlertCircle
    }
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className={`flex flex-col lg:flex-row lg:items-center justify-between mb-8 p-6 rounded-2xl border backdrop-blur-sm gap-4 ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
                    Disponibilização de Horários
                  </h1>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800 text-sm px-3 py-1">
                    {semestres.find(s => s.id === semestreSelecionado)?.nome}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg mt-1">
                  Informe sua disponibilidade semestral
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                    <User className="h-3 w-3 mr-1" />
                    Professor
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`${
                      status === 'aprovada' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                      status === 'enviada' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                    }`}
                  >
                    {status === 'aprovada' ? 'Aprovada' : status === 'enviada' ? 'Enviada' : 'Rascunho'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                  <SelectTrigger className={`w-40 backdrop-blur-sm ${
                    isLiquidGlass
                      ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                      : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                  }`}>
                    <SelectValue placeholder="Selecionar semestre" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/50">
                    {semestres.map((semestre) => (
                      <SelectItem key={semestre.id} value={semestre.id}>
                        <div className="flex items-center space-x-2">
                          <span>{semestre.nome}</span>
                          {semestre.ativo && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs">
                              Atual
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Tabs defaultValue="disponibilizar" className="space-y-6">
            <TabsList className={`grid w-full grid-cols-2 backdrop-blur-sm ${
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
            }`}>
              <TabsTrigger value="disponibilizar" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Disponibilizar Horários</span>
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>Histórico</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="disponibilizar" className="space-y-6">
              {/* Formulário de Horários */}
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                    Horários de Disponibilidade
                  </CardTitle>
                  <CardDescription>
                    Informe os horários em que você estará disponível para cada turno e dia da semana
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {horarios.map((dia, diaIndex) => (
                    <div key={dia.nome} className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                        {dia.nome}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {turnos.map((turno) => {
                          const IconeTurno = turno.icone
                          const horarioAtual = dia[turno.id as keyof DiaSemana] as HorarioDisponivel | undefined
                          
                          return (
                            <div key={turno.id} className={`p-4 rounded-xl border ${
                              isLiquidGlass
                                ? 'bg-black/20 dark:bg-gray-800/10 border-gray-200/30 dark:border-gray-700/50'
                                : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
                            }`}>
                              <div className="flex items-center space-x-2 mb-3">
                                <IconeTurno className={`h-5 w-5 ${
                                  turno.cor === 'yellow' ? 'text-yellow-600' :
                                  turno.cor === 'orange' ? 'text-orange-600' :
                                  'text-blue-600'
                                }`} />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {turno.nome}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {turno.horario}
                                </Badge>
                              </div>
                              
                              {horarioAtual ? (
                                <div className="space-y-2">
                                  <div className="flex space-x-2">
                                    <div className="flex-1">
                                      <Label htmlFor={`${dia.nome}-${turno.id}-inicio`} className="text-xs">
                                        Início
                                      </Label>
                                      <Input
                                        id={`${dia.nome}-${turno.id}-inicio`}
                                        type="time"
                                        value={horarioAtual.inicio}
                                        onChange={(e) => atualizarHorario(diaIndex, turno.id, 'inicio', e.target.value)}
                                        className="text-sm"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <Label htmlFor={`${dia.nome}-${turno.id}-fim`} className="text-xs">
                                        Fim
                                      </Label>
                                      <Input
                                        id={`${dia.nome}-${turno.id}-fim`}
                                        type="time"
                                        value={horarioAtual.fim}
                                        onChange={(e) => atualizarHorario(diaIndex, turno.id, 'fim', e.target.value)}
                                        className="text-sm"
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removerHorario(diaIndex, turno.id)}
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Remover
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                    onClick={() => {
                                      setHorarios(prev => {
                                        const novosHorarios = [...prev]
                                        ;(novosHorarios[diaIndex] as any)[turno.id] = { inicio: '', fim: '' }
                                        return novosHorarios
                                      })
                                    }}
                                  className="w-full"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Adicionar Horário
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Observações */}
                  <div className="space-y-2">
                    <Label htmlFor="observacoes" className="text-sm font-medium">
                      Observações Adicionais
                    </Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Informe qualquer observação relevante sobre sua disponibilidade..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <LiquidGlassButton
                      variant="outline"
                      onClick={salvarRascunho}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Rascunho
                    </LiquidGlassButton>
                    <LiquidGlassButton
                      onClick={enviarParaCoordenacao}
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar para Coordenação
                    </LiquidGlassButton>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>

            <TabsContent value="historico" className="space-y-6">
              <LiquidGlassCard
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">
                    Histórico de Disponibilizações
                  </CardTitle>
                  <CardDescription>
                    Visualize suas disponibilizações anteriores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {historico.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma disponibilização encontrada</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {historico.map((item) => {
                        const StatusIcon = getStatusIcon(item.status)
                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-xl border ${
                              isLiquidGlass
                                ? 'bg-black/20 dark:bg-gray-800/10 border-gray-200/30 dark:border-gray-700/50'
                                : 'bg-gray-50/40 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <StatusIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                    Semestre {item.semestre}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Criado em {item.dataCriacao.toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${
                                  item.status === 'aprovada' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                                  item.status === 'enviada' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                }`}
                              >
                                {item.status === 'aprovada' ? 'Aprovada' : item.status === 'enviada' ? 'Enviada' : 'Rascunho'}
                              </Badge>
                            </div>
                            
                            {item.observacoes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {item.observacoes}
                              </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {item.horarios.map((dia) => {
                                const horariosDia = Object.entries(dia)
                                  .filter(([key]) => key !== 'nome')
                                  .map(([turno, horario]) => ({ turno, horario }))
                                  .filter(({ horario }) => horario)

                                return (
                                  <div key={dia.nome} className="text-sm">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {dia.nome}:
                                    </span>
                                    {horariosDia.length > 0 ? (
                                      <div className="mt-1 space-y-1">
                                        {horariosDia.map(({ turno, horario }) => (
                                          <div key={turno} className="text-gray-600 dark:text-gray-400">
                                            {turno}: {horario.inicio} - {horario.fim}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 dark:text-gray-500 ml-1">
                                        Sem horários
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
