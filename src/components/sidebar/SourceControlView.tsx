import {
  ChevronDown,
  Check,
  RefreshCw,
  MoreHorizontal,
  GitCommitVertical,
  ExternalLink,
  Undo2,
  Plus,
} from 'lucide-react'
import { sourceControlChanges, commitGraph } from '../../data/mockData'
import { FileIcon } from '../FileIcon'

export function SourceControlView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 items-center justify-between px-4 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        <span>Source Control</span>
        <div className="flex items-center gap-2 text-text-muted">
          <Check size={14} className="hover:text-text" />
          <RefreshCw size={13} className="hover:text-text" />
          <MoreHorizontal size={14} className="hover:text-text" />
        </div>
      </div>

      {/* commit message + button */}
      <div className="px-3 pb-2">
        <input
          placeholder="Message (⌘Enter to commit on 'main')"
          className="w-full rounded border border-border-strong bg-input-bg px-2 py-1.5 text-[13px] text-text outline-none placeholder:text-text-dim focus:border-accent"
        />
        <button className="mt-1.5 flex w-full items-center justify-center gap-2 rounded bg-accent py-1 text-[13px] font-medium text-white hover:bg-accent-hover">
          <Check size={14} />
          <span>Commit</span>
          <span className="ml-auto border-l border-white/25 pl-2">
            <ChevronDown size={14} />
          </span>
        </button>
      </div>

      {/* changes */}
      <div className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-text">
        <ChevronDown size={14} className="text-text-muted" />
        <span>Changes</span>
        <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-input-bg px-1 text-[10px] text-text-muted">
          {sourceControlChanges.length}
        </span>
      </div>
      <div className="px-2 text-[13px]">
        <div className="flex items-center gap-1 pl-3 text-text">
          <ChevronDown size={14} className="text-text-muted" />
          <span className="text-text-muted">tasty_bytes_dbt_demo</span>
        </div>
        {sourceControlChanges.map((c) => (
          <div
            key={c.name}
            className="group flex h-[22px] cursor-pointer items-center gap-1.5 pl-6 hover:bg-hover-bg"
          >
            <FileIcon kind="yaml" />
            <span className="truncate">{c.name}</span>
            <div className="ml-auto flex items-center gap-1.5 text-text-muted opacity-0 group-hover:opacity-100">
              <ExternalLink size={13} className="hover:text-text" />
              <Undo2 size={13} className="hover:text-text" />
              <Plus size={14} className="hover:text-text" />
            </div>
            <span className="ml-1 text-modified">{c.status}</span>
          </div>
        ))}
      </div>

      {/* graph */}
      <div className="mt-1 flex items-center gap-1 border-t border-border px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-text">
        <ChevronDown size={14} className="text-text-muted" />
        <span>Graph</span>
        <div className="ml-auto flex items-center gap-2 text-text-muted">
          <span className="flex items-center gap-1 rounded bg-input-bg px-1.5 py-0.5 text-[10px] font-normal normal-case">
            <RefreshCw size={10} /> Auto
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pl-2 pr-1">
        {/* current branch row */}
        <div className="flex h-[26px] items-center gap-2">
          <GitCommitVertical size={16} className="text-[#3fb950]" />
          <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 text-[11px] text-link">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> main
          </span>
        </div>
        {commitGraph.map((msg, i) => (
          <div key={i} className="flex h-[26px] items-center gap-2 text-[13px]">
            <span className="flex w-4 justify-center">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[#c09553] bg-app-bg" />
            </span>
            <span className="truncate text-text-muted">{msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
