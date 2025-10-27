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
import { ArrowLeft, Users, FileText, CheckCircle, Plus, Edit, Trash2, Download, Upload, X } from "lucide-react"
import Link from "next/link"
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useRef, useState, useEffect } from 'react'
import { toast, toastInfo, toastImportSuccess, toastImportError, toastImportWarning } from '@/components/ui/toast'

export default function TurmaDetalhePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [notasImportadas, setNotasImportadas] = useState<Record<string, string>>({})
  const [isLiquidGlass, setIsLiquidGlass] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const turma = {
    nome: "9º Ano A",
    disciplina: "Matemática",
    alunos: 28,
    mediaGeral: 7.8,
    frequenciaMedia: 92,
  }

  const alunos = [
    { id: 1, nome: "Ana Silva", matricula: "231550652", media: 8.5, frequencia: 95, situacao: "Aprovado" },
    { id: 2, nome: "Bruno Santos", matricula: "231550653", media: 7.2, frequencia: 88, situacao: "Aprovado" },
    { id: 3, nome: "Carlos Oliveira", matricula: "231550654", media: 6.8, frequencia: 92, situacao: "Recuperação" },
    { id: 4, nome: "Diana Costa", matricula: "231550655", media: 9.1, frequencia: 98, situacao: "Aprovado" },
    { id: 5, nome: "Eduardo Lima", matricula: "231550656", media: 5.5, frequencia: 75, situacao: "Reprovado" },
  ]

  const atividades = [
    {
      id: 1,
      titulo: "Lista de Exercícios - Funções",
      tipo: "Exercício",
      prazo: "20/03/2024",
      entregues: 25,
      total: 28,
      status: "Ativa",
    },
    {
      id: 2,
      titulo: "Prova Bimestral",
      tipo: "Avaliação",
      prazo: "15/03/2024",
      entregues: 28,
      total: 28,
      status: "Concluída",
    },
    {
      id: 3,
      titulo: "Trabalho em Grupo",
      tipo: "Projeto",
      prazo: "25/03/2024",
      entregues: 12,
      total: 28,
      status: "Ativa",
    },
  ]

  const materiais = [
    { id: 1, nome: "Apostila - Funções Quadráticas", tipo: "PDF", data: "10/03/2024" },
    { id: 2, nome: "Lista de Exercícios 03", tipo: "PDF", data: "08/03/2024" },
    { id: 3, nome: "Vídeo Aula - Sistemas Lineares", tipo: "MP4", data: "05/03/2024" },
  ]

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
    toastInfo('Notas limpas', 'Todas as notas importadas foram removidas com sucesso.')
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
            <Link href="/dashboard/professor/turmas">
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="alunos">Alunos</TabsTrigger>
              <TabsTrigger value="atividades">Atividades</TabsTrigger>
              <TabsTrigger value="materiais">Materiais</TabsTrigger>
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
                          <LiquidGlassButton size="sm" variant="outline">
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
                  <LiquidGlassButton>
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
                          <LiquidGlassButton size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton size="sm" variant="outline">
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
                        <LiquidGlassButton size="sm">Ver Entregas</LiquidGlassButton>
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
                  <LiquidGlassButton>
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
                          <LiquidGlassButton size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </LiquidGlassButton>
                          <LiquidGlassButton size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </LiquidGlassButton>
                        </div>
                      </div>
                    </CardContent>
                  </LiquidGlassCard>
                ))}
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
                        <Input id="avaliacao" placeholder="Ex: Prova Bimestral" />
                      </div>
                      <div>
                        <Label htmlFor="peso" className="mb-2">Peso</Label>
                        <Input id="peso" type="number" placeholder="Ex: 4.0" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="descricao" className="mb-2">Descrição</Label>
                      <Textarea id="descricao" placeholder="Descrição da avaliação..." />
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
                            />
                            {notasImportadas[aluno.id] && (
                              <CheckCircle className="h-4 w-4 text-accent animate-in fade-in duration-200" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <LiquidGlassButton className="w-full">Salvar Notas</LiquidGlassButton>
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
    </div>
  )
}
