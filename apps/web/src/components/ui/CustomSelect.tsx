'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { useFloatingPopover } from './useFloatingPopover'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value: string
  options: readonly SelectOption[] | SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  popoverWidth?: number
  size?: 'sm' | 'md'
  disabled?: boolean
}

const triggerBase = 'neu-inset rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors disabled:cursor-not-allowed disabled:opacity-50'

export default function CustomSelect({
  value,
  options,
  onChange,
  placeholder,
  className = '',
  popoverWidth = 0,
  size = 'md',
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const popoverStyle = useFloatingPopover(btnRef, 'data-cs', popoverWidth, 220, open, () => setOpen(false))

  const selected = options.find(o => o.value === value)
  const label = selected?.label ?? placeholder ?? ''

  const sizeCls = size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-11 px-3.5 text-sm'

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`${triggerBase} ${sizeCls} ${className} flex items-center justify-between gap-2 font-medium`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div data-cs role="listbox" aria-label={placeholder ?? 'Seleccionar'} style={popoverStyle}>
          <div className="neu-raised max-h-[min(320px,calc(100vh-24px))] overflow-y-auto rounded-2xl border border-border/50 bg-surface py-1" onClick={e => e.stopPropagation()}>
            {options.map(opt => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/30 ${
                    isSelected
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'text-foreground hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
