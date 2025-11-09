"use client"

import { cn } from "@/lib/utils"
import { GraduationCap } from "lucide-react"

interface PageSpinnerProps {
  className?: string
}

export function PageSpinner({ className }: PageSpinnerProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-full w-full",
      className
    )}>
      {/* Container principal com animação de pulso */}
      <div className="relative">
        {/* Círculos concêntricos animados */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-4 border-green-200/30 dark:border-green-900/30 rounded-full animate-ping" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-24 h-24 border-4 border-green-300/50 dark:border-green-800/50 rounded-full animate-ping" 
            style={{ animationDelay: '0.5s', animationDuration: '2s' }} 
          />
        </div>
        
        {/* Spinner principal */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-green-200 dark:border-green-800 rounded-full">
            <div className="w-full h-full border-4 border-transparent border-t-green-600 dark:border-t-green-400 rounded-full animate-spin" />
          </div>
          
          {/* Ícone central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-green-600 dark:text-green-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Texto de carregamento */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-foreground/70 animate-pulse">
          Carregando...
        </p>
        <div className="flex gap-1">
          <div 
            className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0s' }} 
          />
          <div 
            className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0.2s' }} 
          />
          <div 
            className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0.4s' }} 
          />
        </div>
      </div>
    </div>
  )
}

