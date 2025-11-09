"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard, LiquidGlassButton } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { GraduationCap, Download, Calendar, Award, Trophy, Medal } from "lucide-react"
import { getStudentGradebook } from "@/src/services/BoletimService"

const UNIDADES_PADRAO = ["1ª Unidade", "2ª Unidade", "Prova Final", "Média Final"];

export default function AlunoBoletimPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false);
  const [gradebook, setGradebook] = useState<GradebookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkTheme = () => {
      setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    const loadGradebookData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const studentId = '29bc17a4-0b68-492b-adef-82718898d9eb';
        const data = await getStudentGradebook(studentId);
        setGradebook(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadGradebookData();

    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando boletim...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        <p>Erro: {error}</p>
      </div>
    );
  }

  if (!gradebook || gradebook.disciplinas.length === 0) {
    return (
      <div className="flex h-screen">
        <Sidebar userRole="aluno" />
        <main className="flex-1 p-8 text-center">
          <h1 className="text-2xl font-bold">Boletim Digital</h1>
          <p className="mt-4">Nenhuma disciplina encontrada ou você ainda não está matriculado.</p>
        </main>
      </div>
    );
  }

  const { geral, disciplinas } = gradebook;

  const processarNotasDisciplina = (disciplina: any) => {
    const notasMap = new Map(
      disciplina.notas.map((n: { unidade: string; nota: number | null }) => [
        n.unidade,
        n.nota,
      ]),
    );
    const notasCompletas = UNIDADES_PADRAO.map(unidade => {
      if (unidade === "Média Final") {
        return { unidade, nota: disciplina.media };
      }
      return {
        unidade,
        nota: notasMap.has(unidade) ? notasMap.get(unidade) : null,
      };
    });
    return notasCompletas;
  };

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className={`flex items-center justify-between mb-8 p-6 rounded-xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                  <Award className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                  Boletim Digital
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Suas notas e desempenho acadêmico
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    <Trophy className="h-3 w-3 mr-1" />
                    Média: {geral.mediaGeral.toFixed(1)}
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                    <Medal className="h-3 w-3 mr-1" />
                    {geral.disciplinasAprovadas}/{geral.totalDisciplinas} aprovadas
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
              }`}>
                <Download className="h-5 w-5 mr-2 text-emerald-600" />
                <span className="font-semibold">Exportar PDF</span>
              </LiquidGlassButton>
              <LiquidGlassButton variant="outline" size="lg" className={`backdrop-blur-sm ${
                isLiquidGlass
                  ? 'bg-black/30 dark:bg-gray-800/20 hover:bg-black/50 dark:hover:bg-gray-800/30'
                  : 'bg-gray-50/60 dark:bg-gray-800/40 hover:bg-black/80 dark:hover:bg-gray-800/60'
              }`}>
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                <span className="font-semibold">Histórico</span>
              </LiquidGlassButton>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Desempenho por Disciplina</h2>
            {disciplinas.map((disciplina, index) => {
              const notasCompletas = processarNotasDisciplina(disciplina);
              return (
              <LiquidGlassCard
                key={index}
                intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                className={`group transition-all duration-300 border border-border/50 hover:border-border/80 ${
                  isLiquidGlass
                    ? 'bg-black/30 dark:bg-gray-800/20'
                    : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-green-600`}>
                        <GraduationCap className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">{disciplina.disciplina}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 text-base">{disciplina.codigo}</CardDescription>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge
                            variant={disciplina.situacao === "Aprovado" ? "default" : "destructive"}
                            className={
                              disciplina.situacao === "Aprovado" ? "bg-green-500 text-white" :
                              disciplina.situacao === "Recuperação" ? "bg-orange-500 text-white" :
                              disciplina.situacao === "Reprovado" ? "bg-red-500 text-white" :
                              "bg-blue-500 text-white"
                            }
                          >
                            {disciplina.situacao}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                      Notas por unidade
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {notasCompletas.map((nota, noteIndex) => (
                        <div
                          key={noteIndex}
                          className={`rounded-xl p-3 text-center border transition-all duration-300 ${
                            isLiquidGlass
                              ? 'bg-transparent hover:bg-white/10 dark:hover:bg-gray-800/10 border-gray-200/30 dark:border-gray-700/30'
                              : 'bg-white/60 dark:bg-gray-800/60 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80'
                          }`}
                        >
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {nota.unidade}
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{nota.nota !== null ? nota.nota.toFixed(1) : '-'}</p>
                          <div className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                            nota.nota === null ? "bg-gray-500" :
                            nota.nota >= 8 ? "bg-green-500" :
                            nota.nota >= 7 ? "bg-yellow-500" : "bg-red-500"
                          }`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </LiquidGlassCard>
            )})}
          </div>
        </div>
      </main>
    </div>
  )
}