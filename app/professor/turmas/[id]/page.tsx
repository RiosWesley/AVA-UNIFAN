"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "@/components/layout/sidebar"
import { ArrowLeft, Users, FileText, CheckCircle, Plus, Edit, Trash2, Download, Upload, X, MessageSquare, MessageCircle, Video, CalendarClock } from "lucide-react"
import Link from "next/link"
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useRef, useState, useEffect } from 'react'
import { toast, toastInfo, toastImportSuccess, toastImportError, toastImportWarning } from '@/components/ui/toast'
import { ModalEntregasAtividade, ModalAtividade, ModalDeletarAtividade, ModalMaterial, ModalDetalhesAluno, ModalForum, ModalDiscussaoForum, ModalVideoChamada } from '@/components/modals'
import { useParams } from "next/navigation"
import { getClassById } from "@/src/services/ClassesService"
import { getEnrollmentsByClass, EnrollmentDTO } from "@/src/services/enrollmentsService"
import { listActivitiesByClass, createActivity, updateActivity, deleteActivity, listSubmissionsByActivity, ActivityDTO, ActivityUnit, completeActivityForStudent } from "@/src/services/activitiesService"
import { listMaterialsByClass, createMaterial, updateMaterial, deleteMaterial, MaterialDTO } from "@/src/services/materialsService"
import { listForumsByClass, createForum, updateForum, deleteForum, ForumDTO } from "@/src/services/forumsService"
import { listPostsByForum, createForumPost, ForumPostDTO } from "@/src/services/forumPostsService"
import { listLiveSessionsByClass, createLiveSession, LiveSessionDTO } from "@/src/services/liveSessionsService"
import { getClassGradebook, createGradeForActivity, getActivityGradebook } from "@/src/services/gradesService"
import { getClassAttendanceTable } from "@/src/services/attendancesService"

