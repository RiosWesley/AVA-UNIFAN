"use client"

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/layout/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Users, FileText, CheckCircle, Plus, Edit, Trash2, Download, Upload, X, MessageSquare, MessageCircle, Video, CalendarClock, Monitor, MonitorStop, ChevronDown, Mic, MicOff, VideoOff } from "lucide-react"
import Link from "next/link"
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useRef, useState, useEffect, useMemo } from 'react'
import { toast, toastInfo, toastImportSuccess, toastImportError, toastImportWarning } from '@/components/ui/toast'
import { ModalEntregasAtividade, ModalAtividade, ModalDeletarAtividade, ModalMaterial, ModalDetalhesAluno, ModalForum, ModalDiscussaoForum, ModalVideoChamada, ModalVideoChamadaForm, ModalProva, ModalQuestaoProva, ModalTentativasProva, ModalDetalhesTentativa } from '@/components/modals'
import { useParams, useRouter } from "next/navigation"
import { getClassById } from "@/src/services/ClassesService"
import { getEnrollmentsByClass, EnrollmentDTO } from "@/src/services/enrollmentsService"
import { listActivitiesByClass, createActivity, updateActivity, deleteActivity, listSubmissionsByActivity, ActivityDTO, ActivityType, ActivityUnit, completeActivityForStudent, getActivityById } from "@/src/services/activitiesService"
import { listMaterialsByClass, createMaterial, updateMaterial, deleteMaterial, MaterialDTO } from "@/src/services/materialsService"
import { listForumsByClass, createForum, updateForum, deleteForum, ForumDTO } from "@/src/services/forumsService"
import { listPostsByForum, createForumPost, ForumPostDTO } from "@/src/services/forumPostsService"
import { listLiveSessionsByClass, createLiveSession, updateLiveSession, deleteLiveSession, getLiveSessionById, LiveSessionDTO, CreateLiveSessionPayload, UpdateLiveSessionPayload } from "@/src/services/liveSessionsService"
import { getClassGradebook, createGradeForActivity, getActivityGradebook } from "@/src/services/gradesService"
import { getClassAttendanceTable } from "@/src/services/attendancesService"
import { useLiveSession } from "@/src/hooks/useLiveSession"
import RemoteVideo from "@/components/layout/RemoteVideo"
import { getCurrentUser } from "@/src/services/professor-dashboard"
import { 
  ExamDTO, 
  ExamAttemptDTO,
  CreateExamPayload, 
  UpdateExamPayload, 
  CreateExamQuestionPayload, 
  UpdateExamQuestionPayload,
  listExams, 
  createExam, 
  updateExam, 
  deleteExam, 
  listExamQuestions, 
  createExamQuestion, 
  updateExamQuestion, 
  deleteExamQuestion 
} from "@/src/services/examsService"


