"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { MessageSquare, Megaphone, Eye, Edit, Trash2, TrendingUp, Send, Plus, Bell } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { ModalNovaMensagem, ModalAviso, ModalConfirmacao } from "@/components/modals"
import type { AvisoData } from "@/components/modals"
import type { ComboboxOption } from "@/components/ui/combobox"
import type { DestinatarioOption } from "@/components/modals/modal-nova-mensagem"

export default function CoordenadorComunicacaoPage() {
  const [isNovaMensagemOpen, setIsNovaMensagemOpen] = useState(false)
  const destinatarios: DestinatarioOption[] = [
    { id: 'direcao', label: 'Direção' },
    { id: 'professores', label: 'Todos os Professores' },
    { id: 'prof-maria', label: 'Prof. Maria Santos' },
    { id: 'secretaria', label: 'Secretaria' },
    { id: 'alunos', label: 'Todos os Alunos' },
  ]

  const [isAvisoOpen, setIsAvisoOpen] = useState(false)
  const [editingAviso, setEditingAviso] = useState<AvisoData | undefined>(undefined)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [avisoParaExcluir, setAvisoParaExcluir] = useState<number | null>(null)
  const turmaOptions: ComboboxOption[] = [
    { id: 'todos', label: 'Todos os usuários' },
    { id: 'alunos', label: 'Todos os alunos' },
    { id: 'professores', label: 'Professores' },
    { id: 'pais', label: 'Pais e responsáveis' },
    { id: 'fundamental', label: 'Ensino Fundamental' },
    { id: 'medio', label: 'Ensino Médio' },
  ]

  const [comunicadosPublicados, setComunicadosPublicados] = useState([
    {
      id: 1,
      titulo: "Calendário de Provas - 2º Bimestre",
      categoria: "Acadêmico",
      data: "18/03/2024",
      visualizacoes: 245,
      publico: "Todos os alunos",
      status: "Ativo",
    },
    {
      id: 2,
      titulo: "Feira de Ciências 2024",
      categoria: "Evento",
      data: "15/03/2024",
      visualizacoes: 189,
      publico: "Ensino Médio",
      status: "Ativo",
    },
    {
      id: 3,
      titulo: "Reunião de Pais - Março",
      categoria: "Evento",
      data: "10/03/2024",
      visualizacoes: 156,
      publico: "Pais e responsáveis",
      status: "Arquivado",
    },
  ])

  const mensagensInstitucionais = [
    {
      id: 1,
      remetente: "Direção",
      assunto: "Planejamento do próximo semestre",
      data: "Hoje, 09:30",
      lida: false,
    },
    {
      id: 2,
      remetente: "Prof. Maria Santos",
      assunto: "Solicitação de material didático",
      data: "Ontem, 14:20",
      lida: true,
    },
    {
      id: 3,
      remetente: "Secretaria",
      assunto: "Relatório de frequência",
      data: "2 dias atrás",
      lida: true,
    },
  ]

  const estatisticasComunicacao = {
    comunicadosAtivos: 12,
    visualizacoesTotais: 1250,
    engajamentoMedio: 78,
    mensagensEnviadas: 45,
  }

  const handleSaveAviso = (data: AvisoData) => {
    if (data.id) {
      setComunicadosPublicados(prev => prev.map(c => 
        c.id === data.id 
          ? { ...c, titulo: data.titulo, publico: data.turma, data: data.data }
          : c
      ))
    } else {
      const newId = Math.max(0, ...comunicadosPublicados.map(c => c.id)) + 1
      setComunicadosPublicados(prev => [{
        id: newId,
        titulo: data.titulo,
        categoria: "Informativo",
        data: data.data,
        visualizacoes: 0,
        publico: data.turma,
        status: "Ativo",
      }, ...prev])
    }
  }

  const openCreateAviso = () => {
    setEditingAviso(undefined)
    setIsAvisoOpen(true)
  }

  const openEditAviso = (comunicadoId: number) => {
    const found = comunicadosPublicados.find(c => c.id === comunicadoId)
    if (found) {
      setEditingAviso({
        id: found.id,
        titulo: found.titulo,
        turma: found.publico,
        data: found.data,
      })
      setIsAvisoOpen(true)
    }
  }

  const confirmDelete = (comunicadoId: number) => {
    setAvisoParaExcluir(comunicadoId)
    setConfirmOpen(true)
  }

  const handleDelete = () => {
    if (avisoParaExcluir != null) {
      setComunicadosPublicados(prev => prev.filter(c => c.id !== avisoParaExcluir))
      setAvisoParaExcluir(null)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="coordenador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comunicação Institucional</h1>
              <p className="text-muted-foreground">Gerencie comunicados e mensagens institucionais</p>
            </div>
            <div className="flex gap-2">
              <LiquidGlassButton variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </LiquidGlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comunicados Ativos</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasComunicacao.comunicadosAtivos}</div>
                <p className="text-xs text-muted-foreground">+3 este mês</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasComunicacao.visualizacoesTotais}</div>
                <p className="text-xs text-muted-foreground">+15% vs mês anterior</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasComunicacao.engajamentoMedio}%</div>
                <p className="text-xs text-muted-foreground">Taxa média de leitura</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{estatisticasComunicacao.mensagensEnviadas}</div>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <Tabs defaultValue="mensagens" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
              <TabsTrigger value="avisos">Avisos</TabsTrigger>
            </TabsList>

            <TabsContent value="mensagens">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Mensagens</h3>
                <Dialog open={isNovaMensagemOpen}>
                  <DialogTrigger asChild onClick={() => setIsNovaMensagemOpen(true)}>
                    <LiquidGlassButton>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Mensagem
                    </LiquidGlassButton>
                  </DialogTrigger>
                  <ModalNovaMensagem
                    isOpen={isNovaMensagemOpen}
                    onClose={() => setIsNovaMensagemOpen(false)}
                    destinatarios={destinatarios}
                    onSend={() => setIsNovaMensagemOpen(false)}
                  />
                </Dialog>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader>
                      <CardTitle>Caixa de Entrada</CardTitle>
                      <CardDescription>3 mensagens não lidas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {mensagensInstitucionais.map((mensagem) => (
                          <div
                            key={mensagem.id}
                              className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                                !mensagem.lida ? "bg-primary/5 border-primary/20" : ""
                              }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="font-medium text-sm">{mensagem.remetente}</h5>
                              {!mensagem.lida && <div className="w-2 h-2 bg-primary rounded-full" />}
                            </div>
                            <p className="font-medium text-sm mb-1">{mensagem.assunto}</p>
                            <p className="text-xs text-muted-foreground">{mensagem.data}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                </div>

                <div className="lg:col-span-2">
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardHeader>
                      <CardTitle>Planejamento do próximo semestre</CardTitle>
                      <CardDescription>De: Direção • Hoje, 09:30</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p>Cara Coordenação,</p>
                        <p>
                          Gostaria de agendar uma reunião para discutirmos o planejamento acadêmico do próximo semestre.
                          Precisamos revisar:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Grade curricular</li>
                          <li>Distribuição de professores</li>
                          <li>Calendário de avaliações</li>
                          <li>Projetos especiais</li>
                        </ul>
                        <p>Aguardo retorno para agendarmos.</p>
                        <p>
                          Atenciosamente,
                          <br />
                          Direção
                        </p>
                        <div className="border-t pt-4">
                          <Textarea placeholder="Digite sua resposta..." className="mb-4" />
                          <LiquidGlassButton>
                            <Send className="h-4 w-4 mr-2" />
                            Responder
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="avisos">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Meus Avisos</h3>
                  <LiquidGlassButton onClick={openCreateAviso}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Aviso
                  </LiquidGlassButton>
                </div>

                {comunicadosPublicados.map((aviso) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={aviso.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{aviso.titulo}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Badge variant="outline">{aviso.publico}</Badge>
                            <span>{aviso.data}</span>
                            <span>{aviso.visualizacoes} visualizações</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <LiquidGlassButton variant="outline" size="sm" onClick={() => openEditAviso(aviso.id)}>
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton variant="outline" size="sm" onClick={() => confirmDelete(aviso.id)}>
                            <Trash2 className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          <ModalAviso
            isOpen={isAvisoOpen}
            onClose={() => setIsAvisoOpen(false)}
            onSave={handleSaveAviso}
            initialData={editingAviso}
            turmaOptions={turmaOptions}
          />
          <ModalConfirmacao
            isOpen={confirmOpen}
            title="Excluir aviso"
            description="Tem certeza que deseja excluir este aviso? Essa ação não pode ser desfeita."
            confirmLabel="Excluir"
            onConfirm={handleDelete}
            onClose={() => setConfirmOpen(false)}
          />
        </div>
      </main>
    </div>
  )
}
