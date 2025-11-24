import api from './api'
import type {
  FinancialSummary,
  Installment,
  Payment,
  AdminFinancialSummary,
  AdminFinancialSummaryParams,
  FinancialEvolution,
  FinancialEvolutionParams,
  RevenueCategory,
  ExpenseCategory,
  CategoryParams,
  DefaultingStudent,
  DefaultingStudentsParams,
  CashFlowItem,
  CashFlowParams,
  ReportRequest,
  ReportResponse,
  ContactRegistration,
  CreatePaymentRequest,
  CreateChargeRequest,
  PaymentStatus,
  UpdatePaymentStatusRequest,
} from '../types/Financeiro'

export const getStudentFinancialSummary = async (studentId: string): Promise<FinancialSummary> => {
  try {
    const response = await api.get<FinancialSummary>(`/financial/students/${studentId}/summary`)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro do aluno:', error)
    throw new Error('Não foi possível carregar o resumo financeiro.')
  }
}

export const getStudentInstallments = async (studentId: string): Promise<Installment[]> => {
  try {
    const response = await api.get<Installment[]>(`/financial/students/${studentId}/installments`)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar mensalidades do aluno:', error)
    throw new Error('Não foi possível carregar as mensalidades.')
  }
}

export const getStudentPayments = async (studentId: string): Promise<Payment[]> => {
  try {
    const response = await api.get<Payment[]>(`/financial/students/${studentId}/payments`)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error)
    throw new Error('Não foi possível carregar o histórico de pagamentos.')
  }
}

export const downloadReceipt = async (studentId: string, paymentId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/financial/students/${studentId}/receipts/${paymentId}`, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.error('Erro ao baixar comprovante:', error)
    throw new Error('Não foi possível baixar o comprovante.')
  }
}

export const createPayment = async (
  studentId: string,
  data: CreatePaymentRequest
): Promise<Payment> => {
  try {
    const response = await api.post<Payment>(`/financial/students/${studentId}/payments`, data)
    return response.data
  } catch (error) {
    console.error('Erro ao criar pagamento:', error)
    throw new Error('Não foi possível processar o pagamento.')
  }
}

export const createCharge = async (data: CreateChargeRequest): Promise<Payment> => {
  try {
    const response = await api.post<Payment>('/payments', data)
    return response.data
  } catch (error) {
    console.error('Erro ao criar cobrança:', error)
    throw new Error('Não foi possível criar a cobrança.')
  }
}

export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus
): Promise<Payment> => {
  try {
    const response = await api.patch<Payment>(`/payments/${paymentId}`, { status } satisfies UpdatePaymentStatusRequest)
    return response.data
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error)
    throw new Error('Não foi possível atualizar o pagamento.')
  }
}

export const getAdminFinancialSummary = async (
  params?: AdminFinancialSummaryParams
): Promise<AdminFinancialSummary> => {
  try {
    const response = await api.get<AdminFinancialSummary>('/financial/admin/summary', { params })
    return response.data
  } catch (error) {
    console.error('Erro ao buscar resumo financeiro do administrador:', error)
    throw new Error('Não foi possível carregar o resumo financeiro.')
  }
}

export const getRevenueEvolution = async (
  params?: FinancialEvolutionParams
): Promise<FinancialEvolution[]> => {
  try {
    const response = await api.get<FinancialEvolution[]>('/financial/admin/revenue/evolution', {
      params,
    })
    return response.data
  } catch (error) {
    console.error('Erro ao buscar evolução de receitas:', error)
    throw new Error('Não foi possível carregar a evolução financeira.')
  }
}

export const getRevenueByCategory = async (params?: CategoryParams): Promise<RevenueCategory[]> => {
  try {
    const response = await api.get<RevenueCategory[]>('/financial/admin/revenue/by-category', {
      params,
    })
    return response.data
  } catch (error) {
    console.error('Erro ao buscar receitas por categoria:', error)
    throw new Error('Não foi possível carregar as receitas por categoria.')
  }
}

export const getExpensesByCategory = async (
  params?: CategoryParams
): Promise<ExpenseCategory[]> => {
  try {
    const response = await api.get<ExpenseCategory[]>('/financial/admin/expenses/by-category', {
      params,
    })
    return response.data
  } catch (error) {
    console.error('Erro ao buscar despesas por categoria:', error)
    throw new Error('Não foi possível carregar as despesas por categoria.')
  }
}

export const getDefaultingStudents = async (
  params?: DefaultingStudentsParams
): Promise<DefaultingStudent[]> => {
  try {
    const response = await api.get<DefaultingStudent[]>('/financial/admin/defaulting-students', {
      params,
    })
    return response.data
  } catch (error) {
    console.error('Erro ao buscar alunos inadimplentes:', error)
    throw new Error('Não foi possível carregar os alunos inadimplentes.')
  }
}

export const registerContact = async (
  studentId: string,
  data: ContactRegistration
): Promise<void> => {
  try {
    await api.post(`/financial/admin/defaulting-students/${studentId}/contact`, data)
  } catch (error) {
    console.error('Erro ao registrar contato:', error)
    throw new Error('Não foi possível registrar o contato.')
  }
}

export const getCashFlow = async (params?: CashFlowParams): Promise<CashFlowItem[]> => {
  try {
    const response = await api.get<CashFlowItem[]>('/financial/admin/cash-flow', { params })
    return response.data
  } catch (error) {
    console.error('Erro ao buscar fluxo de caixa:', error)
    throw new Error('Não foi possível carregar o fluxo de caixa.')
  }
}

export const generateReport = async (request: ReportRequest): Promise<ReportResponse> => {
  try {
    const response = await api.post<ReportResponse>('/financial/admin/reports/generate', request)
    return response.data
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    throw new Error('Não foi possível gerar o relatório.')
  }
}

