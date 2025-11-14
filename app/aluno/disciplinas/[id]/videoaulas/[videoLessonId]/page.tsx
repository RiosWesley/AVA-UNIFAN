"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Film, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import { apiClient, type VideoLesson } from "@/lib/api-client"
import { cn } from "@/lib/utils"

export default function VideoAulaPage() {
  const params = useParams() as { id: string; videoLessonId: string }
  const classId = params.id
  const videoLessonId = params.videoLessonId
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const lessonsQuery = useQuery({
    queryKey: ["video-lessons", classId],
    queryFn: () => apiClient.getVideoLessonsByClass(classId),
    enabled: !!classId,
  })

  const details: VideoLesson | undefined = useMemo(() => {
    const list = lessonsQuery.data || []
    return list.find((v: any) => String(v.id) === String(videoLessonId))
  }, [lessonsQuery.data, videoLessonId])

  const streamQuery = useQuery({
    queryKey: ["video-lesson-stream", classId, videoLessonId],
    queryFn: () => apiClient.getVideoLessonStreamUrl(classId, videoLessonId),
    enabled: !!classId && !!videoLessonId,
    staleTime: 9 * 60 * 1000,
  })

  const attachments: string[] =
    ((details as any)?.attachmentUrls || (details as any)?.attachment_urls || []) as string[]
  const fallbackAttachment =
    attachments.find((u) => /\.(mp4|webm|ogg)(\?|$)/i.test(u)) || ""
  const legacyUrl = (details as any)?.videoUrl || (details as any)?.video_url || ""

  const src = streamQuery.data?.url || fallbackAttachment || legacyUrl || ""

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/aluno/disciplinas/${classId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                {details?.title ?? "Vídeo-aula"}
              </h1>
              {details?.durationSeconds ? (
                <p className="text-xs text-muted-foreground">
                  Duração:{" "}
                  {`${Math.floor((details.durationSeconds || 0) / 60)}:${String(
                    Math.floor((details.durationSeconds || 0) % 60)
                  ).padStart(2, "0")}`}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Duração: 00:00</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="w-full p-0">
          <div className="flex min-h-[70vh]">
            {/* Sidebar de navegação */}
            <aside className={cn("border-r border-border/50 bg-background/95 backdrop-blur transition-all duration-200", collapsed ? "w-14" : "w-80")}>
              <div className={cn("border-b border-border/50 flex items-center", collapsed ? "justify-center p-2" : "justify-between p-4 bg-gradient-to-r from-primary/15 to-primary/5")}>
                <div className="flex items-center gap-2 text-foreground">
                  <Film className="h-5 w-5 text-primary" />
                  {!collapsed && <h4 className="font-semibold">Trilha de vídeo-aulas</h4>}
                </div>
                {!collapsed ? (
                  <Button aria-label="Recolher trilha" title="Recolher trilha" variant="ghost" size="icon" onClick={() => setCollapsed(true)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button aria-label="Expandir trilha" title="Expandir trilha" variant="ghost" size="icon" onClick={() => setCollapsed(false)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className={cn("overflow-y-auto", collapsed ? "p-2 h-[calc(100%-48px)]" : "p-3 space-y-2 h-[calc(100%-64px)]")}>
                {(lessonsQuery.data || []).map((v: any, idx: number) => {
                  const idStr = String(v.id)
                  const selected = idStr === String(videoLessonId)
                  const titulo = v.title || "Sem título"
                  const duracaoSec = v.durationSeconds || v.duration_seconds || 0
                  const duracao = duracaoSec ? `${Math.floor(duracaoSec / 60)}:${String(Math.floor(duracaoSec % 60)).padStart(2, '0')}` : "00:00"
                  const visto = Boolean(v.watched)
                  return (
                    <button
                      key={idStr}
                      className={cn(
                        "w-full rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 hover:bg-accent/25",
                        selected ? "bg-accent/25" : "",
                        collapsed ? "p-2" : "p-3 text-left"
                      )}
                      onClick={() => router.push(`/aluno/disciplinas/${classId}/videoaulas/${idStr}`)}
                    >
                      {collapsed ? (
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <Film className="h-4 w-4 text-primary" />
                            <span className={cn("absolute -top-1 -right-1 h-2 w-2 rounded-full", visto ? "bg-green-500" : "bg-amber-500")} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Film className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm text-foreground">{titulo}</span>
                            </div>
                            {visto ? (
                              <span className="text-xs text-green-600 flex items-center gap-1"><Eye className="h-3 w-3" /> Visto</span>
                            ) : (
                              <span className="text-xs text-amber-600 flex items-center gap-1"><EyeOff className="h-3 w-3" /> Pendente</span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{duracao}</span>
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </aside>

            {/* Player */}
            <div className="flex-1 ml-0">
              <div className="min-h-[70vh] bg-black rounded-none overflow-hidden shadow-none grid grid-rows-[1fr_auto]">
                {src ? (
                  <video
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                    src={src}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p>Preparando o vídeo...</p>
                    </div>
                  </div>
                )}
                <div className="p-3 bg-gradient-to-t from-black/60 to-transparent text-white flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  <span className="text-sm">
                    {details?.title ?? "Vídeo-aula"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