export default function TurmaDetalhePage() {
  const router = useRouter()
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
  type VideoChamada = { id: string; titulo: string; dataHora: string; startAt: string; endAt: string; status: 'agendada' | 'disponivel' | 'encerrada'; link: string }
  const [videoChamadas, setVideoChamadas] = useState<VideoChamada[]>([])
  const [modalVideoChamadaAberto, setModalVideoChamadaAberto] = useState(false)
  const [videoChamadaSelecionada, setVideoChamadaSelecionada] = useState<VideoChamada | null>(null)
  const [modalVideoChamadaFormOpen, setModalVideoChamadaFormOpen] = useState(false)
  const [videoChamadaEditando, setVideoChamadaEditando] = useState<LiveSessionDTO | null>(null)
  const [modoModalVideoChamada, setModoModalVideoChamada] = useState<'criar' | 'editar'>('criar')

  // Estados para provas virtuais
  const [provas, setProvas] = useState<ExamDTO[]>([])
  const [modalProvaOpen, setModalProvaOpen] = useState(false)
  const [provaEditando, setProvaEditando] = useState<ExamDTO | null>(null)
  const [modoModalProva, setModoModalProva] = useState<'criar' | 'editar'>('criar')
  const [modalQuestaoOpen, setModalQuestaoOpen] = useState(false)
  const [questaoEditando, setQuestaoEditando] = useState<any>(null)
  const [modoModalQuestao, setModoModalQuestao] = useState<'criar' | 'editar'>('criar')
  const [provaSelecionadaParaQuestoes, setProvaSelecionadaParaQuestoes] = useState<ExamDTO | null>(null)
  const [questoesProva, setQuestoesProva] = useState<any[]>([])
  const [modalTentativasOpen, setModalTentativasOpen] = useState(false)
  const [provaSelecionadaParaTentativas, setProvaSelecionadaParaTentativas] = useState<ExamDTO | null>(null)
  const [modalDetalhesTentativaOpen, setModalDetalhesTentativaOpen] = useState(false)
  const [tentativaSelecionadaId, setTentativaSelecionadaId] = useState<string | null>(null)
  const [teacherId, setTeacherId] = useState<string | null>(null)

  // Estado para menu de compartilhamento de tela
  const [screenShareMenuOpen, setScreenShareMenuOpen] = useState(false)
  const screenShareMenuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (screenShareMenuRef.current && !screenShareMenuRef.current.contains(event.target as Node)) {
        setScreenShareMenuOpen(false)
      }
    }

    if (screenShareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [screenShareMenuOpen])

  const [turma, setTurma] = useState<{ nome: string; disciplina: string; alunos: number; mediaGeral: number; frequenciaMedia: number; }>(
    { nome: "Turma", disciplina: "-", alunos: 0, mediaGeral: 0, frequenciaMedia: 0 }
  )

  type AlunoItem = { id: string; nome: string; matricula: string; media: number; frequencia: number; situacao: string }
  const [alunos, setAlunos] = useState<AlunoItem[]>([])

  type AtividadeItem = { id: string; titulo: string; tipo: string; prazo?: string | null; entregues: number; total: number; status: "Ativa" | "Concluída"; peso?: number | null; descricao?: string | null; unit?: string }
  const [atividades, setAtividades] = useState<AtividadeItem[]>([])

  // Entregas dos alunos (carregadas da API)
  const [entregasAlunos, setEntregasAlunos] = useState<any[]>([])

  const [materiais, setMateriais] = useState<{ id: string; nome: string; tipo: string; data: string; descricao?: string; urls?: string[] }[]>([])

  const [forums, setForums] = useState<any[]>([])

  // Estados de Lançar Notas
  const [modoOperacao, setModoOperacao] = useState<'criar' | 'associar' | null>(null)
  const [atividadeSelecionadaId, setAtividadeSelecionadaId] = useState<string | undefined>(undefined)
  const [atividadeSelecionadaCompleta, setAtividadeSelecionadaCompleta] = useState<ActivityDTO | null>(null)
  const [avaliacaoTitulo, setAvaliacaoTitulo] = useState("")
  const [avaliacaoTipo, setAvaliacaoTipo] = useState<ActivityType>('exam')
  const [avaliacaoUnidade, setAvaliacaoUnidade] = useState<ActivityUnit | ''>('')
  const [avaliacaoStartDate, setAvaliacaoStartDate] = useState<string>("")
  const [avaliacaoDueDate, setAvaliacaoDueDate] = useState<string>("")
  const [avaliacaoPeso, setAvaliacaoPeso] = useState<string>("")
  const [avaliacaoDescricao, setAvaliacaoDescricao] = useState("")

  const [enrollmentsState, setEnrollmentsState] = useState<EnrollmentDTO[]>([])
  const [loading, setLoading] = useState(true)

  // Busca inicial
  useEffect(() => {
    const fetchAll = async () => {
      if (!classId) return
      setLoading(true)
      try {
        const [
          clazz,
          enrollments,
          gradebook,
          attendanceTable,
          acts,
          mats,
          frms,
          sessions,
          todasProvas
        ] = await Promise.all([
          getClassById(classId),
          getEnrollmentsByClass(classId),
          getClassGradebook(classId),
          getClassAttendanceTable(classId),
          listActivitiesByClass(classId),
          listMaterialsByClass(classId),
          listForumsByClass(classId),
          listLiveSessionsByClass(classId),
          listExams()
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

        // Filtrar atividades excluindo virtual_exam (que tem sua própria aba)
        const atividadesFiltradas = (acts as ActivityDTO[]).filter(a => a.type !== 'virtual_exam')
        const submissionsCountsFiltrados = atividadesFiltradas.map((a, idx) => {
          const originalIdx = (acts as ActivityDTO[]).findIndex(act => act.id === a.id)
          return submissionsCounts[originalIdx] ?? 0
        })

        const atividadesMapped: AtividadeItem[] = atividadesFiltradas.map((a, idx) => {
          const prazo = a.dueDate || null
          const status: "Ativa" | "Concluída" = prazo ? (new Date(prazo).getTime() < Date.now() ? "Concluída" : "Ativa") : "Ativa"
          return {
            id: a.id,
              titulo: a.title,
              tipo: a.type === 'exam' ? 'Prova' : a.type === 'project' ? 'Projeto' : 'Exercício',
              prazo,
            entregues: submissionsCountsFiltrados[idx] ?? 0,
            total: totalAlunos,
            status,
            peso: a.maxScore ?? null,
            descricao: a.description ?? null,
            unit: a.unit
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
          return { id: s.id, titulo: s.title, dataHora: s.startAt, startAt: s.startAt, endAt: s.endAt, status, link: s.meetingUrl || '#' }
        })
        setVideoChamadas(sessionsMapped)

        // Filtrar e carregar provas virtuais da turma
        const provasDaTurma = (todasProvas as ExamDTO[]).filter(
          (p) => p.activity?.class?.id === classId && p.activity?.type === 'virtual_exam'
        )
        setProvas(provasDaTurma)
      } catch (e: any) {
        console.error(e)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar informações da turma."
        })
      } finally {
        setLoading(false)
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

  // Função para validar maxScore por unidade
  const validarMaxScoreUnidade = async (unidade: ActivityUnit, maxScore: number | undefined): Promise<{ valido: boolean; mensagem?: string }> => {
    if (!maxScore || maxScore <= 0) {
      return { valido: true } // Se não tem maxScore, não precisa validar
    }

    try {
      const atividades = await listActivitiesByClass(classId)
      const atividadesDaUnidade = atividades.filter(a => a.unit === unidade)
      const somaAtual = atividadesDaUnidade.reduce((sum, a) => sum + (a.maxScore || 0), 0)
      const totalFinal = somaAtual + maxScore

      if (totalFinal > 10) {
        return {
          valido: false,
          mensagem: `A soma das notas para a ${unidade} não pode exceder 10 pontos. Total atual: ${somaAtual.toFixed(2)}, Nova atividade: ${maxScore.toFixed(2)}, Total final seria: ${totalFinal.toFixed(2)}`
        }
      }

      return { valido: true }
    } catch (error) {
      console.error('Erro ao validar maxScore:', error)
      return { valido: true } // Em caso de erro, deixa passar (backend vai validar)
    }
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
    // Mapear tipo da API para tipo do modal
    const tipoMap: Record<string, string> = {
      'exam': 'Avaliação',
      'homework': 'Exercício',
      'project': 'Projeto',
      'virtual_exam': 'Avaliação'
    }
    const atividadeParaEditar = {
      ...atividade,
      tipo: tipoMap[atividade.tipo] || atividade.tipo || 'Exercício',
      // Garantir que unidade seja preservada (pode vir como unit ou unidade)
      unidade: atividade.unit || atividade.unidade || '1ª Unidade',
      unit: atividade.unit || atividade.unidade || '1ª Unidade', // Preservar também como unit
      prazo: atividade.prazo || atividade.dueDate,
      peso: atividade.peso || atividade.maxScore,
      maxScore: atividade.maxScore || atividade.peso, // Preservar também como maxScore
      descricao: atividade.descricao || atividade.description,
      description: atividade.description || atividade.descricao, // Preservar também como description
      title: atividade.title || atividade.titulo, // Preservar também como title
      titulo: atividade.titulo || atividade.title // Preservar também como titulo
    }
    setModoModalAtividade('editar')
    setAtividadeEditando(atividadeParaEditar)
    setModalAtividadeOpen(true)
  }

  const handleSalvarAtividade = (atividade: any) => {
    // Persistir criação/edição de atividade
    const persist = async () => {
      try {
        // Mapear tipo do modal para tipo da API
        const tipoMap: Record<string, ActivityType> = {
          'Exercício': 'homework',
          'Avaliação': 'exam',
          'Projeto': 'project',
          'Trabalho em Grupo': 'project',
          'Pesquisa': 'homework',
          'Apresentação': 'project',
          'Outro': 'homework'
        }
        const activityType = tipoMap[atividade?.tipo] || atividade?.type || 'homework'

        // Converter data do formato YYYY-MM-DD para ISO string se necessário
        const formatDateForAPI = (dateString: string | null | undefined): string | undefined => {
          if (!dateString) return undefined
          // Se já estiver no formato ISO, retornar como está
          if (dateString.includes('T') || dateString.includes('Z')) return dateString
          // Se estiver no formato YYYY-MM-DD, converter para ISO
          try {
            const date = new Date(dateString + 'T00:00:00')
            if (isNaN(date.getTime())) return undefined
            return date.toISOString().split('T')[0] // Retorna apenas a data (YYYY-MM-DD) para o backend
          } catch {
            return undefined
          }
        }

        if (modoModalAtividade === 'criar') {
          await createActivity({
            classId,
            title: atividade?.titulo || atividade?.title || 'Atividade',
            unit: (atividade?.unidade || atividade?.unit || '1ª Unidade') as ActivityUnit,
            type: activityType,
            description: atividade?.descricao || atividade?.description,
            dueDate: formatDateForAPI(atividade?.prazo),
            maxScore: atividade?.peso ? Number(atividade.peso) : undefined,
          })
        } else if (atividadeEditando?.id) {
          await updateActivity(atividadeEditando.id, {
            title: atividade?.titulo || atividade?.title,
            description: atividade?.descricao || atividade?.description,
            dueDate: formatDateForAPI(atividade?.prazo),
            maxScore: atividade?.peso ? Number(atividade.peso) : undefined,
            unit: (atividade?.unidade || atividade?.unit) as ActivityUnit,
          })
        }
        const acts = await listActivitiesByClass(classId)
        const totalAlunos = alunos.length
        const atividadesMapped: AtividadeItem[] = acts.map((a: ActivityDTO) => {
          const prazo = a.dueDate || null
          const status: "Ativa" | "Concluída" = prazo ? (new Date(prazo).getTime() < Date.now() ? "Concluída" : "Ativa") : "Ativa"
          return { id: a.id, titulo: a.title, tipo: a.type, prazo, entregues: 0, total: totalAlunos, status, peso: a.maxScore ?? null, descricao: a.description ?? null, unit: a.unit }
        })
        setAtividades(atividadesMapped)
        toast({ title: "Atividade salva", description: "A atividade foi salva com sucesso!" })
        setModalAtividadeOpen(false)
      } catch (e: any) {
        const errorMessage = e?.message || "Tente novamente."
        // Verificar se é erro de limite de pontuação por unidade
        if (errorMessage.includes('não pode exceder') || errorMessage.includes('soma das notas')) {
          toast({ 
            title: "Limite de Pontuação Excedido", 
            description: errorMessage + "\n\nSugestão: Ajuste a pontuação máxima da atividade ou escolha outra unidade.",
            variant: "error"
          })
        } else {
          toast({ title: "Erro ao salvar atividade", description: errorMessage, variant: "error" })
        }
        // Não fechar o modal em caso de erro para permitir correção
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
          return { id: a.id, titulo: a.title, tipo: a.type, prazo, entregues: 0, total: totalAlunos, status, peso: a.maxScore ?? null, descricao: a.description ?? null, unit: a.unit }
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
      }
    }
    open()
  }

  const { 
    joinSession, 
    leaveSession, 
    isConnected,
    isScreenSharing,
    isMuted,
    isVideoOff,
    userRole,
    startScreenSharing,
    stopScreenSharing,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteStreams
  } = useLiveSession();

  const entrarNaVideoChamada = async (reuniao: VideoChamada) => {
    if (reuniao.status !== 'disponivel') return;
    
    if (!teacherId) {
      toast({ title: "Erro", description: "Não foi possível identificar o professor. Tente novamente." })
      return
    }
    
    // Obter nome do professor
    let userName: string | undefined;
    try {
      const user = await getCurrentUser();
      userName = user?.name;
      if (userName) {
        localStorage.setItem('ava:userName', userName);
      }
    } catch {
      userName = localStorage.getItem('ava:userName') || undefined;
    }
    
    joinSession(classId, teacherId, 'teacher', userName);
    
    setVideoChamadaSelecionada(reuniao);
    setModalVideoChamadaAberto(true);
    
  };
  
  const handleLeaveLiveSession = () => {
      leaveSession(); 
      setModalVideoChamadaAberto(false);
  };

  // Funções para videochamadas
  const handleNovaVideoChamada = () => {
    setModoModalVideoChamada('criar')
    setVideoChamadaEditando(null)
    setModalVideoChamadaFormOpen(true)
  }

  const handleEditarVideoChamada = async (videoChamada: VideoChamada) => {
    try {
      const session = await getLiveSessionById(videoChamada.id)
      setModoModalVideoChamada('editar')
      setVideoChamadaEditando(session)
      setModalVideoChamadaFormOpen(true)
    } catch (e: any) {
      toast({ title: "Erro ao carregar videochamada", description: "Tente novamente." })
    }
  }

  const handleSalvarVideoChamada = async (payload: CreateLiveSessionPayload | UpdateLiveSessionPayload) => {
    try {
      if (modoModalVideoChamada === 'criar') {
        await createLiveSession(payload as CreateLiveSessionPayload)
      } else if (videoChamadaEditando?.id) {
        await updateLiveSession(videoChamadaEditando.id, payload as UpdateLiveSessionPayload)
      }
      
      // Recarregar videochamadas
      const sessions = await listLiveSessionsByClass(classId)
      const sessionsMapped: VideoChamada[] = (sessions as LiveSessionDTO[]).map(s => {
        const now = Date.now()
        const start = new Date(s.startAt).getTime()
        const end = new Date(s.endAt).getTime()
        const status: 'agendada' | 'disponivel' | 'encerrada' = now < start ? 'agendada' : (now >= start && now <= end ? 'disponivel' : 'encerrada')
        return { id: s.id, titulo: s.title, dataHora: s.startAt, startAt: s.startAt, endAt: s.endAt, status, link: s.meetingUrl || '#' }
      })
      setVideoChamadas(sessionsMapped)
      
      toast({ title: "Videochamada salva", description: "A videochamada foi salva com sucesso!" })
      setModalVideoChamadaFormOpen(false)
    } catch (e: any) {
      toast({ title: "Erro ao salvar videochamada", description: e?.message || "Tente novamente." })
    }
  }

  const handleDeletarVideoChamada = async (videoChamada: VideoChamada) => {
    try {
      await deleteLiveSession(videoChamada.id)
      // Recarregar videochamadas
      const sessions = await listLiveSessionsByClass(classId)
      const sessionsMapped: VideoChamada[] = (sessions as LiveSessionDTO[]).map(s => {
        const now = Date.now()
        const start = new Date(s.startAt).getTime()
        const end = new Date(s.endAt).getTime()
        const status: 'agendada' | 'disponivel' | 'encerrada' = now < start ? 'agendada' : (now >= start && now <= end ? 'disponivel' : 'encerrada')
        return { id: s.id, titulo: s.title, dataHora: s.startAt, startAt: s.startAt, endAt: s.endAt, status, link: s.meetingUrl || '#' }
      })
      setVideoChamadas(sessionsMapped)
      toast({ title: "Videochamada excluída", description: "A videochamada foi excluída com sucesso." })
    } catch (e: any) {
      toast({ title: "Erro ao excluir videochamada", description: "Tente novamente." })
    }
  }

  // Funções para provas virtuais
  const handleNovaProva = () => {
    setModoModalProva('criar')
    setProvaEditando(null)
    setModalProvaOpen(true)
  }

  const handleEditarProva = (prova: ExamDTO) => {
    setModoModalProva('editar')
    setProvaEditando(prova)
    setModalProvaOpen(true)
  }

  const handleSalvarProva = async (payload: CreateExamPayload | UpdateExamPayload, activityData?: { title: string; description?: string; startDate?: string; dueDate?: string; maxScore?: number; unit?: ActivityUnit }) => {
    try {
      if (modoModalProva === 'criar') {
        // Criar Activity primeiro
        if (activityData) {
          const activity = await createActivity({
            classId,
            title: activityData.title,
            unit: activityData.unit || '1ª Unidade',
            type: 'virtual_exam' as const,
            description: activityData.description,
            startDate: activityData.startDate,
            dueDate: activityData.dueDate,
            maxScore: activityData.maxScore
          })
          
          // Criar Exam vinculado à Activity
          await createExam({
            ...payload,
            activityId: activity.id
          })
        } else {
          throw new Error('Dados da atividade são obrigatórios para criar prova')
        }
      } else if (provaEditando?.id) {
        await updateExam(provaEditando.id, payload)
        // Atualizar Activity - sempre atualizar quando activityData for fornecido
        if (activityData) {
          const activityIdToUpdate = provaEditando.activityId || provaEditando.activity?.id
          if (activityIdToUpdate) {
            await updateActivity(activityIdToUpdate, {
              title: activityData.title,
              description: activityData.description,
              startDate: activityData.startDate,
              dueDate: activityData.dueDate,
              maxScore: activityData.maxScore,
              unit: activityData.unit
            })
          } else {
            console.warn('ActivityId não encontrado para atualização')
          }
        }
      }
      
      // Recarregar provas
      const todasProvas = await listExams()
      const provasDaTurma = todasProvas.filter(
        (p) => p.activity?.class?.id === classId && p.activity?.type === 'virtual_exam'
      )
      setProvas(provasDaTurma)
      
      toast({ title: "Prova salva", description: "A prova foi salva com sucesso!" })
      setModalProvaOpen(false)
    } catch (e: any) {
      const errorMessage = e?.message || "Tente novamente."
      // Verificar se é erro de limite de pontuação por unidade
      if (errorMessage.includes('não pode exceder') || errorMessage.includes('soma das notas')) {
        toast({ 
          title: "Limite de Pontuação Excedido", 
          description: errorMessage + "\n\nSugestão: Ajuste a pontuação máxima da prova ou escolha outra unidade.",
          variant: "error"
        })
      } else {
        toast({ title: "Erro ao salvar prova", description: errorMessage, variant: "error" })
      }
    }
  }

  const handleDeletarProva = async (prova: ExamDTO) => {
    try {
      await deleteExam(prova.id)
      // Recarregar provas
      const todasProvas = await listExams()
      const provasDaTurma = todasProvas.filter(
        (p) => p.activity?.class?.id === classId && p.activity?.type === 'virtual_exam'
      )
      setProvas(provasDaTurma)
      toast({ title: "Prova excluída", description: "A prova foi excluída com sucesso." })
    } catch (e: any) {
      toast({ title: "Erro ao excluir prova", description: "Tente novamente." })
    }
  }

  const [modalGerenciarQuestoesOpen, setModalGerenciarQuestoesOpen] = useState(false)

  const handleGerenciarQuestoes = async (prova: ExamDTO) => {
    setProvaSelecionadaParaQuestoes(prova)
    try {
      const questoes = await listExamQuestions(prova.id)
      setQuestoesProva(questoes)
      setModalGerenciarQuestoesOpen(true)
    } catch (e: any) {
      toast({ title: "Erro ao carregar questões", description: "Tente novamente." })
    }
  }

  const handleNovaQuestao = () => {
    setModoModalQuestao('criar')
    setQuestaoEditando(null)
    setModalGerenciarQuestoesOpen(false)
    if (provaSelecionadaParaQuestoes) {
      setModalQuestaoOpen(true)
    }
  }

  const handleEditarQuestao = (questao: any) => {
    setModoModalQuestao('editar')
    setQuestaoEditando(questao)
    setModalGerenciarQuestoesOpen(false)
    setModalQuestaoOpen(true)
  }

  const handleSalvarQuestao = async (payload: CreateExamQuestionPayload | UpdateExamQuestionPayload) => {
    try {
      if (modoModalQuestao === 'criar' && provaSelecionadaParaQuestoes) {
        await createExamQuestion({
          ...payload,
          examId: provaSelecionadaParaQuestoes.id
        } as CreateExamQuestionPayload)
      } else if (questaoEditando?.id) {
        await updateExamQuestion(questaoEditando.id, payload)
      }
      
      toast({ title: "Questão salva", description: "A questão foi salva com sucesso!" })
      setModalQuestaoOpen(false)
      setQuestaoEditando(null)
      
      // Recarregar questões e reabrir modal de gerenciar questões
      if (provaSelecionadaParaQuestoes) {
        try {
          const questoes = await listExamQuestions(provaSelecionadaParaQuestoes.id)
          setQuestoesProva(questoes)
          setModalGerenciarQuestoesOpen(true)
        } catch (e) {
          // Se falhar, apenas fechar o modal de questão
        }
      }
    } catch (e: any) {
      toast({ title: "Erro ao salvar questão", description: e?.message || "Tente novamente." })
    }
  }

  const handleDeletarQuestao = async (questaoId: string) => {
    try {
      await deleteExamQuestion(questaoId)
      // Recarregar questões
      if (provaSelecionadaParaQuestoes) {
        const questoes = await listExamQuestions(provaSelecionadaParaQuestoes.id)
        setQuestoesProva(questoes)
      }
      toast({ title: "Questão excluída", description: "A questão foi excluída com sucesso." })
    } catch (e: any) {
      toast({ title: "Erro ao excluir questão", description: "Tente novamente." })
    }
  }

  const handleVerTentativas = (prova: ExamDTO) => {
    setProvaSelecionadaParaTentativas(prova)
    setModalTentativasOpen(true)
  }

  const handleVerDetalhesTentativa = (attempt: ExamAttemptDTO) => {
    setTentativaSelecionadaId(attempt.id)
    setModalDetalhesTentativaOpen(true)
    setModalTentativasOpen(false)
  }

  const handleCorrecaoSalva = () => {
    // Recarregar tentativas se necessário
    if (provaSelecionadaParaTentativas) {
      // As tentativas serão recarregadas quando o modal de tentativas for reaberto
    }
  }

  useEffect(() => {
    const checkThemes = () => {
      if (typeof document !== 'undefined') {
        setIsLiquidGlass(document.documentElement.classList.contains('liquid-glass'))
        setIsDarkMode(document.documentElement.classList.contains('dark'))
      }
    }

    checkThemes()

    const observer = new MutationObserver(checkThemes)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // Buscar usuário atual
  useEffect(() => {
    const init = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
        if (!token) {
          router.push("/")
          return
        }
        const user = await getCurrentUser()
        if (user?.id) {
          setTeacherId(user.id)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        router.push("/")
      }
    }
    init()
  }, [router])


  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="professor" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {/* Skeleton do Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
              <Skeleton className="h-9 w-24" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>

            {/* Skeleton dos Cards de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </LiquidGlassCard>
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </LiquidGlassCard>
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </LiquidGlassCard>
            </div>

            {/* Skeleton das Tabs */}
            <Tabs defaultValue="alunos" className="space-y-4 md:space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1 h-auto flex-wrap">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </TabsList>
              <TabsContent value="alunos">
                <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                  <CardHeader>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg gap-3 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <Skeleton className="h-5 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-9 w-28" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </LiquidGlassCard>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole="professor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6">
            <Link href="/professor/turmas">
              <LiquidGlassButton variant="ghost" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </LiquidGlassButton>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{turma.nome}</h1>
              <p className="text-sm md:text-base text-muted-foreground truncate">
                {turma.disciplina} • {turma.alunos} alunos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
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

          <Tabs defaultValue="alunos" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1 h-auto flex-wrap">
              <TabsTrigger value="alunos" className="text-xs sm:text-sm">Alunos</TabsTrigger>
              <TabsTrigger value="atividades" className="text-xs sm:text-sm">Atividades</TabsTrigger>
              <TabsTrigger value="materiais" className="text-xs sm:text-sm">Materiais</TabsTrigger>
              <TabsTrigger value="forum" className="text-xs sm:text-sm">Fórum</TabsTrigger>
              <TabsTrigger value="aula-online" className="text-xs sm:text-sm">Aula Online</TabsTrigger>
              <TabsTrigger value="provas-virtuais" className="text-xs sm:text-sm">Provas Virtuais</TabsTrigger>
              <TabsTrigger value="notas" className="text-xs sm:text-sm">Lançar Notas</TabsTrigger>
            </TabsList>

            <TabsContent value="alunos">
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                <CardHeader>
                  <CardTitle>Lista de Alunos</CardTitle>
                  <CardDescription>Desempenho individual dos alunos</CardDescription>
                </CardHeader>
                <CardContent>
                  {!loading && alunos.length === 0 ? (
                    <div className="p-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum aluno matriculado nesta turma</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alunos.map((aluno) => (
                      <div key={aluno.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium truncate">{aluno.nome}</h4>
                          <p className="text-sm text-muted-foreground truncate">
                            Média: {aluno.media} • Frequência: {aluno.frequencia}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                          <Badge
                            variant={
                              aluno.situacao === "Aprovado"
                                ? "default"
                                : aluno.situacao === "Recuperação"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="text-xs"
                          >
                            {aluno.situacao}
                          </Badge>
                          <LiquidGlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerDetalhesAluno(aluno)}
                            className="flex-1 sm:flex-none"
                          >
                            Ver Detalhes
                          </LiquidGlassButton>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </CardContent>
              </LiquidGlassCard>
            </TabsContent>

            <TabsContent value="atividades">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <h3 className="text-lg font-semibold">Atividades da Turma</h3>
                  <LiquidGlassButton onClick={handleNovaAtividade} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Atividade
                  </LiquidGlassButton>
                </div>

                {!loading && atividades.length === 0 ? (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma atividade cadastrada ainda</p>
                    </CardContent>
                  </LiquidGlassCard>
                ) : (
                  atividades.map((atividade) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={atividade.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg truncate">{atividade.titulo}</CardTitle>
                          <CardDescription className="truncate">
                            {atividade.tipo} • Prazo: {atividade.prazo}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={atividade.status === "Concluída" ? "default" : "secondary"} className="text-xs">
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
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <p className="text-sm text-muted-foreground">
                          Entregues: {atividade.entregues}/{atividade.total}
                        </p>
                        <LiquidGlassButton 
                          size="sm" 
                          onClick={() => handleVerEntregas(atividade)}
                          className="w-full sm:w-auto"
                        >
                          Ver Entregas
                        </LiquidGlassButton>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="materiais">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <h3 className="text-lg font-semibold">Materiais da Disciplina</h3>
                  <LiquidGlassButton onClick={handleNovoMaterial} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Material
                  </LiquidGlassButton>
                </div>

                {!loading && materiais.length === 0 ? (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum material disponível ainda</p>
                    </CardContent>
                  </LiquidGlassCard>
                ) : (
                  materiais.map((material) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={material.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium truncate">{material.nome}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {material.tipo} • {material.data}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                          <LiquidGlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditarMaterial(material)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleExcluirMaterial(material)}
                            className="flex-1 sm:flex-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="forum">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <h3 className="text-lg font-semibold">Fórum da Turma</h3>
                  <LiquidGlassButton onClick={handleNovoForum} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Fórum
                  </LiquidGlassButton>
                </div>

                {!loading && forums.length === 0 ? (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum fórum criado ainda</p>
                    </CardContent>
                  </LiquidGlassCard>
                ) : (
                  forums.map((forum) => (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={forum.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{forum.titulo}</CardTitle>
                          <CardDescription className="truncate">
                            Criado por {forum.autor} em {forum.dataCriacao}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="secondary" className="text-xs">
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
                      <p className="text-sm text-muted-foreground mb-3 break-words">
                        {forum.descricao}
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <span className="text-xs text-muted-foreground truncate">
                          Última atualização: {forum.comentarios[forum.comentarios.length - 1]?.data || forum.dataCriacao}
                        </span>
                        <LiquidGlassButton 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleVerDiscussao(forum)}
                          className="w-full sm:w-auto"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Ver Discussão
                        </LiquidGlassButton>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="aula-online">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Aula Online
                  </h3>
                  <LiquidGlassButton onClick={handleNovaVideoChamada} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Videochamada
                  </LiquidGlassButton>
                </div>

                {!loading && videoChamadas.length === 0 ? (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardContent className="p-8 text-center">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma videochamada agendada ainda</p>
                    </CardContent>
                  </LiquidGlassCard>
                ) : (
                  videoChamadas.map((reuniao) => {
                  const dataInicio = new Date(reuniao.startAt)
                  const dataTermino = new Date(reuniao.endAt)
                  const podeEntrar = reuniao.status === 'disponivel'
                  const statusLabel = reuniao.status === 'agendada' ? 'Agendada' : reuniao.status === 'disponivel' ? 'Disponível' : 'Encerrada'
                  const statusVariant = reuniao.status === 'disponivel' ? 'default' : reuniao.status === 'agendada' ? 'secondary' : 'destructive'
                  return (
                    <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={reuniao.id}>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{reuniao.titulo}</CardTitle>
                            <CardDescription className="mt-2 space-y-1">
                              <div className="flex items-center gap-1">
                                <CalendarClock className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">Início: {dataInicio.toLocaleString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CalendarClock className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">Término: {dataTermino.toLocaleString('pt-BR')}</span>
                              </div>
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={statusVariant as any} className="text-xs">{statusLabel}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <LiquidGlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditarVideoChamada(reuniao)}
                              className="flex-1 sm:flex-none"
                            >
                              <Edit className="h-4 w-4" />
                            </LiquidGlassButton>
                            <LiquidGlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletarVideoChamada(reuniao)}
                              className="flex-1 sm:flex-none"
                            >
                              <Trash2 className="h-4 w-4" />
                            </LiquidGlassButton>
                          </div>
                          <LiquidGlassButton 
                            size="sm" 
                            variant={podeEntrar ? 'default' : 'outline'} 
                            disabled={!podeEntrar} 
                            onClick={() => entrarNaVideoChamada(reuniao)}
                            className="w-full sm:w-auto"
                          >
                            <Video className="h-4 w-4 mr-2"/>
                            Entrar
                          </LiquidGlassButton>
                        </div>
                      </CardContent>
                    </LiquidGlassCard>
                  )
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="provas-virtuais">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <h3 className="text-lg font-semibold">Provas Virtuais</h3>
                  <LiquidGlassButton onClick={handleNovaProva} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Prova
                  </LiquidGlassButton>
                </div>

                {!loading && provas.length === 0 ? (
                  <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma prova virtual criada ainda.</p>
                    </CardContent>
                  </LiquidGlassCard>
                ) : (
                  provas.map((prova) => (
                    <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY} key={prova.id}>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg truncate">{prova.activity?.title || 'Prova sem título'}</CardTitle>
                            <CardDescription className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-2">
                              <span>{prova.questions?.length || 0} questão(ões)</span>
                              {prova.activity?.startDate && (
                                <span className="truncate">Início: {new Date(prova.activity.startDate).toLocaleString('pt-BR')}</span>
                              )}
                              {prova.activity?.dueDate && (
                                <span className="truncate">Término: {new Date(prova.activity.dueDate).toLocaleString('pt-BR')}</span>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                            <LiquidGlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditarProva(prova)}
                            >
                              <Edit className="h-4 w-4" />
                            </LiquidGlassButton>
                            <LiquidGlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleGerenciarQuestoes(prova)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Questões</span>
                            </LiquidGlassButton>
                            <LiquidGlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerTentativas(prova)}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Tentativas</span>
                            </LiquidGlassButton>
                            <LiquidGlassButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletarProva(prova)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </LiquidGlassButton>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {prova.timeLimitMinutes && (
                            <p>Tempo limite: {prova.timeLimitMinutes} minutos</p>
                          )}
                          {prova.shuffleQuestions && (
                            <p>✓ Perguntas embaralhadas</p>
                          )}
                          {prova.shuffleOptions && (
                            <p>✓ Alternativas embaralhadas</p>
                          )}
                          {prova.autoGrade && (
                            <p>✓ Correção automática habilitada</p>
                          )}
                        </div>
                      </CardContent>
                    </LiquidGlassCard>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="notas">
              <LiquidGlassCard intensity={LIQUID_GLASS_DEFAULT_INTENSITY}>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="mb-2">
                      <CardTitle>Lançamento de Notas</CardTitle>
                      <CardDescription>Registre as notas dos alunos</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <LiquidGlassButton
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        disabled={!modoOperacao}
                        className="w-full sm:w-auto"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Notas
                      </LiquidGlassButton>
                      {Object.keys(notasImportadas).length > 0 && (
                        <LiquidGlassButton
                          onClick={clearImportedNotes}
                          variant="outline"
                          className="text-destructive hover:text-destructive border-destructive/50 hover:border-destructive hover:bg-destructive/10 w-full sm:w-auto"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Limpar Importado
                        </LiquidGlassButton>
                      )}
                      <LiquidGlassButton onClick={generateExcelModel} variant="outline" disabled={!modoOperacao} className="w-full sm:w-auto">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Modelo Excel
                      </LiquidGlassButton>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Seleção Inicial de Modo */}
                    {modoOperacao === null && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <LiquidGlassButton
                          onClick={() => setModoOperacao('criar')}
                          className="h-24 flex flex-col items-center justify-center"
                          variant="outline"
                        >
                          <Plus className="h-6 w-6 mb-2" />
                          <span className="font-semibold text-sm sm:text-base text-center px-2">Criar nova atividade</span>
                        </LiquidGlassButton>
                        <LiquidGlassButton
                          onClick={() => setModoOperacao('associar')}
                          className="h-24 flex flex-col items-center justify-center"
                          variant="outline"
                        >
                          <FileText className="h-6 w-6 mb-2" />
                          <span className="font-semibold text-sm sm:text-base text-center px-2">Avaliar uma atividade ou prova existente</span>
                        </LiquidGlassButton>
                      </div>
                    )}

                    {/* Modo: Criar Nova Atividade */}
                    {modoOperacao === 'criar' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Criar nova atividade</h3>
                          <LiquidGlassButton
                            onClick={() => {
                              setModoOperacao(null)
                              setAvaliacaoTitulo('')
                              setAvaliacaoTipo('exam')
                              setAvaliacaoUnidade('')
                              setAvaliacaoStartDate('')
                              setAvaliacaoDueDate('')
                              setAvaliacaoPeso('')
                              setAvaliacaoDescricao('')
                              setNotasImportadas({})
                              setNotasDigitadas({})
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </LiquidGlassButton>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="avaliacao-titulo" className="mb-2">Título *</Label>
                            <Input
                              id="avaliacao-titulo"
                              placeholder="Ex: Prova Bimestral"
                              value={avaliacaoTitulo}
                              onChange={e => setAvaliacaoTitulo(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="avaliacao-unidade" className="mb-2">Unidade *</Label>
                            <Select value={avaliacaoUnidade} onValueChange={(value: ActivityUnit) => setAvaliacaoUnidade(value)}>
                              <SelectTrigger id="avaliacao-unidade" className="w-full">
                                <SelectValue placeholder="Selecione a unidade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1ª Unidade">1ª Unidade</SelectItem>
                                <SelectItem value="2ª Unidade">2ª Unidade</SelectItem>
                                <SelectItem value="Prova Final">Prova Final</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="avaliacao-tipo" className="mb-2">Tipo *</Label>
                            <Select value={avaliacaoTipo} onValueChange={(value: ActivityType) => setAvaliacaoTipo(value)}>
                              <SelectTrigger id="avaliacao-tipo" className="w-full">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="exam">Prova</SelectItem>
                                <SelectItem value="homework">Exercício</SelectItem>
                                <SelectItem value="project">Projeto</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="avaliacao-peso" className="mb-2">Peso (MaxScore)</Label>
                            <Input
                              id="avaliacao-peso"
                              type="number"
                              placeholder="Ex: 4.0"
                              value={avaliacaoPeso}
                              onChange={e => setAvaliacaoPeso(e.target.value)}
                              min="0"
                              max="10"
                              step="0.1"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="avaliacao-start-date" className="mb-2">Data de Início</Label>
                            <Input
                              id="avaliacao-start-date"
                              type="datetime-local"
                              value={avaliacaoStartDate}
                              onChange={e => setAvaliacaoStartDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="avaliacao-due-date" className="mb-2">Prazo de Entrega</Label>
                            <Input
                              id="avaliacao-due-date"
                              type="date"
                              value={avaliacaoDueDate}
                              onChange={e => setAvaliacaoDueDate(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="avaliacao-descricao" className="mb-2">Descrição</Label>
                          <Textarea
                            id="avaliacao-descricao"
                            placeholder="Descrição da avaliação..."
                            value={avaliacaoDescricao}
                            onChange={e => setAvaliacaoDescricao(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                    )}

                    {/* Modo: Associar a Atividade Existente */}
                    {modoOperacao === 'associar' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Associar a Atividade Existente</h3>
                          <LiquidGlassButton
                            onClick={() => {
                              setModoOperacao(null)
                              setAtividadeSelecionadaId(undefined)
                              setAtividadeSelecionadaCompleta(null)
                              setNotasImportadas({})
                              setNotasDigitadas({})
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </LiquidGlassButton>
                        </div>

                        <div>
                          <Label htmlFor="atividade-existente-select" className="mb-2">Selecione a Atividade *</Label>
                          <Select
                            value={atividadeSelecionadaId || ''}
                            onValueChange={async (value: string) => {
                              setAtividadeSelecionadaId(value)
                              try {
                                const atividade = await getActivityById(value)
                                setAtividadeSelecionadaCompleta(atividade)
                                setAvaliacaoTitulo(atividade.title)
                                setAvaliacaoTipo(atividade.type)
                                setAvaliacaoUnidade(atividade.unit)
                                setAvaliacaoStartDate(atividade.startDate ? new Date(atividade.startDate).toISOString().slice(0, 16) : '')
                                setAvaliacaoDueDate(atividade.dueDate ? new Date(atividade.dueDate).toISOString().slice(0, 10) : '')
                                setAvaliacaoPeso(atividade.maxScore ? String(atividade.maxScore) : '')
                                setAvaliacaoDescricao(atividade.description || '')
                              } catch (error) {
                                toast({ title: "Erro ao carregar atividade", description: "Não foi possível carregar os dados da atividade." })
                              }
                            }}
                          >
                            <SelectTrigger id="atividade-existente-select" className="w-full">
                              <SelectValue placeholder="Selecione uma atividade" />
                            </SelectTrigger>
                            <SelectContent>
                              {atividades.filter(a => a.tipo !== 'Prova Virtual').map(a => (
                                <SelectItem key={a.id} value={a.id}>{a.titulo}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {atividadeSelecionadaCompleta && (
                          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                            <h4 className="font-medium">Dados da Atividade Selecionada</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Título:</span>
                                <p className="font-medium">{atividadeSelecionadaCompleta.title}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Unidade:</span>
                                <p className="font-medium">{atividadeSelecionadaCompleta.unit}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tipo:</span>
                                <p className="font-medium">
                                  {atividadeSelecionadaCompleta.type === 'exam' ? 'Prova' : 
                                   atividadeSelecionadaCompleta.type === 'homework' ? 'Exercício' : 
                                   atividadeSelecionadaCompleta.type === 'project' ? 'Projeto' : 
                                   atividadeSelecionadaCompleta.type}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Peso:</span>
                                <p className="font-medium">{atividadeSelecionadaCompleta.maxScore || 'Não definido'}</p>
                              </div>
                              {atividadeSelecionadaCompleta.startDate && (
                                <div>
                                  <span className="text-muted-foreground">Data de Início:</span>
                                  <p className="font-medium">{new Date(atividadeSelecionadaCompleta.startDate).toLocaleString('pt-BR')}</p>
                                </div>
                              )}
                              {atividadeSelecionadaCompleta.dueDate && (
                                <div>
                                  <span className="text-muted-foreground">Prazo:</span>
                                  <p className="font-medium">{new Date(atividadeSelecionadaCompleta.dueDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                              )}
                              {atividadeSelecionadaCompleta.description && (
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Descrição:</span>
                                  <p className="font-medium">{atividadeSelecionadaCompleta.description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Lista de Alunos para Lançamento de Notas */}
                    {modoOperacao !== null && (
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
                        {alunos.map((aluno) => {
                          const maxAllowed = modoOperacao === 'associar' && atividadeSelecionadaCompleta?.maxScore
                            ? atividadeSelecionadaCompleta.maxScore
                            : avaliacaoPeso
                            ? Number(avaliacaoPeso)
                            : 10
                          
                          return (
                            <div
                              key={aluno.id}
                              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg transition-all duration-200 gap-3 sm:gap-4 ${
                                notasImportadas[aluno.id]
                                  ? isLiquidGlass
                                    ? 'imported-note-container'
                                    : 'border-accent/50 bg-accent/5 hover:border-accent/70'
                                  : 'border-border hover:border-border/80'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <span className="font-medium truncate block">{aluno.nome}</span>
                                <p className="text-sm text-muted-foreground truncate">Matrícula: {aluno.matricula}</p>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Input
                                  type="number"
                                  placeholder="0.0"
                                  className={`w-full sm:w-20 transition-all duration-200 ${
                                    notasImportadas[aluno.id]
                                      ? isLiquidGlass
                                        ? 'imported-note-input'
                                        : 'border-accent/60 bg-accent/10 focus:border-accent focus:ring-accent/20'
                                      : 'border-border focus:border-ring'
                                  }`}
                                  min="0"
                                  max={maxAllowed}
                                  step="0.1"
                                  defaultValue={notasImportadas[aluno.id] || ''}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    const numValue = parseFloat(value)
                                    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= maxAllowed)) {
                                      setNotasDigitadas(prev => ({ ...prev, [aluno.id]: value }))
                                    } else if (!isNaN(numValue) && numValue > maxAllowed) {
                                      toast({
                                        title: "Nota inválida",
                                        description: `A nota não pode ser maior que o peso máximo (${maxAllowed.toFixed(1)})`,
                                        variant: "error"
                                      })
                                    }
                                  }}
                                />
                                {notasImportadas[aluno.id] && (
                                  <CheckCircle className="h-4 w-4 text-accent animate-in fade-in duration-200 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Botão de Salvar Notas */}
                    {modoOperacao !== null && (
                      <LiquidGlassButton className="w-full" onClick={async () => {
                        try {
                          let activityIdToUse: string | null = null
                          let maxScoreAtividade: number | undefined = undefined

                          if (modoOperacao === 'criar') {
                            // Validações obrigatórias
                            if (!avaliacaoTitulo.trim()) {
                              toast({ title: "Título obrigatório", description: "Informe o título da avaliação.", variant: "error" })
                              return
                            }
                            if (!avaliacaoUnidade) {
                              toast({ title: "Unidade obrigatória", description: "Selecione a unidade da avaliação.", variant: "error" })
                              return
                            }

                            // Validação de maxScore por unidade (frontend)
                            const maxScoreValue = avaliacaoPeso ? Number(avaliacaoPeso) : undefined
                            if (maxScoreValue) {
                              const validacao = await validarMaxScoreUnidade(avaliacaoUnidade, maxScoreValue)
                              if (!validacao.valido) {
                                toast({
                                  title: "Limite de Pontuação Excedido",
                                  description: validacao.mensagem,
                                  variant: "error"
                                })
                                return
                              }
                            }

                            // Criar atividade
                            try {
                              const created = await createActivity({
                                classId,
                                title: avaliacaoTitulo,
                                unit: avaliacaoUnidade,
                                type: avaliacaoTipo,
                                description: avaliacaoDescricao || undefined,
                                startDate: avaliacaoStartDate || undefined,
                                dueDate: avaliacaoDueDate || undefined,
                                maxScore: maxScoreValue,
                              })
                              activityIdToUse = created.id
                              maxScoreAtividade = created.maxScore || undefined
                            } catch (error: any) {
                              const errorMessage = error?.message || "Erro ao criar atividade"
                              // Verificar se é erro de limite de pontuação (backend)
                              if (errorMessage.includes('não pode exceder') || errorMessage.includes('soma das notas')) {
                                toast({
                                  title: "Limite de Pontuação Excedido",
                                  description: errorMessage,
                                  variant: "error"
                                })
                              } else {
                                toast({ title: "Erro ao criar atividade", description: errorMessage, variant: "error" })
                              }
                              return
                            }
                          } else if (modoOperacao === 'associar') {
                            if (!atividadeSelecionadaId || !atividadeSelecionadaCompleta) {
                              toast({ title: "Selecione uma atividade", description: "Escolha uma atividade existente.", variant: "error" })
                              return
                            }
                            activityIdToUse = atividadeSelecionadaId
                            maxScoreAtividade = atividadeSelecionadaCompleta.maxScore || undefined
                          }

                          // Validar e processar notas
                          const notasFinais: Record<string, string> = { ...notasImportadas, ...notasDigitadas }
                          const entries = Object.entries(notasFinais).filter(([_, v]) => v !== '' && v !== undefined && v !== null)
                          if (entries.length === 0) {
                            toastImportWarning('Nenhuma nota informada', 'Preencha ou importe notas antes de salvar.')
                            return
                          }

                          // Validação de notas individuais
                          const maxAllowed = maxScoreAtividade || 10
                          for (const [enrollmentId, scoreStr] of entries) {
                            const score = parseFloat(scoreStr)
                            if (Number.isNaN(score) || score < 0) {
                              toastImportError('Notas inválidas', `Verifique a nota do aluno (matrícula ${alunos.find(a => a.id === enrollmentId)?.matricula ?? enrollmentId}).`)
                              return
                            }
                            if (score > maxAllowed) {
                              toastImportError('Nota inválida', `A nota não pode ser maior que o peso máximo (${maxAllowed.toFixed(1)}). Aluno: ${alunos.find(a => a.id === enrollmentId)?.nome ?? enrollmentId}`)
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
                            setModoOperacao(null)
                            setAvaliacaoTitulo('')
                            setAvaliacaoTipo('exam')
                            setAvaliacaoUnidade('')
                            setAvaliacaoStartDate('')
                            setAvaliacaoDueDate('')
                            setAvaliacaoPeso('')
                            setAvaliacaoDescricao('')
                            setAtividadeSelecionadaId(undefined)
                            setAtividadeSelecionadaCompleta(null)
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
                              // Filtrar atividades excluindo virtual_exam (que tem sua própria aba)
                              const atividadesFiltradas = (acts as ActivityDTO[]).filter(a => a.type !== 'virtual_exam')
                              const submissionsCountsFiltrados = atividadesFiltradas.map((a) => {
                                const originalIdx = (acts as ActivityDTO[]).findIndex(act => act.id === a.id)
                                return submissionsCounts[originalIdx] ?? 0
                              })
                              const atividadesMapped: AtividadeItem[] = atividadesFiltradas.map((a, idx) => {
                                const prazo = a.dueDate || null
                                const status: "Ativa" | "Concluída" = prazo ? (new Date(prazo).getTime() < Date.now() ? "Concluída" : "Ativa") : "Ativa"
                                return {
                                  id: a.id,
              titulo: a.title,
              tipo: a.type === 'exam' ? 'Prova' : a.type === 'project' ? 'Projeto' : 'Exercício',
              prazo,
                                  entregues: submissionsCountsFiltrados[idx] ?? 0,
                                  total: totalAlunos,
                                  status,
                                  peso: a.maxScore ?? null,
                                  descricao: a.description ?? null,
                                  unit: a.unit
                                }
                              })
                              setAtividades(atividadesMapped)
                            } catch {
                              // silencioso
                            }
                          }
                          if (fail > 0 && ok === 0) {
                            const firstError = (results.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined)?.reason?.message
                            toast({ title: "Erro ao lançar notas", description: firstError || "Tente novamente.", variant: "error" })
                          }
                        } catch (e: any) {
                          console.error(e)
                          toast({ title: "Erro ao lançar notas", description: e?.message || "Tente novamente.", variant: "error" })
                        }
                      }}>
                        Salvar Notas
                      </LiquidGlassButton>
                    )}
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
        onClose={handleLeaveLiveSession}
        titulo={videoChamadaSelecionada?.titulo}
        dataHora={videoChamadaSelecionada?.dataHora}
      >
        <div className="flex flex-col h-full gap-4">
          {/* Controles */}
          <div className="flex items-center justify-between gap-2">
            {/* Controles Pessoais do Professor */}
            <div className="flex items-center gap-2">
              <LiquidGlassButton
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                {isMuted ? "Microfone Desligado" : "Silenciar"}
              </LiquidGlassButton>
              <LiquidGlassButton
                variant={isVideoOff ? "destructive" : "outline"}
                size="sm"
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4 mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                {isVideoOff ? "Câmera Desligada" : "Desligar Câmera"}
              </LiquidGlassButton>
            </div>

            {/* Controles de Compartilhamento */}
            <div className="flex items-center gap-2">
              {!isScreenSharing ? (
                <div className="relative" ref={screenShareMenuRef}>
                  <LiquidGlassButton
                    variant="outline"
                    size="sm"
                    onClick={() => setScreenShareMenuOpen(!screenShareMenuOpen)}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Compartilhar Tela
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </LiquidGlassButton>
                  {screenShareMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow-lg z-50">
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-t-md"
                        onClick={() => {
                          startScreenSharing('screen');
                          setScreenShareMenuOpen(false);
                        }}
                      >
                        Tela Inteira
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => {
                          startScreenSharing('window');
                          setScreenShareMenuOpen(false);
                        }}
                      >
                        Janela
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent rounded-b-md"
                        onClick={() => {
                          startScreenSharing('browser');
                          setScreenShareMenuOpen(false);
                        }}
                      >
                        Aba do Navegador
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <LiquidGlassButton
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    stopScreenSharing();
                    setScreenShareMenuOpen(false);
                  }}
                >
                  <MonitorStop className="h-4 w-4 mr-2" />
                  Parar Compartilhamento
                </LiquidGlassButton>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {/* Vídeo Local */}
            <div className="relative min-h-[200px] md:min-h-0">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-md bg-black"></video>
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                {isScreenSharing ? 'Sua Tela' : 'Sua Câmera'}
              </div>
            </div>
            
            {/* Grid para Vídeos Remotos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-h-[200px] md:min-h-0">
              {remoteStreams.size > 0 ? (
                Array.from(remoteStreams.entries()).map(([socketId, stream]) => (
                  <div key={socketId} className="relative">
                    <RemoteVideo stream={stream} />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                      Participante
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 flex items-center justify-center bg-muted/50 rounded-md min-h-[200px]">
                  <p className="text-muted-foreground">Aguardando participantes...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalVideoChamada>

      {/* Modal de Formulário de Videochamada */}
      <ModalVideoChamadaForm
        isOpen={modalVideoChamadaFormOpen}
        onClose={() => {
          setModalVideoChamadaFormOpen(false)
          setVideoChamadaEditando(null)
        }}
        videoChamada={videoChamadaEditando}
        classId={classId}
        onSalvar={handleSalvarVideoChamada}
        modo={modoModalVideoChamada}
      />

      {/* Modal de Prova */}
      <ModalProva
        isOpen={modalProvaOpen}
        onClose={() => {
          setModalProvaOpen(false)
          setProvaEditando(null)
        }}
        prova={provaEditando}
        activityId={provaEditando?.activityId}
        onSalvar={handleSalvarProva}
        modo={modoModalProva}
      />

      {/* Modal de Questão */}
      {provaSelecionadaParaQuestoes && (
        <ModalQuestaoProva
          isOpen={modalQuestaoOpen}
          onClose={() => {
            setModalQuestaoOpen(false)
            setQuestaoEditando(null)
          }}
          questao={questaoEditando}
          examId={provaSelecionadaParaQuestoes.id}
          onSalvar={handleSalvarQuestao}
          modo={modoModalQuestao}
          ordem={questoesProva.length + 1}
        />
      )}

      {/* Modal de Gerenciar Questões */}
      {provaSelecionadaParaQuestoes && (
        <Dialog open={modalGerenciarQuestoesOpen} onOpenChange={(open) => {
          if (!open) {
            setModalGerenciarQuestoesOpen(false)
            setProvaSelecionadaParaQuestoes(null)
            setQuestoesProva([])
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerenciar Questões - {provaSelecionadaParaQuestoes.activity?.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {questoesProva.length} questão(ões) cadastrada(s)
                </p>
                <LiquidGlassButton onClick={handleNovaQuestao}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Questão
                </LiquidGlassButton>
              </div>
              <div className="space-y-3">
                {questoesProva.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma questão cadastrada. Clique em "Nova Questão" para começar.
                  </p>
                ) : (
                  questoesProva
                    .sort((a, b) => a.order - b.order)
                    .map((questao) => (
                      <LiquidGlassCard key={questao.id} intensity="medium">
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-sm">
                                  Questão {questao.order}
                                </span>
                                <Badge variant="outline">
                                  {questao.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Dissertativa'}
                                </Badge>
                                <Badge variant="secondary">
                                  {questao.points} ponto(s)
                                </Badge>
                              </div>
                              <p className="mb-2">{questao.questionText}</p>
                              {questao.type === 'multiple_choice' && questao.options && (
                                <div className="text-sm text-muted-foreground">
                                  {questao.options.length} alternativa(s)
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <LiquidGlassButton
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditarQuestao(questao)}
                              >
                                <Edit className="h-4 w-4" />
                              </LiquidGlassButton>
                              <LiquidGlassButton
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletarQuestao(questao.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </LiquidGlassButton>
                            </div>
                          </div>
                        </div>
                      </LiquidGlassCard>
                    ))
                )}
              </div>
              <div className="flex justify-end mt-6 pt-4 border-t">
                <LiquidGlassButton
                  variant="outline"
                  onClick={() => {
                    setModalGerenciarQuestoesOpen(false)
                    setProvaSelecionadaParaQuestoes(null)
                    setQuestoesProva([])
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Fechar
                </LiquidGlassButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Tentativas */}
      {provaSelecionadaParaTentativas && (
        <ModalTentativasProva
          isOpen={modalTentativasOpen}
          onClose={() => {
            setModalTentativasOpen(false)
            setProvaSelecionadaParaTentativas(null)
          }}
          examId={provaSelecionadaParaTentativas.id}
          onVerDetalhes={handleVerDetalhesTentativa}
        />
      )}

      {/* Modal de Detalhes da Tentativa */}
      {tentativaSelecionadaId && (
        <ModalDetalhesTentativa
          isOpen={modalDetalhesTentativaOpen}
          onClose={() => {
            setModalDetalhesTentativaOpen(false)
            setTentativaSelecionadaId(null)
          }}
          attemptId={tentativaSelecionadaId}
          onCorrecaoSalva={handleCorrecaoSalva}
        />
      )}
    </div>
  )
}
