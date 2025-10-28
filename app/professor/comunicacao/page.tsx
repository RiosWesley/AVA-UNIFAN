"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/layout/sidebar"
import { Send, Plus, Bell, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { ModalNovaMensagem, ModalAviso, ModalConfirmacao } from "@/components/modals"
import type { AvisoData } from "@/components/modals"
import type { ComboboxOption } from "@/components/ui/combobox"
import type { DestinatarioOption } from "@/components/modals/modal-nova-mensagem"

export default function ProfessorComunicacaoPage() {
  const [isNovaMensagemOpen, setIsNovaMensagemOpen] = useState(false)
  const destinatarios: DestinatarioOption[] = [
    { id: 'turma-9a', label: '9º Ano A (Toda a turma)' },
    { id: 'turma-8b', label: '8º Ano B (Toda a turma)' },
    { id: 'ana-silva', label: 'Ana Silva (9º A)' },
    { id: 'bruno-santos', label: 'Bruno Santos (8º B)' },
    { id: 'coordenacao', label: 'Coordenação' },
  ]
  const mensagensRecebidas = [
    {
      id: 1,
      remetente: "Ana Silva (9º A)",
      assunto: "Dúvida sobre exercício",
      preview: "Professor, não consegui resolver o exercício 15...",
      data: "Hoje, 15:20",
      lida: false,
    },
    {
      id: 2,
      remetente: "Bruno Santos (8º B)",
      assunto: "Falta na prova",
      preview: "Professor, faltei na prova por motivo médico...",
      data: "Ontem, 10:30",
      lida: true,
    },
    {
      id: 3,
      remetente: "Coordenação",
      assunto: "Reunião pedagógica",
      preview: "Reunião marcada para sexta-feira...",
      data: "2 dias atrás",
      lida: true,
    },
  ]

  const [isAvisoOpen, setIsAvisoOpen] = useState(false)
  const [editingAviso, setEditingAviso] = useState<AvisoData | undefined>(undefined)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [avisos, setAvisos] = useState([
    {
      id: 1,
      titulo: "Prova de Matemática - 9º Ano A",
      turma: "9º Ano A",
      data: "15/03/2024",
      visualizacoes: 28,
    },
    {
      id: 2,
      titulo: "Material Complementar Disponível",
      turma: "8º Ano B",
      data: "12/03/2024",
      visualizacoes: 23,
    },
  ])
  const [avisoParaExcluir, setAvisoParaExcluir] = useState<number | null>(null)
  const turmaOptions: ComboboxOption[] = [
    { id: '9a', label: '9º Ano A' },
    { id: '8b', label: '8º Ano B' },
    { id: '7c', label: '7º Ano C' },
  ]

  const handleSaveAviso = (data: AvisoData) => {
    if (data.id) {
      setAvisos(prev => prev.map(a => a.id === data.id ? { ...a, ...data } : a))
    } else {
      const newId = Math.max(0, ...avisos.map(a => a.id)) + 1
      setAvisos(prev => [{ id: newId, titulo: data.titulo, turma: data.turma, data: data.data, visualizacoes: 0 }, ...prev])
    }
  }

  const openCreateAviso = () => {
    setEditingAviso(undefined)
    setIsAvisoOpen(true)
  }

  const openEditAviso = (avisoId: number) => {
    const found = avisos.find(a => a.id === avisoId)
    if (found) {
      setEditingAviso({ id: found.id, titulo: found.titulo, turma: found.turma, data: found.data })
      setIsAvisoOpen(true)
    }
  }

  const confirmDelete = (avisoId: number) => {
    setAvisoParaExcluir(avisoId)
    setConfirmOpen(true)
  }

  const handleDelete = () => {
    if (avisoParaExcluir != null) {
      setAvisos(prev => prev.filter(a => a.id !== avisoParaExcluir))
      setAvisoParaExcluir(null)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Comunicação</h1>
              <p className="text-muted-foreground">Gerencie mensagens e avisos</p>
            </div>
            <div className="flex gap-2">
              <LiquidGlassButton variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </LiquidGlassButton>
            </div>
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
                        {mensagensRecebidas.map((mensagem) => (
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
                            <p className="text-xs text-muted-foreground mb-2">{mensagem.preview}</p>
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
                      <CardTitle>Dúvida sobre exercício</CardTitle>
                      <CardDescription>De: Ana Silva (9º A) • Hoje, 15:20</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p>Professor Carlos,</p>
                        <p>
                          Não consegui resolver o exercício 15 da lista. Poderia me ajudar com os passos para encontrar
                          as raízes da função quadrática?
                        </p>
                        <p>Obrigada!</p>
                        <p>Ana Silva</p>
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

                {avisos.map((aviso) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={aviso.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2">{aviso.titulo}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <Badge variant="outline">{aviso.turma}</Badge>
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
