'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LiquidGlassButton } from "@/components/liquid-glass"
import { Combobox } from "@/components/ui/combobox"

export interface DestinatarioOption {
  id: string
  label: string
}

interface ModalNovaMensagemProps {
  isOpen: boolean
  onClose: () => void
  onSend?: (payload: { destinatarioId: string | null; prioridade: string; assunto: string; mensagem: string, role: 'teacher' | 'student' | 'coordinator' | 'admin' }) => void
  currentUserId: string
  apiBaseUrl?: string
  context?: 'coordinator' | 'teacher' | 'student' | 'admin'
  defaultDestinatarioId?: string | null
}

export function ModalNovaMensagem({ isOpen, onClose, onSend, currentUserId, apiBaseUrl, context = 'coordinator', defaultDestinatarioId = null }: ModalNovaMensagemProps) {
  const [selectedDestinatarioId, setSelectedDestinatarioId] = useState<string | null>(null)
  const [prioridade, setPrioridade] = useState<string>("normal")
  const [assunto, setAssunto] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [role, setRole] = useState<'teacher' | 'student' | 'coordinator' | 'admin' | ''>(context === 'student' ? 'teacher' : '')
  const [remoteOptions, setRemoteOptions] = useState<DestinatarioOption[]>([])
  const [lastQuery, setLastQuery] = useState("")

  const API_URL = apiBaseUrl || process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? 'http://localhost:3001' : '')

  useEffect(() => {
    if (!isOpen) {
      setSelectedDestinatarioId(null)
      setPrioridade("normal")
      setAssunto("")
      setMensagem("")
      setRole(context === 'student' ? 'teacher' : '')
      setRemoteOptions([])
      setLastQuery("")
    }
  }, [isOpen, context])

  useEffect(() => {
    if (defaultDestinatarioId) {
      setSelectedDestinatarioId(defaultDestinatarioId)
    }
  }, [defaultDestinatarioId])

  const handleSearch = useCallback(async (query: string) => {
    setLastQuery(query)
    if (!role || !API_URL || !currentUserId) {
      console.log('[handleSearch] Retornando cedo:', { role, API_URL: !!API_URL, currentUserId: !!currentUserId })
      return
    }
    const q = (query ?? '').trim()
    try {
      const params = new URLSearchParams({ role, q, page: '1', limit: '10' })
      if (context === 'teacher') {
        params.set('teacherId', currentUserId)
      } else if (context === 'coordinator') {
        params.set('coordinatorId', currentUserId)
      } else if (context === 'student') {
        params.set('studentId', currentUserId)
      } // admin não precisa parâmetro extra
      
      const url = `${API_URL}/communications/recipients?${params.toString()}`
      console.log('[handleSearch] Fazendo requisição:', url)
      console.log('[handleSearch] Parâmetros:', { role, q, context, currentUserId })
      
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('[handleSearch] Resposta status:', res.status, res.statusText)
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error('[handleSearch] Erro na resposta:', errorText)
        throw new Error(`Falha ao buscar destinatários: ${res.status}`)
      }
      const json = await res.json()
      console.log('[handleSearch] Dados recebidos:', json)
      
      const opts: DestinatarioOption[] = (json?.data ?? []).map((u: any) => ({
        id: u.id,
        label: `${u.name} (${u.email})`,
      }))
      console.log('[handleSearch] Opções mapeadas:', opts)
      setRemoteOptions(opts)
    } catch (error) {
      console.error('[handleSearch] Erro ao buscar destinatários:', error)
      setRemoteOptions([])
    }
  }, [role, API_URL, currentUserId, context])

  const handleSend = async () => {
    if (!selectedDestinatarioId || !API_URL) return
    const body = {
      content: `Assunto: ${assunto}\n\n${mensagem}`,
      receiverId: selectedDestinatarioId,
    }
    await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUserId,
      },
      body: JSON.stringify(body),
    })
    onSend?.({ destinatarioId: selectedDestinatarioId, prioridade, assunto, mensagem, role: (role || 'teacher') as any })
    onClose()
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Mensagem</DialogTitle>
          <DialogDescription>Envie uma nova mensagem para alunos ou colegas</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Público</Label>
              <Select value={role} onValueChange={(v) => { 
                setRole(v as any); 
                setSelectedDestinatarioId(null); 
                setRemoteOptions([]); 
                // Se houver uma query anterior, refazer a busca com o novo role
                if (lastQuery) {
                  setTimeout(() => handleSearch(lastQuery), 0)
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o público" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Professores</SelectItem>
                  {(context !== 'teacher' && context !== 'student') && <SelectItem value="student">Alunos</SelectItem>}
                  {context !== 'teacher' && <SelectItem value="coordinator">Coordenadores</SelectItem>}
                  {context === 'admin' && <SelectItem value="admin">Administradores</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="destinatario">Destinatário</Label>
              <Combobox
                placeholder={role ? "Pesquise pelo nome ou email" : "Selecione o público primeiro"}
                options={remoteOptions}
                value={selectedDestinatarioId}
                onChange={setSelectedDestinatarioId}
                onSearch={(q) => {
                  if (!role) return
                  handleSearch(q)
                }}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select value={prioridade} onValueChange={setPrioridade}>
              <SelectTrigger>
                <SelectValue placeholder="Normal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assunto">Assunto</Label>
            <Input id="assunto" placeholder="Digite o assunto da mensagem" value={assunto} onChange={e => setAssunto(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea id="mensagem" placeholder="Digite sua mensagem..." rows={6} value={mensagem} onChange={e => setMensagem(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <LiquidGlassButton variant="outline" onClick={onClose}>Cancelar</LiquidGlassButton>
          <LiquidGlassButton onClick={handleSend} disabled={!role || !selectedDestinatarioId || !assunto || !mensagem}>Enviar Mensagem</LiquidGlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


