import { Lock, Trophy, ShoppingCart, Receipt, Clock, CalendarCheck, Sparkles } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'

const PLACEHOLDER_BADGES = [
  { icon: Trophy, label: 'Primer movimiento' },
  { icon: Receipt, label: 'Primer ticket' },
  { icon: Clock, label: 'Gastos fijos al día' },
  { icon: CalendarCheck, label: 'Mes bajo control' },
  { icon: ShoppingCart, label: 'Supermercado' },
  { icon: Sparkles, label: 'Datos limpios' },
]

export function AchievementsPreviewCard() {
  return (
    <LiquidGlass variant="card" intensity="medium" className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-foreground">Logros</h3>
          <p className="text-sm text-muted-foreground">
            Medallas que vas desbloqueando con tus hábitos financieros
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {PLACEHOLDER_BADGES.map((badge) => (
          <div key={badge.label} className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-soft/50 opacity-40">
              <div className="relative">
                <badge.icon className="h-7 w-7 text-muted-foreground" />
                <Lock className="absolute -right-2 -top-2 h-3.5 w-3.5 text-muted-foreground/60" />
              </div>
            </div>
            <span className="text-center text-[10px] leading-tight text-muted-foreground/60">
              {badge.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground/40">
        Próximamente — más desafíos y recompensas en camino
      </p>
    </LiquidGlass>
  )
}
