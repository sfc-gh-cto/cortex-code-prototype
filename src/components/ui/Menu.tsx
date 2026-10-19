import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight } from 'lucide-react'

export type MenuEntry =
  | { type: 'sep' }
  | { type: 'header'; label: string }
  | {
      type?: 'item'
      label: string
      icon?: ReactNode
      shortcut?: string
      submenu?: boolean
      onClick?: () => void
      // Optional trailing icon button on the right of the row (e.g. "run with
      // flags"); clicking it runs this instead of the main action.
      secondaryAction?: { icon: ReactNode; onClick: () => void; title?: string }
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
  footer,
}: {
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  onClose: () => void
  items: MenuEntry[]
  width?: number
  align?: 'left' | 'right'
  // Optional custom content rendered below the items (e.g. an inline input). It is
  // not auto-closed on interaction, so it can hold focusable controls.
  footer?: ReactNode
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
        ) : it.type === 'header' ? (
          <div
            key={i}
            className="px-3 pb-1 pt-0.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted"
          >
            {it.label}
          </div>
        ) : it.secondaryAction ? (
          <div key={i} className="group/mi flex w-full items-center hover:bg-accent hover:text-white">
            <button
              onClick={() => {
                it.onClick?.()
                onClose()
              }}
              className="flex flex-1 items-center gap-2.5 py-[3px] pl-3 pr-2 text-left"
            >
              {it.icon && (
                <span className="flex w-4 shrink-0 items-center justify-center text-text-muted group-hover/mi:text-white">
                  {it.icon}
                </span>
              )}
              <span className="flex-1 truncate">{it.label}</span>
            </button>
            <button
              title={it.secondaryAction.title}
              onClick={() => {
                it.secondaryAction?.onClick()
                onClose()
              }}
              className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-muted hover:bg-white/20 group-hover/mi:text-white"
            >
              {it.secondaryAction.icon}
            </button>
          </div>
        ) : (
          <button
            key={i}
            onClick={() => {
              it.onClick?.()
              onClose()
            }}
            className="group/mi flex w-full items-center gap-2.5 px-3 py-[3px] text-left hover:bg-accent hover:text-white"
          >
            {it.icon && (
              <span className="flex w-4 shrink-0 items-center justify-center text-text-muted group-hover/mi:text-white">
                {it.icon}
              </span>
            )}
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
      {footer}
    </div>,
    document.body,
  )
}
