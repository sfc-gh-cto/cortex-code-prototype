import { useCallback } from 'react'

/**
 * A thin draggable divider. Reports incremental movement (delta in px) along
 * the relevant axis so the parent can adjust a panel's width/height.
 *
 * orientation 'x' → vertical divider, drag left/right (col-resize)
 * orientation 'y' → horizontal divider, drag up/down (row-resize)
 */
export function ResizeHandle({
  orientation,
  onResize,
}: {
  orientation: 'x' | 'y'
  onResize: (delta: number) => void
}) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      let last = orientation === 'x' ? e.clientX : e.clientY

      const onMove = (ev: MouseEvent) => {
        const cur = orientation === 'x' ? ev.clientX : ev.clientY
        onResize(cur - last)
        last = cur
      }
      const onUp = () => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
      document.body.style.cursor = orientation === 'x' ? 'col-resize' : 'row-resize'
      document.body.style.userSelect = 'none'
    },
    [orientation, onResize],
  )

  const base =
    'group relative z-30 shrink-0 transition-colors hover:bg-accent active:bg-accent'
  const axis =
    orientation === 'x'
      ? 'w-px cursor-col-resize'
      : 'h-px cursor-row-resize'

  return (
    <div onMouseDown={handleMouseDown} className={`${base} ${axis} bg-border`}>
      {/* widen the hit target without affecting layout */}
      <span
        className={
          orientation === 'x'
            ? 'absolute inset-y-0 -left-1 -right-1'
            : 'absolute inset-x-0 -top-1 -bottom-1'
        }
      />
    </div>
  )
}
