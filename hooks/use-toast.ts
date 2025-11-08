import { toast as toastFunction } from '@/components/ui/toast'

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info'

interface ToastProps {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

/**
 * Hook para exibir notificações toast
 * Compatível com a API do shadcn/ui
 */
export function useToast() {
  return {
    toast: (props: ToastProps) => {
      const { variant = 'default', ...rest } = props
      
      // Mapeia variantes do shadcn/ui para as variantes do nosso componente
      let mappedVariant: 'success' | 'error' | 'warning' | 'info' = 'info'
      
      if (variant === 'destructive') {
        mappedVariant = 'error'
      } else if (variant === 'success') {
        mappedVariant = 'success'
      } else if (variant === 'warning') {
        mappedVariant = 'warning'
      } else if (variant === 'default') {
        mappedVariant = 'info'
      } else {
        mappedVariant = variant as 'success' | 'error' | 'warning' | 'info'
      }
      
      return toastFunction({
        variant: mappedVariant,
        ...rest
      })
    }
  }
}

/**
 * Função de conveniência para usar toast diretamente sem hook
 * Compatível com a API do shadcn/ui
 */
export function toast(props: ToastProps) {
  const { variant = 'default', ...rest } = props
  
  // Mapeia variantes do shadcn/ui para as variantes do nosso componente
  let mappedVariant: 'success' | 'error' | 'warning' | 'info' = 'info'
  
  if (variant === 'destructive') {
    mappedVariant = 'error'
  } else if (variant === 'success') {
    mappedVariant = 'success'
  } else if (variant === 'warning') {
    mappedVariant = 'warning'
  } else if (variant === 'default') {
    mappedVariant = 'info'
  } else {
    mappedVariant = variant as 'success' | 'error' | 'warning' | 'info'
  }
  
  return toastFunction({
    variant: mappedVariant,
    ...rest
  })
}

