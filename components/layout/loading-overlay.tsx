"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function LoadingOverlay() {
  const pathname = usePathname()

  useEffect(() => {
    // Se estiver na página inicial, remove imediatamente
    if (pathname === "/" || pathname === null) {
      const loading = document.getElementById("initial-loading")
      if (loading) {
        loading.style.opacity = "0"
        loading.style.transition = "opacity 0.3s ease-out"
        setTimeout(() => {
          loading.remove()
        }, 300)
      }
      return
    }

    // Para outras páginas, aguarda o conteúdo estar pronto
    // Remove o loading inicial assim que detectar que o React hidratou e há estrutura da página
    let checkCount = 0
    const maxChecks = 50 // máximo de 5 segundos (50 * 100ms)
    
    const removeLoading = () => {
      const loading = document.getElementById("initial-loading")
      if (!loading) return
      
      checkCount++
      
      // Verifica se há sidebar (indica que a estrutura da página está montada - PageLoading ou conteúdo)
      const sidebar = document.body.querySelector('aside')
      
      // Se há sidebar, significa que o React hidratou e está mostrando PageLoading ou conteúdo
      // Verifica se a sidebar está realmente visível (não apenas no DOM)
      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect()
        const isSidebarVisible = sidebarRect.width > 0 && sidebarRect.height > 0
        
        if (isSidebarVisible) {
          // Aguarda frames para garantir que a sidebar está completamente renderizada
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              loading.style.opacity = "0"
              loading.style.transition = "opacity 0.3s ease-out"
              setTimeout(() => {
                loading.remove()
              }, 300)
            })
          })
          return
        }
      }
      
      // Se não há sidebar ainda, verifica se há conteúdo direto (páginas sem sidebar)
      const main = document.querySelector('main')
      const hasMainContent = main && main.children.length > 0
      const hasRealContent = document.querySelector('article') ||
                            document.querySelector('[role="main"]') ||
                            (main && (
                              main.querySelector('div[class*="card"]') ||
                              main.querySelector('table') ||
                              main.querySelector('section') ||
                              main.querySelector('h1, h2, h3')
                            ))
      
      if (hasRealContent || checkCount >= maxChecks) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            loading.style.opacity = "0"
            loading.style.transition = "opacity 0.3s ease-out"
            setTimeout(() => {
              loading.remove()
            }, 300)
          })
        })
      } else {
        // Se não está pronto ainda, tenta novamente
        setTimeout(removeLoading, 100)
      }
    }

    // Aguarda um pouco para o React hidratar antes de começar a verificar
    const timeout = setTimeout(() => {
      removeLoading()
    }, 100)

    // Fallback de segurança - remove após 2 segundos no máximo
    const fallback = setTimeout(() => {
      const loading = document.getElementById("initial-loading")
      if (loading) {
        loading.style.opacity = "0"
        loading.style.transition = "opacity 0.3s ease-out"
        setTimeout(() => {
          loading.remove()
        }, 300)
      }
    }, 2000)

    return () => {
      clearTimeout(timeout)
      clearTimeout(fallback)
    }
  }, [pathname])

  return null
}

