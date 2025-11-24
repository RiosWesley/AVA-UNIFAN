import api from './api'

export type AuthUser = { id: string; name?: string; email: string; roles: string[] }

export type TeacherClassDetail = {
  id: string
  nome: string
  disciplina: string
  alunos: number
  mediaGeral?: number
  frequenciaMedia?: number
  proximaAula?: string
  sala?: string
  atividades?: number
  avaliacoes?: number
  semestre?: string
  aulas?: Array<{
    id: string
    data: string
    horario: string
    sala: string
    status: 'agendada' | 'lancada' | 'retificada'
    alunosPresentes: string[]
    aulaIndex: number
  }>
}

export type DashboardTurma = {
  nome: string
  disciplina: string
  alunos: number
  proxima: string
  sala: string
  status: string
  media: number
}

export type DashboardAula = {
  turma: string
  horario: string
  sala: string
  tipo: 'Teórica' | 'Prática'
  status: 'Próxima' | 'Em breve'
}

export type DashboardAtividade = {
  titulo: string
  turma: string
  prazo: string
  status: 'Pendente' | 'Corrigindo' | 'Aguardando'
  prioridade: 'Alta' | 'Média' | 'Baixa'
  tipo: 'Prova' | 'Exercício' | 'Projeto'
}

export type DashboardComunicado = {
  titulo: string
  descricao: string
  data: string
  prioridade: 'Alta' | 'Média' | 'Baixa'
}

function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR')
}

function diffDaysFromNow(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const due = new Date(dateStr)
  if (Number.isNaN(due.getTime())) return null
  const now = new Date()
  const ms = due.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me')
  return data
}

export async function getTeacherClassesWithDetails(teacherId: string): Promise<TeacherClassDetail[]> {
  const { data } = await api.get<TeacherClassDetail[]>(`/classes/teacher/${teacherId}/details`)
  return data || []
}

export async function getTeacherNotices(): Promise<DashboardComunicado[]> {
  const { data } = await api.get<Array<{ id: string; title: string; content: string; createdAt: string }>>(
    '/notice-board/teacher'
  )
  return (data || []).map((n) => ({
    titulo: n.title,
    descricao: n.content || '',
    data: formatDateBR(n.createdAt),
    prioridade: 'Média',
  }))
}

export async function getTeacherActivitiesAggregated(
  classes: TeacherClassDetail[]
): Promise<DashboardAtividade[]> {
  const classIds = classes.map((c) => c.id)
  if (classIds.length === 0) return []

  const requests = classIds.map((id) =>
    api.get<
      Array<{
        id: string
        title: string
        description?: string | null
        type: 'exam' | 'homework' | 'project'
        dueDate?: string | null
        class: { id: string }
      }>
    >(`/activities/class/${id}`)
  )

  const responses = await Promise.allSettled(requests)
  const activities: Array<DashboardAtividade> = []

  const classIdToLabel = new Map<string, string>()
  classes.forEach((c) => classIdToLabel.set(c.id, `${c.nome} - ${c.disciplina}`))

  responses.forEach((res, idx) => {
    if (res.status !== 'fulfilled') return
    const items = res.value.data || []
    for (const a of items) {
      const prazoFmt = formatDateBR(a.dueDate)
      const dd = diffDaysFromNow(a.dueDate)
      let prioridade: DashboardAtividade['prioridade'] = 'Baixa'
      if (dd !== null) {
        if (dd <= 3) prioridade = 'Alta'
        else if (dd <= 7) prioridade = 'Média'
        else prioridade = 'Baixa'
      }
      let status: DashboardAtividade['status'] = 'Aguardando'
      if (a.dueDate) {
        const due = new Date(a.dueDate)
        status = due.getTime() >= Date.now() ? 'Pendente' : 'Corrigindo'
      }
      const tipo: DashboardAtividade['tipo'] =
        a.type === 'exam' ? 'Prova' : a.type === 'project' ? 'Projeto' : 'Exercício'
      const turma = classIdToLabel.get(a.class?.id || classIds[idx]) || 'Turma'
      activities.push({
        titulo: a.title,
        turma,
        prazo: prazoFmt,
        status,
        prioridade,
        tipo,
      })
    }
  })

  // Ordena por data (se houver)
  return activities.sort((a, b) => {
    const parse = (s: string) => {
      const [d, m, y] = s.split('/')
      if (!d || !m || !y) return 0
      return +new Date(+y, +m - 1, +d)
    }
    return parse(b.prazo) - parse(a.prazo)
  })
}

export function buildTurmasData(classes: TeacherClassDetail[]): DashboardTurma[] {
  return (classes || []).map((c) => {
    const proxima = (c.proximaAula || '').split(', ').pop() || ''
    return {
      nome: c.nome,
      disciplina: c.disciplina,
      alunos: c.alunos ?? 0,
      proxima: proxima,
      sala: c.sala || '—',
      status: 'Em andamento',
      media: Number.isFinite(c.mediaGeral as number) ? (c.mediaGeral as number) : 0,
    }
  })
}

