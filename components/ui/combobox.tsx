'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"

export interface ComboboxOption {
  id: string
  label: string
}

interface ComboboxProps {
  placeholder?: string
  options: ComboboxOption[]
  value: string | null
  onChange: (value: string | null) => void
  onSearch?: (query: string) => void
  allowCustomInput?: boolean
}

export function Combobox({
  placeholder,
  options,
  value,
  onChange,
  onSearch,
  allowCustomInput = false,
}: ComboboxProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const selectedLabel = useMemo(() => options.find(o => o.id === value)?.label ?? "", [options, value])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter(o => o.label.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <Input
        placeholder={placeholder}
        value={open ? (value ? selectedLabel : query) : (value ? selectedLabel : query)}
        onChange={(e) => {
          const next = e.target.value
          setOpen(true)
          setQuery(next)
          if (allowCustomInput) onChange(null)
          onSearch?.(next)
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum resultado</div>
          ) : (
            <ul className="py-1">
              {filtered.map(opt => (
                <li
                  key={opt.id}
                  className="px-3 py-2 text-sm hover:bg-muted cursor-pointer"
                  onClick={() => {
                    onChange(opt.id)
                    setQuery("")
                    setOpen(false)
                  }}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}


