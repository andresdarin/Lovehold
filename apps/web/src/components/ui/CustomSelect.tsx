'use client'
import { ChevronDown } from 'lucide-react'
export interface SelectOption { value: string; label: string }
interface Props {
  value: string; options: readonly SelectOption[]; onChange: (value: string) => void
  placeholder?: string; className?: string; popoverWidth?: number
  size?: 'sm' | 'md'; disabled?: boolean; id?: string; ariaLabel?: string
}
/** Native selection provides keyboard navigation, typeahead and the mobile picker. */
export default function CustomSelect({ value, options, onChange, placeholder, className = '', size = 'md', disabled = false, id, ariaLabel }: Props) {
  return <div className={`relative ${className}`}>
    <select id={id} value={value} onChange={event => onChange(event.target.value)} disabled={disabled}
      aria-label={ariaLabel || placeholder || 'Seleccionar opción'}
      className={`min-h-11 w-full appearance-none rounded-xl border border-border bg-surface pl-3 pr-9 text-foreground focus:border-primary disabled:opacity-50 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  </div>
}