export function buildProximasAulasFromClasses(classes: TeacherClassDetail[]): DashboardAula[] {
  const aulas: DashboardAula[] = []
  const now = Date.now()
  for (const c of classes) {
    const label = `${c.nome} - ${c.disciplina}`
    for (const aula of c.aulas || []) {
      const dateMs = +new Date(aula.data)
      if (Number.isNaN(dateMs)) continue
      if (dateMs >= now) {
        aulas.push({
          turma: label,
          horario: aula.horario,
          sala: aula.sala || '—',
          tipo: 'Teórica',
          status: dateMs - now < 1000 * 60 * 60 * 24 ? 'Próxima' : 'Em breve',
        })
      }
    }
  }
  // pega as 2 mais próximas
  return aulas
    .sort((a, b) => {
      const aMs = +new Date(a.horario.split(' - ')[0] || Date.now())
      const bMs = +new Date(b.horario.split(' - ')[0] || Date.now())
      return aMs - bMs
    })
    .slice(0, 2)
}

export function buildAgendaSemanalFromClasses(classes: TeacherClassDetail[]): Array<{
  dia: string
  aulas: number
  turmas: string[]
  totalHoras: number
}> {
  const map = new Map<
    string,
    { aulas: number; turmas: Set<string>; totalHoras: number }
  >()
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  function getDay(dateStr: string): string {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return '—'
    return dayNames[d.getDay()]
  }

  for (const c of classes) {
    for (const aula of c.aulas || []) {
      const dia = getDay(aula.data)
      if (!map.has(dia)) {
        map.set(dia, { aulas: 0, turmas: new Set<string>(), totalHoras: 0 })
      }
      const entry = map.get(dia)!
      entry.aulas += 1
      entry.turmas.add(c.nome)
      // cálculo simples: assume 2h por aula quando não houver parsing de horário
      const durationHours = (() => {
        const parts = aula.horario.split(' - ')
        if (parts.length !== 2) return 2
        const [h1, m1] = parts[0].split(':').map((x) => parseInt(x, 10))
        const [h2, m2] = parts[1].split(':').map((x) => parseInt(x, 10))
        if ([h1, m1, h2, m2].some((n) => Number.isNaN(n))) return 2
        return Math.max(1, (h2 * 60 + m2) - (h1 * 60 + m1)) / 60
      })()
      entry.totalHoras += durationHours
    }
  }

  const ordered = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map((dia) => {
    const e = map.get(dia)
    return {
      dia,
      aulas: e?.aulas ?? 0,
      turmas: Array.from(e?.turmas ?? []),
      totalHoras: Math.round((e?.totalHoras ?? 0)),
    }
  })
  return ordered
}

export function calculateStats(classes: TeacherClassDetail[], activities: DashboardAtividade[]) {
  const totalTurmas = classes.length
  const totalAlunos = classes.reduce((acc, c) => acc + (c.alunos ?? 0), 0)
  // aulas de hoje
  const todayIso = new Date().toISOString().slice(0, 10)
  const aulasHoje = classes.reduce((acc, c) => {
    const count = (c.aulas || []).filter((a) => (a.data || '').startsWith(todayIso)).length
    return acc + count
  }, 0)
  const atividadesPendentes = activities.filter((a) => a.status === 'Pendente').length
  const corrigindo = activities.filter((a) => a.status === 'Corrigindo').length
  return { totalTurmas, totalAlunos, aulasHoje, atividadesPendentes, corrigindo }
}

/**
 * Obtém a lista de semestres disponíveis para um professor
 * @param teacherId ID do professor
 * @returns Array de objetos com id e nome do semestre
 */
export const getSemestresDisponiveisProfessor = async (teacherId: string): Promise<Array<{ id: string; nome: string; ativo: boolean }>> => {
  try {
    const classes = await getTeacherClassesWithDetails(teacherId)
    
    // Extrair semestres únicos das classes
    const semestresMap = new Map<string, { id: string; nome: string; ativo: boolean }>()
    
    classes.forEach(classe => {
      if (classe.semestre) {
        const semestreId = classe.semestre
        if (!semestresMap.has(semestreId)) {
          // Verificar se é o semestre ativo (pode usar lógica similar ao aluno)
          // Por enquanto, considerar ativo se for o mais recente
          semestresMap.set(semestreId, {
            id: semestreId,
            nome: semestreId,
            ativo: false // Será atualizado depois
          })
        }
      }
    })
    
    // Ordenar semestres (mais recente primeiro) e marcar o primeiro como ativo
    const semestres = Array.from(semestresMap.values()).sort((a, b) => {
      // Comparar formato YYYY.N (ex: 2025.1)
      const [yearA, semA] = a.id.split('.').map(Number)
      const [yearB, semB] = b.id.split('.').map(Number)
      if (yearA !== yearB) return yearB - yearA
      return semB - semA
    })
    
    // Marcar o primeiro (mais recente) como ativo
    if (semestres.length > 0) {
      semestres[0].ativo = true
    }
    
    return semestres
  } catch (error) {
    console.error("Erro ao buscar semestres disponíveis:", error)
    return []
  }
}


