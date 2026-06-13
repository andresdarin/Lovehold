'use client'

import { kindShortLabel, kindTone } from './utils'

export default function MovementKindChip({ kind, compact }: { kind: string; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 font-medium ${kindTone(kind)} ${compact ? 'h-5 text-[11px]' : 'h-6 text-xs'}`}>
      {kindShortLabel(kind)}
    </span>
  )
}
