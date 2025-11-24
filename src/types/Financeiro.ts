export type InstallmentStatus = 'paid' | 'pending' | 'scheduled' | 'overdue'

export type PaymentMethod = 'pix' | 'credit_card' | 'bank_slip' | 'bank_transfer'

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'canceled' | 'scheduled'

export type ContactMethod = 'email' | 'phone' | 'in_person'

export type ReportType = 'revenue' | 'expenses' | 'defaulting' | 'cash_flow' | 'complete'

export type ReportPeriod = 'month' | 'quarter' | 'semester' | 'year'

export type ReportFormat = 'pdf' | 'excel' | 'csv'

export type PeriodFilter = 'month' | 'quarter' | 'semester' | 'year'

export type CashFlowGroupBy = 'day' | 'week' | 'month'

export interface FinancialSummary {
  totalAnnual: number
  totalPaid: number
  totalPending: number
  nextDueDate: string | null
  accumulatedDiscount: number
  totalInstallments: number
}

export interface Installment {
  id: string
  month: string
  year: number
  value: number
  dueDate: string
  status: InstallmentStatus
  paymentDate?: string
  discount: number
  installmentNumber: number
  totalInstallments: number
}

export interface Payment {
  id: string
  description: string
  value: number
  paymentDate: string
  method: PaymentMethod | null
  status: PaymentStatus
  receiptUrl: string | null
  installmentId: string | null
}

export interface AdminFinancialSummary {
  monthlyRevenue: number
  monthlyExpenses: number
  netProfit: number
  defaultRate: number
  totalStudents: number
  defaultingStudents: number
  profitMargin: number
}

export interface FinancialEvolution {
  period: string
  revenue: number
  expenses: number
  profit: number
}

export interface RevenueCategory {
  category: string
  value: number
  percentage: number
}

export interface ExpenseCategory {
  category: string
  value: number
  percentage: number
}

export interface DefaultingStudent {
  id: string
  studentId: string
  name: string
  email: string
  phone: string | null
  classId: string | null
  className: string | null
  totalDue: number
  monthsOverdue: number
  lastContactDate: string | null
  installments: Installment[]
}

export interface CashFlowItem {
  date: string
  income: number
  outcome: number
  balance: number
}

export interface ReportRequest {
  type: ReportType
  period: ReportPeriod
  startDate?: string
  endDate?: string
  format: ReportFormat
}

export interface ReportResponse {
  reportId: string
  downloadUrl: string
  expiresAt: string
}

export interface CreateChargeRequest {
  studentId: string
  amount: number
  dueDate: string
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus
}

export interface ContactRegistration {
  contactDate: string
  contactMethod: ContactMethod
  notes?: string
}

export interface AdminFinancialSummaryParams {
  period?: PeriodFilter
  startDate?: string
  endDate?: string
}

export interface FinancialEvolutionParams {
  period?: PeriodFilter
  startDate?: string
  endDate?: string
}

export interface CategoryParams {
  period?: PeriodFilter
  startDate?: string
  endDate?: string
}

export interface DefaultingStudentsParams {
  search?: string
  classId?: string
  minMonths?: number
  maxMonths?: number
}

export interface CashFlowParams {
  startDate: string
  endDate: string
  groupBy?: CashFlowGroupBy
}

export interface CreatePaymentRequest {
  installmentId: string
  method: PaymentMethod
  value: number
}

