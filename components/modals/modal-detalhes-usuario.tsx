"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  Users,
  Settings,
  X,
  FileText,
  Award
} from "lucide-react"
import { useCreateCharge } from "@/hooks/use-financeiro"
import { toast } from "sonner"

type Role = "aluno" | "professor" | "coordenador" | "administrador"

export interface UsuarioDetalhes {
  id: string
  nome: string
  email: string
  usuario?: string
  telefone?: string
  cpf?: string
  role: Role
  status: "Ativo" | "Inativo"
  dataNascimento?: string
  endereco?: string
  dataCadastro?: string
  ultimoAcesso?: string
}

interface ModalDetalhesUsuarioProps {
  isOpen: boolean
  onClose: () => void
  usuario: UsuarioDetalhes | null
}

export function ModalDetalhesUsuario({
  isOpen,
  onClose,
  usuario
}: ModalDetalhesUsuarioProps) {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [chargeAmount, setChargeAmount] = useState("")
  const [chargeDueDate, setChargeDueDate] = useState("")

  const createChargeMutation = useCreateCharge()

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

  if (!usuario) return null

  const getRoleLabel = (role: Role) => {
    const labels: Record<Role, string> = {
      aluno: "Aluno",
      professor: "Professor",
      coordenador: "Coordenador",
      administrador: "Administrador"
    }
    return labels[role]
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "aluno":
        return GraduationCap
      case "professor":
        return BookOpen
      case "coordenador":
        return Users
      case "administrador":
        return Settings
      default:
        return User
    }
  }

  const RoleIcon = getRoleIcon(usuario.role)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed inset-0 left-0 top-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none p-6 border-0 overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <RoleIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{usuario.nome}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">{getRoleLabel(usuario.role)}</Badge>
                <Badge variant={usuario.status === "Ativo" ? "default" : "secondary"}>
                  {usuario.status}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="informacoes" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
              {usuario.role === "aluno" && (
                <TabsTrigger value="academico">Acadêmico</TabsTrigger>
              )}
              {usuario.role === "professor" && (
                <TabsTrigger value="turmas">Turmas</TabsTrigger>
              )}
              {usuario.role === "coordenador" && (
                <TabsTrigger value="gestao">Gestão</TabsTrigger>
              )}
              {usuario.role === "administrador" && (
                <TabsTrigger value="sistema">Sistema</TabsTrigger>
              )}
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="informacoes" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{usuario.email || "Não informado"}</span>
                    </div>
                    {usuario.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{usuario.telefone}</span>
                      </div>
                    )}
                    {usuario.cpf && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{usuario.cpf}</span>
                      </div>
                    )}
                    {usuario.dataNascimento && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{usuario.dataNascimento}</span>
                      </div>
                    )}
                    {usuario.endereco && (
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{usuario.endereco}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Informações de Acesso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {usuario.usuario && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Usuário: {usuario.usuario}</span>
                      </div>
                    )}
                    {usuario.dataCadastro && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Cadastrado em: {usuario.dataCadastro}</span>
                      </div>
                    )}
                    {usuario.ultimoAcesso && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Último acesso: {usuario.ultimoAcesso}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {usuario.role === "aluno" && (
              <TabsContent value="academico" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Dados Acadêmicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Informações acadêmicas do aluno serão exibidas aqui.
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Gerar Cobrança
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input
                          placeholder="0,00"
                          value={chargeAmount}
                          onChange={(event) => {
                            const numeric = event.target.value.replace(/[^\d,]/g, "")
                            setChargeAmount(numeric)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data de vencimento</Label>
                        <Input
                          type="date"
                          value={chargeDueDate}
                          onChange={(event) => setChargeDueDate(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      A cobrança será criada com status pendente e aparecerá automaticamente no
                      painel financeiro do aluno.
                    </div>
                    <Button
                      onClick={async () => {
                        if (!chargeAmount || !chargeDueDate) {
                          toast.error("Informe valor e vencimento")
                          return
                        }
                        const normalized = chargeAmount.replace(".", "").replace(",", ".")
                        const amount = Number(normalized)
                        if (Number.isNaN(amount) || amount <= 0) {
                          toast.error("Valor inválido")
                          return
                        }
                        try {
                          await createChargeMutation.mutateAsync({
                            studentId: usuario.id,
                            amount,
                            dueDate: chargeDueDate,
                          })
                          toast.success("Cobrança criada com sucesso")
                          setChargeAmount("")
                          setChargeDueDate("")
                        } catch (error) {
                          console.error(error)
                          toast.error("Não foi possível criar a cobrança")
                        }
                      }}
                      disabled={createChargeMutation.isPending}
                    >
                      {createChargeMutation.isPending ? "Gerando..." : "Gerar cobrança"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {usuario.role === "professor" && (
              <TabsContent value="turmas" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Turmas Atribuídas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Turmas atribuídas ao professor serão exibidas aqui.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {usuario.role === "coordenador" && (
              <TabsContent value="gestao" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Gestão de Cursos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Informações de gestão do coordenador serão exibidas aqui.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {usuario.role === "administrador" && (
              <TabsContent value="sistema" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configurações do Sistema
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Configurações e permissões do administrador serão exibidas aqui.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="historico" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Histórico de Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Histórico de atividades do usuário será exibido aqui.
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