export default function TurmaDetalhePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [notasImportadas, setNotasImportadas] = useState<Record<string, string>>({})
  const [notasDigitadas, setNotasDigitadas] = useState<Record<string, string>>({})
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [modalEntregasOpen, setModalEntregasOpen] = useState(false)
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<any>(null)
  const [modalAtividadeOpen, setModalAtividadeOpen] = useState(false)
  const [atividadeEditando, setAtividadeEditando] = useState<any>(null)
  const [modoModalAtividade, setModoModalAtividade] = useState<'criar' | 'editar'>('criar')
  const [modalDeletarOpen, setModalDeletarOpen] = useState(false)
  const [atividadeParaDeletar, setAtividadeParaDeletar] = useState<any>(null)
  const [modalMaterialOpen, setModalMaterialOpen] = useState(false)
  const [materialEditando, setMaterialEditando] = useState<any>(null)
  const [modoModalMaterial, setModoModalMaterial] = useState<'criar' | 'editar'>('criar')
  const [modalDetalhesAlunoOpen, setModalDetalhesAlunoOpen] = useState(false)
  const [alunoSelecionado, setAlunoSelecionado] = useState<any>(null)
  const params = useParams<{ id: string }>()
  const classId = (params?.id as string) ?? ""
  
  // Estados para fórum
  const [modalForumOpen, setModalForumOpen] = useState(false)
  const [forumEditando, setForumEditando] = useState<any>(null)
  const [modoModalForum, setModoModalForum] = useState<'criar' | 'editar'>('criar')
  const [modalDiscussaoOpen, setModalDiscussaoOpen] = useState(false)
  const [forumSelecionado, setForumSelecionado] = useState<any>(null)

  // Estados para videochamadas
  type VideoChamada = { id: string; titulo: string; dataHora: string; status: 'agendada' | 'disponivel' | 'encerrada'; link: string }
  const [videoChamadas, setVideoChamadas] = useState<VideoChamada[]>([])
  const [modalVideoChamadaAberto, setModalVideoChamadaAberto] = useState(false)
  const [videoChamadaSelecionada, setVideoChamadaSelecionada] = useState<VideoChamada | null>(null)

  const [turma, setTurma] = useState<{ nome: string; disciplina: string; alunos: number; mediaGeral: number; frequenciaMedia: number; }>(
    { nome: "Turma", disciplina: "-", alunos: 0, mediaGeral: 0, frequenciaMedia: 0 }
  )

  type AlunoItem = { id: string; nome: string; matricula: string; media: number; frequencia: number; situacao: string }
  const [alunos, setAlunos] = useState<AlunoItem[]>([])

  type AtividadeItem = { id: string; titulo: string; tipo: string; prazo?: string | null; entregues: number; total: number; status: "Ativa" | "Concluída"; peso?: number | null; descricao?: string | null }
  const [atividades, setAtividades] = useState<AtividadeItem[]>([])

  // Entregas dos alunos (carregadas da API)
  const [entregasAlunos, setEntregasAlunos] = useState<any[]>([])

  const [materiais, setMateriais] = useState<{ id: string; nome: string; tipo: string; data: string; descricao?: string; urls?: string[] }[]>([])

  const [forums, setForums] = useState<any[]>([])

  // Estados de Lançar Notas
  const [criarNovaAtividade, setCriarNovaAtividade] = useState(true)
  const [atividadeSelecionadaId, setAtividadeSelecionadaId] = useState<string | undefined>(undefined)
  const [avaliacaoTitulo, setAvaliacaoTitulo] = useState("")
  const [avaliacaoPeso, setAvaliacaoPeso] = useState<string>("")
  const [avaliacaoDescricao, setAvaliacaoDescricao] = useState("")

  const [enrollmentsState, setEnrollmentsState] = useState<EnrollmentDTO[]>([])

  // Busca inicial
  useEffect(() => {
    const fetchAll = async () => {
      if (!classId) return
      try {
        const [
          clazz,
          enrollments,
          gradebook,
          attendanceTable,
          acts,
          mats,
          frms,
          sessions
        ] = await Promise.all([
          getClassById(classId),
          getEnrollmentsByClass(classId),
          getClassGradebook(classId),
          getClassAttendanceTable(classId),
          listActivitiesByClass(classId),
          listMaterialsByClass(classId),
          listForumsByClass(classId),
          listLiveSessionsByClass(classId)
        ])

        const totalAlunos = enrollments.length
        setEnrollmentsState(enrollments as EnrollmentDTO[])

        const freqMap = new Map<string, number>()
        for (const row of attendanceTable || []) {
          const perc = (row.attendancePercentage ?? row.presentPercentage ?? row.frequency ?? row.percentage ?? 0)
          freqMap.set(row.enrollmentId, Number(perc))
        }

        const gradeMap = new Map<string, number>()
        const entries = gradebook?.entries || []
        for (const e of entries) {
          const grades: { activityId: string; grade: { id: string; score: number; gradedAt: Date | string | null } | null }[] = e.grades || []
          if (grades.length > 0) {
            const valid = grades.filter((g) => g.grade?.score !== undefined && g.grade?.score !== null)
            const avg = valid.length > 0 ? valid.reduce((s: number, g) => s + Number(g.grade!.score), 0) / valid.length : 0
            gradeMap.set(e.enrollmentId, Number(avg.toFixed(2)))
          } else {
            gradeMap.set(e.enrollmentId, 0)
          }
        }

        const alunosMapped: AlunoItem[] = (enrollments as EnrollmentDTO[]).map(en => {
          const matricula = en.student.usuario || en.student.cpf || en.student.email
          const media = gradeMap.get(en.id) ?? 0
          const frequencia = Math.round(freqMap.get(en.id) ?? 0)
          const situacao = media >= 6 && frequencia >= 75 ? "Aprovado" : media < 6 ? "Recuperação" : "Reprovado"
          return { id: en.id, nome: en.student.name, matricula, media, frequencia, situacao }
        })

        const mediaGeral = alunosMapped.length > 0 ? Number((alunosMapped.reduce((s, a) => s + a.media, 0) / alunosMapped.length).toFixed(2)) : 0
        const frequenciaMedia = alunosMapped.length > 0 ? Math.round(alunosMapped.reduce((s, a) => s + a.frequencia, 0) / alunosMapped.length) : 0

        setTurma({
          nome: clazz.code || clazz.discipline?.name || "Turma",
          disciplina: clazz.discipline?.name || "-",
          alunos: totalAlunos,
          mediaGeral,
          frequenciaMedia
        })
        setAlunos(alunosMapped)

        // Buscar contagem de entregas por atividade
        const submissionsCounts: number[] = await Promise.all(
          (acts as ActivityDTO[]).map(async (a) => {
            try {
              const subs = await listSubmissionsByActivity(a.id)
              return Array.isArray(subs) ? subs.length : 0
            } catch {
              return 0
            }
          })
        )

        const atividadesMapped: AtividadeItem[] = (acts as ActivityDTO[]).map((a, idx) => {
          const prazo = a.dueDate || null
          const status: "Ativa" | "Concluída" = prazo ? (new Date(prazo).getTime() < Date.now() ? "Concluída" : "Ativa") : "Ativa"
          return {
            id: a.id,
            titulo: a.title,
            tipo: a.type === 'exam' ? 'Avaliação' : a.type === 'project' ? 'Projeto' : 'Exercício',
            prazo,
            entregues: submissionsCounts[idx] ?? 0,
            total: totalAlunos,
            status,
            peso: a.maxScore ?? null,
            descricao: a.description ?? null
          }
        })
        setAtividades(atividadesMapped)

        const materiaisMapped = (mats as MaterialDTO[]).map(m => {
          const tipo = (m.fileUrl && m.fileUrl.length > 0) ? (m.fileUrl[0].split('.').pop() || '').toUpperCase() : 'ARQ'
          return { id: m.id, nome: m.title, tipo, data: new Date(m.uploadedAt).toLocaleDateString('pt-BR'), descricao: m.description ?? '', urls: m.fileUrl ?? [] }
        })
        setMateriais(materiaisMapped)

        // Fóruns: carregar lista e contar comentários sob demanda (quando abrir)
        const forumsMapped = (frms as ForumDTO[]).map(f => ({
          id: f.id,
          titulo: f.title,
          descricao: f.description ?? '',
          autor: f.createdBy?.name ?? 'Professor',
          dataCriacao: f.createdAt ? new Date(f.createdAt).toLocaleDateString('pt-BR') : '',
          comentarios: [] as any[]
        }))
        setForums(forumsMapped)

        const sessionsMapped: VideoChamada[] = (sessions as LiveSessionDTO[]).map(s => {
          const now = Date.now()
          const start = new Date(s.startAt).getTime()
          const end = new Date(s.endAt).getTime()
          const status: 'agendada' | 'disponivel' | 'encerrada' = now < start ? 'agendada' : (now >= start && now <= end ? 'disponivel' : 'encerrada')
          return { id: s.id, titulo: s.title, dataHora: s.startAt, status, link: s.meetingUrl || '#' }
        })
        setVideoChamadas(sessionsMapped)
      } catch (e: any) {
        console.error(e)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar informações da turma."
        })
      }
    }
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId])

  const generateExcelModel = () => {
    // Preparar dados para o Excel
    const excelData = [
      ['Nº DE MATRÍCULA', 'NOME COMPLETO', 'NOTA'], // Cabeçalhos
      ...alunos.map(aluno => [aluno.matricula, aluno.nome, '']) // Dados dos alunos
    ]

    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(excelData)

    // Definir largura das colunas
    worksheet['!cols'] = [
      { wch: 15 }, // Largura coluna matrícula
      { wch: 30 }, // Largura coluna nome
      { wch: 10 }  // Largura coluna nota
    ]

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Notas')

    // Gerar arquivo Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    // Nome do arquivo
    const fileName = `modelo_notas_${turma.nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`

    // Download do arquivo
    saveAs(blob, fileName)
  }

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Verificar se é um arquivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toastImportError(
        'Formato inválido',
        'Por favor, selecione um arquivo Excel (.xlsx ou .xls)'
      )
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        // Pegar a primeira worksheet
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]

        // Converter para array de arrays
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][]

        // Verificar se tem dados
        if (jsonData.length < 2) {
          toastImportError(
            'Arquivo vazio',
            'O arquivo Excel está vazio ou não contém dados válidos'
          )
          return
        }

        // Verificar cabeçalhos
        const headers = jsonData[0] as string[]
        const expectedHeaders = ['Nº DE MATRÍCULA', 'NOME COMPLETO', 'NOTA']

        const hasValidHeaders = expectedHeaders.every(header =>
          headers.some(h => h?.toString().toUpperCase().includes(header.replace('Nº DE ', '').replace(' COMPLETO', '')))
        )

        if (!hasValidHeaders) {
          toastImportError(
            'Formato inválido',
            'O arquivo Excel não possui o formato esperado. Use o modelo exportado.'
          )
          return
        }

        // Processar dados
        const notasProcessadas: Record<string, string> = {}
        const errosValidacao: string[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as (string | number)[]
          if (row.length >= 3) {
            const matricula = row[0]?.toString().trim()
            const nome = row[1]?.toString().trim()
            const nota = row[2]?.toString().trim()

            if (matricula && nome) {
              // Validar nota
              const notaNumerica = parseFloat(nota || '')
              if (nota && (isNaN(notaNumerica) || notaNumerica < 0 || notaNumerica > 10)) {
                errosValidacao.push(`Nota inválida para ${nome}: ${nota}`)
                continue
              }

              // Encontrar o aluno correspondente
              const aluno = alunos.find(a =>
                a.matricula === matricula ||
                a.nome.toLowerCase() === nome.toLowerCase()
              )

              if (aluno) {
                notasProcessadas[aluno.id] = nota || ''
              } else {
                errosValidacao.push(`Aluno não encontrado: ${nome} (${matricula})`)
              }
            }
          }
        }

        // Atualizar estado com as notas importadas
        setNotasImportadas(notasProcessadas)
        setNotasDigitadas({})

        const count = Object.keys(notasProcessadas).length
        if (count > 0) {
          toastImportSuccess(count, errosValidacao)
        } else {
          if (errosValidacao.length > 0) {
            toastImportWarning(
              'Nenhuma nota válida encontrada',
              `Foram encontrados ${errosValidacao.length} erro(s):\n${errosValidacao.slice(0, 3).join('\n')}${errosValidacao.length > 3 ? '\n...' : ''}`
            )
          } else {
            toastImportWarning(
              'Nenhuma nota válida encontrada',
              'O arquivo Excel não contém dados válidos para importação.'
            )
          }
        }

      } catch (error) {
        console.error('Erro ao processar arquivo:', error)
        toastImportError(
          'Erro no processamento',
          'Erro ao processar o arquivo Excel. Verifique se o formato está correto.'
        )
      }
    }

    reader.readAsArrayBuffer(file)

    // Limpar o input para permitir re-upload do mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const clearImportedNotes = () => {
    setNotasImportadas({})
    setNotasDigitadas({})
    toastInfo('Notas limpas', 'Todas as notas importadas foram removidas com sucesso.')
  }

  const handleVerEntregas = (atividade: any) => {
    setAtividadeSelecionada(atividade)
    // Carregar submissions da atividade e compor lista com todos os alunos da turma
    const carregar = async () => {
      try {
        const [submissions, gradebook] = await Promise.all([
          listSubmissionsByActivity(String(atividade.id)),
          getActivityGradebook(String(atividade.id))
        ])
        const gradesMap = new Map<string, number>()
        const entriesGb = gradebook?.entries || []
        entriesGb.forEach((e: any) => {
          const score = e?.grade?.score
          if (e?.enrollmentId && typeof score === 'number') {
            gradesMap.set(e.enrollmentId, Number(score))
          }
        })
        const subByStudentId = new Map<string, any>()
        submissions.forEach((s: any) => {
          const studentId = s?.student?.id
          if (studentId) subByStudentId.set(studentId, s)
        })
        const lista = enrollmentsState.map((en, idx) => {
          const sub = subByStudentId.get(en.student.id)
          const urls: string[] = (Array.isArray(sub?.files) && sub.files?.length ? sub.files : (Array.isArray(sub?.fileUrls) ? sub.fileUrls : [])) as string[]
          const firstFileUrl: string | undefined = urls.length > 0 ? urls[0] : undefined
          const nomeArquivo = firstFileUrl ? firstFileUrl.split('/').pop() : undefined
          const ext = nomeArquivo?.split('.').pop()?.toUpperCase()
          return {
            // Mantém compatibilidade com o Modal (id sequencial numérico),
            // e enviaremos o enrollmentId correto no salvamento
            id: idx + 1,
            enrollmentId: en.id,
            submissionId: sub?.id,
            nome: en.student.name,
            matricula: en.student.usuario || en.student.cpf || en.student.email,
            entregou: !!sub,
            dataEntrega: sub?.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('pt-BR') : undefined,
            arquivo: firstFileUrl ? {
              nome: nomeArquivo,
              tamanho: undefined,
              tipo: ext || 'ARQ',
              url: firstFileUrl
            } : undefined,
            arquivos: urls?.map((u) => {
              const n = u.split('/').pop()
              const e = n?.split('.').pop()?.toUpperCase()
              return { nome: n || 'arquivo', url: u, tipo: e || 'ARQ' }
            }) || [],
            nota: gradesMap.get(en.id) ?? 0
          }
        })
        setEntregasAlunos(lista)
      } catch (e) {
        setEntregasAlunos([])
      } finally {
        setModalEntregasOpen(true)
      }
    }
    carregar()
  }

  const handleSalvarNotas = async (notas: Record<number, number>) => {
    try {
      if (!atividadeSelecionada?.id) {
        toast({ title: "Selecione uma atividade", description: "Não foi possível identificar a atividade." })
        return
      }
      const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      const entries = Object.entries(notas)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([rowId, score]) => {
          const linha = entregasAlunos.find((l) => String(l.id) === String(rowId) || l.enrollmentId === rowId)
          const finalEnrollmentId = uuidV4.test(String(rowId)) ? String(rowId) : (linha?.enrollmentId || linha?.id)
          return [String(finalEnrollmentId), Number(score)] as [string, number]
        })
        .filter(([enrollmentId]) => !!enrollmentId)
      if (entries.length === 0) {
        toastImportWarning('Nenhuma nota informada', 'Preencha notas antes de salvar.')
        return
      }
      // Salvar com upsert (create -> se existir, update)
      const { findGrades, updateGrade } = await import('@/src/services/gradesService')
      const results = await Promise.allSettled(
        entries.map(async ([enrollmentId, score]) => {
          try {
            await createGradeForActivity(String(atividadeSelecionada.id), {
              enrollmentId: String(enrollmentId),
              score: Number(score),
            })
          } catch {
            const existentes = await findGrades({ enrollmentId: String(enrollmentId), activityId: String(atividadeSelecionada.id) })
            const existente = Array.isArray(existentes) ? existentes[0] : undefined
            if (existente?.id) {
              await updateGrade(existente.id, { score: Number(score) })
            } else {
              throw new Error('Falha ao criar/atualizar nota')
            }
          }
        }),
      )
      const ok = results.filter(r => r.status === 'fulfilled').length
      const fail = results.length - ok
      if (ok > 0) {
        toast({ title: "Notas salvas", description: `${ok} nota(s) salva(s) com sucesso!${fail > 0 ? ` • ${fail} falhou(aram)` : ""}` })
        // Fechar modal automaticamente após salvar com sucesso
        setModalEntregasOpen(false)
        setAtividadeSelecionada(null)
      }
      if (fail > 0 && ok === 0) {
        const firstError = (results.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined)?.reason?.message
        toast({ title: "Erro ao salvar notas", description: firstError || "Tente novamente." })
      }
    } catch (e) {
      const msg = (e as any)?.message
      toast({ title: "Erro ao salvar notas", description: msg || "Tente novamente." })
    }
  }

  const handleNovaAtividade = () => {
    setModoModalAtividade('criar')
    setAtividadeEditando(null)
    setModalAtividadeOpen(true)
  }

  const handleEditarAtividade = (atividade: any) => {
    setModoModalAtividade('editar')
    setAtividadeEditando(atividade)
    setModalAtividadeOpen(true)
  }

  const handleSalvarAtividade = (atividade: any) => {
    // Persistir criação/edição de atividade
    const persist = async () => {
      try {
        if (modoModalAtividade === 'criar') {
          await createActivity({
            classId,
            title: atividade?.titulo || atividade?.title || 'Atividade',
            unit: (atividade?.unit as ActivityUnit) || '1ª Unidade',
            type: atividade?.type || 'homework',
            description: atividade?.descricao || atividade?.description,
            dueDate: atividade?.prazo,
            maxScore: atividade?.peso ? Number(atividade.peso) : undefined,
          })
        } else if (atividadeEditando?.id) {
          await updateActivity(atividadeEditando.id, {
            title: atividade?.titulo || atividade?.title,
            description: atividade?.descricao || atividade?.description,
            dueDate: atividade?.prazo,
            maxScore: atividade?.peso ? Number(atividade.peso) : undefined,
          })
        }
        const acts = await listActivitiesByClass(classId)
        const totalAlunos = alunos.length
        const atividadesMapped: AtividadeItem[] = acts.map((a: ActivityDTO) => {
          const prazo = a.dueDate || null
          const status: "Ativa" | "Concluída" = prazo ? (new Date(prazo).getTime() < Date.now() ? "Concluída" : "Ativa") : "Ativa"
          return { id: a.id, titulo: a.title, tipo: a.type, prazo, entregues: 0, total: totalAlunos, status, peso: a.maxScore ?? null, descricao: a.description ?? null }
        })
        setAtividades(atividadesMapped)
        toast({ title: "Atividade salva", description: "A atividade foi salva com sucesso!" })
      } catch (e: any) {
        toast({ title: "Erro ao salvar atividade", description: "Tente novamente." })
      } finally {
        setModalAtividadeOpen(false)
      }
    }
    persist()
  }

  const handleExcluirAtividade = (atividade: any) => {
    setAtividadeParaDeletar(atividade)
    setModalDeletarOpen(true)
  }

  const handleConfirmarExclusao = (itemId: number) => {
    const excluir = async () => {
      try {
        await deleteActivity(String(itemId))
        const acts = await listActivitiesByClass(classId)
        const totalAlunos = alunos.length
        const atividadesMapped: AtividadeItem[] = acts.map((a: ActivityDTO) => {
          const prazo = a.dueDate || null
          const status: "Ativa" | "Concluída" = prazo ? (new Date(prazo).getTime() < Date.now() ? "Concluída" : "Ativa") : "Ativa"
          return { id: a.id, titulo: a.title, tipo: a.type, prazo, entregues: 0, total: totalAlunos, status, peso: a.maxScore ?? null, descricao: a.description ?? null }
        })
        setAtividades(atividadesMapped)
        toast({ title: "Item excluído", description: "Exclusão realizada com sucesso." })
      } catch (e: any) {
        toast({ title: "Erro ao excluir", description: "Não foi possível excluir." })
      } finally {
        setModalDeletarOpen(false)
        setAtividadeParaDeletar(null)
      }
    }
    excluir()
  }

  const handleNovoMaterial = () => {
    setModoModalMaterial('criar')
    setMaterialEditando(null)
    setModalMaterialOpen(true)
  }

  const handleEditarMaterial = (material: any) => {
    setModoModalMaterial('editar')
    setMaterialEditando(material)
    setModalMaterialOpen(true)
  }

  const handleSalvarMaterial = (material: any) => {
    const persist = async () => {
      try {
        if (modoModalMaterial === 'criar') {
          const created = await createMaterial({
            classId,
            title: material?.nome || 'Material',
            description: material?.descricao,
            fileUrl: material?.fileUrl,
          })
          if (material?.arquivo?.file) {
            const { uploadMaterialAttachments } = await import('@/src/services/materialsService')
            await uploadMaterialAttachments(created.id, [material.arquivo.file])
          }
        } else if (materialEditando?.id) {
          const updated = await updateMaterial(materialEditando.id, {
            title: material?.nome,
            description: material?.descricao,
            fileUrl: material?.fileUrl,
          })
          if (material?.arquivo?.file) {
            const { uploadMaterialAttachments } = await import('@/src/services/materialsService')
            await uploadMaterialAttachments((updated as any).id ?? materialEditando.id, [material.arquivo.file])
          }
        }
        const mats = await listMaterialsByClass(classId)
        const materiaisMapped = mats.map((m: MaterialDTO) => {
          const tipo = (m.fileUrl && m.fileUrl.length > 0) ? (m.fileUrl[0].split('.').pop() || '').toUpperCase() : 'ARQ'
          return { id: m.id, nome: m.title, tipo, data: new Date(m.uploadedAt).toLocaleDateString('pt-BR'), descricao: m.description ?? '', urls: m.fileUrl ?? [] }
        })
        setMateriais(materiaisMapped)
        toast({ title: "Material salvo", description: "Operação realizada com sucesso." })
      } catch (e: any) {
        toast({ title: "Erro ao salvar", description: "Não foi possível salvar o material." })
      } finally {
        setModalMaterialOpen(false)
      }
    }
    persist()
  }

  const handleExcluirMaterial = (material: any) => {
    setAtividadeParaDeletar(material)
    setModalDeletarOpen(true)
  }

  const handleVerDetalhesAluno = (aluno: any) => {
    // Enriquecer com dados reais (studentId, email, telefone) a partir dos enrollments
    const enr = enrollmentsState.find(e => e.id === aluno.id) || enrollmentsState.find(e => e.student.name === aluno.nome)
    const alunoDetalhado = {
      ...aluno,
      id: String(aluno.id),
      studentId: enr?.student?.id,
      email: enr?.student?.email || aluno.email,
      telefone: (enr as any)?.student?.telefone || aluno.telefone,
    }
    setAlunoSelecionado(alunoDetalhado)
    setModalDetalhesAlunoOpen(true)
  }

  // Funções para fórum
  const handleNovoForum = () => {
    setModoModalForum('criar')
    setForumEditando(null)
    setModalForumOpen(true)
  }

  const handleEditarForum = (forum: any) => {
    setModoModalForum('editar')
    setForumEditando(forum)
    setModalForumOpen(true)
  }

  const handleSalvarForum = (forum: any) => {
    const persist = async () => {
      try {
        if (modoModalForum === 'editar' && forumEditando) {
          await updateForum(forumEditando.id, { title: forum.titulo, description: forum.descricao })
        } else {
          await createForum({ classId, title: forum.titulo, description: forum.descricao })
        }
        const frs = await listForumsByClass(classId)
        const forumsMapped = frs.map((f: ForumDTO) => ({
          id: f.id,
          titulo: f.title,
          descricao: f.description ?? '',
          autor: f.createdBy?.name ?? 'Professor',
          dataCriacao: f.createdAt ? new Date(f.createdAt).toLocaleDateString('pt-BR') : '',
          comentarios: [] as any[]
        }))
        setForums(forumsMapped)
        toast({ title: "Fórum salvo", description: "Operação concluída com sucesso." })
      } catch (e: any) {
        toast({ title: "Erro ao salvar fórum", description: "Tente novamente." })
      } finally {
        setModalForumOpen(false)
      }
    }
    persist()
  }

  const handleResponderDiscussao = (texto: string, parentId?: number) => {
    if (!forumSelecionado) return
    const responder = async () => {
      try {
        await createForumPost({
          forumId: forumSelecionado.id,
          content: parentId ? texto : texto,
          parentPostId: parentId ? String(parentId) : undefined
        })
        const posts: ForumPostDTO[] = await listPostsByForum(forumSelecionado.id)
        const comentarios = posts.map((p: ForumPostDTO) => ({
          id: p.id,
          autor: p.user?.name ?? 'Usuário',
          texto: p.content,
          data: new Date(p.postedAt).toLocaleString('pt-BR'),
          ...(p.parentPostId ? { parentId: p.parentPostId } : {})
        }))
        setForums(prev => prev.map(f => f.id === forumSelecionado.id ? { ...f, comentarios } : f))
        setForumSelecionado((curr: any) => curr ? { ...curr, comentarios } : curr)
      } catch (e: any) {
        toast({ title: "Erro ao responder", description: "Não foi possível enviar a resposta." })
      }
    }
    responder()
  }

  const handleVerDiscussao = (forum: any) => {
    const open = async () => {
      setForumSelecionado(forum)
      setModalDiscussaoOpen(true)
      try {
        const posts: ForumPostDTO[] = await listPostsByForum(forum.id)
        const comentarios = posts.map((p: ForumPostDTO) => ({
          id: p.id,
          autor: p.user?.name ?? 'Usuário',
          texto: p.content,
          data: new Date(p.postedAt).toLocaleString('pt-BR'),
          ...(p.parentPostId ? { parentId: p.parentPostId } : {})
        }))
        setForums(prev => prev.map(f => f.id === forum.id ? { ...f, comentarios } : f))
        setForumSelecionado((curr: any) => curr ? { ...curr, comentarios } : curr)
      } catch (e: any) {
        // silêncio, manter modal mesmo assim
      }
    }
    open()
  }

  // Detectar temas (liquid glass e dark mode)
  useEffect(() => {
    const checkThemes = () => {
      if (typeof document !== 'undefined') {
        setIsLiquidGlass(document.documentElement.classList.contains('liquid-glass'))
        setIsDarkMode(document.documentElement.classList.contains('dark'))
      }
    }

    checkThemes()

    // Observar mudanças no tema
    const observer = new MutationObserver(checkThemes)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Link href="/professor/turmas">
              <LiquidGlassButton variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </LiquidGlassButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{turma.nome}</h1>
              <p className="text-muted-foreground">
                {turma.disciplina} • {turma.alunos} alunos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Média da Turma</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{turma.mediaGeral}</div>
                <p className="text-xs text-muted-foreground">+0.3 desde o último bimestre</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{turma.frequenciaMedia}%</div>
                <p className="text-xs text-muted-foreground">Acima da média escolar</p>
              </CardContent>
            </LiquidGlassCard>

            <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atividades Pendentes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">2</div>
                <p className="text-xs text-muted-foreground">Para correção</p>
              </CardContent>
            </LiquidGlassCard>
          </div>

          <Tabs defaultValue="alunos" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="alunos">Alunos</TabsTrigger>
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
              <TabsTrigger value="materiais">Materiais</TabsTrigger>
              <TabsTrigger value="forum">Fórum</TabsTrigger>
              <TabsTrigger value="aula-online">Aula Online</TabsTrigger>
              <TabsTrigger value="notas">Lançar Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="alunos">
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                <CardHeader>
                  <CardTitle>Lista de Alunos</CardTitle>
                  <CardDescription>Desempenho individual dos alunos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alunos.map((aluno) => (
                      <div key={aluno.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{aluno.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            Média: {aluno.media} • Frequência: {aluno.frequencia}%
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              aluno.situacao === "Aprovado"
                                ? "default"
                                : aluno.situacao === "Recuperação"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {aluno.situacao}
                          </Badge>
                          <LiquidGlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerDetalhesAluno(aluno)}
                          >
                            Ver Detalhes
                          </LiquidGlassButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>

            <TabsContent value="atividades">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Atividades da Turma</h3>
                  <LiquidGlassButton onClick={handleNovaAtividade}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Atividade
                  </LiquidGlassButton>
                </div>

                {atividades.map((atividade) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={atividade.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{atividade.titulo}</CardTitle>
                          <CardDescription>
                            {atividade.tipo} • Prazo: {atividade.prazo}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={atividade.status === "Concluída" ? "default" : "secondary"}>
                            {atividade.status}
                          </Badge>
                          <LiquidGlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditarAtividade(atividade)}
                          >
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleExcluirAtividade(atividade)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Entregues: {atividade.entregues}/{atividade.total}
                        </p>
                        <LiquidGlassButton 
                          size="sm" 
                          onClick={() => handleVerEntregas(atividade)}
                        >
                          Ver Entregas
                        </LiquidGlassButton>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="materiais">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Materiais da Disciplina</h3>
                  <LiquidGlassButton onClick={handleNovoMaterial}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Material
                  </LiquidGlassButton>
                </div>

                {materiais.map((material) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={material.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-medium">{material.nome}</h4>
                            <p className="text-sm text-muted-foreground">
                              {material.tipo} • {material.data}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <LiquidGlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditarMaterial(material)}
                          >
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleExcluirMaterial(material)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="forum">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Fórum da Turma</h3>
                  <LiquidGlassButton onClick={handleNovoForum}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Fórum
                  </LiquidGlassButton>
                </div>

                {forums.map((forum) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={forum.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{forum.titulo}</CardTitle>
                          <CardDescription>
                            Criado por {forum.autor} em {forum.dataCriacao}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            {forum.comentarios.length} comentários
                          </Badge>
                          <LiquidGlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditarForum(forum)}
                          >
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerDiscussao(forum)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {forum.descricao}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Última atualização: {forum.comentarios[forum.comentarios.length - 1]?.data || forum.dataCriacao}
                        </span>
                        <LiquidGlassButton 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleVerDiscussao(forum)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Ver Discussão
                        </LiquidGlassButton>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="aula-online">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Aula Online
                  </h3>
                  <LiquidGlassButton onClick={async () => {
                    try {
                      const start = new Date()
                      const end = new Date(start.getTime() + 60 * 60 * 1000)
                      await createLiveSession({
                        classId,
                        title: 'Nova Videochamada',
                        startAt: start.toISOString(),
                        endAt: end.toISOString(),
                        meetingUrl: '#'
                      })
                      const sessions = await listLiveSessionsByClass(classId)
                      const sessionsMapped: VideoChamada[] = (sessions as LiveSessionDTO[]).map(s => {
                        const now = Date.now()
                        const startMs = new Date(s.startAt).getTime()
                        const endMs = new Date(s.endAt).getTime()
                        const status: 'agendada' | 'disponivel' | 'encerrada' = now < startMs ? 'agendada' : (now >= startMs && now <= endMs ? 'disponivel' : 'encerrada')
                        return { id: s.id, titulo: s.title, dataHora: s.startAt, status, link: s.meetingUrl || '#' }
                      })
                      setVideoChamadas(sessionsMapped)
                      toast({ title: "Sessão criada", description: "Videochamada criada com sucesso." })
                    } catch (e: any) {
                      toast({ title: "Erro ao criar sessão", description: "Tente novamente." })
                    }
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Videochamada
                  </LiquidGlassButton>
                </div>

                {videoChamadas.map((reuniao) => {
                  const data = new Date(reuniao.dataHora)
                  const podeEntrar = reuniao.status === 'disponivel'
                  const statusLabel = reuniao.status === 'agendada' ? 'Agendada' : reuniao.status === 'disponivel' ? 'Disponível' : 'Encerrada'
                  const statusVariant = reuniao.status === 'disponivel' ? 'default' : reuniao.status === 'agendada' ? 'secondary' : 'destructive'
                  return (
                    <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={reuniao.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{reuniao.titulo}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <CalendarClock className="h-3 w-3" />
                              {data.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusVariant as any}>{statusLabel}</Badge>
                            <LiquidGlassButton 
                              size="sm" 
                              variant={podeEntrar ? 'default' : 'outline'} 
                              disabled={!podeEntrar} 
                              onClick={() => {
                                setVideoChamadaSelecionada(reuniao)
                                setModalVideoChamadaAberto(true)
                              }}
                            >
                              <Video className="h-4 w-4 mr-2"/>
                              Entrar
                            </LiquidGlassButton>
                          </div>
                        </div>
                      </CardContent>
                    </LiquidGlassCard>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="notas">
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="mb-2">
                      <CardTitle>Lançamento de Notas</CardTitle>
                      <CardDescription>Registre as notas dos alunos</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <LiquidGlassButton
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Notas
                      </LiquidGlassButton>
                      {Object.keys(notasImportadas).length > 0 && (
                        <LiquidGlassButton
                          onClick={clearImportedNotes}
                          variant="outline"
                          className="text-destructive hover:text-destructive border-destructive/50 hover:border-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Limpar Importado
                        </LiquidGlassButton>
                      )}
                      <LiquidGlassButton onClick={generateExcelModel} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Modelo Excel
                      </LiquidGlassButton>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="avaliacao" className="mb-2">Tipo de Avaliação</Label>
                        <Input id="avaliacao" placeholder="Ex: Prova Bimestral" value={avaliacaoTitulo} onChange={e => setAvaliacaoTitulo(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="peso" className="mb-2">Peso</Label>
                        <Input id="peso" type="number" placeholder="Ex: 4.0" value={avaliacaoPeso} onChange={e => setAvaliacaoPeso(e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="descricao" className="mb-2">Descrição</Label>
                      <Textarea id="descricao" placeholder="Descrição da avaliação..." value={avaliacaoDescricao} onChange={e => setAvaliacaoDescricao(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input id="criarNova" type="checkbox" checked={criarNovaAtividade} onChange={e => setCriarNovaAtividade(e.target.checked)} />
                        <Label htmlFor="criarNova">Criar nova atividade (exam)</Label>
                      </div>
                      {!criarNovaAtividade && (
                        <div>
                          <Label htmlFor="atividadeExistente" className="mb-2">Atividade existente</Label>
                          <select id="atividadeExistente" className="w-full border rounded px-2 py-2 bg-background" value={atividadeSelecionadaId} onChange={e => setAtividadeSelecionadaId(e.target.value)}>
                            <option value="">Selecione...</option>
                            {atividades.map(a => (
                              <option key={a.id} value={a.id}>{a.titulo}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Notas dos Alunos</h4>
                        {Object.keys(notasImportadas).length > 0 && (
                          <Badge
                            variant="default"
                            className="bg-accent/20 text-accent-foreground hover:bg-accent/30 border border-accent/30"
                          >
                            ✅ {Object.keys(notasImportadas).length} notas importadas
                          </Badge>
                        )}
                      </div>
                      {alunos.map((aluno) => (
                        <div
                          key={aluno.id}
                          className={`flex items-center justify-between p-3 border rounded-lg transition-all duration-200 ${
                            notasImportadas[aluno.id]
                              ? isLiquidGlass
                                ? 'imported-note-container'
                                : 'border-accent/50 bg-accent/5 hover:border-accent/70'
                              : 'border-border hover:border-border/80'
                          }`}
                        >
                          <div className="flex-1">
                            <span className="font-medium">{aluno.nome}</span>
                            <p className="text-sm text-muted-foreground">Matrícula: {aluno.matricula}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="0.0"
                              className={`w-20 transition-all duration-200 ${
                                notasImportadas[aluno.id]
                                  ? isLiquidGlass
                                    ? 'imported-note-input'
                                    : 'border-accent/60 bg-accent/10 focus:border-accent focus:ring-accent/20'
                                  : 'border-border focus:border-ring'
                              }`}
                              min="0"
                              max="10"
                              step="0.1"
                              defaultValue={notasImportadas[aluno.id] || ''}
                              onChange={(e) => {
                                const value = e.target.value
                                setNotasDigitadas(prev => ({ ...prev, [aluno.id]: value }))
                              }}
                            />
                            {notasImportadas[aluno.id] && (
                              <CheckCircle className="h-4 w-4 text-accent animate-in fade-in duration-200" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <LiquidGlassButton className="w-full" onClick={async () => {
                      try {
                        let activityIdToUse: string | null = null
                        if (criarNovaAtividade) {
                          if (!avaliacaoTitulo) {
                            toast({ title: "Título obrigatório", description: "Informe o título da avaliação." })
                            return
                          }
                          const created = await createActivity({
                            classId,
                            title: avaliacaoTitulo,
                            unit: '1ª Unidade',
                            type: 'exam',
                            description: avaliacaoDescricao || undefined,
                            maxScore: avaliacaoPeso ? Number(avaliacaoPeso) : undefined,
                          })
                          activityIdToUse = created.id
                        } else {
                          if (!atividadeSelecionadaId) {
                            toast({ title: "Selecione uma atividade", description: "Escolha uma atividade existente ou crie uma nova." })
                            return
                          }
                          activityIdToUse = atividadeSelecionadaId
                        }
                        const notasFinais: Record<string, string> = { ...notasImportadas, ...notasDigitadas }
                        const entries = Object.entries(notasFinais).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
                        if (entries.length === 0) {
                          toastImportWarning('Nenhuma nota informada', 'Preencha ou importe notas antes de salvar.')
                          return
                        }
                        const maxAllowed = avaliacaoPeso ? Number(avaliacaoPeso) : 10
                        for (const [enrollmentId, scoreStr] of entries) {
                          const score = parseFloat(scoreStr)
                          if (Number.isNaN(score) || score < 0 || score > maxAllowed) {
                            toastImportError('Notas inválidas', `Verifique a nota do aluno (matrícula ${alunos.find(a => a.id === enrollmentId)?.matricula ?? enrollmentId}).`)
                            return
                          }
                        }
                        // Salvar em lote com upsert (create ou update)
                        const { findGrades, updateGrade } = await import('@/src/services/gradesService')
                        const results = await Promise.allSettled(
                          entries.map(async ([enrollmentId, scoreStr]) => {
                            try {
                              await createGradeForActivity(activityIdToUse!, { enrollmentId: String(enrollmentId), score: Number(scoreStr) })
                            } catch {
                              const existentes = await findGrades({ enrollmentId: String(enrollmentId), activityId: activityIdToUse! })
                              const existente = Array.isArray(existentes) ? existentes[0] : undefined
                              if (existente?.id) {
                                await updateGrade(existente.id, { score: Number(scoreStr) })
                              } else {
                                throw new Error('Falha ao criar/atualizar nota')
                              }
                            }
                          }),
                        )
                        // Marcar submissão como COMPLETED (sem anexos) para cada aluno com nota
                        const enrollmentIdToStudentId = new Map(enrollmentsState.map(e => [e.id, e.student.id]))
                        const uniqueStudentIds = Array.from(new Set(entries.map(([enrollmentId]) => String(enrollmentIdToStudentId.get(String(enrollmentId)))))).filter(Boolean) as string[]
                        await Promise.allSettled(uniqueStudentIds.map(studentId => completeActivityForStudent(activityIdToUse!, studentId)))
                        const ok = results.filter(r => r.status === 'fulfilled').length
                        const fail = results.length - ok
                        if (ok > 0) {
                          toast({ title: "Notas salvas", description: `${ok} nota(s) salva(s) com sucesso!${fail > 0 ? ` • ${fail} falhou(aram)` : ""}` })
                          // Limpar campos do formulário de Lançar Notas
                          setAvaliacaoTitulo('')
                          setAvaliacaoPeso('')
                          setAvaliacaoDescricao('')
                          setAtividadeSelecionadaId(undefined)
                          setCriarNovaAtividade(true)
                          setNotasImportadas({})
                          setNotasDigitadas({})
                          // Recarregar lista de atividades para incluir a recém-criada/atualizada
                          try {
                            const acts = await listActivitiesByClass(classId)
                            const totalAlunos = enrollmentsState.length
                            const submissionsCounts: number[] = await Promise.all(
                              (acts as ActivityDTO[]).map(async (a) => {
                                try {
                                  const subs = await listSubmissionsByActivity(a.id)
                                  return Array.isArray(subs) ? subs.length : 0
                                } catch {
                                  return 0
                                }
                              })
                            )
                            const atividadesMapped: AtividadeItem[] = (acts as ActivityDTO[]).map((a, idx) => {
                              const prazo = a.dueDate || null
                              const status: "Ativa" | "Concluída" = prazo ? (new Date(prazo).getTime() < Date.now() ? "Concluída" : "Ativa") : "Ativa"
                              return {
                                id: a.id,
                                titulo: a.title,
                                tipo: a.type === 'exam' ? 'Avaliação' : a.type === 'project' ? 'Projeto' : 'Exercício',
                                prazo,
                                entregues: submissionsCounts[idx] ?? 0,
                                total: totalAlunos,
                                status,
                                peso: a.maxScore ?? null,
                                descricao: a.description ?? null
                              }
                            })
                            setAtividades(atividadesMapped)
                          } catch {
                            // silencioso
                          }
                        }
                        if (fail > 0 && ok === 0) {
                          const firstError = (results.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined)?.reason?.message
                          toast({ title: "Erro ao lançar notas", description: firstError || "Tente novamente." })
                        }
                        setNotasImportadas({})
                        setNotasDigitadas({})
                      } catch (e: any) {
                        console.error(e)
                        toast({ title: "Erro ao lançar notas", description: "Tente novamente." })
                      }
                    }}>Salvar Notas</LiquidGlassButton>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Input file oculto para importação do Excel */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImportExcel}
        className="hidden"
      />

      {/* Modal de Entregas */}
      {atividadeSelecionada && (
        <ModalEntregasAtividade
          isOpen={modalEntregasOpen}
          onClose={() => setModalEntregasOpen(false)}
          atividade={atividadeSelecionada}
          alunos={entregasAlunos}
          onSalvarNotas={handleSalvarNotas}
        />
      )}

      {/* Modal de Atividade */}
      <ModalAtividade
        isOpen={modalAtividadeOpen}
        onClose={() => setModalAtividadeOpen(false)}
        atividade={atividadeEditando}
        onSalvar={handleSalvarAtividade}
        modo={modoModalAtividade}
      />

      {/* Modal de Material */}
      <ModalMaterial
        isOpen={modalMaterialOpen}
        onClose={() => setModalMaterialOpen(false)}
        material={materialEditando}
        onSalvar={handleSalvarMaterial}
        modo={modoModalMaterial}
      />

      {/* Modal de Detalhes do Aluno */}
      <ModalDetalhesAluno
        isOpen={modalDetalhesAlunoOpen}
        onClose={() => setModalDetalhesAlunoOpen(false)}
        aluno={alunoSelecionado}
        classId={classId}
      />

      {/* Modal de Deletar Atividade/Material */}
      <ModalDeletarAtividade
        isOpen={modalDeletarOpen}
        onClose={() => setModalDeletarOpen(false)}
        item={atividadeParaDeletar}
        tipo={atividadeParaDeletar?.titulo ? 'atividade' : 'material'}
        onConfirmarDelete={handleConfirmarExclusao}
      />
      
      {/* Modal de Fórum - Será implementado em um componente separado */}
      <ModalForum
        isOpen={modalForumOpen}
        onClose={() => setModalForumOpen(false)}
        forum={forumEditando}
        onSalvar={handleSalvarForum}
        modo={modoModalForum}
      />

      {/* Modal de Discussão - Será implementado em um componente separado */}
      <ModalDiscussaoForum
        isOpen={modalDiscussaoOpen}
        onClose={() => setModalDiscussaoOpen(false)}
        forum={forumSelecionado}
        onResponder={handleResponderDiscussao}
      />

      {/* Modal de Videochamada */}
      <ModalVideoChamada
        isOpen={modalVideoChamadaAberto}
        onClose={setModalVideoChamadaAberto}
        titulo={videoChamadaSelecionada?.titulo}
        dataHora={videoChamadaSelecionada?.dataHora}
      />
    </div>
  )
}
