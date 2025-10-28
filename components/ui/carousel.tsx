"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
}

export function Carousel({
  images,
  intervalMs = 4000,
  className,
  heightClass = "h-56 md:h-64 lg:h-72",
  showIndicators = true,
  showArrows = true,
  rounded = "rounded-2xl",
}: CarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
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

  return (
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
              index === current ? "opacity-100" : "opacity-0"
            )}
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
          </div>
        ))}
      </div>

      {showArrows && total > 1 && (
        <>
          <button
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center",
              "h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white",
              "backdrop-blur-sm transition-colors"
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
              "backdrop-blur-sm transition-colors"
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
                "h-2.5 rounded-full transition-all",
                i === current ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80"
              )}
              aria-label={`Ir para slide ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel
