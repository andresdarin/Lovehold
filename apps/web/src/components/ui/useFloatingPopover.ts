'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

const HIDDEN: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
  zIndex: 100,
}

export function useFloatingPopover(
  triggerRef: RefObject<HTMLElement | null>,
  popoverAttr: string,
  width: number,
  estimatedHeight: number,
  open: boolean,
  onClose: () => void,
): React.CSSProperties {
  const [style, setStyle] = useState<React.CSSProperties>(HIDDEN)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useLayoutEffect(() => {
    if (!open) {
      if (style.visibility !== 'hidden') setStyle(HIDDEN)
      return
    }

    function position() {
      const el = triggerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const fitsBelow = window.innerHeight - r.bottom >= estimatedHeight + 8
      const top = fitsBelow ? r.bottom + 6 : Math.max(8, r.top - estimatedHeight - 6)
      const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8))
      setStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: 100,
        visibility: 'visible',
        pointerEvents: 'auto',
      })
    }

    position()

    function onDown(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node)) return
      if ((e.target as Element)?.closest(`[${popoverAttr}]`)) return
      onCloseRef.current()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current()
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
  }, [open, triggerRef])

  return style
}
