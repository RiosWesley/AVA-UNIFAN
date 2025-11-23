"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react"

export type CarouselImage = {
  src: string
  alt?: string
}

type CarouselProps = {
  images: CarouselImage[]
  intervalMs?: number
  className?: string
  heightClass?: string
  showIndicators?: boolean
  showArrows?: boolean
  rounded?: string
  enableLightbox?: boolean
}

export function Carousel({
  images,
  intervalMs = 4000,
  className,
  heightClass = "h-56 md:h-64 lg:h-72",
  showIndicators = true,
  showArrows = true,
  rounded = "rounded-2xl",
  enableLightbox = true,
}: CarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const timeoutRef = useRef<number | null>(null)

  const total = images.length
  const validImages = useMemo(() => images.filter((img) => !!img?.src), [images])

  useEffect(() => {
    if (total <= 1) return
    if (isPaused) return

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      setCurrent((prev) => (prev + 1) % total)
    }, intervalMs)

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [current, intervalMs, isPaused, total])

  if (validImages.length === 0) return null

  const goTo = (index: number) => setCurrent((index + total) % total)
  const prev = () => goTo(current - 1)
  const next = () => goTo(current + 1)

  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index)
      setLightboxOpen(true)
    }
  }

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }, [validImages.length])

  const lightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % validImages.length)
  }, [validImages.length])

  // Navegação por teclado no lightbox
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        lightboxPrev()
      } else if (e.key === 'ArrowRight') {
        lightboxNext()
      } else if (e.key === 'Escape') {
        setLightboxOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, lightboxPrev, lightboxNext])

  return (
    <>
      <div
        className={cn(
          "relative w-full overflow-hidden border border-border/50",
          rounded,
          className
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={cn("relative w-full", heightClass)}>
          {validImages.map((img, index) => (
            <div
              key={img.src + index}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                index === current ? "opacity-100" : "opacity-0",
                enableLightbox && "cursor-pointer"
              )}
              onClick={() => openLightbox(index)}
            >
              <Image
                src={img.src}
                alt={img.alt ?? ""}
                fill
                className={cn("object-cover", rounded)}
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/10 pointer-events-none" />
              {enableLightbox && (
                <div className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors pointer-events-auto">
                  <Maximize2 className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>

      {showArrows && total > 1 && (
        <>
          <button
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center",
              "h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white",
              "backdrop-blur-sm transition-colors cursor-pointer"
            )}
            onClick={prev}
            aria-label="Anterior"
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center",
              "h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white",
              "backdrop-blur-sm transition-colors cursor-pointer"
            )}
            onClick={next}
            aria-label="Próximo"
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {showIndicators && total > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
          {validImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-2.5 rounded-full transition-all cursor-pointer",
                i === current ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80"
              )}
              aria-label={`Ir para slide ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>

    {/* Lightbox Modal */}
    {enableLightbox && lightboxOpen && validImages.length > 0 && (
      <div 
        className="fixed inset-0 z-[100] bg-black/95 dark:bg-black/95 flex items-center justify-center"
        onClick={() => setLightboxOpen(false)}
      >
        {/* Botão Fechar */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setLightboxOpen(false)
          }}
          className="absolute top-4 right-4 z-[101] bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black/90 text-gray-900 dark:text-white p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg cursor-pointer"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Botão Anterior */}
        {validImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              lightboxPrev()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[101] bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black/90 text-gray-900 dark:text-white p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg cursor-pointer"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Imagem */}
        <div 
          className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-full">
            <Image
              src={validImages[lightboxIndex].src}
              alt={validImages[lightboxIndex].alt ?? ""}
              fill
              className="object-contain"
              sizes="95vw"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Botão Próximo */}
        {validImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              lightboxNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[101] bg-white/90 dark:bg-black/70 hover:bg-white dark:hover:bg-black/90 text-gray-900 dark:text-white p-3 rounded-full backdrop-blur-sm transition-colors shadow-lg cursor-pointer"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Indicadores */}
        {validImages.length > 1 && (
          <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[101] flex items-center gap-2 bg-white/90 dark:bg-black/70 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {validImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all cursor-pointer",
                  i === lightboxIndex 
                    ? "w-8 bg-gray-900 dark:bg-white" 
                    : "w-2 bg-gray-400 dark:bg-white/60 hover:bg-gray-600 dark:hover:bg-white/80"
                )}
                aria-label={`Ir para imagem ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Contador */}
        {validImages.length > 1 && (
          <div className="absolute top-4 left-4 z-[101] bg-white/90 dark:bg-black/70 text-gray-900 dark:text-white px-3 py-1 rounded-full backdrop-blur-sm text-sm shadow-lg font-medium cursor-default">
            {lightboxIndex + 1} / {validImages.length}
          </div>
        )}
      </div>
    )}
    </>
  )
}

export default Carousel
