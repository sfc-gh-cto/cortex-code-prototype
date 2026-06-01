import { ChevronDown, Ban, Lock, Ellipsis } from 'lucide-react'

export function OutputTab() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div className="flex flex-1 items-center gap-1.5 rounded border border-border-strong bg-input-bg px-2 py-0.5">
          <input
            placeholder="Filter"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-text outline-none placeholder:text-text-dim"
          />
        </div>
        <button className="flex items-center gap-1.5 rounded border border-border-strong bg-input-bg px-2 py-1 text-[12px] text-text">
          Tasks
          <ChevronDown size={13} className="text-text-muted" />
        </button>
        <Ban size={15} className="text-text-muted hover:text-text" />
        <Lock size={14} className="text-text-muted hover:text-text" />
        <Ellipsis size={15} className="text-text-muted hover:text-text" />
      </div>
      <div className="flex-1 px-3 py-1 font-mono text-[12px] text-text">
        <span className="inline-block h-[15px] w-[7px] animate-pulse bg-text align-middle" />
      </div>
    </div>
  )
}
