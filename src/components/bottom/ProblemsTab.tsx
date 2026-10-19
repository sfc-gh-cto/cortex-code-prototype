import { ListFilter, Ellipsis, ChevronDown } from 'lucide-react'

export function ProblemsTab() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div className="flex flex-1 items-center gap-1.5 rounded border border-border-strong bg-input-bg px-2 py-0.5">
          <input
            placeholder="Filter (e.g. text, **/*.ts, !**/node_modules/**)"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-text outline-none placeholder:text-text-dim"
          />
          <ChevronDown size={13} className="text-text-muted" />
        </div>
        <ListFilter size={15} className="text-text-muted hover:text-text" />
        <Ellipsis size={15} className="text-text-muted hover:text-text" />
      </div>
      <div className="px-4 py-2 text-[13px] text-text-muted">
        No problems have been detected in the workspace.
      </div>
    </div>
  )
}
