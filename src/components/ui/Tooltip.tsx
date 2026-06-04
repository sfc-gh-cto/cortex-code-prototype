import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

// Lightweight hover tooltip. Rendered in a portal so it is never clipped by
// overflow-hidden ancestors, and positioned just below the trigger.
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!show || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const center = Math.min(Math.max(r.left + r.width / 2, 60), window.innerWidth - 60)
    setPos({ top: r.bottom + 6, left: center })
  }, [show])

  return (
    <span
      ref={ref}
      className="inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show &&
        pos &&
        createPortal(
          <div
            style={{ position: 'fixed', top: pos.top, left: pos.left, transform: 'translateX(-50%)' }}
            className="pointer-events-none z-[2000] whitespace-nowrap rounded border border-[#454545] bg-[#252526] px-1.5 py-0.5 text-[11px] text-text shadow-lg"
          >
            {label}
          </div>,
          document.body,
        )}
    </span>
  )
}
