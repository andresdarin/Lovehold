import { DollarSign, Globe, Palette } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'
import { useTheme } from '@/features/theme/ThemeProvider'

export function PreferencesCard() {
  const { theme } = useTheme()

  const preferences = [
    {
      icon: DollarSign,
      label: 'Moneda',
      value: 'UYU — Peso uruguayo',
    },
    {
      icon: Globe,
      label: 'País / locale',
      value: 'Uruguay (es-UY)',
    },
    {
      icon: Globe,
      label: 'Formato',
      value: '$ 1.234,56',
    },
    {
      icon: Palette,
      label: 'Tema',
      value: theme === 'dark' ? 'Oscuro' : 'Claro',
    },
  ]

  return (
    <LiquidGlass variant="card" intensity="medium" className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Preferencias</h3>
      <div className="space-y-3">
        {preferences.map((pref) => (
          <div
            key={pref.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface-soft/50 p-3"
          >
            <pref.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{pref.label}</p>
              <p className="text-sm font-medium text-foreground">{pref.value}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground/40 text-center">
        La configuración regional se personalizará próximamente
      </p>
    </LiquidGlass>
  )
}
