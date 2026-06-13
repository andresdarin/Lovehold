'use client'

import { kindShortLabel, kindTone } from './utils'

export default function MovementKindChip({ kind }: { kind: string }) {
  return (
    <span className={`inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium leading-none ${kindTone(kind)}`}>
      {kindShortLabel(kind)}
    </span>
  )
}
