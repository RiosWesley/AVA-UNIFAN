"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Calendar } from "lucide-react"
import { ModalConfirmacao } from "@/components/modals/modal-confirmacao"
import {
  getAcademicPeriods,
  createAcademicPeriod,
  updateAcademicPeriod,
  deleteAcademicPeriod,
  type AcademicPeriod,
  type CreateAcademicPeriodDto,
  type UpdateAcademicPeriodDto,
} from "@/src/services/academicPeriodsService"
import { toast } from "@/components/ui/toast"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { useRouter } from "next/navigation"

export default function ConfiguracoesAdministradorPage() {
  const router = useRouter()
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [periodoEditando, setPeriodoEditando] = useState<AcademicPeriod | null>(null)
  const [periodoExcluindo, setPeriodoExcluindo] = useState<AcademicPeriod | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [form, setForm] = useState<{ period: string }>({ period: "" })
  const [formError, setFormError] = useState<string | null>(null)

  // Verificar autenticação e role
  useEffect(() => {
    const init = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
        if (!token) {
          router.push("/")
          return
        }
        const user = await getCurrentUser()
        if (!user?.id || !user?.roles?.includes("admin")) {
          router.push("/")
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        router.push("/")
      }
    }
    init()
  }, [router])

  // Carregar períodos letivos
  useEffect(() => {
    carregarPeriodos()
  }, [])

  async function carregarPeriodos() {
    try {
      setLoading(true)
      setError(null)
      const periods = await getAcademicPeriods()
      setAcademicPeriods(periods)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar períodos letivos")
      console.error("Erro ao carregar períodos letivos:", err)
      toast({
        variant: 'error',
        title: 'Erro ao carregar períodos',
        description: err.message || "Não foi possível carregar os períodos letivos."
      })
    } finally {
      setLoading(false)
    }
  }

  // Validar formato do período
  function validarPeriodo(period: string): boolean {
    return /^\d{4}\.(1|2)$/.test(period)
  }

  // Abrir modal de criação
  function handleOpenCreateModal() {
    setForm({ period: "" })
    setFormError(null)
    setIsCreateModalOpen(true)
  }

  // Fechar modal de criação
  function handleCloseCreateModal() {
    setIsCreateModalOpen(false)
    setForm({ period: "" })
    setFormError(null)
  }

  // Abrir modal de edição
  function handleOpenEditModal(periodo: AcademicPeriod) {
    setPeriodoEditando(periodo)
    setForm({ period: periodo.period })
    setFormError(null)
    setIsEditModalOpen(true)
  }

  // Fechar modal de edição
  function handleCloseEditModal() {
    setIsEditModalOpen(false)
    setPeriodoEditando(null)
    setForm({ period: "" })
    setFormError(null)
  }

  // Criar período letivo
  async function handleCreate() {
    if (!form.period.trim()) {
      setFormError("O período é obrigatório")
      return
    }

    if (!validarPeriodo(form.period.trim())) {
      setFormError("O período deve estar no formato YYYY.1 ou YYYY.2 (ex: 2025.1)")
      return
    }

    // Verificar duplicata localmente
    const periodoExiste = academicPeriods.some(
      (p) => p.period === form.period.trim()
    )
    if (periodoExiste) {
      setFormError("Este período letivo já existe")
      return
    }

    try {
      setFormError(null)
      const payload: CreateAcademicPeriodDto = {
        period: form.period.trim(),
      }
      const novo = await createAcademicPeriod(payload)
      setAcademicPeriods((prev) => [novo, ...prev].sort((a, b) => b.period.localeCompare(a.period)))
      handleCloseCreateModal()
      toast({
        variant: 'success',
        title: 'Período letivo criado',
        description: `O período "${novo.period}" foi criado com sucesso.`,
      })
    } catch (err: any) {
      setFormError(err.message || "Erro ao criar período letivo")
      toast({
        variant: 'error',
        title: 'Erro ao criar período',
        description: err.message || "Não foi possível criar o período letivo."
      })
    }
  }

  // Atualizar período letivo
  async function handleUpdate() {
    if (!periodoEditando) return

    if (!form.period.trim()) {
      setFormError("O período é obrigatório")
      return
    }

    if (!validarPeriodo(form.period.trim())) {
      setFormError("O período deve estar no formato YYYY.1 ou YYYY.2 (ex: 2025.1)")
      return
    }

    // Verificar duplicata localmente (exceto o próprio período sendo editado)
    const periodoExiste = academicPeriods.some(
      (p) => p.period === form.period.trim() && p.id !== periodoEditando.id
    )
    if (periodoExiste) {
      setFormError("Este período letivo já existe")
      return
    }

    try {
      setFormError(null)
      const payload: UpdateAcademicPeriodDto = {
        period: form.period.trim(),
      }
      const atualizado = await updateAcademicPeriod(periodoEditando.id, payload)
      setAcademicPeriods((prev) =>
        prev
          .map((p) => (p.id === atualizado.id ? atualizado : p))
          .sort((a, b) => b.period.localeCompare(a.period))
      )
      handleCloseEditModal()
      toast({
        variant: 'success',
        title: 'Período letivo atualizado',
        description: `O período foi atualizado para "${atualizado.period}".`,
      })
    } catch (err: any) {
      setFormError(err.message || "Erro ao atualizar período letivo")
      toast({
        variant: 'error',
        title: 'Erro ao atualizar período',
        description: err.message || "Não foi possível atualizar o período letivo."
      })
    }
  }

  // Abrir modal de exclusão
  function handleOpenDeleteModal(periodo: AcademicPeriod) {
    setPeriodoExcluindo(periodo)
  }

  // Excluir período letivo
  async function confirmarExclusao() {
    if (!periodoExcluindo) return

    try {
      setError(null)
      await deleteAcademicPeriod(periodoExcluindo.id)
      setAcademicPeriods((prev) => prev.filter((p) => p.id !== periodoExcluindo.id))
      setPeriodoExcluindo(null)
      toast({
        variant: 'success',
        title: 'Período letivo excluído',
        description: `O período "${periodoExcluindo.period}" foi excluído com sucesso.`,
      })
    } catch (err: any) {
      setError(err.message || "Erro ao excluir período letivo")
      toast({
        variant: 'error',
        title: 'Erro ao excluir período',
        description: err.message || "Não foi possível excluir o período letivo."
      })
      setPeriodoExcluindo(null)
    }
  }

  // Formatar data
  function formatarData(data: string): string {
    try {
      return new Date(data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return "Data inválida"
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="administrador" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
          </div>

          <Tabs defaultValue="periodo-letivo" className="space-y-6">
            <TabsList>
              <TabsTrigger value="periodo-letivo">Período Letivo</TabsTrigger>
            </TabsList>

            <TabsContent value="periodo-letivo" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Períodos Letivos
                      </CardTitle>
                      <CardDescription>Gerencie os períodos letivos do sistema</CardDescription>
                    </div>
                    <Button onClick={handleOpenCreateModal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Período
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Carregando períodos letivos...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {academicPeriods.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum período letivo cadastrado.</p>
                          <p className="text-sm mt-2">Clique em "Adicionar Período" para criar o primeiro.</p>
                        </div>
                      ) : (
                        academicPeriods.map((periodo) => (
                          <Card key={periodo.id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-lg">{periodo.period}</h3>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Criado em {formatarData(periodo.createdAt)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenEditModal(periodo)}
                                    title="Editar período"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenDeleteModal(periodo)}
                                    title="Excluir período"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
        if (!open) handleCloseCreateModal()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Período Letivo</DialogTitle>
            <DialogDescription>
              Informe o período no formato YYYY.1 ou YYYY.2 (ex: 2025.1)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="period-create">Período</Label>
              <Input
                id="period-create"
                placeholder="2025.1"
                value={form.period}
                onChange={(e) => {
                  setForm({ period: e.target.value })
                  setFormError(null)
                }}
                className={formError ? "border-red-500" : ""}
              />
              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Formato: YYYY.1 (primeiro semestre) ou YYYY.2 (segundo semestre)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateModal}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        if (!open) handleCloseEditModal()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Período Letivo</DialogTitle>
            <DialogDescription>
              Atualize o período no formato YYYY.1 ou YYYY.2 (ex: 2025.1)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="period-edit">Período</Label>
              <Input
                id="period-edit"
                placeholder="2025.1"
                value={form.period}
                onChange={(e) => {
                  setForm({ period: e.target.value })
                  setFormError(null)
                }}
                className={formError ? "border-red-500" : ""}
              />
              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Formato: YYYY.1 (primeiro semestre) ou YYYY.2 (segundo semestre)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <ModalConfirmacao
        isOpen={!!periodoExcluindo}
        title="Excluir Período Letivo"
        description={
          periodoExcluindo
            ? `Tem certeza que deseja excluir o período letivo "${periodoExcluindo.period}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmarExclusao}
        onClose={() => setPeriodoExcluindo(null)}
      />
    </div>
  )
}

