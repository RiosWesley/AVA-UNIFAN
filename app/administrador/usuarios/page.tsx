"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Edit, Trash2, Mail } from "lucide-react"

type Role = "aluno" | "professor" | "coordenador" | "administrador"

type Usuario = {
  id: number
  nome: string
  email: string
  usuario?: string
  telefone?: string
  cpf?: string
  role: Role
  status: "Ativo" | "Inativo"
}

const MOCK_USUARIOS: Usuario[] = [
  { id: 1, nome: "Ana Silva", email: "ana@escola.com", role: "professor", status: "Ativo" },
  { id: 2, nome: "João Santos", email: "joao@escola.com", role: "aluno", status: "Ativo" },
  { id: 3, nome: "Maria Oliveira", email: "maria@escola.com", role: "coordenador", status: "Inativo" },
  { id: 4, nome: "Carlos Lima", email: "carlos@escola.com", role: "administrador", status: "Ativo" },
]

export default function UsuariosAdministradorPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK_USUARIOS)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<Role | "todos">("todos")

  const [form, setForm] = useState<{
    nome: string
    email: string
    usuario: string
    telefone: string
    cpf: string
    senha: string
    confirmarSenha: string
    role: Role
    status: "Ativo" | "Inativo"
  }>({
    nome: "",
    email: "",
    usuario: "",
    telefone: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
    role: "aluno",
    status: "Ativo",
  })

  const filtrados = useMemo(() => {
    return usuarios.filter((u) => {
      const hitsRole = roleFilter === "todos" ? true : u.role === roleFilter
      const q = search.toLowerCase().trim()
      const hitsSearch = q
        ? u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        : true
      return hitsRole && hitsSearch
    })
  }, [usuarios, roleFilter, search])

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.email.trim()) return
    const cpfDigits = form.cpf.replace(/\D/g, "")
    if (form.cpf && cpfDigits.length !== 11) {
      alert("CPF deve conter 11 dígitos.")
      return
    }
    if (form.senha !== form.confirmarSenha) {
      alert("As senhas não coincidem.")
      return
    }
    if (form.senha && form.senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.")
      return
    }
    const novo: Usuario = {
      id: Math.max(0, ...usuarios.map((u) => u.id)) + 1,
      nome: form.nome.trim(),
      email: form.email.trim(),
      usuario: form.usuario.trim() || undefined,
      telefone: form.telefone.trim() || undefined,
      cpf: cpfDigits ? cpfDigits : undefined,
      role: form.role,
      status: form.status,
    }
    setUsuarios((prev) => [novo, ...prev])
    setForm({
      nome: "",
      email: "",
      usuario: "",
      telefone: "",
      cpf: "",
      senha: "",
      confirmarSenha: "",
      role: "aluno",
      status: "Ativo",
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
              <p className="text-muted-foreground">Cadastrar, listar, buscar e filtrar usuários</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>

          <Tabs defaultValue="lista" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lista">Lista</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Usuários
                  </CardTitle>
                  <CardDescription>Gerencie os usuários do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Input
                        placeholder="Pesquisar por nome ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "todos")}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="aluno">Aluno</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                        <SelectItem value="coordenador">Coordenador</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {filtrados.map((u) => (
                      <Card key={u.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{u.nome}</h3>
                                <Badge variant="outline" className="capitalize">{u.role}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{u.email}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={u.status === "Ativo" ? "default" : "secondary"}>{u.status}</Badge>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filtrados.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cadastro" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Novo Usuário</CardTitle>
                  <CardDescription>Preencha os dados para cadastrar um novo usuário</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usuario">Usuário (login)</Label>
                      <Input id="usuario" value={form.usuario} onChange={(e) => setForm({ ...form, usuario: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input id="cpf" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Papel</Label>
                      <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
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
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "Ativo" | "Inativo" })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ativo">Ativo</SelectItem>
                          <SelectItem value="Inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha</Label>
                      <Input id="senha" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                      <Input id="confirmarSenha" type="password" value={form.confirmarSenha} onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })} />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <Button
                        type="reset"
                        variant="outline"
                        onClick={() =>
                          setForm({
                            nome: "",
                            email: "",
                            usuario: "",
                            telefone: "",
                            senha: "",
                            confirmarSenha: "",
                            role: "aluno",
                            status: "Ativo",
                          })
                        }
                      >
                        Limpar
                      </Button>
                      <Button type="submit">
                        <Plus className="w-4 h-4 mr-2" /> Cadastrar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}


