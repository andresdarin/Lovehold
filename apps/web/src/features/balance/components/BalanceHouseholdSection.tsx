import { Users } from 'lucide-react'

export default function BalanceHouseholdSection() {
  // La API todavía no expone una agregación de ExpenseSplit/Settlement por persona.
  return <section className="neu-raised rounded-3xl bg-surface/60 p-5 sm:p-6"><div className="flex items-center gap-2.5"><Users className="h-4 w-4 text-primary" /><div><h2 className="text-sm font-bold text-foreground">Balance del hogar</h2><p className="text-[11px] text-muted-foreground">Quién pagó más y quién debe compensar</p></div></div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Cuando haya movimientos compartidos, acá vas a ver el saldo entre las personas del hogar.</p></section>
}
