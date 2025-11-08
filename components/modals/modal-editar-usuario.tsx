"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Save, X } from "lucide-react"
import { toast } from "@/components/ui/toast"

type Role = "aluno" | "professor" | "coordenador" | "administrador"

export interface Usuario {
  id: number
  nome: string
  email: string
  usuario?: string
  telefone?: string
  cpf?: string
  role: Role
  status: "Ativo" | "Inativo"
}

interface ModalEditarUsuarioProps {
  isOpen: boolean
  onClose: () => void
  usuario: Usuario | null
  onSalvar: (usuario: Usuario) => void
}

export function ModalEditarUsuario({
  isOpen,
  onClose,
  usuario,
  onSalvar
}: ModalEditarUsuarioProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [usuarioLogin, setUsuarioLogin] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cpf, setCpf] = useState('')
  const [role, setRole] = useState<Role>("aluno")
  const [status, setStatus] = useState<"Ativo" | "Inativo">("Ativo")
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '')
      setEmail(usuario.email || '')
      setUsuarioLogin(usuario.usuario || '')
      setTelefone(usuario.telefone || '')
      setCpf(usuario.cpf || '')
      setRole(usuario.role)
      setStatus(usuario.status)
      setSenha('')
      setConfirmarSenha('')
    }
    setErrors({})
  }, [usuario, isOpen])

  const validarCampos = () => {
    const novosErros: Record<string, string> = {}

    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório'
    }

    if (!email.trim()) {
      novosErros.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = 'Email inválido'
    }

    if (cpf) {
      const cpfDigits = cpf.replace(/\D/g, "")
      if (cpfDigits.length !== 11) {
        novosErros.cpf = 'CPF deve conter 11 dígitos'
      }
    }

    if (senha) {
      if (senha.length < 6) {
        novosErros.senha = 'A senha deve ter pelo menos 6 caracteres'
      } else if (senha !== confirmarSenha) {
        novosErros.confirmarSenha = 'As senhas não coincidem'
      }
    }

    setErrors(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleSalvar = () => {
    if (!usuario || !validarCampos()) return

    const cpfDigits = cpf.replace(/\D/g, "")
    const usuarioAtualizado: Usuario = {
      id: usuario.id,
      nome: nome.trim(),
      email: email.trim(),
      usuario: usuarioLogin.trim() || undefined,
      telefone: telefone.trim() || undefined,
      cpf: cpfDigits || undefined,
      role,
      status
    }

    onSalvar(usuarioAtualizado)
    toast({ title: "Sucesso", description: `"${nome}" atualizado com sucesso!` })
    onClose()
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  if (!usuario) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            <h2 className="text-xl font-bold">Editar Usuário</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Atualize as informações do usuário
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={errors.nome ? 'border-destructive' : ''}
                />
                {errors.nome && (
                  <p className="text-sm text-destructive mt-1">{errors.nome}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="usuario">Usuário (login)</Label>
                <Input
                  id="usuario"
                  value={usuarioLogin}
                  onChange={(e) => setUsuarioLogin(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className={errors.cpf ? 'border-destructive' : ''}
                />
                {errors.cpf && (
                  <p className="text-sm text-destructive mt-1">{errors.cpf}</p>
                )}
              </div>

              <div>
                <Label>Papel</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aluno">Aluno</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="coordenador">Coordenador</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as "Ativo" | "Inativo")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-4">Alterar Senha (opcional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senha">Nova Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className={errors.senha ? 'border-destructive' : ''}
                  />
                  {errors.senha && (
                    <p className="text-sm text-destructive mt-1">{errors.senha}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className={errors.confirmarSenha ? 'border-destructive' : ''}
                  />
                  {errors.confirmarSenha && (
                    <p className="text-sm text-destructive mt-1">{errors.confirmarSenha}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <LiquidGlassButton onClick={handleSalvar}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </LiquidGlassButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

