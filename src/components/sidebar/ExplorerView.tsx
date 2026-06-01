import { useState } from 'react'
import { ChevronDown, ChevronRight, FilePlus, FolderPlus, RotateCw, ListCollapse } from 'lucide-react'
import { fileTree, rootFolderName } from '../../data/mockData'
import { FileTree } from './FileTree'

function SectionHeader({
  label,
  open,
  onToggle,
  actions,
}: {
  label: string
  open: boolean
  onToggle: () => void
  actions?: React.ReactNode
}) {
  return (
    <div
      onClick={onToggle}
      className="group flex h-[22px] cursor-pointer items-center gap-1 pl-1 pr-2 text-[11px] font-bold uppercase tracking-wide text-text"
    >
      {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      <span className="truncate">{label}</span>
      {actions && (
        <div className="ml-auto flex items-center gap-1.5 text-text-muted opacity-0 group-hover:opacity-100">
          {actions}
        </div>
      )}
    </div>
  )
}

export function ExplorerView({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (name: string) => void
}) {
  const [rootOpen, setRootOpen] = useState(true)

  return (
    <div className="flex h-full flex-col">
      {/* Panel title row */}
      <div className="flex h-9 items-center justify-between px-4 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        <span>Explorer</span>
        <button className="text-text-muted hover:text-text">···</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <SectionHeader
          label={rootFolderName}
          open={rootOpen}
          onToggle={() => setRootOpen((o) => !o)}
          actions={
            <>
              <FilePlus size={14} className="hover:text-text" />
              <FolderPlus size={14} className="hover:text-text" />
              <RotateCw size={13} className="hover:text-text" />
              <ListCollapse size={14} className="hover:text-text" />
            </>
          }
        />
        {rootOpen && <FileTree nodes={fileTree} selected={selected} onSelect={onSelect} />}
      </div>

      {/* Bottom collapsed sections */}
      <div className="shrink-0 border-t border-border">
        <SectionHeader label="Outline" open={false} onToggle={() => {}} />
        <SectionHeader label="Timeline" open={false} onToggle={() => {}} />
      </div>
    </div>
  )
}
