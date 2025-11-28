"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Download, 
  FileText, 
  X,
  CheckCircle,
  Clock,
  MessageSquare
} from "lucide-react"
import { apiClient } from '@/lib/api-client'
import { downloadSubmissionFile } from "@/src/services/activitiesService"

interface SubmissionFile {
  url: string
  originalName: string
  fileName: string
}

interface ModalVerEntregaProps {
  isOpen: boolean
  onClose: () => void
  activityId: string
  studentId: string
  activityTitle: string
  submissionId?: string | null
  grade?: number | null
  maxScore?: number | null
}

export function ModalVerEntrega({ 
  isOpen, 
  onClose, 
  activityId,
  studentId,
  activityTitle,
  submissionId,
  grade,
  maxScore
}: ModalVerEntregaProps) {
  const [loading, setLoading] = useState(false)
  const [submissionDetails, setSubmissionDetails] = useState<{
    fileUrls: string[] | null
    comment: string | null
    submittedAt: string | null
    grade: number | null
  } | null>(null)
  const [filesDetailed, setFilesDetailed] = useState<SubmissionFile[]>([])
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen && submissionId) {
      loadSubmissionDetails()
    } else if (isOpen && !submissionId) {
      // Try to get submission details from activityId and studentId
      loadSubmissionFromActivity()
    }
  }, [isOpen, submissionId, activityId, studentId])

  const loadSubmissionDetails = async () => {
    if (!submissionId) return
    
    setLoading(true)
    try {
      // Get detailed files
      const filesData = await apiClient.getSubmissionFilesDetailed(submissionId)
      setFilesDetailed(filesData.files || [])
      
      // Get submission details
      const details = await apiClient.getActivitySubmissionDetails(activityId, studentId)
      setSubmissionDetails({
        fileUrls: details.fileUrls,
        comment: details.comment,
        submittedAt: details.submittedAt,
        grade: details.grade ?? grade ?? null
      })
    } catch (error) {
      console.error('Erro ao carregar detalhes da submissão:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissionFromActivity = async () => {
    setLoading(true)
    try {
      const details = await apiClient.getActivitySubmissionDetails(activityId, studentId)
      setSubmissionDetails({
        fileUrls: details.fileUrls,
        comment: details.comment,
        submittedAt: details.submittedAt,
        grade: details.grade ?? grade ?? null
      })
      
      // If we have a submission ID from details, get files
      if (details.id) {
        try {
          const filesData = await apiClient.getSubmissionFilesDetailed(details.id)
          setFilesDetailed(filesData.files || [])
        } catch (err) {
          // If detailed files endpoint fails, use fileUrls directly
          if (details.fileUrls && details.fileUrls.length > 0) {
            setFilesDetailed(details.fileUrls.map((url, idx) => ({
              url,
              originalName: url.split('/').pop() || `arquivo-${idx + 1}`,
              fileName: url.split('/').pop() || `arquivo-${idx + 1}`
            })))
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar submissão:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadFile = async (file: SubmissionFile) => {
    if (!submissionId && !submissionDetails) return
    
    const submissionIdToUse = submissionId || (submissionDetails as any)?.id
    if (!submissionIdToUse) return

    setDownloadingFiles(prev => new Set(prev).add(file.url))
    try {
      const { blob, fileName } = await downloadSubmissionFile(submissionIdToUse, file.url)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.originalName || fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao fazer download:', error)
    } finally {
      setDownloadingFiles(prev => {
        const next = new Set(prev)
        next.delete(file.url)
        return next
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado'
    try {
      return new Date(dateString).toLocaleString('pt-BR')
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{activityTitle}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Nota */}
              {submissionDetails?.grade !== null && submissionDetails?.grade !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold">Nota:</span>
                      </div>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        {submissionDetails.grade.toFixed(2)}
                        {maxScore && ` / ${maxScore.toFixed(2)}`}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data de Entrega */}
              {submissionDetails?.submittedAt && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="font-semibold">Data de Entrega: </span>
                        <span>{formatDate(submissionDetails.submittedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Arquivos */}
              {filesDetailed.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">Arquivos Enviados ({filesDetailed.length})</span>
                    </div>
                    <div className="space-y-2">
                      {filesDetailed.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{file.originalName || file.fileName}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadFile(file)}
                            disabled={downloadingFiles.has(file.url)}
                          >
                            {downloadingFiles.has(file.url) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Baixar
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comentário */}
              {submissionDetails?.comment && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-semibold block mb-2">Comentário:</span>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {submissionDetails.comment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!submissionDetails && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma informação de entrega disponível.
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

