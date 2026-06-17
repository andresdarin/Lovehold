import { Trophy, ShoppingCart, Receipt, Clock, CalendarCheck, Sparkles, Lock, CheckCircle2 } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'

const PLACEHOLDER_BADGES = [
  { icon: Trophy, label: 'Primer movimiento', unlocked: true, desc: 'Registraste tu primer gasto.' },
  { icon: Receipt, label: 'Primer ticket', unlocked: true, desc: 'Subiste tu primer ticket.' },
  { icon: Clock, label: 'Gastos fijos al día', unlocked: false, desc: 'Pagaste todos tus gastos recurrentes.' },
  { icon: CalendarCheck, label: 'Mes bajo control', unlocked: false, desc: 'Terminaste un mes dentro del presupuesto.' },
  { icon: ShoppingCart, label: 'Supermercado', unlocked: false, desc: 'Registraste una compra de supermercado.' },
  { icon: Sparkles, label: 'Datos limpios', unlocked: false, desc: 'Asignaste categorías correctas a tus gastos.' },
]

/**
 * Featured achievements section with improved contrast for locked badges.
 * Unlocked badges come first with coral accent; locked badges are visible
 * but clearly differentiated via opacity, not removed from the layout.
 */
export function FeaturedAchievements() {
  const unlocked = PLACEHOLDER_BADGES.filter((b) => b.unlocked)
  const locked = PLACEHOLDER_BADGES.filter((b) => !b.unlocked)
  const sorted = [...unlocked, ...locked]

  return (
    <LiquidGlass variant="card" intensity="medium" className="p-6 border border-white/5">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-foreground">Logros destacados</h2>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {unlocked.length} de {PLACEHOLDER_BADGES.length} desbloqueados
          </p>
        </div>
        <button
          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md px-2 py-1"
          aria-label="Ver todos los logros"
        >
          Ver todos
        </button>
      </div>

      {/* Badges grid — unlocked first, locked with lower contrast */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {sorted.map((badge) => {
          const Icon = badge.icon
          return (
            <div
              key={badge.label}
              className="group relative flex flex-col items-center gap-3 text-center transition-all duration-300"
              title={badge.desc}
              role="img"
              aria-label={`Logro: ${badge.label}. ${badge.unlocked ? 'Desbloqueado' : 'Bloqueado'}`}
            >
              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-300 ${
                  badge.unlocked
                    ? 'border-primary/25 bg-primary/[0.06] text-primary group-hover:scale-105 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:shadow-lg group-hover:shadow-primary/5'
                    : 'border-border/40 bg-surface-soft/15 text-muted-foreground/60 group-hover:border-border/60 group-hover:bg-surface-soft/30'
                }`}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
                {badge.unlocked ? (
                  <div className="absolute -right-1 -top-0.5 rounded-full bg-success p-0.5 border-2 border-background shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                  </div>
                ) : (
                  <div className="absolute -right-1 -top-0.5 rounded-full bg-surface-soft border-2 border-background p-0.5 shadow-sm">
                    <Lock className="h-2.5 w-2.5 text-muted-foreground/60" aria-hidden="true" />
                  </div>
                )}
              </div>

              <p
                className={`text-[11px] font-bold leading-tight max-w-[90px] ${
                  badge.unlocked ? 'text-foreground' : 'text-muted-foreground/70'
                }`}
              >
                {badge.label}
              </p>
            </div>
          )
        })}
      </div>

      <p className="mt-5 text-center text-[10px] text-muted-foreground/40">
        Próximamente — más desafíos y recompensas en camino
      </p>
    </LiquidGlass>
  )
}

/** Returns the count of unlocked and total achievements for summary usage */
export function getAchievementCounts() {
  const unlocked = PLACEHOLDER_BADGES.filter((b) => b.unlocked).length
  return { unlocked, total: PLACEHOLDER_BADGES.length }
}
