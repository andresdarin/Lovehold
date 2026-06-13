'use client'

export default function MovementSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 w-36 rounded-lg bg-surface-soft" />
              <div className="h-3 w-24 rounded-lg bg-surface-soft" />
            </div>
            <div className="h-5 w-20 rounded-lg bg-surface-soft" />
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-5 w-16 rounded-full bg-surface-soft" />
            <div className="h-5 w-14 rounded-full bg-surface-soft" />
          </div>
        </div>
      ))}
    </div>
  )
}
