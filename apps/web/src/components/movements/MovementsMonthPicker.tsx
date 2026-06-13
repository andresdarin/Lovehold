'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useFloatingPopover } from '../ui/useFloatingPopover'
import { MONTH_LABELS_ES, getCurrentMonth, formatMonthLabel } from './constants'

interface Props {
  value: string
  onChange: (value: string) => void
}

const inputBase = 'h-11 rounded-xl border border-border bg-surface-soft text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export default function MovementsMonthPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const popoverStyle = useFloatingPopover(btnRef, 'data-mp', 300, 320, open, () => setOpen(false))

  const [year, setYear] = useState(() => {
    const [y] = value.split('-').map(Number)
    return y || new Date().getFullYear()
  })

  function pick(month: number) {
    onChange(`${year}-${String(month).padStart(2, '0')}`)
    setOpen(false)
  }

  const selMonth = Number(value.split('-')[1])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          const [y] = value.split('-').map(Number)
          setYear(y || new Date().getFullYear())
          setOpen(o => !o)
        }}
        className={`${inputBase} flex w-40 items-center gap-2 px-4 font-medium`}
      >
        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-left">{value ? formatMonthLabel(value) : 'Todos los meses'}</span>
      </button>

      {open && createPortal(
        <div data-mp role="dialog" aria-modal="true" aria-label="Seleccionar mes" style={popoverStyle}>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <button type="button" onClick={() => setYear(y => y - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                aria-label="Año anterior"><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-sm font-bold text-foreground">{year}</span>
              <button type="button" onClick={() => setYear(y => y + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                aria-label="Año siguiente"><ChevronRight className="h-4 w-4" /></button>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {MONTH_LABELS_ES.map((label, i) => {
                const m = i + 1
                const sel = value && Number(value.split('-')[0]) === year && selMonth === m
                return (
                  <button key={m} type="button" onClick={() => pick(m)}
                    className={`rounded-xl px-2 py-2.5 text-center text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${sel ? 'bg-primary text-white shadow-sm' : 'text-foreground hover:bg-surface-soft'}`}
                    aria-label={`${label} de ${year}`}>
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <button type="button" onClick={() => { onChange(getCurrentMonth()); setOpen(false) }}
                className="flex-1 rounded-xl bg-surface-soft px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                Este mes
              </button>
              <button type="button" onClick={() => { onChange(''); setOpen(false) }}
                className="flex-1 rounded-xl bg-surface-soft px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
                Borrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
