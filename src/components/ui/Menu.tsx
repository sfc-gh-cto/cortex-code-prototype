import { useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight } from 'lucide-react'

export type MenuEntry =
  | { type: 'sep' }
  | {
      type?: 'item'
      label: string
      shortcut?: string
      submenu?: boolean
      onClick?: () => void
    }

// A dropdown menu rendered in a portal (so it never gets clipped by the panel
// that contains its trigger) and positioned just below the anchor element.
export function PortalMenu({
  anchorRef,
  open,
  onClose,
  items,
  width = 240,
  align = 'right',
}: {
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
  items: MenuEntry[]
  width?: number
  align?: 'left' | 'right'
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    const left = align === 'right' ? r.right - width : r.left
    setPos({ top: r.bottom + 4, left: Math.max(8, Math.min(left, window.innerWidth - width - 8)) })
  }, [open, align, width, anchorRef])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchorRef])

  if (!open || !pos) return null

  return createPortal(
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width }}
      className="z-[1000] overflow-hidden rounded-md border border-[#454545] bg-[#252526] py-1 text-[13px] text-text shadow-2xl"
    >
      {items.map((it, i) =>
        it.type === 'sep' ? (
          <div key={i} className="my-1 border-t border-[#454545]" />
        ) : (
          <button
            key={i}
            onClick={() => {
              it.onClick?.()
              onClose()
            }}
            className="group/mi flex w-full items-center gap-3 px-3 py-[3px] text-left hover:bg-accent hover:text-white"
          >
            <span className="flex-1 truncate">{it.label}</span>
            {it.shortcut && (
              <span className="shrink-0 text-[11px] text-text-muted group-hover/mi:text-white/80">
                {it.shortcut}
              </span>
            )}
            {it.submenu && (
              <ChevronRight size={13} className="shrink-0 text-text-muted group-hover/mi:text-white" />
            )}
          </button>
        ),
      )}
    </div>,
    document.body,
  )
}
