"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStudentFinancialSummary,
  getStudentInstallments,
  getStudentPayments,
  downloadReceipt,
  createPayment,
  getAdminFinancialSummary,
  getRevenueEvolution,
  getRevenueByCategory,
  getExpensesByCategory,
  getDefaultingStudents,
  registerContact,
  getCashFlow,
  generateReport,
  createCharge,
  updatePaymentStatus,
} from '@/src/services/financeiroService'
import type {
  AdminFinancialSummaryParams,
  FinancialEvolutionParams,
  CategoryParams,
  DefaultingStudentsParams,
  CashFlowParams,
  ReportRequest,
  ContactRegistration,
  CreatePaymentRequest,
  CreateChargeRequest,
  PaymentStatus,
} from '@/src/types/Financeiro'

export const financeiroQueryKeys = {
  studentSummary: (studentId: string) => ['financeiro', 'student', 'summary', studentId] as const,
  studentInstallments: (studentId: string) =>
    ['financeiro', 'student', 'installments', studentId] as const,
  studentPayments: (studentId: string) => ['financeiro', 'student', 'payments', studentId] as const,
  adminSummary: (params?: AdminFinancialSummaryParams) =>
    ['financeiro', 'admin', 'summary', params] as const,
  revenueEvolution: (params?: FinancialEvolutionParams) =>
    ['financeiro', 'admin', 'revenue', 'evolution', params] as const,
  revenueByCategory: (params?: CategoryParams) =>
    ['financeiro', 'admin', 'revenue', 'category', params] as const,
  expensesByCategory: (params?: CategoryParams) =>
    ['financeiro', 'admin', 'expenses', 'category', params] as const,
  defaultingStudents: (params?: DefaultingStudentsParams) =>
    ['financeiro', 'admin', 'defaulting', params] as const,
  cashFlow: (params?: CashFlowParams) => ['financeiro', 'admin', 'cash-flow', params] as const,
}

export function useStudentFinancialSummary(studentId: string) {
  return useQuery({
    queryKey: financeiroQueryKeys.studentSummary(studentId),
    queryFn: () => getStudentFinancialSummary(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useStudentInstallments(studentId: string) {
  return useQuery({
    queryKey: financeiroQueryKeys.studentInstallments(studentId),
    queryFn: () => getStudentInstallments(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useStudentPayments(studentId: string) {
  return useQuery({
    queryKey: financeiroQueryKeys.studentPayments(studentId),
    queryFn: () => getStudentPayments(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useDownloadReceipt() {
  return useMutation({
    mutationFn: ({ studentId, paymentId }: { studentId: string; paymentId: string }) =>
      downloadReceipt(studentId, paymentId),
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: CreatePaymentRequest }) =>
      createPayment(studentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: financeiroQueryKeys.studentPayments(variables.studentId),
      })
      queryClient.invalidateQueries({
        queryKey: financeiroQueryKeys.studentInstallments(variables.studentId),
      })
      queryClient.invalidateQueries({
        queryKey: financeiroQueryKeys.studentSummary(variables.studentId),
      })
      queryClient.invalidateQueries({
        queryKey: ['financeiro', 'admin', 'defaulting'],
      })
      queryClient.invalidateQueries({
        queryKey: financeiroQueryKeys.adminSummary(),
      })
    },
  })
}

export function useAdminFinancialSummary(params?: AdminFinancialSummaryParams) {
  return useQuery({
    queryKey: financeiroQueryKeys.adminSummary(params),
    queryFn: () => getAdminFinancialSummary(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useRevenueEvolution(params?: FinancialEvolutionParams) {
  return useQuery({
    queryKey: financeiroQueryKeys.revenueEvolution(params),
    queryFn: () => getRevenueEvolution(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useRevenueByCategory(params?: CategoryParams) {
  return useQuery({
    queryKey: financeiroQueryKeys.revenueByCategory(params),
    queryFn: () => getRevenueByCategory(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useExpensesByCategory(params?: CategoryParams) {
  return useQuery({
    queryKey: financeiroQueryKeys.expensesByCategory(params),
    queryFn: () => getExpensesByCategory(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useDefaultingStudents(params?: DefaultingStudentsParams) {
  return useQuery({
    queryKey: financeiroQueryKeys.defaultingStudents(params),
    queryFn: () => getDefaultingStudents(params),
    staleTime: 1000 * 60 * 2,
  })
}

export function useRegisterContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: string; data: ContactRegistration }) =>
      registerContact(studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeiro', 'admin', 'defaulting'] })
    },
  })
}

export function useCashFlow(params?: CashFlowParams) {
  return useQuery({
    queryKey: financeiroQueryKeys.cashFlow(params),
    queryFn: () => getCashFlow(params),
    staleTime: 1000 * 60 * 5,
  })
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (request: ReportRequest) => generateReport(request),
  })
}

export function useCreateCharge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateChargeRequest) => createCharge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeiro', 'admin', 'defaulting'] })
      queryClient.invalidateQueries({ queryKey: financeiroQueryKeys.adminSummary() })
    },
  })
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: string; status: PaymentStatus; studentId?: string }) =>
      updatePaymentStatus(paymentId, status),
    onSuccess: (_, variables) => {
      if (variables.studentId) {
        queryClient.invalidateQueries({ queryKey: financeiroQueryKeys.studentPayments(variables.studentId) })
        queryClient.invalidateQueries({ queryKey: financeiroQueryKeys.studentInstallments(variables.studentId) })
        queryClient.invalidateQueries({ queryKey: financeiroQueryKeys.studentSummary(variables.studentId) })
      }
      queryClient.invalidateQueries({ queryKey: ['financeiro', 'admin', 'defaulting'] })
    },
  })
}

