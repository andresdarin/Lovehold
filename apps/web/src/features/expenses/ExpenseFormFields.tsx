import { Heart, User, Receipt, ChevronDown, Calendar } from 'lucide-react'
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
    <div className="rounded-xl border-[0.5px] border-white/[0.08] bg-[#121214]/60 backdrop-blur-[20px] p-4 transition-all duration-200 select-none flex flex-col gap-3">
      {/* Header plano */}
      <div className="pb-3 border-b-[0.5px] border-white/[0.08] flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Receipt className="h-[18px] w-[18px] text-foreground" />
          <h2 className="text-[15px] font-medium text-foreground">Datos generales</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {isPersonal
            ? 'Gasto personal, no se divide con nadie.'
            : 'El ticket se guarda como gasto compartido 50/50.'}
        </p>
      </div>

      {/* Toggle de Tipo de Gasto */}
      <div className="flex h-10 gap-1 rounded-lg border border-white/[0.08] bg-black/35 p-1">
        <button
          type="button"
          onClick={() => onUpdate('scope', 'personal')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all ${
            isPersonal 
              ? 'bg-white/[0.08] border border-white/[0.08] text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)]' 
              : 'text-muted-foreground hover:text-foreground bg-transparent border border-transparent'
          }`}
        >
          <User className="h-4 w-4" />
          Personal
        </button>
        <button
          type="button"
          onClick={() => onUpdate('scope', 'household')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-all ${
            !isPersonal 
              ? 'bg-white/[0.08] border border-white/[0.08] text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)]' 
              : 'text-muted-foreground hover:text-foreground bg-transparent border border-transparent'
          }`}
        >
          <Heart className="h-4 w-4" />
          Lovehold
        </button>
      </div>

      {/* Campos de Formulario */}
      <div className="flex flex-col gap-4">
        <TextField label="Título" value={form.title} onChange={(v) => onUpdate('title', v)} placeholder="Compra Tata" required />
        <TextField label="Comercio" value={form.merchant} onChange={(v) => onUpdate('merchant', v)} placeholder="Tata" />
        <TextField label="Categoría general" value={form.category} onChange={(v) => onUpdate('category', v)} placeholder="Compras de súper" required isSelect />
        
        <div className="block">
          <span className="text-[11px] font-normal uppercase tracking-[0.05em] text-muted-foreground">Fecha</span>
          <div className="relative mt-1">
            <CustomDatePicker
              className="w-full text-sm font-normal h-11 rounded-md border border-white/[0.08] bg-black/35 px-3 text-foreground focus:border-primary/45 focus:outline-none transition-colors"
              value={form.date}
              onChange={(v) => onUpdate('date', v)}
              required
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
          value={isPersonal ? 'Solo para vos' : '50/50 por ahora'}
          onChange={() => undefined}
          disabled
        />

        {/* Notas */}
        <label className="block">
          <span className="text-[11px] font-normal uppercase tracking-[0.05em] text-muted-foreground">Notas</span>
          <textarea
            value={form.notes} 
            onChange={(e) => onUpdate('notes', e.target.value)}
            placeholder="Algo útil para recordar esta compra"
            className="mt-1 min-h-[80px] w-full resize-none rounded-md border border-white/[0.08] bg-black/35 px-3 py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground focus:border-primary/45 focus:outline-none transition-colors"
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
      <span className="text-[11px] font-normal uppercase tracking-[0.05em] text-muted-foreground">{label}</span>
      <div className="relative mt-1">
        <input
          type={type} value={value} min={min} step={step} required={required} disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-md border border-white/[0.08] bg-black/35 px-3 pr-10 text-sm font-normal text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 focus:border-primary/45 focus:outline-none transition-colors"
        />
        {isSelect && (
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
      </div>
    </label>
  )
}
