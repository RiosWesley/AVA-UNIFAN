"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, type ChatThread, type ChatMessage, type Notice } from '@/lib/api-client'

export const comunicacaoKeys = {
  chatThreads: (studentId: string) => ['chatThreads', studentId] as const,
  chatMessages: (studentId: string, classId: string) => ['chatMessages', studentId, classId] as const,
  notices: (studentId: string) => ['studentNotices', studentId] as const,
}

export function useChatThreads(studentId: string) {
  return useQuery({
    queryKey: comunicacaoKeys.chatThreads(studentId),
    queryFn: (): Promise<ChatThread[]> => apiClient.getChatThreads(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useChatMessages(params: { studentId: string; classId?: string | null }) {
  const { studentId, classId } = params
  return useQuery({
    queryKey: comunicacaoKeys.chatMessages(studentId, classId || ''),
    queryFn: (): Promise<ChatMessage[]> => apiClient.getChatMessages(studentId, classId as string),
    enabled: !!studentId && !!classId,
    staleTime: 1000 * 30,
  })
}

export function useSendChatMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vars: { studentId: string; classId: string; content: string }) => apiClient.sendChatMessage(vars),
    onMutate: async (vars) => {
      const queryKey = comunicacaoKeys.chatMessages(vars.studentId, vars.classId)
      await qc.cancelQueries({ queryKey })
      const previous = qc.getQueryData<ChatMessage[]>(queryKey) || []
      const tempId = `optimistic-${Date.now()}`
      const optimistic: any = {
        id: tempId,
        author: 'aluno',
        content: vars.content,
        sentAt: new Date().toISOString(),
        __optimistic: true,
      }
      qc.setQueryData<ChatMessage[]>(queryKey, [...previous, optimistic])
      return { previous, tempId, queryKey, vars }
    },
    onError: (_error, _vars, ctx) => {
      if (!ctx) return
      qc.setQueryData<ChatMessage[]>(ctx.queryKey, (current) => {
        if (!current) return current as any
        return current.map((m: any) => {
          if (m.id === ctx.tempId) {
            return { ...m, __optimistic: false, __error: true }
          }
          return m
        })
      })
    },
    onSuccess: (data, _vars, ctx) => {
      if (!ctx) return
      qc.setQueryData<ChatMessage[]>(ctx.queryKey, (current) => {
        if (!current) return [data]
        const index = (current as any[]).findIndex((m) => (m as any).id === ctx.tempId)
        if (index !== -1) {
          const copy: any[] = [...(current as any[])]
          copy[index] = data
          return copy as ChatMessage[]
        }
        return [...current, data]
      })
    },
    onSettled: (_res, _err, vars, _ctx) => {
      qc.invalidateQueries({ queryKey: comunicacaoKeys.chatMessages(vars.studentId, vars.classId) })
      qc.invalidateQueries({ queryKey: comunicacaoKeys.chatThreads(vars.studentId) })
    }
  })
}

export function useStudentNotices(studentId: string) {
  return useQuery({
    queryKey: comunicacaoKeys.notices(studentId),
    queryFn: (): Promise<Notice[]> => apiClient.getNoticesForStudent(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  })
}


