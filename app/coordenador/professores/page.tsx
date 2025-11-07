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
import { Users, Plus, Search, Edit, Trash2, Mail, GraduationCap } from "lucide-react"

type Professor = {
  id: number
  nome: string
  email: string
  usuario?: string
  telefone?: string
  cpf?: string
  status: "Ativo" | "Inativo"
}

const MOCK_PROFESSORES: Professor[] = [
  { id: 1, nome: "Ana Silva", email: "ana@escola.com", status: "Ativo" },
  { id: 2, nome: "Carlos Santos", email: "carlos@escola.com", status: "Ativo" },
  { id: 3, nome: "Maria Oliveira", email: "maria@escola.com", status: "Inativo" },
  { id: 4, nome: "João Lima", email: "joao@escola.com", status: "Ativo" },
]

export default function ProfessoresCoordenadorPage() {
  const [professores, setProfessores] = useState<Professor[]>(MOCK_PROFESSORES)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | "Ativo" | "Inativo">("todos")
  const [activeTab, setActiveTab] = useState<"lista" | "cadastro">("lista")

  const [form, setForm] = useState<{
    nome: string
    email: string
    usuario: string
    telefone: string
    cpf: string
    senha: string
    confirmarSenha: string
    status: "Ativo" | "Inativo"
  }>({
    nome: "",
    email: "",
    usuario: "",
    telefone: "",
    cpf: "",
    senha: "",
    confirmarSenha: "",
    status: "Ativo",
  })

  const filtrados = useMemo(() => {
    return professores.filter((p) => {
      const hitsStatus = statusFilter === "todos" ? true : p.status === statusFilter
      const q = search.toLowerCase().trim()
      const hitsSearch = q
        ? p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
        : true
      return hitsStatus && hitsSearch
    })
  }, [professores, statusFilter, search])

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
    const novo: Professor = {
      id: Math.max(0, ...professores.map((p) => p.id)) + 1,
      nome: form.nome.trim(),
      email: form.email.trim(),
      usuario: form.usuario.trim() || undefined,
      telefone: form.telefone.trim() || undefined,
      cpf: cpfDigits ? cpfDigits : undefined,
      status: form.status,
    }
    setProfessores((prev) => [novo, ...prev])
    setForm({
      nome: "",
      email: "",
      usuario: "",
      telefone: "",
      cpf: "",
      senha: "",
      confirmarSenha: "",
      status: "Ativo",
    })
    setActiveTab("lista")
  }

  function handleDelete(id: number) {
    if (confirm("Tem certeza que deseja excluir este professor?")) {
      setProfessores((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="coordenador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestão de Professores</h1>
              <p className="text-muted-foreground">Cadastrar, listar e gerenciar professores</p>
            </div>
            <Button onClick={() => setActiveTab("cadastro")}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Professor
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "lista" | "cadastro")} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lista">Lista</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Professores
                  </CardTitle>
                  <CardDescription>Gerencie os professores do sistema</CardDescription>
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
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "todos" | "Ativo" | "Inativo")}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {filtrados.map((p) => (
                      <Card key={p.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{p.nome}</h3>
                                <Badge variant="outline">Professor</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  {p.email}
                                </span>
                                {p.telefone && <span>Tel: {p.telefone}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={p.status === "Ativo" ? "default" : "secondary"}>{p.status}</Badge>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent"
                                onClick={() => handleDelete(p.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filtrados.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum professor encontrado.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cadastro" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Novo Professor</CardTitle>
                  <CardDescription>Preencha os dados para cadastrar um novo professor</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usuario">Usuário (login)</Label>
                      <Input
                        id="usuario"
                        value={form.usuario}
                        onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={form.telefone}
                        onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={form.cpf}
                        onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                      />
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
                      <Input
                        id="senha"
                        type="password"
                        value={form.senha}
                        onChange={(e) => setForm({ ...form, senha: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                      <Input
                        id="confirmarSenha"
                        type="password"
                        value={form.confirmarSenha}
                        onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
                        required
                      />
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
                            cpf: "",
                            senha: "",
                            confirmarSenha: "",
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

