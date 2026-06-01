import { Search, RotateCw, Trash2, Database, ChevronRight, Pin } from 'lucide-react'
import { catalogDatabases } from '../../data/mockData'

export function CatalogView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 items-center justify-between px-4 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        <span>Snowflake Catalog</span>
        <div className="flex items-center gap-2 text-text-muted">
          <RotateCw size={13} className="hover:text-text" />
          <Trash2 size={13} className="hover:text-text" />
        </div>
      </div>

      <div className="px-2 pb-1">
        <div className="flex items-center gap-1.5 rounded border border-border-strong bg-input-bg px-2 py-1 focus-within:border-accent">
          <Search size={12} className="text-text-muted" />
          <input
            placeholder="Search catalog: database, sche..."
            className="min-w-0 flex-1 bg-transparent text-[12px] text-text outline-none placeholder:text-text-dim"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {catalogDatabases.map((db) => (
          <div
            key={db}
            className="group flex h-[26px] cursor-pointer items-center gap-1 pl-2 pr-2 text-[13px] text-text hover:bg-hover-bg"
          >
            <ChevronRight size={14} className="shrink-0 text-text-muted" />
            <Database size={14} className="shrink-0 text-text-muted" />
            <span className="truncate">{db}</span>
            <Pin size={12} className="ml-auto text-text-muted opacity-0 group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
