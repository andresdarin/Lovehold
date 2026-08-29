import { Users, User, Receipt, ChevronDown } from 'lucide-react'
import CustomDatePicker from '@/components/ui/CustomDatePicker'
import type { ExpenseForm } from './types'

export default function ExpenseFormFields({
  form, profileName, onUpdate,
}: {
  form: ExpenseForm
  profileName: string
  onUpdate: (field: keyof ExpenseForm, value: string) => void
}) {
  const isPersonal = form.scope === 'personal'

  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs transition-all flex flex-col gap-4">
      {/* Header */}
      <div className="pb-3 border-b border-border/70 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Receipt className="h-[18px] w-[18px] text-primary" />
          <h2 className="text-sm font-bold text-foreground">Datos generales</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {isPersonal
            ? 'Gasto personal, no se divide con nadie.'
            : 'El ticket se guarda como gasto compartido en pareja (50/50).'}
        </p>
      </div>

      {/* Toggle de Tipo de Gasto */}
      <div className="flex h-11 gap-1 rounded-2xl border border-border bg-surface-soft p-1">
        <button
          type="button"
          onClick={() => onUpdate('scope', 'personal')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
            isPersonal 
              ? 'bg-surface border border-border/80 text-foreground shadow-xs' 
              : 'text-muted-foreground hover:text-foreground bg-transparent border border-transparent'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Personal
        </button>
        <button
          type="button"
          onClick={() => onUpdate('scope', 'household')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all ${
            !isPersonal 
              ? 'bg-surface border border-border/80 text-foreground shadow-xs' 
              : 'text-muted-foreground hover:text-foreground bg-transparent border border-transparent'
          }`}
        >
          <Users className="h-3.5 w-3.5 text-primary" />
          En pareja
        </button>
      </div>

      {/* Campos de Formulario */}
      <div className="flex flex-col gap-4">
        <TextField label="Título" value={form.title} onChange={(v) => onUpdate('title', v)} placeholder="Compra Tata" required />
        <TextField label="Comercio" value={form.merchant} onChange={(v) => onUpdate('merchant', v)} placeholder="Tata" />
        <TextField label="Categoría general" value={form.category} onChange={(v) => onUpdate('category', v)} placeholder="Compras de súper" required isSelect />
        
        <div className="block">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Fecha</span>
          <div className="relative mt-1.5">
            <CustomDatePicker
              className="w-full text-sm font-medium h-11 rounded-2xl border border-border bg-surface-soft px-3.5 text-foreground focus:border-primary focus:outline-none transition-colors"
              value={form.date}
              onChange={(v) => onUpdate('date', v)}
              required
            />
          </div>
        </div>

        <TextField label="Método de pago" value={form.paymentMethod} onChange={(v) => onUpdate('paymentMethod', v)} placeholder="Débito VISA" isSelect />
        <TextField label="Total declarado" type="number" min="0" step="0.01" value={form.amount} onChange={(v) => onUpdate('amount', v)} placeholder="0.00" required />
        
        {isPersonal ? (
          <TextField label="Pagado por" value="Vos" onChange={() => undefined} disabled />
        ) : (
          <TextField label="Pagado por" value={profileName} onChange={() => undefined} disabled />
        )}
        
        <TextField
          label="División"
          value={isPersonal ? 'Solo para vos' : '50/50 en pareja'}
          onChange={() => undefined}
          disabled
        />

        {/* Notas */}
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Notas</span>
          <textarea
            value={form.notes} 
            onChange={(e) => onUpdate('notes', e.target.value)}
            placeholder="Algo útil para recordar esta compra"
            className="mt-1.5 min-h-[80px] w-full resize-none rounded-2xl border border-border bg-surface-soft px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </label>
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder, type = 'text', disabled = false, required = false, min, step, isSelect = false }: {
  label: string; value: string; onChange: (value: string) => void
  placeholder?: string; type?: string; disabled?: boolean; required?: boolean; min?: string; step?: string
  isSelect?: boolean
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="relative mt-1.5">
        <input
          type={type} value={value} min={min} step={step} required={required} disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-2xl border border-border bg-surface-soft px-3.5 pr-10 text-sm font-medium text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 focus:border-primary focus:outline-none transition-colors"
        />
        {isSelect && (
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
      </div>
    </label>
  )
}
