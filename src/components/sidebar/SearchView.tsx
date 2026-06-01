import {
  ChevronDown,
  CaseSensitive,
  WholeWord,
  Regex,
  Replace,
  ListFilter,
  RefreshCw,
} from 'lucide-react'

function IconToggle({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:bg-hover-bg hover:text-text">
      {children}
    </button>
  )
}

export function SearchView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 items-center justify-between px-4 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        <span>Search</span>
        <div className="flex items-center gap-2 text-text-muted">
          <RefreshCw size={13} className="hover:text-text" />
          <ListFilter size={14} className="hover:text-text" />
          <span className="hover:text-text">···</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 px-3 pt-1">
        {/* search input */}
        <div className="flex items-start gap-1">
          <button className="mt-1.5 text-text-muted">
            <ChevronDown size={14} />
          </button>
          <div className="flex flex-1 items-center rounded border border-border-strong bg-input-bg focus-within:border-accent">
            <input
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent px-2 py-1 text-[13px] text-text outline-none placeholder:text-text-dim"
            />
            <div className="flex items-center gap-0.5 pr-1">
              <IconToggle><CaseSensitive size={14} /></IconToggle>
              <IconToggle><WholeWord size={14} /></IconToggle>
              <IconToggle><Regex size={14} /></IconToggle>
            </div>
          </div>
        </div>

        {/* replace input */}
        <div className="flex items-center gap-1 pl-[18px]">
          <div className="flex flex-1 items-center rounded border border-border-strong bg-input-bg focus-within:border-accent">
            <input
              placeholder="Replace"
              className="min-w-0 flex-1 bg-transparent px-2 py-1 text-[13px] text-text outline-none placeholder:text-text-dim"
            />
            <div className="flex items-center gap-0.5 pr-1">
              <IconToggle><Replace size={14} /></IconToggle>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 text-center text-[12px] text-text-muted">
        <span>Search for text across all files in your workspace.</span>
      </div>
    </div>
  )
}
