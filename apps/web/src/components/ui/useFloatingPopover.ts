'use client'

import { useEffect, useState, type RefObject } from 'react'

export function useFloatingPopover(
  triggerRef: RefObject<HTMLElement | null>,
  popoverAttr: string,
  width: number,
  estimatedHeight: number,
  open: boolean,
  onClose: () => void,
): React.CSSProperties {
  const [style, setStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!open) {
      setStyle({})
      return
    }

    function position() {
      const el = triggerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const fitsBelow = window.innerHeight - r.bottom >= estimatedHeight + 8
      const top = fitsBelow ? r.bottom + 6 : Math.max(8, r.top - estimatedHeight - 6)
      const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8))
      setStyle({ position: 'fixed', top: `${top}px`, left: `${left}px`, width: `${width}px`, zIndex: 100 })
    }

    position()

    function onDown(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node)) return
      if ((e.target as Element)?.closest(`[${popoverAttr}]`)) return
      onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('scroll', position, true)
    window.addEventListener('resize', position)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', position, true)
      window.removeEventListener('resize', position)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, triggerRef, popoverAttr, width, estimatedHeight, onClose])

  return style
}
