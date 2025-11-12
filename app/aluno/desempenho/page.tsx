"use client"

import { useState, useEffect } from "react"
import { Sidebar } from '@/components/layout/sidebar'
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { BarChart3, LineChart, Award, TrendingUp, GraduationCap, Star, Clock, Trophy, Target, Zap, ChevronUp, ChevronDown, Sparkles, Calendar, Badge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStudentPerformance } from "@/src/services/desempenhoService"
import { PerformanceData } from "@/src/types/Desempenho"

export default function DesempenhoPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [animatedValues, setAnimatedValues] = useState<{[key: string]: number}>({})

   const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkTheme = () => setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const loadPerformanceData = async () => {
      try {
        // MOCKADO POR ENQUANTO
        const studentId = '29bc17a4-0b68-492b-adef-82718898d9eb';
        const data = await getStudentPerformance(studentId);
        setPerformanceData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPerformanceData();

    return () => observer.disconnect();
  }, []);

  if (isLoading) return <div className="flex h-screen items-center justify-center"><p>Carregando desempenho...</p></div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500"><p>Erro: {error}</p></div>;
  if (!performanceData) return <div className="flex h-screen items-center justify-center"><p>Nenhum dado de desempenho encontrado.</p></div>;

  const getConceitoColor = (conceito: string) => {
    switch (conceito) {
      case 'Excelente': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/50 dark:to-emerald-900/50 dark:text-green-300 border-green-200 dark:border-green-800'
      case 'Ótimo': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/50 dark:to-cyan-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800'
      case 'Bom': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 dark:from-yellow-900/50 dark:to-orange-900/50 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'Regular': return 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 dark:from-orange-900/50 dark:to-red-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800'
      case 'Insuficiente': return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 dark:from-red-900/50 dark:to-pink-900/50 dark:text-red-300 border-red-200 dark:border-red-800'
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 dark:from-gray-900/50 dark:to-slate-900/50 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    }
  }

  const getRaridadeConfig = (raridade: string) => {
    switch (raridade) {
      case 'comum': return { color: 'bg-gray-500', text: 'Comum', icon: Award }
      case 'raro': return { color: 'bg-blue-500', text: 'Raro', icon: Star }
      case 'epico': return { color: 'bg-purple-500', text: 'Épico', icon: Trophy }
      case 'lendario': return { color: 'bg-yellow-500', text: 'Lendário', icon: Sparkles }
      default: return { color: 'bg-gray-500', text: 'Comum', icon: Award }
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up': return <ChevronUp className="h-3 w-3 text-green-500" />
      case 'down': return <ChevronDown className="h-3 w-3 text-red-500" />
      default: return <div className="h-3 w-3 rounded-full bg-gray-400" />
    }
  }

  const AnimatedCounter = ({ value, suffix = '', delay = 0 }: { value: number, suffix?: string, delay?: number }) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
      const timer = setTimeout(() => {
        const increment = value / 50
        const counter = setInterval(() => {
          setDisplayValue(prev => {
            if (prev >= value) {
              clearInterval(counter)
              return value
            }
            return prev + increment
          })
        }, 20)
        return () => clearInterval(counter)
      }, delay)

      return () => clearTimeout(timer)
    }, [value, delay])

    return <span>{displayValue.toFixed(1)}{suffix}</span>
  }

  const { metrics, recentGrades, performanceByDiscipline } = performanceData;

  const barColors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];



  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          {/* Header com gradiente e animações */}
          <div className={`flex items-center justify-between mb-8 p-6 rounded-xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
                  Meu Desempenho
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Acompanhe seu progresso acadêmico e conquistas com métricas detalhadas
                </p>
              </div>
            </div>
          </div>
          
          {/* Métricas Animadas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metrica, index) => {
              const Icon = 
                metrica.title.includes('Média') ? GraduationCap :
                metrica.title.includes('Melhor') ? Star :
                metrica.title.includes('Disciplinas') ? TrendingUp :
                Clock;
                
              const counterKey = metrica.title.toLowerCase().replace(' ', '').replace('ç', 'c').replace('á', 'a')
              return (
                <LiquidGlassCard
                  key={index}
                  intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
                  className={`group transition-all duration-300 border border-border/50 hover:border-border/80 ${
                    isLiquidGlass ? 'bg-black/30 dark:bg-gray-800/20' : 'bg-gray-50/60 dark:bg-gray-800/40'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{metrica.title}</div>
                      <div className={`p-2 ${metrica.title.includes('Média') || metrica.title.includes('Melhor') ? 'bg-green-500/20' :
                        metrica.title.includes('Disciplinas') ? 'bg-blue-500/20' :
                        metrica.title.includes('Frequência') ? 'bg-purple-500/20' : 'bg-gray-500/20'
                      } rounded-lg group-hover:bg-green-500/30 transition-colors`}>
                        <Icon className={`h-5 w-5 ${metrica.title.includes('Média') || metrica.title.includes('Melhor') ? 'text-green-600 dark:text-green-400' :
                          metrica.title.includes('Disciplinas') ? 'text-blue-600 dark:text-blue-400' :
                          metrica.title.includes('Frequência') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${metrica.title.includes('Média') || metrica.title.includes('Melhor') ? 'text-green-600 dark:text-green-400' :
                      metrica.title.includes('Disciplinas') ? 'text-blue-600 dark:text-blue-400' :
                      metrica.title.includes('Frequência') ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      <AnimatedCounter value={metrica.value} />
                      <span className="text-xl">{metrica.displayValue.replace(/[\d,.]+/g, '')}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{metrica.description}</p>
                    {metrica.trend && (
                      <div className="flex items-center mt-2">
                        <ChevronUp className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">{metrica.trend}</span>
                      </div>
                    )}
                  </div>
                </LiquidGlassCard>
              )
            })}
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">            
            {/* Gráfico de Barras Interativo */}
            <LiquidGlassCard
              intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
              className={`col-span-3 ${
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20'
                : 'bg-gray-50/60 dark:bg-gray-800/40'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Performance por Disciplina</h2>
                  </div>

                <div className="h-64 w-full">
                <div className="flex justify-around h-full gap-2 px-2">
                              
                  {performanceByDiscipline.map((item, i) => (
                    <div key={i} className="flex flex-col justify-end items-center w-full group">
                                  
                      <div 
                      className={`w-full max-w-16 ${barColors[i % barColors.length]} rounded-t-lg shadow-lg group-hover:opacity-80 transition-all duration-300 flex items-center justify-center`}
                        style={{
                        height: `${Math.max(item.nota, 0.5) * 10}%`
                        }}
                        >
                          <span className="text-white font-bold text-sm">{item.nota.toFixed(1)}</span>
                      </div>
                        <span className="text-xs font-medium mt-2 text-center break-words">{item.disc}</span>
                      </div>
                  ))}
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
