import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

// A VS Code side-bar section: a collapsible header with an optional actions
// cluster (shown on hover) and a body.
export function Section({
  title,
  actions,
  defaultOpen = true,
  children,
}: {
  title: string
  actions?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="flex min-h-0 flex-col">
      <div
        className="group flex h-[22px] shrink-0 cursor-pointer items-center gap-1 pr-2 pl-1 text-[11px] font-semibold tracking-wide text-fg"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="flex-1 truncate uppercase">{title}</span>
        {actions && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
      {open && <div className="min-h-0 overflow-y-auto">{children}</div>}
    </div>
  )
}
