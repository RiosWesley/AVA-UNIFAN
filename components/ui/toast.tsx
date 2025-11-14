import * as React from 'react'
import { toast as sonnerToast } from 'sonner'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  variant?: ToastVariant
  title?: string
  description?: string
  duration?: number
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100',
  },
}

export function toast({ variant = 'info', title, description, duration = 4000 }: ToastProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return sonnerToast.custom((t) => (
    <div className={cn(
      'flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all',
      config.className
    )}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold text-sm">{title}</div>}
        {description && (
          <div className="text-sm opacity-90 mt-1 whitespace-pre-line">
            {description}
          </div>
        )}
      </div>
      <button
        onClick={() => sonnerToast.dismiss(t)}
        className="opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ), {
    duration,
  })
}

export function toastSuccess(title: string, description?: string) {
  return toast({ variant: 'success', title, description })
}

export function toastError(title: string, description?: string) {
  return toast({ variant: 'error', title, description })
}

export function toastWarning(title: string, description?: string) {
  return toast({ variant: 'warning', title, description })
}

export function toastInfo(title: string, description?: string) {
  return toast({ variant: 'info', title, description })
}

// Funções de conveniência para casos específicos
export function toastImportSuccess(count: number, errors: string[] = []) {
  const title = `${count} notas importadas com sucesso!`
  const description = errors.length > 0
    ? `⚠️ ${errors.length} erro(s) encontrado(s):\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`
    : undefined

  return toast({ variant: 'success', title, description, duration: 6000 })
}

export function toastImportError(title: string, description?: string) {
  return toast({ variant: 'error', title, description })
}

export function toastImportWarning(title: string, description?: string) {
  return toast({ variant: 'warning', title, description })
}
