"use client"

import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Calendar, Image as ImageIcon, Upload, X } from "lucide-react"
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
import {
  getMurals,
  createMural,
  updateMural,
  deleteMural,
  type Mural,
  type MuralTargetRole,
  type CreateMuralDto,
  type UpdateMuralDto,
} from "@/src/services/muralsService"
import { toast } from "@/components/ui/toast"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { useRouter } from "next/navigation"
import Image from "next/image"

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

  // Estados para Mural
  const [murals, setMurals] = useState<Mural[]>([])
  const [muralLoading, setMuralLoading] = useState(true)
  const [muralError, setMuralError] = useState<string | null>(null)
  const [muralFiltro, setMuralFiltro] = useState<MuralTargetRole | "todos">("todos")
  const [muralEditando, setMuralEditando] = useState<Mural | null>(null)
  const [muralExcluindo, setMuralExcluindo] = useState<Mural | null>(null)
  const [isMuralCreateModalOpen, setIsMuralCreateModalOpen] = useState(false)
  const [isMuralEditModalOpen, setIsMuralEditModalOpen] = useState(false)
  const [muralForm, setMuralForm] = useState<{
    title: string
    description: string
    targetRole: MuralTargetRole | "ambos"
    order: string
    isActive: boolean
  }>({
    title: "",
    description: "",
    targetRole: "aluno",
    order: "",
    isActive: true,
  })
  const [muralImageFile, setMuralImageFile] = useState<File | null>(null)
  const [muralImagePreview, setMuralImagePreview] = useState<string | null>(null)
  const [muralFormError, setMuralFormError] = useState<string | null>(null)
  const muralFileInputRef = useRef<HTMLInputElement>(null)

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

  // Carregar murais
  useEffect(() => {
    carregarMurals()
  }, [muralFiltro])

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

  // ========== FUNÇÕES DO MURAL ==========

  async function carregarMurals() {
    try {
      setMuralLoading(true)
      setMuralError(null)
      const targetRole = muralFiltro === "todos" ? undefined : muralFiltro
      const murais = await getMurals(targetRole)
      setMurals(murais)
    } catch (err: any) {
      setMuralError(err.message || "Erro ao carregar murais")
      console.error("Erro ao carregar murais:", err)
      toast({
        variant: 'error',
        title: 'Erro ao carregar murais',
        description: err.message || "Não foi possível carregar os murais."
      })
    } finally {
      setMuralLoading(false)
    }
  }

  // Abrir modal de criação de mural
  function handleOpenMuralCreateModal() {
    setMuralForm({
      title: "",
      description: "",
      targetRole: "aluno",
      order: "",
      isActive: true,
    })
    setMuralImageFile(null)
    setMuralImagePreview(null)
    setMuralFormError(null)
    setIsMuralCreateModalOpen(true)
  }

  // Fechar modal de criação de mural
  function handleCloseMuralCreateModal() {
    setIsMuralCreateModalOpen(false)
    setMuralForm({
      title: "",
      description: "",
      targetRole: "aluno",
      order: "",
      isActive: true,
    })
    setMuralImageFile(null)
    setMuralImagePreview(null)
    setMuralFormError(null)
    if (muralFileInputRef.current) {
      muralFileInputRef.current.value = ""
    }
  }

  // Abrir modal de edição de mural
  function handleOpenMuralEditModal(mural: Mural) {
    setMuralEditando(mural)
    setMuralForm({
      title: mural.title,
      description: mural.description || "",
      targetRole: mural.targetRole,
      order: mural.order?.toString() || "",
      isActive: mural.isActive,
    })
    setMuralImageFile(null)
    setMuralImagePreview(mural.imageUrl)
    setMuralFormError(null)
    setIsMuralEditModalOpen(true)
  }

  // Fechar modal de edição de mural
  function handleCloseMuralEditModal() {
    setIsMuralEditModalOpen(false)
    setMuralEditando(null)
    setMuralForm({
      title: "",
      description: "",
      targetRole: "aluno",
      order: "",
      isActive: true,
    })
    setMuralImageFile(null)
    setMuralImagePreview(null)
    setMuralFormError(null)
    if (muralFileInputRef.current) {
      muralFileInputRef.current.value = ""
    }
  }

  // Handler para mudança de imagem
  function handleMuralImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setMuralFormError("Tipo de arquivo não permitido. Apenas imagens (jpg, jpeg, png, webp) são aceitas.")
      return
    }

    // Validar tamanho (máximo 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setMuralFormError("O arquivo deve ter no máximo 10MB.")
      return
    }

    setMuralImageFile(file)
    setMuralFormError(null)

    // Criar preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setMuralImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Remover imagem selecionada
  function handleRemoveMuralImage() {
    setMuralImageFile(null)
    if (muralEditando) {
      setMuralImagePreview(muralEditando.imageUrl)
    } else {
      setMuralImagePreview(null)
    }
    if (muralFileInputRef.current) {
      muralFileInputRef.current.value = ""
    }
  }

  // Criar mural
  async function handleCreateMural() {
    if (!muralForm.title.trim()) {
      setMuralFormError("O título é obrigatório")
      return
    }

    if (!muralImageFile && !isMuralEditModalOpen) {
      setMuralFormError("A imagem é obrigatória")
      return
    }

    if (!muralImageFile) {
      setMuralFormError("A imagem é obrigatória")
      return
    }

    try {
      setMuralFormError(null)
      
      // Se "ambos" foi selecionado, criar dois murais
      if (muralForm.targetRole === "ambos") {
        const basePayload = {
          title: muralForm.title.trim(),
          description: muralForm.description.trim() || undefined,
          order: muralForm.order ? parseInt(muralForm.order) : undefined,
          isActive: muralForm.isActive,
        }

        // Criar para aluno
        const payloadAluno: CreateMuralDto = {
          ...basePayload,
          targetRole: "aluno",
        }
        await createMural(payloadAluno, muralImageFile)

        // Criar para professor (usar a mesma imagem)
        const payloadProfessor: CreateMuralDto = {
          ...basePayload,
          targetRole: "professor",
        }
        await createMural(payloadProfessor, muralImageFile)

        await carregarMurals()
        handleCloseMuralCreateModal()
        toast({
          variant: 'success',
          title: 'Murais criados',
          description: `Os murais "${muralForm.title.trim()}" foram criados com sucesso para aluno e professor.`,
        })
      } else {
        // Criar para um único role
        const payload: CreateMuralDto = {
          title: muralForm.title.trim(),
          description: muralForm.description.trim() || undefined,
          targetRole: muralForm.targetRole as MuralTargetRole,
          order: muralForm.order ? parseInt(muralForm.order) : undefined,
          isActive: muralForm.isActive,
        }

        const novo = await createMural(payload, muralImageFile)
        await carregarMurals()
        handleCloseMuralCreateModal()
        toast({
          variant: 'success',
          title: 'Mural criado',
          description: `O mural "${novo.title}" foi criado com sucesso.`,
        })
      }
    } catch (err: any) {
      setMuralFormError(err.message || "Erro ao criar mural")
      toast({
        variant: 'error',
        title: 'Erro ao criar mural',
        description: err.message || "Não foi possível criar o mural."
      })
    }
  }

  // Atualizar mural
  async function handleUpdateMural() {
    if (!muralEditando) return

    if (!muralForm.title.trim()) {
      setMuralFormError("O título é obrigatório")
      return
    }

    try {
      setMuralFormError(null)
      const payload: UpdateMuralDto = {
        title: muralForm.title.trim(),
        description: muralForm.description.trim() || undefined,
        targetRole: muralForm.targetRole,
        order: muralForm.order ? parseInt(muralForm.order) : undefined,
        isActive: muralForm.isActive,
      }

      const atualizado = await updateMural(muralEditando.id, payload, muralImageFile || undefined)
      await carregarMurals()
      handleCloseMuralEditModal()
      toast({
        variant: 'success',
        title: 'Mural atualizado',
        description: `O mural foi atualizado com sucesso.`,
      })
    } catch (err: any) {
      setMuralFormError(err.message || "Erro ao atualizar mural")
      toast({
        variant: 'error',
        title: 'Erro ao atualizar mural',
        description: err.message || "Não foi possível atualizar o mural."
      })
    }
  }

  // Excluir mural
  async function confirmarExclusaoMural() {
    if (!muralExcluindo) return

    try {
      setMuralError(null)
      await deleteMural(muralExcluindo.id)
      await carregarMurals()
      setMuralExcluindo(null)
      toast({
        variant: 'success',
        title: 'Mural excluído',
        description: `O mural "${muralExcluindo.title}" foi excluído com sucesso.`,
      })
    } catch (err: any) {
      setMuralError(err.message || "Erro ao excluir mural")
      toast({
        variant: 'error',
        title: 'Erro ao excluir mural',
        description: err.message || "Não foi possível excluir o mural."
      })
      setMuralExcluindo(null)
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
              <TabsTrigger value="mural-institucional">Mural Institucional</TabsTrigger>
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

            <TabsContent value="mural-institucional" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Mural Institucional
                      </CardTitle>
                      <CardDescription>Gerencie as imagens exibidas nos dashboards de alunos e professores</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={muralFiltro} onValueChange={(value) => setMuralFiltro(value as MuralTargetRole | "todos")}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="aluno">Aluno</SelectItem>
                          <SelectItem value="professor">Professor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleOpenMuralCreateModal}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Imagem
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {muralError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                      {muralError}
                    </div>
                  )}

                  {muralLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Carregando murais...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {murals.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum mural cadastrado.</p>
                          <p className="text-sm mt-2">Clique em "Adicionar Imagem" para criar o primeiro.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {murals.map((mural) => (
                            <Card key={mural.id} className="border-l-4 border-l-blue-500 overflow-hidden">
                              <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800">
                                <Image
                                  src={mural.imageUrl}
                                  alt={mural.title}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                {!mural.isActive && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white font-semibold">Inativo</span>
                                  </div>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg line-clamp-1">{mural.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      mural.targetRole === 'aluno' 
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                    }`}>
                                      {mural.targetRole === 'aluno' ? 'Aluno' : 'Professor'}
                                    </span>
                                  </div>
                                  {mural.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">{mural.description}</p>
                                  )}
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Ordem: {mural.order ?? 'N/A'}</span>
                                    <span>{formatarData(mural.createdAt)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 pt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenMuralEditModal(mural)}
                                      title="Editar mural"
                                      className="flex-1"
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Editar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setMuralExcluindo(mural)}
                                      title="Excluir mural"
                                      className="flex-1"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Excluir
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
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

      {/* Modal de Criação de Mural */}
      <Dialog open={isMuralCreateModalOpen} onOpenChange={(open) => {
        if (!open) handleCloseMuralCreateModal()
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Imagem ao Mural</DialogTitle>
            <DialogDescription>
              Adicione uma nova imagem para exibir nos dashboards
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mural-title-create">Título *</Label>
              <Input
                id="mural-title-create"
                placeholder="Título do mural"
                value={muralForm.title}
                onChange={(e) => {
                  setMuralForm({ ...muralForm, title: e.target.value })
                  setMuralFormError(null)
                }}
                className={muralFormError && !muralForm.title.trim() ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mural-description-create">Descrição</Label>
              <Textarea
                id="mural-description-create"
                placeholder="Descrição do mural (opcional)"
                value={muralForm.description}
                onChange={(e) => {
                  setMuralForm({ ...muralForm, description: e.target.value })
                  setMuralFormError(null)
                }}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mural-targetRole-create">Destino *</Label>
              <Select
                value={muralForm.targetRole}
                onValueChange={(value) => {
                  setMuralForm({ ...muralForm, targetRole: value as MuralTargetRole | "ambos" })
                  setMuralFormError(null)
                }}
              >
                <SelectTrigger id="mural-targetRole-create">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluno">Aluno</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mural-order-create">Ordem</Label>
                <Input
                  id="mural-order-create"
                  type="number"
                  placeholder="Ordem de exibição"
                  value={muralForm.order}
                  onChange={(e) => {
                    setMuralForm({ ...muralForm, order: e.target.value })
                    setMuralFormError(null)
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mural-isActive-create" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="mural-isActive-create"
                    type="checkbox"
                    checked={muralForm.isActive}
                    onChange={(e) => {
                      setMuralForm({ ...muralForm, isActive: e.target.checked })
                      setMuralFormError(null)
                    }}
                    className="w-4 h-4"
                  />
                  <span>Ativo</span>
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mural-image-create">Imagem *</Label>
              <div className="space-y-3">
                {muralImagePreview && (
                  <div className="relative w-full h-48 border rounded-md overflow-hidden">
                    <Image
                      src={muralImagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveMuralImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    ref={muralFileInputRef}
                    id="mural-image-create"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleMuralImageChange}
                    className={muralFormError && !muralImageFile ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => muralFileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: JPG, JPEG, PNG, WEBP (máximo 10MB)
                </p>
              </div>
            </div>

            {muralFormError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                {muralFormError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseMuralCreateModal}>
              Cancelar
            </Button>
            <Button onClick={handleCreateMural}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Mural */}
      <Dialog open={isMuralEditModalOpen} onOpenChange={(open) => {
        if (!open) handleCloseMuralEditModal()
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Mural</DialogTitle>
            <DialogDescription>
              Atualize as informações do mural
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mural-title-edit">Título *</Label>
              <Input
                id="mural-title-edit"
                placeholder="Título do mural"
                value={muralForm.title}
                onChange={(e) => {
                  setMuralForm({ ...muralForm, title: e.target.value })
                  setMuralFormError(null)
                }}
                className={muralFormError && !muralForm.title.trim() ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mural-description-edit">Descrição</Label>
              <Textarea
                id="mural-description-edit"
                placeholder="Descrição do mural (opcional)"
                value={muralForm.description}
                onChange={(e) => {
                  setMuralForm({ ...muralForm, description: e.target.value })
                  setMuralFormError(null)
                }}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mural-targetRole-edit">Destino *</Label>
              <Select
                value={muralForm.targetRole}
                onValueChange={(value) => {
                  setMuralForm({ ...muralForm, targetRole: value as MuralTargetRole })
                  setMuralFormError(null)
                }}
              >
                <SelectTrigger id="mural-targetRole-edit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluno">Aluno</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mural-order-edit">Ordem</Label>
                <Input
                  id="mural-order-edit"
                  type="number"
                  placeholder="Ordem de exibição"
                  value={muralForm.order}
                  onChange={(e) => {
                    setMuralForm({ ...muralForm, order: e.target.value })
                    setMuralFormError(null)
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mural-isActive-edit" className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="mural-isActive-edit"
                    type="checkbox"
                    checked={muralForm.isActive}
                    onChange={(e) => {
                      setMuralForm({ ...muralForm, isActive: e.target.checked })
                      setMuralFormError(null)
                    }}
                    className="w-4 h-4"
                  />
                  <span>Ativo</span>
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mural-image-edit">Imagem {muralImageFile ? "(nova)" : "(atual)"}</Label>
              <div className="space-y-3">
                {muralImagePreview && (
                  <div className="relative w-full h-48 border rounded-md overflow-hidden">
                    <Image
                      src={muralImagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                    {muralImageFile && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveMuralImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    ref={muralFileInputRef}
                    id="mural-image-edit"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleMuralImageChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => muralFileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {muralImageFile ? "Alterar" : "Selecionar Nova"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para manter a imagem atual. Formatos aceitos: JPG, JPEG, PNG, WEBP (máximo 10MB)
                </p>
              </div>
            </div>

            {muralFormError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                {muralFormError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseMuralEditModal}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateMural}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão de Mural */}
      <ModalConfirmacao
        isOpen={!!muralExcluindo}
        title="Excluir Mural"
        description={
          muralExcluindo
            ? `Tem certeza que deseja excluir o mural "${muralExcluindo.title}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmarExclusaoMural}
        onClose={() => setMuralExcluindo(null)}
      />
    </div>
  )
}

