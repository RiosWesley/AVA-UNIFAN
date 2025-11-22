"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from "@/src/services/departmentsService"

interface Usuario {
  id: string
  nome: string
  email: string
}

interface ModalDepartamentoProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: CreateDepartmentDto | UpdateDepartmentDto, isEdit: boolean) => void
  department?: Department | null
  coordenadores: Usuario[]
  isEditMode: boolean
  isPending?: boolean
}

export function ModalDepartamento({
  isOpen,
  onClose,
  onSave,
  department,
  coordenadores,
  isEditMode,
  isPending = false,
}: ModalDepartamentoProps) {
  const [form, setForm] = useState({
    name: "",
    coordinatorId: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isEditMode && department) {
      setForm({
        name: department.name,
        coordinatorId: department.coordinator?.id || "",
      })
    } else {
      setForm({
        name: "",
        coordinatorId: "",
      })
    }
    setErrors({})
  }, [isEditMode, department, isOpen])

  function validarForm(): boolean {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = "Nome do departamento é obrigatório"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validarForm()) return

    const payload: CreateDepartmentDto | UpdateDepartmentDto = {
      name: form.name.trim(),
      ...(form.coordinatorId ? { coordinatorId: form.coordinatorId } : {}),
    }

    onSave(payload, isEditMode)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Departamento" : "Novo Departamento"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize as informações do departamento"
              : "Preencha os dados para cadastrar um novo departamento"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Departamento *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="coordinatorId">Coordenador (opcional)</Label>
            <Select 
              value={form.coordinatorId || "none"} 
              onValueChange={(v) => setForm({ ...form, coordinatorId: v === "none" ? "" : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um coordenador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum coordenador</SelectItem>
                {coordenadores.map((coord) => (
                  <SelectItem key={coord.id} value={coord.id}>
                    {coord.nome} ({coord.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isEditMode ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

