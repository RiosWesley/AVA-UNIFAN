"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Sun, Sunset, Moon } from "lucide-react"
import type { DayOfWeek, ShiftType, Shift } from "@/src/services/availability-service"

interface ShiftGridProps {
  selectedShifts: Shift[]
  onChange: (shifts: Shift[]) => void
  disabled?: boolean
}

const DAYS: Array<{ id: DayOfWeek; label: string; shortLabel: string }> = [
  { id: 'segunda-feira', label: 'Segunda-feira', shortLabel: 'Seg' },
  { id: 'terca-feira', label: 'Terça-feira', shortLabel: 'Ter' },
  { id: 'quarta-feira', label: 'Quarta-feira', shortLabel: 'Qua' },
  { id: 'quinta-feira', label: 'Quinta-feira', shortLabel: 'Qui' },
  { id: 'sexta-feira', label: 'Sexta-feira', shortLabel: 'Sex' },
]

const SHIFTS: Array<{ id: ShiftType; label: string; icon: typeof Sun; color: string }> = [
  { id: 'morning', label: 'Manhã', icon: Sun, color: 'yellow' },
  { id: 'afternoon', label: 'Tarde', icon: Sunset, color: 'orange' },
  { id: 'evening', label: 'Noite', icon: Moon, color: 'blue' },
]

export function ShiftGrid({ selectedShifts, onChange, disabled = false }: ShiftGridProps) {
  const toggleShift = (day: DayOfWeek, shift: ShiftType) => {
    if (disabled) return

    const exists = selectedShifts.some(
      s => s.dayOfWeek === day && s.shift === shift
    )

    if (exists) {
      onChange(selectedShifts.filter(
        s => !(s.dayOfWeek === day && s.shift === shift)
      ))
    } else {
      onChange([...selectedShifts, { dayOfWeek: day, shift }])
    }
  }

  const isSelected = (day: DayOfWeek, shift: ShiftType) => {
    return selectedShifts.some(
      s => s.dayOfWeek === day && s.shift === shift
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 font-semibold text-sm text-muted-foreground border-b">
                Dia da Semana
              </th>
              {SHIFTS.map((shift) => {
                const Icon = shift.icon
                return (
                  <th
                    key={shift.id}
                    className="text-center p-3 font-semibold text-sm text-muted-foreground border-b"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Icon className={cn(
                        "h-5 w-5",
                        shift.color === 'yellow' && 'text-yellow-600 dark:text-yellow-400',
                        shift.color === 'orange' && 'text-orange-600 dark:text-orange-400',
                        shift.color === 'blue' && 'text-blue-600 dark:text-blue-400'
                      )} />
                      <span>{shift.label}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr
                key={day.id}
                className="border-b hover:bg-muted/50 transition-colors"
              >
                <td className="p-3 font-medium text-sm">
                  <div className="flex flex-col">
                    <span>{day.label}</span>
                    <span className="text-xs text-muted-foreground">{day.shortLabel}</span>
                  </div>
                </td>
                {SHIFTS.map((shift) => {
                  const selected = isSelected(day.id, shift.id)
                  return (
                    <td key={shift.id} className="p-3 text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleShift(day.id, shift.id)}
                          disabled={disabled}
                          className={cn(
                            "h-5 w-5",
                            selected && shift.color === 'yellow' && 'border-yellow-600 data-[state=checked]:bg-yellow-600',
                            selected && shift.color === 'orange' && 'border-orange-600 data-[state=checked]:bg-orange-600',
                            selected && shift.color === 'blue' && 'border-blue-600 data-[state=checked]:bg-blue-600'
                          )}
                        />
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedShifts.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Selecione pelo menos um turno em um dia da semana
        </p>
      )}
    </div>
  )
}



