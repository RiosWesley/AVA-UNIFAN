"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/sidebar'
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Search, CheckCircle, Clock, Target, Calendar as CalIcon, BookOpen, Upload, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { ModalEnviarAtividade } from '@/components/modals'
import { StudentActivity } from "@/src/Atividade"
import { completeStudentActivity, getStudentActivities, uploadStudentActivity } from "@/src/services/atividadeService"
import { PageSpinner } from "@/components/ui/page-spinner"
import { getSemestresDisponiveis } from "@/src/services/ClassesService"
import { me } from '@/src/services/auth'

export default function AtividadesPage() {
  const router = useRouter()
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalEnviarAtividadeOpen, setModalEnviarAtividadeOpen] = useState(false)
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<StudentActivity | null>(null)
  const [semestreSelecionado, setSemestreSelecionado] = useState<string>("")
  const [semestres, setSemestres] = useState<Array<{ id: string; nome: string; ativo: boolean }>>([])
  const [studentId, setStudentId] = useState<string | null>(null)
  

  const queryClient = useQueryClient()

  useEffect(() => {
    const checkTheme = () => setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Obter ID do usuário autenticado
  useEffect(() => {
    const init = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("ava:token") : null
      if (!token) {
        router.push("/")
        return
      }
      const storedUserId = localStorage.getItem("ava:userId")
      if (storedUserId) {
        setStudentId(storedUserId)
        return
      }
      try {
        const current = await me()
        if (current?.id) {
          localStorage.setItem("ava:userId", current.id)
          setStudentId(current.id)
        }
      } catch {
        router.push("/")
      }
    }
    init()
  }, [router])

  // Buscar semestres disponíveis
  useEffect(() => {
    const buscarSemestres = async () => {
      if (!studentId) return
      try {
        const semestresDisponiveis = await getSemestresDisponiveis(studentId)
        setSemestres(semestresDisponiveis)
        
        // Selecionar semestre ativo ou o primeiro disponível
        const semestreAtivo = semestresDisponiveis.find(s => s.ativo)
        if (semestreAtivo) {
          setSemestreSelecionado(semestreAtivo.id)
        } else if (semestresDisponiveis.length > 0) {
          setSemestreSelecionado(semestresDisponiveis[0].id)
        }
      } catch (error) {
        console.error("Erro ao buscar semestres:", error)
      }
    }
    buscarSemestres()
  }, [studentId])

  const { data: allActivities = [], isLoading, error } = useQuery({
    queryKey: ['studentActivities', studentId],
    queryFn: () => getStudentActivities(studentId!),
    enabled: !!studentId,
  });

  const completeActivityMutation = useMutation({
    mutationFn: (activityId: string) => completeStudentActivity(activityId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentActivities', studentId] });
      toast({
        title: "Atividade concluída!",
        description: "Seu status foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao concluir atividade",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
  
    const handleCompleteActivity = (activityId: string) => {
      completeActivityMutation.mutate(activityId);
    };

  const uploadActivityMutation = useMutation({
    mutationFn: ({ activityId, file, comment }: { activityId: string; file: File; comment: string }) => 
      uploadStudentActivity(activityId, studentId, file, comment),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studentActivities', studentId] });
      toast({
        title: "Atividade enviada com sucesso! 🎉",
        description: `${variables.file.name} foi enviada.`,
      });
      setModalEnviarAtividadeOpen(false);
      setAtividadeSelecionada(null);
    },
    onError: () => { /* ... */ },
  });

  const handleEnviarAtividade = async (activityId: string, file: File, comment: string) => {
    await uploadActivityMutation.mutateAsync({ activityId, file, comment });
  };
  
  const handleAbrirModalEnviar = (atividade: StudentActivity) => {
    setAtividadeSelecionada(atividade);
    setModalEnviarAtividadeOpen(true);
  };

  // Filtrar atividades por semestre
  const atividadesFiltradas = useMemo(() => {
    if (!semestreSelecionado) return allActivities
    return allActivities.filter(activity => {
      if (!activity.semestre) return false
      // Normalizar formato de semestre (2025.1 ou 2025-1)
      const periodoNormalizado = activity.semestre.replace('-', '.')
      const semestreNormalizado = semestreSelecionado.replace('-', '.')
      return periodoNormalizado === semestreNormalizado
    })
  }, [allActivities, semestreSelecionado])

  const { atividadesPendentes, atividadesConcluidas } = useMemo(() => {
    const pendentes = atividadesFiltradas.filter(a => a.status === 'pendente');
    const concluidas = atividadesFiltradas.filter(a => a.status === 'concluido' || a.status === 'avaliado');
    return { atividadesPendentes: pendentes, atividadesConcluidas: concluidas };
  }, [atividadesFiltradas]);

  const filteredPendentes = useMemo(() => 
    atividadesPendentes.filter(a =>
      a.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    ), [atividadesPendentes, searchTerm]);

  const filteredConcluidas = useMemo(() =>
    atividadesConcluidas.filter(a =>
      a.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    ), [atividadesConcluidas, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="aluno" />
        <main className="flex-1 overflow-y-auto">
          <PageSpinner />
        </main>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userRole="aluno" />
        <main className="flex-1 overflow-y-auto flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg font-semibold">{(error as Error).message}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Header Hero Section */}
          <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm mb-8 p-6 ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.05]" />
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
                    Minhas Atividades
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Gerencie suas tarefas e atividades acadêmicas com estilo
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium">Pendentes</span>
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                        {atividadesPendentes.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Concluídas</span>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                        {atividadesConcluidas.length}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total de Atividades:</div>
                    <div className="text-2xl font-bold text-foreground">
                      {atividadesPendentes.length + atividadesConcluidas.length}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <Select value={semestreSelecionado} onValueChange={setSemestreSelecionado}>
                      <SelectTrigger className={`w-40 backdrop-blur-sm ${
                        isLiquidGlass
                          ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
                          : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                      }`}>
                        <SelectValue placeholder="Selecionar semestre" />
                      </SelectTrigger>
                      <SelectContent className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-gray-200/30 dark:border-gray-700/50">
                        {semestres.map((semestre) => (
                          <SelectItem key={semestre.id} value={semestre.id}>
                            <div className="flex items-center space-x-2">
                              <span>{semestre.nome}</span>
                              {semestre.ativo && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs">
                                  Atual
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de busca */}
          <div className="flex flex-col lg:flex-row gap-4">
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`flex-1 p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 border-border/50 hover:border-border/80 ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <Input
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border-none bg-transparent focus-visible:ring-0 text-lg placeholder:text-muted-foreground/60"
                />
              </div>
            </LiquidGlassCard>
          </div>
          
          {/* Cards de Atividades */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Atividades Pendentes */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300 border-border/50 hover:border-border/80 group ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <div className="relative py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 transition-colors flex items-center justify-center">
                      <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Pendentes</h2>
                      <p className="text-sm text-muted-foreground">{filteredPendentes.length} atividades</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredPendentes.map((atividade) => {
                    return (
                      <div key={atividade.id} className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                        isLiquidGlass
                          ? 'bg-transparent hover:bg-white/15 dark:hover:bg-gray-800/15 border-green-200/40 dark:border-green-800/40 '
                          : 'bg-white/70 dark:bg-gray-800/70 border-green-200/60 dark:border-green-800/60 hover:bg-white/90 dark:hover:bg-gray-800/90'
                      }`}>
                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-foreground transition-colors">
                              {atividade.titulo}
                            </h3>
                            
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            {atividade.descricao}
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-xs">
                                  <BookOpen className="h-3 w-3" />
                                  <span className="font-medium">{atividade.disciplina}</span>
                                </div>
                                
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                  <CalIcon className="h-3 w-3" />
                                  <span className="font-bold">Vence: {atividade.dataVencimento}</span>
                                </div>
                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAbrirModalEnviar(atividade)}
                                disabled={uploadActivityMutation.isPending}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                <Upload className="h-4 w-4" />
                                <span>Enviar Atividade</span>
                              </Button>
                              <Button
                                onClick={() => handleCompleteActivity(atividade.id)}
                                disabled={completeActivityMutation.isPending}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                {completeActivityMutation.isPending ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Concluindo...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Marcar como Concluída</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {filteredPendentes.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="text-muted-foreground font-medium">Todas as atividades concluídas!</p>
                      <p className="text-sm text-muted-foreground">Excelente trabalho! 🎉</p>
                    </div>
                  )}
                </div>
              </div>
            </LiquidGlassCard>

            {/* Atividades Concluídas */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`relative overflow-hidden rounded-xl border shadow-lg transition-all duration-300 border-border/50 hover:border-border/80 group ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20'
                  : 'bg-gray-50/60 dark:bg-gray-800/40'
              }`}
            >
              <div className="relative py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20  transition-colors flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Concluídas</h2>
                      <p className="text-sm text-muted-foreground">{filteredConcluidas.length} atividades</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredConcluidas.map((atividade) => {
                    return (
                      <div key={atividade.id} className={`group relative p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                        isLiquidGlass
                          ? 'bg-transparent hover:bg-white/15 dark:hover:bg-gray-800/15 border-green-200/40 dark:border-green-800/40'
                          : 'bg-white/70 dark:bg-gray-800/70 border-green-200/60 dark:border-green-800/60 hover:bg-white/90 dark:hover:bg-gray-800/90'
                      }`}>
                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-foreground transition-colors">
                              {atividade.titulo}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            {atividade.descricao}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-xs">
                                <BookOpen className="h-3 w-3" />
                                <span className="font-medium">{atividade.disciplina}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                <CheckCircle className="h-3 w-3" />
                                <span className="font-bold">Concluída: {atividade.dataConclusao}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {filteredConcluidas.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="text-muted-foreground font-medium">Complete suas primeiras atividades!</p>
                      <p className="text-sm text-muted-foreground">Elas aparecerão aqui quando concluídas</p>
                    </div>
                  )}
                </div>
              </div>
            </LiquidGlassCard>

          </div>

        </div>
      </main>

      {/* Modal de Enviar Atividade */}
      <ModalEnviarAtividade
        isOpen={modalEnviarAtividadeOpen}
        onClose={() => {
          setModalEnviarAtividadeOpen(false)
          setAtividadeSelecionada(null)
        }}
        atividade={atividadeSelecionada}
        onEnviar={handleEnviarAtividade}
        isPending={uploadActivityMutation.isPending}
      />
    </div>
  )
}
