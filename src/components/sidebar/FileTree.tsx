import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { FileNode } from '../../data/mockData'
import { FileIcon } from '../FileIcon'

function TreeRow({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: FileNode
  depth: number
  selected: string
  onSelect: (name: string) => void
}) {
  const [open, setOpen] = useState(!!node.defaultOpen)
  const isFolder = node.type === 'folder'
  const isSelected = selected === node.name
  const indent = 8 + depth * 12

  return (
    <>
      <div
        onClick={() => {
          if (isFolder) setOpen((o) => !o)
          else onSelect(node.name)
        }}
        style={{ paddingLeft: indent }}
        className={`group flex h-[22px] cursor-pointer items-center gap-1 pr-2 text-[13px] ${
          isSelected ? 'bg-active-list text-text-bright' : 'text-text hover:bg-hover-bg'
        }`}
      >
        {isFolder ? (
          open ? (
            <ChevronDown size={14} className="shrink-0 text-text-muted" />
          ) : (
            <ChevronRight size={14} className="shrink-0 text-text-muted" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {isFolder ? (
          <span className="shrink-0 text-[#dcb67a]">
            {open ? <OpenFolderGlyph /> : <FolderGlyph />}
          </span>
        ) : (
          <FileIcon kind={node.kind} />
        )}
        <span className={`truncate ${node.modified ? 'text-modified' : ''}`}>{node.name}</span>
        {node.modified && <span className="ml-auto text-[11px] text-modified">M</span>}
      </div>
      {isFolder && open && node.children?.map((child) => (
        <TreeRow
          key={child.name}
          node={child}
          depth={depth + 1}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

function FolderGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M1.5 4.5a1 1 0 011-1h3.2l1.3 1.3h5.5a1 1 0 011 1v6.2a1 1 0 01-1 1H2.5a1 1 0 01-1-1V4.5z" fill="#c09553" />
    </svg>
  )
}
function OpenFolderGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M1.5 4.5a1 1 0 011-1h3.2l1.3 1.3h5.5a1 1 0 011 1v1H3.6a1 1 0 00-.96.73L1.5 12V4.5z" fill="#c09553" />
      <path d="M3.1 7.5h11.4l-1.5 5a1 1 0 01-.96.73H2.4a1 1 0 01-.96-1.27L2.6 8.2A1 1 0 013.1 7.5z" fill="#dcb67a" />
    </svg>
  )
}

export function FileTree({
  nodes,
  selected,
  onSelect,
}: {
  nodes: FileNode[]
  selected: string
  onSelect: (name: string) => void
}) {
  return (
    <div className="py-0.5">
      {nodes.map((node) => (
        <TreeRow key={node.name} node={node} depth={0} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  )
}
