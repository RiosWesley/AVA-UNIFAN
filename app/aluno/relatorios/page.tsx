"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { LiquidGlassCard } from "@/components/liquid-glass"
import { LIQUID_GLASS_DEFAULT_INTENSITY } from "@/components/liquid-glass/config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toastSuccess, toastError } from "@/components/ui/toast"
import { BarChart3, FileText, CheckCircle2, XCircle, GraduationCap } from "lucide-react"

type Relatorio = {
  id: string
  nome: string
  tipo: "PDF" | "CSV" | "XLSX"
  codigo: string
}

export default function RelatoriosAlunoPage() {
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [carregandoId, setCarregandoId] = useState<string | null>(null)

  useEffect(() => {
    const checkTheme = () => setIsLiquidGlass(document.documentElement.classList.contains("liquid-glass"))
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const relatorios: Relatorio[] = useMemo(() => ([
    { id: "R001", nome: "Histórico de Notas", tipo: "PDF", codigo: "ALN-HT-NOTAS" },
    { id: "R002", nome: "Boletim Consolidado", tipo: "PDF", codigo: "ALN-BLT-CONS" },
    { id: "R003", nome: "Frequência por Disciplina", tipo: "CSV", codigo: "ALN-FRQ-DISC" },
    { id: "R004", nome: "Agenda Semanal", tipo: "PDF", codigo: "ALN-AGD-SMAN" },
    { id: "R005", nome: "Atividades Pendentes", tipo: "XLSX", codigo: "ALN-ATV-PEND" },
  ]), [])

  const emitirRelatorio = async (r: Relatorio) => {
    setCarregandoId(r.id)
    try {
      // Mock de emissão (simulação de sucesso/erro aleatório)
      await new Promise((resolve) => setTimeout(resolve, 900))
      const deuCerto = Math.random() > 0.25
      if (!deuCerto) {
        throw new Error("Falha ao gerar o relatório. Tente novamente.")
      }
      toastSuccess("Relatório emitido com sucesso!", `${r.nome} (${r.tipo}) • Código: ${r.codigo}`)
    } catch (err: any) {
      toastError("Erro ao emitir relatório", err?.message || "Erro inesperado")
    } finally {
      setCarregandoId(null)
    }
  }

  return (
    <div className={`flex h-screen ${isLiquidGlass ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-background'}`}>
      <Sidebar userRole="aluno" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-6">
          <div className={`flex items-center justify-between p-6 rounded-2xl border backdrop-blur-sm ${
            isLiquidGlass
              ? 'bg-black/30 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/50'
              : 'bg-gray-50/60 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-600/90 flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">Relatórios</h1>
                <p className="text-muted-foreground">Emita relatórios acadêmicos sempre que precisar</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs">Aluno</Badge>
            </div>
          </div>

          <LiquidGlassCard
            intensity={LIQUID_GLASS_DEFAULT_INTENSITY}
            className={`${
              isLiquidGlass
                ? 'bg-black/30 dark:bg-gray-800/20'
                : 'bg-gray-50/60 dark:bg-gray-800/40'
            }`}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                Relatórios Disponíveis
              </CardTitle>
              <CardDescription>Selecione o relatório desejado e clique em emitir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-b border-green-200 dark:border-green-800">
                    <tr className="text-center">
                      <th className="py-3 px-2 font-semibold text-center">Nome</th>
                      <th className="py-3 px-2 font-semibold text-center">Tipo</th>
                      <th className="py-3 px-2 font-semibold text-center">Código</th>
                      <th className="py-3 px-2 font-semibold text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorios.map((r) => (
                      <tr key={r.id} className="border-t text-center">
                        <td className="py-3 px-2 text-center">
                          <div className="font-medium inline-flex items-center gap-2 justify-center">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {r.nome}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className="text-xs">{r.tipo}</Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <code className="px-2 py-1 rounded bg-muted text-xs">{r.codigo}</code>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={carregandoId === r.id}
                            onClick={() => emitirRelatorio(r)}
                            className="inline-flex items-center gap-2"
                          >
                            {carregandoId === r.id ? (
                              <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                                Emitindo...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Emitir
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </LiquidGlassCard>
        </div>
      </main>
    </div>
  )
}


